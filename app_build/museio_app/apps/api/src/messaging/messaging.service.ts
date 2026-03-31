import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import {
  countUnreadMessagesForCreator,
  sortThreadsByActivity,
  toThreadPreview
} from "@museio/domain";
import type {
  ConversationParticipant,
  ConversationThreadDetailState,
  ConversationThreadRecord,
  CreateConversationThreadInput,
  CreateMessageInput,
  CreatorMessagingState,
  LinkedEntityContext,
  MessageReadState,
  MessageRecord,
  UpdateClientProfileInput
} from "@museio/types";
import {
  createConversationThreadInputSchema,
  createMessageInputSchema,
  markThreadReadInputSchema
} from "@museio/validation";
import { SupabaseService } from "../supabase/supabase.service";

interface ClientRow {
  id: string;
  creator_user_id: string;
  display_name: string;
  primary_email: string;
}

interface ThreadRow {
  id: string;
  creator_user_id: string;
  client_id: string;
  status: "open" | "archived";
  subject: string;
  linked_entity_type: "booking-request" | "job" | "invoice" | "client" | null;
  linked_entity_id: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ParticipantRow {
  id: string;
  thread_id: string;
  creator_user_id: string;
  participant_type: "creator" | "client" | "system";
  user_id: string | null;
  client_id: string | null;
  email_snapshot: string | null;
  display_name: string;
  created_at: string;
}

interface MessageRow {
  id: string;
  thread_id: string;
  creator_user_id: string;
  sender_type: "creator" | "client" | "system";
  sender_user_id: string | null;
  sender_client_id: string | null;
  body: string;
  client_visible: boolean;
  metadata: Record<string, string | number | boolean | null> | null;
  created_at: string;
}

interface ReadStateRow {
  id: string;
  thread_id: string;
  creator_user_id: string;
  participant_type: "creator" | "client" | "system";
  participant_user_id: string | null;
  participant_client_id: string | null;
  last_read_message_id: string | null;
  last_read_at: string | null;
}

@Injectable()
export class MessagingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getCreatorMessagingState(
    accessToken?: string | null
  ): Promise<CreatorMessagingState> {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const rows = await this.fetchThreadsForCreator(user.id);

    return {
      threads: await this.mapThreadsWithRelations(rows, user.id)
    };
  }

  async getThreadDetail(
    threadId: string,
    accessToken?: string | null
  ): Promise<ConversationThreadDetailState> {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const thread = await this.fetchThreadForCreator(threadId, user.id);

    return this.buildThreadDetail(thread, user.id);
  }

  async createConversationThread(
    payload: CreateConversationThreadInput,
    accessToken?: string | null
  ): Promise<ConversationThreadDetailState> {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const parsed = createConversationThreadInputSchema.parse(payload);
    const client = await this.fetchClient(parsed.clientId, user.id);

    if (
      parsed.linkedContext?.type === "client" &&
      parsed.linkedContext.id !== parsed.clientId
    ) {
      throw new BadRequestException(
        "Client-linked conversation context must point at the same client."
      );
    }

    await this.ensureLinkedContextOwnership(parsed.linkedContext, user.id);

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("conversation_threads")
      .insert({
        creator_user_id: user.id,
        client_id: client.id,
        status: "open",
        subject: parsed.subject.trim(),
        linked_entity_type: parsed.linkedContext?.type ?? null,
        linked_entity_id: parsed.linkedContext?.id ?? null
      })
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const thread = data as ThreadRow;

    const { error: participantError } = await this.supabaseService
      .getAdminClient()
      .from("conversation_thread_participants")
      .insert([
        {
          thread_id: thread.id,
          creator_user_id: user.id,
          participant_type: "creator",
          user_id: user.id,
          email_snapshot: user.email ?? null,
          display_name: this.toCreatorDisplayName(user.email)
        },
        {
          thread_id: thread.id,
          creator_user_id: user.id,
          participant_type: "client",
          client_id: client.id,
          email_snapshot: client.primary_email,
          display_name: client.display_name
        }
      ]);

    if (participantError) {
      throw new InternalServerErrorException(participantError.message);
    }

    const { error: readStateError } = await this.supabaseService
      .getAdminClient()
      .from("message_read_states")
      .insert({
        thread_id: thread.id,
        creator_user_id: user.id,
        participant_type: "creator",
        participant_user_id: user.id
      });

    if (readStateError) {
      throw new InternalServerErrorException(readStateError.message);
    }

    return this.buildThreadDetail(thread, user.id);
  }

