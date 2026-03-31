import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env.local");

function loadDotEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const raw = readFileSync(filePath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadDotEnvFile(envPath);

const config = {
  appUrl:
    process.env.PREVIEW_APP_URL ??
    process.env.E2E_APP_URL ??
    process.env.PLAYWRIGHT_TEST_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL,
  apiUrl:
    process.env.PREVIEW_API_URL ??
    process.env.E2E_API_URL ??
    process.env.NEXT_PUBLIC_API_URL,
  supabaseUrl:
    process.env.PREVIEW_SUPABASE_URL ??
    process.env.E2E_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  publishableKey:
    process.env.PREVIEW_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.E2E_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  serviceRoleKey:
    process.env.PREVIEW_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY
};

const missing = Object.entries({
  PREVIEW_APP_URL: config.appUrl,
  PREVIEW_API_URL: config.apiUrl,
  PREVIEW_SUPABASE_URL: config.supabaseUrl,
  PREVIEW_SUPABASE_PUBLISHABLE_DEFAULT_KEY: config.publishableKey,
  PREVIEW_SUPABASE_SERVICE_ROLE_KEY: config.serviceRoleKey
})
  .filter(([, value]) => !value)
  .map(([key]) => key);

async function probe(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(5_000)
    });
    const body = (await response.text()).slice(0, 160);
    return {
      ok: response.ok,
      status: response.status,
      body
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: {
        name: error.name,
        message: error.message,
        code: error.cause?.code ?? error.code ?? null
      }
    };
  }
}

const probes = missing.length
  ? {}
  : {
      appRoot: await probe(config.appUrl),
      authSignIn: await probe(`${config.appUrl.replace(/\/$/, "")}/auth/sign-in`),
      apiHealth: await probe(`${config.apiUrl.replace(/\/$/, "")}/health`),
      supabaseAuthSettings: await probe(
        `${config.supabaseUrl.replace(/\/$/, "")}/auth/v1/settings`,
        {
        headers: {
          apikey: config.publishableKey,
          Authorization: `Bearer ${config.publishableKey}`
        }
        }
      )
    };

const mismatchedSupabaseOrigin =
  process.env.SUPABASE_URL &&
  config.supabaseUrl &&
  process.env.SUPABASE_URL.replace(/\/$/, "") !== config.supabaseUrl.replace(/\/$/, "");

const ok =
  missing.length === 0 &&
  Boolean(probes.appRoot?.status && probes.appRoot.status < 500) &&
  Boolean(probes.authSignIn?.status && probes.authSignIn.status < 500) &&
  probes.apiHealth?.ok === true &&
  probes.supabaseAuthSettings?.ok === true &&
  !mismatchedSupabaseOrigin;

console.log(
  JSON.stringify(
    {
      ok,
      sslCertFileConfigured: process.env.SSL_CERT_FILE ?? null,
      missing,
      mismatchedSupabaseOrigin,
      probes
    },
    null,
    2
  )
);

if (!ok) {
  process.exit(1);
}
