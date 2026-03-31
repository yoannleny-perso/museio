import type {
  AvailabilityConflictBlock,
  ExternalCalendarProvider
} from "./booking.js";

export type ExternalCalendarSyncStatus =
  | "idle"
  | "syncing"
  | "synced"
  | "error";

export interface ExternalCalendarConnectionState {
  id: string;
  creatorUserId: string;
  provider: ExternalCalendarProvider;
  status: "not-connected" | "connecting" | "connected" | "sync-error" | "revoked";
  accountLabel: string;
  externalAccountId?: string;
  scopes: string[];
  syncStatus: ExternalCalendarSyncStatus;
  lastSyncAt?: string;
  lastSyncError?: string;
  connectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportedConflictSourceMetadata {
  externalCalendarId?: string;
  externalEventId?: string;
  sourceLabel?: string;
  rawStatus?: string;
}

export interface ExternalBusyBlock extends AvailabilityConflictBlock {
  provider: ExternalCalendarProvider;
  externalAccountId?: string;
  syncStatus: ExternalCalendarSyncStatus;
  sourceMetadata?: ImportedConflictSourceMetadata;
  importedAt?: string;
}

export interface AvailabilityConflictCenterItem {
  id: string;
  source: "manual" | "vacation" | "external-calendar" | "booking-request";
  provider?: ExternalCalendarProvider;
  title: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  allDay: boolean;
  publicSafeLabel: string;
  sourceMetadata?: ImportedConflictSourceMetadata;
}

export interface CalendarIntegrationWorkspaceState {
  accounts: ExternalCalendarConnectionState[];
  externalBusyBlocks: ExternalBusyBlock[];
  conflicts: AvailabilityConflictCenterItem[];
}

export interface UpsertExternalCalendarAccountInput {
  provider: ExternalCalendarProvider;
  accountLabel: string;
  externalAccountId?: string;
  scopes?: string[];
  status?: "connecting" | "connected" | "sync-error" | "revoked";
  syncStatus?: ExternalCalendarSyncStatus;
  lastSyncError?: string;
}

export interface ImportExternalBusyBlocksInput {
  blocks: Array<{
    startsAt: string;
    endsAt: string;
    timezone: string;
    title: string;
    allDay?: boolean;
    externalCalendarId?: string;
    externalEventId?: string;
    sourceLabel?: string;
    rawStatus?: string;
  }>;
}
