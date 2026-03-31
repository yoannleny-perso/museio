import Link from "next/link";
import { Badge, Button, Card, Chip, tokens } from "@museio/ui";

const priorities = [
  {
    title: "Portfolio",
    body: "Shape your public story, refine sections, and keep live mode premium.",
    href: "/app/portfolio"
  },
  {
    title: "Bookings",
    body: "Review requests, tune availability, and convert strong leads into jobs.",
    href: "/app/bookings"
  },
  {
    title: "Finance",
    body: "Keep deposits, balances, invoices, and GST visible from one workspace.",
    href: "/app/finance"
  }
];

export default function ProtectedAppShell() {
  return (
    <section style={{ display: "grid", gap: 18 }}>
      <Card tone="dark" style={{ padding: 30 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <Badge tone="accent">Today’s focus</Badge>
          <h2 style={{ margin: 0, fontSize: "clamp(2.2rem, 5vw, 3.2rem)", letterSpacing: "-0.05em" }}>
            Run the creator side of Museio from one calm, legible home base.
          </h2>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.76)", lineHeight: 1.8, maxWidth: 800 }}>
            This workspace is organized around the real flow of creator work: present your brand,
            catch demand, convert it into jobs, keep communication clean, and make revenue readable.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Chip active>Portfolio first</Chip>
            <Chip active>Booking to job</Chip>
            <Chip active>Finance from truth</Chip>
          </div>
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
        }}
      >
        {priorities.map((item) => (
          <Card key={item.href} tone="accent">
            <div style={{ display: "grid", gap: 12 }}>
              <strong style={{ fontSize: "1.15rem" }}>{item.title}</strong>
              <p style={{ margin: 0, color: tokens.color.textMuted, lineHeight: 1.7 }}>
                {item.body}
              </p>
              <Link href={item.href} style={{ textDecoration: "none" }}>
                <Button variant="secondary">Open {item.title}</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
