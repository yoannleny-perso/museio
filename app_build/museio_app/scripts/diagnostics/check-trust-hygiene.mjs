import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const selfRelativePath = path.relative(rootDir, new URL(import.meta.url).pathname);
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "dist",
  "node_modules",
  "coverage",
  "playwright-report",
  "test-results"
]);
const allowedExtensions = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".yml",
  ".yaml"
]);
const patterns = [
  {
    name: "NODE_TLS_REJECT_UNAUTHORIZED",
    regex: /NODE_TLS_REJECT_UNAUTHORIZED/
  },
  {
    name: "rejectUnauthorized false",
    regex: /rejectUnauthorized\s*:\s*false/
  }
];

const findings = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) {
      continue;
    }

    const entryPath = path.join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      walk(entryPath);
      continue;
    }

    if (!allowedExtensions.has(path.extname(entryPath))) {
      continue;
    }

    const content = readFileSync(entryPath, "utf8");
    const relativePath = path.relative(rootDir, entryPath);

    if (relativePath === selfRelativePath) {
      continue;
    }

    for (const pattern of patterns) {
      if (pattern.regex.test(content)) {
        findings.push({
          file: relativePath,
          pattern: pattern.name
        });
      }
    }
  }
}

walk(rootDir);

if (findings.length > 0) {
  console.log(JSON.stringify({ ok: false, findings }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      findings: []
    },
    null,
    2
  )
);
