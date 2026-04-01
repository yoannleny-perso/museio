import Link from "next/link";
import { Badge, Button, Card, Chip, tokens } from "@museio/ui";
import { MuseioBrandLockup } from "../src/brand/brand-kit";

const platformHighlights = [
  {
    eyebrow: "Portfolio",
    title: "Premium live presentation",
    body: "Shape a public-facing portfolio that feels like a brand site instead of a profile page."
  },
  {
    eyebrow: "Bookings",
    title: "Public demand into creator review",
    body: "Bring enquiries into availability-aware booking intake without breaking public elegance."
  },
  {
    eyebrow: "Finance",
    title: "Money from real payment truth",
    body: "Quotes, invoices, deposits, and GST stay tied to invoice and payment records."
  }
];

const operatingLoop = [
  "Bring new visitors into a public portfolio that feels editorial.",
  "Turn booking interest into creator-reviewed work, not inbox chaos.",
  "Carry accepted jobs into quotes, invoices, deposits, and finance with one source of truth."
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        color: tokens.color.text,
        padding: "28px 20px 96px"
      }}
    >
      <div className="museio-page-shell" style={{ maxWidth: 1260, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap"
          }}
        >
          <MuseioBrandLockup subtitle="The creator business workspace" imageHeight={36} />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/auth/sign-in" style={{ textDecoration: "none" }}>
              <Button variant="ghost">Sign in</Button>
            </Link>
            <a href="#platform-highlights" style={{ textDecoration: "none" }}>
              <Button variant="secondary">See how it works</Button>
            </a>
            <Link href="/app" style={{ textDecoration: "none" }}>
              <Button>Open workspace</Button>
            </Link>
          </div>
        </header>

        <section
          className="museio-hero-grid"
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "minmax(0, 1.16fr) minmax(320px, 0.84fr)",
            alignItems: "stretch"
          }}
        >
          <Card
            tone="default"
            style={{
              padding: 0,
              overflow: "hidden",
              background:
                "radial-gradient(circle at top right, rgba(255,179,138,0.22), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,244,252,0.98) 100%)"
            }}
          >
            <div
              style={{
                padding: "34px 34px 18px",
                display: "grid",
                gap: 18
              }}
            >
              <Badge tone="accent">The all-in-one platform for creative professionals</Badge>
              <div style={{ display: "grid", gap: 14, maxWidth: 760 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: tokens.typography.display.fontSize,
                    lineHeight: String(tokens.typography.display.lineHeight),
                    letterSpacing: "-0.07em"
                  }}
                >
                  Manage bookings, showcase your portfolio, invoice clients, and get paid in one
                  beautiful system.
                </h1>
                <p
                  style={{
                    margin: 0,
                    maxWidth: 680,
                    color: tokens.color.textMuted,
                    fontSize: "1.06rem",
                    lineHeight: 1.85
                  }}
                >
                  Museio keeps your public presence premium while the protected creator workspace
                  brings bookings, jobs, commercial flows, finance, messages, and availability
                  together with calmer information architecture.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/auth/sign-in" style={{ textDecoration: "none" }}>
                  <Button size="lg">Get started free</Button>
                </Link>
                <Link href="/app" style={{ textDecoration: "none" }}>
                  <Button size="lg" variant="secondary">Open workspace</Button>
                </Link>
              </div>

              <div className="museio-metric-grid">
                <Card tone="accent" style={{ padding: 18 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <span className="museio-caption">Brand</span>
                    <strong style={{ fontSize: "1.25rem" }}>Portfolio-first presence</strong>
                    <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
                      Live pages stay clean, shareable, and protected from creator controls.
                    </span>
                  </div>
                </Card>
                <Card tone="default" style={{ padding: 18 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <span className="museio-caption">Demand</span>
                    <strong style={{ fontSize: "1.25rem" }}>Availability-aware intake</strong>
                    <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
                      Public booking resolves through the portfolio handle and real availability.
                    </span>
                  </div>
                </Card>
                <Card tone="default" style={{ padding: 18 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <span className="museio-caption">Revenue</span>
                    <strong style={{ fontSize: "1.25rem" }}>Finance from payment truth</strong>
                    <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
                      Deposits, balances, GST, and overdue reporting come from invoices and payments.
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          </Card>

          <div className="museio-stack">
            <Card
              tone="dark"
              style={{
                padding: 28,
                background:
                  "radial-gradient(circle at top right, rgba(255,179,138,0.3), transparent 28%), linear-gradient(155deg, #151421 0%, #221832 44%, #7a42e8 100%)"
              }}
            >
              <div style={{ display: "grid", gap: 14 }}>
                <Badge tone="accent">Museio operating loop</Badge>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "clamp(2rem, 4vw, 2.8rem)",
                    lineHeight: 0.96,
                    letterSpacing: "-0.05em"
                  }}
                >
                  Built to feel premium on the outside and dependable on the inside.
                </h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {operatingLoop.map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: "13px 14px",
                        borderRadius: 20,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.82)",
                        lineHeight: 1.7
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    borderRadius: 26,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.08)",
                    padding: 14
                  }}
                >
                  <img
                    src="/brand/phone-landing-page.png"
                    alt="Museio mobile preview"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      borderRadius: 18
                    }}
                  />
                </div>
              </div>
            </Card>

            <div id="platform-highlights">
              <Card tone="default" style={{ padding: 24 }}>
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <span className="museio-caption">What Museio feels like</span>
                      <strong style={{ fontSize: "1.3rem" }}>
                        A creator operating system, not a stitched admin panel.
                      </strong>
                    </div>
                    <Badge tone="success">Preview ready</Badge>
                  </div>
                  <div className="museio-stack">
                    {platformHighlights.map((item) => (
                      <div
                        key={item.title}
                        style={{
                          padding: "16px 18px",
                          borderRadius: 22,
                          border: `1px solid ${tokens.color.border}`,
                          background: "rgba(255,255,255,0.88)",
                          display: "grid",
                          gap: 6
                        }}
                      >
                        <span className="museio-caption">{item.eyebrow}</span>
                        <strong style={{ fontSize: "1.04rem" }}>{item.title}</strong>
                        <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
                          {item.body}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Chip active>Portfolio</Chip>
                    <Chip active>Bookings</Chip>
                    <Chip active>Quotes</Chip>
                    <Chip active>Invoices</Chip>
                    <Chip active>Finance</Chip>
                    <Chip active>Messages</Chip>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
