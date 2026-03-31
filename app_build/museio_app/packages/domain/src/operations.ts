import type { BookingDecisionAction, BookingRequestStatus, JobStatus } from "@museio/types";

export const bookingDecisionActions = [
  "mark-under-review",
  "decline",
  "accept-into-job-draft",
  "archive"
] as const;

export const jobStatuses = [
  "draft",
  "quote-prep",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
  "archived"
] as const;

const bookingDecisionTransitionMap: Record<
  BookingRequestStatus,
  BookingDecisionAction[]
> = {
  submitted: ["mark-under-review", "accept-into-job-draft", "decline", "archive"],
  "under-review": ["accept-into-job-draft", "decline", "archive"],
  accepted: ["archive"],
  declined: ["archive"],
  archived: []
};

export function getAllowedBookingDecisionActions(status: BookingRequestStatus) {
  return [...bookingDecisionTransitionMap[status]];
}

export function getBookingStatusForDecision(
  action: BookingDecisionAction
): BookingRequestStatus {
  switch (action) {
    case "mark-under-review":
      return "under-review";
    case "decline":
      return "declined";
    case "accept-into-job-draft":
      return "accepted";
    case "archive":
      return "archived";
  }
}

export function getInitialJobStatus(): JobStatus {
  return "draft";
}
