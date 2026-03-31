"use client";

import { useMemo, useState } from "react";
import type {
  CreatePublicBookingRequestInput,
  PublicBookingPageState
} from "@museio/types";
import {
  Badge,
  Button,
  Card,
  Field,
  StatePanel,
  TextArea,
  TextInput,
  tokens
} from "@museio/ui";
import { createPublicBookingRequest } from "../lib/api";

function sanitizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not submit the booking request.";
  }

  try {
    const parsed = JSON.parse(error.message) as { message?: string | string[] };
    const nextMessage = Array.isArray(parsed.message)
      ? parsed.message.join(" ")
      : parsed.message;

    return nextMessage ?? error.message;
  } catch {
    return error.message;
  }
}

function toLocalDateTimeValue(isoString: string) {
  const date = new Date(isoString);
  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function PublicBookingForm({
  handle,
  initialState
}: {
  handle: string;
  initialState: PublicBookingPageState;
}) {
  const [state, setState] = useState(initialState);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventNotes, setEventNotes] = useState("");
  const [servicePackageNotes, setServicePackageNotes] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [timezone, setTimezone] = useState(
    initialState.availability[0]?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone ??
      "Australia/Sydney"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [didSubmit, setDidSubmit] = useState(false);

  const hasAvailability = state.availability.some((day) => day.windows.length > 0);
  const nextWindows = useMemo(
    () =>
      state.availability.flatMap((day) =>
        day.windows.map((window) => ({
          ...window,
          date: day.date,
          timezone: day.timezone
        }))
      ),
    [state.availability]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: CreatePublicBookingRequestInput = {
        requester: {
          clientName,
          clientEmail
        },
        eventType,
        eventNotes,
        servicePackageNotes,
        requestedSlots: [
          {
            startsAt: new Date(startsAt).toISOString(),
            endsAt: new Date(endsAt).toISOString(),
            timezone
          }
        ]
      };
      const nextState = await createPublicBookingRequest(handle, payload);
      setState(nextState);
      setDidSubmit(true);
      setClientName("");
      setClientEmail("");
      setEventType("");
      setEventNotes("");
      setServicePackageNotes("");
      setStartsAt("");
      setEndsAt("");
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 20
      }}
    >
      <Card>
        <div
          style={{
            display: "grid",
            gap: 14
          }}
        >
          <Badge tone="accent">Public Booking</Badge>
          <div style={{ display: "grid", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: "2rem", color: tokens.color.text }}>
              Book {state.creator.artistName}
            </h2>
            <p
              style={{
                margin: 0,
                color: tokens.color.textMuted,
                lineHeight: 1.7
              }}
            >
              {state.creator.shortBio ||
                "Tell the creator what you are planning and request a concrete slot."}
            </p>
          </div>
        </div>
      </Card>

      {didSubmit ? (
        <StatePanel
          kind="loading"
          title="Booking request submitted"
          description="The request is now in the creator inbox with a submitted status. The creator can review, accept, decline, or archive it from their protected workspace."
        />
      ) : null}

      {!hasAvailability ? (
        <StatePanel
          kind="empty"
          title="Booking is not open right now"
          description="This public portfolio is live, but there are no public-safe availability windows exposed yet. The creator needs to configure availability before new requests can be submitted."
        />
      ) : null}

      <Card tone="muted">
        <div style={{ display: "grid", gap: 14 }}>
          <h3 style={{ margin: 0, color: tokens.color.text }}>Availability Preview</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {state.availability.slice(0, 6).map((day) => (
              <div
                key={day.date}
                style={{
                  borderRadius: tokens.radius.md,
                  border: `1px solid ${tokens.color.border}`,
                  padding: 16,
                  background: tokens.color.surface
                }}
              >
                <strong style={{ display: "block", marginBottom: 10 }}>{day.date}</strong>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {day.windows.map((window) => (
                    <button
                      key={window.startsAt}
                      type="button"
                      onClick={() => {
                        setStartsAt(toLocalDateTimeValue(window.startsAt));
                        setEndsAt(toLocalDateTimeValue(window.endsAt));
                        setTimezone(day.timezone);
                      }}
                      style={{
                        borderRadius: tokens.radius.pill,
                        border: `1px solid ${tokens.color.border}`,
                        background: tokens.color.surfaceMuted,
                        color: tokens.color.text,
                        padding: "8px 12px",
                        cursor: "pointer"
                      }}
                    >
                      {window.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {nextWindows.length === 0 ? (
              <span style={{ color: tokens.color.textMuted }}>
                No public windows are currently exposed.
              </span>
            ) : null}
          </div>
        </div>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
            }}
          >
            <Field label="Client Name">
              <TextInput
                required
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="Venue or client contact"
              />
            </Field>
            <Field label="Client Email">
              <TextInput
                required
                type="email"
                value={clientEmail}
                onChange={(event) => setClientEmail(event.target.value)}
                placeholder="client@example.com"
              />
            </Field>
          </div>

          <Field label="Event Type">
            <TextInput
              required
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              placeholder="Festival, private event, residency"
            />
          </Field>

          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
            }}
          >
            <Field label="Requested Start">
              <TextInput
                required
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </Field>
            <Field label="Requested End">
              <TextInput
                required
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Timezone"
            hint="Stored explicitly so future multi-slot and external calendar overlays stay consistent."
          >
            <TextInput
              required
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              placeholder="Australia/Sydney"
            />
          </Field>

          <Field label="Event Notes">
            <TextArea
              value={eventNotes}
              onChange={(event) => setEventNotes(event.target.value)}
              placeholder="Tell the creator about the venue, audience, and format."
            />
          </Field>

          <Field label="Service / Package Notes">
            <TextArea
              value={servicePackageNotes}
              onChange={(event) => setServicePackageNotes(event.target.value)}
              placeholder="Mention package expectations, technical requirements, or service-level notes."
            />
          </Field>

          {errorMessage ? (
            <StatePanel
              kind="error"
              title="Could not submit the request"
              description={errorMessage}
            />
          ) : null}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button disabled={!hasAvailability || isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit Booking Request"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
