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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !publishableKey) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        status: 0,
        error: {
          name: "Error",
          message: "Missing hosted Supabase URL or publishable key.",
          code: "MISSING_ENV"
        }
      },
      null,
      2
    )
  );
  process.exit(1);
}

const target = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/`;
const headers = {
  apikey: publishableKey,
  Authorization: `Bearer ${publishableKey}`
};

try {
  const response = await fetch(target, { headers });
  const body = (await response.text()).slice(0, 160);
  console.log(
    JSON.stringify(
      {
        ok: response.ok,
        status: response.status,
        body
      },
      null,
      2
    )
  );
} catch (error) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        status: 0,
        error: {
          name: error.name,
          message: error.message,
          code: error.cause?.code ?? error.code ?? null
        }
      },
      null,
      2
    )
  );
  process.exit(1);
}
