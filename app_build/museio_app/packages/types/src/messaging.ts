export type ConversationParticipantType = "creator" | "client" | "system";

export type ConversationThreadStatus = "open" | "archived";

export type LinkedEntityContextType =
  | "booking-request"
  | "job"
  | "invoice"
  | "client";

export type MessageRealtimeEventType =
  | "thread-upserted"
  | "message-created"
  | "thread-read";

export interface LinkedEntityContext {
  type: LinkedEntityContextType;
  id: string;
}

export interface ConversationParticipant {
  id: string;
  threadId: string;
  participantType: ConversationParticipantType;
  userId?: string;
  clientId?: string;
  emailSnapshot?: string;
  displayName: string;
  createdAt: string;
}

export interface MessageReadState {
  id: string;
  threadId: string;
  participantType: ConversationParticipantType;
  participantUserId?: string;
  participantClientId?: string;
  lastReadMessageId?: string;
  lastReadAt?: string;
}

export interface MessageRecord {
  id: string;
  threadId: string;
  creatorUserId: string;
  senderType: ConversationParticipantType;
  senderUserId?: string;
  senderClientId?: string;
  body: string;
  clientVisible: boolean;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface ConversationThreadRecord {
  id: string;
  creatorUserId: string;
  clientId: string;
  status: ConversationThreadStatus;
  subject: string;
  linkedContext?: LinkedEntityContext;
  participants: ConversationParticipant[];
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRealtimeEvent {
  type: MessageRealtimeEventType;
  threadId: string;
  messageId?: string;
  actorType?: ConversationParticipantType;
  createdAt: string;
}

export interface CreatorMessagingState {
  threads: ConversationThreadRecord[];
}

export interface ConversationThreadDetailState {
  thread: ConversationThreadRecord;
  messages: MessageRecord[];
  readState?: MessageReadState;
}

export interface CreateConversationThreadInput {
  clientId: string;
  subject: string;
  linkedContext?: LinkedEntityContext;
}

export interface CreateMessageInput {
  body: string;
}

export interface MarkThreadReadInput {
  messageId?: string;
}
