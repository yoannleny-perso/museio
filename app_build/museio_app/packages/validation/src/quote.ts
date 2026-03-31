import { z } from "zod";

const commercialLineItemInputShape = z.object({
  id: z.string().min(1).optional(),
  label: z.string().min(1),
  description: z.string(),
  quantity: z.number().positive(),
  unitAmountMinor: z.number().int().min(0),
  taxRateBasisPoints: z.number().int().min(0).max(10000).optional(),
  sortOrder: z.number().int().min(0)
});

export const commercialLineItemSchema = commercialLineItemInputShape.extend({
  id: z.string().min(1),
  taxRateBasisPoints: z.number().int().min(0).max(10000),
  lineSubtotalMinor: z.number().int().min(0),
  lineTaxMinor: z.number().int().min(0),
  lineTotalMinor: z.number().int().min(0)
});

export const commercialTotalsSchema = z.object({
  currencyCode: z.string().length(3),
  subtotalMinor: z.number().int().min(0),
  taxMinor: z.number().int().min(0),
  totalMinor: z.number().int().min(0)
});

export const quoteStatusSchema = z.enum([
  "draft",
  "ready-to-send",
  "sent",
  "accepted",
  "declined"
]);

export const quoteResponseActionSchema = z.enum(["accept", "decline"]);

export const quoteRecordSchema = z.object({
  id: z.string().min(1),
  creatorUserId: z.string().min(1),
  jobId: z.string().min(1),
  status: quoteStatusSchema,
  title: z.string().min(1),
  message: z.string(),
  currencyCode: z.string().length(3),
  lineItems: z.array(commercialLineItemSchema),
  totals: commercialTotalsSchema,
  publicUrl: z.string().url().optional(),
  publicExpiresAt: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  respondedAt: z.string().datetime().optional(),
  acceptedAt: z.string().datetime().optional(),
  declinedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createQuoteDraftInputSchema = z.object({
  title: z.string().trim().optional(),
  message: z.string().trim().optional()
});

export const saveQuoteDraftInputSchema = z.object({
  title: z.string().trim().min(1),
  message: z.string(),
  currencyCode: z.string().length(3),
  lineItems: z.array(commercialLineItemInputShape).min(1)
});

export const sendQuoteInputSchema = z.object({
  expiresInDays: z.number().int().min(1).max(30).optional()
});

export const respondToQuoteInputSchema = z.object({
  action: quoteResponseActionSchema
});

export const publicQuoteStateSchema = z.object({
  quote: quoteRecordSchema,
  tokenValid: z.boolean(),
  canRespond: z.boolean(),
  artistName: z.string().min(1),
  clientName: z.string().min(1)
});
