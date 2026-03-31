import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import type {
  ClientRecord,
  ClientTimelineEvent,
  CreatorClientProfileState,
  CreatorClientsState,
  UpdateClientProfileInput
} from "@museio/types";
import { updateClientProfileInputSchema } from "@museio/validation";
import { SupabaseService } from "../supabase/supabase.service";

interface ClientRow {
  id: string;
  creator_user_id: string;
  display_name: string;
  primary_email: string;
  phone: string | null;
  company_name: string | null;
  status: "lead" | "active" | "vip" | "archived";
  tags: string[] | null;
  notes: string | null;
  last_contacted_at: string | null;
  source_booking_request_id: string | null;
  created_at: string;
  updated_at: string;
}

interface BookingRow {
  id: string;
  creator_user_id: string;
  client_id: string | null;
  event_type: string;
  status: "submitted" | "under-review" | "accepted" | "declined" | "archived";
  submitted_at: string;
}

interface JobRow {
  id: string;
  creator_user_id: string;
  client_id: string;
  title: string;
  event_type: string;
  status: "draft" | "quote-prep" | "quoted" | "confirmed" | "completed" | "cancelled" | "archived";
  created_at: string;
}

interface InvoiceRow {
  id: string;
  creator_user_id: string;
  job_id: string;
  invoice_number: string;
  status: "draft" | "sent" | "viewed" | "deposit-requested" | "deposit-paid" | "balance-due" | "paid" | "declined" | "void";
  total_minor: number;
  amount_due_minor: number;
  issue_at: string | null;
  due_date: string | null;
}

interface PaymentRow {
  id: string;
  creator_user_id: string;
  invoice_id: string;
  job_id: string;
  phase: "full" | "deposit" | "balance";
  status: "pending" | "requires-action" | "processing" | "succeeded" | "failed" | "refunded" | "partially-refunded";
  amount_minor: number;
  paid_at: string | null;
  created_at: string;
}

interface TimelineRow {
  id: string;
  creator_user_id: string;
  client_id: string;
  event_type:
    | "booking-request-submitted"
    | "job-created"
    | "invoice-issued"
    | "payment-recorded"
    | "message-sent"
    | "profile-updated";
  summary: string;
  linked_entity_type: "booking-request" | "job" | "invoice" | "payment" | "thread" | null;
  linked_entity_id: string | null;
  metadata: Record<string, string | number | boolean | null> | null;
  created_at: string;
}

@Injectable()
export class CrmService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getClients(accessToken?: string | null): Promise<CreatorClientsState> {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const [clients, bookings, jobs, invoices, payments] = await Promise.all([
      this.fetchClients(user.id),
      this.fetchBookings(user.id),
      this.fetchJobs(user.id),
      this.fetchInvoices(user.id),
      this.fetchPayments(user.id)
    ]);

    const jobsByClient = this.groupJobsByClient(jobs);
    const invoicesByJob = new Map(invoices.map((invoice) => [invoice.job_id, invoice]));
    const paymentsByJob = this.groupPaymentsByJob(payments);

