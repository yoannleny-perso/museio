"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge, Card, Chip, tokens } from "@museio/ui";
import { ProtectedRoute } from "../../src/auth/protected-route";
import { SessionActions } from "../../src/auth/session-actions";
import { MuseioBrandLockup } from "../../src/brand/brand-kit";

const primaryNav = [
  { href: "/app", label: "Home", kicker: "Command centre" },
  { href: "/app/portfolio", label: "Portfolio", kicker: "Brand and public presence" },
  { href: "/app/bookings", label: "Bookings", kicker: "Requests and availability" },
  { href: "/app/jobs", label: "Jobs", kicker: "Accepted work and commercial flow" },
  { href: "/app/finance", label: "Finance", kicker: "Revenue, GST, and reporting" }
];

const secondaryNav = [
  { href: "/app/messages", label: "Messages" },
  { href: "/app/clients", label: "Clients" },
  { href: "/app/calendar", label: "Calendar" }
];

function navLinkStyle(active: boolean): CSSProperties {
  return {
    display: "grid",
    gap: 4,
    textDecoration: "none",
    padding: "14px 16px",
    borderRadius: 18,
    border: `1px solid ${active ? tokens.color.borderStrong : tokens.color.border}`,
    background: active ? tokens.color.accentSoft : "#FFFFFF",
    color: active ? tokens.color.text : tokens.color.textMuted,
    boxShadow: active ? tokens.elevation.soft : "none",
    transition: `all ${tokens.motion.base} ${tokens.motion.easing}`
  };
}

function getPageMeta(pathname: string) {
  if (pathname.startsWith("/app/portfolio")) {
    return {
      eyebrow: "Portfolio",
      title: "Shape your public brand",
      description:
        "Edit sections, tune visual identity, and keep your live page polished without mixing creator controls into the public experience.",
      chips: ["Live presentation", "Section control", "Public visibility"]
    };
  }

  if (pathname.startsWith("/app/bookings")) {
    return {
      eyebrow: "Bookings",
      title: "Review demand without losing context",
      description:
        "Move from public booking intake into creator review, availability, and conversion workflows with a calmer, more legible operations surface.",
      chips: ["Inbox", "Availability", "Conversion"]
    };
  }

  if (pathname.startsWith("/app/jobs")) {
    return {
      eyebrow: "Jobs",
      title: "Carry accepted work into commercial delivery",
      description:
        "Track the bridge from accepted requests into jobs, quotes, invoices, deposits, and payments without breaking the source-of-truth flow.",
      chips: ["Accepted work", "Quote status", "Payment timeline"]
    };
  }

  if (pathname.startsWith("/app/finance")) {
    return {
      eyebrow: "Finance",
      title: "Read money clearly",
      description:
        "Finance stays tied to invoice and payment truth, while the workspace makes receivables, GST, and forecast position much easier to scan.",
      chips: ["Receivables", "GST-ready", "Exports"]
    };
  }

  if (pathname.startsWith("/app/messages")) {
    return {
      eyebrow: "Messages",
      title: "Keep client coordination in one thread",
      description:
        "Messaging remains linked to real clients and operational context, so communication lives beside bookings, jobs, and invoices instead of outside them.",
      chips: ["Threads", "Realtime", "Client context"]
    };
  }

  if (pathname.startsWith("/app/clients")) {
    return {
      eyebrow: "CRM",
      title: "See the relationship, not just the record",
      description:
        "Client profiles bring together bookings, jobs, invoices, payments, notes, and status so creators can follow the relationship at a glance.",
      chips: ["Profiles", "Relationship history", "Linked revenue"]
    };
  }

  if (pathname.startsWith("/app/calendar")) {
    return {
      eyebrow: "Calendar",
      title: "Overlay real-world conflicts safely",
      description:
        "The calendar workspace extends the availability engine with external busy blocks and conflict visibility while keeping public slot exposure clean.",
      chips: ["Busy overlays", "Conflict visibility", "Public-safe slots"]
    };
  }

  return {
    eyebrow: "Home",
    title: "Your creator operating system",
    description:
      "Move across portfolio, bookings, jobs, messages, and finance from one cleaner shell that prioritises clarity over admin clutter.",
    chips: ["Portfolio first", "Booking to job", "Finance from truth"]
  };
}

