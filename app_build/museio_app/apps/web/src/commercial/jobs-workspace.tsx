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

  const quoteCount = state.jobs.filter((entry) => Boolean(entry.quote)).length;
  const invoiceCount = state.jobs.filter((entry) => Boolean(entry.invoice)).length;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="museio-metric-grid">
        <Card tone="accent" style={{ padding: 20 }}>
          <span className="museio-caption">Jobs</span>
          <div style={{ marginTop: 8, fontSize: "1.4rem", fontWeight: 700 }}>{state.jobs.length}</div>
          <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
            Accepted work now being carried through delivery and commercial follow-through.
          </span>
        </Card>
        <Card tone="default" style={{ padding: 20 }}>
          <span className="museio-caption">Quotes</span>
          <div style={{ marginTop: 8, fontSize: "1.4rem", fontWeight: 700 }}>{quoteCount}</div>
          <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
            Drafted or sent commercial proposals linked to accepted jobs.
          </span>
        </Card>
        <Card tone="default" style={{ padding: 20 }}>
          <span className="museio-caption">Invoices</span>
          <div style={{ marginTop: 8, fontSize: "1.4rem", fontWeight: 700 }}>{invoiceCount}</div>
          <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
            Server-owned money flow records derived from real commercial state.
          </span>
        </Card>
      </div>

      <SectionShell
        eyebrow="Commercial"
        title="Jobs"
        description="Accepted booking requests become job drafts here. Quotes, invoices, deposits, and payments all hang off the job so money-state truth stays server-owned."
        actions={<Badge tone={state.stripe.status === "ready" ? "success" : "warning"}>{state.stripe.status}</Badge>}
      >
        <div style={{ display: "grid", gap: 16 }}>
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
                      display: "grid",
                      gap: 16,
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      alignItems: "start"
                    }}
                  >
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Badge tone="accent">{entry.job.status}</Badge>
                        {entry.quote ? <Badge>{entry.quote.status} quote</Badge> : null}
                        {entry.invoice ? <Badge tone="success">{entry.invoice.status} invoice</Badge> : null}
                      </div>
                      <strong style={{ fontSize: "1.05rem" }}>{entry.job.title}</strong>
                      <div
                        style={{
                          display: "grid",
                          gap: 10,
                          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))"
                        }}
                      >
                        <div>
                          <span className="museio-caption">Client</span>
                          <div style={{ marginTop: 6, color: tokens.color.textMuted }}>
                            {entry.job.requesterSnapshot.clientName}
                          </div>
                        </div>
                        <div>
                          <span className="museio-caption">Event type</span>
                          <div style={{ marginTop: 6, color: tokens.color.textMuted }}>
                            {entry.job.eventType}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link href={`/app/jobs/${entry.job.id}`} style={{ textDecoration: "none", alignSelf: "center" }}>
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
