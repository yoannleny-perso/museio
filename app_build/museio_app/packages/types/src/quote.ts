export type QuoteStatus =
  | "draft"
  | "ready-to-send"
  | "sent"
  | "accepted"
  | "declined";

export type QuoteResponseAction = "accept" | "decline";

export interface CommercialLineItem {
  id: string;
  label: string;
  description: string;
  quantity: number;
  unitAmountMinor: number;
  taxRateBasisPoints: number;
  sortOrder: number;
  lineSubtotalMinor: number;
  lineTaxMinor: number;
  lineTotalMinor: number;
}

export interface CommercialTotals {
  currencyCode: string;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
}

export interface QuoteRecord {
  id: string;
  creatorUserId: string;
  jobId: string;
  status: QuoteStatus;
  title: string;
  message: string;
  currencyCode: string;
  lineItems: CommercialLineItem[];
  totals: CommercialTotals;
  publicUrl?: string;
  publicExpiresAt?: string;
  sentAt?: string;
  respondedAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuoteDraftInput {
  title?: string;
  message?: string;
}

export interface SaveQuoteDraftInput {
  title: string;
  message: string;
  currencyCode: string;
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

export interface SendQuoteInput {
  expiresInDays?: number;
}

export interface RespondToQuoteInput {
  action: QuoteResponseAction;
}

export interface PublicQuoteState {
  quote: QuoteRecord;
  tokenValid: boolean;
  canRespond: boolean;
  artistName: string;
  clientName: string;
}
