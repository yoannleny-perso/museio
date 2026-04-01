import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { apiEnvSchema } from "@museio/validation";

const envCandidates = [
  resolve(process.cwd(), "../../.env"),
  resolve(process.cwd(), "../../.env.local"),
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), ".env.local")
];

function applyEnvFile(candidate: string) {
  if (!existsSync(candidate)) {
    return;
  }

  const fileContents = readFileSync(candidate, "utf8");

  for (const line of fileContents.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const normalizedLine = trimmedLine.startsWith("export ")
      ? trimmedLine.slice("export ".length)
      : trimmedLine;
    const separatorIndex = normalizedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalizedLine.slice(0, separatorIndex).trim();
    const rawValue = normalizedLine.slice(separatorIndex + 1).trim();
    const valueMatch = rawValue.match(/^(['"])(.*)\1$/u);
    const parsedValue = valueMatch ? valueMatch[2] : rawValue;

    // Prefer checked-in/local env files over inherited shell variables so
    // preview QA cannot silently drift onto an old local Supabase stack.
    process.env[key] = parsedValue;
  }
}

for (const candidate of envCandidates) {
  applyEnvFile(candidate);
}

export const apiEnv = apiEnvSchema.parse({
  API_PORT: process.env.API_PORT ?? process.env.PORT ?? "4000",
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_PUBLISHABLE_DEFAULT_KEY: process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
});
