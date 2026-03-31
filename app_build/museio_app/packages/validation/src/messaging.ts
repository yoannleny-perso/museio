import { z } from "zod";

export const linkedEntityContextTypeSchema = z.enum([
  "booking-request",
  "job",
  "invoice",
  "client"
]);

export const conversationParticipantTypeSchema = z.enum([
  "creator",
  "client",
  "system"
]);

export const conversationThreadStatusSchema = z.enum(["open", "archived"]);

export const linkedEntityContextSchema = z.object({
  type: linkedEntityContextTypeSchema,
  id: z.string().min(1)
});

export const conversationParticipantSchema = z.object({
  id: z.string().min(1),
  threadId: z.string().min(1),
  participantType: conversationParticipantTypeSchema,
  userId: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
  emailSnapshot: z.string().email().optional(),
  displayName: z.string().min(1),
  createdAt: z.string().datetime()
});

export const messageReadStateSchema = z.object({
  id: z.string().min(1),
  threadId: z.string().min(1),
  participantType: conversationParticipantTypeSchema,
  participantUserId: z.string().min(1).optional(),
  participantClientId: z.string().min(1).optional(),
  lastReadMessageId: z.string().min(1).optional(),
  lastReadAt: z.string().datetime().optional()
});

export const messageRecordSchema = z.object({
  id: z.string().min(1),
  threadId: z.string().min(1),
  creatorUserId: z.string().min(1),
  senderType: conversationParticipantTypeSchema,
  senderUserId: z.string().min(1).optional(),
  senderClientId: z.string().min(1).optional(),
  body: z.string().min(1),
  clientVisible: z.boolean(),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  createdAt: z.string().datetime()
});

export const conversationThreadRecordSchema = z.object({
  id: z.string().min(1),
  creatorUserId: z.string().min(1),
  clientId: z.string().min(1),
  status: conversationThreadStatusSchema,
  subject: z.string().min(1),
  linkedContext: linkedEntityContextSchema.optional(),
  participants: z.array(conversationParticipantSchema),
  lastMessagePreview: z.string().optional(),
  lastMessageAt: z.string().datetime().optional(),
  unreadCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const messageRealtimeEventSchema = z.object({
  type: z.enum(["thread-upserted", "message-created", "thread-read"]),
  threadId: z.string().min(1),
  messageId: z.string().min(1).optional(),
  actorType: conversationParticipantTypeSchema.optional(),
  createdAt: z.string().datetime()
});

export const creatorMessagingStateSchema = z.object({
  threads: z.array(conversationThreadRecordSchema)
});

export const conversationThreadDetailStateSchema = z.object({
  thread: conversationThreadRecordSchema,
  messages: z.array(messageRecordSchema),
  readState: messageReadStateSchema.optional()
});

export const createConversationThreadInputSchema = z.object({
  clientId: z.string().min(1),
  subject: z.string().trim().min(1),
  linkedContext: linkedEntityContextSchema.optional()
});

export const createMessageInputSchema = z.object({
  body: z.string().trim().min(1)
});

export const markThreadReadInputSchema = z.object({
  messageId: z.string().min(1).optional()
});
