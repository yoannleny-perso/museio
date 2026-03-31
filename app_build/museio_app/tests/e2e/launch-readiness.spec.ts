import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

const apiUrl = process.env.E2E_API_URL ?? "http://127.0.0.1:4000/api";
const supabaseUrl = process.env.E2E_SUPABASE_URL ?? "http://127.0.0.1:54321";
const publishableKey = process.env.E2E_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;

if (!publishableKey || !serviceRoleKey) {
  throw new Error(
    "Missing E2E_SUPABASE_PUBLISHABLE_DEFAULT_KEY or E2E_SUPABASE_SERVICE_ROLE_KEY."
  );
}

type SeedScenario = {
  creator: {
    email: string;
    password: string;
    accessToken: string;
  };
  outsider: {
    accessToken: string;
  };
  handle: string;
  artistName: string;
  hiddenBusyTitle: string;
  hiddenBusySourceLabel: string;
  bookingWindow: {
    startsAtLocal: string;
    endsAtLocal: string;
  };
};

async function requestJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ status: number; data: T }> {
  const response = await fetch(url, options);
  const text = await response.text();
  const data = text.length > 0 ? (JSON.parse(text) as T) : (null as T);

  if (!response.ok) {
    throw new Error(
      JSON.stringify({
        status: response.status,
        data
      })
    );
  }

  return {
    status: response.status,
    data
  };
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`
  };
}

async function createAuthUser(params: {
  email: string;
  password: string;
  fullName: string;
}) {
  const response = await requestJson<{ id: string }>(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      email_confirm: true,
      user_metadata: {
        full_name: params.fullName,
        onboarding_complete: true
      }
    })
  });

  return response.data;
}

async function signInWithPassword(email: string, password: string) {
  const response = await requestJson<{ access_token: string; user: { id: string } }>(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: publishableKey
      },
      body: JSON.stringify({
        email,
        password
      })
    }
  );

  return response.data;
}

async function apiGet<T>(path: string, accessToken?: string) {
  return requestJson<T>(`${apiUrl}${path}`, {
    headers: accessToken ? authHeaders(accessToken) : undefined
  });
}

async function apiPost<T>(path: string, body: unknown, accessToken?: string) {
  return requestJson<T>(`${apiUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? authHeaders(accessToken) : {})
    },
    body: JSON.stringify(body)
  });
}

