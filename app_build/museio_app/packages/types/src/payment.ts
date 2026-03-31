import type { InvoicePaymentPhase, InvoiceRecord } from "./invoice.js";
import type { JobDraftRecord } from "./job.js";
import type { QuoteRecord } from "./quote.js";

export type PaymentRecordStatus =
  | "pending"
  | "requires-action"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partially-refunded";

export interface PaymentRecord {
  id: string;
  creatorUserId: string;
  invoiceId: string;
  jobId: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  phase: InvoicePaymentPhase;
  amountMinor: number;
  currencyCode: string;
  status: PaymentRecordStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type StripeReadinessStatus =
  | "not-connected"
  | "requires-onboarding"
  | "ready";

export interface StripeConnectedAccountState {
  creatorUserId: string;
  accountId?: string;
  status: StripeReadinessStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  dashboardUrl?: string;
  updatedAt?: string;
}

export interface CreateInvoicePaymentSessionInput {
  phase: InvoicePaymentPhase;
}

export interface UpdateStripeConnectedAccountInput {
  accountId: string;
}

export interface StripeCheckoutSessionResult {
  invoice: InvoiceRecord;
  payment: PaymentRecord;
  checkoutUrl: string;
}

export interface CreatorCommercialJobState {
  job: JobDraftRecord;
  quote?: QuoteRecord;
  invoice?: InvoiceRecord;
  payments: PaymentRecord[];
  stripe: StripeConnectedAccountState;
}

export interface CreatorCommercialJobsState {
  jobs: Array<{
    job: JobDraftRecord;
    quote?: QuoteRecord;
    invoice?: InvoiceRecord;
  }>;
  stripe: StripeConnectedAccountState;
}

export interface CreatorCommercialActionResult {
  state: CreatorCommercialJobState;
  publicUrl?: string;
}
