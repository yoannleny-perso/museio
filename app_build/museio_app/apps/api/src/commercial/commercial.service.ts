import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { createHmac, createHash, randomUUID } from "node:crypto";
import {
  computeCommercialLineItemTotals,
  computeCommercialTotals,
  computeDepositAmountMinor,
  computeInvoiceMoneyState,
  deriveInvoiceStatus,
  getInvoicePaymentPhases
} from "@museio/domain";
import type {
  ClientRecord,
  CommercialLineItem,
  CreateInvoiceDraftInput,
  CreateInvoicePaymentSessionInput,
  CreateQuoteDraftInput,
  CreatorCommercialJobsState,
  CreatorCommercialJobState,
  InvoiceRecord,
  InvoiceStatus,
  JobDraftRecord,
  PaymentRecord,
  PublicInvoiceState,
  PublicQuoteState,
  QuoteRecord,
  RespondToQuoteInput,
  SaveInvoiceDraftInput,
  SaveQuoteDraftInput,
  SendInvoiceInput,
  SendQuoteInput,
  StripeConnectedAccountState,
  UpdateStripeConnectedAccountInput
} from "@museio/types";
import {
  createInvoiceDraftInputSchema,
  createInvoicePaymentSessionInputSchema,
  createQuoteDraftInputSchema,
  respondToQuoteInputSchema,
  saveInvoiceDraftInputSchema,
  saveQuoteDraftInputSchema,
  sendInvoiceInputSchema,
  sendQuoteInputSchema,
  updateStripeConnectedAccountInputSchema
} from "@museio/validation";
import Stripe from "stripe";
import { apiEnv } from "../config/env";
import { SupabaseService } from "../supabase/supabase.service";

interface JobRow {
  id: string;
  creator_user_id: string;
  client_id: string;
  source_booking_request_id: string;
  portfolio_id: string;
  title: string;
  event_type: string;
  status: JobDraftRecord["status"];
  requester_name_snapshot: string;
  requester_email_snapshot: string;
  event_notes: string;
  service_package_notes: string;
  created_at: string;
  updated_at: string;
}

interface JobSlotRow {
  id: string;
  job_id: string;
  creator_user_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
}

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

interface QuoteRow {
  id: string;
  creator_user_id: string;
  job_id: string;
  status: QuoteRecord["status"];
  title: string;
  message: string;
  currency_code: string;
  subtotal_minor: number;
  tax_minor: number;
  total_minor: number;
  public_token_hash: string | null;
  public_token_expires_at: string | null;
  sent_at: string | null;
  responded_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  created_at: string;
  updated_at: string;
}

interface InvoiceRow {
  id: string;
  creator_user_id: string;
  job_id: string;
  quote_id: string | null;
  invoice_number: string;
  title: string;
  message: string;
  status: InvoiceStatus;
  currency_code: string;
  subtotal_minor: number;
  tax_minor: number;
  total_minor: number;
  amount_paid_minor: number;
  amount_due_minor: number;
  payment_terms_days: number;
  due_date: string | null;
  issue_at: string | null;
  sent_at: string | null;
  collection_mode: InvoiceRecord["collectionMode"];
  deposit_type: "fixed" | "percentage" | null;
  deposit_value: string | null;
  deposit_amount_minor: number;
  balance_amount_minor: number;
  public_token_hash: string | null;
  public_token_expires_at: string | null;
  attachments: Array<{ id: string; label: string; filename: string }>;
  created_at: string;
  updated_at: string;
}

interface LineItemRow {
  id: string;
  label: string;
  description: string;
  quantity: string | number;
  unit_amount_minor: number;
  tax_rate_basis_points: number;
  sort_order: number;
  line_subtotal_minor: number;
  line_tax_minor: number;
  line_total_minor: number;
}

interface PaymentRow {
  id: string;
  creator_user_id: string;
  invoice_id: string;
  job_id: string;
  phase: "full" | "deposit" | "balance";
  amount_minor: number;
  currency_code: string;
  status: PaymentRecord["status"];
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_event_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

interface StripeAccountRow {
  creator_user_id: string;
  stripe_account_id: string | null;
  status: StripeConnectedAccountState["status"];
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  dashboard_url: string | null;
  updated_at: string;
}

interface PortfolioOwnerRow {
  owner_user_id: string;
  artist_name: string;
}

const DEFAULT_CURRENCY = "AUD";
const DEFAULT_PAYMENT_TERMS_DAYS = 7;

@Injectable()
export class CommercialService {
  private readonly stripe = new Stripe(apiEnv.STRIPE_SECRET_KEY);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getCreatorJobs(accessToken?: string | null) {
    const user = await this.requireUser(accessToken);
    const jobs = await this.fetchJobsByCreator(user.id);
    const quotes = await this.fetchQuotesByJobIds(jobs.map((job) => job.id), user.id);
    const invoices = await this.fetchInvoicesByJobIds(jobs.map((job) => job.id), user.id);
    const stripe = await this.getStripeReadiness(accessToken);

    return {
      jobs: jobs.map((job) => ({
        job,
        quote: quotes.get(job.id),
        invoice: invoices.get(job.id)
      })),
      stripe
    } satisfies CreatorCommercialJobsState;
  }

  async getCreatorJobState(jobId: string, accessToken?: string | null) {
    const user = await this.requireUser(accessToken);
    const job = await this.fetchJobById(jobId, user.id);
    const [quote, invoice, payments, stripe] = await Promise.all([
      this.fetchQuoteByJobId(jobId, user.id),
      this.fetchInvoiceByJobId(jobId, user.id),
      this.fetchPaymentsByJobId(jobId, user.id),
      this.getStripeReadiness(accessToken)
    ]);

    return {
      job,
      quote: quote ?? undefined,
      invoice: invoice ?? undefined,
      payments,
      stripe
    } satisfies CreatorCommercialJobState;
  }

