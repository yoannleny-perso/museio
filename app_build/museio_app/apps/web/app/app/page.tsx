import Link from "next/link";
import { Badge, Button, Card } from "@museio/ui";

export default function ProtectedAppShell() {
  return (
    <section
      style={{
        display: "grid",
        gap: 18
      }}
    >
      <Card>
        <div style={{ display: "grid", gap: 12 }}>
          <Badge tone="accent">Phase 2 Focus</Badge>
          <h2 style={{ margin: 0, fontSize: "1.8rem" }}>Portfolio first</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#5D6575" }}>
            The creator workspace now centers on Portfolio as a true CMS plus public
            mini-site system. Theme choices, section order, visibility, and the live
            route all flow through the API.
          </p>
          <div>
            <Link href="/app/portfolio" style={{ textDecoration: "none" }}>
              <Button>Open portfolio editor</Button>
            </Link>
          </div>
        </div>
      </Card>
    </section>
  );
}
