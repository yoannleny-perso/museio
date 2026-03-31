"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CreatorCommercialJobsState } from "@museio/types";
import { Badge, Button, Card, SectionShell, StatePanel, tokens } from "@museio/ui";
import { useAuth } from "../auth/auth-context";
import { fetchCreatorCommercialJobs } from "../lib/api";

function sanitizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not load jobs.";
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

export function JobsWorkspace() {
  const { getAccessToken, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<CreatorCommercialJobsState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

        const nextState = await fetchCreatorCommercialJobs(accessToken);

        if (active) {
          setState(nextState);
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

  if (isLoading || isAuthLoading) {
    return (
      <StatePanel
        kind="loading"
        title="Loading commercial jobs"
        description="Fetching creator jobs, quotes, invoices, and Stripe readiness."
      />
    );
  }

  if (!state) {
    return (
      <StatePanel
        kind="error"
        title="Could not load jobs"
        description={errorMessage ?? "The commercial workspace could not be loaded."}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionShell
        eyebrow="Commercial"
        title="Jobs"
        actions={<Badge tone={state.stripe.status === "ready" ? "success" : "warning"}>{state.stripe.status}</Badge>}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
            Accepted booking requests become job drafts here. Quotes, invoices, deposits,
            and payments all hang off the job so money-state truth stays server-owned.
          </p>
          {state.jobs.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No jobs yet"
              description="Accept a booking request into a job draft first, then quotes and invoices can start from there."
              action={
                <Link href="/app/bookings" style={{ textDecoration: "none" }}>
                  <Button>Open Bookings</Button>
                </Link>
              }
            />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {state.jobs.map((entry) => (
                <Card key={entry.job.id} tone="muted">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Badge tone="accent">{entry.job.status}</Badge>
                        {entry.quote ? <Badge>{entry.quote.status} quote</Badge> : null}
                        {entry.invoice ? <Badge tone="success">{entry.invoice.status} invoice</Badge> : null}
                      </div>
                      <strong style={{ fontSize: "1.05rem" }}>{entry.job.title}</strong>
                      <span style={{ color: tokens.color.textMuted }}>
                        {entry.job.requesterSnapshot.clientName} · {entry.job.eventType}
                      </span>
                    </div>
                    <Link href={`/app/jobs/${entry.job.id}`} style={{ textDecoration: "none" }}>
                      <Button variant="secondary">Open Job</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SectionShell>
    </div>
  );
}
