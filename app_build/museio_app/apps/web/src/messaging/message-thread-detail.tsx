"use client";

import { useEffect, useState } from "react";
import type { ConversationThreadDetailState } from "@museio/types";
import {
  Badge,
  Button,
  Card,
  Field,
  SectionShell,
  StatePanel,
  TextArea,
  tokens
} from "@museio/ui";
import { useAuth } from "../auth/auth-context";
import { getWebSupabaseClient } from "../lib/supabase";
import { createThreadMessage, fetchThreadDetail, markThreadRead } from "../lib/api";

function sanitizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not load the conversation.";
  }

  try {
    const parsed = JSON.parse(error.message) as { message?: string | string[] };
    return Array.isArray(parsed.message)
      ? parsed.message.join(" ")
      : parsed.message ?? error.message;
  } catch {
    return error.message;
  }
}

export function MessageThreadDetail({ threadId }: { threadId: string }) {
  const { getAccessToken, isLoading: isAuthLoading, session } = useAuth();
  const [state, setState] = useState<ConversationThreadDetailState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let active = true;

    async function load() {
      try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
          throw new Error("A valid session is required.");
        }

        const nextState = await fetchThreadDetail(accessToken, threadId);

        if (active) {
          setState(nextState);
        }

        if (nextState.thread.unreadCount > 0) {
          await markThreadRead(accessToken, threadId, {});

          if (active) {
            setState(await fetchThreadDetail(accessToken, threadId));
          }
        }
      } catch (error) {
        if (active) {
          setErrorMessage(sanitizeError(error));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [getAccessToken, isAuthLoading, threadId]);

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }

    const supabase = getWebSupabaseClient();
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`
        },
        async () => {
          const accessToken = await getAccessToken();

          if (!accessToken) {
            return;
          }

          setState(await fetchThreadDetail(accessToken, threadId));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [getAccessToken, session?.user.id, threadId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSending(true);
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("A valid session is required.");
      }

      const nextState = await createThreadMessage(accessToken, threadId, {
        body: draft
      });

      setState(nextState);
      setDraft("");
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading || isAuthLoading) {
    return (
      <StatePanel
        kind="loading"
        title="Loading thread"
        description="Fetching messages, participants, and read state."
      />
    );
  }

  if (!state) {
    return (
      <StatePanel
        kind="error"
        title="Could not load thread"
        description={errorMessage ?? "The conversation thread could not be loaded."}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionShell
        eyebrow="Messaging"
        title={state.thread.subject}
        description="Keep coordination attached to the real client and linked workflow context so next steps stay legible beside the rest of the business."
        actions={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="accent">{state.thread.status}</Badge>
            {state.thread.linkedContext ? <Badge>{state.thread.linkedContext.type}</Badge> : null}
          </div>
        }
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div className="museio-metric-grid">
            <Card tone="accent" style={{ padding: 18 }}>
              <span className="museio-caption">Participants</span>
              <div style={{ marginTop: 8, fontSize: "1.28rem", fontWeight: 700 }}>
                {state.thread.participants.length}
              </div>
            </Card>
            <Card tone="default" style={{ padding: 18 }}>
              <span className="museio-caption">Linked context</span>
              <div style={{ marginTop: 8, fontSize: "1.28rem", fontWeight: 700 }}>
                {state.thread.linkedContext?.type ?? "Standalone"}
              </div>
            </Card>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {state.thread.participants.map((participant) => (
              <Badge key={participant.id}>{participant.displayName}</Badge>
            ))}
          </div>
          {state.messages.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No messages yet"
              description="This thread is ready for the first creator-to-client coordination message."
            />
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {state.messages.map((message) => (
                <Card key={message.id} tone={message.senderType === "creator" ? "accent" : "muted"}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Badge tone={message.senderType === "creator" ? "accent" : "success"}>
                        {message.senderType}
                      </Badge>
                      <span style={{ color: tokens.color.textMuted }}>
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span style={{ color: tokens.color.text, lineHeight: 1.7 }}>
                      {message.body}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <Card tone="muted">
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
              <Field label="Reply">
                <TextArea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Share timing, next steps, document requests, or invoice follow-up."
                />
              </Field>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" disabled={isSending || !draft.trim()}>
                  {isSending ? "Sending…" : "Send Message"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </SectionShell>
    </div>
  );
}
