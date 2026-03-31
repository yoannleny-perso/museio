"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Field, TextInput, tokens } from "@museio/ui";
import { useAuth } from "../../../src/auth/auth-context";

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
        router.replace(nextPath && nextPath.startsWith("/") ? nextPath : "/app/portfolio");
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
        style={{
          width: "min(100%, 1100px)",
          display: "grid",
          gap: 18,
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)"
        }}
        className="museio-hero-grid"
      >
        <Card
          tone="dark"
          style={{
            padding: 32,
            background:
              "radial-gradient(circle at top right, rgba(243,180,131,0.28), transparent 34%), linear-gradient(145deg, #171224 0%, #2b1f42 45%, #7b5cfa 100%)"
          }}
        >
          <div style={{ display: "grid", gap: 18 }}>
            <Badge tone="accent">Creator access</Badge>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.06em"
              }}
            >
              Step back into your brand, bookings, and business.
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.76)", lineHeight: 1.8 }}>
              Museio keeps edit mode protected while public portfolio and booking routes stay clean
              and share-ready. Sign in to manage portfolio, requests, quotes, invoices, and finance.
            </p>
          </div>
        </Card>

        <Card style={{ padding: 28 }}>
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <Badge tone="accent">Supabase auth</Badge>
              <h2 style={{ margin: 0, fontSize: "2rem", letterSpacing: "-0.04em" }}>Welcome back</h2>
              <p style={{ margin: 0, lineHeight: 1.7, color: tokens.color.textMuted }}>
                Sign in to continue editing your public presence and business workspace.
              </p>
            </div>

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

            {errorMessage ? (
              <p style={{ margin: 0, color: tokens.color.danger, lineHeight: 1.7 }}>{errorMessage}</p>
            ) : null}
            {message ? (
              <p style={{ margin: 0, color: tokens.color.success, lineHeight: 1.7 }}>{message}</p>
            ) : null}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button
                disabled={!email || !password || isSubmitting}
                onClick={() => void handleSubmit("sign-in")}
              >
                {isSubmitting ? "Working…" : "Sign in"}
              </Button>
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
        </Card>
      </div>
    </main>
  );
}
