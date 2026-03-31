"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Field, TextInput } from "@museio/ui";
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
        padding: 24,
        background:
          "radial-gradient(circle at top, rgba(109, 69, 227, 0.16), transparent 42%), #f5f6fb"
      }}
    >
      <Card style={{ width: "min(100%, 560px)" }}>
        <div style={{ display: "grid", gap: 18 }}>
          <Badge tone="accent">Supabase auth</Badge>
          <div style={{ display: "grid", gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: "2rem" }}>Sign in to edit Portfolio</h1>
            <p style={{ margin: 0, lineHeight: 1.8, color: "#5D6575" }}>
              The Portfolio editor is protected. Public live mode stays at `/:handle`
              and never mixes edit controls into the presentation layer.
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
            <p style={{ margin: 0, color: "#A53B3B", lineHeight: 1.7 }}>{errorMessage}</p>
          ) : null}
          {message ? (
            <p style={{ margin: 0, color: "#2F6B4F", lineHeight: 1.7 }}>{message}</p>
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
    </main>
  );
}
