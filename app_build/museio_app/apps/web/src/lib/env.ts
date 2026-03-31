import { webEnvSchema } from "@museio/validation";

let cachedWebEnv: ReturnType<typeof webEnvSchema.parse> | null = null;

export function getWebEnv() {
  if (!cachedWebEnv) {
    cachedWebEnv = webEnvSchema.parse({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      NEXT_PUBLIC_ENABLE_DEMO_AUTH: process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH
    });
  }

  return cachedWebEnv;
}