  async getStripeReadiness(accessToken?: string | null) {
    const user = await this.requireUser(accessToken);
    const stored = await this.fetchStripeAccountState(user.id);

    if (!stored?.accountId) {
      return {
        creatorUserId: user.id,
        status: "not-connected",
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false
      } satisfies StripeConnectedAccountState;
    }

    const synced = await this.syncStripeAccountState(user.id, stored.accountId);
    return synced;
  }

  async updateStripeConnectedAccount(
    payload: UpdateStripeConnectedAccountInput,
    accessToken?: string | null
  ) {
    const user = await this.requireUser(accessToken);
    const parsed = updateStripeConnectedAccountInputSchema.parse(payload);
    return this.syncStripeAccountState(user.id, parsed.accountId);
  }

  async createQuoteDraft(
    jobId: string,
    payload: CreateQuoteDraftInput,
    accessToken?: string | null
  ) {
    const user = await this.requireUser(accessToken);
    const parsed = createQuoteDraftInputSchema.parse(payload);
    const job = await this.fetchJobById(jobId, user.id);
    const existing = await this.fetchQuoteRowByJobId(jobId, user.id);

    if (existing) {
      throw new ConflictException("This job already has a quote draft.");
    }

    const title = parsed.title?.trim() || `${job.eventType} Quote`;
    const message =
      parsed.message?.trim() ||
      `Quote for ${job.eventType.toLowerCase()} with ${job.requesterSnapshot.clientName}.`;
    const lineItems = [
      computeCommercialLineItemTotals({
        id: randomUUID(),
        label: job.eventType,
        description: job.servicePackageNotes || "Performance and preparation",
        quantity: 1,
        unitAmountMinor: 0,
        taxRateBasisPoints: 0,
        sortOrder: 0
      })
    ];
    const totals = computeCommercialTotals(DEFAULT_CURRENCY, lineItems);

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("quote_drafts")
      .insert({
        creator_user_id: user.id,
        job_id: job.id,
        status: "draft",
        title,
        message,
        currency_code: DEFAULT_CURRENCY,
        subtotal_minor: totals.subtotalMinor,
        tax_minor: totals.taxMinor,
        total_minor: totals.totalMinor
      })
      .select("*")
      .single();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    const quoteRow = data as QuoteRow;
    await this.replaceQuoteLineItems(quoteRow.id, user.id, lineItems);
    await this.updateJobStatus(job.id, user.id, "quote-prep");

    return this.getCreatorJobState(job.id, accessToken);
  }

  async saveQuoteDraft(
    quoteId: string,
    payload: SaveQuoteDraftInput,
    accessToken?: string | null
  ) {
    const user = await this.requireUser(accessToken);
    const parsed = saveQuoteDraftInputSchema.parse(payload);
    const quoteRow = await this.fetchQuoteRowById(quoteId, user.id);

    if (quoteRow.status === "sent" || quoteRow.status === "accepted" || quoteRow.status === "declined") {
      throw new ConflictException("Only unsent quotes can be edited.");
    }

    const lineItems = parsed.lineItems.map((item, index) =>
      computeCommercialLineItemTotals({
        id: item.id ?? randomUUID(),
        label: item.label,
        description: item.description,
        quantity: item.quantity,
        unitAmountMinor: item.unitAmountMinor,
        taxRateBasisPoints: item.taxRateBasisPoints ?? 0,
        sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index
      })
    );
    const totals = computeCommercialTotals(parsed.currencyCode, lineItems);

    const nextStatus = lineItems.some((item) => item.lineTotalMinor > 0)
      ? "ready-to-send"
      : "draft";

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("quote_drafts")
      .update({
        title: parsed.title.trim(),
        message: parsed.message,
        currency_code: parsed.currencyCode.toUpperCase(),
        subtotal_minor: totals.subtotalMinor,
        tax_minor: totals.taxMinor,
        total_minor: totals.totalMinor,
        status: nextStatus
      })
      .eq("id", quoteId)
      .eq("creator_user_id", user.id);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    await this.replaceQuoteLineItems(quoteId, user.id, lineItems);

    return this.getCreatorJobState(quoteRow.job_id, accessToken);
  }

  async sendQuote(
    quoteId: string,
    payload: SendQuoteInput,
    accessToken?: string | null
  ) {
    const user = await this.requireUser(accessToken);
    const parsed = sendQuoteInputSchema.parse(payload);
    const quoteRow = await this.fetchQuoteRowById(quoteId, user.id);

    if (!["draft", "ready-to-send"].includes(quoteRow.status)) {
      throw new ConflictException("Only draft quotes can be sent.");
    }

    if (quoteRow.total_minor <= 0) {
      throw new ConflictException("A quote must have a positive total before it can be sent.");
    }

    const token = this.generatePublicToken();
    const { error } = await this.supabaseService
      .getAdminClient()
      .from("quote_drafts")
      .update({
        status: "sent",
        public_token_hash: this.hashPublicToken(token),
        public_token_expires_at: this.getExpiryIso(parsed.expiresInDays ?? 14),
        sent_at: new Date().toISOString()
      })
      .eq("id", quoteId)
      .eq("creator_user_id", user.id);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    await this.updateJobStatus(quoteRow.job_id, user.id, "quoted");

    return {
      state: await this.getCreatorJobState(quoteRow.job_id, accessToken),
      publicUrl: `${this.getAppUrl()}/quote/${token}`
    };
  }

  async getPublicQuote(token: string) {
    const quoteRow = await this.fetchQuoteByPublicToken(token);
    const [quote, job, client, artistName] = await Promise.all([
      this.mapQuote(quoteRow),
      this.fetchJobById(quoteRow.job_id, quoteRow.creator_user_id),
      this.fetchClientByJobId(quoteRow.job_id, quoteRow.creator_user_id),
      this.fetchArtistNameForCreator(quoteRow.creator_user_id)
    ]);

    return {
      quote,
      tokenValid: true,
      canRespond: quote.status === "sent",
      artistName,
      clientName: client.displayName || job.requesterSnapshot.clientName
    } satisfies PublicQuoteState;
  }

