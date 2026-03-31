import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const workspaceRoot = resolve(import.meta.dirname, "..", "..");
const envPath = resolve(workspaceRoot, ".env.local");

try {
  const raw = readFileSync(envPath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // Environment can also be supplied directly by the operator shell.
}

const required = [
  "SUPABASE_DB_HOST",
  "SUPABASE_DB_USER",
  "SUPABASE_DB_PASSWORD"
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `Missing hosted Supabase env: ${missing.join(", ")}. Set them in .env.local or the current shell.`
  );
  process.exit(1);
}

const dbPort = process.env.SUPABASE_DB_PORT || "5432";
const dbName = process.env.SUPABASE_DB_NAME || "postgres";
const encodedPassword = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
const dbUrl =
  process.env.SUPABASE_DB_URL ||
  `postgresql://${process.env.SUPABASE_DB_USER}:${encodedPassword}@${process.env.SUPABASE_DB_HOST}:${dbPort}/${dbName}?sslmode=require`;

const defaultCliBin = resolve(workspaceRoot, "..", "..", ".local-bin", "supabase");
const cliBin = process.env.SUPABASE_CLI_BIN || (existsSync(defaultCliBin) ? defaultCliBin : "supabase");

const result = spawnSync(
  cliBin,
  ["db", "push", "--db-url", dbUrl, "--include-all"],
  {
    cwd: workspaceRoot,
    stdio: "inherit",
    env: process.env
  }
);

process.exit(result.status ?? 1);
