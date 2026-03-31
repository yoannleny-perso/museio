"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  FinanceExportPayload,
  FinanceTaxProfile,
  FinanceWorkspaceFilters,
  FinanceWorkspaceState
} from "@museio/types";
import {
  Badge,
  Button,
  Card,
  Field,
  SectionShell,
  StatePanel,
  TextInput,
  tokens
} from "@museio/ui";
import { useAuth } from "../auth/auth-context";
import {
  downloadFinanceExport,
  fetchFinanceWorkspace,
  saveFinanceTaxProfile
} from "../lib/api";

function sanitizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not load finance workspace.";
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

function formatCurrency(amountMinor: number, currencyCode: string) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currencyCode
  }).format(amountMinor / 100);
}

function downloadPayload(payload: FinanceExportPayload) {
  const blob = new Blob([payload.content], { type: payload.mimeType });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = payload.filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function FinanceWorkspace() {
  const { getAccessToken, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<FinanceWorkspaceState | null>(null);
  const [filters, setFilters] = useState<FinanceWorkspaceFilters>({
    reportPreset: "last-30-days",
    taxPreset: "current-quarter",
    forecastMode: "monthly"
  });
  const [taxDraft, setTaxDraft] = useState<FinanceTaxProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function load(nextFilters: FinanceWorkspaceFilters) {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("A valid session is required.");
    }

    const nextState = await fetchFinanceWorkspace(accessToken, nextFilters);
    setState(nextState);
    setTaxDraft(nextState.taxProfile);
  }

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let active = true;

    async function run() {
      try {
        await load(filters);
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

    void run();

    return () => {
      active = false;
    };
  }, [filters, getAccessToken, isAuthLoading]);

  const currencyCode = state?.overview.currencyCode ?? "AUD";
  const exportHint = useMemo(
    () => `${state?.reportWindow.label ?? "Current Report"} · ${state?.taxWindow.label ?? "Current Tax Period"}`,
    [state]
  );

  async function handleSaveTaxProfile() {
    if (!taxDraft) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("A valid session is required.");
      }

      const nextState = await saveFinanceTaxProfile(accessToken, {
        gstRegistered: taxDraft.gstRegistered,
        gstNumber: taxDraft.gstNumber,
        gstRateBasisPoints: taxDraft.gstRateBasisPoints,
        reportingMethod: taxDraft.reportingMethod,
        reserveRateBasisPoints: taxDraft.reserveRateBasisPoints,
        atoReadyChecklist: taxDraft.atoReadyChecklist
      });
      setState(nextState);
      setTaxDraft(nextState.taxProfile);
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExport(format: "csv" | "json") {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("A valid session is required.");
      }

      const payload = await downloadFinanceExport(accessToken, {
        ...filters,
        format
      });
      downloadPayload(payload);
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
        title="Loading finance workspace"
        description="Reconciling invoices, payments, deposits, balances, and GST summaries."
      />
    );
  }

  if (!state || !taxDraft) {
    return (
      <StatePanel
        kind="error"
        title="Could not load finance workspace"
        description={errorMessage ?? "The finance workspace could not be loaded."}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionShell
        eyebrow="Finance Workspace"
        title="Revenue, Receivables, and Tax"
        actions={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="secondary" disabled={isSaving} onClick={() => void handleExport("csv")}>
              Export CSV
            </Button>
            <Button variant="secondary" disabled={isSaving} onClick={() => void handleExport("json")}>
              Export JSON
            </Button>
          </div>
        }
      >
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
            Finance now reconciles from invoice and payment truth only. Overdue aging is
            invoice-driven, deposits and balances remain phase-aware, and GST summaries are
            ready for later BAS-style export workflows.
          </p>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <Field label="Report Window">
              <select
                value={filters.reportPreset}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    reportPreset: event.target.value as FinanceWorkspaceFilters["reportPreset"]
                  }))
                }
                style={{
                  minHeight: 48,
                  borderRadius: 18,
                  border: `1px solid ${tokens.color.border}`,
                  padding: "0 14px",
                  background: "#fff"
                }}
              >
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-90-days">Last 90 Days</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="year-to-date">Year To Date</option>
                <option value="all-time">All Time</option>
              </select>
            </Field>
            <Field label="Tax Period">
              <select
                value={filters.taxPreset}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    taxPreset: event.target.value as FinanceWorkspaceFilters["taxPreset"]
                  }))
                }
                style={{
                  minHeight: 48,
                  borderRadius: 18,
                  border: `1px solid ${tokens.color.border}`,
                  padding: "0 14px",
                  background: "#fff"
                }}
              >
                <option value="current-quarter">Current Quarter</option>
                <option value="previous-quarter">Previous Quarter</option>
                <option value="financial-year-to-date">Financial Year To Date</option>
              </select>
            </Field>
            <Field label="Forecast Mode">
              <select
                value={filters.forecastMode}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    forecastMode: event.target.value as FinanceWorkspaceFilters["forecastMode"]
                  }))
                }
                style={{
                  minHeight: 48,
                  borderRadius: 18,
                  border: `1px solid ${tokens.color.border}`,
                  padding: "0 14px",
                  background: "#fff"
                }}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge tone="accent">{state.reportWindow.label}</Badge>
            <Badge>{state.taxWindow.label}</Badge>
            <Badge tone={state.stripe.status === "ready" ? "success" : "warning"}>
              Stripe {state.stripe.status}
            </Badge>
            <Badge>{exportHint}</Badge>
          </div>
        </div>
      </SectionShell>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Card tone="default">
          <strong>Collected</strong>
          <div style={{ marginTop: 10, fontSize: "1.6rem" }}>
            {formatCurrency(state.overview.totalCollectedMinor, currencyCode)}
          </div>
        </Card>
        <Card tone="default">
          <strong>Open Receivables</strong>
          <div style={{ marginTop: 10, fontSize: "1.6rem" }}>
            {formatCurrency(state.overview.receivablesMinor, currencyCode)}
          </div>
        </Card>
        <Card tone="default">
          <strong>Overdue</strong>
          <div style={{ marginTop: 10, fontSize: "1.6rem" }}>
            {formatCurrency(state.overview.overdueMinor, currencyCode)}
          </div>
        </Card>
        <Card tone="default">
          <strong>Accepted Quote Pipeline</strong>
          <div style={{ marginTop: 10, fontSize: "1.6rem" }}>
            {formatCurrency(state.overview.acceptedQuotePipelineMinor, currencyCode)}
          </div>
        </Card>
      </div>

      {state.emptyStateReason ? (
        <StatePanel
          kind="empty"
          title="Finance is ready for real commercial data"
          description={`${state.emptyStateReason} Once invoices and payments begin flowing, the workspace will populate with aging, GST, and forecast reporting.`}
        />
      ) : null}

      <SectionShell eyebrow="Receivables" title="Deposits, Balances, and Aging">
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <Card tone="muted">
              <strong>Open Invoices</strong>
              <div style={{ marginTop: 8 }}>{state.receivables.openInvoiceCount}</div>
            </Card>
            <Card tone="muted">
              <strong>Deposits Outstanding</strong>
              <div style={{ marginTop: 8 }}>
                {formatCurrency(state.receivables.depositsOutstandingMinor, currencyCode)}
              </div>
            </Card>
            <Card tone="muted">
              <strong>Balances Outstanding</strong>
              <div style={{ marginTop: 8 }}>
                {formatCurrency(state.receivables.balancesOutstandingMinor, currencyCode)}
              </div>
            </Card>
            <Card tone="muted">
              <strong>Due Soon</strong>
              <div style={{ marginTop: 8 }}>{state.receivables.dueSoonInvoiceCount}</div>
            </Card>
          </div>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            {state.overdue.buckets.map((bucket) => (
              <Card key={bucket.bucket} tone="muted">
                <strong>{bucket.bucket}</strong>
                <div style={{ marginTop: 8 }}>
                  {formatCurrency(bucket.amountMinor, currencyCode)}
                </div>
                <div style={{ color: tokens.color.textMuted, marginTop: 6 }}>
                  {bucket.invoiceCount} invoices
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell eyebrow="Forecast" title="Committed and Pipeline Outlook">
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
            {state.forecast.inclusionRule}
          </p>
          {state.forecast.buckets.map((bucket) => (
            <Card key={bucket.label} tone="muted">
              <div style={{ display: "grid", gap: 6 }}>
                <strong>{bucket.label}</strong>
                <span style={{ color: tokens.color.textMuted }}>
                  Committed {formatCurrency(bucket.committedMinor, currencyCode)} · Pipeline{" "}
                  {formatCurrency(bucket.pipelineMinor, currencyCode)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Tax Centre"
        title="GST and BAS-Ready Foundations"
        actions={
          <Button disabled={isSaving} onClick={() => void handleSaveTaxProfile()}>
            Save Tax Settings
          </Button>
        }
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <Field label="GST Registered">
              <select
                value={taxDraft.gstRegistered ? "true" : "false"}
                onChange={(event) =>
                  setTaxDraft((current) =>
                    current
                      ? { ...current, gstRegistered: event.target.value === "true" }
                      : current
                  )
                }
                style={{
                  minHeight: 48,
                  borderRadius: 18,
                  border: `1px solid ${tokens.color.border}`,
                  padding: "0 14px",
                  background: "#fff"
                }}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </Field>
            <Field label="GST Number">
              <TextInput
                value={taxDraft.gstNumber ?? ""}
                onChange={(event) =>
                  setTaxDraft((current) =>
                    current ? { ...current, gstNumber: event.target.value } : current
                  )
                }
                placeholder="Optional GST / ABN reference"
              />
            </Field>
            <Field label="Reporting Method">
              <select
                value={taxDraft.reportingMethod}
                onChange={(event) =>
                  setTaxDraft((current) =>
                    current
                      ? {
                          ...current,
                          reportingMethod: event.target.value as FinanceTaxProfile["reportingMethod"]
                        }
                      : current
                  )
                }
                style={{
                  minHeight: 48,
                  borderRadius: 18,
                  border: `1px solid ${tokens.color.border}`,
                  padding: "0 14px",
                  background: "#fff"
                }}
              >
                <option value="cash">Cash</option>
                <option value="accrual">Accrual</option>
              </select>
            </Field>
            <Field label="Reserve Rate (bps)">
              <TextInput
                value={String(taxDraft.reserveRateBasisPoints)}
                onChange={(event) =>
                  setTaxDraft((current) =>
                    current
                      ? {
                          ...current,
                          reserveRateBasisPoints: Number(event.target.value || "0")
                        }
                      : current
                  )
                }
              />
            </Field>
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <Card tone="muted">
              <strong>GST Collected</strong>
              <div style={{ marginTop: 8 }}>
                {formatCurrency(state.taxSummary.gstCollectedMinor, currencyCode)}
              </div>
            </Card>
            <Card tone="muted">
              <strong>GST Outstanding</strong>
              <div style={{ marginTop: 8 }}>
                {formatCurrency(state.taxSummary.gstOutstandingMinor, currencyCode)}
              </div>
            </Card>
            <Card tone="muted">
              <strong>GST Payable</strong>
              <div style={{ marginTop: 8 }}>
                {formatCurrency(state.taxSummary.gstPayableMinor, currencyCode)}
              </div>
            </Card>
            <Card tone="muted">
              <strong>Reserve Target</strong>
              <div style={{ marginTop: 8 }}>
                {formatCurrency(state.taxSummary.reserveTargetMinor, currencyCode)}
              </div>
            </Card>
          </div>

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            {Object.entries(taxDraft.atoReadyChecklist).map(([key, value]) => (
              <Card key={key} tone="muted">
                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) =>
                      setTaxDraft((current) =>
                        current
                          ? {
                              ...current,
                              atoReadyChecklist: {
                                ...current.atoReadyChecklist,
                                [key]: event.target.checked
                              }
                            }
                          : current
                      )
                    }
                  />
                  <span>{key}</span>
                </label>
              </Card>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell eyebrow="Ledger" title="Invoices and Payments">
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 12 }}>
            {state.invoiceLedger.length === 0 ? (
              <StatePanel
                kind="empty"
                title="No invoices yet"
                description="Invoice and payment truth will appear here once a creator starts sending commercial records."
              />
            ) : (
              state.invoiceLedger.map((invoice) => (
                <Card key={invoice.invoiceId} tone="muted">
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Badge tone="accent">{invoice.status}</Badge>
                      <Badge>{invoice.invoiceNumber}</Badge>
                      {invoice.isOverdue ? <Badge tone="warning">Overdue {invoice.overdueDays}d</Badge> : null}
                    </div>
                    <strong>{invoice.clientName}</strong>
                    <span style={{ color: tokens.color.textMuted }}>
                      Total {formatCurrency(invoice.totalMinor, currencyCode)} · Paid{" "}
                      {formatCurrency(invoice.amountPaidMinor, currencyCode)} · Due{" "}
                      {formatCurrency(invoice.amountDueMinor, currencyCode)}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {state.paymentLedger.length === 0 ? (
              <StatePanel
                kind="empty"
                title="No payments yet"
                description="Webhook-confirmed payment records will appear here once deposits or invoice payments succeed."
              />
            ) : (
              state.paymentLedger.map((payment) => (
                <Card key={payment.id} tone="muted">
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <Badge>{payment.phase}</Badge>
                    <Badge tone={payment.status === "succeeded" ? "success" : "warning"}>
                      {payment.status}
                    </Badge>
                    <span style={{ color: tokens.color.textMuted }}>
                      {payment.clientName} · {payment.invoiceNumber} ·{" "}
                      {formatCurrency(payment.amountMinor, currencyCode)}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
        {errorMessage ? (
          <div style={{ marginTop: 16 }}>
            <StatePanel kind="error" title="Finance action failed" description={errorMessage} />
          </div>
        ) : null}
      </SectionShell>
    </div>
  );
}
