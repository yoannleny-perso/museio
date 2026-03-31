"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CreatorClientsState, CreatorMessagingState } from "@museio/types";
import {
  Badge,
  Button,
  Card,
  Field,
  SectionShell,
  SelectField,
  StatePanel,
  TextInput,
  tokens
} from "@museio/ui";
import { useAuth } from "../auth/auth-context";
import { getWebSupabaseClient } from "../lib/supabase";
import {
  createConversationThread,
  fetchCreatorClients,
  fetchCreatorMessagingState
} from "../lib/api";

function sanitizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not load messaging.";
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

export function MessagesWorkspace() {
  const { getAccessToken, isLoading: isAuthLoading, session } = useAuth();
  const [state, setState] = useState<CreatorMessagingState | null>(null);
  const [clients, setClients] = useState<CreatorClientsState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    subject: ""
  });

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

        const [threads, clientState] = await Promise.all([
          fetchCreatorMessagingState(accessToken),
          fetchCreatorClients(accessToken)
        ]);

        if (active) {
          setState(threads);
          setClients(clientState);
          setForm((current) => ({
            ...current,
            clientId: current.clientId || clientState.clients[0]?.client.id || ""
          }));
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
  }, [getAccessToken, isAuthLoading]);

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }

    const supabase = getWebSupabaseClient();
    const channel = supabase
      .channel(`creator-messages-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_threads",
          filter: `creator_user_id=eq.${session.user.id}`
        },
        async () => {
          const accessToken = await getAccessToken();

          if (!accessToken) {
            return;
          }

          setState(await fetchCreatorMessagingState(accessToken));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [getAccessToken, session?.user.id]);

  async function handleCreateThread(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setCreating(true);
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("A valid session is required.");
      }

      await createConversationThread(accessToken, {
        clientId: form.clientId,
        subject: form.subject
      });

      setState(await fetchCreatorMessagingState(accessToken));
      setForm((current) => ({ ...current, subject: "" }));
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setCreating(false);
    }
  }

  if (isLoading || isAuthLoading) {
    return (
      <StatePanel
        kind="loading"
        title="Loading messages"
        description="Fetching creator threads, clients, and read state."
      />
    );
  }

  if (!state || !clients) {
    return (
      <StatePanel
        kind="error"
        title="Could not load messaging"
        description={errorMessage ?? "The messaging workspace could not be loaded."}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionShell
        eyebrow="Coordination"
        title="Messages"
        actions={<Badge tone="accent">{state.threads.length} threads</Badge>}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
            Messaging stays linked to real clients and commercial context so the
            creator can coordinate without losing the booking, job, or invoice trail.
          </p>
          <Card tone="muted">
            <form onSubmit={handleCreateThread} style={{ display: "grid", gap: 12 }}>
              <strong>Start a client thread</strong>
              <Field label="Client">
                <SelectField
                  value={form.clientId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, clientId: event.target.value }))
                  }
                >
                  {clients.clients.map((entry) => (
                    <option key={entry.client.id} value={entry.client.id}>
                      {entry.client.displayName}
                    </option>
                  ))}
                </SelectField>
              </Field>
              <Field label="Subject">
                <TextInput
                  value={form.subject}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, subject: event.target.value }))
                  }
                  placeholder="Event planning, invoice follow-up, or timeline check-in"
                />
              </Field>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" disabled={creating || !form.clientId || !form.subject.trim()}>
                  {creating ? "Starting…" : "Start Thread"}
                </Button>
              </div>
            </form>
          </Card>
          {state.threads.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No conversations yet"
              description="Start a thread from an existing client once you want booking, job, or invoice follow-up to live inside Museio."
            />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {state.threads.map((thread) => {
                const client = clients.clients.find(
                  (entry) => entry.client.id === thread.clientId
                )?.client;

                return (
                  <Card key={thread.id} tone="muted">
                    <div style={{ display: "grid", gap: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <Badge tone="accent">{thread.status}</Badge>
                          {thread.unreadCount > 0 ? (
                            <Badge tone="warning">{thread.unreadCount} unread</Badge>
                          ) : null}
                          {thread.linkedContext ? (
                            <Badge>{thread.linkedContext.type}</Badge>
                          ) : null}
                        </div>
                        <Link href={`/app/messages/${thread.id}`} style={{ textDecoration: "none" }}>
                          <Button variant="secondary">Open Thread</Button>
                        </Link>
                      </div>
                      <strong>{thread.subject}</strong>
                      <span style={{ color: tokens.color.textMuted }}>
                        {client?.displayName ?? "Unknown client"} ·{" "}
                        {thread.lastMessageAt
                          ? new Date(thread.lastMessageAt).toLocaleString()
                          : "No messages yet"}
                      </span>
                      <span style={{ color: tokens.color.text }}>
                        {thread.lastMessagePreview || "The thread is ready for the first message."}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </SectionShell>
    </div>
  );
}
