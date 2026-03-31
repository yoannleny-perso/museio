import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import {
  bookingBlockingStatuses,
  bookingRequestStatuses,
  buildPublicAvailabilityDays,
  getAllowedBookingDecisionActions,
  getBookingStatusForDecision,
  getInitialJobStatus,
  isValidMinuteRange,
  slotsFitAvailability,
  toBlockingIntervals
} from "@museio/domain";
import type {
  ApplyBookingDecisionInput,
  AvailabilityConflictBlock,
  BookingInboxListItem,
  BookingInternalNote,
  BookingRequestRecord,
  BookingTimelineEvent,
  ClientRecord,
  CreateBookingInternalNoteInput,
  CreatePublicBookingRequestInput,
  CreatorAvailabilityRule,
  CreatorAvailabilityState,
  CreatorBookingInboxState,
  CreatorBookingRequestDetail,
  JobDraftRecord,
  PublicBookingCreator,
  PublicBookingPageState,
  RequestedDateTimeSlotBlock,
  UpdateBookingRequestStatusInput,
  UpdateCreatorAvailabilityInput
} from "@museio/types";
import {
  applyBookingDecisionInputSchema,
  createBookingInternalNoteInputSchema,
  createPublicBookingRequestInputSchema,
  updateBookingRequestStatusInputSchema,
  updateCreatorAvailabilityInputSchema
} from "@museio/validation";
import type { User } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase/supabase.service";

interface PortfolioBookingRow {
  id: string;
  owner_user_id: string;
  handle: string | null;
  artist_name: string;
  portrait_storage_path: string | null;
  short_bio: string;
  visibility: "private" | "public";
}

interface CreatorAvailabilityRuleRow {
  id: string;
  creator_user_id: string;
  weekday: number;
  starts_at_minute: number;
  ends_at_minute: number;
  timezone: string;
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

interface ExternalCalendarBlockRow {
  id: string;
  creator_user_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  provider: "google-calendar" | "calendly" | "manual-import";
  title: string;
  all_day: boolean;
  sync_status?: "idle" | "syncing" | "synced" | "error";
  source_metadata?: Record<string, string | number | boolean | null> | null;
  external_account_id?: string | null;
  imported_at?: string | null;
}

interface BookingRequestRow {
  id: string;
  creator_user_id: string;
  portfolio_id: string;
  portfolio_handle_snapshot: string;
  requester_name: string;
  requester_email: string;
  event_type: string;
  event_notes: string;
  service_package_notes: string;
  status: "submitted" | "under-review" | "accepted" | "declined" | "archived";
  client_id: string | null;
  job_draft_id: string | null;
  converted_to_job_at: string | null;
  submitted_at: string;
  updated_at: string;
}

interface BookingRequestSlotRow {
  id: string;
  booking_request_id: string;
  creator_user_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
}

interface BookingInternalNoteRow {
  id: string;
  booking_request_id: string;
  creator_user_id: string;
  created_by_user_id: string;
  body: string;
  created_at: string;
}

interface BookingActivityEventRow {
  id: string;
  booking_request_id: string;
  creator_user_id: string;
  actor_user_id: string | null;
  event_type:
    | "submitted"
    | "status-changed"
    | "internal-note-added"
    | "client-linked"
    | "job-draft-created";
  summary: string;
  from_status: BookingRequestRow["status"] | null;
  to_status: BookingRequestRow["status"] | null;
  client_id: string | null;
  job_draft_id: string | null;
  metadata: Record<string, string | number | boolean | null> | null;
  created_at: string;
}

interface ClientRow {
  id: string;
  creator_user_id: string;
  display_name: string;
  primary_email: string;
  phone: string | null;
  company_name: string | null;
  status: "lead" | "active" | "vip" | "archived";
  tags: string[] | null;
  notes: string | null;
  last_contacted_at: string | null;
  source_booking_request_id: string | null;
  created_at: string;
  updated_at: string;
}

interface JobRow {
  id: string;
  creator_user_id: string;
  client_id: string;
  source_booking_request_id: string;
  portfolio_id: string;
  title: string;
  event_type: string;
  status: JobDraftRecord["status"];
  requester_name_snapshot: string;
  requester_email_snapshot: string;
  event_notes: string;
  service_package_notes: string;
  created_at: string;
  updated_at: string;
}

interface JobRequestedSlotRow {
  id: string;
  job_id: string;
  creator_user_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
}

@Injectable()
export class BookingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getPublicBookingPage(handle: string): Promise<PublicBookingPageState> {
    const creator = await this.resolvePublicCreator(handle);
    const availabilityState = await this.buildAvailabilityState(creator);

