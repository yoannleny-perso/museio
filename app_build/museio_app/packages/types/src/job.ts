import type {
  BookingRequesterContact,
  RequestedDateTimeSlotBlock
} from "./booking.js";

export type JobStatus =
  | "draft"
  | "quote-prep"
  | "quoted"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "archived";

export interface JobDraftRecord {
  id: string;
  creatorUserId: string;
  clientId: string;
  sourceBookingRequestId: string;
  portfolioId: string;
  title: string;
  eventType: string;
  status: JobStatus;
  requestedSlots: RequestedDateTimeSlotBlock[];
  requesterSnapshot: BookingRequesterContact;
  eventNotes: string;
  servicePackageNotes: string;
  createdAt: string;
  updatedAt: string;
}
