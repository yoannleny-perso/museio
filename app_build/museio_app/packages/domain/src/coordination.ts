import type {
  AvailabilityConflictCenterItem,
  AvailabilityConflictBlock,
  ConversationThreadRecord,
  MessageReadState,
  MessageRecord
} from "@museio/types";

export function toThreadPreview(body: string, maxLength = 96) {
  const trimmed = body.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export function sortThreadsByActivity(threads: ConversationThreadRecord[]) {
  return [...threads].sort((left, right) => {
    const leftTime = new Date(left.lastMessageAt ?? left.updatedAt).getTime();
    const rightTime = new Date(right.lastMessageAt ?? right.updatedAt).getTime();

    return rightTime - leftTime;
  });
}

export function countUnreadMessagesForCreator(
  messages: MessageRecord[],
  readState?: MessageReadState
) {
  const lastReadTime = readState?.lastReadAt
    ? new Date(readState.lastReadAt).getTime()
    : 0;

  return messages.filter((message) => {
    if (message.senderType === "creator") {
      return false;
    }

    return new Date(message.createdAt).getTime() > lastReadTime;
  }).length;
}

export function toConflictCenterItem(
  block: AvailabilityConflictBlock
): AvailabilityConflictCenterItem {
  return {
    id: block.id,
    source: block.source,
    provider: block.externalProvider,
    title: block.title,
    startsAt: block.startsAt,
    endsAt: block.endsAt,
    timezone: block.timezone,
    allDay: block.allDay,
    publicSafeLabel:
      block.source === "external-calendar"
        ? "Busy from connected calendar"
        : block.source === "booking-request"
          ? "Pending or active booking hold"
          : block.title
  };
}