    return {
      creator,
      availability: availabilityState.publicAvailability,
      requestStatusOptions: [...bookingRequestStatuses]
    };
  }

  async createPublicBookingRequest(
    handle: string,
    payload: CreatePublicBookingRequestInput
  ) {
    const creator = await this.resolvePublicCreator(handle);
    const parsed = createPublicBookingRequestInputSchema.parse(payload);
    const normalizedSlots = parsed.requestedSlots.map((slot) =>
      this.mapRequestedSlotInput(slot)
    );
    const availabilityState = await this.buildAvailabilityState(creator);

    if (
      !slotsFitAvailability(normalizedSlots, availabilityState.publicAvailability)
    ) {
      throw new ConflictException(
        "That time is no longer available. Please choose a different slot."
      );
    }

    const { data: created, error } = await this.supabaseService
      .getAdminClient()
      .from("booking_requests")
      .insert({
        creator_user_id: creator.creatorUserId,
        portfolio_id: creator.portfolioId,
        portfolio_handle_snapshot: creator.handle,
        requester_name: parsed.requester.clientName.trim(),
        requester_email: parsed.requester.clientEmail.trim().toLowerCase(),
        event_type: parsed.eventType.trim(),
        event_notes: parsed.eventNotes.trim(),
        service_package_notes: parsed.servicePackageNotes.trim(),
        status: "submitted"
      })
      .select("*")
      .single();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    const requestRow = created as BookingRequestRow;
    const { error: slotError } = await this.supabaseService
      .getAdminClient()
      .from("booking_request_slots")
      .insert(
        normalizedSlots.map((slot) => ({
          booking_request_id: requestRow.id,
          creator_user_id: creator.creatorUserId,
          starts_at: slot.startsAt,
          ends_at: slot.endsAt,
          timezone: slot.timezone
        }))
      );

    if (slotError) {
      await this.supabaseService
        .getAdminClient()
        .from("booking_requests")
        .delete()
        .eq("id", requestRow.id);
      this.throwPersistenceError(slotError.message);
    }

    await this.recordBookingActivity({
      bookingRequestId: requestRow.id,
      creatorUserId: creator.creatorUserId,
      type: "submitted",
      summary: "Booking request submitted from the public booking page.",
      toStatus: "submitted",
      metadata: {
        slotCount: normalizedSlots.length,
        handle: creator.handle
      }
    });

    return this.getPublicBookingPage(handle);
  }

  async getCreatorBookingInbox(accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const creator = await this.resolveCreatorByUser(user);

    if (!creator) {
      return {
        isConfigured: false,
        availability: {
          rules: [],
          unavailableBlocks: [],
          externalBlocks: [],
          publicAvailability: []
        },
        requests: []
      } satisfies CreatorBookingInboxState;
    }

    const availability = await this.buildAvailabilityState(creator);
    const requests = await this.fetchBookingInboxItems(creator.creatorUserId);

    return {
      isConfigured: true,
      creator,
      availability,
      requests
    } satisfies CreatorBookingInboxState;
  }

  async getCreatorBookingRequestDetail(
    requestId: string,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const creator = await this.resolveCreatorByUser(user);

    if (!creator) {
      throw new NotFoundException("Create a portfolio before reviewing booking requests.");
    }

    const availability = await this.buildAvailabilityState(creator);
    const row = await this.fetchBookingRequestRow(requestId, creator.creatorUserId);
    const request = await this.mapBookingRequestFromRow(row);
    const [internalNotes, timeline, client, jobDraft] = await Promise.all([
      this.fetchBookingInternalNotes(row.id, creator.creatorUserId),
      this.fetchBookingTimelineEvents(row.id, creator.creatorUserId),
      row.client_id ? this.fetchClientById(row.client_id, creator.creatorUserId) : undefined,
      row.job_draft_id ? this.fetchJobById(row.job_draft_id, creator.creatorUserId) : undefined
    ]);

    return {
      creator,
      availability,
      request,
      internalNotes,
      timeline,
      client: client ?? undefined,
      jobDraft: jobDraft ?? undefined,
      availableDecisionActions: getAllowedBookingDecisionActions(request.status)
    } satisfies CreatorBookingRequestDetail;
  }

