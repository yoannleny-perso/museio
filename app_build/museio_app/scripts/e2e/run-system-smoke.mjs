import { spawn } from "node:child_process";
import net from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { getLocalSupabaseEnv } from "./local-supabase-env.mjs";

const cwd = process.cwd();
const children = [];
const randomOffset = Math.floor(Math.random() * 1_000);
async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 50; port += 1) {
    const available = await new Promise((resolve) => {
      const server = net.createServer();
      server.once("error", () => resolve(false));
      server.once("listening", () => {
        server.close(() => resolve(true));
      });
      server.listen(port, "127.0.0.1");
    });

    if (available) {
      return String(port);
    }
  }

  throw new Error(`Could not find an available port near ${startPort}.`);
}

const appPort =
  process.env.SYSTEM_SMOKE_APP_PORT ?? (await findAvailablePort(3100 + randomOffset));
const apiPort =
  process.env.SYSTEM_SMOKE_API_PORT ?? (await findAvailablePort(4100 + randomOffset));
const appUrl = `http://127.0.0.1:${appPort}`;
const apiUrl = `http://127.0.0.1:${apiPort}/api`;
let localSupabaseEnv;

function cleanEnv(extra = {}) {
  const env = {
    ...process.env,
    ...extra
  };

  delete env.SSL_CERT_FILE;
  return env;
}

function spawnBackground(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd ?? cwd,
    env: cleanEnv(options.env),
    stdio: options.stdio ?? "inherit",
    shell: false
  });

  children.push(child);
  return child;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: cleanEnv(options.env),
      stdio: options.stdio ?? "inherit",
      shell: false
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? 1}.`));
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

async function runSupabaseCommand(args) {
  try {
    await runCommand("supabase", args);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      await runCommand("npx", ["--yes", "supabase@latest", ...args]);
      return;
    }

    throw error;
  }
}

async function waitForUrl(url, label) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 120_000) {
    try {
      const response = await fetch(url);

      if (response.ok || response.status < 500) {
        return;
      }
    } catch {}

    await delay(1_000);
  }

  throw new Error(`Timed out waiting for ${label} at ${url}.`);
}

async function cleanup() {
  for (const child of children.splice(0)) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  await delay(1_000);
}

const startedSupabase = process.env.SYSTEM_SMOKE_USE_EXISTING_STACK !== "true";

process.on("SIGINT", async () => {
  await cleanup();
  process.exit(130);
});

process.on("SIGTERM", async () => {
  await cleanup();
  process.exit(143);
});

try {
  if (startedSupabase) {
    await runSupabaseCommand(["start"]);
    await runSupabaseCommand(["db", "reset", "--yes"]);
  }

  localSupabaseEnv = await getLocalSupabaseEnv(cwd);

  spawnBackground("npm", ["exec", "--", "pnpm", "--filter", "@museio/api", "start"], {
    env: {
      API_PORT: apiPort,
      NEXT_PUBLIC_APP_URL: appUrl,
      NEXT_PUBLIC_API_URL: apiUrl,
      SUPABASE_URL: localSupabaseEnv.supabaseUrl,
      SUPABASE_PUBLISHABLE_DEFAULT_KEY: localSupabaseEnv.publishableKey,
      SUPABASE_SERVICE_ROLE_KEY: localSupabaseEnv.serviceRoleKey,
      STRIPE_SECRET_KEY: "sk_test_placeholder",
      STRIPE_WEBHOOK_SECRET: "whsec_mock_local"
    }
  });

  spawnBackground(
    "npx",
    ["next", "dev", "--hostname", "127.0.0.1", "--port", appPort],
    {
      cwd: `${cwd}/apps/web`,
      env: {
        NEXT_PUBLIC_APP_URL: appUrl,
        NEXT_PUBLIC_API_URL: apiUrl,
        NEXT_PUBLIC_SUPABASE_URL: localSupabaseEnv.supabaseUrl,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: localSupabaseEnv.publishableKey
      }
    }
  );

  await waitForUrl(`${apiUrl}/health`, "API");
  await waitForUrl(`${appUrl}/auth/sign-in`, "Web");

  await runCommand(process.execPath, ["./scripts/e2e/system-smoke.mjs"], {
    env: {
      E2E_APP_URL: appUrl,
      E2E_API_URL: apiUrl,
      E2E_SUPABASE_URL: localSupabaseEnv.supabaseUrl,
      E2E_SUPABASE_PUBLISHABLE_DEFAULT_KEY: localSupabaseEnv.publishableKey,
      E2E_SUPABASE_SERVICE_ROLE_KEY: localSupabaseEnv.serviceRoleKey
    }
  });
} finally {
  await cleanup();

  if (startedSupabase) {
    try {
      await runSupabaseCommand(["stop"]);
    } catch {}
  }
}