  async respondToQuote(token: string, payload: RespondToQuoteInput) {
    const parsed = respondToQuoteInputSchema.parse(payload);
    const quoteRow = await this.fetchQuoteByPublicToken(token);

    if (quoteRow.status !== "sent") {
      throw new ConflictException("This quote is no longer awaiting a response.");
    }

    const nextStatus = parsed.action === "accept" ? "accepted" : "declined";
    const now = new Date().toISOString();
    const { error } = await this.supabaseService
      .getAdminClient()
      .from("quote_drafts")
      .update({
        status: nextStatus,
        responded_at: now,
        accepted_at: parsed.action === "accept" ? now : null,
        declined_at: parsed.action === "decline" ? now : null
      })
      .eq("id", quoteRow.id);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (parsed.action === "accept") {
      await this.updateJobStatus(quoteRow.job_id, quoteRow.creator_user_id, "confirmed");
    }

    return this.getPublicQuote(token);
  }

  async createInvoiceDraft(
    jobId: string,
    payload: CreateInvoiceDraftInput,
    accessToken?: string | null
  ) {
    const user = await this.requireUser(accessToken);
    const parsed = createInvoiceDraftInputSchema.parse(payload);
    const job = await this.fetchJobById(jobId, user.id);
    const existing = await this.fetchInvoiceRowByJobId(jobId, user.id);

    if (existing) {
      throw new ConflictException("This job already has an invoice draft.");
    }

    const acceptedQuote = parsed.deriveFromAcceptedQuote
      ? await this.fetchAcceptedQuoteByJobId(jobId, user.id)
      : undefined;
    const seedQuote = acceptedQuote ?? (await this.fetchQuoteByJobId(jobId, user.id));
    const lineItems =
      seedQuote?.lineItems && seedQuote.lineItems.length > 0
        ? seedQuote.lineItems
        : [
            computeCommercialLineItemTotals({
              id: randomUUID(),
              label: job.eventType,
              description: job.servicePackageNotes || "Performance and delivery",
              quantity: 1,
              unitAmountMinor: 0,
              taxRateBasisPoints: 0,
              sortOrder: 0
            })
          ];
    const totals = computeCommercialTotals(
      seedQuote?.currencyCode ?? DEFAULT_CURRENCY,
      lineItems
    );
    const money = computeInvoiceMoneyState({
      totalMinor: totals.totalMinor,
      amountPaidMinor: 0,
      collectionMode: "full-payment",
      depositAmountMinor: 0
    });

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .insert({
        creator_user_id: user.id,
        job_id: job.id,
        quote_id: acceptedQuote?.id ?? null,
        invoice_number: await this.generateInvoiceNumber(user.id),
        title: parsed.title?.trim() || `${job.eventType} Invoice`,
        message:
          parsed.message?.trim() ||
          `Invoice for ${job.eventType.toLowerCase()} for ${job.requesterSnapshot.clientName}.`,
        status: "draft",
        currency_code: seedQuote?.currencyCode ?? DEFAULT_CURRENCY,
        subtotal_minor: totals.subtotalMinor,
        tax_minor: totals.taxMinor,
        total_minor: totals.totalMinor,
        amount_paid_minor: money.amountPaidMinor,
        amount_due_minor: money.amountDueMinor,
        payment_terms_days: DEFAULT_PAYMENT_TERMS_DAYS,
        collection_mode: "full-payment",
        deposit_amount_minor: money.depositAmountMinor,
        balance_amount_minor: money.balanceAmountMinor
      })
      .select("*")
      .single();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    await this.replaceInvoiceLineItems((data as InvoiceRow).id, user.id, lineItems);
    return this.getCreatorJobState(job.id, accessToken);
  }

  async saveInvoiceDraft(
    invoiceId: string,
    payload: SaveInvoiceDraftInput,
    accessToken?: string | null
  ) {
    const user = await this.requireUser(accessToken);
    const parsed = saveInvoiceDraftInputSchema.parse(payload);
    const invoiceRow = await this.fetchInvoiceRowById(invoiceId, user.id);

    if (invoiceRow.status !== "draft") {
      throw new ConflictException("Only draft invoices can be edited.");
    }

    const lineItems = parsed.lineItems.map((item, index) =>
      computeCommercialLineItemTotals({
        id: item.id ?? randomUUID(),
        label: item.label,
        description: item.description,
        quantity: item.quantity,
        unitAmountMinor: item.unitAmountMinor,
        taxRateBasisPoints: item.taxRateBasisPoints ?? 0,
        sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index
      })
    );
    const totals = computeCommercialTotals(parsed.currencyCode, lineItems);
    const depositAmountMinor = computeDepositAmountMinor({
      collectionMode: parsed.collectionMode,
      depositConfig: parsed.depositConfig,
      totalMinor: totals.totalMinor
    });
    const money = computeInvoiceMoneyState({
      totalMinor: totals.totalMinor,
      amountPaidMinor: invoiceRow.amount_paid_minor,
      collectionMode: parsed.collectionMode,
      depositAmountMinor
    });

    const dueDate =
      parsed.dueDate ??
      new Date(Date.now() + parsed.paymentTermsDays * 86400000).toISOString();

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .update({
        title: parsed.title.trim(),
        message: parsed.message,
        currency_code: parsed.currencyCode.toUpperCase(),
        payment_terms_days: parsed.paymentTermsDays,
        due_date: dueDate,
        collection_mode: parsed.collectionMode,
        deposit_type: parsed.depositConfig?.type ?? null,
        deposit_value:
          typeof parsed.depositConfig?.value === "number"
            ? parsed.depositConfig.value.toString()
            : null,
        subtotal_minor: totals.subtotalMinor,
        tax_minor: totals.taxMinor,
        total_minor: totals.totalMinor,
        amount_due_minor: money.amountDueMinor,
        deposit_amount_minor: money.depositAmountMinor,
        balance_amount_minor: money.balanceAmountMinor
      })
      .eq("id", invoiceId)
      .eq("creator_user_id", user.id);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    await this.replaceInvoiceLineItems(invoiceId, user.id, lineItems);
    return this.getCreatorJobState(invoiceRow.job_id, accessToken);
  }

