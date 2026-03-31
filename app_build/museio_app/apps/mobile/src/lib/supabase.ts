import { createClient } from "@supabase/supabase-js";
import { getMobileEnv } from "./env";

let mobileSupabaseClient: ReturnType<typeof createClient> | null = null;

export function getMobileSupabaseClient() {
  if (!mobileSupabaseClient) {
    const mobileEnv = getMobileEnv();
    const publishableKey =
      mobileEnv.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
      mobileEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!publishableKey) {
      throw new Error(
        "Missing EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY or EXPO_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    mobileSupabaseClient = createClient(
      mobileEnv.EXPO_PUBLIC_SUPABASE_URL,
      publishableKey
    );
  }

  return mobileSupabaseClient;
}
