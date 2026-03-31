"use client";

import { useRouter } from "next/navigation";
import { Badge, Button } from "@museio/ui";
import { useAuth } from "./auth-context";

export function SessionActions() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/auth/sign-in");
  }

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      {user?.email ? <Badge>{user.email}</Badge> : null}
      <Button variant="secondary" size="sm" onClick={() => void handleSignOut()}>
        Sign Out
      </Button>
    </div>
  );
}