  async updateCreatorAvailability(
    payload: UpdateCreatorAvailabilityInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const creator = await this.resolveCreatorByUser(user);

    if (!creator) {
      throw new NotFoundException("Create a portfolio before configuring booking.");
    }

    const parsed = updateCreatorAvailabilityInputSchema.parse(payload);

    for (const rule of parsed.rules) {
      if (!isValidMinuteRange(rule.startsAtMinute, rule.endsAtMinute)) {
        throw new BadRequestException("Availability windows must be valid minute ranges.");
      }
    }

    const admin = this.supabaseService.getAdminClient();

    const { error: deleteRulesError } = await admin
      .from("creator_availability_rules")
      .delete()
      .eq("creator_user_id", creator.creatorUserId);

    if (deleteRulesError) {
      this.throwPersistenceError(deleteRulesError.message);
    }

    if (parsed.rules.length > 0) {
      const { error: insertRulesError } = await admin
        .from("creator_availability_rules")
        .insert(
          parsed.rules.map((rule) => ({
            creator_user_id: creator.creatorUserId,
            weekday: rule.weekday,
            starts_at_minute: rule.startsAtMinute,
            ends_at_minute: rule.endsAtMinute,
            timezone: rule.timezone
          }))
        );

      if (insertRulesError) {
        this.throwPersistenceError(insertRulesError.message);
      }
    }

    const { error: deleteBlocksError } = await admin
      .from("creator_unavailability_blocks")
      .delete()
      .eq("creator_user_id", creator.creatorUserId);

    if (deleteBlocksError) {
      this.throwPersistenceError(deleteBlocksError.message);
    }

    if (parsed.unavailableBlocks.length > 0) {
      const { error: insertBlocksError } = await admin
        .from("creator_unavailability_blocks")
        .insert(
          parsed.unavailableBlocks.map((block) => ({
            creator_user_id: creator.creatorUserId,
            starts_at: block.startsAt,
            ends_at: block.endsAt,
            timezone: block.timezone,
            source: block.source ?? "manual",
            title: block.title.trim(),
            notes: block.notes?.trim() || null,
            all_day: Boolean(block.allDay)
          }))
        );

      if (insertBlocksError) {
        this.throwPersistenceError(insertBlocksError.message);
      }
    }

    return this.getCreatorBookingInbox(accessToken);
  }

  async updateBookingRequestStatus(
    requestId: string,
    payload: UpdateBookingRequestStatusInput,
    accessToken?: string | null
  ) {
    const parsed = updateBookingRequestStatusInputSchema.parse(payload);
    const action =
      parsed.status === "under-review"
        ? "mark-under-review"
        : parsed.status === "accepted"
          ? "accept-into-job-draft"
          : parsed.status === "declined"
            ? "decline"
            : "archive";

    return this.applyBookingDecision(
      requestId,
      { action },
      accessToken
    );
  }

