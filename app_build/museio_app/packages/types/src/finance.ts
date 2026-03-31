import type { InvoiceCollectionMode, InvoiceStatus } from "./invoice.js";
import type { PaymentRecord, StripeConnectedAccountState } from "./payment.js";

export type FinanceReportPreset =
  | "last-30-days"
  | "last-90-days"
  | "last-6-months"
  | "year-to-date"
  | "all-time"
  | "custom";

export type FinanceTaxPeriodPreset =
  | "current-quarter"
  | "previous-quarter"
  | "financial-year-to-date"
  | "custom";

export type FinanceForecastMode = "weekly" | "monthly";

export type FinanceAgingBucketName =
  | "current"
  | "1-30-days"
  | "31-60-days"
  | "61-90-days"
  | "90-plus-days";

export type TaxReportingMethod = "cash" | "accrual";

export interface FinanceDateWindow {
  preset: FinanceReportPreset | FinanceTaxPeriodPreset;
  label: string;
  from?: string;
  to?: string;
}

export interface FinanceWorkspaceFilters {
  reportPreset?: FinanceReportPreset;
  reportFrom?: string;
  reportTo?: string;
  taxPreset?: FinanceTaxPeriodPreset;
  taxFrom?: string;
  taxTo?: string;
  forecastMode?: FinanceForecastMode;
}

export interface ResolvedFinanceWorkspaceFilters {
  reportPreset: FinanceReportPreset;
  reportFrom?: string;
  reportTo?: string;
  taxPreset: FinanceTaxPeriodPreset;
  taxFrom?: string;
  taxTo?: string;
  forecastMode: FinanceForecastMode;
}

export interface FinanceOverviewSummary {
  currencyCode: string;
  totalCollectedMinor: number;
  totalInvoicedMinor: number;
  receivablesMinor: number;
  overdueMinor: number;
  depositsCollectedMinor: number;
  balancesOutstandingMinor: number;
  acceptedQuotePipelineMinor: number;
  invoiceCount: number;
  paymentCount: number;
}

export interface FinanceReceivablesSummary {
  currencyCode: string;
  openInvoiceCount: number;
  draftInvoiceCount: number;
  dueSoonInvoiceCount: number;
  receivablesMinor: number;
  depositsOutstandingMinor: number;
  balancesOutstandingMinor: number;
}

export interface FinanceAgingBucket {
  bucket: FinanceAgingBucketName;
  invoiceCount: number;
  amountMinor: number;
}

export interface FinanceOverdueSummary {
  currencyCode: string;
  overdueInvoiceCount: number;
  overdueMinor: number;
  buckets: FinanceAgingBucket[];
}

export interface FinanceForecastBucket {
  label: string;
  startsAt: string;
  endsAt: string;
  committedMinor: number;
  pipelineMinor: number;
  totalMinor: number;
}

export interface FinanceForecastSummary {
  currencyCode: string;
  mode: FinanceForecastMode;
  inclusionRule: string;
  committedMinor: number;
  pipelineMinor: number;
  totalMinor: number;
  buckets: FinanceForecastBucket[];
}

export interface AtoReadyChecklist {
  businessProfile: boolean;
  gstRegistration: boolean;
  banking: boolean;
  recordKeeping: boolean;
}

export interface FinanceTaxProfile {
  creatorUserId: string;
  countryCode: "AU";
  currencyCode: string;
  gstRegistered: boolean;
  gstNumber?: string;
  gstRateBasisPoints: number;
  reportingMethod: TaxReportingMethod;
  reserveRateBasisPoints: number;
  atoReadyChecklist: AtoReadyChecklist;
  updatedAt: string;
}

export interface FinanceTaxSummary {
  currencyCode: string;
  gstRegistered: boolean;
  reportingMethod: TaxReportingMethod;
  taxableSalesMinor: number;
  gstCollectedMinor: number;
  gstOutstandingMinor: number;
  gstPayableMinor: number;
  reserveTargetMinor: number;
  taxWindowLabel: string;
}

export interface FinanceInvoiceLedgerEntry {
  invoiceId: string;
  invoiceNumber: string;
  jobId: string;
  clientName: string;
  title: string;
  status: InvoiceStatus;
  collectionMode: InvoiceCollectionMode;
  issueAt?: string;
  sentAt?: string;
  dueDate?: string;
  totalMinor: number;
  amountPaidMinor: number;
  amountDueMinor: number;
  depositAmountMinor: number;
  balanceAmountMinor: number;
  taxMinor: number;
  lastPaymentAt?: string;
  overdueDays: number;
  isOverdue: boolean;
}

export interface FinancePaymentLedgerEntry extends PaymentRecord {
  clientName: string;
  invoiceNumber: string;
  invoiceStatus: InvoiceStatus;
}

export interface FinanceWorkspaceState {
  filters: ResolvedFinanceWorkspaceFilters;
  reportWindow: FinanceDateWindow;
  taxWindow: FinanceDateWindow;
  overview: FinanceOverviewSummary;
  receivables: FinanceReceivablesSummary;
  overdue: FinanceOverdueSummary;
  forecast: FinanceForecastSummary;
  taxProfile: FinanceTaxProfile;
  taxSummary: FinanceTaxSummary;
  stripe: StripeConnectedAccountState;
  invoiceLedger: FinanceInvoiceLedgerEntry[];
  paymentLedger: FinancePaymentLedgerEntry[];
  emptyStateReason?: string;
}

export interface UpdateFinanceTaxProfileInput {
  gstRegistered: boolean;
  gstNumber?: string;
  gstRateBasisPoints: number;
  reportingMethod: TaxReportingMethod;
  reserveRateBasisPoints: number;
  atoReadyChecklist: AtoReadyChecklist;
}

export type FinanceExportFormat = "csv" | "json";

export interface FinanceExportInput extends FinanceWorkspaceFilters {
  format?: FinanceExportFormat;
}

export interface FinanceExportPayload {
  format: FinanceExportFormat;
  filename: string;
  mimeType: string;
  content: string;
  generatedAt: string;
}
