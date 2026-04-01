import Link from "next/link";
import { Badge, Button, Card, Chip, tokens } from "@museio/ui";

const operatingSignals = [
  {
    label: "Portfolio",
    value: "Flagship surface",
    copy: "Keep your public brand premium, controlled, and easy to update.",
    tone: "accent" as const
  },
  {
    label: "Bookings",
    value: "Availability-aware",
    copy: "Review live demand without losing context or overexposing schedule detail.",
    tone: "warning" as const
  },
  {
    label: "Finance",
    value: "Invoice-driven truth",
    copy: "Receivables, GST, deposits, and overdue state stay tied to real commercial records.",
    tone: "success" as const
  }
];

const nextActions = [
  {
    title: "Polish your portfolio",
    body: "Tune handle, hero, section order, and public presentation before sharing the live page.",
    href: "/app/portfolio",
    label: "Brand"
  },
  {
    title: "Review booking demand",
    body: "Move public booking intake into creator review, availability, and job conversion.",
    href: "/app/bookings",
    label: "Demand"
  },
  {
    title: "Carry work into money flow",
    body: "Take accepted jobs into quotes, invoices, payment collection, and Stripe-backed state.",
    href: "/app/jobs",
    label: "Commercial"
  },
  {
    title: "Read the business clearly",
    body: "Use finance to understand receivables, overdue exposure, GST, and report periods.",
    href: "/app/finance",
    label: "Finance"
  }
];

export default function ProtectedAppShell() {
  return (
    <section className="museio-page-shell">
      <Card
        tone="dark"
        style={{
          padding: 0,
          overflow: "hidden",
          background:
            "radial-gradient(circle at top right, rgba(255,179,138,0.26), transparent 30%), linear-gradient(155deg, #151421 0%, #231937 44%, #7a42e8 100%)"
        }}
      >
        <div
          className="museio-hero-grid"
          style={{
            display: "grid",
            gap: 22,
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 0.9fr)",
            padding: 30
          }}
        >
          <div style={{ display: "grid", gap: 16 }}>
            <Badge tone="accent">Creator command centre</Badge>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(2.2rem, 5vw, 3.7rem)",
                letterSpacing: "-0.06em",
                lineHeight: 0.94
              }}
            >
              Move from public brand to real business operations without changing mental mode.
            </h2>
            <p
              style={{
                margin: 0,
                maxWidth: 780,
                color: "rgba(255,255,255,0.76)",
                lineHeight: 1.85
              }}
            >
              Museio works best when portfolio, bookings, jobs, messages, and finance feel like one
              clear operating surface. This shell is now designed to make that flow easier to scan
              and faster to act on.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Chip active>Portfolio first</Chip>
              <Chip active>Booking to job</Chip>
              <Chip active>Payment truth</Chip>
              <Chip active>Finance clarity</Chip>
            </div>
          </div>

          <Card
            tone="default"
            style={{
              padding: 22,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "#FFFFFF",
              boxShadow: "none"
            }}
          >
            <div style={{ display: "grid", gap: 14 }}>
              <span className="museio-caption" style={{ color: "#D8CBFF" }}>
                Today’s priority
              </span>
              <strong style={{ fontSize: "1.5rem", lineHeight: 1.05 }}>
                Keep the public face premium and the protected workflow calm.
              </strong>
              <span style={{ color: "rgba(255,255,255,0.76)", lineHeight: 1.75 }}>
                The clearest flow is still portfolio into booking demand, then jobs, commercial
                follow-through, and finance.
              </span>
              <Link href="/app/portfolio" style={{ textDecoration: "none" }}>
                <Button variant="secondary">Open portfolio</Button>
              </Link>
            </div>
          </Card>
        </div>
      </Card>

      <div className="museio-metric-grid">
        {operatingSignals.map((item) => (
          <Card key={item.label} tone="default" style={{ padding: 20 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <Badge tone={item.tone}>{item.label}</Badge>
              <strong style={{ fontSize: "1.24rem" }}>{item.value}</strong>
              <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>{item.copy}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="museio-surface-grid">
        {nextActions.map((item) => (
          <Card key={item.href} tone="accent" style={{ padding: 22 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong style={{ fontSize: "1.12rem" }}>{item.title}</strong>
                <Badge>{item.label}</Badge>
              </div>
              <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>{item.body}</p>
              <Link href={item.href} style={{ textDecoration: "none" }}>
                <Button variant="secondary">Open</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
