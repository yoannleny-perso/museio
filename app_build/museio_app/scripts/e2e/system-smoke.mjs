import { createHmac, randomUUID } from "node:crypto";

const apiUrl = process.env.E2E_API_URL ?? "http://127.0.0.1:4000/api";
const supabaseUrl = process.env.E2E_SUPABASE_URL ?? "http://127.0.0.1:54321";
const publishableKey = process.env.E2E_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = "whsec_mock_local";

if (!publishableKey || !serviceRoleKey) {
  throw new Error(
    "Missing E2E_SUPABASE_PUBLISHABLE_DEFAULT_KEY or E2E_SUPABASE_SERVICE_ROLE_KEY."
  );
}

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

async function requestMaybeJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();

  return {
    status: response.status,
    data: text.length > 0 ? JSON.parse(text) : null
  };
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

async function triggerWebhook({ creatorUserId, invoiceId, jobId, paymentId, sessionId }) {
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
          phase: "deposit"
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

const suffix = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`.toLowerCase();
const creatorEmail = `system-${suffix}-creator@example.com`;
const outsiderEmail = `system-${suffix}-outsider@example.com`;
const password = "Museio!23456";
const artistName = `Museio System Creator ${suffix}`;
const handle = `system-${suffix}`.replace(/[^a-z0-9-]/g, "").slice(0, 40);
const clientName = `System Client ${suffix}`;
const clientEmail = `client-${suffix}@example.com`;
const hiddenBusyTitle = `Private travel ${suffix}`;
const hiddenBusySourceLabel = `Ops calendar ${suffix}`;

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
await apiPut(
  "/portfolio/editor",
  {
    settings: {
      ...editorState.settings,
      handle,
      artistName,
      shortBio: "System smoke creator.",
      fullBio: "End-to-end system smoke data for launch readiness.",
      visibility: "public",
      themeId: "sunset-luxe",
      sections: editorState.settings.sections.map((section) => ({
        ...section,
        enabled: ["hero", "bio", "events", "book-me"].includes(section.kind)
      })),
      sectionOrder: editorState.settings.sections.map((section) => section.id)
    },
    content: {
      ...editorState.content,
      bookMe: {
        heading: "Book this creator",
        description: "System smoke booking form.",
        primaryLabel: "Submit booking request",
        secondaryLabel: "Handled in Museio"
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

const calendarWorkspace = await apiPost(
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

const tomorrow = new Date();
tomorrow.setUTCHours(0, 0, 0, 0);
tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
const blockStartsAt = new Date(tomorrow.getTime() + 12 * 60 * 60 * 1000);
const blockEndsAt = new Date(tomorrow.getTime() + 13 * 60 * 60 * 1000);
const bookingStartsAt = new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000);
const bookingEndsAt = new Date(tomorrow.getTime() + 12 * 60 * 60 * 1000);

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

const publicBookingState = await apiPost(`/booking/public/${handle}/requests`, {
  requester: {
    clientName,
    clientEmail
  },
  eventType: "Launch system smoke",
  eventNotes: "System booking intake.",
  servicePackageNotes: "Deposit path.",
  requestedSlots: [
    {
      startsAt: bookingStartsAt.toISOString(),
      endsAt: bookingEndsAt.toISOString(),
      timezone: "UTC"
    }
  ]
});

const inboxState = await apiGet("/booking/inbox", creatorSession.access_token);
const requestEntry = inboxState.requests.find((request) => request.clientName === clientName);

if (!requestEntry) {
  throw new Error("Booking request not found in creator inbox.");
}

const outsiderInbox = await requestMaybeJson(`${apiUrl}/booking/inbox/${requestEntry.id}`, {
  headers: authHeaders(outsiderSession.access_token)
});

await apiPost(
  `/booking/inbox/${requestEntry.id}/decision`,
  { action: "mark-under-review", note: "System smoke review." },
  creatorSession.access_token
);

const acceptedState = await apiPost(
  `/booking/inbox/${requestEntry.id}/decision`,
  { action: "accept-into-job-draft", note: "System smoke acceptance." },
  creatorSession.access_token
);

const jobId = acceptedState.jobDraft.id;

await apiPut(
  "/commercial/stripe/account",
  { accountId: "acct_ready_demo" },
  creatorSession.access_token
);

const quoteDraft = await apiPost(
  `/commercial/jobs/${jobId}/quotes`,
  { title: "System Smoke Quote", message: "Quote message." },
  creatorSession.access_token
);

const savedQuote = await apiPatch(
  `/commercial/quotes/${quoteDraft.quote.id}`,
  {
    title: "System Smoke Quote",
    message: "Quote message.",
    currencyCode: "AUD",
    lineItems: [
      {
        label: "Performance fee",
        description: "System smoke line item",
        quantity: 1,
        unitAmountMinor: 198000,
        taxRateBasisPoints: 1000,
        sortOrder: 0
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
    title: "System Smoke Invoice",
    message: "Invoice message.",
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
        description: "System smoke invoice line item",
        quantity: 1,
        unitAmountMinor: 198000,
        taxRateBasisPoints: 1000,
        sortOrder: 0
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
const paymentSession = await apiPost(`/commercial/public/invoices/${invoiceToken}/payment-session`, {
  phase: "deposit"
});

const jobState = await apiGet(`/commercial/jobs/${jobId}`, creatorSession.access_token);
const pendingPayment = jobState.payments.find(
  (payment) => payment.status === "pending" && payment.stripeCheckoutSessionId
);

await triggerWebhook({
  creatorUserId: creatorUser.id,
  invoiceId: jobState.invoice.id,
  jobId,
  paymentId: pendingPayment.id,
  sessionId: pendingPayment.stripeCheckoutSessionId
});

const financeWorkspace = await apiGet("/finance/workspace?reportPreset=last-30-days&taxPreset=current-quarter&forecastMode=monthly", creatorSession.access_token);
const clientsWorkspace = await apiGet("/crm/clients", creatorSession.access_token);
const createdClient = clientsWorkspace.clients.find((entry) => entry.client.primaryEmail === clientEmail);

const threadState = await apiPost(
  "/messages/threads",
  {
    clientId: createdClient.client.id,
    subject: "System smoke thread"
  },
  creatorSession.access_token
);

await apiPost(
  `/messages/threads/${threadState.thread.id}/messages`,
  { body: "Creator follow-up from system smoke." },
  creatorSession.access_token
);

await insertClientReply({
  threadId: threadState.thread.id,
  creatorUserId: creatorUser.id,
  clientId: createdClient.client.id,
  body: "Client reply from system smoke."
});

const threadDetail = await apiGet(`/messages/${threadState.thread.id}`, creatorSession.access_token);
const outsiderThread = await requestMaybeJson(`${apiUrl}/messages/${threadState.thread.id}`, {
  headers: authHeaders(outsiderSession.access_token)
});
const publicBookingPage = await apiGet(`/booking/public/${handle}`);

const containsHiddenConflict =
  JSON.stringify(publicBookingPage).includes(hiddenBusyTitle) ||
  JSON.stringify(publicBookingPage).includes(hiddenBusySourceLabel);

console.log(
  JSON.stringify(
    {
      handle,
      requestId: requestEntry.id,
      outsiderRequestStatus: outsiderInbox.status,
      jobId,
      quoteStatus: "accepted",
      invoiceStatus: (await apiGet(`/commercial/jobs/${jobId}`, creatorSession.access_token)).invoice.status,
      paymentStatus: (await apiGet(`/commercial/jobs/${jobId}`, creatorSession.access_token)).payments.find(
        (payment) => payment.id === pendingPayment.id
      )?.status,
      finance: {
        collectedMinor: financeWorkspace.overview.totalCollectedMinor,
        receivablesMinor: financeWorkspace.overview.receivablesMinor,
        balancesOutstandingMinor: financeWorkspace.receivables.balancesOutstandingMinor
      },
      crm: {
        clientId: createdClient.client.id,
        invoiceCount: createdClient.relationship.invoiceCount,
        paymentCount: createdClient.relationship.paymentCount
      },
      messaging: {
        threadId: threadState.thread.id,
        messageCount: threadDetail.messages.length,
        outsiderThreadStatus: outsiderThread.status
      },
      publicAvailability: {
        containsHiddenConflict,
        dayCount: publicBookingPage.availability.length,
        firstWindowCount: publicBookingPage.availability[1]?.windows.length ?? 0
      },
      paymentCheckoutUrl: paymentSession.checkoutUrl
    },
    null,
    2
  )
);
