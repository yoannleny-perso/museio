import { z } from "zod";
import { commercialLineItemSchema, commercialTotalsSchema } from "./quote.js";

const commercialLineItemInputShape = z.object({
  id: z.string().min(1).optional(),
  label: z.string().min(1),
  description: z.string(),
  quantity: z.number().positive(),
  unitAmountMinor: z.number().int().min(0),
  taxRateBasisPoints: z.number().int().min(0).max(10000).optional(),
  sortOrder: z.number().int().min(0)
});

export const invoiceStatusSchema = z.enum([
  "draft",
  "sent",
  "viewed",
  "deposit-requested",
  "deposit-paid",
  "balance-due",
  "paid",
  "declined",
  "void"
]);

export const invoiceCollectionModeSchema = z.enum([
  "full-payment",
  "deposit-and-balance"
]);

export const depositTypeSchema = z.enum(["fixed", "percentage"]);
export const invoicePaymentPhaseSchema = z.enum(["full", "deposit", "balance"]);

export const depositConfigSchema = z.object({
  type: depositTypeSchema,
  value: z.number().positive()
});

export const invoiceAttachmentMetaSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  filename: z.string().min(1)
});

export const invoiceTotalsSchema = commercialTotalsSchema.extend({
  amountPaidMinor: z.number().int().min(0),
  amountDueMinor: z.number().int().min(0),
  depositAmountMinor: z.number().int().min(0),
  balanceAmountMinor: z.number().int().min(0)
});

export const invoiceRecordSchema = z.object({
  id: z.string().min(1),
  creatorUserId: z.string().min(1),
  jobId: z.string().min(1),
  quoteId: z.string().min(1).optional(),
  status: invoiceStatusSchema,
  invoiceNumber: z.string().min(1),
  title: z.string().min(1),
  message: z.string(),
  currencyCode: z.string().length(3),
  collectionMode: invoiceCollectionModeSchema,
  depositConfig: depositConfigSchema.optional(),
  lineItems: z.array(commercialLineItemSchema),
  totals: invoiceTotalsSchema,
  dueDate: z.string().datetime().optional(),
  paymentTermsDays: z.number().int().min(0),
  issueAt: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  publicUrl: z.string().url().optional(),
  publicExpiresAt: z.string().datetime().optional(),
  attachments: z.array(invoiceAttachmentMetaSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createInvoiceDraftInputSchema = z.object({
  title: z.string().trim().optional(),
  message: z.string().trim().optional(),
  deriveFromAcceptedQuote: z.boolean().optional()
});

export const saveInvoiceDraftInputSchema = z.object({
  title: z.string().trim().min(1),
  message: z.string(),
  currencyCode: z.string().length(3),
  paymentTermsDays: z.number().int().min(0),
  dueDate: z.string().datetime().optional(),
  collectionMode: invoiceCollectionModeSchema,
  depositConfig: depositConfigSchema.optional(),
  lineItems: z.array(commercialLineItemInputShape).min(1)
});

export const sendInvoiceInputSchema = z.object({
  expiresInDays: z.number().int().min(1).max(30).optional()
});

export const publicInvoiceStateSchema = z.object({
  invoice: invoiceRecordSchema,
  tokenValid: z.boolean(),
  canPay: z.boolean(),
  availablePaymentPhases: z.array(invoicePaymentPhaseSchema),
  artistName: z.string().min(1),
  clientName: z.string().min(1)
});
