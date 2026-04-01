"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Chip, Divider, tokens } from "@museio/ui";
import { portfolioSectionLabels } from "@museio/domain";
import type {
  PortfolioPublicState,
  PortfolioSectionDefinition,
  SocialLinks
} from "@museio/types";
import {
  LegacySocialIcon,
  MuseioBrandLockup,
  legacySocialLabel,
  resolveLegacySocialPlatform
} from "../brand/brand-kit";

function sectionTextColor(isDark: boolean) {
  return isDark ? "rgba(255,255,255,0.72)" : "rgba(30,24,35,0.72)";
}

function visibleSocialLinks(socialLinks: SocialLinks) {
  return Object.entries(socialLinks).filter((entry) => Boolean(entry[1]));
}

function socialPillStyle(isDark: boolean) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 14px",
    borderRadius: tokens.radius.pill,
    border: `1px solid ${isDark ? "rgba(255,255,255,0.14)" : tokens.color.border}`,
    background: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.88)",
    color: isDark ? "#FFFFFF" : tokens.color.text,
    fontWeight: 700,
    lineHeight: 1,
    backdropFilter: "blur(12px)"
  } as const;
}

function formatEventDate(eventDate: string) {
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(eventDate));
}

function sectionIntro(section: PortfolioSectionDefinition) {
  switch (section.kind) {
    case "photos":
      return "Selected stills from the creator’s visual world.";
    case "videos":
      return "Motion work, performances, and visual storytelling in one place.";
    case "music-releases":
      return "Recent releases and listening destinations.";
    case "events":
      return "Upcoming appearances and live dates.";
    case "featured-cards":
      return "Key collaborations, press highlights, or booking-relevant proof.";
    case "book-me":
      return "Start a booking conversation without leaving the portfolio.";
    default:
      return "";
  }
}