    return {
      clients: clients
        .map((client) => ({
          client: this.mapClient(client),
          relationship: this.buildRelationshipSummary({
            clientId: client.id,
            bookings,
            jobsByClient,
            invoicesByJob,
            paymentsByJob
          })
        }))
        .sort((left, right) => left.client.displayName.localeCompare(right.client.displayName))
    };
  }

  async getClientProfile(
    clientId: string,
    accessToken?: string | null
  ): Promise<CreatorClientProfileState> {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const client = await this.fetchClient(clientId, user.id);
    const [bookings, jobs, invoices, payments, timelineRows] = await Promise.all([
      this.fetchBookings(user.id),
      this.fetchJobs(user.id),
      this.fetchInvoices(user.id),
      this.fetchPayments(user.id),
      this.fetchTimelineEvents(client.id, user.id)
    ]);

    const jobsForClient = jobs.filter((job) => job.client_id === client.id);
    const jobIds = new Set(jobsForClient.map((job) => job.id));
    const bookingsForClient = bookings.filter((booking) => booking.client_id === client.id);
    const invoicesForClient = invoices.filter((invoice) => jobIds.has(invoice.job_id));
    const invoiceIds = new Set(invoicesForClient.map((invoice) => invoice.id));
    const paymentsForClient = payments.filter(
      (payment) => invoiceIds.has(payment.invoice_id) || jobIds.has(payment.job_id)
    );

    const derivedTimeline = [
      ...bookingsForClient.map((booking) => ({
        id: `booking-${booking.id}`,
        creatorUserId: user.id,
        clientId: client.id,
        type: "booking-request-submitted" as const,
        summary: `Booking request submitted for ${booking.event_type}.`,
        linkedEntityType: "booking-request" as const,
        linkedEntityId: booking.id,
        createdAt: booking.submitted_at
      })),
      ...jobsForClient.map((job) => ({
        id: `job-${job.id}`,
        creatorUserId: user.id,
        clientId: client.id,
        type: "job-created" as const,
        summary: `Job draft created for ${job.event_type}.`,
        linkedEntityType: "job" as const,
        linkedEntityId: job.id,
        createdAt: job.created_at
      })),
      ...invoicesForClient.map((invoice) => ({
        id: `invoice-${invoice.id}`,
        creatorUserId: user.id,
        clientId: client.id,
        type: "invoice-issued" as const,
        summary: `Invoice ${invoice.invoice_number} issued.`,
        linkedEntityType: "invoice" as const,
        linkedEntityId: invoice.id,
        createdAt: invoice.issue_at ?? invoice.due_date ?? new Date().toISOString()
      })),
      ...paymentsForClient.map((payment) => ({
        id: `payment-${payment.id}`,
        creatorUserId: user.id,
        clientId: client.id,
        type: "payment-recorded" as const,
        summary: `Payment recorded for ${payment.phase}.`,
        linkedEntityType: "payment" as const,
        linkedEntityId: payment.id,
        createdAt: payment.paid_at ?? payment.created_at
      })),
      ...timelineRows.map((row) => this.mapTimeline(row))
    ].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );

    return {
      client: this.mapClient(client),
      relationship: this.buildRelationshipSummary({
        clientId: client.id,
        bookings,
        jobsByClient: this.groupJobsByClient(jobs),
        invoicesByJob: new Map(invoices.map((invoice) => [invoice.job_id, invoice])),
        paymentsByJob: this.groupPaymentsByJob(payments)
      }),
      bookings: bookingsForClient.map((booking) => ({
        id: booking.id,
        eventType: booking.event_type,
        status: booking.status,
        submittedAt: booking.submitted_at
      })),
      jobs: jobsForClient.map((job) => ({
        id: job.id,
        title: job.title,
        eventType: job.event_type,
        status: job.status,
        createdAt: job.created_at
      })),
      invoices: invoicesForClient.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        totalMinor: invoice.total_minor,
        amountDueMinor: invoice.amount_due_minor,
        dueDate: invoice.due_date ?? undefined,
        issuedAt: invoice.issue_at ?? undefined
      })),
      payments: paymentsForClient.map((payment) => ({
        id: payment.id,
        invoiceId: payment.invoice_id,
        phase: payment.phase,
        status: payment.status,
        amountMinor: payment.amount_minor,
        paidAt: payment.paid_at ?? undefined,
        createdAt: payment.created_at
      })),
      timeline: derivedTimeline
    };
  }

  async updateClientProfile(
    clientId: string,
    payload: UpdateClientProfileInput,
    accessToken?: string | null
  ): Promise<CreatorClientProfileState> {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const parsed = updateClientProfileInputSchema.parse(payload);
    await this.fetchClient(clientId, user.id);

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("clients")
      .update({
        display_name: parsed.displayName.trim(),
        primary_email: parsed.primaryEmail.trim().toLowerCase(),
        primary_email_normalized: parsed.primaryEmail.trim().toLowerCase(),
        phone: parsed.phone?.trim() || null,
        company_name: parsed.companyName?.trim() || null,
        status: parsed.status,
        tags: parsed.tags,
        notes: parsed.notes?.trim() || ""
      })
      .eq("id", clientId)
      .eq("creator_user_id", user.id);

    if (error) {
      if (error.message.toLowerCase().includes("duplicate key")) {
        throw new ConflictException(
          "A client with that email already exists for this creator."
        );
      }

      throw new InternalServerErrorException(error.message);
    }

    const { error: timelineError } = await this.supabaseService
      .getAdminClient()
      .from("client_timeline_events")
      .insert({
        creator_user_id: user.id,
        client_id: clientId,
        event_type: "profile-updated",
        summary: "Client profile updated.",
        metadata: {
          status: parsed.status,
          tagsCount: parsed.tags.length
        }
      });

    if (timelineError) {
      throw new InternalServerErrorException(timelineError.message);
    }

    return this.getClientProfile(clientId, accessToken);
  }

  private async fetchClients(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("clients")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("display_name", { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as ClientRow[];
  }

  private async fetchClient(clientId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException("The requested client was not found.");
    }

    return data as ClientRow;
  }

  private async fetchBookings(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("booking_requests")
      .select("id, creator_user_id, client_id, event_type, status, submitted_at")
      .eq("creator_user_id", creatorUserId)
      .not("client_id", "is", null);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as BookingRow[];
  }

  private async fetchJobs(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("jobs")
      .select("id, creator_user_id, client_id, title, event_type, status, created_at")
      .eq("creator_user_id", creatorUserId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as JobRow[];
  }

  private async fetchInvoices(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .select("id, creator_user_id, job_id, invoice_number, status, total_minor, amount_due_minor, issue_at, due_date")
      .eq("creator_user_id", creatorUserId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as InvoiceRow[];
  }

  private async fetchPayments(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("payment_records")
      .select("id, creator_user_id, invoice_id, job_id, phase, status, amount_minor, paid_at, created_at")
      .eq("creator_user_id", creatorUserId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as PaymentRow[];
  }

  private async fetchTimelineEvents(clientId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("client_timeline_events")
      .select("*")
      .eq("client_id", clientId)
      .eq("creator_user_id", creatorUserId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as TimelineRow[];
  }

  private groupJobsByClient(jobs: JobRow[]) {
    const map = new Map<string, JobRow[]>();

    for (const job of jobs) {
      const current = map.get(job.client_id) ?? [];
      current.push(job);
      map.set(job.client_id, current);
    }

    return map;
  }

  private groupPaymentsByJob(payments: PaymentRow[]) {
    const map = new Map<string, PaymentRow[]>();

    for (const payment of payments) {
      const current = map.get(payment.job_id) ?? [];
      current.push(payment);
      map.set(payment.job_id, current);
    }

    return map;
  }

  private buildRelationshipSummary(params: {
    clientId: string;
    bookings: BookingRow[];
    jobsByClient: Map<string, JobRow[]>;
    invoicesByJob: Map<string, InvoiceRow>;
    paymentsByJob: Map<string, PaymentRow[]>;
  }) {
    const jobs = params.jobsByClient.get(params.clientId) ?? [];
    const bookings = params.bookings.filter((booking) => booking.client_id === params.clientId);
    const invoices = jobs
      .map((job) => params.invoicesByJob.get(job.id))
      .filter((invoice): invoice is InvoiceRow => Boolean(invoice));
    const payments = jobs.flatMap((job) => params.paymentsByJob.get(job.id) ?? []);

    return {
      bookingRequestCount: bookings.length,
      jobCount: jobs.length,
      invoiceCount: invoices.length,
      paymentCount: payments.length,
      openInvoiceCount: invoices.filter((invoice) => invoice.amount_due_minor > 0).length,
      collectedMinor: payments
        .filter((payment) => payment.status === "succeeded")
        .reduce((sum, payment) => sum + payment.amount_minor, 0),
      outstandingMinor: invoices.reduce(
        (sum, invoice) => sum + invoice.amount_due_minor,
        0
      )
    };
  }

  private mapClient(row: ClientRow): ClientRecord {
    return {
      id: row.id,
      creatorUserId: row.creator_user_id,
      displayName: row.display_name,
      primaryEmail: row.primary_email,
      phone: row.phone ?? undefined,
      companyName: row.company_name ?? undefined,
      status: row.status,
      tags: row.tags ?? [],
      notes: row.notes ?? undefined,
      lastContactedAt: row.last_contacted_at ?? undefined,
      sourceBookingRequestId: row.source_booking_request_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapTimeline(row: TimelineRow): ClientTimelineEvent {
    return {
      id: row.id,
      creatorUserId: row.creator_user_id,
      clientId: row.client_id,
      type: row.event_type,
      summary: row.summary,
      linkedEntityType: row.linked_entity_type ?? undefined,
      linkedEntityId: row.linked_entity_id ?? undefined,
      metadata: row.metadata ?? undefined,
      createdAt: row.created_at
    };
  }
}
