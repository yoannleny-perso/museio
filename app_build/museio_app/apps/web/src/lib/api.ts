"use client";

import type {
  CalendarIntegrationWorkspaceState,
  AddPortfolioSectionInput,
  ApplyBookingDecisionInput,
  ConversationThreadDetailState,
  CreateConversationThreadInput,
  FinanceExportInput,
  FinanceExportPayload,
  FinanceWorkspaceFilters,
  FinanceWorkspaceState,
  CreateMessageInput,
  CreateBookingInternalNoteInput,
  CreateInvoiceDraftInput,
  CreateInvoicePaymentSessionInput,
  CreatePublicBookingRequestInput,
  CreateQuoteDraftInput,
  CreatorClientsState,
  CreatorCommercialActionResult,
  CreatorCommercialJobsState,
  CreatorCommercialJobState,
  CreatorBookingInboxState,
  CreatorBookingRequestDetail,
  CreatorMessagingState,
  CreatorClientProfileState,
  CreatePortfolioEventInput,
  CreatePortfolioFeaturedCardInput,
  CreatePortfolioMusicReleaseInput,
  CreatePortfolioPhotoInput,
  CreatePortfolioVideoInput,
  ImportExternalBusyBlocksInput,
  MarkThreadReadInput,
  PublicBookingPageState,
  PublicInvoiceState,
  PublicQuoteState,
  PortfolioEditorState,
  ReorderPortfolioSectionsInput,
  SaveInvoiceDraftInput,
  SaveQuoteDraftInput,
  UpdateBookingRequestStatusInput,
  UpdateClientProfileInput,
  UpdateFinanceTaxProfileInput,
  UpdateCreatorAvailabilityInput,
  UpsertExternalCalendarAccountInput,
  UpdateStripeConnectedAccountInput,
  UpdatePortfolioEventInput,
  UpdatePortfolioFeaturedCardInput,
  UpdatePortfolioInput,
  UpdatePortfolioMusicReleaseInput,
  UpdatePortfolioPhotoInput,
  UpdatePortfolioVideoInput
} from "@museio/types";
import { getWebEnv } from "./env";

function getApiBaseUrl() {
  return getWebEnv().NEXT_PUBLIC_API_URL.replace(/\/$/, "");
}

async function parseResponse<T>(response: Response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function requestJson<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers ?? {})
    }
  });

  return parseResponse<T>(response);
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`
  };
}

export async function fetchPortfolioEditorState(accessToken: string) {
  return requestJson<PortfolioEditorState>("/portfolio/editor", {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function fetchCreatorBookingInbox(accessToken: string) {
  return requestJson<CreatorBookingInboxState>("/booking/inbox", {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function fetchCreatorBookingRequestDetail(
  accessToken: string,
  requestId: string
) {
  return requestJson<CreatorBookingRequestDetail>(`/booking/inbox/${requestId}`, {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function saveCreatorAvailability(
  accessToken: string,
  payload: UpdateCreatorAvailabilityInput
) {
  return requestJson<CreatorBookingInboxState>("/booking/availability", {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function updateBookingRequestStatus(
  accessToken: string,
  requestId: string,
  payload: UpdateBookingRequestStatusInput
) {
  return requestJson<CreatorBookingRequestDetail>(
    `/booking/inbox/${requestId}/status`,
    {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload)
    }
  );
}

export async function applyBookingDecision(
  accessToken: string,
  requestId: string,
  payload: ApplyBookingDecisionInput
) {
  return requestJson<CreatorBookingRequestDetail>(
    `/booking/inbox/${requestId}/decision`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload)
    }
  );
}

export async function createBookingInternalNote(
  accessToken: string,
  requestId: string,
  payload: CreateBookingInternalNoteInput
) {
  return requestJson<CreatorBookingRequestDetail>(`/booking/inbox/${requestId}/notes`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function fetchPublicBookingPage(handle: string) {
  return requestJson<PublicBookingPageState>(`/booking/public/${handle}`, {
    cache: "no-store"
  });
}

export async function createPublicBookingRequest(
  handle: string,
  payload: CreatePublicBookingRequestInput
) {
  return requestJson<PublicBookingPageState>(`/booking/public/${handle}/requests`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function savePortfolioEditorState(
  accessToken: string,
  payload: UpdatePortfolioInput
) {
  return requestJson<PortfolioEditorState>("/portfolio/editor", {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function addPortfolioSection(
  accessToken: string,
  payload: AddPortfolioSectionInput
) {
  return requestJson<PortfolioEditorState>("/portfolio/sections", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function reorderPortfolioSections(
  accessToken: string,
  payload: ReorderPortfolioSectionsInput
) {
  return requestJson<PortfolioEditorState>("/portfolio/sections/order", {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function removePortfolioSection(accessToken: string, sectionId: string) {
  return requestJson<PortfolioEditorState>(`/portfolio/sections/${sectionId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken)
  });
}

