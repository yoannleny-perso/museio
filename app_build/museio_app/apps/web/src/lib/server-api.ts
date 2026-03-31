import type {
  PortfolioEditorState,
  PortfolioPublicState,
  PublicBookingPageState,
  PublicInvoiceState,
  PublicQuoteState
} from "@museio/types";
import { getWebEnv } from "./env";

function getApiBaseUrl() {
  return getWebEnv().NEXT_PUBLIC_API_URL.replace(/\/$/, "");
}

export async function fetchEditorStateOnServer() {
  const response = await fetch(`${getApiBaseUrl()}/portfolio/editor`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Could not load the portfolio editor.");
  }

  return (await response.json()) as PortfolioEditorState;
}

export async function fetchPublicPortfolioOnServer(handle: string) {
  const response = await fetch(`${getApiBaseUrl()}/portfolio/public/${handle}`, {
    cache: "no-store"
  });

  if (response.status === 403 || response.status === 404) {
    return {
      status: response.status,
      state: null as PortfolioPublicState | null
    };
  }

  if (!response.ok) {
    throw new Error("Could not load the public portfolio.");
  }

  return {
    status: response.status,
    state: (await response.json()) as PortfolioPublicState
  };
}

export async function fetchPublicBookingPageOnServer(handle: string) {
  const response = await fetch(`${getApiBaseUrl()}/booking/public/${handle}`, {
    cache: "no-store"
  });

  if (response.status === 403 || response.status === 404) {
    return {
      status: response.status,
      state: null as PublicBookingPageState | null
    };
  }

  if (!response.ok) {
    throw new Error("Could not load the booking page.");
  }

  return {
    status: response.status,
    state: (await response.json()) as PublicBookingPageState
  };
}

export async function fetchPublicQuoteOnServer(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/commercial/public/quotes/${token}`, {
    cache: "no-store"
  });

  if (response.status === 403 || response.status === 404) {
    return {
      status: response.status,
      state: null as PublicQuoteState | null
    };
  }

  if (!response.ok) {
    throw new Error("Could not load the public quote.");
  }

  return {
    status: response.status,
    state: (await response.json()) as PublicQuoteState
  };
}

export async function fetchPublicInvoiceOnServer(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/commercial/public/invoices/${token}`, {
    cache: "no-store"
  });

  if (response.status === 403 || response.status === 404) {
    return {
      status: response.status,
      state: null as PublicInvoiceState | null
    };
  }

  if (!response.ok) {
    throw new Error("Could not load the public invoice.");
  }

  return {
    status: response.status,
    state: (await response.json()) as PublicInvoiceState
  };
}
