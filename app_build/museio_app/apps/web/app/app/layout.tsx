import Link from "next/link";
import { Badge, Button, Card, tokens } from "@museio/ui";
import { ProtectedRoute } from "../../src/auth/protected-route";
import { SessionActions } from "../../src/auth/session-actions";

export default function WorkspaceLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(109, 69, 227, 0.16), transparent 42%), #f5f6fb",
          padding: "28px 20px 80px"
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "grid",
            gap: 20
          }}
        >
          <Card tone="default">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap"
              }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <Badge tone="accent">Authenticated Creator Workspace</Badge>
                <h1 style={{ margin: 0, fontSize: "2rem", color: tokens.color.text }}>
                  Museio Workspace
                </h1>
                <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
                  Portfolio and public booking are now live foundation slices. The
                  rest of the creator operating system stays intentionally deferred.
                </span>
              </div>
              <div style={{ display: "grid", gap: 12, justifyItems: "end" }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Link href="/app" style={{ textDecoration: "none" }}>
                    <Button variant="secondary">Overview</Button>
                  </Link>
                  <Link href="/app/portfolio" style={{ textDecoration: "none" }}>
                    <Button>Portfolio</Button>
                  </Link>
                  <Link href="/app/bookings" style={{ textDecoration: "none" }}>
                    <Button variant="secondary">Bookings</Button>
                  </Link>
                  <Link href="/app/jobs" style={{ textDecoration: "none" }}>
                    <Button variant="secondary">Jobs</Button>
                  </Link>
                  <Link href="/app/messages" style={{ textDecoration: "none" }}>
                    <Button variant="secondary">Messages</Button>
                  </Link>
                  <Link href="/app/clients" style={{ textDecoration: "none" }}>
                    <Button variant="secondary">CRM</Button>
                  </Link>
                  <Link href="/app/calendar" style={{ textDecoration: "none" }}>
                    <Button variant="secondary">Calendar</Button>
                  </Link>
                  <Link href="/app/finance" style={{ textDecoration: "none" }}>
                    <Button variant="secondary">Finance</Button>
                  </Link>
                </div>
                <SessionActions />
              </div>
            </div>
          </Card>
          {children}
        </div>
      </main>
    </ProtectedRoute>
  );
}