  async sendInvoice(
    invoiceId: string,
    payload: SendInvoiceInput,
    accessToken?: string | null
  ) {
    const user = await this.requireUser(accessToken);
    const parsed = sendInvoiceInputSchema.parse(payload);
    const invoiceRow = await this.fetchInvoiceRowById(invoiceId, user.id);

    if (invoiceRow.status !== "draft") {
      throw new ConflictException("Only draft invoices can be sent.");
    }

    if (invoiceRow.total_minor <= 0) {
      throw new ConflictException("An invoice must have a positive total before it can be sent.");
    }

    const token = this.generatePublicToken();
    const status =
      invoiceRow.collection_mode === "deposit-and-balance"
        ? "deposit-requested"
        : "sent";

    const now = new Date().toISOString();
    const { error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .update({
        status,
        issue_at: now,
        sent_at: now,
        public_token_hash: this.hashPublicToken(token),
        public_token_expires_at: this.getExpiryIso(parsed.expiresInDays ?? 14)
      })
      .eq("id", invoiceId)
      .eq("creator_user_id", user.id);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return {
      state: await this.getCreatorJobState(invoiceRow.job_id, accessToken),
      publicUrl: `${this.getAppUrl()}/invoice/${token}`
    };
  }

  async getPublicInvoice(token: string) {
    const invoiceRow = await this.fetchInvoiceByPublicToken(token);
    const [invoice, job, client, artistName] = await Promise.all([
      this.mapInvoice(invoiceRow),
      this.fetchJobById(invoiceRow.job_id, invoiceRow.creator_user_id),
      this.fetchClientByJobId(invoiceRow.job_id, invoiceRow.creator_user_id),
      this.fetchArtistNameForCreator(invoiceRow.creator_user_id)
    ]);

    return {
      invoice,
      tokenValid: true,
      canPay: getInvoicePaymentPhases({
        status: invoice.status,
        collectionMode: invoice.collectionMode,
        amountPaidMinor: invoice.totals.amountPaidMinor,
        totalMinor: invoice.totals.totalMinor,
        depositAmountMinor: invoice.totals.depositAmountMinor
      }).length > 0,
      availablePaymentPhases: getInvoicePaymentPhases({
        status: invoice.status,
        collectionMode: invoice.collectionMode,
        amountPaidMinor: invoice.totals.amountPaidMinor,
        totalMinor: invoice.totals.totalMinor,
        depositAmountMinor: invoice.totals.depositAmountMinor
      }),
      artistName,
      clientName: client.displayName || job.requesterSnapshot.clientName
    } satisfies PublicInvoiceState;
  }

  async createPublicInvoicePaymentSession(
    token: string,
    payload: CreateInvoicePaymentSessionInput
  ) {
    const parsed = createInvoicePaymentSessionInputSchema.parse(payload);
    const invoiceRow = await this.fetchInvoiceByPublicToken(token);
    const invoice = await this.mapInvoice(invoiceRow);
    const allowedPhases = getInvoicePaymentPhases({
      status: invoice.status,
      collectionMode: invoice.collectionMode,
      amountPaidMinor: invoice.totals.amountPaidMinor,
      totalMinor: invoice.totals.totalMinor,
      depositAmountMinor: invoice.totals.depositAmountMinor
    });

    if (!allowedPhases.includes(parsed.phase)) {
      throw new ConflictException("This invoice cannot accept that payment phase right now.");
    }

    const stripeState = await this.fetchStripeAccountState(invoice.creatorUserId);

    if (!stripeState?.accountId) {
      throw new ForbiddenException("The creator is not ready to accept payments yet.");
    }

    const amountMinor = this.getPaymentAmountMinor(invoice, parsed.phase);
    const payment = await this.createPaymentRecord({
      creatorUserId: invoice.creatorUserId,
      invoiceId: invoice.id,
      jobId: invoice.jobId,
      phase: parsed.phase,
      amountMinor,
      currencyCode: invoice.currencyCode
    });

    const checkout = await this.createStripeCheckoutSession({
      stripeAccountId: stripeState.accountId,
      invoice,
      payment,
      publicToken: token
    });

    if (parsed.phase === "balance" && invoice.status === "deposit-paid") {
      await this.updateInvoiceStatus(invoice.id, invoice.creatorUserId, "balance-due");
    }

    return {
      invoice: await this.mapInvoice(await this.fetchInvoiceRowById(invoice.id, invoice.creatorUserId)),
      payment: checkout.payment,
      checkoutUrl: checkout.checkoutUrl
    };
  }

  async handleStripeWebhook(rawBody: string, signature: string) {
    if (!rawBody || !signature) {
      throw new UnauthorizedException("A Stripe signature and raw body are required.");
    }

    const event = this.constructStripeEvent(rawBody, signature);
    const eventId = typeof event.id === "string" ? event.id : `mock-${randomUUID()}`;

    const { data: existing } = await this.supabaseService
      .getAdminClient()
      .from("stripe_webhook_events")
      .select("id")
      .eq("stripe_event_id", eventId)
      .maybeSingle();

    if (existing) {
      return { received: true, duplicate: true };
    }

    if (event.type === "checkout.session.completed") {
      await this.handleCheckoutCompleted(event as Stripe.Event);
    }

    if (event.type === "payment_intent.payment_failed") {
      await this.handlePaymentIntentFailed(event as Stripe.Event);
    }

    await this.supabaseService.getAdminClient().from("stripe_webhook_events").insert({
      stripe_event_id: eventId,
      event_type: event.type,
      creator_user_id: this.getCreatorIdFromStripeObject(event.data.object),
      payload: event as unknown as Record<string, unknown>
    });

    return { received: true };
  }

  private async requireUser(accessToken?: string | null) {
    return this.supabaseService.verifyAccessToken(accessToken);
  }

  private isStripeMockMode() {
    return apiEnv.STRIPE_SECRET_KEY.includes("placeholder");
  }

  private async syncStripeAccountState(creatorUserId: string, accountId: string) {
    const state = this.isStripeMockMode()
      ? this.buildMockStripeState(creatorUserId, accountId)
      : await this.fetchLiveStripeState(creatorUserId, accountId);

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("stripe_connected_accounts")
      .upsert({
        creator_user_id: creatorUserId,
        stripe_account_id: state.accountId ?? null,
        status: state.status,
        charges_enabled: state.chargesEnabled,
        payouts_enabled: state.payoutsEnabled,
        details_submitted: state.detailsSubmitted,
        dashboard_url: state.dashboardUrl ?? null
      });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return state;
  }

  private buildMockStripeState(creatorUserId: string, accountId: string) {
    const ready = accountId.startsWith("acct_ready");

    return {
      creatorUserId,
      accountId,
      status: ready ? "ready" : "requires-onboarding",
      chargesEnabled: ready,
      payoutsEnabled: ready,
      detailsSubmitted: ready,
      dashboardUrl: `https://dashboard.stripe.com/test/connect/accounts/${accountId}`,
      updatedAt: new Date().toISOString()
    } satisfies StripeConnectedAccountState;
  }

  private async fetchLiveStripeState(creatorUserId: string, accountId: string) {
    const account = await this.stripe.accounts.retrieve(accountId);
    const liveMode =
      typeof (account as { livemode?: boolean }).livemode === "boolean"
        ? Boolean((account as { livemode?: boolean }).livemode)
        : false;

    return {
      creatorUserId,
      accountId,
      status:
        account.charges_enabled && account.payouts_enabled
          ? "ready"
          : "requires-onboarding",
      chargesEnabled: Boolean(account.charges_enabled),
      payoutsEnabled: Boolean(account.payouts_enabled),
      detailsSubmitted: Boolean(account.details_submitted),
      dashboardUrl: `https://dashboard.stripe.com/${liveMode ? "" : "test/"}connect/accounts/${accountId}`,
      updatedAt: new Date().toISOString()
    } satisfies StripeConnectedAccountState;
  }

  private async fetchStripeAccountState(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("stripe_connected_accounts")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      return undefined;
    }

    return this.mapStripeAccount(data as StripeAccountRow);
  }

