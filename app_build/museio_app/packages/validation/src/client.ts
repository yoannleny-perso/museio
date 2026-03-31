import { z } from "zod";

export const clientStatusSchema = z.enum(["lead", "active", "vip", "archived"]);

export const clientRecordSchema = z.object({
  id: z.string().min(1),
  creatorUserId: z.string().min(1),
  displayName: z.string().min(1),
  primaryEmail: z.string().email(),
  phone: z.string().trim().optional(),
  companyName: z.string().trim().optional(),
  status: clientStatusSchema,
  tags: z.array(z.string().trim().min(1)),
  notes: z.string().optional(),
  lastContactedAt: z.string().datetime().optional(),
  sourceBookingRequestId: z.string().min(1).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const clientBookingSummarySchema = z.object({
  id: z.string().min(1),
  eventType: z.string().min(1),
  status: z.enum(["submitted", "under-review", "accepted", "declined", "archived"]),
  submittedAt: z.string().datetime()
});

export const clientJobSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  eventType: z.string().min(1),
  status: z.enum(["draft", "quote-prep", "quoted", "confirmed", "completed", "cancelled", "archived"]),
  createdAt: z.string().datetime()
});

export const clientInvoiceSummarySchema = z.object({
  id: z.string().min(1),
  invoiceNumber: z.string().min(1),
  status: z.enum(["draft", "sent", "viewed", "deposit-requested", "deposit-paid", "balance-due", "paid", "declined", "void"]),
  totalMinor: z.number().int(),
  amountDueMinor: z.number().int(),
  dueDate: z.string().datetime().optional(),
  issuedAt: z.string().datetime().optional()
});

export const clientPaymentSummarySchema = z.object({
  id: z.string().min(1),
  invoiceId: z.string().min(1),
  phase: z.enum(["full", "deposit", "balance"]),
  status: z.enum(["pending", "requires-action", "processing", "succeeded", "failed", "refunded", "partially-refunded"]),
  amountMinor: z.number().int(),
  paidAt: z.string().datetime().optional(),
  createdAt: z.string().datetime()
});

export const clientRelationshipSummarySchema = z.object({
  bookingRequestCount: z.number().int().nonnegative(),
  jobCount: z.number().int().nonnegative(),
  invoiceCount: z.number().int().nonnegative(),
  paymentCount: z.number().int().nonnegative(),
  openInvoiceCount: z.number().int().nonnegative(),
  collectedMinor: z.number().int(),
  outstandingMinor: z.number().int()
});

export const clientTimelineEventSchema = z.object({
  id: z.string().min(1),
  creatorUserId: z.string().min(1),
  clientId: z.string().min(1),
  type: z.enum([
    "booking-request-submitted",
    "job-created",
    "invoice-issued",
    "payment-recorded",
    "message-sent",
    "profile-updated"
  ]),
  summary: z.string().min(1),
  linkedEntityType: z.enum(["booking-request", "job", "invoice", "payment", "thread"]).optional(),
  linkedEntityId: z.string().min(1).optional(),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  createdAt: z.string().datetime()
});

export const creatorClientListItemSchema = z.object({
  client: clientRecordSchema,
  relationship: clientRelationshipSummarySchema
});

export const creatorClientsStateSchema = z.object({
  clients: z.array(creatorClientListItemSchema)
});

export const creatorClientProfileStateSchema = z.object({
  client: clientRecordSchema,
  relationship: clientRelationshipSummarySchema,
  bookings: z.array(clientBookingSummarySchema),
  jobs: z.array(clientJobSummarySchema),
  invoices: z.array(clientInvoiceSummarySchema),
  payments: z.array(clientPaymentSummarySchema),
  timeline: z.array(clientTimelineEventSchema)
});

export const updateClientProfileInputSchema = z.object({
  displayName: z.string().trim().min(1),
  primaryEmail: z.string().trim().email(),
  phone: z.string().trim().optional(),
  companyName: z.string().trim().optional(),
  status: clientStatusSchema,
  tags: z.array(z.string().trim().min(1)),
  notes: z.string().trim().optional()
});
