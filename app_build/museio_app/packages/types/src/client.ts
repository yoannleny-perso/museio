import type { BookingRequestStatus } from "./booking.js";
import type { InvoiceStatus } from "./invoice.js";
import type { JobStatus } from "./job.js";
import type { PaymentRecordStatus } from "./payment.js";

export type ClientStatus = "lead" | "active" | "vip" | "archived";

export type ClientTimelineEventType =
  | "booking-request-submitted"
  | "job-created"
  | "invoice-issued"
  | "payment-recorded"
  | "message-sent"
  | "profile-updated";

export interface ClientRecord {
  id: string;
  creatorUserId: string;
  displayName: string;
  primaryEmail: string;
  phone?: string;
  companyName?: string;
  status: ClientStatus;
  tags: string[];
  notes?: string;
  lastContactedAt?: string;
  sourceBookingRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientBookingSummary {
  id: string;
  eventType: string;
  status: BookingRequestStatus;
  submittedAt: string;
}

export interface ClientJobSummary {
  id: string;
  title: string;
  eventType: string;
  status: JobStatus;
  createdAt: string;
}

export interface ClientInvoiceSummary {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  totalMinor: number;
  amountDueMinor: number;
  dueDate?: string;
  issuedAt?: string;
}

export interface ClientPaymentSummary {
  id: string;
  invoiceId: string;
  phase: "full" | "deposit" | "balance";
  status: PaymentRecordStatus;
  amountMinor: number;
  paidAt?: string;
  createdAt: string;
}

export interface ClientRelationshipSummary {
  bookingRequestCount: number;
  jobCount: number;
  invoiceCount: number;
  paymentCount: number;
  openInvoiceCount: number;
  collectedMinor: number;
  outstandingMinor: number;
}

export interface ClientTimelineEvent {
  id: string;
  creatorUserId: string;
  clientId: string;
  type: ClientTimelineEventType;
  summary: string;
  linkedEntityType?: "booking-request" | "job" | "invoice" | "payment" | "thread";
  linkedEntityId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface CreatorClientListItem {
  client: ClientRecord;
  relationship: ClientRelationshipSummary;
}

export interface CreatorClientsState {
  clients: CreatorClientListItem[];
}

export interface CreatorClientProfileState {
  client: ClientRecord;
  relationship: ClientRelationshipSummary;
  bookings: ClientBookingSummary[];
  jobs: ClientJobSummary[];
  invoices: ClientInvoiceSummary[];
  payments: ClientPaymentSummary[];
  timeline: ClientTimelineEvent[];
}

export interface UpdateClientProfileInput {
  displayName: string;
  primaryEmail: string;
  phone?: string;
  companyName?: string;
  status: ClientStatus;
  tags: string[];
  notes?: string;
}
