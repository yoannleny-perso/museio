import { createHmac, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getLocalSupabaseEnv } from "../e2e/local-supabase-env.mjs";

const cwd = process.cwd();
const apiUrl = process.env.MOBILE_QA_API_URL ?? "http://127.0.0.1:4000/api";
const outputPath =
  process.env.MOBILE_QA_OUTPUT_PATH ??
  `${cwd}/production_artifacts/mobile/mobile-qa-session.json`;
const localSupabaseEnv = await getLocalSupabaseEnv(cwd);
const supabaseUrl = localSupabaseEnv.supabaseUrl;
const publishableKey = localSupabaseEnv.publishableKey;
const serviceRoleKey = localSupabaseEnv.serviceRoleKey;
const webhookSecret = "whsec_mock_local";

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const data = text.length > 0 ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      JSON.stringify({
        url,
        status: response.status,
        data
      })
    );
  }

  return data;
}

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`
  };
}

async function createAuthUser({ email, password, fullName }) {
  return requestJson(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        onboarding_complete: true
      }
    })
  });
}

async function signInWithPassword(email, password) {
  return requestJson(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: publishableKey
    },
    body: JSON.stringify({
      email,
      password
    })
  });
}

async function apiGet(path, accessToken) {
  return requestJson(`${apiUrl}${path}`, {
    headers: accessToken ? authHeaders(accessToken) : undefined
  });
}

async function apiPost(path, body, accessToken) {
  return requestJson(`${apiUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? authHeaders(accessToken) : {})
    },
    body: JSON.stringify(body)
  });
}

async function apiPatch(path, body, accessToken) {
  return requestJson(`${apiUrl}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? authHeaders(accessToken) : {})
    },
    body: JSON.stringify(body)
  });
}

async function apiPut(path, body, accessToken) {
  return requestJson(`${apiUrl}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? authHeaders(accessToken) : {})
    },
    body: JSON.stringify(body)
  });
}

async function insertClientReply({ threadId, creatorUserId, clientId, body }) {
  const message = await requestJson(`${supabaseUrl}/rest/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify({
      thread_id: threadId,
      creator_user_id: creatorUserId,
      sender_type: "client",
      sender_client_id: clientId,
      body,
      client_visible: true,
      metadata: {}
    })
  });

  await fetch(`${supabaseUrl}/rest/v1/conversation_threads?id=eq.${threadId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify({
      last_message_preview: body,
      last_message_at: new Date().toISOString()
    })
  });

  return message;
}

async function triggerWebhook({ creatorUserId, invoiceId, jobId, paymentId, sessionId, phase }) {
  const payload = JSON.stringify({
    id: `evt_${randomUUID().replace(/-/g, "")}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        payment_intent: `pi_${randomUUID().replace(/-/g, "")}`,
        metadata: {
          creatorUserId,
          invoiceId,
          jobId,
          paymentId,
          phase
        }
      }
    }
  });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  await requestJson(`${apiUrl}/commercial/stripe/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": `t=${timestamp},v1=${signature}`
    },
    body: payload
  });
}

const suffix = `${Date.now().toString(36)}-${randomUUID().slice(0, 6)}`.toLowerCase();
const creatorEmail = `mobile-${suffix}-creator@example.com`;
const outsiderEmail = `mobile-${suffix}-outsider@example.com`;
const password = "MuseioQA12345";
const artistName = `Museio Mobile QA ${suffix}`;
const handle = `mobile-${suffix}`.replace(/[^a-z0-9-]/g, "").slice(0, 36);
const clientName = `Mobile Client ${suffix}`;
const clientEmail = `client-${suffix}@example.com`;
const secondClientName = `Encore Client ${suffix}`;
const secondClientEmail = `encore-${suffix}@example.com`;
const hiddenBusyTitle = `Private hold ${suffix}`;
const hiddenBusySourceLabel = `Manager calendar ${suffix}`;

const creatorUser = await createAuthUser({
  email: creatorEmail,
  password,
  fullName: artistName
});
await createAuthUser({
  email: outsiderEmail,
  password,
  fullName: `Museio Outsider ${suffix}`
});

const creatorSession = await signInWithPassword(creatorEmail, password);
const outsiderSession = await signInWithPassword(outsiderEmail, password);

