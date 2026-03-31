import { z } from "zod";
import { invoicePaymentPhaseSchema, invoiceRecordSchema } from "./invoice.js";
import { jobDraftRecordSchema } from "./job.js";
import { quoteRecordSchema } from "./quote.js";

export const paymentRecordStatusSchema = z.enum([
  "pending",
  "requires-action",
  "processing",
  "succeeded",
  "failed",
  "refunded",
  "partially-refunded"
]);

export const paymentRecordSchema = z.object({
  id: z.string().min(1),
  creatorUserId: z.string().min(1),
  invoiceId: z.string().min(1),
  jobId: z.string().min(1),
  stripeCheckoutSessionId: z.string().min(1).optional(),
  stripePaymentIntentId: z.string().min(1).optional(),
  phase: invoicePaymentPhaseSchema,
  amountMinor: z.number().int().min(0),
  currencyCode: z.string().length(3),
  status: paymentRecordStatusSchema,
  paidAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const stripeReadinessStatusSchema = z.enum([
  "not-connected",
  "requires-onboarding",
  "ready"
]);

export const stripeConnectedAccountStateSchema = z.object({
  creatorUserId: z.string().min(1),
  accountId: z.string().min(1).optional(),
  status: stripeReadinessStatusSchema,
  chargesEnabled: z.boolean(),
  payoutsEnabled: z.boolean(),
  detailsSubmitted: z.boolean(),
  dashboardUrl: z.string().url().optional(),
  updatedAt: z.string().datetime().optional()
});

export const createInvoicePaymentSessionInputSchema = z.object({
  phase: invoicePaymentPhaseSchema
});

export const updateStripeConnectedAccountInputSchema = z.object({
  accountId: z.string().trim().min(1)
});

export const stripeCheckoutSessionResultSchema = z.object({
  invoice: invoiceRecordSchema,
  payment: paymentRecordSchema,
  checkoutUrl: z.string().url()
});

export const creatorCommercialJobStateSchema = z.object({
  job: jobDraftRecordSchema,
  quote: quoteRecordSchema.optional(),
  invoice: invoiceRecordSchema.optional(),
  payments: z.array(paymentRecordSchema),
  stripe: stripeConnectedAccountStateSchema
});

export const creatorCommercialJobsStateSchema = z.object({
  jobs: z.array(
    z.object({
      job: jobDraftRecordSchema,
      quote: quoteRecordSchema.optional(),
      invoice: invoiceRecordSchema.optional()
    })
  ),
  stripe: stripeConnectedAccountStateSchema
});

export const creatorCommercialActionResultSchema = z.object({
  state: creatorCommercialJobStateSchema,
  publicUrl: z.string().url().optional()
});
