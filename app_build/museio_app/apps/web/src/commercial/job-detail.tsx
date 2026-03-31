"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  CommercialLineItem,
  CreatorCommercialActionResult,
  CreatorCommercialJobState,
  InvoiceCollectionMode,
  SaveInvoiceDraftInput,
  SaveQuoteDraftInput
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
  tokens
} from "@museio/ui";
import { useAuth } from "../auth/auth-context";
import {
  createInvoiceDraft,
  createQuoteDraft,
  fetchCreatorCommercialJobState,
  saveInvoiceDraft,
  saveQuoteDraft,
  sendInvoice,
  sendQuote,
  updateStripeConnectedAccount
} from "../lib/api";

type DraftLine = {
  id?: string;
  label: string;
  description: string;
  quantity: string;
  unitAmountMinor: string;
  taxRateBasisPoints: string;
  sortOrder: number;
};

function sanitizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not load the commercial job.";
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

function toDraftLines(
  lineItems: CommercialLineItem[] | undefined
): DraftLine[] {
  return (lineItems ?? []).map((item) => ({
    id: item.id,
    label: item.label,
    description: item.description,
    quantity: String(item.quantity),
    unitAmountMinor: String(item.unitAmountMinor),
    taxRateBasisPoints: String(item.taxRateBasisPoints),
    sortOrder: item.sortOrder
  }));
}