  async applyBookingDecision(
    requestId: string,
    payload: ApplyBookingDecisionInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const creator = await this.resolveCreatorByUser(user);

    if (!creator) {
      throw new NotFoundException("Create a portfolio before reviewing booking requests.");
    }

    const parsed = applyBookingDecisionInputSchema.parse(payload);
    const row = await this.fetchBookingRequestRow(requestId, creator.creatorUserId);
    const allowedActions = getAllowedBookingDecisionActions(row.status);

    if (!allowedActions.includes(parsed.action)) {
      throw new ConflictException(
        `You cannot ${parsed.action} when a booking request is ${row.status}.`
      );
    }

    const nextStatus = getBookingStatusForDecision(parsed.action);
    const requestedSlotsByRequestId = await this.fetchSlotsByRequestIds(
      [row.id],
      creator.creatorUserId
    );
    const requestedSlots = requestedSlotsByRequestId.get(row.id) ?? [];

    let clientId = row.client_id;
    let jobDraftId = row.job_draft_id;

    if (parsed.action === "accept-into-job-draft") {
      const client = await this.ensureClientForBookingRequest(row);
      clientId = client.id;

      await this.recordBookingActivity({
        bookingRequestId: row.id,
        creatorUserId: creator.creatorUserId,
        actorUserId: user.id,
        type: "client-linked",
        summary: `Linked booking request to client ${client.displayName}.`,
        clientId: client.id
      });

      const jobDraft = await this.ensureJobDraftForBookingRequest(
        row,
        requestedSlots,
        client
      );
      jobDraftId = jobDraft.id;

      await this.recordBookingActivity({
        bookingRequestId: row.id,
        creatorUserId: creator.creatorUserId,
        actorUserId: user.id,
        type: "job-draft-created",
        summary: `Created job draft ${jobDraft.title}.`,
        clientId: client.id,
        jobDraftId: jobDraft.id
      });
    }

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("booking_requests")
      .update({
        status: nextStatus,
        client_id: clientId,
        job_draft_id: jobDraftId,
        converted_to_job_at:
          parsed.action === "accept-into-job-draft"
            ? new Date().toISOString()
            : row.converted_to_job_at
      })
      .eq("id", requestId)
      .eq("creator_user_id", creator.creatorUserId);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    await this.recordBookingActivity({
      bookingRequestId: row.id,
      creatorUserId: creator.creatorUserId,
      actorUserId: user.id,
      type: "status-changed",
      summary: `Status changed from ${row.status} to ${nextStatus}.`,
      fromStatus: row.status,
      toStatus: nextStatus,
      clientId: clientId ?? undefined,
      jobDraftId: jobDraftId ?? undefined
    });

    if (parsed.note?.trim()) {
      await this.createInternalNoteRecord(
        row.id,
        creator.creatorUserId,
        user.id,
        parsed.note.trim()
      );
    }

    return this.getCreatorBookingRequestDetail(requestId, accessToken);
  }

  async createBookingInternalNote(
    requestId: string,
    payload: CreateBookingInternalNoteInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const creator = await this.resolveCreatorByUser(user);

    if (!creator) {
      throw new NotFoundException("Create a portfolio before reviewing booking requests.");
    }

    const parsed = createBookingInternalNoteInputSchema.parse(payload);
    await this.fetchBookingRequestRow(requestId, creator.creatorUserId);
    await this.createInternalNoteRecord(
      requestId,
      creator.creatorUserId,
      user.id,
      parsed.body.trim()
    );

    return this.getCreatorBookingRequestDetail(requestId, accessToken);
  }

  private async resolvePublicCreator(handle: string): Promise<PublicBookingCreator> {
    const normalizedHandle = handle.trim().toLowerCase();

    if (!normalizedHandle) {
      throw new NotFoundException("Portfolio handle not found.");
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .select("id, owner_user_id, handle, artist_name, portrait_storage_path, short_bio, visibility")
      .eq("handle", normalizedHandle)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      throw new NotFoundException("Portfolio handle not found.");
    }

    const row = data as PortfolioBookingRow;

    if (row.visibility !== "public") {
      throw new ForbiddenException("This portfolio is currently private.");
    }

    return this.mapPublicCreator(row);
  }

