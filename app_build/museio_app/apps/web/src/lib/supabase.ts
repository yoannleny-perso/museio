import { createClient } from "@supabase/supabase-js";
import { getWebEnv } from "./env";

let webSupabaseClient: ReturnType<typeof createClient> | null = null;

export function getWebSupabaseClient() {
  if (!webSupabaseClient) {
    const webEnv = getWebEnv();
    const publishableKey =
      webEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
      webEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!publishableKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    webSupabaseClient = createClient(
      webEnv.NEXT_PUBLIC_SUPABASE_URL,
      publishableKey
    );
  }

  return webSupabaseClient;
}
