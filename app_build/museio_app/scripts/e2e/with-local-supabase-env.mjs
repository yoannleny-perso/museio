import { spawn } from "node:child_process";
import { getLocalSupabaseEnv } from "./local-supabase-env.mjs";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node ./scripts/e2e/with-local-supabase-env.mjs <command> [args...]");
  process.exit(1);
}

const [command, ...commandArgs] = args;
const localSupabaseEnv = await getLocalSupabaseEnv(process.cwd());

const child = spawn(command, commandArgs, {
  cwd: process.cwd(),
  stdio: "inherit",
  env: {
    ...process.env,
    E2E_SUPABASE_URL: localSupabaseEnv.supabaseUrl,
    E2E_SUPABASE_PUBLISHABLE_DEFAULT_KEY: localSupabaseEnv.publishableKey,
    E2E_SUPABASE_SERVICE_ROLE_KEY: localSupabaseEnv.serviceRoleKey
  }
});

child.on("error", (error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

child.on("close", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