  private async fetchJobsByCreator(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("jobs")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("created_at", { ascending: false });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    const rows = (data ?? []) as JobRow[];
    const slotsByJobId = await this.fetchJobSlots(rows.map((row) => row.id), creatorUserId);

    return rows.map((row) => this.mapJob(row, slotsByJobId.get(row.id) ?? []));
  }

  private async fetchJobById(jobId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      throw new NotFoundException("Job not found.");
    }

    const slotsByJobId = await this.fetchJobSlots([jobId], creatorUserId);
    return this.mapJob(data as JobRow, slotsByJobId.get(jobId) ?? []);
  }

  private async fetchJobSlots(jobIds: string[], creatorUserId: string) {
    const map = new Map<string, JobDraftRecord["requestedSlots"]>();

    if (jobIds.length === 0) {
      return map;
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("job_requested_slots")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .in("job_id", jobIds)
      .order("starts_at", { ascending: true });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    for (const row of (data ?? []) as JobSlotRow[]) {
      const current = map.get(row.job_id) ?? [];
      current.push({
        id: row.id,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        timezone: row.timezone
      });
      map.set(row.job_id, current);
    }

    return map;
  }

  private async updateJobStatus(jobId: string, creatorUserId: string, status: JobDraftRecord["status"]) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from("jobs")
      .update({ status })
      .eq("id", jobId)
      .eq("creator_user_id", creatorUserId);

    if (error) {
      this.throwPersistenceError(error.message);
    }
  }

  private async fetchClientByJobId(jobId: string, creatorUserId: string) {
    const { data: jobData, error: jobError } = await this.supabaseService
      .getAdminClient()
      .from("jobs")
      .select("client_id")
      .eq("id", jobId)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (jobError) {
      this.throwPersistenceError(jobError.message);
    }

    if (!jobData?.client_id) {
      throw new NotFoundException("Client not found.");
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("clients")
      .select("*")
      .eq("id", jobData.client_id)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      throw new NotFoundException("Client not found.");
    }

    return this.mapClient(data as ClientRow);
  }

  private async fetchArtistNameForCreator(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .select("owner_user_id, artist_name")
      .eq("owner_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return (data as PortfolioOwnerRow | null)?.artist_name ?? "Museio Creator";
  }

  private async fetchQuoteRowByJobId(jobId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("quote_drafts")
      .select("*")
      .eq("job_id", jobId)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return (data as QuoteRow | null) ?? undefined;
  }

  private async fetchQuoteByJobId(jobId: string, creatorUserId: string) {
    const row = await this.fetchQuoteRowByJobId(jobId, creatorUserId);
    return row ? this.mapQuote(row) : undefined;
  }

  private async fetchAcceptedQuoteByJobId(jobId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("quote_drafts")
      .select("*")
      .eq("job_id", jobId)
      .eq("creator_user_id", creatorUserId)
      .eq("status", "accepted")
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return data ? this.mapQuote(data as QuoteRow) : undefined;
  }

  private async fetchQuoteRowById(quoteId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("quote_drafts")
      .select("*")
      .eq("id", quoteId)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      throw new NotFoundException("Quote not found.");
    }

    return data as QuoteRow;
  }

