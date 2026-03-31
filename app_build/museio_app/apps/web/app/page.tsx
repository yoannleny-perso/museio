import Link from "next/link";
import { Badge, Button, Card, tokens } from "@museio/ui";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(109, 69, 227, 0.16), transparent 40%), linear-gradient(180deg, #f7f1eb 0%, #f5f6fb 48%, #eef1f8 100%)",
        color: tokens.color.text,
        padding: "48px 24px 96px"
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          display: "grid",
          gap: 28
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          <Badge tone="accent">Phase 2 Portfolio Slice</Badge>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/app/portfolio" style={{ textDecoration: "none" }}>
              <Button>Open creator workspace</Button>
            </Link>
            <Link href="/nova-lune" style={{ textDecoration: "none" }}>
              <Button variant="secondary">View live portfolio</Button>
            </Link>
          </div>
        </div>

        <section
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
            alignItems: "center"
          }}
        >
          <div style={{ display: "grid", gap: 20 }}>
            <h1
              style={{
                fontSize: "clamp(3.4rem, 8vw, 6.5rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.05em",
                margin: 0,
                fontFamily: "\"Iowan Old Style\", Georgia, serif"
              }}
            >
              Public portfolio pages that feel premium, not templated.
            </h1>
            <p
              style={{
                fontSize: "1.14rem",
                lineHeight: 1.8,
                color: tokens.color.textMuted,
                margin: 0,
                maxWidth: 720
              }}
            >
              Museio now has a production-shaped design system, a protected creator
              workspace shell, and a real Portfolio slice with server-enforced
              visibility, safe section removal, live public rendering, and a booking
              entry point that stays inside the portfolio experience.
            </p>
          </div>

          <Card
            tone="dark"
            style={{
              background: "linear-gradient(135deg, #181131 0%, #6d45e3 100%)",
              color: "#FFFFFF"
            }}
          >
            <div style={{ display: "grid", gap: 14 }}>
              <Badge tone="accent">What is ready</Badge>
              <strong style={{ fontSize: "1.35rem" }}>Portfolio editor + live mode</strong>
              <p style={{ margin: 0, lineHeight: 1.7, color: "rgba(255,255,255,0.82)" }}>
                Edit mode lives at <code>/app/portfolio</code>. Live mode is served at{" "}
                <code>/:handle</code>. Empty sections disappear in live mode, while the
                editor keeps intentional placeholders and safe controls.
              </p>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
