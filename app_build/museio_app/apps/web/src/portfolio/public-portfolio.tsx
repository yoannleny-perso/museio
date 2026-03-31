"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Chip,
  Divider
} from "@museio/ui";
import { portfolioSectionLabels } from "@museio/domain";
import type {
  PortfolioPublicState,
  PortfolioSectionDefinition,
  SocialLinks
} from "@museio/types";

function sectionTextColor(isDark: boolean) {
  return isDark ? "rgba(255,255,255,0.74)" : "rgba(26,22,33,0.72)";
}

function visibleSocialLinks(socialLinks: SocialLinks) {
  return Object.entries(socialLinks).filter((entry) => Boolean(entry[1]));
}

function formatEventDate(eventDate: string) {
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(eventDate));
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
        <section
          id={section.id}
          style={{
            display: "grid",
            gap: 24
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 24,
              alignItems: "center",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
            }}
          >
            <div style={{ display: "grid", gap: 18 }}>
              <Badge tone="accent">Live Portfolio</Badge>
              <div style={{ display: "grid", gap: 12 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(3rem, 7vw, 5.75rem)",
                    lineHeight: 0.92,
                    letterSpacing: "-0.04em"
                  }}
                >
                  {state.settings.artistName || "Your artist name lives here"}
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.15rem",
                    lineHeight: 1.7,
                    color: textMuted,
                    maxWidth: 640
                  }}
                >
                  {state.settings.shortBio}
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {visibleSocialLinks(state.settings.socialLinks).map(
                  ([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      style={{
                        color: state.theme.text,
                        textDecoration: "none"
                      }}
                    >
                      <Chip active>{platform}</Chip>
                    </a>
                  )
                )}
              </div>
            </div>
            <div
              style={{
                minHeight: 420,
                borderRadius: 36,
                overflow: "hidden",
                boxShadow: "0 40px 120px rgba(0, 0, 0, 0.28)"
              }}
            >
              {state.settings.portraitUrl ? (
                <img
                  src={state.settings.portraitUrl}
                  alt={state.settings.artistName || "Artist portrait"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(135deg, ${state.theme.gradient[0]}, ${state.theme.gradient[1]})`
                  }}
                />
              )}
            </div>
          </div>
        </section>
      );
    case "bio":
      return (
        <section id={section.id} style={{ display: "grid", gap: 18 }}>
          <h2 style={{ margin: 0, fontSize: "2rem" }}>{section.title}</h2>
          <p
            style={{
              margin: 0,
              fontSize: "1.05rem",
              lineHeight: 1.9,
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
          <h2 style={{ margin: 0, fontSize: "2rem" }}>{section.title}</h2>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
            }}
          >
            {state.content.photos.map((photo) => (
              <figure
                key={photo.id}
                style={{
                  margin: 0,
                  display: "grid",
                  gap: 10
                }}
              >
                <div
                  style={{
                    overflow: "hidden",
                    borderRadius: 28,
                    minHeight: 260
                  }}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.altText}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                </div>
                {photo.caption ? (
                  <figcaption style={{ color: textMuted }}>{photo.caption}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      );
    case "videos":
      return (
        <section id={section.id} style={{ display: "grid", gap: 18 }}>
          <h2 style={{ margin: 0, fontSize: "2rem" }}>{section.title}</h2>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
            }}
          >
            {state.content.videos.map((video) => (
              <Card
                key={video.id}
                tone={isDark ? "dark" : "default"}
                style={{ padding: 0, overflow: "hidden" }}
              >
                <div style={{ aspectRatio: "16 / 9", background: "#0F1117" }}>
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: "100%",
                      height: "100%",
                      border: 0
                    }}
                  />
                </div>
                <div style={{ padding: 20, display: "grid", gap: 8 }}>
                  <strong>{video.title}</strong>
                  {video.caption ? (
                    <span style={{ color: textMuted }}>{video.caption}</span>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </section>
      );
    case "music-releases":
      return (
        <section id={section.id} style={{ display: "grid", gap: 18 }}>
          <h2 style={{ margin: 0, fontSize: "2rem" }}>{section.title}</h2>
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
                        borderRadius: 20
                      }}
                    />
                  ) : null}
                  <div style={{ display: "grid", gap: 6 }}>
                    <strong style={{ fontSize: "1.1rem" }}>{release.title}</strong>
                    {release.subtitle ? (
                      <span style={{ color: textMuted }}>{release.subtitle}</span>
                    ) : null}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {release.links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        style={{ color: state.theme.accent, textDecoration: "none" }}
                      >
                        <Chip active>{link.label}</Chip>
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
          <h2 style={{ margin: 0, fontSize: "2rem" }}>{section.title}</h2>
          <div style={{ display: "grid", gap: 14 }}>
            {state.content.events.map((event) => (
              <Card key={event.id} tone={isDark ? "dark" : "default"}>
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <a
                        href={event.ticketUrl}
                        style={{ color: state.theme.accent, textDecoration: "none" }}
                      >
                        <Chip active>Tickets</Chip>
                      </a>
                    </div>
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
          <h2 style={{ margin: 0, fontSize: "2rem" }}>{section.title}</h2>
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
                  <p style={{ margin: 0, color: textMuted, lineHeight: 1.7 }}>
                    {card.description}
                  </p>
                  <a
                    href={card.ctaUrl}
                    style={{ color: state.theme.accent, textDecoration: "none" }}
                  >
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
                <Badge tone="accent">Booking Entry Point</Badge>
                <h2 style={{ margin: 0, fontSize: "2rem" }}>
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
  const [activeSectionId, setActiveSectionId] = useState(
    state.visibleSections[0]?.id ?? ""
  );
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

      if (node) {
        observer.observe(node);
      }
    }

    return () => observer.disconnect();
  }, [state.visibleSections]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: state.theme.background,
        color: state.theme.text,
        padding: "32px 20px 120px"
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gap: 28
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 12,
            zIndex: 20
          }}
        >
          <Card
            tone={isDark ? "dark" : "default"}
            style={{
              background: `linear-gradient(135deg, ${state.theme.gradient[0]}, ${state.theme.gradient[1]})`,
              color: isDark ? "#FFFFFF" : state.theme.text,
              padding: 12
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                overflowX: "auto",
                paddingBottom: 2
              }}
            >
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
                    whiteSpace: "nowrap"
                  }}
                >
                  {portfolioSectionLabels[section.kind]}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div
          style={{
            display: "grid",
            gap: 36
          }}
        >
          {state.visibleSections.map((section, index) => (
            <div key={section.id} style={{ display: "grid", gap: 24 }}>
              {renderSection(state, section)}
              {index < state.visibleSections.length - 1 ? (
                <Divider />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
