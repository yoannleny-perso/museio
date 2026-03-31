import Link from "next/link";
import { Badge, Button, Card, tokens } from "@museio/ui";

const highlights = [
  "Premium public portfolios with live public/private control",
  "Booking intake connected to creator availability",
  "Quotes, invoices, deposits, and Stripe-backed payment truth",
  "Finance workspace built from invoice and payment records"
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        color: tokens.color.text,
        padding: "40px 20px 88px"
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 800,
                background: "linear-gradient(135deg, #7b5cfa 0%, #f3b483 100%)"
              }}
            >
              M
            </div>
            <div style={{ display: "grid", gap: 2 }}>
              <strong style={{ fontSize: "1.05rem" }}>Museio</strong>
              <span style={{ color: tokens.color.textMuted, fontSize: "0.9rem" }}>
                Creator operating system
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/auth/sign-in" style={{ textDecoration: "none" }}>
              <Button variant="secondary">Creator sign in</Button>
            </Link>
            <Link href="/app/portfolio" style={{ textDecoration: "none" }}>
              <Button>Open workspace</Button>
            </Link>
          </div>
        </div>

        <section
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)"
          }}
          className="museio-hero-grid"
        >
          <Card
            tone="dark"
            style={{
              padding: 34,
              background:
                "radial-gradient(circle at top right, rgba(243,180,131,0.32), transparent 34%), linear-gradient(145deg, #171224 0%, #2b1f42 45%, #7b5cfa 100%)"
            }}
          >
            <div style={{ display: "grid", gap: 18 }}>
              <Badge tone="accent">Preview-ready platform</Badge>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(3.4rem, 8vw, 6.4rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.06em"
                }}
              >
                The creator business stack that still feels like a brand experience.
              </h1>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.8,
                  fontSize: "1.06rem",
                  maxWidth: 720
                }}
              >
                Museio brings public portfolio, booking intake, client coordination, commercial
                workflows, and finance into one coherent surface that feels closer to a premium
                product than a stitched-together admin tool.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/nova-lune" style={{ textDecoration: "none" }}>
                  <Button variant="secondary">View live portfolio</Button>
                </Link>
                <Link href="/nova-lune/book" style={{ textDecoration: "none" }}>
                  <Button>Open booking flow</Button>
                </Link>
              </div>
            </div>
          </Card>

          <div style={{ display: "grid", gap: 18 }}>
            <Card tone="accent" style={{ padding: 28 }}>
              <div style={{ display: "grid", gap: 12 }}>
                <Badge tone="accent">Now shipping</Badge>
                <strong style={{ fontSize: "1.2rem" }}>Portfolio is the flagship</strong>
                <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
                  Creator edit mode and public live mode share the same source of truth, with safe
                  section control, premium presentation, and public booking entry.
                </span>
              </div>
            </Card>
            <Card style={{ padding: 28 }}>
              <div style={{ display: "grid", gap: 12 }}>
                <Badge>What’s inside</Badge>
                <div style={{ display: "grid", gap: 10 }}>
                  {highlights.map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 18,
                        background: "rgba(255,255,255,0.72)",
                        border: `1px solid ${tokens.color.border}`,
                        color: tokens.color.textMuted
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
