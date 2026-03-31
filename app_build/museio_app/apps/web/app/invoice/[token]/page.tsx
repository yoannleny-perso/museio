import { StatePanel } from "@museio/ui";
import { PublicInvoice } from "../../../src/commercial/public-invoice";
import { fetchPublicInvoiceOnServer } from "../../../src/lib/server-api";

export default async function PublicInvoicePage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await fetchPublicInvoiceOnServer(token);

  if (!result.state) {
    return (
      <StatePanel
        kind="error"
        title={result.status === 404 ? "Invoice not found" : "Invoice unavailable"}
        description="This invoice link is missing, expired, or no longer available."
      />
    );
  }

  return <PublicInvoice initialState={result.state} token={token} />;
}