  private async fetchQuotesByJobIds(jobIds: string[], creatorUserId: string) {
    const map = new Map<string, QuoteRecord>();

    if (jobIds.length === 0) {
      return map;
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("quote_drafts")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .in("job_id", jobIds);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    for (const row of (data ?? []) as QuoteRow[]) {
      map.set(row.job_id, await this.mapQuote(row));
    }

    return map;
  }

  private async fetchQuoteLineItems(quoteId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("quote_line_items")
      .select("*")
      .eq("quote_draft_id", quoteId)
      .eq("creator_user_id", creatorUserId)
      .order("sort_order", { ascending: true });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return (data ?? []).map((row) => this.mapCommercialLineItem(row as LineItemRow));
  }

  private async replaceQuoteLineItems(
    quoteId: string,
    creatorUserId: string,
    lineItems: CommercialLineItem[]
  ) {
    const admin = this.supabaseService.getAdminClient();
    const { error: deleteError } = await admin
      .from("quote_line_items")
      .delete()
      .eq("quote_draft_id", quoteId)
      .eq("creator_user_id", creatorUserId);

    if (deleteError) {
      this.throwPersistenceError(deleteError.message);
    }

    const { error } = await admin.from("quote_line_items").insert(
      lineItems.map((item) => ({
        id: item.id,
        quote_draft_id: quoteId,
        creator_user_id: creatorUserId,
        label: item.label,
        description: item.description,
        quantity: item.quantity,
        unit_amount_minor: item.unitAmountMinor,
        tax_rate_basis_points: item.taxRateBasisPoints,
        line_subtotal_minor: item.lineSubtotalMinor,
        line_tax_minor: item.lineTaxMinor,
        line_total_minor: item.lineTotalMinor,
        sort_order: item.sortOrder
      }))
    );

    if (error) {
      this.throwPersistenceError(error.message);
    }
  }

  private async fetchQuoteByPublicToken(token: string) {
    const hash = this.hashPublicToken(token);
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("quote_drafts")
      .select("*")
      .eq("public_token_hash", hash)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      throw new NotFoundException("Quote link not found.");
    }

    const row = data as QuoteRow;

    if (row.public_token_expires_at && new Date(row.public_token_expires_at) < new Date()) {
      throw new ForbiddenException("This quote link has expired.");
    }

    return row;
  }

  private async fetchInvoiceRowByJobId(jobId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .select("*")
      .eq("job_id", jobId)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return (data as InvoiceRow | null) ?? undefined;
  }

  private async fetchInvoiceByJobId(jobId: string, creatorUserId: string) {
    const row = await this.fetchInvoiceRowByJobId(jobId, creatorUserId);
    return row ? this.mapInvoice(row) : undefined;
  }

  private async fetchInvoiceRowById(invoiceId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      throw new NotFoundException("Invoice not found.");
    }