export default function WorkspaceLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);

  return (
    <ProtectedRoute>
      <main
        style={{
          minHeight: "100vh",
          padding: "18px 16px 100px"
        }}
      >
        <div
          className="museio-workspace-grid"
          style={{
            maxWidth: 1420,
            margin: "0 auto",
            display: "grid",
            gap: 20,
            gridTemplateColumns: "280px minmax(0, 1fr)"
          }}
        >
          <aside
            className="museio-workspace-sidebar"
            style={{
              position: "sticky",
              top: 18,
              alignSelf: "start",
              display: "grid",
              gap: 14
            }}
          >
            <Card style={{ padding: 18 }}>
              <div style={{ display: "grid", gap: 18 }}>
                <MuseioBrandLockup imageHeight={34} />

                <div style={{ display: "grid", gap: 8 }}>
                  {primaryNav.map((item) => {
                    const active =
                      item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
                    return (
                      <Link key={item.href} href={item.href} style={navLinkStyle(active)}>
                        <span style={{ fontWeight: 700 }}>{item.label}</span>
                        <span style={{ fontSize: "0.8rem", lineHeight: 1.4 }}>{item.kicker}</span>
                      </Link>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    paddingTop: 16,
                    borderTop: `1px solid ${tokens.color.border}`
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: tokens.color.textSubtle,
                      fontWeight: 700
                    }}
                  >
                    Coordination
                  </span>
                  <div style={{ display: "grid", gap: 8 }}>
                    {secondaryNav.map((item) => {
                      const active = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          style={{
                            textDecoration: "none",
                            padding: "12px 14px",
                            borderRadius: 16,
                            border: `1px solid ${active ? tokens.color.borderStrong : tokens.color.border}`,
                            background: active ? tokens.color.accentSoft : tokens.color.surfaceMuted,
                            color: active ? tokens.color.accent : tokens.color.textMuted,
                            fontSize: "0.88rem",
                            fontWeight: 650
                          }}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <Card tone="accent" style={{ padding: 18 }}>
              <div style={{ display: "grid", gap: 12 }}>
                <Badge tone="accent">Preview-ready</Badge>
                <strong style={{ fontSize: "1.06rem" }}>One clearer operating surface</strong>
                <span style={{ color: tokens.color.textMuted, lineHeight: 1.65 }}>
                  Public brand, bookings, clients, jobs, and finance now share the same calmer
                  navigation system.
                </span>
                <SessionActions />
              </div>
            </Card>
          </aside>

          <div className="museio-workspace-content" style={{ display: "grid", gap: 18 }}>
            <Card style={{ padding: 22 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 18,
                  alignItems: "flex-start",
                  flexWrap: "wrap"
                }}
              >
                <div style={{ display: "grid", gap: 10, maxWidth: 860 }}>
                  <Badge tone="accent">{meta.eyebrow}</Badge>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "clamp(2rem, 4vw, 3rem)",
                      letterSpacing: "-0.05em",
                      lineHeight: 0.96
                    }}
                  >
                    {meta.title}
                  </h1>
                  <span style={{ color: tokens.color.textMuted, lineHeight: 1.7 }}>
                    {meta.description}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 360 }}>
                  {meta.chips.map((chip) => (
                    <Chip key={chip} active>
                      {chip}
                    </Chip>
                  ))}
                </div>
              </div>
            </Card>

            {children}
          </div>
        </div>

        <div
          className="museio-mobile-nav"
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
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(18px)",
            boxShadow: tokens.elevation.medium,
            zIndex: 40
          }}
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
