"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  CreatorAvailabilityRule,
  CreatorBookingInboxState,
  CreatorUnavailableBlockInput,
  UpdateCreatorAvailabilityInput
} from "@museio/types";
import {
  Badge,
  Button,
  Card,
  Field,
  SectionShell,
  StatePanel,
  TextArea,
  TextInput,
  Toggle,
  tokens
} from "@museio/ui";
import { useAuth } from "../auth/auth-context";
import { fetchCreatorBookingInbox, saveCreatorAvailability } from "../lib/api";

type DayDraft = {
  weekday: number;
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
};

type BlockDraft = {
  id: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  title: string;
  notes: string;
  source: "manual" | "vacation";
};

function sanitizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not load the booking workspace.";
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

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function timeToMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":");

  return Number(hours) * 60 + Number(minutes);
}

function toLocalDateTimeValue(isoString: string) {
  const date = new Date(isoString);
  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function buildDayDrafts(rules: CreatorAvailabilityRule[]): DayDraft[] {
  const fallbackTimezone =
    rules[0]?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Australia/Sydney";

  return Array.from({ length: 7 }, (_, weekday) => {
    const matching = rules.find((rule) => rule.weekday === weekday);

    return {
      weekday,
      enabled: Boolean(matching),
      start: matching ? minutesToTime(matching.startsAtMinute) : "10:00",
      end: matching ? minutesToTime(matching.endsAtMinute) : "18:00",
      timezone: matching?.timezone ?? fallbackTimezone
    };
  });
}

function buildBlockDrafts(state: CreatorBookingInboxState): BlockDraft[] {
  const combined = [...state.availability.unavailableBlocks];

  return combined.map((block) => ({
    id: block.id,
    startsAt: toLocalDateTimeValue(block.startsAt),
    endsAt: toLocalDateTimeValue(block.endsAt),
    timezone: block.timezone,
    title: block.title,
    notes: block.notes ?? "",
    source: block.source === "vacation" ? "vacation" : "manual"
  }));
}

export function BookingInbox() {
  const { getAccessToken, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<CreatorBookingInboxState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dayDrafts, setDayDrafts] = useState<DayDraft[]>([]);
  const [blockDrafts, setBlockDrafts] = useState<BlockDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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

        const nextState = await fetchCreatorBookingInbox(accessToken);

        if (!active) {
          return;
        }

        setState(nextState);
        setDayDrafts(buildDayDrafts(nextState.availability.rules));
        setBlockDrafts(buildBlockDrafts(nextState));
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
  }, [getAccessToken, isAuthLoading]);

  const timezoneHint = useMemo(
    () =>
      dayDrafts.find((draft) => draft.enabled)?.timezone ??
      blockDrafts[0]?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone ??
      "Australia/Sydney",
    [blockDrafts, dayDrafts]
  );

  async function handleSaveAvailability() {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("A valid session is required.");
      }

      const payload: UpdateCreatorAvailabilityInput = {
        rules: dayDrafts
          .filter((draft) => draft.enabled)
          .map((draft) => ({
            weekday: draft.weekday,
            startsAtMinute: timeToMinutes(draft.start),
            endsAtMinute: timeToMinutes(draft.end),
            timezone: draft.timezone
          })),
        unavailableBlocks: blockDrafts.map(
          (draft): CreatorUnavailableBlockInput => ({
            id: draft.id.startsWith("draft-") ? undefined : draft.id,
            startsAt: new Date(draft.startsAt).toISOString(),
            endsAt: new Date(draft.endsAt).toISOString(),
            timezone: draft.timezone,
            title: draft.title,
            notes: draft.notes,
            source: draft.source,
            allDay: false
          })
        )
      };
      const nextState = await saveCreatorAvailability(accessToken, payload);
      setState(nextState);
      setDayDrafts(buildDayDrafts(nextState.availability.rules));
      setBlockDrafts(buildBlockDrafts(nextState));
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || isAuthLoading) {
    return (
      <StatePanel
        kind="loading"
        title="Loading booking foundations"
        description="Fetching creator availability and booking requests."
      />
    );
  }

  if (!state) {
    return (
      <StatePanel
        kind="error"
        title="Could not load booking foundations"
        description={errorMessage ?? "The booking workspace could not be loaded."}
      />
    );
  }

  if (!state.isConfigured) {
    return (
      <SectionShell eyebrow="Phase 3" title="Booking Inbox">
        <StatePanel
          kind="empty"
          title="Create your portfolio first"
          description="Public booking is attached to your Portfolio handle and public visibility. Publish your Portfolio foundation first, then come back here to open availability and receive requests."
          action={
            <Link href="/app/portfolio" style={{ textDecoration: "none" }}>
              <Button>Open Portfolio Editor</Button>
            </Link>
          }
        />
      </SectionShell>
    );
  }

  const submittedCount = state.requests.filter((request) => request.status === "submitted").length;
  const linkedClientCount = state.requests.filter((request) => Boolean(request.client)).length;
  const jobDraftCount = state.requests.filter((request) => Boolean(request.jobDraft)).length;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="museio-metric-grid">
        <Card tone="accent" style={{ padding: 20 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <span className="museio-caption">Inbox</span>
            <strong style={{ fontSize: "1.4rem" }}>{state.requests.length} requests</strong>
            <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
              Public booking demand now flows here through the portfolio handle.
            </span>
          </div>
        </Card>
        <Card tone="default" style={{ padding: 20 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <span className="museio-caption">Submitted</span>
            <strong style={{ fontSize: "1.4rem" }}>{submittedCount}</strong>
            <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
              New requests waiting for creator review.
            </span>
          </div>
        </Card>
        <Card tone="default" style={{ padding: 20 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <span className="museio-caption">Linked clients</span>
            <strong style={{ fontSize: "1.4rem" }}>{linkedClientCount}</strong>
            <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
              Requests already connected to creator-scoped client records.
            </span>
          </div>
        </Card>
        <Card tone="default" style={{ padding: 20 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <span className="museio-caption">Job drafts</span>
            <strong style={{ fontSize: "1.4rem" }}>{jobDraftCount}</strong>
            <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
              Accepted work already carried into delivery and commercial flow.
            </span>
          </div>
        </Card>
      </div>

      <SectionShell
        eyebrow="Phase 3"
        title="Booking Inbox"
        description="Public booking resolves through the portfolio handle, then lands here as creator-owned intake with availability and conflict rules already enforced."
        actions={<Badge tone="accent">{state.requests.length} requests</Badge>}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
            Public booking now runs through the Portfolio handle model. Requests
            land here with server-owned availability and conflict checks.
          </p>
          {state.requests.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No booking requests yet"
              description="Once a public portfolio receives booking submissions, they will appear here with their requested slot blocks and baseline review status."
            />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {state.requests.map((request) => (
                <Card key={request.id} tone="muted">
                  <div
                    style={{
                      display: "grid",
                      gap: 16,
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      alignItems: "start"
                    }}
                  >
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Badge tone="accent">{request.status}</Badge>
                        <Badge>{request.eventType}</Badge>
                        {request.client ? <Badge>Client linked</Badge> : null}
                        {request.jobDraft ? (
                          <Badge tone="success">{request.jobDraft.status} job</Badge>
                        ) : null}
                      </div>
                      <strong style={{ fontSize: "1.1rem" }}>{request.clientName}</strong>
                      <div
                        style={{
                          display: "grid",
                          gap: 10,
                          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))"
                        }}
                      >
                        <div>
                          <span className="museio-caption">Requested slots</span>
                          <div style={{ marginTop: 6, color: tokens.color.textMuted, lineHeight: 1.7 }}>
                            {request.requestedSlots
                              .map((slot) =>
                                new Date(slot.startsAt).toLocaleString(undefined, {
                                  dateStyle: "medium",
                                  timeStyle: "short"
                                })
                              )
                              .join(" · ")}
                          </div>
                        </div>
                        <div>
                          <span className="museio-caption">Progress</span>
                          <div style={{ marginTop: 6, color: tokens.color.textMuted, lineHeight: 1.7 }}>
                            {request.client
                              ? `Client: ${request.client.displayName}`
                              : "Client not linked yet"}
                            <br />
                            {request.jobDraft
                              ? `Job draft: ${request.jobDraft.title}`
                              : "No job draft yet"}
                          </div>
                        </div>
                      </div>
                      {request.client || request.jobDraft ? (
                        <span style={{ color: tokens.color.textMuted }}>
                          Server-owned review state stays intact while client and job links grow around it.
                        </span>
                      ) : null}
                    </div>
                    <Link
                      href={`/app/bookings/${request.id}`}
                      style={{ textDecoration: "none", alignSelf: "center" }}
                    >
                      <Button variant="secondary">Open Request</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Availability"
        title="Public Availability"
        description="Set the creator-controlled foundation first. Manual blocks and future calendar overlays can then refine public slot exposure safely."
        actions={
          <Button onClick={() => void handleSaveAvailability()} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save Availability"}
          </Button>
        }
      >
        <div style={{ display: "grid", gap: 18 }}>
          <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
            This editor is intentionally simple for Phase 3: one base window per day
            plus blocked periods. The contracts and schema already support future
            multi-slot and calendar-overlay growth.
          </p>

          <div style={{ display: "grid", gap: 12 }}>
            {dayDrafts.map((draft) => (
              <Card key={draft.weekday} tone="muted">
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "minmax(180px, 220px) repeat(auto-fit, minmax(180px, 1fr))"
                  }}
                >
                  <Toggle
                    checked={draft.enabled}
                    onChange={(next) =>
                      setDayDrafts((current) =>
                        current.map((candidate) =>
                          candidate.weekday === draft.weekday
                            ? { ...candidate, enabled: next }
                            : candidate
                        )
                      )
                    }
                    label={["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][draft.weekday]}
                    description="Expose a base weekly booking window for this day."
                  />
                  <Field label="Start Time">
                    <TextInput
                      type="time"
                      value={draft.start}
                      disabled={!draft.enabled}
                      onChange={(event) =>
                        setDayDrafts((current) =>
                          current.map((candidate) =>
                            candidate.weekday === draft.weekday
                              ? { ...candidate, start: event.target.value }
                              : candidate
                          )
                        )
                      }
                    />
                  </Field>
                  <Field label="End Time">
                    <TextInput
                      type="time"
                      value={draft.end}
                      disabled={!draft.enabled}
                      onChange={(event) =>
                        setDayDrafts((current) =>
                          current.map((candidate) =>
                            candidate.weekday === draft.weekday
                              ? { ...candidate, end: event.target.value }
                              : candidate
                          )
                        )
                      }
                    />
                  </Field>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center"
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>Blocked Periods</h3>
                <p style={{ margin: "6px 0 0", color: tokens.color.textMuted }}>
                  Manual closures, travel, and vacation blocks stack on top of weekly availability.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() =>
                  setBlockDrafts((current) => [
                    ...current,
                    {
                      id: `draft-${Date.now()}`,
                      startsAt: "",
                      endsAt: "",
                      timezone: timezoneHint,
                      title: "",
                      notes: "",
                      source: "manual"
                    }
                  ])
                }
              >
                Add Block
              </Button>
            </div>

            {blockDrafts.length === 0 ? (
              <StatePanel
                kind="empty"
                title="No blocked periods"
                description="Add manual or vacation closures so the public booking surface never shows unsafe time windows."
              />
            ) : (
              blockDrafts.map((draft) => (
                <Card key={draft.id} tone="muted">
                  <div style={{ display: "grid", gap: 12 }}>
                    <div
                      style={{
                        display: "grid",
                        gap: 12,
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
                      }}
                    >
                      <Field label="Title">
                        <TextInput
                          value={draft.title}
                          onChange={(event) =>
                            setBlockDrafts((current) =>
                              current.map((candidate) =>
                                candidate.id === draft.id
                                  ? { ...candidate, title: event.target.value }
                                  : candidate
                              )
                            )
                          }
                          placeholder="Travel, holiday, blackout"
                        />
                      </Field>
                      <Field label="Type">
                        <TextInput
                          value={draft.source}
                          onChange={(event) =>
                            setBlockDrafts((current) =>
                              current.map((candidate) =>
                                candidate.id === draft.id
                                  ? {
                                      ...candidate,
                                      source:
                                        event.target.value === "vacation"
                                          ? "vacation"
                                          : "manual"
                                    }
                                  : candidate
                              )
                            )
                          }
                          placeholder="manual or vacation"
                        />
                      </Field>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gap: 12,
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
                      }}
                    >
                      <Field label="Starts">
                        <TextInput
                          type="datetime-local"
                          value={draft.startsAt}
                          onChange={(event) =>
                            setBlockDrafts((current) =>
                              current.map((candidate) =>
                                candidate.id === draft.id
                                  ? { ...candidate, startsAt: event.target.value }
                                  : candidate
                              )
                            )
                          }
                        />
                      </Field>
                      <Field label="Ends">
                        <TextInput
                          type="datetime-local"
                          value={draft.endsAt}
                          onChange={(event) =>
                            setBlockDrafts((current) =>
                              current.map((candidate) =>
                                candidate.id === draft.id
                                  ? { ...candidate, endsAt: event.target.value }
                                  : candidate
                              )
                            )
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Notes">
                      <TextArea
                        value={draft.notes}
                        onChange={(event) =>
                          setBlockDrafts((current) =>
                            current.map((candidate) =>
                              candidate.id === draft.id
                                ? { ...candidate, notes: event.target.value }
                                : candidate
                            )
                          )
                        }
                        placeholder="Optional internal context for why this period is blocked."
                      />
                    </Field>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="danger"
                        onClick={() =>
                          setBlockDrafts((current) =>
                            current.filter((candidate) => candidate.id !== draft.id)
                          )
                        }
                      >
                        Remove Block
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <Card tone="accent">
            <div style={{ display: "grid", gap: 10 }}>
              <strong>Public-safe availability preview</strong>
              <div style={{ display: "grid", gap: 8 }}>
                {state.availability.publicAvailability.slice(0, 5).map((day) => (
                  <div key={day.date} style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontWeight: 650 }}>{day.date}</span>
                    <span style={{ color: tokens.color.textMuted }}>
                      {day.windows.map((window) => window.label).join(" · ")}
                    </span>
                  </div>
                ))}
                {state.availability.publicAvailability.length === 0 ? (
                  <span style={{ color: tokens.color.textMuted }}>
                    Public booking will stay unavailable until at least one safe window is exposed.
                  </span>
                ) : null}
              </div>
            </div>
          </Card>

          {errorMessage ? (
            <StatePanel
              kind="error"
              title="Could not save booking foundations"
              description={errorMessage}
            />
          ) : null}
        </div>
      </SectionShell>
    </div>
  );
}
