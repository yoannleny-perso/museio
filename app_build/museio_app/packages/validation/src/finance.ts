import { z } from "zod";
import { invoiceCollectionModeSchema, invoiceStatusSchema } from "./invoice.js";
import { paymentRecordSchema, stripeConnectedAccountStateSchema } from "./payment.js";

export const financeReportPresetSchema = z.enum([
  "last-30-days",
  "last-90-days",
  "last-6-months",
  "year-to-date",
  "all-time",
  "custom"
]);

export const financeTaxPeriodPresetSchema = z.enum([
  "current-quarter",
  "previous-quarter",
  "financial-year-to-date",
  "custom"
]);

export const financeForecastModeSchema = z.enum(["weekly", "monthly"]);

export const financeAgingBucketNameSchema = z.enum([
  "current",
  "1-30-days",
  "31-60-days",
  "61-90-days",
  "90-plus-days"
]);

export const taxReportingMethodSchema = z.enum(["cash", "accrual"]);

export const financeDateWindowSchema = z.object({
  preset: z.union([financeReportPresetSchema, financeTaxPeriodPresetSchema]),
  label: z.string().min(1),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});

const financeWorkspaceFiltersShape = z.object({
  reportPreset: financeReportPresetSchema.default("last-30-days"),
  reportFrom: z.string().datetime().optional(),
  reportTo: z.string().datetime().optional(),
  taxPreset: financeTaxPeriodPresetSchema.default("current-quarter"),
  taxFrom: z.string().datetime().optional(),
  taxTo: z.string().datetime().optional(),
  forecastMode: financeForecastModeSchema.default("monthly")
});

export const financeWorkspaceFiltersSchema = financeWorkspaceFiltersShape.superRefine((value, context) => {
  if (value.reportPreset === "custom" && (!value.reportFrom || !value.reportTo)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Custom report windows require reportFrom and reportTo.",
      path: ["reportFrom"]
    });
  }

  if (value.taxPreset === "custom" && (!value.taxFrom || !value.taxTo)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Custom tax windows require taxFrom and taxTo.",
      path: ["taxFrom"]
    });
  }
});

export const financeOverviewSummarySchema = z.object({
  currencyCode: z.string().length(3),
  totalCollectedMinor: z.number().int(),
  totalInvoicedMinor: z.number().int(),
  receivablesMinor: z.number().int(),
  overdueMinor: z.number().int(),
  depositsCollectedMinor: z.number().int(),
  balancesOutstandingMinor: z.number().int(),
  acceptedQuotePipelineMinor: z.number().int(),
  invoiceCount: z.number().int().min(0),
  paymentCount: z.number().int().min(0)
});

export const financeReceivablesSummarySchema = z.object({
  currencyCode: z.string().length(3),
  openInvoiceCount: z.number().int().min(0),
  draftInvoiceCount: z.number().int().min(0),
  dueSoonInvoiceCount: z.number().int().min(0),
  receivablesMinor: z.number().int(),
  depositsOutstandingMinor: z.number().int(),
  balancesOutstandingMinor: z.number().int()
});

export const financeAgingBucketSchema = z.object({
  bucket: financeAgingBucketNameSchema,
  invoiceCount: z.number().int().min(0),
  amountMinor: z.number().int()
});

export const financeOverdueSummarySchema = z.object({
  currencyCode: z.string().length(3),
  overdueInvoiceCount: z.number().int().min(0),
  overdueMinor: z.number().int(),
  buckets: z.array(financeAgingBucketSchema)
});

export const financeForecastBucketSchema = z.object({
  label: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  committedMinor: z.number().int(),
  pipelineMinor: z.number().int(),
  totalMinor: z.number().int()
});

export const financeForecastSummarySchema = z.object({
  currencyCode: z.string().length(3),
  mode: financeForecastModeSchema,
  inclusionRule: z.string().min(1),
  committedMinor: z.number().int(),
  pipelineMinor: z.number().int(),
  totalMinor: z.number().int(),
  buckets: z.array(financeForecastBucketSchema)
});

