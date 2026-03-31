"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CreatorClientsState } from "@museio/types";
import { Badge, Button, Card, SectionShell, StatePanel, tokens } from "@museio/ui";
import { useAuth } from "../auth/auth-context";
import { fetchCreatorClients } from "../lib/api";

function sanitizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not load clients.";
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

export function ClientsWorkspace() {
  const { getAccessToken, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<CreatorClientsState | null>(null);
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

        const nextState = await fetchCreatorClients(accessToken);

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
        title="Loading clients"
        description="Fetching client records, commercial links, and relationship summaries."
      />
    );
  }

  if (!state) {
    return (
      <StatePanel
        kind="error"
        title="Could not load CRM"
        description={errorMessage ?? "The client workspace could not be loaded."}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionShell
        eyebrow="CRM"
        title="Clients"
        actions={<Badge tone="accent">{state.clients.length} records</Badge>}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
            Clients are creator-scoped and linked back to bookings, jobs, invoices,
            payments, and messaging so relationship context stays unified.
          </p>
          {state.clients.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No clients yet"
              description="Accept a booking into a job draft first and Museio will create or link the client record."
            />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {state.clients.map((entry) => (
                <Card key={entry.client.id} tone="muted">
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
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Badge tone="accent">{entry.client.status}</Badge>
                        {entry.client.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                      <strong>{entry.client.displayName}</strong>
                      <span style={{ color: tokens.color.textMuted }}>
                        {entry.client.primaryEmail}
                      </span>
                      <span style={{ color: tokens.color.text }}>
                        {entry.relationship.jobCount} jobs · {entry.relationship.invoiceCount} invoices ·{" "}
                        {entry.relationship.collectedMinor / 100} collected
                      </span>
                    </div>
                    <Link href={`/app/clients/${entry.client.id}`} style={{ textDecoration: "none" }}>
                      <Button variant="secondary">Open Profile</Button>
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