  async createMessage(
    threadId: string,
    payload: CreateMessageInput,
    accessToken?: string | null
  ): Promise<ConversationThreadDetailState> {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const parsed = createMessageInputSchema.parse(payload);
    const thread = await this.fetchThreadForCreator(threadId, user.id);
    const now = new Date().toISOString();

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("messages")
      .insert({
        thread_id: thread.id,
        creator_user_id: user.id,
        sender_type: "creator",
        sender_user_id: user.id,
        body: parsed.body.trim(),
        client_visible: true
      })
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const message = data as MessageRow;

    const { error: threadError } = await this.supabaseService
      .getAdminClient()
      .from("conversation_threads")
      .update({
        last_message_preview: toThreadPreview(message.body),
        last_message_at: message.created_at
      })
      .eq("id", thread.id)
      .eq("creator_user_id", user.id);

    if (threadError) {
      throw new InternalServerErrorException(threadError.message);
    }

    await this.saveCreatorReadState(thread.id, user.id, {
      lastReadAt: message.created_at,
      lastReadMessageId: message.id
    });

    const { error: clientError } = await this.supabaseService
      .getAdminClient()
      .from("clients")
      .update({
        last_contacted_at: now
      } satisfies Partial<UpdateClientProfileInput> & { last_contacted_at: string })
      .eq("id", thread.client_id)
      .eq("creator_user_id", user.id);

    if (clientError) {
      throw new InternalServerErrorException(clientError.message);
    }

    const { error: timelineError } = await this.supabaseService
      .getAdminClient()
      .from("client_timeline_events")
      .insert({
        creator_user_id: user.id,
        client_id: thread.client_id,
        event_type: "message-sent",
        summary: "Creator sent a client message.",
        linked_entity_type: "thread",
        linked_entity_id: thread.id,
        metadata: {
          threadId: thread.id
        }
      });

    if (timelineError) {
      throw new InternalServerErrorException(timelineError.message);
    }

    return this.getThreadDetail(thread.id, accessToken);
  }

  async markThreadRead(
    threadId: string,
    payload: { messageId?: string },
    accessToken?: string | null
  ): Promise<ConversationThreadDetailState> {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    markThreadReadInputSchema.parse(payload);
    const thread = await this.fetchThreadForCreator(threadId, user.id);
    const messages = await this.fetchMessagesByThreadIds([thread.id]);
    const latestMessage = payload.messageId
      ? messages.find((message) => message.id === payload.messageId)
      : messages.at(-1);

    await this.saveCreatorReadState(thread.id, user.id, {
      lastReadAt: latestMessage?.created_at ?? new Date().toISOString(),
      lastReadMessageId: latestMessage?.id
    });

    return this.getThreadDetail(thread.id, accessToken);
  }

  private async mapThreadsWithRelations(rows: ThreadRow[], creatorUserId: string) {
    const threadIds = rows.map((row) => row.id);
    const [participants, messages, readStates] = await Promise.all([
      this.fetchParticipantsByThreadIds(threadIds),
      this.fetchMessagesByThreadIds(threadIds),
      this.fetchCreatorReadStatesByThreadIds(threadIds, creatorUserId)
    ]);

    const participantsByThread = this.groupByThread(participants);
    const messagesByThread = this.groupByThread(messages);
    const readStateByThread = new Map(readStates.map((row) => [row.thread_id, row]));

    const mapped = rows.map((row) =>
      this.mapThread(
        row,
        participantsByThread.get(row.id) ?? [],
        messagesByThread.get(row.id) ?? [],
        readStateByThread.get(row.id)
      )
    );

    return sortThreadsByActivity(mapped);
  }

  private async buildThreadDetail(thread: ThreadRow, creatorUserId: string) {
    const [participants, messages, readState] = await Promise.all([
      this.fetchParticipantsByThreadIds([thread.id]),
      this.fetchMessagesByThreadIds([thread.id]),
      this.fetchCreatorReadState(thread.id, creatorUserId)
    ]);

    return {
      thread: this.mapThread(thread, participants, messages, readState),
      messages: messages.map((message) => this.mapMessage(message)),
      readState: readState ? this.mapReadState(readState) : undefined
    };
  }

  private async fetchThreadsForCreator(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("conversation_threads")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as ThreadRow[];
  }

  private async fetchThreadForCreator(threadId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("conversation_threads")
      .select("*")
      .eq("id", threadId)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException("The requested conversation thread was not found.");
    }