const editorState = await apiGet("/portfolio/editor", creatorSession.access_token);
const updatedEditor = await apiPut(
  "/portfolio/editor",
  {
    settings: {
      ...editorState.settings,
      handle,
      artistName,
      shortBio: "Singer, DJ, and creative lead working across intimate events and premium live sets.",
      fullBio:
        "Museio Mobile QA seeds a richer creator profile so the mobile redesign has real copy, ordering, and visibility states to render.",
      visibility: "public",
      themeId: "sunset-luxe",
      sections: editorState.settings.sections.map((section) => ({
        ...section,
        enabled: [
          "hero",
          "bio",
          "videos",
          "music-releases",
          "events",
          "book-me",
          "featured-cards"
        ].includes(section.kind)
      })),
      sectionOrder: editorState.settings.sections.map((section) => section.id)
    },
    content: {
      ...editorState.content,
      bookMe: {
        heading: "Book Nova for premium events",
        description: "Mobile QA booking surface for testing availability, requests, and follow-through.",
        primaryLabel: "Request a booking",
        secondaryLabel: "Reply within Museio"
      }
    }
  },
  creatorSession.access_token
);

if (updatedEditor.content.videos.length === 0) {
  await apiPost(
    "/portfolio/videos",
    {
      title: "Club showcase reel",
      embedUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
      caption: "A polished vertical for mobile QA."
    },
    creatorSession.access_token
  );
}

if (updatedEditor.content.musicReleases.length === 0) {
  await apiPost(
    "/portfolio/music-releases",
    {
      title: "Midnight Run",
      subtitle: `${artistName} single`,
      links: [
        {
          id: `spotify-${suffix}`,
          label: "Spotify",
          url: "https://open.spotify.com/"
        },
        {
          id: `apple-${suffix}`,
          label: "Apple Music",
          url: "https://music.apple.com/"
        }
      ]
    },
    creatorSession.access_token
  );
}

if (updatedEditor.content.events.length === 0) {
  await apiPost(
    "/portfolio/events",
    {
      title: "Harbour Rooftop Session",
      eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      location: "Sydney Harbour Rooftop",
      ticketUrl: "https://tickets.example.com/"
    },
    creatorSession.access_token
  );
}

if (updatedEditor.content.featuredCards.length === 0) {
  await apiPost(
    "/portfolio/featured-cards",
    {
      title: "Corporate events",
      description: "Private events, launches, and premium receptions.",
      ctaLabel: "View packages",
      ctaUrl: "https://museio.test/packages"
    },
    creatorSession.access_token
  );
}

await apiPut(
  "/booking/availability",
  {
    rules: Array.from({ length: 7 }, (_, weekday) => ({
      weekday,
      startsAtMinute: 10 * 60,
      endsAtMinute: 19 * 60,
      timezone: "UTC"
    })),
    unavailableBlocks: []
  },
  creatorSession.access_token
);

const calendarWorkspace = await apiPost(
  "/calendar/accounts",
  {
    provider: "google-calendar",
    accountLabel: "Nova primary calendar",
    externalAccountId: `google-${suffix}`,
    scopes: ["calendar.readonly"],
    status: "connected",
    syncStatus: "synced"
  },
  creatorSession.access_token
);

const tomorrow = new Date();
tomorrow.setUTCHours(0, 0, 0, 0);
tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
const blockStartsAt = new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000);
const blockEndsAt = new Date(tomorrow.getTime() + 15 * 60 * 60 * 1000);
const bookingStartsAt = new Date(tomorrow.getTime() + 11 * 60 * 60 * 1000);
const bookingEndsAt = new Date(tomorrow.getTime() + 13 * 60 * 60 * 1000);
const bookingStartsAtTwo = new Date(tomorrow.getTime() + 16 * 60 * 60 * 1000);
const bookingEndsAtTwo = new Date(tomorrow.getTime() + 18 * 60 * 60 * 1000);

