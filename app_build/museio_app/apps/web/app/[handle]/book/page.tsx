import Link from "next/link";
import { Badge, Button, Card, StatePanel, tokens } from "@museio/ui";
import { PublicBookingForm } from "../../../src/booking/public-booking-form";
import { fetchPublicBookingPageOnServer } from "../../../src/lib/server-api";

export default async function PublicBookingPage({
  params
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const response = await fetchPublicBookingPageOnServer(handle);

  if (!response.state) {
    const title =
      response.status === 403 ? "Booking is unavailable" : "Creator not found";
    const description =
      response.status === 403
        ? "This creator has either kept the portfolio private or has not opened booking from the public portfolio yet."
        : "The requested handle does not resolve to a live public Museio portfolio.";

    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(109, 69, 227, 0.14), transparent 46%), #f5f6fb",
          padding: "40px 20px 80px"
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gap: 20 }}>
          <StatePanel kind="empty" title={title} description={description} />
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="secondary">Back To Museio</Button>
          </Link>
        </div>
      </main>
    );
  }

  const state = response.state;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(109, 69, 227, 0.16), transparent 44%), #f4f5fb",
        padding: "32px 18px 80px"
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "grid",
          gap: 20
        }}
      >
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center"
            }}
          >
            <div style={{ display: "grid", gap: 10 }}>
              <Badge tone="accent">Public Booking Entry Point</Badge>
              <h1 style={{ margin: 0, fontSize: "2.4rem", color: tokens.color.text }}>
                {state.creator.artistName}
              </h1>
              <span style={{ color: tokens.color.textMuted }}>
                Booking stays inside the Portfolio public identity model at
                <code style={{ marginLeft: 6 }}>{`/${state.creator.handle}/book`}</code>.
              </span>
            </div>
            <Link href={`/${state.creator.handle}`} style={{ textDecoration: "none" }}>
              <Button variant="secondary">Back To Portfolio</Button>
            </Link>
          </div>
        </Card>

        <PublicBookingForm handle={state.creator.handle} initialState={state} />
      </div>
    </main>
  );
}
