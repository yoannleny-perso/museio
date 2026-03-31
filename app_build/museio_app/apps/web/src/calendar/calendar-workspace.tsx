"use client";

import { useEffect, useMemo, useState } from "react";
import type { CalendarIntegrationWorkspaceState } from "@museio/types";
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
import {
  fetchCalendarWorkspace,
  importCalendarBusyBlocks,
  upsertCalendarAccount
} from "../lib/api";

function sanitizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not load calendar integrations.";
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

export function CalendarWorkspace() {
  const { getAccessToken, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<CalendarIntegrationWorkspaceState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState({
    provider: "google-calendar",
    accountLabel: "",
    externalAccountId: "",
    scopes: "calendar.readonly"
  });
  const [importForm, setImportForm] = useState({
    accountId: "",
    blocksJson: JSON.stringify(
      [
        {
          startsAt: new Date(Date.now() + 86400000).toISOString(),
          endsAt: new Date(Date.now() + 90000000).toISOString(),
          timezone: "UTC",
          title: "Imported busy block",
          sourceLabel: "Primary calendar"
        }
      ],
      null,
      2
    )
  });

  const accountOptions = useMemo(() => state?.accounts ?? [], [state?.accounts]);

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

        const nextState = await fetchCalendarWorkspace(accessToken);

        if (active) {
          setState(nextState);
          setImportForm((current) => ({
            ...current,
            accountId: current.accountId || nextState.accounts[0]?.id || ""
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

  async function handleConnect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("A valid session is required.");
      }

      const nextState = await upsertCalendarAccount(accessToken, {
        provider: accountForm.provider as "google-calendar" | "calendly" | "manual-import",
        accountLabel: accountForm.accountLabel,
        externalAccountId: accountForm.externalAccountId || undefined,
        scopes: accountForm.scopes
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        status: "connected",
        syncStatus: "synced"
      });

      setState(nextState);
      setImportForm((current) => ({
        ...current,
        accountId: nextState.accounts[0]?.id || current.accountId
      }));
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    }
  }

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("A valid session is required.");
      }

      const parsedBlocks = JSON.parse(importForm.blocksJson) as Array<Record<string, unknown>>;
      const nextState = await importCalendarBusyBlocks(
        accessToken,
        importForm.accountId,
        { blocks: parsedBlocks as never[] }
      );

      setState(nextState);
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    }
  }

  if (isLoading || isAuthLoading) {
    return (
      <StatePanel
        kind="loading"
        title="Loading calendar workspace"
        description="Fetching external calendar connections, imported blocks, and conflict visibility."
      />
    );
  }

  if (!state) {
    return (
      <StatePanel
        kind="error"
        title="Could not load calendar workspace"
        description={errorMessage ?? "Calendar integrations could not be loaded."}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionShell
        eyebrow="Calendar"
        title="Integrations & conflict center"
        actions={<Badge tone="accent">{state.conflicts.length} conflicts</Badge>}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
            External calendars now extend the existing availability engine. Public
            slot exposure still shows only safe availability windows, while creators get
            a richer conflict center for manual blocks, booking holds, and imported busy time.
          </p>
          <Card tone="muted">
            <form onSubmit={handleConnect} style={{ display: "grid", gap: 12 }}>
              <strong>Connect provider baseline</strong>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12
                }}
              >
                <Field label="Provider">
                  <SelectField
                    value={accountForm.provider}
                    onChange={(event) =>
                      setAccountForm((current) => ({ ...current, provider: event.target.value }))
                    }
                  >
                    <option value="google-calendar">google-calendar</option>
                    <option value="calendly">calendly</option>
                    <option value="manual-import">manual-import</option>
                  </SelectField>
                </Field>
                <Field label="Account label">
                  <TextInput
                    value={accountForm.accountLabel}
                    onChange={(event) =>
                      setAccountForm((current) => ({ ...current, accountLabel: event.target.value }))
                    }
                  />
                </Field>
                <Field label="External account id">
                  <TextInput
                    value={accountForm.externalAccountId}
                    onChange={(event) =>
                      setAccountForm((current) => ({
                        ...current,
                        externalAccountId: event.target.value
                      }))
                    }
                  />
                </Field>
              </div>
              <Field label="Scopes">
                <TextInput
                  value={accountForm.scopes}
                  onChange={(event) =>
                    setAccountForm((current) => ({ ...current, scopes: event.target.value }))
                  }
                />
              </Field>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit">Save Connection</Button>
              </div>
            </form>
          </Card>
          <Card tone="muted">
            <form onSubmit={handleImport} style={{ display: "grid", gap: 12 }}>
              <strong>Import busy blocks</strong>
              <Field label="Account">
                <SelectField
                  value={importForm.accountId}
                  onChange={(event) =>
                    setImportForm((current) => ({ ...current, accountId: event.target.value }))
                  }
                >
                  {accountOptions.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.provider} · {account.accountLabel}
                    </option>
                  ))}
                </SelectField>
              </Field>
              <Field label="Busy blocks JSON">
                <TextArea
                  value={importForm.blocksJson}
                  onChange={(event) =>
                    setImportForm((current) => ({ ...current, blocksJson: event.target.value }))
                  }
                />
              </Field>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" disabled={!importForm.accountId}>
                  Import Blocks
                </Button>
              </div>
            </form>
          </Card>
          <div style={{ display: "grid", gap: 12 }}>
            {state.accounts.map((account) => (
              <Card key={account.id} tone="default">
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Badge tone="accent">{account.provider}</Badge>
                  <Badge>{account.status}</Badge>
                  <Badge tone={account.syncStatus === "synced" ? "success" : "warning"}>
                    {account.syncStatus}
                  </Badge>
                </div>
                <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                  <strong>{account.accountLabel}</strong>
                  <span style={{ color: tokens.color.textMuted }}>
                    {account.lastSyncAt
                      ? `Last sync ${new Date(account.lastSyncAt).toLocaleString()}`
                      : "No sync completed yet."}
                  </span>
                </div>
              </Card>
            ))}
          </div>
          {state.conflicts.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No conflicts yet"
              description="Manual blocks, booking holds, and imported busy time will appear here."
            />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {state.conflicts.map((conflict) => (
                <Card key={conflict.id} tone="muted">
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge tone="accent">{conflict.source}</Badge>
                      {conflict.provider ? <Badge>{conflict.provider}</Badge> : null}
                    </div>
                    <strong>{conflict.publicSafeLabel}</strong>
                    <span style={{ color: tokens.color.textMuted }}>
                      {new Date(conflict.startsAt).toLocaleString()} to{" "}
                      {new Date(conflict.endsAt).toLocaleString()}
                    </span>
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