export function JobDetail({ jobId }: { jobId: string }) {
  const { getAccessToken, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<CreatorCommercialJobState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [stripeAccountId, setStripeAccountId] = useState("acct_ready_demo");
  const [quoteTitle, setQuoteTitle] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [quoteCurrency, setQuoteCurrency] = useState("AUD");
  const [quoteLines, setQuoteLines] = useState<DraftLine[]>([]);
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [invoiceMessage, setInvoiceMessage] = useState("");
  const [invoiceCurrency, setInvoiceCurrency] = useState("AUD");
  const [invoicePaymentTermsDays, setInvoicePaymentTermsDays] = useState("7");
  const [invoiceCollectionMode, setInvoiceCollectionMode] =
    useState<InvoiceCollectionMode>("full-payment");
  const [invoiceDepositType, setInvoiceDepositType] = useState<"percentage" | "fixed">("percentage");
  const [invoiceDepositValue, setInvoiceDepositValue] = useState("30");
  const [invoiceLines, setInvoiceLines] = useState<DraftLine[]>([]);

  async function load() {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("A valid session is required.");
    }

    const nextState = await fetchCreatorCommercialJobState(accessToken, jobId);
    setState(nextState);
    setQuoteTitle(nextState.quote?.title ?? `${nextState.job.eventType} Quote`);
    setQuoteMessage(nextState.quote?.message ?? "");
    setQuoteCurrency(nextState.quote?.currencyCode ?? "AUD");
    setQuoteLines(toDraftLines(nextState.quote?.lineItems));
    setInvoiceTitle(nextState.invoice?.title ?? `${nextState.job.eventType} Invoice`);
    setInvoiceMessage(nextState.invoice?.message ?? "");
    setInvoiceCurrency(nextState.invoice?.currencyCode ?? "AUD");
    setInvoicePaymentTermsDays(String(nextState.invoice?.paymentTermsDays ?? 7));
    setInvoiceCollectionMode(nextState.invoice?.collectionMode ?? "full-payment");
    setInvoiceDepositType(nextState.invoice?.depositConfig?.type ?? "percentage");
    setInvoiceDepositValue(String(nextState.invoice?.depositConfig?.value ?? 30));
    setInvoiceLines(toDraftLines(nextState.invoice?.lineItems));
  }

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let active = true;

    async function run() {
      try {
        await load();
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
  }, [getAccessToken, isAuthLoading, jobId]);

  const moneySummary = useMemo(() => {
    if (!state?.invoice) {
      return null;
    }

    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: state.invoice.currencyCode
    });
  }, [state]);

  async function withAccessToken<T>(work: (accessToken: string) => Promise<T>) {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("A valid session is required.");
    }

    return work(accessToken);
  }

  async function handleCreateQuote() {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const nextState = await withAccessToken((accessToken) => createQuoteDraft(accessToken, jobId));
      setState(nextState);
      setQuoteLines(toDraftLines(nextState.quote?.lineItems));
      setQuoteTitle(nextState.quote?.title ?? quoteTitle);
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveQuote() {
    if (!state?.quote) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload: SaveQuoteDraftInput = {
        title: quoteTitle,
        message: quoteMessage,
        currencyCode: quoteCurrency,
        lineItems: quoteLines.map((line, index) => ({
          id: line.id,
          label: line.label,
          description: line.description,
          quantity: Number(line.quantity),
          unitAmountMinor: Number(line.unitAmountMinor),
          taxRateBasisPoints: Number(line.taxRateBasisPoints || "0"),
          sortOrder: index
        }))
      };
      const nextState = await withAccessToken((accessToken) =>
        saveQuoteDraft(accessToken, state.quote!.id, payload)
      );
      setState(nextState);
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendQuote() {
    if (!state?.quote) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = await withAccessToken((accessToken) => sendQuote(accessToken, state.quote!.id));
      setState((result as CreatorCommercialActionResult).state);
      setShareUrl(result.publicUrl ?? null);
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateInvoice() {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const nextState = await withAccessToken((accessToken) =>
        createInvoiceDraft(accessToken, jobId, { deriveFromAcceptedQuote: true })
      );
      setState(nextState);
      setInvoiceLines(toDraftLines(nextState.invoice?.lineItems));
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveInvoice() {
    if (!state?.invoice) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload: SaveInvoiceDraftInput = {
        title: invoiceTitle,
        message: invoiceMessage,
        currencyCode: invoiceCurrency,
        paymentTermsDays: Number(invoicePaymentTermsDays),
        collectionMode: invoiceCollectionMode,
        depositConfig:
          invoiceCollectionMode === "deposit-and-balance"
            ? {
                type: invoiceDepositType,
                value: Number(invoiceDepositValue)
              }
            : undefined,
        lineItems: invoiceLines.map((line, index) => ({
          id: line.id,
          label: line.label,
          description: line.description,
          quantity: Number(line.quantity),
          unitAmountMinor: Number(line.unitAmountMinor),
          taxRateBasisPoints: Number(line.taxRateBasisPoints || "0"),
          sortOrder: index
        }))
      };
      const nextState = await withAccessToken((accessToken) =>
        saveInvoiceDraft(accessToken, state.invoice!.id, payload)
      );
      setState(nextState);
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendInvoice() {
    if (!state?.invoice) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = await withAccessToken((accessToken) => sendInvoice(accessToken, state.invoice!.id));
      setState((result as CreatorCommercialActionResult).state);
      setShareUrl(result.publicUrl ?? null);
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateStripe() {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const stripe = await withAccessToken((accessToken) =>
        updateStripeConnectedAccount(accessToken, { accountId: stripeAccountId })
      );
      setState((current) => (current ? { ...current, stripe } : current));
    } catch (error) {
      setErrorMessage(sanitizeError(error));
    } finally {
      setIsSaving(false);
    }
  }

  function addQuoteLine() {
    setQuoteLines((current) => [
      ...current,
      {
        label: "",
        description: "",
        quantity: "1",
        unitAmountMinor: "0",
        taxRateBasisPoints: "0",
        sortOrder: current.length
      }
    ]);
  }

  function addInvoiceLine() {
    setInvoiceLines((current) => [
      ...current,
      {
        label: "",
        description: "",
        quantity: "1",
        unitAmountMinor: "0",
        taxRateBasisPoints: "0",
        sortOrder: current.length
      }
    ]);
  }

  if (isLoading || isAuthLoading) {
    return (
      <StatePanel
        kind="loading"
        title="Loading job"
        description="Fetching the commercial workflow for this job."
      />
    );
  }

  if (!state) {
    return (
      <StatePanel
        kind="error"
        title="Could not load job"
        description={errorMessage ?? "The job could not be loaded."}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionShell
        eyebrow="Commercial Workflow"
        title={state.job.title}
        actions={
          <Link href="/app/jobs" style={{ textDecoration: "none" }}>
            <Button variant="secondary">Back To Jobs</Button>
          </Link>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge tone="accent">{state.job.status}</Badge>
            {state.quote ? <Badge>{state.quote.status} quote</Badge> : null}
            {state.invoice ? <Badge tone="success">{state.invoice.status} invoice</Badge> : null}
          </div>
          <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
            {state.job.requesterSnapshot.clientName} · {state.job.requesterSnapshot.clientEmail}
          </p>
          {shareUrl ? (
            <Card tone="muted">
              <strong>Public Link</strong>
              <div style={{ marginTop: 8 }}>
                <a href={shareUrl} target="_blank" rel="noreferrer">
                  {shareUrl}
                </a>
              </div>
            </Card>
          ) : null}
        </div>
      </SectionShell>

      <SectionShell eyebrow="Stripe" title="Connected Account">
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
            Money-state stays server-owned. Locally, `acct_ready_demo` will simulate a ready
            connected account so checkout and webhook orchestration can be exercised end-to-end.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <Field label="Stripe Account Id">
              <TextInput
                value={stripeAccountId}
                onChange={(event) => setStripeAccountId(event.target.value)}
              />
            </Field>
            <Button disabled={isSaving} onClick={() => void handleUpdateStripe()}>
              Sync Readiness
            </Button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge tone={state.stripe.status === "ready" ? "success" : "warning"}>
              {state.stripe.status}
            </Badge>
            {state.stripe.accountId ? <Badge>{state.stripe.accountId}</Badge> : null}
          </div>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Quote"
        title="Quote Draft"
        actions={
          !state.quote ? (
            <Button disabled={isSaving} onClick={() => void handleCreateQuote()}>
              Create Quote
            </Button>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button disabled={isSaving} onClick={() => void handleSaveQuote()}>
                Save Quote
              </Button>
              <Button variant="secondary" disabled={isSaving} onClick={() => void handleSendQuote()}>
                Send Quote
              </Button>
            </div>
          )
        }
      >
        {!state.quote ? (
          <StatePanel
            kind="empty"
            title="No quote yet"
            description="Create a quote from this job draft to start the commercial path."
          />
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            <Field label="Quote Title">
              <TextInput value={quoteTitle} onChange={(event) => setQuoteTitle(event.target.value)} />
            </Field>
            <Field label="Message">
              <TextArea value={quoteMessage} onChange={(event) => setQuoteMessage(event.target.value)} />
            </Field>
            <Field label="Currency">
              <TextInput value={quoteCurrency} onChange={(event) => setQuoteCurrency(event.target.value.toUpperCase())} />
            </Field>
            <div style={{ display: "grid", gap: 12 }}>
              {quoteLines.map((line, index) => (
                <Card key={line.id ?? `quote-line-${index}`} tone="muted">
                  <div style={{ display: "grid", gap: 10 }}>
                    <TextInput
                      value={line.label}
                      onChange={(event) =>
                        setQuoteLines((current) =>
                          current.map((candidate, candidateIndex) =>
                            candidateIndex === index ? { ...candidate, label: event.target.value } : candidate
                          )
                        )
                      }
                      placeholder="Line item label"
                    />
                    <TextArea
                      value={line.description}
                      onChange={(event) =>
                        setQuoteLines((current) =>
                          current.map((candidate, candidateIndex) =>
                            candidateIndex === index ? { ...candidate, description: event.target.value } : candidate
                          )
                        )
                      }
                      placeholder="Description"
                    />
                    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                      <TextInput
                        value={line.quantity}
                        onChange={(event) =>
                          setQuoteLines((current) =>
                            current.map((candidate, candidateIndex) =>
                              candidateIndex === index ? { ...candidate, quantity: event.target.value } : candidate
                            )
                          )
                        }
                        placeholder="Quantity"
                      />
                      <TextInput
                        value={line.unitAmountMinor}
                        onChange={(event) =>
                          setQuoteLines((current) =>
                            current.map((candidate, candidateIndex) =>
                              candidateIndex === index ? { ...candidate, unitAmountMinor: event.target.value } : candidate
                            )
                          )
                        }
                        placeholder="Unit amount (minor)"
                      />
                      <TextInput
                        value={line.taxRateBasisPoints}
                        onChange={(event) =>
                          setQuoteLines((current) =>
                            current.map((candidate, candidateIndex) =>
                              candidateIndex === index ? { ...candidate, taxRateBasisPoints: event.target.value } : candidate
                            )
                          )
                        }
                        placeholder="Tax bps"
                      />
                    </div>
                  </div>
                </Card>
              ))}
              <Button variant="ghost" onClick={addQuoteLine}>Add Line Item</Button>
            </div>
          </div>
        )}
      </SectionShell>

      <SectionShell
        eyebrow="Invoice"
        title="Invoice Draft"
        actions={
          !state.invoice ? (
            <Button disabled={isSaving} onClick={() => void handleCreateInvoice()}>
              Create Invoice
            </Button>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button disabled={isSaving} onClick={() => void handleSaveInvoice()}>
                Save Invoice
              </Button>
              <Button variant="secondary" disabled={isSaving} onClick={() => void handleSendInvoice()}>
                Send Invoice
              </Button>
            </div>
          )
        }
      >
        {!state.invoice ? (
          <StatePanel
            kind="empty"
            title="No invoice yet"
            description="Create an invoice draft after the quote is ready or accepted."
          />
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            <Field label="Invoice Title">
              <TextInput value={invoiceTitle} onChange={(event) => setInvoiceTitle(event.target.value)} />
            </Field>
            <Field label="Message">
              <TextArea value={invoiceMessage} onChange={(event) => setInvoiceMessage(event.target.value)} />
            </Field>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              <Field label="Currency">
                <TextInput value={invoiceCurrency} onChange={(event) => setInvoiceCurrency(event.target.value.toUpperCase())} />
              </Field>
              <Field label="Payment Terms (days)">
                <TextInput value={invoicePaymentTermsDays} onChange={(event) => setInvoicePaymentTermsDays(event.target.value)} />
              </Field>
              <Field label="Collection Mode">
                <select
                  value={invoiceCollectionMode}
                  onChange={(event) => setInvoiceCollectionMode(event.target.value as InvoiceCollectionMode)}
                  style={{
                    minHeight: 48,
                    borderRadius: 18,
                    border: `1px solid ${tokens.color.border}`,
                    padding: "0 14px",
                    background: "#fff"
                  }}
                >
                  <option value="full-payment">full-payment</option>
                  <option value="deposit-and-balance">deposit-and-balance</option>
                </select>
              </Field>
            </div>
            {invoiceCollectionMode === "deposit-and-balance" ? (
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                <Field label="Deposit Type">
                  <select
                    value={invoiceDepositType}
                    onChange={(event) => setInvoiceDepositType(event.target.value as "percentage" | "fixed")}
                    style={{
                      minHeight: 48,
                      borderRadius: 18,
                      border: `1px solid ${tokens.color.border}`,
                      padding: "0 14px",
                      background: "#fff"
                    }}
                  >
                    <option value="percentage">percentage</option>
                    <option value="fixed">fixed</option>
                  </select>
                </Field>
                <Field label="Deposit Value">
                  <TextInput value={invoiceDepositValue} onChange={(event) => setInvoiceDepositValue(event.target.value)} />
                </Field>
              </div>
            ) : null}
            <div style={{ display: "grid", gap: 12 }}>
              {invoiceLines.map((line, index) => (
                <Card key={line.id ?? `invoice-line-${index}`} tone="muted">
                  <div style={{ display: "grid", gap: 10 }}>
                    <TextInput
                      value={line.label}
                      onChange={(event) =>
                        setInvoiceLines((current) =>
                          current.map((candidate, candidateIndex) =>
                            candidateIndex === index ? { ...candidate, label: event.target.value } : candidate
                          )
                        )
                      }
                      placeholder="Line item label"
                    />
                    <TextArea
                      value={line.description}
                      onChange={(event) =>
                        setInvoiceLines((current) =>
                          current.map((candidate, candidateIndex) =>
                            candidateIndex === index ? { ...candidate, description: event.target.value } : candidate
                          )
                        )
                      }
                      placeholder="Description"
                    />
                    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                      <TextInput
                        value={line.quantity}
                        onChange={(event) =>
                          setInvoiceLines((current) =>
                            current.map((candidate, candidateIndex) =>
                              candidateIndex === index ? { ...candidate, quantity: event.target.value } : candidate
                            )
                          )
                        }
                        placeholder="Quantity"
                      />
                      <TextInput
                        value={line.unitAmountMinor}
                        onChange={(event) =>
                          setInvoiceLines((current) =>
                            current.map((candidate, candidateIndex) =>
                              candidateIndex === index ? { ...candidate, unitAmountMinor: event.target.value } : candidate
                            )
                          )
                        }
                        placeholder="Unit amount (minor)"
                      />
                      <TextInput
                        value={line.taxRateBasisPoints}
                        onChange={(event) =>
                          setInvoiceLines((current) =>
                            current.map((candidate, candidateIndex) =>
                              candidateIndex === index ? { ...candidate, taxRateBasisPoints: event.target.value } : candidate
                            )
                          )
                        }
                        placeholder="Tax bps"
                      />
                    </div>
                  </div>
                </Card>
              ))}
              <Button variant="ghost" onClick={addInvoiceLine}>Add Line Item</Button>
            </div>
            {state.invoice && moneySummary ? (
              <Card tone="muted">
                <div style={{ display: "grid", gap: 6 }}>
                  <strong>Invoice Totals</strong>
                  <span style={{ color: tokens.color.textMuted }}>
                    Total: {moneySummary.format(state.invoice.totals.totalMinor / 100)}
                  </span>
                  <span style={{ color: tokens.color.textMuted }}>
                    Paid: {moneySummary.format(state.invoice.totals.amountPaidMinor / 100)}
                  </span>
                  <span style={{ color: tokens.color.textMuted }}>
                    Due: {moneySummary.format(state.invoice.totals.amountDueMinor / 100)}
                  </span>
                </div>
              </Card>
            ) : null}
          </div>
        )}
      </SectionShell>

      <SectionShell eyebrow="Payments" title="Payment Timeline">
        {state.payments.length === 0 ? (
          <StatePanel
            kind="empty"
            title="No payment records yet"
            description="Once a public invoice payment session is created and completed, the payment records will appear here."
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {state.payments.map((payment) => (
              <Card key={payment.id} tone="muted">
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <Badge>{payment.phase}</Badge>
                  <Badge tone={payment.status === "succeeded" ? "success" : payment.status === "failed" ? "warning" : "accent"}>
                    {payment.status}
                  </Badge>
                  <span style={{ color: tokens.color.textMuted }}>
                    {payment.currencyCode} {payment.amountMinor / 100}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
        {errorMessage ? (
          <div style={{ marginTop: 16 }}>
            <StatePanel kind="error" title="Commercial action failed" description={errorMessage} />
          </div>
        ) : null}
      </SectionShell>
    </div>
  );
}
