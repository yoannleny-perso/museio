import { mobileEnvSchema } from "@museio/validation";

let cachedMobileEnv: ReturnType<typeof mobileEnvSchema.parse> | null = null;

export function getMobileEnv() {
  if (!cachedMobileEnv) {
    cachedMobileEnv = mobileEnvSchema.parse({
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
        process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      EXPO_PUBLIC_ENABLE_DEMO_AUTH: process.env.EXPO_PUBLIC_ENABLE_DEMO_AUTH
    });
  }

  return cachedMobileEnv;
}
