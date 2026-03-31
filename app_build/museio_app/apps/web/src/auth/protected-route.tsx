"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { StatePanel } from "@museio/ui";
import { useAuth } from "./auth-context";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const nextPath =
        typeof window === "undefined"
          ? "/app"
          : `${window.location.pathname}${window.location.search}`;
      router.replace(`/auth/sign-in?next=${encodeURIComponent(nextPath)}`);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <StatePanel
        kind="loading"
        title="Checking session"
        description="Refreshing your creator workspace session before loading protected routes."
      />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
