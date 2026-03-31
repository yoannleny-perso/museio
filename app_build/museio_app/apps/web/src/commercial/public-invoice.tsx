"use client";

import { useState } from "react";
import type { InvoicePaymentPhase, PublicInvoiceState } from "@museio/types";
import { Badge, Button, Card, SectionShell, StatePanel, tokens } from "@museio/ui";
import { createPublicInvoicePaymentSession } from "../lib/api";

export function PublicInvoice({ initialState, token }: { initialState: PublicInvoiceState; token: string }) {
  const [state] = useState(initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePayment(phase: InvoicePaymentPhase) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await createPublicInvoicePaymentSession(token, { phase });
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not start payment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionShell eyebrow="Invoice" title={state.invoice.title}>
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Badge tone="accent">{state.invoice.status}</Badge>
          <Badge>{state.artistName}</Badge>
          <Badge>{state.clientName}</Badge>
        </div>
        <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
          {state.invoice.message || "Review the invoice and continue to the payment step."}
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {state.invoice.lineItems.map((item) => (
            <Card key={item.id} tone="muted">
              <div style={{ display: "grid", gap: 6 }}>
                <strong>{item.label}</strong>
                <span style={{ color: tokens.color.textMuted }}>{item.description || "No description provided."}</span>
                <span style={{ color: tokens.color.textMuted }}>
                  Qty {item.quantity} · {(item.lineTotalMinor / 100).toFixed(2)} {state.invoice.currencyCode}
                </span>
              </div>
            </Card>
          ))}
        </div>
        <Card tone="default">
          <div style={{ display: "grid", gap: 6 }}>
            <strong>Invoice Totals</strong>
            <span>Total: {(state.invoice.totals.totalMinor / 100).toFixed(2)} {state.invoice.currencyCode}</span>
            <span>Paid: {(state.invoice.totals.amountPaidMinor / 100).toFixed(2)} {state.invoice.currencyCode}</span>
            <span>Due: {(state.invoice.totals.amountDueMinor / 100).toFixed(2)} {state.invoice.currencyCode}</span>
            {state.invoice.collectionMode === "deposit-and-balance" ? (
              <span>Deposit: {(state.invoice.totals.depositAmountMinor / 100).toFixed(2)} {state.invoice.currencyCode}</span>
            ) : null}
          </div>
        </Card>
        {state.canPay ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {state.availablePaymentPhases.map((phase) => (
              <Button key={phase} disabled={isSubmitting} onClick={() => void handlePayment(phase)}>
                {phase === "full" ? "Pay Invoice" : phase === "deposit" ? "Pay Deposit" : "Pay Balance"}
              </Button>
            ))}
          </div>
        ) : (
          <StatePanel
            kind="empty"
            title="No payment action available"
            description="This invoice is not currently awaiting an online payment action."
          />
        )}
        {errorMessage ? (
          <StatePanel kind="error" title="Could not start payment" description={errorMessage} />
        ) : null}
      </div>
    </SectionShell>
  );
}
