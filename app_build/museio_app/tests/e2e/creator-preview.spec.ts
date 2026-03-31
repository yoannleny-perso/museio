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
  await requestJson<{ id: string }>(`${supabaseUrl}/auth/v1/admin/users`, {
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
}

async function signInWithPassword(email: string, password: string) {
  const response = await requestJson<{ access_token: string }>(
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

async function apiPatch<T>(path: string, body: unknown, accessToken?: string) {
  return requestJson<T>(`${apiUrl}${path}`, {
    method: "PATCH",
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

test("preview browser smoke covers protected creator workflow visibility", async ({
  page
}) => {
  const suffix = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`.toLowerCase();
  const creatorEmail = `preview-${suffix}-creator@example.com`;
  const password = "Museio!23456";
  const artistName = `Museio Preview Creator ${suffix}`;
  const handle = `preview-${suffix}`.replace(/[^a-z0-9-]/g, "").slice(0, 40);
  const clientName = `Preview Client ${suffix}`;
  const clientEmail = `preview-client-${suffix}@example.com`;

  await createAuthUser({
    email: creatorEmail,
    password,
    fullName: artistName
  });

  const creatorSession = await signInWithPassword(creatorEmail, password);
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

  await apiPut(
    "/portfolio/editor",
    {
      settings: {
        ...editorState.data.settings,
        handle,
        artistName,
        shortBio: "Preview smoke creator.",
        fullBio: "Protected creator preview smoke seed.",
        visibility: "public",
        themeId: "sunset-luxe",
        socialLinks: {},
        sections: editorState.data.settings.sections.map((section) => ({
          ...section,
          enabled: ["hero", "bio", "events", "book-me"].includes(section.kind)
        })),
        sectionOrder: editorState.data.settings.sections.map((section) => section.id)
      },
      content: {
        ...editorState.data.content,
        bookMe: {
          heading: "Book this creator",
          description: "Preview smoke booking flow.",
          primaryLabel: "Submit booking request",
          secondaryLabel: "Response handled in Museio"
        }
      }
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

  const slotStart = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  slotStart.setUTCHours(12, 0, 0, 0);
  const slotEnd = new Date(slotStart.getTime() + 2 * 60 * 60 * 1000);

  await apiPost(`/booking/public/${handle}/requests`, {
    requester: {
      clientName,
      clientEmail
    },
    eventType: "Preview smoke booking",
    eventNotes: "Preview environment protected creator flow.",
    servicePackageNotes: "Single-slot preview request.",
    requestedSlots: [
      {
        startsAt: slotStart.toISOString(),
        endsAt: slotEnd.toISOString(),
        timezone: "UTC"
      }
    ]
  });

  const inboxState = await apiGet<{
    requests: Array<{ id: string; clientName: string }>;
  }>("/booking/inbox", creatorSession.access_token);
  const requestEntry = inboxState.data.requests.find((request) => request.clientName === clientName);

  if (!requestEntry) {
    throw new Error("Preview booking request was not created.");
  }

  await apiPost(
    `/booking/inbox/${requestEntry.id}/decision`,
    { action: "mark-under-review", note: "Preview review." },
    creatorSession.access_token
  );

  const acceptedState = await apiPost<{
    jobDraft: { id: string };
  }>(
    `/booking/inbox/${requestEntry.id}/decision`,
    { action: "accept-into-job-draft", note: "Preview acceptance." },
    creatorSession.access_token
  );

  const jobId = acceptedState.data.jobDraft.id;

  const quoteDraft = await apiPost<{
    quote: { id: string };
  }>(
    `/commercial/jobs/${jobId}/quotes`,
    { title: "Preview Quote", message: "Preview quote message." },
    creatorSession.access_token
  );

  await apiPatch(
    `/commercial/quotes/${quoteDraft.data.quote.id}`,
    {
      title: "Preview Quote",
      message: "Preview quote message.",
      currencyCode: "AUD",
      lineItems: [
        {
          label: "Performance fee",
          description: "Preview quote line item",
          quantity: 1,
          unitAmountMinor: 125000,
          taxRateBasisPoints: 1000,
          sortOrder: 0
        }
      ]
    },
    creatorSession.access_token
  );

  await apiPost(
    `/commercial/quotes/${quoteDraft.data.quote.id}/send`,
    {},
    creatorSession.access_token
  );

  const invoiceDraft = await apiPost<{
    invoice: { id: string };
  }>(
    `/commercial/jobs/${jobId}/invoices`,
    { deriveFromAcceptedQuote: true },
    creatorSession.access_token
  );

  await apiPatch(
    `/commercial/invoices/${invoiceDraft.data.invoice.id}`,
    {
      title: "Preview Invoice",
      message: "Preview invoice message.",
      currencyCode: "AUD",
      paymentTermsDays: 7,
      collectionMode: "deposit-and-balance",
      depositConfig: {
        type: "percentage",
        value: 30
      },
      lineItems: [
        {
          label: "Performance fee",
          description: "Preview invoice line item",
          quantity: 1,
          unitAmountMinor: 125000,
          taxRateBasisPoints: 1000,
          sortOrder: 0
        }
      ]
    },
    creatorSession.access_token
  );

  await apiPost(
    `/commercial/invoices/${invoiceDraft.data.invoice.id}/send`,
    {},
    creatorSession.access_token
  );

  const clientsState = await apiGet<{
    clients: Array<{ client: { id: string; primaryEmail: string } }>;
  }>("/crm/clients", creatorSession.access_token);
  const client = clientsState.data.clients.find((entry) => entry.client.primaryEmail === clientEmail);

  if (!client) {
    throw new Error("Preview client record was not created.");
  }

  const threadState = await apiPost<{
    thread: { id: string };
  }>(
    "/messages/threads",
    {
      clientId: client.client.id,
      subject: "Preview follow-up thread"
    },
    creatorSession.access_token
  );

  await apiPost(
    `/messages/threads/${threadState.data.thread.id}/messages`,
    { body: "Creator follow-up from preview smoke." },
    creatorSession.access_token
  );

  await page.goto("/app/bookings");
  await expect(page).toHaveURL(/\/auth\/sign-in\?next=%2Fapp%2Fbookings/);
  await expect(page.getByRole("heading", { name: "Sign in to edit Portfolio" })).toBeVisible();

  await page.getByLabel("Email").fill(creatorEmail);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app\/bookings/);
  await expect(page.getByText("Booking Inbox")).toBeVisible();
  await expect(page.getByText(clientName, { exact: true }).first()).toBeVisible();

  await page.goto(`/app/jobs/${jobId}`);
  await expect(page.getByText("Quote Draft")).toBeVisible();
  await expect(page.getByText("Invoice Draft")).toBeVisible();

  await page.goto("/app/finance");
  await expect(page.getByText("Revenue, Receivables, and Tax")).toBeVisible();
  await expect(page.getByText("Invoices and Payments")).toBeVisible();

  await page.goto(`/app/messages/${threadState.data.thread.id}`);
  await expect(page.getByText("Preview follow-up thread")).toBeVisible();
  await expect(page.getByText("Creator follow-up from preview smoke.")).toBeVisible();
});
