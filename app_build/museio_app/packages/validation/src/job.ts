import { z } from "zod";

const requesterSnapshotSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email()
});

const requestedDateTimeSlotBlockSchema = z.object({
  id: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  timezone: z.string().min(1)
});

export const jobStatusSchema = z.enum([
  "draft",
  "quote-prep",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
  "archived"
]);

export const jobDraftRecordSchema = z.object({
  id: z.string().min(1),
  creatorUserId: z.string().min(1),
  clientId: z.string().min(1),
  sourceBookingRequestId: z.string().min(1),
  portfolioId: z.string().min(1),
  title: z.string().min(1),
  eventType: z.string().min(1),
  status: jobStatusSchema,
  requestedSlots: z.array(requestedDateTimeSlotBlockSchema),
  requesterSnapshot: requesterSnapshotSchema,
  eventNotes: z.string(),
  servicePackageNotes: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
