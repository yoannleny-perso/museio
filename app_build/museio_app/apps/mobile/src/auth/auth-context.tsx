import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import type { AuthUser, SessionSnapshot } from "@museio/types";
import { getMobileSupabaseClient } from "../lib/supabase";

interface AuthContextValue extends SessionSnapshot {
  isLoading: boolean;
  session: Session | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
    const mobileSupabase = getMobileSupabaseClient();

    async function bootstrap() {
      const { data } = await mobileSupabase.auth.getSession();

      if (!active) {
        return;
      }

      if (data.session) {
        const { data: userData, error } = await mobileSupabase.auth.getUser(data.session.access_token);

        if (!active) {
          return;
        }

        if (error || !userData.user) {
          await mobileSupabase.auth.signOut();

          if (!active) {
            return;
          }

          setSession(null);
          setIsLoading(false);
          return;
        }

        setSession(data.session);
        setIsLoading(false);
        return;
      }

      setSession(null);
      setIsLoading(false);
    }

    void bootstrap();

    const {
      data: { subscription }
    } = mobileSupabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithPassword(email: string, password: string) {
    const mobileSupabase = getMobileSupabaseClient();
    const { data, error } = await mobileSupabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    setSession(data.session ?? null);
  }

  async function signInWithGoogle() {
    if (Platform.OS !== "web") {
      throw new Error("Google sign-in is available in the browser preview for now.");
    }

    const mobileSupabase = getMobileSupabaseClient();
    const webLocation = (globalThis as { location?: { origin?: string } }).location;
    const redirectTo =
      webLocation?.origin
        ? `${webLocation.origin}/sign-in`
        : undefined;

    const { error } = await mobileSupabase.auth.signInWithOAuth({
      provider: "google",
      options: redirectTo ? { redirectTo } : undefined
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function signUpWithPassword(email: string, password: string) {
    const mobileSupabase = getMobileSupabaseClient();
    const { error } = await mobileSupabase.auth.signUp({ email, password });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function signOut() {
    const mobileSupabase = getMobileSupabaseClient();
    const { error } = await mobileSupabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  async function getAccessToken() {
    const mobileSupabase = getMobileSupabaseClient();
    const {
      data: { session: nextSession }
    } = await mobileSupabase.auth.getSession();

    if (nextSession?.access_token) {
      return nextSession.access_token;
    }

    return null;
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      session,
      isAuthenticated: Boolean(session),
      user: toAuthUser(session),
      signInWithPassword,
      signInWithGoogle,
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