export const atoReadyChecklistSchema = z.object({
  businessProfile: z.boolean(),
  gstRegistration: z.boolean(),
  banking: z.boolean(),
  recordKeeping: z.boolean()
});

export const financeTaxProfileSchema = z.object({
  creatorUserId: z.string().min(1),
  countryCode: z.literal("AU"),
  currencyCode: z.string().length(3),
  gstRegistered: z.boolean(),
  gstNumber: z.string().min(1).optional(),
  gstRateBasisPoints: z.number().int().min(0).max(10000),
  reportingMethod: taxReportingMethodSchema,
  reserveRateBasisPoints: z.number().int().min(0).max(10000),
  atoReadyChecklist: atoReadyChecklistSchema,
  updatedAt: z.string().datetime()
});

export const financeTaxSummarySchema = z.object({
  currencyCode: z.string().length(3),
  gstRegistered: z.boolean(),
  reportingMethod: taxReportingMethodSchema,
  taxableSalesMinor: z.number().int(),
  gstCollectedMinor: z.number().int(),
  gstOutstandingMinor: z.number().int(),
  gstPayableMinor: z.number().int(),
  reserveTargetMinor: z.number().int(),
  taxWindowLabel: z.string().min(1)
});

export const financeInvoiceLedgerEntrySchema = z.object({
  invoiceId: z.string().min(1),
  invoiceNumber: z.string().min(1),
  jobId: z.string().min(1),
  clientName: z.string().min(1),
  title: z.string().min(1),
  status: invoiceStatusSchema,
  collectionMode: invoiceCollectionModeSchema,
  issueAt: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  totalMinor: z.number().int(),
  amountPaidMinor: z.number().int(),
  amountDueMinor: z.number().int(),
  depositAmountMinor: z.number().int(),
  balanceAmountMinor: z.number().int(),
  taxMinor: z.number().int(),
  lastPaymentAt: z.string().datetime().optional(),
  overdueDays: z.number().int().min(0),
  isOverdue: z.boolean()
});

export const financePaymentLedgerEntrySchema = paymentRecordSchema.extend({
  clientName: z.string().min(1),
  invoiceNumber: z.string().min(1),
  invoiceStatus: invoiceStatusSchema
});

export const financeWorkspaceStateSchema = z.object({
  filters: financeWorkspaceFiltersSchema,
  reportWindow: financeDateWindowSchema,
  taxWindow: financeDateWindowSchema,
  overview: financeOverviewSummarySchema,
  receivables: financeReceivablesSummarySchema,
  overdue: financeOverdueSummarySchema,
  forecast: financeForecastSummarySchema,
  taxProfile: financeTaxProfileSchema,
  taxSummary: financeTaxSummarySchema,
  stripe: stripeConnectedAccountStateSchema,
  invoiceLedger: z.array(financeInvoiceLedgerEntrySchema),
  paymentLedger: z.array(financePaymentLedgerEntrySchema),
  emptyStateReason: z.string().min(1).optional()
});

export const updateFinanceTaxProfileInputSchema = z.object({
  gstRegistered: z.boolean(),
  gstNumber: z.string().trim().optional(),
  gstRateBasisPoints: z.number().int().min(0).max(10000),
  reportingMethod: taxReportingMethodSchema,
  reserveRateBasisPoints: z.number().int().min(0).max(10000),
  atoReadyChecklist: atoReadyChecklistSchema
});

export const financeExportFormatSchema = z.enum(["csv", "json"]);

export const financeExportInputSchema = financeWorkspaceFiltersShape.extend({
  format: financeExportFormatSchema.default("csv")
}).superRefine((value, context) => {
  if (value.reportPreset === "custom" && (!value.reportFrom || !value.reportTo)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Custom report windows require reportFrom and reportTo.",
      path: ["reportFrom"]
    });
  }

  if (value.taxPreset === "custom" && (!value.taxFrom || !value.taxTo)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Custom tax windows require taxFrom and taxTo.",
      path: ["taxFrom"]
    });
  }
});

export const financeExportPayloadSchema = z.object({
  format: financeExportFormatSchema,
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  content: z.string(),
  generatedAt: z.string().datetime()
});
