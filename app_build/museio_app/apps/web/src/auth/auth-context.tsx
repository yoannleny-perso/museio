"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { AuthUser, SessionSnapshot } from "@museio/types";
import { getWebSupabaseClient } from "../lib/supabase";

interface AuthContextValue extends SessionSnapshot {
  isLoading: boolean;
  session: Session | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(session: Session | null): AuthUser | null {
  if (!session) {
    return null;
  }

  return {
    authUserId: session.user.id,
    email: session.user.email ?? "",
    role:
      session.user.user_metadata.role === "manager" ||
      session.user.user_metadata.role === "admin" ||
      session.user.user_metadata.role === "support"
        ? session.user.user_metadata.role
        : "artist",
    tenant: {
      tenantId:
        typeof session.user.user_metadata.tenant_id === "string"
          ? session.user.user_metadata.tenant_id
          : session.user.id,
      accountId:
        typeof session.user.user_metadata.account_id === "string"
          ? session.user.user_metadata.account_id
          : session.user.id,
      handle:
        typeof session.user.user_metadata.handle === "string"
          ? session.user.user_metadata.handle
          : undefined
    },
    profile: {
      profileId:
        typeof session.user.user_metadata.profile_id === "string"
          ? session.user.user_metadata.profile_id
          : session.user.id,
      displayName:
        typeof session.user.user_metadata.full_name === "string"
          ? session.user.user_metadata.full_name
          : session.user.email?.split("@")[0] ?? "Museio creator",
      avatarUrl:
        typeof session.user.user_metadata.avatar_url === "string"
          ? session.user.user_metadata.avatar_url
          : undefined,
      onboardingComplete: Boolean(session.user.user_metadata.onboarding_complete)
    }
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let active = true;
    const webSupabase = getWebSupabaseClient();

    webSupabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }

      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription }
    } = webSupabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithPassword(email: string, password: string) {
    const webSupabase = getWebSupabaseClient();
    const { error } = await webSupabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function signUpWithPassword(email: string, password: string) {
    const webSupabase = getWebSupabaseClient();
    const { error } = await webSupabase.auth.signUp({ email, password });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function signOut() {
    const webSupabase = getWebSupabaseClient();
    const { error } = await webSupabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  async function getAccessToken() {
    const webSupabase = getWebSupabaseClient();
    const {
      data: { session: nextSession }
    } = await webSupabase.auth.getSession();

    return nextSession?.access_token ?? null;
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      session,
      isAuthenticated: Boolean(session),
      user: toAuthUser(session),
      signInWithPassword,
      signUpWithPassword,
      signOut,
      getAccessToken
    }),
    [isLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
