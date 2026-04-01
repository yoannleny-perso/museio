import { useEffect, useState } from "react";
import { useAuth } from "../auth/auth-context";
import { getMobileEnv } from "./env";

export function sanitizeErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  if (
    error.message === "Failed to fetch" ||
    error.message.toLowerCase().includes("network request failed") ||
    error.message.toLowerCase().includes("load failed")
  ) {
    return "We couldn't reach Museio right now. Please try again in a moment.";
  }

  if (
    error.message.toLowerCase().includes("session is invalid or expired") ||
    error.message.toLowerCase().includes("jwt") ||
    error.message.toLowerCase().includes("unauthorized")
  ) {
    return "Your session has expired. Please sign in again.";
  }

  try {
    const parsed = JSON.parse(error.message) as { message?: string | string[] };
    return Array.isArray(parsed.message)
      ? parsed.message.join(" ")
      : parsed.message ?? error.message;
  } catch {
    if (error.message.toLowerCase().includes("cors")) {
      return "This preview build can't reach the API from the current browser origin yet.";
    }
    return error.message;
  }
}

export function useProtectedData<T>(
  loader: (accessToken: string) => Promise<T>,
  fallbackMessage: string
) {
  const { getAccessToken, isLoading: isAuthLoading } = useAuth();
  const mobileEnv = getMobileEnv();
  const [state, setState] = useState<T | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let active = true;

    async function run() {
      try {
        const accessToken =
          (await getAccessToken()) ??
          (mobileEnv.EXPO_PUBLIC_ENABLE_DEMO_AUTH ? mobileEnv.EXPO_PUBLIC_QA_ACCESS_TOKEN : null);

        if (!accessToken) {
          throw new Error("A valid session is required.");
        }

        const nextState = await loader(accessToken);

        if (!active) {
          return;
        }

        setState(nextState);
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(sanitizeErrorMessage(error, fallbackMessage));
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
  }, [
    fallbackMessage,
    getAccessToken,
    isAuthLoading,
    loader,
    mobileEnv.EXPO_PUBLIC_ENABLE_DEMO_AUTH,
    mobileEnv.EXPO_PUBLIC_QA_ACCESS_TOKEN
  ]);

  return {
    state,
    isLoading: isLoading || isAuthLoading,
    errorMessage
  };
}
