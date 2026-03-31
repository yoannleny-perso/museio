import { z } from "zod";
import { clientRecordSchema } from "./client.js";
import { jobDraftRecordSchema } from "./job.js";

export const bookingRequestStatusSchema = z.enum([
  "submitted",
  "under-review",
  "accepted",
  "declined",
  "archived"
]);

export const availabilityBlockSourceSchema = z.enum([
  "manual",
  "vacation",
  "external-calendar",
  "booking-request"
]);

export const externalCalendarProviderSchema = z.enum([
  "google-calendar",
  "calendly",
  "manual-import"
]);

export const bookingRequesterContactSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email()
});

export const requestedDateTimeSlotBlockInputSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  timezone: z.string().min(1)
});

export const requestedDateTimeSlotBlockSchema =
  requestedDateTimeSlotBlockInputSchema.extend({
    id: z.string().min(1)
  });

const creatorAvailabilityRuleShape = z.object({
  weekday: z.number().int().min(0).max(6),
  startsAtMinute: z.number().int().min(0).max(1439),
  endsAtMinute: z.number().int().min(1).max(1440),
  timezone: z.string().min(1)
});

export const creatorAvailabilityRuleInputSchema = creatorAvailabilityRuleShape.refine(
  (value) => value.endsAtMinute > value.startsAtMinute,
  {
  message: "Availability windows must end after they start.",
  path: ["endsAtMinute"]
});

export const creatorAvailabilityRuleSchema = creatorAvailabilityRuleShape
  .extend({
    id: z.string().min(1)
  })
  .refine((value) => value.endsAtMinute > value.startsAtMinute, {
    message: "Availability windows must end after they start.",
    path: ["endsAtMinute"]
  });

export const availabilityConflictBlockSchema = z.object({
  id: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  timezone: z.string().min(1),
  source: availabilityBlockSourceSchema,
  title: z.string().min(1),
  notes: z.string().optional(),
  allDay: z.boolean(),
  externalProvider: externalCalendarProviderSchema.optional()
}).refine((value) => value.endsAt > value.startsAt, {
  message: "Blocked periods must end after they start.",
  path: ["endsAt"]
});

export const creatorUnavailableBlockInputSchema = z.object({
  id: z.string().min(1).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  timezone: z.string().min(1),
  title: z.string().min(1),
  notes: z.string().optional(),
  allDay: z.boolean().optional(),
  source: z.enum(["manual", "vacation"]).optional()
}).refine((value) => value.endsAt > value.startsAt, {
  message: "Blocked periods must end after they start.",
  path: ["endsAt"]
});

export const availabilityWindowSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  label: z.string().min(1)
});

export const publicAvailabilityDaySchema = z.object({
  date: z.string().min(1),
  timezone: z.string().min(1),
  windows: z.array(availabilityWindowSchema)
});

export const publicBookingCreatorSchema = z.object({
  creatorUserId: z.string().min(1),
  portfolioId: z.string().min(1),
  handle: z.string().min(1),
  artistName: z.string().min(1),
  shortBio: z.string(),
  portraitUrl: z.string().url().optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional()
});

export const bookingRequestRecordSchema = z.object({
  id: z.string().min(1),
  creatorUserId: z.string().min(1),
  portfolioId: z.string().min(1),
  portfolioHandle: z.string().min(1),
  requester: bookingRequesterContactSchema,
  eventType: z.string().min(1),
  eventNotes: z.string(),
  servicePackageNotes: z.string(),
  requestedSlots: z.array(requestedDateTimeSlotBlockSchema).min(1),
  status: bookingRequestStatusSchema,
  clientId: z.string().min(1).optional(),
  jobDraftId: z.string().min(1).optional(),
  convertedToJobAt: z.string().datetime().optional(),
  submittedAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const bookingInboxListItemSchema = z.object({
  id: z.string().min(1),
  status: bookingRequestStatusSchema,
  clientName: z.string().min(1),
  eventType: z.string().min(1),
  requestedSlots: z.array(requestedDateTimeSlotBlockSchema).min(1),
  client: clientRecordSchema.optional(),
  jobDraft: jobDraftRecordSchema.optional(),
  submittedAt: z.string().datetime()
});

export const creatorAvailabilityStateSchema = z.object({
  rules: z.array(creatorAvailabilityRuleSchema),
  unavailableBlocks: z.array(availabilityConflictBlockSchema),
  externalBlocks: z.array(availabilityConflictBlockSchema),
  publicAvailability: z.array(publicAvailabilityDaySchema)
});

export const creatorBookingInboxStateSchema = z.object({
  creator: publicBookingCreatorSchema.optional(),
  isConfigured: z.boolean(),
  availability: creatorAvailabilityStateSchema,
  requests: z.array(bookingInboxListItemSchema)
});

export const bookingInternalNoteSchema = z.object({
  id: z.string().min(1),
  bookingRequestId: z.string().min(1),
  creatorUserId: z.string().min(1),
  body: z.string().min(1),
  createdByUserId: z.string().min(1),
  createdAt: z.string().datetime()
});

export const bookingTimelineEventSchema = z.object({
  id: z.string().min(1),
  bookingRequestId: z.string().min(1),
  creatorUserId: z.string().min(1),
  type: z.enum([
    "submitted",
    "status-changed",
    "internal-note-added",
    "client-linked",
    "job-draft-created"
  ]),
  summary: z.string().min(1),
  actorUserId: z.string().min(1).optional(),
  fromStatus: bookingRequestStatusSchema.optional(),
  toStatus: bookingRequestStatusSchema.optional(),
  clientId: z.string().min(1).optional(),
  jobDraftId: z.string().min(1).optional(),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  createdAt: z.string().datetime()
});

export const creatorBookingRequestDetailSchema = z.object({
  creator: publicBookingCreatorSchema,
  availability: creatorAvailabilityStateSchema,
  request: bookingRequestRecordSchema,
  internalNotes: z.array(bookingInternalNoteSchema),
  timeline: z.array(bookingTimelineEventSchema),
  client: clientRecordSchema.optional(),
  jobDraft: jobDraftRecordSchema.optional(),
  availableDecisionActions: z.array(
    z.enum(["mark-under-review", "decline", "accept-into-job-draft", "archive"])
  )
});

export const publicBookingPageStateSchema = z.object({
  creator: publicBookingCreatorSchema,
  availability: z.array(publicAvailabilityDaySchema),
  requestStatusOptions: z.array(bookingRequestStatusSchema)
});

export const createPublicBookingRequestInputSchema = z.object({
  requester: bookingRequesterContactSchema,
  eventType: z.string().min(1),
  eventNotes: z.string(),
  servicePackageNotes: z.string(),
  requestedSlots: z.array(requestedDateTimeSlotBlockInputSchema).min(1)
});

export const updateCreatorAvailabilityInputSchema = z.object({
  rules: z.array(creatorAvailabilityRuleInputSchema),
  unavailableBlocks: z.array(creatorUnavailableBlockInputSchema)
});

export const updateBookingRequestStatusInputSchema = z.object({
  status: z.enum(["under-review", "accepted", "declined", "archived"])
});

export const applyBookingDecisionInputSchema = z.object({
  action: z.enum([
    "mark-under-review",
    "decline",
    "accept-into-job-draft",
    "archive"
  ]),
  note: z.string().trim().optional()
});

export const createBookingInternalNoteInputSchema = z.object({
  body: z.string().trim().min(1)
});