function renderSection(
  state: PortfolioPublicState,
  section: PortfolioSectionDefinition
) {
  const isDark = state.theme.surfaceMode === "dark";
  const textMuted = sectionTextColor(isDark);

  switch (section.kind) {
    case "hero":
      return (
        <section id={section.id} style={{ display: "grid", gap: 26 }}>
          <div
            style={{
              display: "grid",
              gap: 28,
              alignItems: "center",
              gridTemplateColumns: "minmax(0, 1.05fr) minmax(280px, 0.95fr)"
            }}
            className="museio-hero-grid"
          >
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Badge tone="accent">Live portfolio</Badge>
                <Chip active>@{state.handle}</Chip>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(3.5rem, 8vw, 6.6rem)",
                    lineHeight: 0.88,
                    letterSpacing: "-0.07em"
                  }}
                >
                  {state.settings.artistName || "Your artist name lives here"}
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.12rem",
                    lineHeight: 1.8,
                    color: textMuted,
                    maxWidth: 640
                  }}
                >
                  {state.settings.shortBio}
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href={`/${state.handle}/book`} style={{ textDecoration: "none" }}>
                  <Button>Book now</Button>
                </a>
                {state.visibleSections.find((candidate) => candidate.kind === "photos") ? (
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById(
                        state.visibleSections.find((candidate) => candidate.kind === "photos")?.id ?? ""
                      )?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                      })
                    }
                    style={{
                      borderRadius: tokens.radius.pill,
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.16)" : tokens.color.border}`,
                      background: isDark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
                      color: isDark ? "#FFFFFF" : state.theme.text,
                      padding: "12px 18px",
                      cursor: "pointer",
                      fontWeight: 700
                    }}
                  >
                    View selected work
                  </button>
                ) : null}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {visibleSocialLinks(state.settings.socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <span style={socialPillStyle(isDark)}>
                      {resolveLegacySocialPlatform(platform) ? (
                        <LegacySocialIcon platform={platform} size={16} />
                      ) : null}
                      <span>{legacySocialLabel(platform)}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <Card
              tone="dark"
              style={{
                padding: 12,
                borderRadius: 36,
                minHeight: 460,
                background: `linear-gradient(135deg, ${state.theme.gradient[0]}, ${state.theme.gradient[1]})`,
                boxShadow: isDark
                  ? "0 30px 80px rgba(8, 8, 14, 0.26)"
                  : "0 28px 68px rgba(31, 36, 48, 0.12)"
              }}
            >
              <div style={{ position: "relative", minHeight: 440 }}>
                {state.settings.portraitUrl ? (
                  <img
                    src={state.settings.portraitUrl}
                    alt={state.settings.artistName || "Artist portrait"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      borderRadius: 28,
                      minHeight: 440
                    }}
                  />
                ) : (
                  <div style={{ width: "100%", height: 440, borderRadius: 28 }} />
                )}
                <div
                  style={{
                    position: "absolute",
                    left: 18,
                    right: 18,
                    bottom: 18,
                    borderRadius: 24,
                    padding: "16px 18px",
                    background: "rgba(18, 18, 28, 0.42)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "#FFFFFF",
                    display: "grid",
                    gap: 6
                  }}
                >
                  <span className="museio-caption" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Creator profile
                  </span>
                  <strong style={{ fontSize: "1.1rem" }}>
                    {state.settings.artistName || "Artist portrait"}
                  </strong>
                  <span style={{ color: "rgba(255,255,255,0.74)", lineHeight: 1.65 }}>
                    Built to feel premium on first view and clear at booking time.
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      );
    case "bio":
      return (
        <section id={section.id} style={{ display: "grid", gap: 18 }}>
          <Badge tone="accent">{section.title}</Badge>
          <h2 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.05em" }}>
            A fuller introduction to the artist and the world around the work.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "1.05rem",
              lineHeight: 1.95,
              color: textMuted,
              maxWidth: 860
            }}
          >
            {state.settings.fullBio}
          </p>
        </section>
      );
    case "photos":
      return (
        <section id={section.id} style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Badge>{section.title}</Badge>
            <span style={{ color: textMuted }}>{sectionIntro(section)}</span>
          </div>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
            }}
          >
            {state.content.photos.map((photo) => (
              <figure key={photo.id} style={{ margin: 0, display: "grid", gap: 10 }}>
                <div style={{ overflow: "hidden", borderRadius: 28, minHeight: 260 }}>
                  <img
                    src={photo.imageUrl}
                    alt={photo.altText}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
                {photo.caption ? <figcaption style={{ color: textMuted }}>{photo.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      );
    case "videos":
      return (
        <section id={section.id} style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Badge>{section.title}</Badge>
            <span style={{ color: textMuted }}>{sectionIntro(section)}</span>
          </div>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
            }}
          >
            {state.content.videos.map((video) => (
              <Card key={video.id} tone={isDark ? "dark" : "default"} style={{ padding: 0 }}>
                <div style={{ aspectRatio: "16 / 9", background: "#0F1117" }}>
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: 0 }}
                  />
                </div>
                <div style={{ padding: 20, display: "grid", gap: 8 }}>
                  <strong style={{ fontSize: "1.04rem" }}>{video.title}</strong>
                  {video.caption ? <span style={{ color: textMuted }}>{video.caption}</span> : null}
                </div>
              </Card>
            ))}
          </div>
        </section>
      );
    case "music-releases":
      return (
        <section id={section.id} style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Badge>{section.title}</Badge>
            <span style={{ color: textMuted }}>{sectionIntro(section)}</span>
          </div>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
            }}
          >
            {state.content.musicReleases.map((release) => (
              <Card key={release.id} tone={isDark ? "dark" : "default"}>
                <div style={{ display: "grid", gap: 14 }}>
                  {release.coverUrl ? (
                    <img
                      src={release.coverUrl}
                      alt={release.title}
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        objectFit: "cover",
                        borderRadius: 22
                      }}
                    />
                  ) : null}
                  <div style={{ display: "grid", gap: 6 }}>
                    <strong style={{ fontSize: "1.1rem" }}>{release.title}</strong>
                    {release.subtitle ? <span style={{ color: textMuted }}>{release.subtitle}</span> : null}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {release.links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none" }}
                      >
                        <span
                          style={{
                            ...socialPillStyle(isDark),
                            color: state.theme.accent
                          }}
                        >
                          {resolveLegacySocialPlatform(link.label) ? (
                            <LegacySocialIcon platform={link.label} size={15} />
                          ) : null}
                          <span>{legacySocialLabel(link.label)}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      );
    case "events":
      return (
        <section id={section.id} style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Badge>{section.title}</Badge>
            <span style={{ color: textMuted }}>{sectionIntro(section)}</span>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {state.content.events.map((event) => (
              <Card key={event.id} tone={isDark ? "dark" : "default"}>
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "grid", gap: 6 }}>
                    <strong style={{ fontSize: "1.05rem" }}>{event.title}</strong>
                    <span style={{ color: textMuted }}>
                      {formatEventDate(event.eventDate)} · {event.location}
                    </span>
                  </div>
                  {event.ticketUrl ? (
                    <a href={event.ticketUrl} style={{ color: state.theme.accent, textDecoration: "none" }}>
                      <Chip active>Tickets</Chip>
                    </a>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </section>
      );
    case "featured-cards":
      return (
        <section id={section.id} style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Badge>{section.title}</Badge>
            <span style={{ color: textMuted }}>{sectionIntro(section)}</span>
          </div>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
            }}
          >
            {state.content.featuredCards.map((card) => (
              <Card key={card.id} tone={isDark ? "dark" : "accent"}>
                <div style={{ display: "grid", gap: 12 }}>
                  <strong style={{ fontSize: "1.1rem" }}>{card.title}</strong>
                  <p style={{ margin: 0, color: textMuted, lineHeight: 1.7 }}>{card.description}</p>
                  <a href={card.ctaUrl} style={{ color: state.theme.accent, textDecoration: "none", fontWeight: 700 }}>
                    {card.ctaLabel}
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </section>
      );
    case "book-me":
      return (
        <section id={section.id}>
          <Card tone={isDark ? "dark" : "accent"}>
            <div
              style={{
                display: "grid",
                gap: 18,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                alignItems: "center"
              }}
            >
              <div style={{ display: "grid", gap: 10 }}>
                <Badge tone="accent">Booking entry point</Badge>
                <h2 style={{ margin: 0, fontSize: "2rem", letterSpacing: "-0.05em" }}>
                  {state.content.bookMe.heading}
                </h2>
                <p style={{ margin: 0, lineHeight: 1.8, color: textMuted }}>
                  {state.content.bookMe.description}
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <a href={`/${state.handle}/book`} style={{ textDecoration: "none" }}>
                  <Button>{state.content.bookMe.primaryLabel}</Button>
                </a>
              </div>
            </div>
          </Card>
        </section>
      );
  }
}

export function PublicPortfolio({ state }: { state: PortfolioPublicState }) {
  const [activeSectionId, setActiveSectionId] = useState(state.visibleSections[0]?.id ?? "");
  const isDark = state.theme.surfaceMode === "dark";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);

        if (visibleEntry?.target.id) {
          setActiveSectionId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: 0.15
      }
    );

    for (const section of state.visibleSections) {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, [state.visibleSections]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at top left, rgba(255,255,255,0.36), transparent 18%), radial-gradient(circle at top right, rgba(255,255,255,0.16), transparent 16%), ${state.theme.background}`,
        color: state.theme.text,
        padding: "28px 20px 120px"
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 28 }}>
        <div style={{ position: "sticky", top: 12, zIndex: 20 }}>
          <Card
            tone={isDark ? "dark" : "default"}
            style={{
              background: `linear-gradient(135deg, ${state.theme.gradient[0]}, ${state.theme.gradient[1]})`,
              color: isDark ? "#FFFFFF" : state.theme.text,
              padding: 14,
              boxShadow: isDark
                ? "0 24px 52px rgba(8, 8, 14, 0.2)"
                : "0 20px 44px rgba(31, 36, 48, 0.12)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center"
              }}
            >
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  <MuseioBrandLockup subtitle="" imageHeight={22} />
                  <strong style={{ fontSize: "1rem" }}>{state.settings.artistName}</strong>
                  <Chip active>@{state.handle}</Chip>
                </div>
                <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
                {state.visibleSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      document.getElementById(section.id)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                      })
                    }
                    style={{
                      border: "none",
                      background:
                        activeSectionId === section.id
                          ? "rgba(255,255,255,0.22)"
                          : "rgba(255,255,255,0.08)",
                      color: isDark ? "#FFFFFF" : state.theme.text,
                      borderRadius: 999,
                      padding: "10px 14px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontWeight: 700
                    }}
                  >
                    {portfolioSectionLabels[section.kind]}
                  </button>
                ))}
                </div>
              </div>
              <a href={`/${state.handle}/book`} style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="sm">
                  Book now
                </Button>
              </a>
            </div>
          </Card>
        </div>

        <div style={{ display: "grid", gap: 36 }}>
          {state.visibleSections.map((section, index) => (
            <div key={section.id} style={{ display: "grid", gap: 24 }}>
              {renderSection(state, section)}
              {index < state.visibleSections.length - 1 ? <Divider /> : null}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
