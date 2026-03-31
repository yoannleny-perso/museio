"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  BookingDecisionAction,
  CreatorBookingRequestDetail
} from "@museio/types";
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
import {
  applyBookingDecision,
  createBookingInternalNote,
  fetchCreatorBookingRequestDetail,
} from "../lib/api";

function sanitizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not load the booking request.";
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

export function BookingRequestDetail({ requestId }: { requestId: string }) {
  const { getAccessToken, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<CreatorBookingRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

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

        const detail = await fetchCreatorBookingRequestDetail(accessToken, requestId);

        if (!active) {
          return;
        }

        setState(detail);
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(sanitizeError(error));
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
  }, [getAccessToken, isAuthLoading, requestId]);

  async function handleDecision(action: BookingDecisionAction) {
    setIsUpdating(true);
    setErrorMessage(null);

    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("A valid session is required.");
      }

      const nextState = await applyBookingDecision(accessToken, requestId, {
        action,
        note: decisionNote.trim() || undefined
      });
      setState(nextState);
      setDecisionNote("");
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleCreateNote() {
    setIsSavingNote(true);
    setErrorMessage(null);

    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("A valid session is required.");
      }

      const nextState = await createBookingInternalNote(accessToken, requestId, {
        body: internalNote
      });
      setState(nextState);
      setInternalNote("");
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSavingNote(false);
    }
  }

  if (isLoading || isAuthLoading) {
    return (
      <StatePanel
        kind="loading"
        title="Loading request"
        description="Fetching creator-owned booking request detail."
      />
    );
  }

  if (!state) {
    return (
      <StatePanel
        kind="error"
        title="Could not load the request"
        description={errorMessage ?? "The booking request could not be loaded."}
      />
    );
  }

  const request = state.request;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionShell
        eyebrow="Creator Review"
        title={request.eventType}
        actions={
          <Link href="/app/bookings" style={{ textDecoration: "none" }}>
            <Button variant="secondary">Back To Inbox</Button>
          </Link>
        }
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge tone="accent">{request.status}</Badge>
            <Badge>{request.requester.clientName}</Badge>
            <Badge>{request.requester.clientEmail}</Badge>
            {state.client ? <Badge>Client linked</Badge> : null}
            {state.jobDraft ? <Badge tone="success">Job draft created</Badge> : null}
          </div>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
            }}
          >
            <Card tone="muted">
              <strong>Requested Slots</strong>
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                {request.requestedSlots.map((slot) => (
                  <span key={slot.id} style={{ color: tokens.color.textMuted }}>
                    {new Date(slot.startsAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}{" "}
                    to{" "}
                    {new Date(slot.endsAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}{" "}
                    ({slot.timezone})
                  </span>
                ))}
              </div>
            </Card>
            <Card tone="muted">
              <strong>Notes</strong>
              <p style={{ margin: "10px 0 0", color: tokens.color.textMuted }}>
                {request.eventNotes || "No event notes provided."}
              </p>
              <p style={{ margin: "10px 0 0", color: tokens.color.textMuted }}>
                {request.servicePackageNotes || "No package notes provided."}
              </p>
            </Card>
            <Card tone="muted">
              <strong>Operations State</strong>
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                <span style={{ color: tokens.color.textMuted }}>
                  {state.client
                    ? `Client: ${state.client.displayName} (${state.client.primaryEmail})`
                    : "Client: not linked yet"}
                </span>
                <span style={{ color: tokens.color.textMuted }}>
                  {state.jobDraft
                    ? `Job Draft: ${state.jobDraft.title} (${state.jobDraft.status})`
                    : "Job Draft: not created yet"}
                </span>
                <span style={{ color: tokens.color.textMuted }}>
                  {request.convertedToJobAt
                    ? `Converted: ${new Date(request.convertedToJobAt).toLocaleString()}`
                    : "Converted: not yet"}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </SectionShell>

      <SectionShell eyebrow="Status" title="Review Actions">
        <div style={{ display: "grid", gap: 16 }}>
          <Field label="Decision Note">
            <TextArea
              value={decisionNote}
              onChange={(event) => setDecisionNote(event.target.value)}
              placeholder="Optional creator-only context to save alongside this decision."
            />
          </Field>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {state.availableDecisionActions.includes("mark-under-review") ? (
              <Button
                disabled={isUpdating}
                onClick={() => void handleDecision("mark-under-review")}
              >
                Mark Under Review
              </Button>
            ) : null}
            {state.availableDecisionActions.includes("accept-into-job-draft") ? (
              <Button
                variant="secondary"
                disabled={isUpdating}
                onClick={() => void handleDecision("accept-into-job-draft")}
              >
                Accept Into Job Draft
              </Button>
            ) : null}
            {state.availableDecisionActions.includes("decline") ? (
              <Button
                variant="danger"
                disabled={isUpdating}
                onClick={() => void handleDecision("decline")}
              >
                Decline
              </Button>
            ) : null}
            {state.availableDecisionActions.includes("archive") ? (
              <Button
                variant="ghost"
                disabled={isUpdating}
                onClick={() => void handleDecision("archive")}
              >
                Archive
              </Button>
            ) : null}
          </div>
        </div>
        {errorMessage ? (
          <div style={{ marginTop: 16 }}>
            <StatePanel
              kind="error"
              title="Could not update status"
              description={errorMessage}
            />
          </div>
        ) : null}
      </SectionShell>

      <SectionShell eyebrow="Internal" title="Review Notes">
        <div style={{ display: "grid", gap: 16 }}>
          <Field label="Add Internal Note">
            <TextArea
              value={internalNote}
              onChange={(event) => setInternalNote(event.target.value)}
              placeholder="Creator-only notes for follow-up, fit, or client context."
            />
          </Field>
          <div>
            <Button
              disabled={isSavingNote || internalNote.trim().length === 0}
              onClick={() => void handleCreateNote()}
            >
              {isSavingNote ? "Saving…" : "Save Note"}
            </Button>
          </div>
          {state.internalNotes.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No internal notes yet"
              description="Internal review notes stay creator-only and do not change the public request history."
            />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {state.internalNotes.map((note) => (
                <Card key={note.id} tone="muted">
                  <strong style={{ display: "block", marginBottom: 8 }}>
                    {new Date(note.createdAt).toLocaleString()}
                  </strong>
                  <span style={{ color: tokens.color.textMuted }}>{note.body}</span>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SectionShell>

      <SectionShell eyebrow="Timeline" title="Booking Activity">
        {state.timeline.length === 0 ? (
          <StatePanel
            kind="empty"
            title="No activity yet"
            description="Status changes, client linkage, conversion, and internal note activity will appear here."
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {state.timeline.map((event) => (
              <Card key={event.id} tone="muted">
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Badge>{event.type}</Badge>
                    <span style={{ color: tokens.color.textMuted }}>
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <strong>{event.summary}</strong>
                  {event.fromStatus || event.toStatus ? (
                    <span style={{ color: tokens.color.textMuted }}>
                      {event.fromStatus ?? "none"} to {event.toStatus ?? "none"}
                    </span>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </SectionShell>
    </div>
  );
}
