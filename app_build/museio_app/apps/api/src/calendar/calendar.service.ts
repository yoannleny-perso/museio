import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { bookingBlockingStatuses, toConflictCenterItem } from "@museio/domain";
import type {
  AvailabilityConflictCenterItem,
  AvailabilityConflictBlock,
  CalendarIntegrationWorkspaceState,
  ExternalBusyBlock,
  UpsertExternalCalendarAccountInput
} from "@museio/types";
import {
  importExternalBusyBlocksInputSchema,
  upsertExternalCalendarAccountInputSchema
} from "@museio/validation";
import { SupabaseService } from "../supabase/supabase.service";

interface AccountRow {
  id: string;
  creator_user_id: string;
  provider: "google-calendar" | "calendly" | "manual-import";
  status: "not-connected" | "connecting" | "connected" | "sync-error" | "revoked";
  account_label: string;
  external_account_id: string | null;
  scopes: string[] | null;
  sync_status: "idle" | "syncing" | "synced" | "error";
  last_sync_at: string | null;
  last_sync_error: string | null;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AvailabilityBlockRow {
  id: string;
  creator_user_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  source: "manual" | "vacation";
  title: string;
  notes: string | null;
  all_day: boolean;
}

interface ExternalBlockRow {
  id: string;
  creator_user_id: string;
  provider: "google-calendar" | "calendly" | "manual-import";
  external_account_id: string | null;
  external_calendar_id: string | null;
  external_event_id: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  title: string;
  all_day: boolean;
  sync_status: "idle" | "syncing" | "synced" | "error";
  source_metadata: {
    externalCalendarId?: string;
    externalEventId?: string;
    sourceLabel?: string;
    rawStatus?: string;
  } | null;
  imported_at: string | null;
}

interface BookingRow {
  id: string;
}

interface BookingSlotRow {
  id: string;
  booking_request_id: string;
  creator_user_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
}

@Injectable()
export class CalendarService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getWorkspace(
    accessToken?: string | null
  ): Promise<CalendarIntegrationWorkspaceState> {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    return this.buildWorkspace(user.id);
  }

  async upsertAccount(
    payload: UpsertExternalCalendarAccountInput,
    accessToken?: string | null
  ): Promise<CalendarIntegrationWorkspaceState> {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const parsed = upsertExternalCalendarAccountInputSchema.parse(payload);
    const now = new Date().toISOString();

    const { data: existing, error: existingError } = await this.supabaseService
      .getAdminClient()
      .from("external_calendar_accounts")
      .select("*")
      .eq("creator_user_id", user.id)
      .eq("provider", parsed.provider)
      .maybeSingle();

    if (existingError) {
      throw new InternalServerErrorException(existingError.message);
    }

    if (existing) {
      const { error } = await this.supabaseService
        .getAdminClient()
        .from("external_calendar_accounts")
        .update({
          account_label: parsed.accountLabel.trim(),
          external_account_id: parsed.externalAccountId?.trim() || null,
          scopes: parsed.scopes ?? [],
          status: parsed.status ?? "connected",
          sync_status: parsed.syncStatus ?? "synced",
          last_sync_error: parsed.lastSyncError?.trim() || null,
          last_sync_at:
            (parsed.syncStatus ?? "synced") === "synced" ? now : existing.last_sync_at,
          connected_at: existing.connected_at ?? now
        })
        .eq("id", existing.id)
        .eq("creator_user_id", user.id);

      if (error) {
        throw new InternalServerErrorException(error.message);
      }
    } else {
      const { error } = await this.supabaseService
        .getAdminClient()
        .from("external_calendar_accounts")
        .insert({
          creator_user_id: user.id,
          provider: parsed.provider,
          account_label: parsed.accountLabel.trim(),
          external_account_id: parsed.externalAccountId?.trim() || null,
          scopes: parsed.scopes ?? [],
          status: parsed.status ?? "connected",
          sync_status: parsed.syncStatus ?? "synced",
          last_sync_error: parsed.lastSyncError?.trim() || null,
          last_sync_at: (parsed.syncStatus ?? "synced") === "synced" ? now : null,
          connected_at: now
        });

      if (error) {
        throw new InternalServerErrorException(error.message);
      }
    }

    return this.buildWorkspace(user.id);
  }