async function apiPut<T>(path: string, body: unknown, accessToken?: string) {
  return requestJson<T>(`${apiUrl}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? authHeaders(accessToken) : {})
    },
    body: JSON.stringify(body)
  });
}

async function seedScenario(label: string): Promise<SeedScenario> {
  const suffix = `${label}-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`.toLowerCase();
  const creatorEmail = `${suffix}-creator@example.com`;
  const outsiderEmail = `${suffix}-outsider@example.com`;
  const password = "Museio!23456";
  const artistName = `Museio ${label} Creator`;
  const handle = `museio-${suffix}`.replace(/[^a-z0-9-]/g, "").slice(0, 40);
  const hiddenBusyTitle = `Internal hold ${suffix}`;
  const hiddenBusySourceLabel = `Ops calendar ${suffix}`;

  await createAuthUser({
    email: creatorEmail,
    password,
    fullName: artistName
  });
  await createAuthUser({
    email: outsiderEmail,
    password,
    fullName: `Museio ${label} Outsider`
  });

  const creatorSession = await signInWithPassword(creatorEmail, password);
  const outsiderSession = await signInWithPassword(outsiderEmail, password);

  const editorState = await apiGet<{
    settings: {
      handle: string;
      artistName: string;
      visibility: "private" | "public";
      themeId: string;
      sections: Array<{ id: string; kind: string; enabled: boolean }>;
      sectionOrder: string[];
      updatedAt: string;
      accountId: string;
      portfolioId: string;
      portraitUrl?: string;
      shortBio: string;
      fullBio: string;
      socialLinks: Record<string, string>;
    };
    content: {
      photos: unknown[];
      videos: unknown[];
      musicReleases: unknown[];
      events: unknown[];
      featuredCards: unknown[];
      bookMe: {
        heading: string;
        description: string;
        primaryLabel: string;
        secondaryLabel?: string;
      };
    };
  }>("/portfolio/editor", creatorSession.access_token);

  const enabledKinds = new Set([
    "hero",
    "bio",
    "videos",
    "music-releases",
    "events",
    "book-me",
    "featured-cards"
  ]);

  await apiPut(
    "/portfolio/editor",
    {
      settings: {
        ...editorState.data.settings,
        handle,
        artistName,
        shortBio: "Creator-first portfolio, booking, and operations smoke scenario.",
        fullBio:
          "This seeded creator verifies portfolio presentation, public booking, creator workflow, commercial acceptance, finance reconciliation, messaging, CRM linkage, and calendar overlay masking.",
        visibility: "public",
        themeId: "sunset-luxe",
        sections: editorState.data.settings.sections.map((section) => ({
          ...section,
          enabled: enabledKinds.has(section.kind)
        })),
        sectionOrder: editorState.data.settings.sections.map((section) => section.id)
      },
      content: {
        ...editorState.data.content,
        bookMe: {
          heading: "Book this creator",
          description:
            "Public requests flow into the protected creator workspace with availability and commercial follow-through.",
          primaryLabel: "Submit booking request",
          secondaryLabel: "Response handled in Museio"
        }
      }
    },
    creatorSession.access_token
  );

  await apiPost(
    "/portfolio/videos",
    {
      title: "Launch Reel",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      caption: "Seeded to keep public live mode intentional during smoke coverage."
    },
    creatorSession.access_token
  );
  await apiPost(
    "/portfolio/music-releases",
    {
      title: "After Hours",
      subtitle: "Smoke Release",
      links: [
        {
          id: randomUUID(),
          label: "Spotify",
          url: "https://open.spotify.com/album/1"
        }
      ]
    },
    creatorSession.access_token
  );
  await apiPost(
    "/portfolio/events",
    {
      title: "Harbour Lights Set",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Sydney Harbour",
      ticketUrl: "https://example.com/tickets"
    },
    creatorSession.access_token
  );

  await apiPut(
    "/booking/availability",
    {
      rules: Array.from({ length: 7 }, (_, weekday) => ({
        weekday,
        startsAtMinute: 9 * 60,
        endsAtMinute: 17 * 60,
        timezone: "UTC"
      })),
      unavailableBlocks: []
    },
    creatorSession.access_token
  );

  const calendarWorkspace = await apiPost<{
    accounts: Array<{ id: string }>;
  }>(
    "/calendar/accounts",
    {
      provider: "google-calendar",
      accountLabel: "Primary calendar",
      externalAccountId: `google-${suffix}`,
      scopes: ["calendar.readonly"],
      status: "connected",
      syncStatus: "synced"
    },
    creatorSession.access_token
  );

  const startOfTomorrow = new Date();
  startOfTomorrow.setUTCHours(0, 0, 0, 0);
  startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);
  const blockStartsAt = new Date(startOfTomorrow.getTime() + 12 * 60 * 60 * 1000);
  const blockEndsAt = new Date(startOfTomorrow.getTime() + 13 * 60 * 60 * 1000);
  const bookingStartsAt = new Date(startOfTomorrow.getTime() + 9 * 60 * 60 * 1000);
  const bookingEndsAt = new Date(startOfTomorrow.getTime() + 12 * 60 * 60 * 1000);

  await apiPost(
    `/calendar/accounts/${calendarWorkspace.data.accounts[0].id}/import-blocks`,
    {
      blocks: [
        {
          startsAt: blockStartsAt.toISOString(),
          endsAt: blockEndsAt.toISOString(),
          timezone: "UTC",
          title: hiddenBusyTitle,
          sourceLabel: hiddenBusySourceLabel,
          rawStatus: "busy"
        }
      ]
    },
    creatorSession.access_token
  );

  return {
    creator: {
      email: creatorEmail,
      password,
      accessToken: creatorSession.access_token
    },
    outsider: {
      accessToken: outsiderSession.access_token
    },
    handle,
    artistName,
    hiddenBusyTitle,
    hiddenBusySourceLabel,
    bookingWindow: {
      startsAtLocal: bookingStartsAt.toISOString().slice(0, 16),
      endsAtLocal: bookingEndsAt.toISOString().slice(0, 16)
    }
  };
}

test("public portfolio and booking stay safe on mobile-sized screens", async ({ page }) => {
  const scenario = await seedScenario("mobile-public");

  await page.goto(`/${scenario.handle}`);
  await expect(page.getByText(scenario.artistName)).toBeVisible();
  await expect(page.getByRole("link", { name: /book/i }).first()).toBeVisible();

  await page.goto(`/${scenario.handle}/book`);
  await expect(page.getByText(`Book ${scenario.artistName}`)).toBeVisible();
  await expect(page.getByText(scenario.hiddenBusyTitle)).toHaveCount(0);
  await expect(page.getByText(scenario.hiddenBusySourceLabel)).toHaveCount(0);

  await page.getByLabel("Client Name").fill("Mobile Smoke Client");
  await page.getByLabel("Client Email").fill(`mobile-${Date.now()}@example.com`);
  await page.getByLabel("Event Type").fill("Mobile booking smoke");
  await page.getByLabel("Requested Start").fill(scenario.bookingWindow.startsAtLocal);
  await page.getByLabel("Requested End").fill(scenario.bookingWindow.endsAtLocal);
  await page.getByRole("button", { name: "Submit Booking Request" }).click();

  await expect(page.getByText("Booking request submitted")).toBeVisible();
});

test.skip("protected creator routes preserve redirect intent and sign-out isolation", async ({
  page,
  browserName,
  isMobile
}) => {
  test.skip(browserName !== "chromium" || isMobile, "Protected shell smoke runs on desktop Chromium.");

  const scenario = await seedScenario("creator-auth");

  await page.goto("/app/bookings");
  await expect(page).toHaveURL(/\/auth\/sign-in\?next=%2Fapp%2Fbookings/);
  await page.getByLabel("Email").fill(scenario.creator.email);
  await page.getByLabel("Password").fill(scenario.creator.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/app/bookings");
  await expect(page.getByText("Booking Inbox")).toBeVisible();

  await page.goto("/app/calendar");
  await expect(page.getByText("Integrations & conflict center")).toBeVisible();

  await page.goto("/app/finance");
  await expect(page.getByText("Revenue, Receivables, and Tax")).toBeVisible();

  await page.goto("/app/messages");
  await expect(page.getByText("Messages")).toBeVisible();
  await page.getByRole("button", { name: "Sign Out" }).click();
  await page.waitForURL("**/auth/sign-in");

  await page.goto("/app/finance");
  await expect(page).toHaveURL(/\/auth\/sign-in\?next=%2Fapp%2Ffinance/);
});