await apiPost(
  `/calendar/accounts/${calendarWorkspace.accounts[0].id}/import-blocks`,
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

await apiPost(`/booking/public/${handle}/requests`, {
  requester: {
    clientName,
    clientEmail
  },
  eventType: "Brand launch DJ set",
  eventNotes: "Looking for a 3 hour evening headline set.",
  servicePackageNotes: "Would like a premium sound check add-on.",
  requestedSlots: [
    {
      startsAt: bookingStartsAt.toISOString(),
      endsAt: bookingEndsAt.toISOString(),
      timezone: "UTC"
    }
  ]
});

await apiPost(`/booking/public/${handle}/requests`, {
  requester: {
    clientName: secondClientName,
    clientEmail: secondClientEmail
  },
  eventType: "Private rooftop afterparty",
  eventNotes: "Need a short late-night set after a panel event.",
  servicePackageNotes: "A lighter package is fine for this request.",
  requestedSlots: [
    {
      startsAt: bookingStartsAtTwo.toISOString(),
      endsAt: bookingEndsAtTwo.toISOString(),
      timezone: "UTC"
    }
  ]
});

const inboxState = await apiGet("/booking/inbox", creatorSession.access_token);
const requestEntry = inboxState.requests.find((request) => request.clientName === clientName);

if (!requestEntry) {
  throw new Error("Primary booking request not found in creator inbox.");
}

const secondRequest = inboxState.requests.find((request) => request.clientName === secondClientName);
const outsiderInboxStatus = await fetch(`${apiUrl}/booking/inbox/${requestEntry.id}`, {
  headers: authHeaders(outsiderSession.access_token)
}).then((response) => response.status);

await apiPost(
  `/booking/inbox/${requestEntry.id}/decision`,
  { action: "mark-under-review", note: "Mobile QA review." },
  creatorSession.access_token
);

await apiPost(
  `/booking/inbox/${requestEntry.id}/notes`,
  { body: "Confirming logistics before quote preparation." },
  creatorSession.access_token
);

const acceptedState = await apiPost(
  `/booking/inbox/${requestEntry.id}/decision`,
  { action: "accept-into-job-draft", note: "Converting into an active job draft." },
  creatorSession.access_token
);

if (secondRequest) {
  await apiPatch(
    `/booking/inbox/${secondRequest.id}/status`,
    { status: "under-review" },
    creatorSession.access_token
  );
}

const jobId = acceptedState.jobDraft.id;

await apiPut(
  "/commercial/stripe/account",
  { accountId: "acct_ready_demo" },
  creatorSession.access_token
);

const quoteDraft = await apiPost(
  `/commercial/jobs/${jobId}/quotes`,
  { title: "Mobile QA Quote", message: "Quote prepared from the accepted booking." },
  creatorSession.access_token
);

const savedQuote = await apiPatch(
  `/commercial/quotes/${quoteDraft.quote.id}`,
  {
    title: "Mobile QA Quote",
    message: "This quote keeps the line item and totals surfaces populated on mobile.",
    currencyCode: "AUD",
    lineItems: [
      {
        label: "Headline performance fee",
        description: "Premium evening DJ set",
        quantity: 1,
        unitAmountMinor: 165000,
        taxRateBasisPoints: 1000,
        sortOrder: 0
      },
      {
        label: "Travel and setup",
        description: "Transport and onsite technical setup",
        quantity: 1,
        unitAmountMinor: 33000,
        taxRateBasisPoints: 1000,
        sortOrder: 1
      }
    ]
  },
  creatorSession.access_token
);

const sentQuote = await apiPost(
  `/commercial/quotes/${savedQuote.quote.id}/send`,
  {},
  creatorSession.access_token
);

const quoteToken = new URL(sentQuote.publicUrl).pathname.split("/").at(-1);
await apiPost(`/commercial/public/quotes/${quoteToken}/respond`, { action: "accept" });

const invoiceDraft = await apiPost(
  `/commercial/jobs/${jobId}/invoices`,
  { deriveFromAcceptedQuote: true },
  creatorSession.access_token
);

const savedInvoice = await apiPatch(
  `/commercial/invoices/${invoiceDraft.invoice.id}`,
  {
    title: "Mobile QA Invoice",
    message: "Invoice state for mobile finance and jobs QA.",
    currencyCode: "AUD",
    paymentTermsDays: 7,
    collectionMode: "deposit-and-balance",
    depositConfig: {
      type: "percentage",
      value: 30
    },
    lineItems: [
      {
        label: "Headline performance fee",
        description: "Premium evening DJ set",
        quantity: 1,
        unitAmountMinor: 165000,
        taxRateBasisPoints: 1000,
        sortOrder: 0
      },
      {
        label: "Travel and setup",
        description: "Transport and onsite technical setup",
        quantity: 1,
        unitAmountMinor: 33000,
        taxRateBasisPoints: 1000,
        sortOrder: 1
      }
    ]
  },
  creatorSession.access_token
);

const sentInvoice = await apiPost(
  `/commercial/invoices/${savedInvoice.invoice.id}/send`,
  {},
  creatorSession.access_token
);

const invoiceToken = new URL(sentInvoice.publicUrl).pathname.split("/").at(-1);
await apiPost(`/commercial/public/invoices/${invoiceToken}/payment-session`, {
  phase: "deposit"
});

const jobState = await apiGet(`/commercial/jobs/${jobId}`, creatorSession.access_token);
const pendingDeposit = jobState.payments.find(
  (payment) => payment.status === "pending" && payment.phase === "deposit"
);

if (!pendingDeposit) {
  throw new Error("Pending deposit payment not found.");
}

await triggerWebhook({
  creatorUserId: creatorUser.id,
  invoiceId: jobState.invoice.id,
  jobId,
  paymentId: pendingDeposit.id,
  sessionId: pendingDeposit.stripeCheckoutSessionId,
  phase: "deposit"
});

const clientsWorkspace = await apiGet("/crm/clients", creatorSession.access_token);
const createdClient = clientsWorkspace.clients.find((entry) => entry.client.primaryEmail === clientEmail);

if (!createdClient) {
  throw new Error("Client record not created.");
}

const threadState = await apiPost(
  "/messages/threads",
  {
    clientId: createdClient.client.id,
    subject: "Mobile QA follow-up"
  },
  creatorSession.access_token
);

await apiPost(
  `/messages/threads/${threadState.thread.id}/messages`,
  { body: "Sharing updated arrival details for the event." },
  creatorSession.access_token
);

await insertClientReply({
  threadId: threadState.thread.id,
  creatorUserId: creatorUser.id,
  clientId: createdClient.client.id,
  body: "Perfect, thank you. We’ll send the final run sheet tomorrow."
});

const financeWorkspace = await apiGet(
  "/finance/workspace?reportPreset=last-30-days&taxPreset=current-quarter&forecastMode=monthly",
  creatorSession.access_token
);
const calendarState = await apiGet("/calendar", creatorSession.access_token);
const jobsState = await apiGet("/commercial/jobs", creatorSession.access_token);
const messagesState = await apiGet("/messages", creatorSession.access_token);
const threadDetail = await apiGet(`/messages/${threadState.thread.id}`, creatorSession.access_token);
const clientProfile = await apiGet(`/crm/clients/${createdClient.client.id}`, creatorSession.access_token);
const bookingDetail = await apiGet(`/booking/inbox/${requestEntry.id}`, creatorSession.access_token);
const jobDetail = await apiGet(`/commercial/jobs/${jobId}`, creatorSession.access_token);

const output = {
  creator: {
    email: creatorEmail,
    password,
    fullName: artistName,
    accessToken: creatorSession.access_token,
    refreshToken: creatorSession.refresh_token
  },
  routeContext: {
    handle,
    primaryBookingRequestId: requestEntry.id,
    secondaryBookingRequestId: secondRequest?.id ?? null,
    jobId,
    clientId: createdClient.client.id,
    threadId: threadState.thread.id
  },
  assertions: {
    outsiderInboxStatus,
    bookingStatus: bookingDetail.request.status,
    jobStatus: jobDetail.job.status,
    quoteStatus: jobDetail.quote?.status ?? null,
    invoiceStatus: jobDetail.invoice?.status ?? null,
    financeCollectedMinor: financeWorkspace.overview.totalCollectedMinor,
    threadMessageCount: threadDetail.messages.length,
    clientTimelineCount: clientProfile.timeline.length,
    calendarConflictCount: calendarState.conflicts.length,
    jobCount: jobsState.jobs.length,
    messageThreadCount: messagesState.threads.length
  }
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
