"use client";

import { useEffect, useState } from "react";
import type { CreatorClientProfileState } from "@museio/types";
import {
  Badge,
  Button,
  Card,
  Field,
  SectionShell,
  SelectField,
  StatePanel,
  TextArea,
  TextInput,
  tokens
} from "@museio/ui";
import { useAuth } from "../auth/auth-context";
import { fetchClientProfile, saveClientProfile } from "../lib/api";

function sanitizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not load the client profile.";
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

export function ClientProfile({ clientId }: { clientId: string }) {
  const { getAccessToken, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<CreatorClientProfileState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayName: "",
    primaryEmail: "",
    phone: "",
    companyName: "",
    status: "active",
    tags: "",
    notes: ""
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

        const nextState = await fetchClientProfile(accessToken, clientId);

        if (active) {
          setState(nextState);
          setForm({
            displayName: nextState.client.displayName,
            primaryEmail: nextState.client.primaryEmail,
            phone: nextState.client.phone ?? "",
            companyName: nextState.client.companyName ?? "",
            status: nextState.client.status,
            tags: nextState.client.tags.join(", "),
            notes: nextState.client.notes ?? ""
          });
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
  }, [clientId, getAccessToken, isAuthLoading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSaving(true);
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("A valid session is required.");
      }

      const nextState = await saveClientProfile(accessToken, clientId, {
        displayName: form.displayName,
        primaryEmail: form.primaryEmail,
        phone: form.phone || undefined,
        companyName: form.companyName || undefined,
        status: form.status as "lead" | "active" | "vip" | "archived",
        tags: form.tags
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        notes: form.notes || undefined
      });

      setState(nextState);
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
        title="Loading client"
        description="Fetching relationship history, commercial summaries, and profile details."
      />
    );
  }

  if (!state) {
    return (
      <StatePanel
        kind="error"
        title="Could not load client"
        description={errorMessage ?? "The client profile could not be loaded."}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionShell
        eyebrow="CRM"
        title={state.client.displayName}
        description="Use one creator-scoped profile to keep contact detail, relationship notes, commercial summary, and timeline context together."
        actions={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="accent">{state.client.status}</Badge>
            {state.client.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        }
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div className="museio-metric-grid">
            <Card tone="accent" style={{ padding: 18 }}>
              <span className="museio-caption">Bookings</span>
              <div style={{ marginTop: 8, fontSize: "1.28rem", fontWeight: 700 }}>
                {state.relationship.bookingRequestCount}
              </div>
            </Card>
            <Card tone="default" style={{ padding: 18 }}>
              <span className="museio-caption">Jobs</span>
              <div style={{ marginTop: 8, fontSize: "1.28rem", fontWeight: 700 }}>
                {state.relationship.jobCount}
              </div>
            </Card>
            <Card tone="default" style={{ padding: 18 }}>
              <span className="museio-caption">Invoices</span>
              <div style={{ marginTop: 8, fontSize: "1.28rem", fontWeight: 700 }}>
                {state.relationship.invoiceCount}
              </div>
            </Card>
          </div>
          <Card tone="muted">
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
              <strong>Client profile</strong>
              <Field label="Display name">
                <TextInput
                  value={form.displayName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, displayName: event.target.value }))
                  }
                />
              </Field>
              <Field label="Primary email">
                <TextInput
                  value={form.primaryEmail}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, primaryEmail: event.target.value }))
                  }
                />
              </Field>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12
                }}
              >
                <Field label="Phone">
                  <TextInput
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Company">
                  <TextInput
                    value={form.companyName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, companyName: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Status">
                  <SelectField
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, status: event.target.value }))
                    }
                  >
                    <option value="lead">lead</option>
                    <option value="active">active</option>
                    <option value="vip">vip</option>
                    <option value="archived">archived</option>
                  </SelectField>
                </Field>
              </div>
              <Field label="Tags" hint="Comma-separated tags stay creator-scoped.">
                <TextInput
                  value={form.tags}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, tags: event.target.value }))
                  }
                />
              </Field>
              <Field label="Notes">
                <TextArea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                />
              </Field>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save Client"}
                </Button>
              </div>
            </form>
          </Card>
          <div className="museio-metric-grid">
            <Card tone="default">
              <strong>{state.relationship.bookingRequestCount}</strong>
              <span style={{ color: tokens.color.textMuted }}>Bookings</span>
            </Card>
            <Card tone="default">
              <strong>{state.relationship.jobCount}</strong>
              <span style={{ color: tokens.color.textMuted }}>Jobs</span>
            </Card>
            <Card tone="default">
              <strong>{state.relationship.invoiceCount}</strong>
              <span style={{ color: tokens.color.textMuted }}>Invoices</span>
            </Card>
            <Card tone="default">
              <strong>{state.relationship.collectedMinor / 100}</strong>
              <span style={{ color: tokens.color.textMuted }}>Collected</span>
            </Card>
          </div>
          <Card tone="muted">
            <strong>Relationship timeline</strong>
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {state.timeline.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: "grid",
                    gap: 4,
                    paddingBottom: 10,
                    borderBottom: `1px solid ${tokens.color.border}`
                  }}
                >
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Badge>{entry.type}</Badge>
                    <span style={{ color: tokens.color.textMuted }}>
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span style={{ color: tokens.color.text }}>{entry.summary}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </SectionShell>
    </div>
  );
}