    return data as InvoiceRow;
  }

  private async fetchInvoicesByJobIds(jobIds: string[], creatorUserId: string) {
    const map = new Map<string, InvoiceRecord>();

    if (jobIds.length === 0) {
      return map;
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .in("job_id", jobIds);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    for (const row of (data ?? []) as InvoiceRow[]) {
      map.set(row.job_id, await this.mapInvoice(row));
    }

    return map;
  }

  private async fetchInvoiceLineItems(invoiceId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("invoice_line_items")
      .select("*")
      .eq("invoice_id", invoiceId)
      .eq("creator_user_id", creatorUserId)
      .order("sort_order", { ascending: true });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return (data ?? []).map((row) => this.mapCommercialLineItem(row as LineItemRow));
  }

  private async replaceInvoiceLineItems(
    invoiceId: string,
    creatorUserId: string,
    lineItems: CommercialLineItem[]
  ) {
    const admin = this.supabaseService.getAdminClient();
    const { error: deleteError } = await admin
      .from("invoice_line_items")
      .delete()
      .eq("invoice_id", invoiceId)
      .eq("creator_user_id", creatorUserId);

    if (deleteError) {
      this.throwPersistenceError(deleteError.message);
    }

    const { error } = await admin.from("invoice_line_items").insert(
      lineItems.map((item) => ({
        id: item.id,
        invoice_id: invoiceId,
        creator_user_id: creatorUserId,
        label: item.label,
        description: item.description,
        quantity: item.quantity,
        unit_amount_minor: item.unitAmountMinor,
        tax_rate_basis_points: item.taxRateBasisPoints,
        line_subtotal_minor: item.lineSubtotalMinor,
        line_tax_minor: item.lineTaxMinor,
        line_total_minor: item.lineTotalMinor,
        sort_order: item.sortOrder
      }))
    );

    if (error) {
      this.throwPersistenceError(error.message);
    }
  }

  private async fetchInvoiceByPublicToken(token: string) {
    const hash = this.hashPublicToken(token);
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .select("*")
      .eq("public_token_hash", hash)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      throw new NotFoundException("Invoice link not found.");
    }

    const row = data as InvoiceRow;

    if (row.public_token_expires_at && new Date(row.public_token_expires_at) < new Date()) {
      throw new ForbiddenException("This invoice link has expired.");
    }

    return row;
  }

  private async fetchPaymentsByJobId(jobId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("payment_records")
      .select("*")
      .eq("job_id", jobId)
      .eq("creator_user_id", creatorUserId)
      .order("created_at", { ascending: false });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return (data ?? []).map((row) => this.mapPayment(row as PaymentRow));
  }

  private async createPaymentRecord(params: {
    creatorUserId: string;
    invoiceId: string;
    jobId: string;
    phase: "full" | "deposit" | "balance";
    amountMinor: number;
    currencyCode: string;
  }) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("payment_records")
      .insert({
        creator_user_id: params.creatorUserId,
        invoice_id: params.invoiceId,
        job_id: params.jobId,
        phase: params.phase,
        amount_minor: params.amountMinor,
        currency_code: params.currencyCode,
        status: "pending"
      })
      .select("*")
      .single();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return this.mapPayment(data as PaymentRow);
  }

  private async createStripeCheckoutSession(params: {
    stripeAccountId: string;
    invoice: InvoiceRecord;
    payment: PaymentRecord;
    publicToken: string;
  }) {
    if (this.isStripeMockMode()) {
      const sessionId = `cs_mock_${randomUUID()}`;
      await this.supabaseService
        .getAdminClient()
        .from("payment_records")
        .update({ stripe_checkout_session_id: sessionId })
        .eq("id", params.payment.id);

      return {
        payment: {
          ...params.payment,
          stripeCheckoutSessionId: sessionId
        },
        checkoutUrl: `${this.getAppUrl()}/invoice/${params.publicToken}?session=${sessionId}`
      };
    }

    const session = await this.stripe.checkout.sessions.create(
      {
        mode: "payment",
        success_url: `${this.getAppUrl()}/invoice/${params.publicToken}?payment=success`,
        cancel_url: `${this.getAppUrl()}/invoice/${params.publicToken}?payment=cancelled`,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: params.invoice.currencyCode.toLowerCase(),
              product_data: {
                name: `${params.invoice.title} (${params.payment.phase})`
              },
              unit_amount: params.payment.amountMinor
            }
          }
        ],
        metadata: {
          creatorUserId: params.invoice.creatorUserId,
          invoiceId: params.invoice.id,
          jobId: params.invoice.jobId,
          paymentId: params.payment.id,
          phase: params.payment.phase
        }
      },
      {
        stripeAccount: params.stripeAccountId
      }
    );

    await this.supabaseService
      .getAdminClient()
      .from("payment_records")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", params.payment.id);

    return {
      payment: {
        ...params.payment,
        stripeCheckoutSessionId: session.id
      },
      checkoutUrl: session.url ?? `${this.getAppUrl()}/invoice/${params.publicToken}`
    };
  }

  private constructStripeEvent(rawBody: string, signature: string) {
    if (this.isStripeMockMode()) {
      const secret = apiEnv.STRIPE_WEBHOOK_SECRET ?? "whsec_mock_local";
      const parts = new Map(
        signature.split(",").map((part) => {
          const [key, value] = part.split("=");
          return [key, value];
        })
      );
      const timestamp = parts.get("t") ?? "";
      const receivedSignature = parts.get("v1") ?? "";
      const computed = createHmac("sha256", secret)
        .update(`${timestamp}.${rawBody}`)
        .digest("hex");

      if (receivedSignature !== computed) {
        throw new UnauthorizedException("Invalid Stripe webhook signature.");
      }

      return JSON.parse(rawBody) as Stripe.Event;
    }

    if (!apiEnv.STRIPE_WEBHOOK_SECRET) {
      throw new UnauthorizedException("Stripe webhook secret is not configured.");
    }

    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      apiEnv.STRIPE_WEBHOOK_SECRET
    );
  }

  private async handleCheckoutCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = typeof session.metadata?.paymentId === "string" ? session.metadata.paymentId : null;

    if (!paymentId) {
      return;
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("payment_records")
      .select("*")
      .eq("id", paymentId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      return;
    }

    const paymentRow = data as PaymentRow;
    await this.supabaseService.getAdminClient().from("payment_records").update({
      status: "succeeded",
      stripe_payment_intent_id:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      stripe_event_id: event.id,
      paid_at: new Date().toISOString()
    }).eq("id", paymentId);

    await this.refreshInvoiceFromPayments(paymentRow.invoice_id, paymentRow.creator_user_id);
  }

  private async handlePaymentIntentFailed(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const paymentId =
      typeof paymentIntent.metadata?.paymentId === "string"
        ? paymentIntent.metadata.paymentId
        : null;

    if (!paymentId) {
      return;
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("payment_records")
      .select("*")
      .eq("id", paymentId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      return;
    }

    const paymentRow = data as PaymentRow;
    await this.supabaseService
      .getAdminClient()
      .from("payment_records")
      .update({
        status: "failed",
        stripe_payment_intent_id: paymentIntent.id,
        stripe_event_id: event.id
      })
      .eq("id", paymentId);

    await this.refreshInvoiceFromPayments(paymentRow.invoice_id, paymentRow.creator_user_id);
  }

  private async refreshInvoiceFromPayments(invoiceId: string, creatorUserId: string) {
    const invoiceRow = await this.fetchInvoiceRowById(invoiceId, creatorUserId);
    const payments = await this.fetchPaymentsByJobId(invoiceRow.job_id, creatorUserId);
    const invoicePayments = payments.filter((payment) => payment.invoiceId === invoiceId);
    const amountPaidMinor = invoicePayments
      .filter((payment) => payment.status === "succeeded")
      .reduce((sum, payment) => sum + payment.amountMinor, 0);
    const nextStatus = deriveInvoiceStatus({
      currentStatus: invoiceRow.status,
      collectionMode: invoiceRow.collection_mode,
      paymentStatus: invoicePayments[0]?.status,
      amountPaidMinor,
      totalMinor: invoiceRow.total_minor,
      depositAmountMinor: invoiceRow.deposit_amount_minor
    });
    const money = computeInvoiceMoneyState({
      totalMinor: invoiceRow.total_minor,
      amountPaidMinor,
      collectionMode: invoiceRow.collection_mode,
      depositAmountMinor: invoiceRow.deposit_amount_minor
    });

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .update({
        status: nextStatus,
        amount_paid_minor: money.amountPaidMinor,
        amount_due_minor: money.amountDueMinor,
        balance_amount_minor: money.balanceAmountMinor
      })
      .eq("id", invoiceId)
      .eq("creator_user_id", creatorUserId);

    if (error) {
      this.throwPersistenceError(error.message);
    }
  }

  private async mapQuote(row: QuoteRow): Promise<QuoteRecord> {
    const lineItems = await this.fetchQuoteLineItems(row.id, row.creator_user_id);

    return {
      id: row.id,
      creatorUserId: row.creator_user_id,
      jobId: row.job_id,
      status: row.status,
      title: row.title,
      message: row.message,
      currencyCode: row.currency_code,
      lineItems,
      totals: {
        currencyCode: row.currency_code,
        subtotalMinor: row.subtotal_minor,
        taxMinor: row.tax_minor,
        totalMinor: row.total_minor
      },
      publicUrl:
        row.public_token_hash && row.public_token_expires_at
          ? undefined
          : undefined,
      publicExpiresAt: row.public_token_expires_at ?? undefined,
      sentAt: row.sent_at ?? undefined,
      respondedAt: row.responded_at ?? undefined,
      acceptedAt: row.accepted_at ?? undefined,
      declinedAt: row.declined_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private async mapInvoice(row: InvoiceRow): Promise<InvoiceRecord> {
    const lineItems = await this.fetchInvoiceLineItems(row.id, row.creator_user_id);

    return {
      id: row.id,
      creatorUserId: row.creator_user_id,
      jobId: row.job_id,
      quoteId: row.quote_id ?? undefined,
      status: row.status,
      invoiceNumber: row.invoice_number,
      title: row.title,
      message: row.message,
      currencyCode: row.currency_code,
      collectionMode: row.collection_mode,
      depositConfig:
        row.deposit_type && row.deposit_value
          ? {
              type: row.deposit_type,
              value: Number(row.deposit_value)
            }
          : undefined,
      lineItems,
      totals: {
        currencyCode: row.currency_code,
        subtotalMinor: row.subtotal_minor,
        taxMinor: row.tax_minor,
        totalMinor: row.total_minor,
        amountPaidMinor: row.amount_paid_minor,
        amountDueMinor: row.amount_due_minor,
        depositAmountMinor: row.deposit_amount_minor,
        balanceAmountMinor: row.balance_amount_minor
      },
      dueDate: row.due_date ?? undefined,
      paymentTermsDays: row.payment_terms_days,
      issueAt: row.issue_at ?? undefined,
      sentAt: row.sent_at ?? undefined,
      publicUrl: undefined,
      publicExpiresAt: row.public_token_expires_at ?? undefined,
      attachments: row.attachments ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapCommercialLineItem(row: LineItemRow): CommercialLineItem {
    return {
      id: row.id,
      label: row.label,
      description: row.description,
      quantity: Number(row.quantity),
      unitAmountMinor: row.unit_amount_minor,
      taxRateBasisPoints: row.tax_rate_basis_points,
      sortOrder: row.sort_order,
      lineSubtotalMinor: row.line_subtotal_minor,
      lineTaxMinor: row.line_tax_minor,
      lineTotalMinor: row.line_total_minor
    };
  }

  private mapPayment(row: PaymentRow): PaymentRecord {
    return {
      id: row.id,
      creatorUserId: row.creator_user_id,
      invoiceId: row.invoice_id,
      jobId: row.job_id,
      stripeCheckoutSessionId: row.stripe_checkout_session_id ?? undefined,
      stripePaymentIntentId: row.stripe_payment_intent_id ?? undefined,
      phase: row.phase,
      amountMinor: row.amount_minor,
      currencyCode: row.currency_code,
      status: row.status,
      paidAt: row.paid_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
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

  private mapJob(row: JobRow, requestedSlots: JobDraftRecord["requestedSlots"]): JobDraftRecord {
    return {
      id: row.id,
      creatorUserId: row.creator_user_id,
      clientId: row.client_id,
      sourceBookingRequestId: row.source_booking_request_id,
      portfolioId: row.portfolio_id,
      title: row.title,
      eventType: row.event_type,
      status: row.status,
      requestedSlots,
      requesterSnapshot: {
        clientName: row.requester_name_snapshot,
        clientEmail: row.requester_email_snapshot
      },
      eventNotes: row.event_notes,
      servicePackageNotes: row.service_package_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapStripeAccount(row: StripeAccountRow): StripeConnectedAccountState {
    return {
      creatorUserId: row.creator_user_id,
      accountId: row.stripe_account_id ?? undefined,
      status: row.status,
      chargesEnabled: row.charges_enabled,
      payoutsEnabled: row.payouts_enabled,
      detailsSubmitted: row.details_submitted,
      dashboardUrl: row.dashboard_url ?? undefined,
      updatedAt: row.updated_at
    };
  }

  private getPaymentAmountMinor(invoice: InvoiceRecord, phase: "full" | "deposit" | "balance") {
    if (phase === "full") {
      return invoice.totals.amountDueMinor;
    }

    if (phase === "deposit") {
      return invoice.totals.depositAmountMinor;
    }

    return invoice.totals.balanceAmountMinor;
  }

  private generatePublicToken() {
    return createHash("sha256").update(randomUUID()).digest("hex").slice(0, 32);
  }

  private hashPublicToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private getExpiryIso(days: number) {
    return new Date(Date.now() + days * 86400000).toISOString();
  }

  private getAppUrl() {
    return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  }

  private async generateInvoiceNumber(creatorUserId: string) {
    const { count, error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("creator_user_id", creatorUserId);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return `INV-${new Date().getUTCFullYear()}-${String((count ?? 0) + 1).padStart(4, "0")}`;
  }

  private getCreatorIdFromStripeObject(object: Stripe.Event.Data.Object) {
    const candidate = object as { metadata?: Record<string, unknown> };
    return typeof candidate.metadata?.creatorUserId === "string"
      ? candidate.metadata.creatorUserId
      : null;
  }

  private async updateInvoiceStatus(
    invoiceId: string,
    creatorUserId: string,
    status: InvoiceStatus
  ) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .update({ status })
      .eq("id", invoiceId)
      .eq("creator_user_id", creatorUserId);

    if (error) {
      this.throwPersistenceError(error.message);
    }
  }

  private throwPersistenceError(message: string): never {
    throw new InternalServerErrorException(message);
  }
}
