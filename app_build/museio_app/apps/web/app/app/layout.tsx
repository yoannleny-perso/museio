"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge, Card, tokens } from "@museio/ui";
import { ProtectedRoute } from "../../src/auth/protected-route";
import { SessionActions } from "../../src/auth/session-actions";

const primaryNav = [
  { href: "/app", label: "Overview", kicker: "Command center" },
  { href: "/app/portfolio", label: "Portfolio", kicker: "Brand and public presence" },
  { href: "/app/bookings", label: "Bookings", kicker: "Intake and availability" },
  { href: "/app/jobs", label: "Jobs", kicker: "Accepted work" },
  { href: "/app/finance", label: "Finance", kicker: "Revenue and GST" }
];

const secondaryNav = [
  { href: "/app/messages", label: "Messages" },
  { href: "/app/clients", label: "CRM" },
  { href: "/app/calendar", label: "Calendar" }
];

function navLinkStyle(active: boolean): CSSProperties {
  return {
    display: "grid",
    gap: 4,
    textDecoration: "none",
    padding: "14px 16px",
    borderRadius: 20,
    border: `1px solid ${active ? "rgba(123, 92, 250, 0.18)" : "transparent"}`,
    background: active ? "linear-gradient(135deg, #f3eeff 0%, #fff7ef 100%)" : "transparent",
    color: active ? tokens.color.text : tokens.color.textMuted
  };
}

export default function WorkspaceLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <main
        style={{
          minHeight: "100vh",
          padding: "20px 16px 100px"
        }}
      >
        <div
          className="museio-workspace-grid"
          style={{
            maxWidth: 1360,
            margin: "0 auto",
            display: "grid",
            gap: 18,
            gridTemplateColumns: "minmax(0, 280px) minmax(0, 1fr)"
          }}
        >
          <aside
            className="museio-workspace-sidebar"
            style={{
              position: "sticky",
              top: 20,
              alignSelf: "start",
              display: "grid",
              gap: 16
            }}
          >
            <Card style={{ padding: 20 }}>
              <div style={{ display: "grid", gap: 18 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  <Badge tone="accent">Creator workspace</Badge>
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
                        background: "linear-gradient(135deg, #7b5cfa 0%, #f3b483 100%)",
                        boxShadow: tokens.elevation.glow
                      }}
                    >
                      M
                    </div>
                    <div style={{ display: "grid", gap: 2 }}>
                      <strong style={{ fontSize: "1.12rem" }}>Museio</strong>
                      <span style={{ color: tokens.color.textMuted, fontSize: "0.9rem" }}>
                        Bookings, brand, finance, and client ops in one place
                      </span>
                    </div>
                  </div>
                </div>

                <nav style={{ display: "grid", gap: 6 }}>
                  {primaryNav.map((item) => {
                    const active =
                      item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
                    return (
                      <Link key={item.href} href={item.href} style={navLinkStyle(active)}>
                        <span style={{ fontWeight: 700 }}>{item.label}</span>
                        <span style={{ fontSize: "0.82rem", lineHeight: 1.4 }}>{item.kicker}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    paddingTop: 12,
                    borderTop: `1px solid ${tokens.color.border}`
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.74rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: tokens.color.textSubtle,
                      fontWeight: 700
                    }}
                  >
                    Coordination
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {secondaryNav.map((item) => {
                      const active = pathname.startsWith(item.href);
                      return (
                        <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              padding: "10px 12px",
                              borderRadius: 999,
                              border: `1px solid ${active ? "rgba(123, 92, 250, 0.18)" : tokens.color.border}`,
                              background: active ? tokens.color.accentSoft : "rgba(255,255,255,0.82)",
                              color: active ? tokens.color.accent : tokens.color.textMuted,
                              fontSize: "0.84rem",
                              fontWeight: 650
                            }}
                          >
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <Card tone="dark" style={{ padding: 20 }}>
              <div style={{ display: "grid", gap: 10 }}>
                <strong style={{ fontSize: "1.05rem" }}>Preview-ready operating system</strong>
                <span style={{ color: "rgba(255,255,255,0.76)", lineHeight: 1.65 }}>
                  Portfolio, booking, finance, CRM, and messaging now share one clearer shell so
                  creators can move between public brand and business operations without losing context.
                </span>
                <SessionActions />
              </div>
            </Card>
          </aside>

          <div className="museio-workspace-content" style={{ display: "grid", gap: 18 }}>
            <Card
              style={{
                padding: 20,
                background: "linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(248,241,255,0.96) 100%)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap"
                }}
              >
                <div style={{ display: "grid", gap: 6 }}>
                  <Badge tone="accent">Museio workspace</Badge>
                  <h1 style={{ margin: 0, fontSize: "2.4rem", letterSpacing: "-0.05em" }}>
                    Clearer navigation. Stronger creator focus.
                  </h1>
                  <span style={{ color: tokens.color.textMuted, lineHeight: 1.7, maxWidth: 720 }}>
                    The creator shell is organized around the jobs-to-money journey: build your brand,
                    capture demand, convert requests, manage relationships, and keep finance visible.
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge tone="success">Portfolio live</Badge>
                  <Badge tone="warning">Preview hardening</Badge>
                </div>
              </div>
            </Card>
            {children}
          </div>
        </div>

        <div
          style={{
            position: "fixed",
            left: 14,
            right: 14,
            bottom: 14,
            display: "none",
            padding: 10,
            gap: 8,
            gridTemplateColumns: "repeat(5, 1fr)",
            borderRadius: 24,
            border: `1px solid ${tokens.color.border}`,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(18px)",
            boxShadow: tokens.elevation.medium
          }}
          className="museio-mobile-nav"
        >
          {primaryNav.map((item) => {
            const active =
              item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  textAlign: "center",
                  borderRadius: 16,
                  padding: "10px 8px",
                  background: active ? tokens.color.accentSoft : "transparent",
                  color: active ? tokens.color.accent : tokens.color.textMuted,
                  fontSize: "0.76rem",
                  fontWeight: 700
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </main>
    </ProtectedRoute>
  );
}
