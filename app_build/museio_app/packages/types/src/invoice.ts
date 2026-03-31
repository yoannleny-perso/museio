import type { CommercialLineItem, CommercialTotals } from "./quote.js";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "deposit-requested"
  | "deposit-paid"
  | "balance-due"
  | "paid"
  | "declined"
  | "void";

export type InvoiceCollectionMode = "full-payment" | "deposit-and-balance";
export type DepositType = "fixed" | "percentage";
export type InvoicePaymentPhase = "full" | "deposit" | "balance";

export interface DepositConfig {
  type: DepositType;
  value: number;
}

export interface InvoiceAttachmentMeta {
  id: string;
  label: string;
  filename: string;
}

export interface InvoiceTotals extends CommercialTotals {
  amountPaidMinor: number;
  amountDueMinor: number;
  depositAmountMinor: number;
  balanceAmountMinor: number;
}

export interface InvoiceRecord {
  id: string;
  creatorUserId: string;
  jobId: string;
  quoteId?: string;
  status: InvoiceStatus;
  invoiceNumber: string;
  title: string;
  message: string;
  currencyCode: string;
  collectionMode: InvoiceCollectionMode;
  depositConfig?: DepositConfig;
  lineItems: CommercialLineItem[];
  totals: InvoiceTotals;
  dueDate?: string;
  paymentTermsDays: number;
  issueAt?: string;
  sentAt?: string;
  publicUrl?: string;
  publicExpiresAt?: string;
  attachments: InvoiceAttachmentMeta[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDraftInput {
  title?: string;
  message?: string;
  deriveFromAcceptedQuote?: boolean;
}

export interface SaveInvoiceDraftInput {
  title: string;
  message: string;
  currencyCode: string;
  paymentTermsDays: number;
  dueDate?: string;
  collectionMode: InvoiceCollectionMode;
  depositConfig?: DepositConfig;
  lineItems: Array<{
    id?: string;
    label: string;
    description: string;
    quantity: number;
    unitAmountMinor: number;
    taxRateBasisPoints?: number;
    sortOrder: number;
  }>;
}

export interface SendInvoiceInput {
  expiresInDays?: number;
}

export interface PublicInvoiceState {
  invoice: InvoiceRecord;
  tokenValid: boolean;
  canPay: boolean;
  availablePaymentPhases: InvoicePaymentPhase[];
  artistName: string;
  clientName: string;
}