  async importBusyBlocks(
    accountId: string,
    payload: { blocks: Array<Record<string, unknown>> },
    accessToken?: string | null
  ): Promise<CalendarIntegrationWorkspaceState> {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const parsed = importExternalBusyBlocksInputSchema.parse(payload);
    const account = await this.fetchAccount(accountId, user.id);
    const now = new Date().toISOString();

    const { error: deleteError } = await this.supabaseService
      .getAdminClient()
      .from("creator_external_calendar_blocks")
      .delete()
      .eq("creator_user_id", user.id)
      .eq("external_account_id", account.id);

    if (deleteError) {
      throw new InternalServerErrorException(deleteError.message);
    }

    if (parsed.blocks.length > 0) {
      const { error: insertError } = await this.supabaseService
        .getAdminClient()
        .from("creator_external_calendar_blocks")
        .insert(
          parsed.blocks.map((block) => ({
            creator_user_id: user.id,
            provider: account.provider,
            external_account_id: account.id,
            external_calendar_id: block.externalCalendarId ?? null,
            external_event_id: block.externalEventId ?? null,
            starts_at: block.startsAt,
            ends_at: block.endsAt,
            timezone: block.timezone,
            title: block.title,
            all_day: block.allDay ?? false,
            sync_status: "synced",
            source_metadata: {
              externalCalendarId: block.externalCalendarId ?? null,
              externalEventId: block.externalEventId ?? null,
              sourceLabel: block.sourceLabel ?? null,
              rawStatus: block.rawStatus ?? null
            },
            imported_at: now
          }))
        );

      if (insertError) {
        throw new InternalServerErrorException(insertError.message);
      }
    }

    const { error: accountError } = await this.supabaseService
      .getAdminClient()
      .from("external_calendar_accounts")
      .update({
        status: "connected",
        sync_status: "synced",
        last_sync_at: now,
        last_sync_error: null,
        connected_at: account.connected_at ?? now
      })
      .eq("id", account.id)
      .eq("creator_user_id", user.id);

    if (accountError) {
      throw new InternalServerErrorException(accountError.message);
    }

    return this.buildWorkspace(user.id);
  }

  private async buildWorkspace(creatorUserId: string) {
    const [accounts, unavailableBlocks, externalBlocks, bookingBlocks] =
      await Promise.all([
        this.fetchAccounts(creatorUserId),
        this.fetchUnavailableBlocks(creatorUserId),
        this.fetchExternalBusyBlocks(creatorUserId),
        this.fetchBookingRequestBlocks(creatorUserId)
      ]);

    const conflicts = [
      ...unavailableBlocks.map((block) => toConflictCenterItem(block)),
      ...externalBlocks.map((block) => this.toConflictItem(block)),
      ...bookingBlocks
    ].sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
    );

    return {
      accounts: accounts.map((account) => this.mapAccount(account)),
      externalBusyBlocks: externalBlocks,
      conflicts
    };
  }

  private async fetchAccounts(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("external_calendar_accounts")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as AccountRow[];
  }

  private async fetchAccount(accountId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("external_calendar_accounts")
      .select("*")
      .eq("id", accountId)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException("The external calendar account was not found.");
    }

    return data as AccountRow;
  }

  private async fetchUnavailableBlocks(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("creator_unavailability_blocks")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("starts_at", { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return ((data ?? []) as AvailabilityBlockRow[]).map((row) => ({
      id: row.id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      timezone: row.timezone,
      source: row.source,
      title: row.title,
      notes: row.notes ?? undefined,
      allDay: row.all_day
    })) satisfies AvailabilityConflictBlock[];
  }

  private async fetchExternalBusyBlocks(
    creatorUserId: string
  ): Promise<ExternalBusyBlock[]> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("creator_external_calendar_blocks")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("starts_at", { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return ((data ?? []) as ExternalBlockRow[]).map((row) => ({
      id: row.id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      timezone: row.timezone,
      source: "external-calendar",
      title: row.title,
      allDay: row.all_day,
      externalProvider: row.provider,
      provider: row.provider,
      externalAccountId: row.external_account_id ?? undefined,
      syncStatus: row.sync_status,
      sourceMetadata: row.source_metadata ?? undefined,
      importedAt: row.imported_at ?? undefined
    }));
  }

  private async fetchBookingRequestBlocks(
    creatorUserId: string
  ): Promise<AvailabilityConflictCenterItem[]> {
    const { data: requests, error } = await this.supabaseService
      .getAdminClient()
      .from("booking_requests")
      .select("id")
      .eq("creator_user_id", creatorUserId)
      .in("status", [...bookingBlockingStatuses]);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const rows = (requests ?? []) as BookingRow[];

    if (rows.length === 0) {
      return [];
    }

    const { data: slots, error: slotError } = await this.supabaseService
      .getAdminClient()
      .from("booking_request_slots")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .in(
        "booking_request_id",
        rows.map((row) => row.id)
      )
      .order("starts_at", { ascending: true });

    if (slotError) {
      throw new InternalServerErrorException(slotError.message);
    }

    return ((slots ?? []) as BookingSlotRow[]).map((slot) => ({
      id: slot.id,
      source: "booking-request",
      title: "Pending booking hold",
      startsAt: slot.starts_at,
      endsAt: slot.ends_at,
      timezone: slot.timezone,
      allDay: false,
      publicSafeLabel: "Pending or active booking hold"
    }));
  }

  private mapAccount(row: AccountRow) {
    return {
      id: row.id,
      creatorUserId: row.creator_user_id,
      provider: row.provider,
      status: row.status,
      accountLabel: row.account_label,
      externalAccountId: row.external_account_id ?? undefined,
      scopes: row.scopes ?? [],
      syncStatus: row.sync_status,
      lastSyncAt: row.last_sync_at ?? undefined,
      lastSyncError: row.last_sync_error ?? undefined,
      connectedAt: row.connected_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private toConflictItem(block: ExternalBusyBlock): AvailabilityConflictCenterItem {
    return {
      id: block.id,
      source: "external-calendar",
      provider: block.provider,
      title: block.title,
      startsAt: block.startsAt,
      endsAt: block.endsAt,
      timezone: block.timezone,
      allDay: block.allDay,
      publicSafeLabel: "Busy from connected calendar",
      sourceMetadata: block.sourceMetadata
    };
  }
}