  private async resolveCreatorByUser(user: User) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .select("id, owner_user_id, handle, artist_name, portrait_storage_path, short_bio, visibility")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      return null;
    }

    return this.mapPublicCreator(data as PortfolioBookingRow);
  }

  private async buildAvailabilityState(
    creator: PublicBookingCreator
  ): Promise<CreatorAvailabilityState> {
    const [rules, unavailableBlocks, externalBlocks, blockingSlots] =
      await Promise.all([
        this.fetchAvailabilityRules(creator.creatorUserId),
        this.fetchUnavailableBlocks(creator.creatorUserId),
        this.fetchExternalCalendarBlocks(creator.creatorUserId),
        this.fetchBlockingRequestSlots(creator.creatorUserId)
      ]);

    const timezone =
      rules[0]?.timezone ??
      unavailableBlocks[0]?.timezone ??
      externalBlocks[0]?.timezone ??
      "Australia/Sydney";
    const publicAvailability = buildPublicAvailabilityDays({
      rules,
      timezone,
      days: 14,
      blockingIntervals: toBlockingIntervals(
        [...unavailableBlocks, ...externalBlocks],
        blockingSlots
      )
    });

    return {
      rules,
      unavailableBlocks,
      externalBlocks,
      publicAvailability
    };
  }

  private async fetchAvailabilityRules(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("creator_availability_rules")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("weekday", { ascending: true })
      .order("starts_at_minute", { ascending: true });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return (data ?? []).map((row) => this.mapAvailabilityRule(row as CreatorAvailabilityRuleRow));
  }

  private async fetchUnavailableBlocks(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("creator_unavailability_blocks")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("starts_at", { ascending: true });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return (data ?? []).map((row) =>
      this.mapConflictBlock(row as AvailabilityBlockRow)
    );
  }

  private async fetchExternalCalendarBlocks(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("creator_external_calendar_blocks")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("starts_at", { ascending: true });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return (data ?? []).map((row) =>
      this.mapExternalBlock(row as ExternalCalendarBlockRow)
    );
  }

  private async fetchBlockingRequestSlots(creatorUserId: string) {
    const { data: requests, error } = await this.supabaseService
      .getAdminClient()
      .from("booking_requests")
      .select("id, status")
      .eq("creator_user_id", creatorUserId)
      .in("status", [...bookingBlockingStatuses]);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!requests || requests.length === 0) {
      return [] as RequestedDateTimeSlotBlock[];
    }

    const requestIds = requests.map((request) => String(request.id));
    const { data: slots, error: slotError } = await this.supabaseService
      .getAdminClient()
      .from("booking_request_slots")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .in("booking_request_id", requestIds)
      .order("starts_at", { ascending: true });

    if (slotError) {
      this.throwPersistenceError(slotError.message);
    }

    return (slots ?? []).map((slot) => this.mapSlot(slot as BookingRequestSlotRow));
  }

  private async fetchBookingInboxItems(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("booking_requests")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("submitted_at", { ascending: false });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    const rows = (data ?? []) as BookingRequestRow[];
    const slotsByRequestId = await this.fetchSlotsByRequestIds(
      rows.map((row) => row.id),
      creatorUserId
    );
    const clientMap = await this.fetchClientsByIds(
      rows.flatMap((row) => (row.client_id ? [row.client_id] : [])),
      creatorUserId
    );
    const jobMap = await this.fetchJobsByIds(
      rows.flatMap((row) => (row.job_draft_id ? [row.job_draft_id] : [])),
      creatorUserId
    );

    return rows.map((row) => ({
      id: row.id,
      status: row.status,
      clientName: row.requester_name,
      eventType: row.event_type,
      requestedSlots: slotsByRequestId.get(row.id) ?? [],
      client: row.client_id ? clientMap.get(row.client_id) : undefined,
      jobDraft: row.job_draft_id ? jobMap.get(row.job_draft_id) : undefined,
      submittedAt: row.submitted_at
    })) satisfies BookingInboxListItem[];
  }

  private async fetchBookingRequestRow(requestId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("booking_requests")
      .select("*")
      .eq("id", requestId)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      throw new NotFoundException("Booking request not found.");
    }

    return data as BookingRequestRow;
  }

  private async mapBookingRequestFromRow(row: BookingRequestRow) {
    const slotsByRequestId = await this.fetchSlotsByRequestIds([row.id], row.creator_user_id);
    return this.mapBookingRequestRecord(row, slotsByRequestId.get(row.id) ?? []);
  }

  private async fetchSlotsByRequestIds(requestIds: string[], creatorUserId: string) {
    const slotsByRequestId = new Map<string, RequestedDateTimeSlotBlock[]>();

    if (requestIds.length === 0) {
      return slotsByRequestId;
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("booking_request_slots")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .in("booking_request_id", requestIds)
      .order("starts_at", { ascending: true });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    for (const row of (data ?? []) as BookingRequestSlotRow[]) {
      const current = slotsByRequestId.get(row.booking_request_id) ?? [];
      current.push(this.mapSlot(row));
      slotsByRequestId.set(row.booking_request_id, current);
    }

    return slotsByRequestId;
  }

  private async fetchClientsByIds(clientIds: string[], creatorUserId: string) {
    const uniqueClientIds = [...new Set(clientIds)];
    const clientMap = new Map<string, ClientRecord>();

    if (uniqueClientIds.length === 0) {
      return clientMap;
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("clients")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .in("id", uniqueClientIds);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    for (const row of (data ?? []) as ClientRow[]) {
      clientMap.set(row.id, this.mapClient(row));
    }

    return clientMap;
  }

  private async fetchClientById(clientId: string, creatorUserId: string) {
    const clientMap = await this.fetchClientsByIds([clientId], creatorUserId);
    return clientMap.get(clientId);
  }

  private async fetchJobsByIds(jobIds: string[], creatorUserId: string) {
    const uniqueJobIds = [...new Set(jobIds)];
    const jobMap = new Map<string, JobDraftRecord>();

    if (uniqueJobIds.length === 0) {
      return jobMap;
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("jobs")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .in("id", uniqueJobIds);

    if (error) {
      this.throwPersistenceError(error.message);
    }

    const rows = (data ?? []) as JobRow[];
    const slotsByJobId = await this.fetchJobSlotsByJobIds(
      rows.map((row) => row.id),
      creatorUserId
    );

    for (const row of rows) {
      jobMap.set(row.id, this.mapJob(row, slotsByJobId.get(row.id) ?? []));
    }

    return jobMap;
  }

  private async fetchJobById(jobId: string, creatorUserId: string) {
    const jobMap = await this.fetchJobsByIds([jobId], creatorUserId);
    return jobMap.get(jobId);
  }

  private async fetchJobSlotsByJobIds(jobIds: string[], creatorUserId: string) {
    const slotsByJobId = new Map<string, RequestedDateTimeSlotBlock[]>();

    if (jobIds.length === 0) {
      return slotsByJobId;
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("job_requested_slots")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .in("job_id", jobIds)
      .order("starts_at", { ascending: true });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    for (const row of (data ?? []) as JobRequestedSlotRow[]) {
      const current = slotsByJobId.get(row.job_id) ?? [];
      current.push({
        id: row.id,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        timezone: row.timezone
      });
      slotsByJobId.set(row.job_id, current);
    }

    return slotsByJobId;
  }

  private async fetchBookingInternalNotes(
    requestId: string,
    creatorUserId: string
  ) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("booking_internal_notes")
      .select("*")
      .eq("booking_request_id", requestId)
      .eq("creator_user_id", creatorUserId)
      .order("created_at", { ascending: false });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return (data ?? []).map((row) => this.mapInternalNote(row as BookingInternalNoteRow));
  }

  private async fetchBookingTimelineEvents(
    requestId: string,
    creatorUserId: string
  ) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("booking_activity_events")
      .select("*")
      .eq("booking_request_id", requestId)
      .eq("creator_user_id", creatorUserId)
      .order("created_at", { ascending: false });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    return (data ?? []).map((row) =>
      this.mapTimelineEvent(row as BookingActivityEventRow)
    );
  }

  private async ensureClientForBookingRequest(row: BookingRequestRow) {
    const normalizedEmail = row.requester_email.trim().toLowerCase();
    const admin = this.supabaseService.getAdminClient();

    const { data: existing, error: existingError } = await admin
      .from("clients")
      .select("*")
      .eq("creator_user_id", row.creator_user_id)
      .eq("primary_email_normalized", normalizedEmail)
      .maybeSingle();

    if (existingError) {
      this.throwPersistenceError(existingError.message);
    }

    if (existing) {
      return this.mapClient(existing as ClientRow);
    }

    const { data: created, error: createError } = await admin
      .from("clients")
      .insert({
        creator_user_id: row.creator_user_id,
        display_name: row.requester_name,
        primary_email: row.requester_email,
        primary_email_normalized: normalizedEmail,
        source_booking_request_id: row.id
      })
      .select("*")
      .single();

    if (createError) {
      const message = createError.message.toLowerCase();
      if (message.includes("duplicate key")) {
        const { data: duplicate, error: duplicateError } = await admin
          .from("clients")
          .select("*")
          .eq("creator_user_id", row.creator_user_id)
          .eq("primary_email_normalized", normalizedEmail)
          .maybeSingle();

        if (duplicateError) {
          this.throwPersistenceError(duplicateError.message);
        }

        if (duplicate) {
          return this.mapClient(duplicate as ClientRow);
        }
      }

      this.throwPersistenceError(createError.message);
    }

    return this.mapClient(created as ClientRow);
  }

  private async ensureJobDraftForBookingRequest(
    row: BookingRequestRow,
    requestedSlots: RequestedDateTimeSlotBlock[],
    client: ClientRecord
  ) {
    const existing = await this.fetchExistingJobDraftForRequest(
      row.id,
      row.creator_user_id
    );

    if (existing) {
      return existing;
    }

    const title = `${row.event_type} · ${row.requester_name}`;
    const { data: created, error } = await this.supabaseService
      .getAdminClient()
      .from("jobs")
      .insert({
        creator_user_id: row.creator_user_id,
        client_id: client.id,
        source_booking_request_id: row.id,
        portfolio_id: row.portfolio_id,
        title,
        event_type: row.event_type,
        status: getInitialJobStatus(),
        requester_name_snapshot: row.requester_name,
        requester_email_snapshot: row.requester_email,
        event_notes: row.event_notes,
        service_package_notes: row.service_package_notes
      })
      .select("*")
      .single();

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("duplicate key")) {
        const duplicate = await this.fetchExistingJobDraftForRequest(
          row.id,
          row.creator_user_id
        );

        if (duplicate) {
          return duplicate;
        }
      }

      this.throwPersistenceError(error.message);
    }

    const jobRow = created as JobRow;
    const { error: slotError } = await this.supabaseService
      .getAdminClient()
      .from("job_requested_slots")
      .insert(
        requestedSlots.map((slot) => ({
          job_id: jobRow.id,
          creator_user_id: row.creator_user_id,
          starts_at: slot.startsAt,
          ends_at: slot.endsAt,
          timezone: slot.timezone
        }))
      );

    if (slotError) {
      this.throwPersistenceError(slotError.message);
    }

    return this.mapJob(jobRow, requestedSlots);
  }

  private async fetchExistingJobDraftForRequest(
    requestId: string,
    creatorUserId: string
  ) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("jobs")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .eq("source_booking_request_id", requestId)
      .maybeSingle();

    if (error) {
      this.throwPersistenceError(error.message);
    }

    if (!data) {
      return undefined;
    }

    return this.fetchJobById((data as JobRow).id, creatorUserId);
  }

  private async createInternalNoteRecord(
    requestId: string,
    creatorUserId: string,
    actorUserId: string,
    body: string
  ) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from("booking_internal_notes")
      .insert({
        booking_request_id: requestId,
        creator_user_id: creatorUserId,
        created_by_user_id: actorUserId,
        body
      });

    if (error) {
      this.throwPersistenceError(error.message);
    }

    await this.recordBookingActivity({
      bookingRequestId: requestId,
      creatorUserId,
      actorUserId,
      type: "internal-note-added",
      summary: "Internal review note added."
    });
  }

  private async recordBookingActivity(params: {
    bookingRequestId: string;
    creatorUserId: string;
    type: BookingActivityEventRow["event_type"];
    summary: string;
    actorUserId?: string;
    fromStatus?: BookingRequestRow["status"];
    toStatus?: BookingRequestRow["status"];
    clientId?: string;
    jobDraftId?: string;
    metadata?: Record<string, string | number | boolean | null>;
  }) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from("booking_activity_events")
      .insert({
        booking_request_id: params.bookingRequestId,
        creator_user_id: params.creatorUserId,
        actor_user_id: params.actorUserId ?? null,
        event_type: params.type,
        summary: params.summary,
        from_status: params.fromStatus ?? null,
        to_status: params.toStatus ?? null,
        client_id: params.clientId ?? null,
        job_draft_id: params.jobDraftId ?? null,
        metadata: params.metadata ?? {}
      });

    if (error) {
      this.throwPersistenceError(error.message);
    }
  }

  private mapPublicCreator(row: PortfolioBookingRow): PublicBookingCreator {
    return {
      creatorUserId: row.owner_user_id,
      portfolioId: row.id,
      handle: row.handle ?? "",
      artistName: row.artist_name,
      shortBio: row.short_bio,
      portraitUrl: row.portrait_storage_path ? undefined : undefined,
      canonicalUrl: this.getCanonicalUrl(row.handle ?? "")
    };
  }

  private mapAvailabilityRule(row: CreatorAvailabilityRuleRow): CreatorAvailabilityRule {
    return {
      id: row.id,
      weekday: row.weekday,
      startsAtMinute: row.starts_at_minute,
      endsAtMinute: row.ends_at_minute,
      timezone: row.timezone
    };
  }

  private mapConflictBlock(row: AvailabilityBlockRow): AvailabilityConflictBlock {
    return {
      id: row.id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      timezone: row.timezone,
      source: row.source,
      title: row.title,
      notes: row.notes ?? undefined,
      allDay: row.all_day
    };
  }

  private mapExternalBlock(row: ExternalCalendarBlockRow): AvailabilityConflictBlock {
    return {
      id: row.id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      timezone: row.timezone,
      source: "external-calendar",
      title: row.title,
      allDay: row.all_day,
      externalProvider: row.provider
    };
  }

  private mapSlot(row: BookingRequestSlotRow): RequestedDateTimeSlotBlock {
    return {
      id: row.id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      timezone: row.timezone
    };
  }

  private mapRequestedSlotInput(slot: {
    startsAt: string;
    endsAt: string;
    timezone: string;
  }): RequestedDateTimeSlotBlock {
    const start = new Date(slot.startsAt);
    const end = new Date(slot.endsAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      throw new BadRequestException("Requested booking slots must have valid start and end times.");
    }

    return {
      id: `${slot.startsAt}:${slot.endsAt}`,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      timezone: slot.timezone
    };
  }

  private mapBookingRequestRecord(
    row: BookingRequestRow,
    requestedSlots: RequestedDateTimeSlotBlock[]
  ): BookingRequestRecord {
    return {
      id: row.id,
      creatorUserId: row.creator_user_id,
      portfolioId: row.portfolio_id,
      portfolioHandle: row.portfolio_handle_snapshot,
      requester: {
        clientName: row.requester_name,
        clientEmail: row.requester_email
      },
      eventType: row.event_type,
      eventNotes: row.event_notes,
      servicePackageNotes: row.service_package_notes,
      requestedSlots,
      status: row.status,
      clientId: row.client_id ?? undefined,
      jobDraftId: row.job_draft_id ?? undefined,
      convertedToJobAt: row.converted_to_job_at ?? undefined,
      submittedAt: row.submitted_at,
      updatedAt: row.updated_at
    };
  }

  private mapInternalNote(row: BookingInternalNoteRow): BookingInternalNote {
    return {
      id: row.id,
      bookingRequestId: row.booking_request_id,
      creatorUserId: row.creator_user_id,
      body: row.body,
      createdByUserId: row.created_by_user_id,
      createdAt: row.created_at
    };
  }

  private mapTimelineEvent(row: BookingActivityEventRow): BookingTimelineEvent {
    return {
      id: row.id,
      bookingRequestId: row.booking_request_id,
      creatorUserId: row.creator_user_id,
      type: row.event_type,
      summary: row.summary,
      actorUserId: row.actor_user_id ?? undefined,
      fromStatus: row.from_status ?? undefined,
      toStatus: row.to_status ?? undefined,
      clientId: row.client_id ?? undefined,
      jobDraftId: row.job_draft_id ?? undefined,
      metadata: row.metadata ?? undefined,
      createdAt: row.created_at
    };
  }

  private mapClient(row: ClientRow): ClientRecord {
    return {
      id: row.id,
      creatorUserId: row.creator_user_id,
      displayName: row.display_name,
      primaryEmail: row.primary_email,
      phone: row.phone ?? undefined,
      companyName: row.company_name ?? undefined,
      status: row.status,
      tags: row.tags ?? [],
      notes: row.notes ?? undefined,
      lastContactedAt: row.last_contacted_at ?? undefined,
      sourceBookingRequestId: row.source_booking_request_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapJob(
    row: JobRow,
    requestedSlots: RequestedDateTimeSlotBlock[]
  ): JobDraftRecord {
    return {
      id: row.id,
      creatorUserId: row.creator_user_id,
      clientId: row.client_id,
      sourceBookingRequestId: row.source_booking_request_id,
      portfolioId: row.portfolio_id,
      title: row.title,
      eventType: row.event_type,
      status: row.status,
      requestedSlots,
      requesterSnapshot: {
        clientName: row.requester_name_snapshot,
        clientEmail: row.requester_email_snapshot
      },
      eventNotes: row.event_notes,
      servicePackageNotes: row.service_package_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private getCanonicalUrl(handle: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

    return appUrl && handle ? `${appUrl}/${handle}` : undefined;
  }

  private throwPersistenceError(message: string): never {
    throw new InternalServerErrorException(message);
  }
}
