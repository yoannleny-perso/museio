import type { ClientRecord } from "./client.js";
import type { JobDraftRecord } from "./job.js";

export type BookingRequestStatus =
  | "submitted"
  | "under-review"
  | "accepted"
  | "declined"
  | "archived";

export type AvailabilityBlockSource =
  | "manual"
  | "vacation"
  | "external-calendar"
  | "booking-request";

export type ExternalCalendarProvider =
  | "google-calendar"
  | "calendly"
  | "manual-import";

export type BookingDecisionAction =
  | "mark-under-review"
  | "decline"
  | "accept-into-job-draft"
  | "archive";

export type BookingTimelineEventType =
  | "submitted"
  | "status-changed"
  | "internal-note-added"
  | "client-linked"
  | "job-draft-created";

export interface BookingRequesterContact {
  clientName: string;
  clientEmail: string;
}

export interface RequestedDateTimeSlotBlock {
  id: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
}

export interface RequestedDateTimeSlotBlockInput {
  startsAt: string;
  endsAt: string;
  timezone: string;
}

export interface CreatorAvailabilityRule {
  id: string;
  weekday: number;
  startsAtMinute: number;
  endsAtMinute: number;
  timezone: string;
}

export interface CreatorAvailabilityRuleInput {
  weekday: number;
  startsAtMinute: number;
  endsAtMinute: number;
  timezone: string;
}

export interface AvailabilityConflictBlock {
  id: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  source: AvailabilityBlockSource;
  title: string;
  notes?: string;
  allDay: boolean;
  externalProvider?: ExternalCalendarProvider;
}

export interface CreatorUnavailableBlockInput {
  id?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  title: string;
  notes?: string;
  allDay?: boolean;
  source?: Extract<AvailabilityBlockSource, "manual" | "vacation">;
}

export interface AvailabilityWindow {
  startsAt: string;
  endsAt: string;
  label: string;
}

export interface PublicAvailabilityDay {
  date: string;
  timezone: string;
  windows: AvailabilityWindow[];
}

export interface PublicBookingCreator {
  creatorUserId: string;
  portfolioId: string;
  handle: string;
  artistName: string;
  shortBio: string;
  portraitUrl?: string;
  canonicalUrl?: string;
}

export interface BookingRequestRecord {
  id: string;
  creatorUserId: string;
  portfolioId: string;
  portfolioHandle: string;
  requester: BookingRequesterContact;
  eventType: string;
  eventNotes: string;
  servicePackageNotes: string;
  requestedSlots: RequestedDateTimeSlotBlock[];
  status: BookingRequestStatus;
  clientId?: string;
  jobDraftId?: string;
  convertedToJobAt?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface BookingInboxListItem {
  id: string;
  status: BookingRequestStatus;
  clientName: string;
  eventType: string;
  requestedSlots: RequestedDateTimeSlotBlock[];
  client?: ClientRecord;
  jobDraft?: JobDraftRecord;
  submittedAt: string;
}

export interface CreatorAvailabilityState {
  rules: CreatorAvailabilityRule[];
  unavailableBlocks: AvailabilityConflictBlock[];
  externalBlocks: AvailabilityConflictBlock[];
  publicAvailability: PublicAvailabilityDay[];
}

export interface CreatorBookingInboxState {
  creator?: PublicBookingCreator;
  isConfigured: boolean;
  availability: CreatorAvailabilityState;
  requests: BookingInboxListItem[];
}

export interface CreatorBookingRequestDetail {
  creator: PublicBookingCreator;
  availability: CreatorAvailabilityState;
  request: BookingRequestRecord;
  internalNotes: BookingInternalNote[];
  timeline: BookingTimelineEvent[];
  client?: ClientRecord;
  jobDraft?: JobDraftRecord;
  availableDecisionActions: BookingDecisionAction[];
}

export interface PublicBookingPageState {
  creator: PublicBookingCreator;
  availability: PublicAvailabilityDay[];
  requestStatusOptions: BookingRequestStatus[];
}

export interface CreatePublicBookingRequestInput {
  requester: BookingRequesterContact;
  eventType: string;
  eventNotes: string;
  servicePackageNotes: string;
  requestedSlots: RequestedDateTimeSlotBlockInput[];
}

export interface UpdateCreatorAvailabilityInput {
  rules: CreatorAvailabilityRuleInput[];
  unavailableBlocks: CreatorUnavailableBlockInput[];
}

export interface UpdateBookingRequestStatusInput {
  status: Exclude<BookingRequestStatus, "submitted">;
}

export interface BookingInternalNote {
  id: string;
  bookingRequestId: string;
  creatorUserId: string;
  body: string;
  createdByUserId: string;
  createdAt: string;
}

export interface BookingTimelineEvent {
  id: string;
  bookingRequestId: string;
  creatorUserId: string;
  type: BookingTimelineEventType;
  summary: string;
  actorUserId?: string;
  fromStatus?: BookingRequestStatus;
  toStatus?: BookingRequestStatus;
  clientId?: string;
  jobDraftId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface BookingDecisionResult {
  request: BookingRequestRecord;
  client?: ClientRecord;
  jobDraft?: JobDraftRecord;
  timelineEvent: BookingTimelineEvent;
}

export interface ApplyBookingDecisionInput {
  action: BookingDecisionAction;
  note?: string;
}

export interface CreateBookingInternalNoteInput {
  body: string;
}
