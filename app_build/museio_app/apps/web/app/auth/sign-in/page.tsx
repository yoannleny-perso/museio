"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Field, TextInput, tokens } from "@museio/ui";
import { useAuth } from "../../../src/auth/auth-context";
import { MuseioBrandLockup } from "../../../src/brand/brand-kit";

const signInHighlights = [
  "Edit your public portfolio without mixing creator controls into live mode.",
  "Review booking demand, availability, and conversion into jobs from one shell.",
  "Carry jobs into quotes, invoices, deposits, finance, and messaging with one source of truth."
];

export default function SignInShell() {
  const router = useRouter();
  const { signInWithPassword, signUpWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(mode: "sign-in" | "sign-up") {
    setIsSubmitting(true);
    setErrorMessage("");
    setMessage("");

    try {
      if (mode === "sign-in") {
        await signInWithPassword(email, password);
        const nextPath =
          typeof window === "undefined"
            ? null
            : new URLSearchParams(window.location.search).get("next");
        router.replace(nextPath && nextPath.startsWith("/") ? nextPath : "/app");
      } else {
        await signUpWithPassword(email, password);
        setMessage(
          "Account created. If email confirmation is enabled in Supabase, confirm the email before signing in."
        );
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Auth failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24
      }}
    >
      <div
        className="museio-hero-grid"
        style={{
          width: "min(100%, 1180px)",
          display: "grid",
          gap: 20,
          gridTemplateColumns: "minmax(0, 1.08fr) minmax(340px, 0.92fr)"
        }}
      >
        <Card
          tone="default"
          style={{
            padding: 0,
            overflow: "hidden",
            background:
              "radial-gradient(circle at top left, rgba(122,66,232,0.12), transparent 22%), radial-gradient(circle at top right, rgba(255,179,138,0.2), transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,244,252,0.98) 100%)"
          }}
        >
          <div style={{ padding: 34, display: "grid", gap: 20 }}>
            <MuseioBrandLockup imageHeight={44} />

            <Badge tone="accent">Protected creator access</Badge>
            <div style={{ display: "grid", gap: 14, maxWidth: 720 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(3rem, 7vw, 5.8rem)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.07em"
                }}
              >
                Step back into your brand, bookings, and business with less clutter.
              </h1>
              <p
                style={{
                  margin: 0,
                  color: tokens.color.textMuted,
                  lineHeight: 1.85,
                  fontSize: "1.02rem"
                }}
              >
                Museio keeps public portfolio and booking routes clean while the protected creator
                side brings editing, bookings, jobs, commercial flow, finance, CRM, and messaging
                into a calmer operating surface.
              </p>
            </div>

            <div className="museio-stack">
              {signInHighlights.map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "15px 18px",
                    borderRadius: 22,
                    border: `1px solid ${tokens.color.border}`,
                    background: "rgba(255,255,255,0.88)",
                    color: tokens.color.textMuted,
                    lineHeight: 1.7
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card style={{ padding: 30 }}>
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <Badge tone="accent">Supabase session</Badge>
              <h2 style={{ margin: 0, fontSize: "2rem", letterSpacing: "-0.05em" }}>Welcome back</h2>
              <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.75 }}>
                Sign in to continue editing the public experience and managing the protected creator
                workspace.
              </p>
            </div>

            <div className="museio-stack">
              <Field label="Email">
                <TextInput
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="artist@example.com"
                />
              </Field>

              <Field label="Password">
                <TextInput
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </Field>
            </div>

            {errorMessage ? (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 20,
                  background: tokens.color.dangerSoft,
                  color: tokens.color.danger,
                  lineHeight: 1.65
                }}
              >
                {errorMessage}
              </div>
            ) : null}
            {message ? (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 20,
                  background: tokens.color.successSoft,
                  color: tokens.color.success,
                  lineHeight: 1.65
                }}
              >
                {message}
              </div>
            ) : null}

            <div style={{ display: "grid", gap: 10 }}>
              <Button
                size="lg"
                disabled={!email || !password || isSubmitting}
                onClick={() => void handleSubmit("sign-in")}
              >
                {isSubmitting ? "Working…" : "Sign in"}
              </Button>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button
                  variant="secondary"
                  disabled={!email || !password || isSubmitting}
                  onClick={() => void handleSubmit("sign-up")}
                >
                  Create account
                </Button>
                <Link href="/" style={{ textDecoration: "none" }}>
                  <Button variant="ghost">Back to home</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