    return data as ThreadRow;
  }

  private async fetchParticipantsByThreadIds(threadIds: string[]) {
    if (threadIds.length === 0) {
      return [] as ParticipantRow[];
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("conversation_thread_participants")
      .select("*")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as ParticipantRow[];
  }

  private async fetchMessagesByThreadIds(threadIds: string[]) {
    if (threadIds.length === 0) {
      return [] as MessageRow[];
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("messages")
      .select("*")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as MessageRow[];
  }

  private async fetchCreatorReadStatesByThreadIds(
    threadIds: string[],
    creatorUserId: string
  ) {
    if (threadIds.length === 0) {
      return [] as ReadStateRow[];
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("message_read_states")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .eq("participant_type", "creator")
      .eq("participant_user_id", creatorUserId)
      .in("thread_id", threadIds);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as ReadStateRow[];
  }

  private async fetchCreatorReadState(threadId: string, creatorUserId: string) {
    const states = await this.fetchCreatorReadStatesByThreadIds([threadId], creatorUserId);
    return states[0];
  }

  private async saveCreatorReadState(
    threadId: string,
    creatorUserId: string,
    params: { lastReadAt: string; lastReadMessageId?: string }
  ) {
    const existing = await this.fetchCreatorReadState(threadId, creatorUserId);

    if (existing) {
      const { error } = await this.supabaseService
        .getAdminClient()
        .from("message_read_states")
        .update({
          last_read_at: params.lastReadAt,
          last_read_message_id: params.lastReadMessageId ?? null
        })
        .eq("id", existing.id)
        .eq("creator_user_id", creatorUserId);

      if (error) {
        throw new InternalServerErrorException(error.message);
      }

      return;
    }

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("message_read_states")
      .insert({
        thread_id: threadId,
        creator_user_id: creatorUserId,
        participant_type: "creator",
        participant_user_id: creatorUserId,
        last_read_at: params.lastReadAt,
        last_read_message_id: params.lastReadMessageId ?? null
      });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async fetchClient(clientId: string, creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("clients")
      .select("id, creator_user_id, display_name, primary_email")
      .eq("id", clientId)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException("The selected client was not found.");
    }

    return data as ClientRow;
  }

  private async ensureLinkedContextOwnership(
    linkedContext: LinkedEntityContext | undefined,
    creatorUserId: string
  ) {
    if (!linkedContext) {
      return;
    }

    const tableByType = {
      "booking-request": "booking_requests",
      job: "jobs",
      invoice: "invoices",
      client: "clients"
    } as const;

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from(tableByType[linkedContext.type])
      .select("id")
      .eq("id", linkedContext.id)
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException(
        "The linked context could not be found for this creator."
      );
    }
  }

  private groupByThread<T extends { thread_id: string }>(rows: T[]) {
    const map = new Map<string, T[]>();

    for (const row of rows) {
      const current = map.get(row.thread_id) ?? [];
      current.push(row);
      map.set(row.thread_id, current);
    }

    return map;
  }

  private mapThread(
    row: ThreadRow,
    participants: ParticipantRow[],
    messages: MessageRow[],
    readState?: ReadStateRow
  ): ConversationThreadRecord {
    return {
      id: row.id,
      creatorUserId: row.creator_user_id,
      clientId: row.client_id,
      status: row.status,
      subject: row.subject,
      linkedContext:
        row.linked_entity_type && row.linked_entity_id
          ? {
              type: row.linked_entity_type,
              id: row.linked_entity_id
            }
          : undefined,
      participants: participants.map((participant) => this.mapParticipant(participant)),
      lastMessagePreview: row.last_message_preview ?? undefined,
      lastMessageAt: row.last_message_at ?? undefined,
      unreadCount: countUnreadMessagesForCreator(
        messages.map((message) => this.mapMessage(message)),
        readState ? this.mapReadState(readState) : undefined
      ),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapParticipant(row: ParticipantRow): ConversationParticipant {
    return {
      id: row.id,
      threadId: row.thread_id,
      participantType: row.participant_type,
      userId: row.user_id ?? undefined,
      clientId: row.client_id ?? undefined,
      emailSnapshot: row.email_snapshot ?? undefined,
      displayName: row.display_name,
      createdAt: row.created_at
    };
  }

  private mapMessage(row: MessageRow): MessageRecord {
    return {
      id: row.id,
      threadId: row.thread_id,
      creatorUserId: row.creator_user_id,
      senderType: row.sender_type,
      senderUserId: row.sender_user_id ?? undefined,
      senderClientId: row.sender_client_id ?? undefined,
      body: row.body,
      clientVisible: row.client_visible,
      metadata: row.metadata ?? undefined,
      createdAt: row.created_at
    };
  }

  private mapReadState(row: ReadStateRow): MessageReadState {
    return {
      id: row.id,
      threadId: row.thread_id,
      participantType: row.participant_type,
      participantUserId: row.participant_user_id ?? undefined,
      participantClientId: row.participant_client_id ?? undefined,
      lastReadMessageId: row.last_read_message_id ?? undefined,
      lastReadAt: row.last_read_at ?? undefined
    };
  }

  private toCreatorDisplayName(email?: string | null) {
    return email?.split("@")[0] ?? "Museio creator";
  }
}
