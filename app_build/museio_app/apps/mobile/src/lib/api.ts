import type { PortfolioEditorState } from "@museio/types";
import { getMobileEnv } from "./env";

function getApiBaseUrl() {
  return `${getMobileEnv().EXPO_PUBLIC_API_URL.replace(/\/$/, "")}/api`;
}

export async function fetchPortfolioEditorSnapshot(accessToken: string) {
  const response = await fetch(`${getApiBaseUrl()}/portfolio/editor`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Could not load portfolio workspace.");
  }

  return (await response.json()) as PortfolioEditorState;
}