export async function uploadPortfolioPortrait(accessToken: string, file: File) {
  const formData = new FormData();
  formData.set("file", file);

  return requestJson<PortfolioEditorState>("/portfolio/portrait-image", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: formData
  });
}

export async function deletePortfolioPortrait(accessToken: string) {
  return requestJson<PortfolioEditorState>("/portfolio/portrait-image", {
    method: "DELETE",
    headers: authHeaders(accessToken)
  });
}

export async function createPortfolioPhoto(
  accessToken: string,
  payload: CreatePortfolioPhotoInput,
  file: File
) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("altText", payload.altText);

  if (payload.caption) {
    formData.set("caption", payload.caption);
  }

  return requestJson<PortfolioEditorState>("/portfolio/photos", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: formData
  });
}

export async function updatePortfolioPhoto(
  accessToken: string,
  photoId: string,
  payload: UpdatePortfolioPhotoInput
) {
  return requestJson<PortfolioEditorState>(`/portfolio/photos/${photoId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function replacePortfolioPhotoImage(
  accessToken: string,
  photoId: string,
  file: File
) {
  const formData = new FormData();
  formData.set("file", file);

  return requestJson<PortfolioEditorState>(`/portfolio/photos/${photoId}/image`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: formData
  });
}

export async function deletePortfolioPhoto(accessToken: string, photoId: string) {
  return requestJson<PortfolioEditorState>(`/portfolio/photos/${photoId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken)
  });
}

