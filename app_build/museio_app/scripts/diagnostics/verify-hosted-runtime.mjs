import { spawn } from "node:child_process";
import path from "node:path";

const currentSslCertFile = process.env.SSL_CERT_FILE ?? null;
const probeScript = path.join(process.cwd(), "scripts/diagnostics/probe-hosted-supabase.mjs");

function runProbe(env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [probeScript], {
      cwd: process.cwd(),
      env,
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

    child.on("close", () => {
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        resolve({
          ok: false,
          status: 0,
          error: {
            name: "ProbeParseError",
            message: stderr || stdout || "Could not parse probe output.",
            code: "PROBE_PARSE_ERROR"
          }
        });
      }
    });
  });
}

const currentRun = await runProbe(process.env);
const isolatedEnv = { ...process.env };
delete isolatedEnv.SSL_CERT_FILE;
const isolatedRun = await runProbe(isolatedEnv);

console.log(
  JSON.stringify(
    {
      sslCertFileConfigured: currentSslCertFile,
      currentRun,
      isolatedRun
    },
    null,
    2
  )
);
