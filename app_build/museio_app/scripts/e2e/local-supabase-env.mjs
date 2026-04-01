import { spawn } from "node:child_process";

function runCommand(command, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(stderr || `${command} ${args.join(" ")} failed with code ${code ?? 1}.`));
    });
  });
}

function parseEnvOutput(raw) {
  const values = {};

  for (const line of raw.split(/\r?\n/)) {
    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value =
      rawValue.startsWith("\"") && rawValue.endsWith("\"")
        ? rawValue.slice(1, -1)
        : rawValue;

    if (key.length > 0) {
      values[key] = value;
    }
  }

  return values;
}

export async function getLocalSupabaseEnv(cwd = process.cwd()) {
  const raw = await runCommand("npx", ["--yes", "supabase@latest", "status", "-o", "env"], cwd);
  const parsed = parseEnvOutput(raw);

  const supabaseUrl = parsed.API_URL ?? parsed.SUPABASE_URL ?? process.env.E2E_SUPABASE_URL;
  const publishableKey =
    parsed.PUBLISHABLE_KEY ??
    parsed.ANON_KEY ??
    process.env.E2E_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  const serviceRoleKey =
    parsed.SERVICE_ROLE_KEY ??
    parsed.SERVICE_ROLE_JWT ??
    process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    throw new Error(
      "Could not resolve local Supabase runtime values. Start Supabase locally first or provide E2E_SUPABASE_* env vars."
    );
  }

  return {
    supabaseUrl,
    publishableKey,
    serviceRoleKey
  };
}
