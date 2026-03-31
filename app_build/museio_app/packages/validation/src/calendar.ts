import { z } from "zod";
import { externalCalendarProviderSchema } from "./booking.js";

export const externalCalendarSyncStatusSchema = z.enum([
  "idle",
  "syncing",
  "synced",
  "error"
]);

export const externalCalendarConnectionStateSchema = z.object({
  id: z.string().min(1),
  creatorUserId: z.string().min(1),
  provider: externalCalendarProviderSchema,
  status: z.enum(["not-connected", "connecting", "connected", "sync-error", "revoked"]),
  accountLabel: z.string().min(1),
  externalAccountId: z.string().min(1).optional(),
  scopes: z.array(z.string().min(1)),
  syncStatus: externalCalendarSyncStatusSchema,
  lastSyncAt: z.string().datetime().optional(),
  lastSyncError: z.string().optional(),
  connectedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const importedConflictSourceMetadataSchema = z.object({
  externalCalendarId: z.string().min(1).optional(),
  externalEventId: z.string().min(1).optional(),
  sourceLabel: z.string().min(1).optional(),
  rawStatus: z.string().min(1).optional()
});

export const externalBusyBlockSchema = z.object({
  id: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  timezone: z.string().min(1),
  source: z.literal("external-calendar"),
  title: z.string().min(1),
  notes: z.string().optional(),
  allDay: z.boolean(),
  externalProvider: externalCalendarProviderSchema.optional(),
  provider: externalCalendarProviderSchema,
  externalAccountId: z.string().min(1).optional(),
  syncStatus: externalCalendarSyncStatusSchema,
  sourceMetadata: importedConflictSourceMetadataSchema.optional(),
  importedAt: z.string().datetime().optional()
}).refine((value) => value.endsAt > value.startsAt, {
  message: "External busy blocks must end after they start.",
  path: ["endsAt"]
});

export const availabilityConflictCenterItemSchema = z.object({
  id: z.string().min(1),
  source: z.enum(["manual", "vacation", "external-calendar", "booking-request"]),
  provider: externalCalendarProviderSchema.optional(),
  title: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  timezone: z.string().min(1),
  allDay: z.boolean(),
  publicSafeLabel: z.string().min(1),
  sourceMetadata: importedConflictSourceMetadataSchema.optional()
});

export const calendarIntegrationWorkspaceStateSchema = z.object({
  accounts: z.array(externalCalendarConnectionStateSchema),
  externalBusyBlocks: z.array(externalBusyBlockSchema),
  conflicts: z.array(availabilityConflictCenterItemSchema)
});

export const upsertExternalCalendarAccountInputSchema = z.object({
  provider: externalCalendarProviderSchema,
  accountLabel: z.string().trim().min(1),
  externalAccountId: z.string().trim().optional(),
  scopes: z.array(z.string().trim().min(1)).optional(),
  status: z.enum(["connecting", "connected", "sync-error", "revoked"]).optional(),
  syncStatus: externalCalendarSyncStatusSchema.optional(),
  lastSyncError: z.string().trim().optional()
});

export const importExternalBusyBlocksInputSchema = z.object({
  blocks: z.array(
    z.object({
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime(),
      timezone: z.string().min(1),
      title: z.string().trim().min(1),
      allDay: z.boolean().optional(),
      externalCalendarId: z.string().trim().optional(),
      externalEventId: z.string().trim().optional(),
      sourceLabel: z.string().trim().optional(),
      rawStatus: z.string().trim().optional()
    }).refine((value) => new Date(value.endsAt).getTime() > new Date(value.startsAt).getTime(), {
      message: "Imported busy blocks must end after they start.",
      path: ["endsAt"]
    })
  )
});
