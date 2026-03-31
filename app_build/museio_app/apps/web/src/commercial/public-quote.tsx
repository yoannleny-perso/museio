"use client";

import { useState } from "react";
import type { PublicQuoteState } from "@museio/types";
import { Badge, Button, Card, SectionShell, StatePanel, tokens } from "@museio/ui";
import { respondToPublicQuote } from "../lib/api";

export function PublicQuote({ initialState, token }: { initialState: PublicQuoteState; token: string }) {
  const [state, setState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAction(action: "accept" | "decline") {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const next = await respondToPublicQuote(token, action);
      setState(next);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not respond to the quote.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionShell eyebrow="Quote" title={state.quote.title}>
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Badge tone="accent">{state.quote.status}</Badge>
          <Badge>{state.artistName}</Badge>
          <Badge>{state.clientName}</Badge>
        </div>
        <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
          {state.quote.message || "Review the quote below and accept or decline it."}
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {state.quote.lineItems.map((item) => (
            <Card key={item.id} tone="muted">
              <div style={{ display: "grid", gap: 6 }}>
                <strong>{item.label}</strong>
                <span style={{ color: tokens.color.textMuted }}>{item.description || "No description provided."}</span>
                <span style={{ color: tokens.color.textMuted }}>
                  Qty {item.quantity} · {(item.lineTotalMinor / 100).toFixed(2)} {state.quote.currencyCode}
                </span>
              </div>
            </Card>
          ))}
        </div>
        <Card tone="default">
          <strong>Total</strong>
          <div style={{ marginTop: 8 }}>
            {(state.quote.totals.totalMinor / 100).toFixed(2)} {state.quote.currencyCode}
          </div>
        </Card>
        {state.canRespond ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button disabled={isSubmitting} onClick={() => void handleAction("accept")}>
              Accept Quote
            </Button>
            <Button variant="danger" disabled={isSubmitting} onClick={() => void handleAction("decline")}>
              Decline Quote
            </Button>
          </div>
        ) : (
          <StatePanel
            kind="empty"
            title="This quote is no longer awaiting a response"
            description="The creator has already received the final quote response state."
          />
        )}
        {errorMessage ? (
          <StatePanel kind="error" title="Could not update quote response" description={errorMessage} />
        ) : null}
      </div>
    </SectionShell>
  );
}
