import type {
  AddPortfolioSectionInput,
  CalendarIntegrationWorkspaceState,
  CreatePortfolioPhotoInput,
  ConversationThreadDetailState,
  CreatorBookingInboxState,
  CreatorBookingRequestDetail,
  CreatorClientProfileState,
  CreatorClientsState,
  CreatorCommercialJobState,
  CreatorCommercialJobsState,
  CreatorMessagingState,
  FinanceWorkspaceFilters,
  FinanceWorkspaceState,
  PortfolioEditorState,
  ReorderPortfolioSectionsInput,
  UpdatePortfolioInput
} from "@museio/types";
import { getMobileEnv } from "./env";

function getApiBaseUrl() {
  const baseUrl = getMobileEnv().EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
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
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {})
    }
  });

  return parseResponse<T>(response);
}

type UploadableFile = {
  uri: string;
  name?: string;
  type?: string;
};

async function requestMultipart<T>(
  path: string,
  accessToken: string,
  fields: Record<string, string | undefined>,
  file: UploadableFile,
  method = "POST"
) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (typeof value === "string") {
      formData.append(key, value);
    }
  });

  const filename = file.name ?? file.uri.split("/").at(-1) ?? `upload-${Date.now()}.jpg`;

  formData.append("file", {
    uri: file.uri,
    name: filename,
    type: file.type ?? "image/jpeg"
  } as never);

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    body: formData,
    headers: authHeaders(accessToken)
  });

  return parseResponse<T>(response);
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`
  };
}

export async function fetchPortfolioEditorSnapshot(accessToken: string) {
  return requestJson<PortfolioEditorState>("/portfolio/editor", {
    headers: authHeaders(accessToken)
  });
}

export async function updatePortfolioEditor(
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

export async function uploadPortfolioPortrait(accessToken: string, file: UploadableFile) {
  return requestMultipart<PortfolioEditorState>("/portfolio/portrait-image", accessToken, {}, file);
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
  file: UploadableFile
) {
  return requestMultipart<PortfolioEditorState>(
    "/portfolio/photos",
    accessToken,
    {
      altText: payload.altText,
      caption: payload.caption
    },
    file
  );
}

export async function deletePortfolioPhoto(accessToken: string, photoId: string) {
  return requestJson<PortfolioEditorState>(`/portfolio/photos/${photoId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken)
  });
}

export async function fetchCreatorBookingInbox(accessToken: string) {
  return requestJson<CreatorBookingInboxState>("/booking/inbox", {
    headers: authHeaders(accessToken)
  });
}

export async function fetchCreatorBookingRequestDetail(
  accessToken: string,
  requestId: string
) {
  return requestJson<CreatorBookingRequestDetail>(`/booking/inbox/${requestId}`, {
    headers: authHeaders(accessToken)
  });
}

export async function fetchCommercialJobs(accessToken: string) {
  return requestJson<CreatorCommercialJobsState>("/commercial/jobs", {
    headers: authHeaders(accessToken)
  });
}

export async function fetchCommercialJobDetail(accessToken: string, jobId: string) {
  return requestJson<CreatorCommercialJobState>(`/commercial/jobs/${jobId}`, {
    headers: authHeaders(accessToken)
  });
}

export async function fetchFinanceWorkspace(
  accessToken: string,
  filters: FinanceWorkspaceFilters = {}
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const suffix = params.toString().length > 0 ? `?${params.toString()}` : "";

  return requestJson<FinanceWorkspaceState>(`/finance/workspace${suffix}`, {
    headers: authHeaders(accessToken)
  });
}

export async function fetchMessagingState(accessToken: string) {
  return requestJson<CreatorMessagingState>("/messages", {
    headers: authHeaders(accessToken)
  });
}

export async function fetchThreadDetail(accessToken: string, threadId: string) {
  return requestJson<ConversationThreadDetailState>(`/messages/${threadId}`, {
    headers: authHeaders(accessToken)
  });
}

export async function fetchClientsState(accessToken: string) {
  return requestJson<CreatorClientsState>("/crm/clients", {
    headers: authHeaders(accessToken)
  });
}

export async function fetchClientProfile(accessToken: string, clientId: string) {
  return requestJson<CreatorClientProfileState>(`/crm/clients/${clientId}`, {
    headers: authHeaders(accessToken)
  });
}

export async function fetchCalendarWorkspace(accessToken: string) {
  return requestJson<CalendarIntegrationWorkspaceState>("/calendar", {
    headers: authHeaders(accessToken)
  });
}
