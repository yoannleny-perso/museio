import { mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { devices, chromium } from "@playwright/test";

const cwd = process.cwd();
const baseUrl = process.env.MOBILE_QA_BASE_URL ?? "http://127.0.0.1:19009";
const sessionPath =
  process.env.MOBILE_QA_SESSION_PATH ??
  join(cwd, "production_artifacts/mobile/mobile-qa-session.json");
const outputDir =
  process.env.MOBILE_QA_SCREENSHOT_DIR ??
  join(cwd, "production_artifacts/screenshots/mobile");

const rawSession = await readFile(sessionPath, "utf8");
const session = JSON.parse(rawSession);

async function requestJson(url, accessToken) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${url} (${response.status})`);
  }

  return response.json();
}

async function ensurePortfolioSection() {
  const editorState = await requestJson(
    "http://127.0.0.1:4000/api/portfolio/editor",
    session.creator.accessToken
  );
  const section =
    editorState.settings.sections.find((entry) => entry.enabled) ??
    editorState.settings.sections[0];

  if (!section) {
    throw new Error("No portfolio sections available for mobile QA.");
  }

  return section;
}

async function waitForText(page, value) {
  await page.getByText(value, { exact: false }).first().waitFor({ state: "visible", timeout: 15000 });
}

async function captureRoute(page, path, filename, waitText) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  if (waitText) {
    await waitForText(page, waitText);
  }
  await page.waitForTimeout(700);
  await page.screenshot({
    path: join(outputDir, filename),
    fullPage: true
  });
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const portfolioSection = await ensurePortfolioSection();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  ...devices["iPhone 14 Pro"],
  baseURL: baseUrl,
  colorScheme: "light"
});
const page = await context.newPage();

await captureRoute(page, "/sign-in", "00-signin.png", "Welcome Back");

await page.goto(
  `${baseUrl}/qa-login?email=${encodeURIComponent(session.creator.email)}&password=${encodeURIComponent(session.creator.password)}`,
  { waitUntil: "domcontentloaded" }
);
await page.waitForURL(/\/app(?:\/)?$/, { timeout: 15000 });
await waitForText(page, "jobs");
await page.waitForTimeout(1000);

await page.screenshot({
  path: join(outputDir, "01-home.png"),
  fullPage: true
});

await page.getByText("More", { exact: true }).click();
await waitForText(page, "Connected Calendars");
await page.waitForTimeout(500);
await page.screenshot({
  path: join(outputDir, "02-more-sheet.png"),
  fullPage: true
});
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

await captureRoute(page, "/app/jobs", "03-jobs-requests.png", "Requests");
await page.getByText("Upcoming", { exact: false }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outputDir, "04-jobs-upcoming.png"), fullPage: true });
await page.getByText("Invoiced", { exact: false }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outputDir, "05-jobs-invoiced.png"), fullPage: true });
await page.getByText("Paid", { exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outputDir, "06-jobs-paid.png"), fullPage: true });
await page.getByText("Drafts", { exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outputDir, "07-jobs-drafts.png"), fullPage: true });

await captureRoute(
  page,
  `/app/bookings/${session.routeContext.primaryBookingRequestId}`,
  "08-booking-detail.png",
  "Client and event snapshot"
);
await captureRoute(
  page,
  `/app/jobs/${session.routeContext.jobId}`,
  "09-job-detail.png",
  "Job basics"
);

await captureRoute(page, "/app/portfolio", "10-portfolio-home.png", "Build your premium creator showcase");
await captureRoute(page, "/app/portfolio-builder", "11-portfolio-builder.png", "Portfolio Builder");
await captureRoute(
  page,
  `/app/portfolio-section/${portfolioSection.id}`,
  "12-portfolio-section-detail.png",
  portfolioSection.title
);
await captureRoute(page, "/app/theme-studio", "13-theme-studio.png", "Theme Studio");
await captureRoute(page, "/app/portfolio-insights", "14-portfolio-insights.png", "Portfolio Insights");

await captureRoute(page, "/app/finance", "15-finance-overview.png", "Track earnings, deposits, GST, and payouts");
await page.getByText("Deposits & Payouts", { exact: false }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outputDir, "16-finance-deposits-payouts.png"), fullPage: true });
await page.getByText("Reports", { exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outputDir, "17-finance-reports.png"), fullPage: true });

await captureRoute(page, "/app/messages", "18-messages.png", "Messages");
await captureRoute(
  page,
  `/app/messages/${session.routeContext.threadId}`,
  "19-message-thread.png",
  "Conversation timeline"
);
await captureRoute(page, "/app/clients", "20-clients.png", "Clients");
await captureRoute(
  page,
  `/app/clients/${session.routeContext.clientId}`,
  "21-client-detail.png",
  "Client basics"
);

await captureRoute(page, "/app/availability", "22-availability-preview.png", "My Availability");
await page.getByText("Manage", { exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outputDir, "23-availability-manage.png"), fullPage: true });
await page.getByText("Availability Layers", { exact: false }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outputDir, "24-availability-layers.png"), fullPage: true });
await page.getByText("Vacations & Blocks", { exact: false }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outputDir, "25-availability-blocks.png"), fullPage: true });

await captureRoute(page, "/app/connected-calendars", "26-connected-calendars.png", "Connected Accounts");
await captureRoute(page, "/app/tax-centre", "27-tax-centre.png", "Tax Centre");
await captureRoute(page, "/app/settings", "28-settings.png", "Settings");

await browser.close();

console.log(
  JSON.stringify(
    {
      outputDir,
      baseUrl,
      screenshotCount: 29
    },
    null,
    2
  )
);