export async function createPortfolioVideo(
  accessToken: string,
  payload: CreatePortfolioVideoInput
) {
  return requestJson<PortfolioEditorState>("/portfolio/videos", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function updatePortfolioVideo(
  accessToken: string,
  videoId: string,
  payload: UpdatePortfolioVideoInput
) {
  return requestJson<PortfolioEditorState>(`/portfolio/videos/${videoId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function deletePortfolioVideo(accessToken: string, videoId: string) {
  return requestJson<PortfolioEditorState>(`/portfolio/videos/${videoId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken)
  });
}

export async function createPortfolioMusicRelease(
  accessToken: string,
  payload: CreatePortfolioMusicReleaseInput
) {
  return requestJson<PortfolioEditorState>("/portfolio/music-releases", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function updatePortfolioMusicRelease(
  accessToken: string,
  releaseId: string,
  payload: UpdatePortfolioMusicReleaseInput
) {
  return requestJson<PortfolioEditorState>(
    `/portfolio/music-releases/${releaseId}`,
    {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload)
    }
  );
}

export async function uploadPortfolioMusicReleaseCover(
  accessToken: string,
  releaseId: string,
  file: File
) {
  const formData = new FormData();
  formData.set("file", file);

  return requestJson<PortfolioEditorState>(
    `/portfolio/music-releases/${releaseId}/image`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: formData
    }
  );
}

export async function deletePortfolioMusicReleaseCover(
  accessToken: string,
  releaseId: string
) {
  return requestJson<PortfolioEditorState>(
    `/portfolio/music-releases/${releaseId}/image`,
    {
      method: "DELETE",
      headers: authHeaders(accessToken)
    }
  );
}

export async function deletePortfolioMusicRelease(
  accessToken: string,
  releaseId: string
) {
  return requestJson<PortfolioEditorState>(`/portfolio/music-releases/${releaseId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken)
  });
}

export async function createPortfolioEvent(
  accessToken: string,
  payload: CreatePortfolioEventInput
) {
  return requestJson<PortfolioEditorState>("/portfolio/events", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function updatePortfolioEvent(
  accessToken: string,
  eventId: string,
  payload: UpdatePortfolioEventInput
) {
  return requestJson<PortfolioEditorState>(`/portfolio/events/${eventId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function uploadPortfolioEventImage(
  accessToken: string,
  eventId: string,
  file: File
) {
  const formData = new FormData();
  formData.set("file", file);

  return requestJson<PortfolioEditorState>(`/portfolio/events/${eventId}/image`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: formData
  });
}

export async function deletePortfolioEventImage(
  accessToken: string,
  eventId: string
) {
  return requestJson<PortfolioEditorState>(`/portfolio/events/${eventId}/image`, {
    method: "DELETE",
    headers: authHeaders(accessToken)
  });
}

export async function deletePortfolioEvent(accessToken: string, eventId: string) {
  return requestJson<PortfolioEditorState>(`/portfolio/events/${eventId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken)
  });
}

export async function createPortfolioFeaturedCard(
  accessToken: string,
  payload: CreatePortfolioFeaturedCardInput
) {
  return requestJson<PortfolioEditorState>("/portfolio/featured-cards", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function updatePortfolioFeaturedCard(
  accessToken: string,
  cardId: string,
  payload: UpdatePortfolioFeaturedCardInput
) {
  return requestJson<PortfolioEditorState>(`/portfolio/featured-cards/${cardId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function uploadPortfolioFeaturedCardImage(
  accessToken: string,
  cardId: string,
  file: File
) {
  const formData = new FormData();
  formData.set("file", file);

  return requestJson<PortfolioEditorState>(
    `/portfolio/featured-cards/${cardId}/image`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: formData
    }
  );
}

export async function deletePortfolioFeaturedCardImage(
  accessToken: string,
  cardId: string
) {
  return requestJson<PortfolioEditorState>(
    `/portfolio/featured-cards/${cardId}/image`,
    {
      method: "DELETE",
      headers: authHeaders(accessToken)
    }
  );
}

export async function deletePortfolioFeaturedCard(
  accessToken: string,
  cardId: string
) {
  return requestJson<PortfolioEditorState>(`/portfolio/featured-cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken)
  });
}

export async function fetchCreatorCommercialJobs(accessToken: string) {
  return requestJson<CreatorCommercialJobsState>("/commercial/jobs", {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function fetchCreatorCommercialJobState(
  accessToken: string,
  jobId: string
) {
  return requestJson<CreatorCommercialJobState>(`/commercial/jobs/${jobId}`, {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function fetchStripeReadiness(accessToken: string) {
  return requestJson<CreatorCommercialJobsState["stripe"]>("/commercial/stripe/readiness", {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function updateStripeConnectedAccount(
  accessToken: string,
  payload: UpdateStripeConnectedAccountInput
) {
  return requestJson<CreatorCommercialJobsState["stripe"]>("/commercial/stripe/account", {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function createQuoteDraft(
  accessToken: string,
  jobId: string,
  payload: CreateQuoteDraftInput = {}
) {
  return requestJson<CreatorCommercialJobState>(`/commercial/jobs/${jobId}/quotes`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function saveQuoteDraft(
  accessToken: string,
  quoteId: string,
  payload: SaveQuoteDraftInput
) {
  return requestJson<CreatorCommercialJobState>(`/commercial/quotes/${quoteId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function sendQuote(accessToken: string, quoteId: string) {
  return requestJson<CreatorCommercialActionResult>(`/commercial/quotes/${quoteId}/send`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({})
  });
}

export async function createInvoiceDraft(
  accessToken: string,
  jobId: string,
  payload: CreateInvoiceDraftInput = {}
) {
  return requestJson<CreatorCommercialJobState>(`/commercial/jobs/${jobId}/invoices`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function saveInvoiceDraft(
  accessToken: string,
  invoiceId: string,
  payload: SaveInvoiceDraftInput
) {
  return requestJson<CreatorCommercialJobState>(`/commercial/invoices/${invoiceId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function sendInvoice(accessToken: string, invoiceId: string) {
  return requestJson<CreatorCommercialActionResult>(`/commercial/invoices/${invoiceId}/send`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({})
  });
}

export async function fetchPublicQuote(token: string) {
  return requestJson<PublicQuoteState>(`/commercial/public/quotes/${token}`, {
    cache: "no-store"
  });
}

export async function respondToPublicQuote(token: string, action: "accept" | "decline") {
  return requestJson<PublicQuoteState>(`/commercial/public/quotes/${token}/respond`, {
    method: "POST",
    body: JSON.stringify({ action })
  });
}

export async function fetchPublicInvoice(token: string) {
  return requestJson<PublicInvoiceState>(`/commercial/public/invoices/${token}`, {
    cache: "no-store"
  });
}

export async function createPublicInvoicePaymentSession(
  token: string,
  payload: CreateInvoicePaymentSessionInput
) {
  return requestJson<{ checkoutUrl: string }>(`/commercial/public/invoices/${token}/payment-session`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchFinanceWorkspace(
  accessToken: string,
  filters: FinanceWorkspaceFilters
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === "string" && value.length > 0) {
      query.set(key, value);
    }
  }

  return requestJson<FinanceWorkspaceState>(`/finance/workspace?${query.toString()}`, {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function saveFinanceTaxProfile(
  accessToken: string,
  payload: UpdateFinanceTaxProfileInput
) {
  return requestJson<FinanceWorkspaceState>("/finance/tax-profile", {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function downloadFinanceExport(
  accessToken: string,
  payload: FinanceExportInput
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string" && value.length > 0) {
      query.set(key, value);
    }
  }

  return requestJson<FinanceExportPayload>(`/finance/export?${query.toString()}`, {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function fetchCreatorMessagingState(accessToken: string) {
  return requestJson<CreatorMessagingState>("/messages", {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function fetchThreadDetail(accessToken: string, threadId: string) {
  return requestJson<ConversationThreadDetailState>(`/messages/${threadId}`, {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function createConversationThread(
  accessToken: string,
  payload: CreateConversationThreadInput
) {
  return requestJson<ConversationThreadDetailState>("/messages/threads", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function createThreadMessage(
  accessToken: string,
  threadId: string,
  payload: CreateMessageInput
) {
  return requestJson<ConversationThreadDetailState>(
    `/messages/threads/${threadId}/messages`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload)
    }
  );
}

export async function markThreadRead(
  accessToken: string,
  threadId: string,
  payload: MarkThreadReadInput = {}
) {
  return requestJson<ConversationThreadDetailState>(`/messages/threads/${threadId}/read`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function fetchCreatorClients(accessToken: string) {
  return requestJson<CreatorClientsState>("/crm/clients", {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function fetchClientProfile(accessToken: string, clientId: string) {
  return requestJson<CreatorClientProfileState>(`/crm/clients/${clientId}`, {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function saveClientProfile(
  accessToken: string,
  clientId: string,
  payload: UpdateClientProfileInput
) {
  return requestJson<CreatorClientProfileState>(`/crm/clients/${clientId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function fetchCalendarWorkspace(accessToken: string) {
  return requestJson<CalendarIntegrationWorkspaceState>("/calendar", {
    cache: "no-store",
    headers: authHeaders(accessToken)
  });
}

export async function upsertCalendarAccount(
  accessToken: string,
  payload: UpsertExternalCalendarAccountInput
) {
  return requestJson<CalendarIntegrationWorkspaceState>("/calendar/accounts", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload)
  });
}

export async function importCalendarBusyBlocks(
  accessToken: string,
  accountId: string,
  payload: ImportExternalBusyBlocksInput
) {
  return requestJson<CalendarIntegrationWorkspaceState>(
    `/calendar/accounts/${accountId}/import-blocks`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload)
    }
  );
}
