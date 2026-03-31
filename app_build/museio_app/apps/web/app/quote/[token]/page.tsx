import { StatePanel } from "@museio/ui";
import { PublicQuote } from "../../../src/commercial/public-quote";
import { fetchPublicQuoteOnServer } from "../../../src/lib/server-api";

export default async function PublicQuotePage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await fetchPublicQuoteOnServer(token);

  if (!result.state) {
    return (
      <StatePanel
        kind="error"
        title={result.status === 404 ? "Quote not found" : "Quote unavailable"}
        description="This quote link is missing, expired, or no longer available."
      />
    );
  }

  return <PublicQuote initialState={result.state} token={token} />;
}
