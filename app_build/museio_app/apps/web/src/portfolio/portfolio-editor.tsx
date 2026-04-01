"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  Field,
  SectionShell,
  SelectField,
  StatePanel,
  TextArea,
  TextInput,
  Toggle
} from "@museio/ui";
import {
  hasContentForSection,
  portfolioSectionLabels
} from "@museio/domain";
import type {
  CreatePortfolioEventInput,
  CreatePortfolioFeaturedCardInput,
  CreatePortfolioMusicReleaseInput,
  CreatePortfolioPhotoInput,
  CreatePortfolioVideoInput,
  PortfolioEditorState,
  PortfolioReleaseLink,
  PortfolioSectionDefinition,
  PortfolioThemeOption,
  SocialLinks,
  UpdatePortfolioEventInput,
  UpdatePortfolioFeaturedCardInput,
  UpdatePortfolioMusicReleaseInput,
  UpdatePortfolioPhotoInput,
  UpdatePortfolioVideoInput
} from "@museio/types";
import { useAuth } from "../auth/auth-context";
import {
  addPortfolioSection,
  createPortfolioEvent,
  createPortfolioFeaturedCard,
  createPortfolioMusicRelease,
  createPortfolioPhoto,
  createPortfolioVideo,
  deletePortfolioEvent,
  deletePortfolioEventImage,
  deletePortfolioFeaturedCard,
  deletePortfolioFeaturedCardImage,
  deletePortfolioMusicRelease,
  deletePortfolioMusicReleaseCover,
  deletePortfolioPhoto,
  deletePortfolioPortrait,
  deletePortfolioVideo,
  fetchPortfolioEditorState,
  removePortfolioSection,
  reorderPortfolioSections,
  replacePortfolioPhotoImage,
  savePortfolioEditorState,
  updatePortfolioEvent,
  updatePortfolioFeaturedCard,
  updatePortfolioMusicRelease,
  updatePortfolioPhoto,
  updatePortfolioVideo,
  uploadPortfolioEventImage,
  uploadPortfolioFeaturedCardImage,
  uploadPortfolioMusicReleaseCover,
  uploadPortfolioPortrait
} from "../lib/api";

function getThemePreviewBackground(theme: PortfolioThemeOption) {
  return `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`;
}

function sectionHasLiveContent(
  state: PortfolioEditorState,
  section: PortfolioSectionDefinition
) {
  return hasContentForSection(section.kind, state.content, {
    artistName: state.settings.artistName,
    shortBio: state.settings.shortBio,
    fullBio: state.settings.fullBio
  });
}

function moveSection(
  currentOrder: string[],
  sectionId: string,
  direction: "up" | "down"
) {
  const index = currentOrder.indexOf(sectionId);

  if (index < 0) {
    return currentOrder;
  }

  const nextIndex = direction === "up" ? index - 1 : index + 1;

  if (nextIndex < 0 || nextIndex >= currentOrder.length) {
    return currentOrder;
  }

  const nextOrder = [...currentOrder];
  const [removed] = nextOrder.splice(index, 1);
  nextOrder.splice(nextIndex, 0, removed);

  return nextOrder;
}

function parseReleaseLinks(value: string): PortfolioReleaseLink[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [label, url] = line.split("|").map((segment) => segment.trim());

      return {
        id: `release-link-${index + 1}`,
        label: label || `Link ${index + 1}`,
        url: url || ""
      };
    })
    .filter((link) => link.url.length > 0);
}

function serializeReleaseLinks(links: PortfolioReleaseLink[]) {
  return links.map((link) => `${link.label}|${link.url}`).join("\n");
}

function createEmptySocialLinks(): SocialLinks {
  return {
    instagram: "",
    tiktok: "",
    youtube: "",
    spotify: "",
    website: ""
  };
}

const socialPlatformLabels: Record<
  "instagram" | "tiktok" | "youtube" | "spotify" | "website",
  string
> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  spotify: "Spotify",
  website: "Website"
};

export function PortfolioEditor() {
  const { isLoading: isAuthLoading, getAccessToken, user } = useAuth();
  const [state, setState] = useState<PortfolioEditorState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Portfolio ready");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingState, setIsLoadingState] = useState(true);

  const [photoDraft, setPhotoDraft] = useState<CreatePortfolioPhotoInput>({
    altText: "",
    caption: ""
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoDraft, setVideoDraft] = useState<CreatePortfolioVideoInput>({
    title: "",
    embedUrl: "",
    thumbnailUrl: "",
    caption: ""
  });
  const [releaseDraft, setReleaseDraft] = useState<
    CreatePortfolioMusicReleaseInput & { linksText: string }
  >({
    title: "",
    subtitle: "",
    links: [],
    linksText: ""
  });
  const [eventDraft, setEventDraft] = useState<CreatePortfolioEventInput>({
    title: "",
    eventDate: "",
    location: "",
    ticketUrl: ""
  });
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [featuredCardDraft, setFeaturedCardDraft] = useState<
    CreatePortfolioFeaturedCardInput
  >({
    title: "",
    description: "",
    ctaLabel: "",
    ctaUrl: ""
  });
  const [featuredCardImageFile, setFeaturedCardImageFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let active = true;

    async function loadEditorState() {
      setIsLoadingState(true);
      setErrorMessage("");

      try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
          throw new Error("Sign in to open the portfolio editor.");
        }

        const nextState = await fetchPortfolioEditorState(accessToken);

        if (active) {
          setState(nextState);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load the portfolio editor."
          );
        }
      } finally {
        if (active) {
          setIsLoadingState(false);
        }
      }
    }

    void loadEditorState();

    return () => {
      active = false;
    };
  }, [getAccessToken, isAuthLoading]);

  async function withMutation(
    action: (accessToken: string) => Promise<PortfolioEditorState>,
    successLabel: string
  ) {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("Sign in to edit the portfolio.");
      }

      const nextState = await action(accessToken);
      setState(nextState);
      setSaveMessage(successLabel);
      return nextState;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Portfolio update failed."
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  if (isAuthLoading || isLoadingState) {
    return (
      <SectionShell title="Portfolio editor" eyebrow="Authenticated Workspace">
        <StatePanel
          kind="loading"
          title="Loading portfolio"
          description="Fetching your protected Portfolio workspace from Supabase."
        />
      </SectionShell>
    );
  }

  if (!state) {
    return (
      <SectionShell title="Portfolio editor" eyebrow="Authenticated Workspace">
        <StatePanel
          kind="error"
          title="Portfolio editor unavailable"
          description={
            errorMessage || "The protected Portfolio workspace could not be loaded."
          }
        />
      </SectionShell>
    );
  }

  const enabledSections = state.settings.sectionOrder
    .map((sectionId) =>
      state.settings.sections.find((section) => section.id === sectionId)
    )
    .filter((section): section is PortfolioSectionDefinition => Boolean(section));
  const hiddenSections = state.settings.sections.filter((section) => !section.enabled);
  const activeTheme =
    state.availableThemes.find((theme) => theme.id === state.settings.themeId) ??
    state.availableThemes[0];
  const collectionCounts = {
    photos: state.content.photos.length,
    videos: state.content.videos.length,
    releases: state.content.musicReleases.length,
    events: state.content.events.length,
    featuredCards: state.content.featuredCards.length
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <SectionShell
        title="Portfolio editor"
        eyebrow="Authenticated Workspace"
        description="Portfolio is the flagship creator surface. Tune the live presentation, keep sections intentional, and preserve content safely while you edit."
        actions={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge tone={state.settings.visibility === "public" ? "success" : "neutral"}>
              {state.settings.visibility === "public" ? "Public" : "Private"}
            </Badge>
            <Button
              onClick={() =>
                void withMutation(
                  async (accessToken) =>
                    savePortfolioEditorState(accessToken, {
                      settings: state.settings,
                      content: state.content
                    }),
                  "Portfolio settings saved"
                )
              }
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save settings"}
            </Button>
          </div>
        }
      >
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
          }}
        >
          <Card
            tone="dark"
            style={{
              background: activeTheme ? getThemePreviewBackground(activeTheme) : undefined,
              color: "#FFFFFF"
            }}
          >
            <div style={{ display: "grid", gap: 14 }}>
              <Badge tone="accent">Live presentation</Badge>
              <strong style={{ fontSize: "1.5rem", lineHeight: 1.05 }}>
                {state.settings.artistName || "Untitled portfolio"}
              </strong>
              <span style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.7 }}>
                {state.settings.handle
                  ? `/${state.settings.handle}`
                  : "Choose a handle before publishing"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
                {state.settings.shortBio ||
                  "Give the live portfolio a short, confident introduction before you share it."}
              </span>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {state.settings.handle ? (
                  <Link href={`/${state.settings.handle}`} style={{ textDecoration: "none" }}>
                    <Button variant="secondary">Open live page</Button>
                  </Link>
                ) : null}
                <Chip active>{activeTheme.label}</Chip>
              </div>
            </div>
          </Card>

          <Card tone="accent">
            <div style={{ display: "grid", gap: 14 }}>
              <strong style={{ fontSize: "1rem" }}>
                {user?.profile.displayName ?? "Creator"} portfolio readiness
              </strong>
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))"
                }}
              >
                <Chip active={collectionCounts.photos > 0}>
                  {collectionCounts.photos} photos
                </Chip>
                <Chip active={collectionCounts.videos > 0}>
                  {collectionCounts.videos} videos
                </Chip>
                <Chip active={collectionCounts.releases > 0}>
                  {collectionCounts.releases} releases
                </Chip>
                <Chip active={collectionCounts.events > 0}>
                  {collectionCounts.events} events
                </Chip>
                <Chip active={collectionCounts.featuredCards > 0}>
                  {collectionCounts.featuredCards} cards
                </Chip>
              </div>
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))"
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.82)",
                    border: "1px solid rgba(122, 66, 232, 0.08)"
                  }}
                >
                  <span className="museio-caption">Visibility</span>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>
                    {state.settings.visibility === "public" ? "Public" : "Private"}
                  </div>
                </div>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.82)",
                    border: "1px solid rgba(122, 66, 232, 0.08)"
                  }}
                >
                  <span className="museio-caption">Enabled</span>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>{enabledSections.length} sections</div>
                </div>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.82)",
                    border: "1px solid rgba(122, 66, 232, 0.08)"
                  }}
                >
                  <span className="museio-caption">Hidden</span>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>{hiddenSections.length} sections</div>
                </div>
              </div>
              <span style={{ color: "#5D6575", lineHeight: 1.7 }}>
                Section visibility is layout-only. Disabling a section never deletes the
                content already stored in Supabase.
              </span>
            </div>
          </Card>
        </div>

        <div style={{ marginTop: 16 }}>
          <StatePanel
            kind={errorMessage ? "error" : isSaving ? "loading" : "empty"}
            title={
              errorMessage
                ? "Could not update the portfolio"
                : isSaving
                  ? "Saving changes"
                  : "Portfolio state"
            }
            description={
              errorMessage ||
              (isSaving
                ? "Syncing portfolio settings, visibility, and media references."
                : `${saveMessage}. Last updated ${new Date(
                    state.settings.updatedAt
                  ).toLocaleString()}.`)
            }
          />
        </div>
      </SectionShell>

      <SectionShell
        title="Portfolio essentials"
        eyebrow="Settings"
        description="Set the public identity, visual direction, and biographical foundation that the live portfolio should orbit around."
      >
        <div
          style={{
            display: "grid",
            gap: 18,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
          }}
        >
          <Field
            label="Public handle"
            hint="Lowercase, globally unique, validated on the server."
          >
            <TextInput
              value={state.settings.handle}
              onChange={(event) =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        settings: {
                          ...current.settings,
                          handle: event.target.value.toLowerCase()
                        }
                      }
                    : current
                )
              }
              placeholder="nova-lune"
            />
          </Field>

          <Field label="Artist name">
            <TextInput
              value={state.settings.artistName}
              onChange={(event) =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        settings: {
                          ...current.settings,
                          artistName: event.target.value
                        }
                      }
                    : current
                )
              }
              placeholder="Nova Lune"
            />
          </Field>

          <Field label="Theme">
            <SelectField
              value={state.settings.themeId}
              onChange={(event) =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        settings: {
                          ...current.settings,
                          themeId: event.target.value as PortfolioThemeOption["id"]
                        }
                      }
                    : current
                )
              }
            >
              {state.availableThemes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
            </SelectField>
          </Field>

          <Field label="Portrait image" hint="Stored in a private bucket with signed URLs.">
            <div style={{ display: "grid", gap: 10 }}>
              {state.settings.portraitUrl ? (
                <img
                  src={state.settings.portraitUrl}
                  alt={state.settings.artistName || "Artist portrait"}
                  style={{
                    width: "100%",
                    maxWidth: 220,
                    aspectRatio: "3 / 4",
                    objectFit: "cover",
                    borderRadius: 24
                  }}
                />
              ) : (
                <span style={{ color: "#5D6575", lineHeight: 1.7 }}>
                  No portrait uploaded yet. The live page will use an intentional gradient
                  treatment until you add one.
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setPortraitFile(event.target.files?.[0] ?? null);
                }}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button
                  variant="secondary"
                  disabled={!portraitFile || isSaving}
                  onClick={() => {
                    if (!portraitFile) {
                      return;
                    }

                    void withMutation(
                      (accessToken) => uploadPortfolioPortrait(accessToken, portraitFile),
                      "Portrait uploaded"
                    ).then(() => {
                      setPortraitFile(null);
                    });
                  }}
                >
                  Upload portrait
                </Button>
                <Button
                  variant="ghost"
                  disabled={!state.settings.portraitUrl || isSaving}
                  onClick={() =>
                    void withMutation(
                      (accessToken) => deletePortfolioPortrait(accessToken),
                      "Portrait removed"
                    )
                  }
                >
                  Remove portrait
                </Button>
              </div>
            </div>
          </Field>
        </div>

        <div style={{ marginTop: 18 }}>
          <Toggle
            checked={state.settings.visibility === "public"}
            onChange={(next) =>
              setState((current) =>
                current
                  ? {
                      ...current,
                      settings: {
                        ...current.settings,
                        visibility: next ? "public" : "private"
                      }
                    }
                  : current
              )
            }
            label="Public live mode"
            description="Publishing only succeeds when the handle is ready. Public/private enforcement stays server-owned."
          />
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gap: 18,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
          }}
        >
          <Field label="Short bio" hint="Used in hero and share context.">
            <TextArea
              value={state.settings.shortBio}
              onChange={(event) =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        settings: {
                          ...current.settings,
                          shortBio: event.target.value
                        }
                      }
                    : current
                )
              }
            />
          </Field>

          <Field label="Full bio" hint="Shown in the dedicated Bio section.">
            <TextArea
              value={state.settings.fullBio}
              onChange={(event) =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        settings: {
                          ...current.settings,
                          fullBio: event.target.value
                        }
                      }
                    : current
                )
              }
            />
          </Field>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gap: 18,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
          }}
        >
          {(["instagram", "tiktok", "youtube", "spotify", "website"] as const).map(
            (platform) => (
              <Field key={platform} label={socialPlatformLabels[platform]}>
                <TextInput
                  value={state.settings.socialLinks[platform] ?? ""}
                  onChange={(event) =>
                    setState((current) =>
                      current
                        ? {
                            ...current,
                            settings: {
                              ...current.settings,
                              socialLinks: {
                                ...createEmptySocialLinks(),
                                ...current.settings.socialLinks,
                                [platform]: event.target.value
                              }
                            }
                          }
                        : current
                    )
                  }
                  placeholder="https://..."
                />
              </Field>
            )
          )}
        </div>
      </SectionShell>

      <SectionShell
        title="Section layout"
        eyebrow="Structure"
        description="Control what appears in live mode, the order it appears in, and which sections stay safely hidden until you are ready."
      >
        <div style={{ display: "grid", gap: 14 }}>
          {enabledSections.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No sections are currently live"
              description="Bring sections back one by one. Their content is still safe in storage and the database."
            />
          ) : null}

          {enabledSections.map((section) => (
            <Card key={section.id}>
              <div style={{ display: "grid", gap: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Badge tone="accent">{portfolioSectionLabels[section.kind]}</Badge>
                      <Badge
                        tone={
                          sectionHasLiveContent(state, section) ? "success" : "warning"
                        }
                      >
                        {sectionHasLiveContent(state, section)
                          ? "Live-ready"
                          : "Intentional empty state"}
                      </Badge>
                    </div>
                    <strong style={{ fontSize: "1.05rem" }}>{section.title}</strong>
                    <span style={{ color: "#5D6575", lineHeight: 1.7 }}>
                      Disabling this section removes it from layout only. It does not
                      delete stored items.
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const nextOrder = moveSection(
                          state.settings.sectionOrder,
                          section.id,
                          "up"
                        );

                        if (nextOrder === state.settings.sectionOrder) {
                          return;
                        }

                        void withMutation(
                          (accessToken) =>
                            reorderPortfolioSections(accessToken, {
                              orderedSectionIds: nextOrder
                            }),
                          "Section order updated"
                        );
                      }}
                    >
                      Move up
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const nextOrder = moveSection(
                          state.settings.sectionOrder,
                          section.id,
                          "down"
                        );

                        if (nextOrder === state.settings.sectionOrder) {
                          return;
                        }

                        void withMutation(
                          (accessToken) =>
                            reorderPortfolioSections(accessToken, {
                              orderedSectionIds: nextOrder
                            }),
                          "Section order updated"
                        );
                      }}
                    >
                      Move down
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        void withMutation(
                          (accessToken) =>
                            removePortfolioSection(accessToken, section.id),
                          "Section removed from layout. Content kept intact."
                        )
                      }
                    >
                      Disable section
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {hiddenSections.length > 0 ? (
            <>
              <Divider />
              <div style={{ display: "grid", gap: 10 }}>
                <strong style={{ fontSize: "1rem" }}>Bring back hidden sections</strong>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {hiddenSections.map((section) => (
                    <Button
                      key={section.id}
                      variant="secondary"
                      onClick={() =>
                        void withMutation(
                          (accessToken) =>
                            addPortfolioSection(accessToken, { kind: section.kind }),
                          `${portfolioSectionLabels[section.kind]} added back to the layout`
                        )
                      }
                    >
                      Add {portfolioSectionLabels[section.kind]}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </SectionShell>

      <SectionShell
        title="Book Me section"
        eyebrow="Native CTA shell"
        description="Keep the booking entry point polished and clear without mixing creator editing controls into the public experience."
      >
        <div
          style={{
            display: "grid",
            gap: 18,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
          }}
        >
          <Field label="Heading">
            <TextInput
              value={state.content.bookMe.heading}
              onChange={(event) =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        content: {
                          ...current.content,
                          bookMe: {
                            ...current.content.bookMe,
                            heading: event.target.value
                          }
                        }
                      }
                    : current
                )
              }
            />
          </Field>
          <Field label="Primary CTA label">
            <TextInput
              value={state.content.bookMe.primaryLabel}
              onChange={(event) =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        content: {
                          ...current.content,
                          bookMe: {
                            ...current.content.bookMe,
                            primaryLabel: event.target.value
                          }
                        }
                      }
                    : current
                )
              }
            />
          </Field>
          <Field label="Secondary CTA label">
            <TextInput
              value={state.content.bookMe.secondaryLabel ?? ""}
              onChange={(event) =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        content: {
                          ...current.content,
                          bookMe: {
                            ...current.content.bookMe,
                            secondaryLabel: event.target.value
                          }
                        }
                      }
                    : current
                )
              }
            />
          </Field>
        </div>
        <div style={{ marginTop: 18 }}>
          <Field label="Description">
            <TextArea
              value={state.content.bookMe.description}
              onChange={(event) =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        content: {
                          ...current.content,
                          bookMe: {
                            ...current.content.bookMe,
                            description: event.target.value
                          }
                        }
                      }
                    : current
                )
              }
            />
          </Field>
        </div>
      </SectionShell>

      <SectionShell
        title="Photos"
        eyebrow="Content CRUD"
        description="Curate a tighter still-image gallery so the live page feels premium and edited instead of crowded."
      >
        <div style={{ display: "grid", gap: 16 }}>
          <Card>
            <div style={{ display: "grid", gap: 12 }}>
              <strong>Add photo</strong>
              <Field label="Alt text">
                <TextInput
                  value={photoDraft.altText}
                  onChange={(event) =>
                    setPhotoDraft((current) => ({
                      ...current,
                      altText: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Caption">
                <TextInput
                  value={photoDraft.caption ?? ""}
                  onChange={(event) =>
                    setPhotoDraft((current) => ({
                      ...current,
                      caption: event.target.value
                    }))
                  }
                />
              </Field>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setPhotoFile(event.target.files?.[0] ?? null);
                }}
              />
              <Button
                disabled={!photoFile || !photoDraft.altText || isSaving}
                onClick={() => {
                  if (!photoFile) {
                    return;
                  }

                  void withMutation(
                    (accessToken) =>
                      createPortfolioPhoto(accessToken, photoDraft, photoFile),
                    "Photo added"
                  ).then(() => {
                    setPhotoDraft({ altText: "", caption: "" });
                    setPhotoFile(null);
                  });
                }}
              >
                Add photo
              </Button>
            </div>
          </Card>

          {state.content.photos.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No photos yet"
              description="Start with one strong image so the live page feels curated instead of sparse."
            />
          ) : null}

          {state.content.photos.map((photo) => (
            <Card key={photo.id}>
              <div style={{ display: "grid", gap: 14 }}>
                <img
                  src={photo.imageUrl}
                  alt={photo.altText}
                  style={{
                    width: "100%",
                    maxWidth: 320,
                    aspectRatio: "4 / 5",
                    objectFit: "cover",
                    borderRadius: 24
                  }}
                />
                <Field label="Alt text">
                  <TextInput
                    value={photo.altText}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                photos: current.content.photos.map((item) =>
                                  item.id === photo.id
                                    ? { ...item, altText: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Caption">
                  <TextInput
                    value={photo.caption ?? ""}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                photos: current.content.photos.map((item) =>
                                  item.id === photo.id
                                    ? { ...item, caption: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    void withMutation(
                      (accessToken) =>
                        replacePortfolioPhotoImage(accessToken, photo.id, file),
                      "Photo image replaced"
                    );
                  }}
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void withMutation(
                        (accessToken) =>
                          updatePortfolioPhoto(accessToken, photo.id, {
                            altText: photo.altText,
                            caption: photo.caption
                          } as UpdatePortfolioPhotoInput),
                        "Photo details saved"
                      )
                    }
                  >
                    Save photo copy
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      void withMutation(
                        (accessToken) => deletePortfolioPhoto(accessToken, photo.id),
                        "Photo deleted"
                      )
                    }
                  >
                    Delete photo
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Videos"
        eyebrow="Content CRUD"
        description="Manage embedded performance and promo video while keeping the live layout clean and scroll-friendly."
      >
        <div style={{ display: "grid", gap: 16 }}>
          <Card>
            <div style={{ display: "grid", gap: 12 }}>
              <strong>Add video</strong>
              <Field label="Title">
                <TextInput
                  value={videoDraft.title}
                  onChange={(event) =>
                    setVideoDraft((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </Field>
              <Field label="Embed URL">
                <TextInput
                  value={videoDraft.embedUrl}
                  onChange={(event) =>
                    setVideoDraft((current) => ({
                      ...current,
                      embedUrl: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Thumbnail URL">
                <TextInput
                  value={videoDraft.thumbnailUrl ?? ""}
                  onChange={(event) =>
                    setVideoDraft((current) => ({
                      ...current,
                      thumbnailUrl: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Caption">
                <TextInput
                  value={videoDraft.caption ?? ""}
                  onChange={(event) =>
                    setVideoDraft((current) => ({
                      ...current,
                      caption: event.target.value
                    }))
                  }
                />
              </Field>
              <Button
                disabled={!videoDraft.title || !videoDraft.embedUrl || isSaving}
                onClick={() => {
                  void withMutation(
                    (accessToken) => createPortfolioVideo(accessToken, videoDraft),
                    "Video added"
                  ).then(() => {
                    setVideoDraft({
                      title: "",
                      embedUrl: "",
                      thumbnailUrl: "",
                      caption: ""
                    });
                  });
                }}
              >
                Add video
              </Button>
            </div>
          </Card>

          {state.content.videos.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No videos yet"
              description="Add a single embed to make the live page feel active without overfilling it."
            />
          ) : null}

          {state.content.videos.map((video) => (
            <Card key={video.id}>
              <div style={{ display: "grid", gap: 12 }}>
                <Field label="Title">
                  <TextInput
                    value={video.title}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                videos: current.content.videos.map((item) =>
                                  item.id === video.id
                                    ? { ...item, title: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Embed URL">
                  <TextInput
                    value={video.embedUrl}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                videos: current.content.videos.map((item) =>
                                  item.id === video.id
                                    ? { ...item, embedUrl: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Thumbnail URL">
                  <TextInput
                    value={video.thumbnailUrl ?? ""}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                videos: current.content.videos.map((item) =>
                                  item.id === video.id
                                    ? { ...item, thumbnailUrl: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Caption">
                  <TextInput
                    value={video.caption ?? ""}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                videos: current.content.videos.map((item) =>
                                  item.id === video.id
                                    ? { ...item, caption: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void withMutation(
                        (accessToken) =>
                          updatePortfolioVideo(accessToken, video.id, {
                            title: video.title,
                            embedUrl: video.embedUrl,
                            thumbnailUrl: video.thumbnailUrl,
                            caption: video.caption
                          } as UpdatePortfolioVideoInput),
                        "Video saved"
                      )
                    }
                  >
                    Save video
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      void withMutation(
                        (accessToken) => deletePortfolioVideo(accessToken, video.id),
                        "Video deleted"
                      )
                    }
                  >
                    Delete video
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Music Releases"
        eyebrow="Content CRUD"
        description="Present releases as real listening destinations with cover art, subtitle context, and platform links."
      >
        <div style={{ display: "grid", gap: 16 }}>
          <Card>
            <div style={{ display: "grid", gap: 12 }}>
              <strong>Add release</strong>
              <Field label="Title">
                <TextInput
                  value={releaseDraft.title}
                  onChange={(event) =>
                    setReleaseDraft((current) => ({
                      ...current,
                      title: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Subtitle">
                <TextInput
                  value={releaseDraft.subtitle ?? ""}
                  onChange={(event) =>
                    setReleaseDraft((current) => ({
                      ...current,
                      subtitle: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Links" hint="One per line in the format Label|URL">
                <TextArea
                  value={releaseDraft.linksText}
                  onChange={(event) =>
                    setReleaseDraft((current) => ({
                      ...current,
                      linksText: event.target.value
                    }))
                  }
                />
              </Field>
              <Button
                disabled={!releaseDraft.title || isSaving}
                onClick={() => {
                  void withMutation(
                    (accessToken) =>
                      createPortfolioMusicRelease(accessToken, {
                        title: releaseDraft.title,
                        subtitle: releaseDraft.subtitle,
                        links: parseReleaseLinks(releaseDraft.linksText)
                      }),
                    "Release added"
                  ).then(() => {
                    setReleaseDraft({
                      title: "",
                      subtitle: "",
                      links: [],
                      linksText: ""
                    });
                  });
                }}
              >
                Add release
              </Button>
            </div>
          </Card>

          {state.content.musicReleases.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No releases yet"
              description="A single release card is enough to make the public page feel alive and intentional."
            />
          ) : null}

          {state.content.musicReleases.map((release) => (
            <Card key={release.id}>
              <div style={{ display: "grid", gap: 12 }}>
                {release.coverUrl ? (
                  <img
                    src={release.coverUrl}
                    alt={release.title}
                    style={{
                      width: "100%",
                      maxWidth: 220,
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      borderRadius: 24
                    }}
                  />
                ) : null}
                <Field label="Title">
                  <TextInput
                    value={release.title}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                musicReleases: current.content.musicReleases.map((item) =>
                                  item.id === release.id
                                    ? { ...item, title: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Subtitle">
                  <TextInput
                    value={release.subtitle ?? ""}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                musicReleases: current.content.musicReleases.map((item) =>
                                  item.id === release.id
                                    ? { ...item, subtitle: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Links" hint="One per line in the format Label|URL">
                  <TextArea
                    value={serializeReleaseLinks(release.links)}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                musicReleases: current.content.musicReleases.map((item) =>
                                  item.id === release.id
                                    ? {
                                        ...item,
                                        links: parseReleaseLinks(event.target.value)
                                      }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    void withMutation(
                      (accessToken) =>
                        uploadPortfolioMusicReleaseCover(accessToken, release.id, file),
                      "Release cover uploaded"
                    );
                  }}
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void withMutation(
                        (accessToken) =>
                          updatePortfolioMusicRelease(accessToken, release.id, {
                            title: release.title,
                            subtitle: release.subtitle,
                            links: release.links
                          } as UpdatePortfolioMusicReleaseInput),
                        "Release saved"
                      )
                    }
                  >
                    Save release
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={!release.coverUrl}
                    onClick={() =>
                      void withMutation(
                        (accessToken) =>
                          deletePortfolioMusicReleaseCover(accessToken, release.id),
                        "Release cover removed"
                      )
                    }
                  >
                    Remove cover
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      void withMutation(
                        (accessToken) =>
                          deletePortfolioMusicRelease(accessToken, release.id),
                        "Release deleted"
                      )
                    }
                  >
                    Delete release
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Events"
        eyebrow="Content CRUD"
        description="Surface only the appearances worth promoting publicly, while keeping event data safe behind the editor."
      >
        <div style={{ display: "grid", gap: 16 }}>
          <Card>
            <div style={{ display: "grid", gap: 12 }}>
              <strong>Add event</strong>
              <Field label="Title">
                <TextInput
                  value={eventDraft.title}
                  onChange={(event) =>
                    setEventDraft((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </Field>
              <Field label="Date">
                <TextInput
                  type="datetime-local"
                  value={eventDraft.eventDate}
                  onChange={(event) =>
                    setEventDraft((current) => ({
                      ...current,
                      eventDate: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Location">
                <TextInput
                  value={eventDraft.location}
                  onChange={(event) =>
                    setEventDraft((current) => ({
                      ...current,
                      location: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Ticket URL">
                <TextInput
                  value={eventDraft.ticketUrl ?? ""}
                  onChange={(event) =>
                    setEventDraft((current) => ({
                      ...current,
                      ticketUrl: event.target.value
                    }))
                  }
                />
              </Field>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setEventImageFile(event.target.files?.[0] ?? null);
                }}
              />
              <Button
                disabled={!eventDraft.title || !eventDraft.eventDate || isSaving}
                onClick={() => {
                  void withMutation(
                    (accessToken) => createPortfolioEvent(accessToken, eventDraft),
                    "Event added"
                  ).then((nextState) => {
                    if (
                      nextState &&
                      eventImageFile &&
                      nextState.content.events.length > 0
                    ) {
                      const newestEvent =
                        nextState.content.events[nextState.content.events.length - 1];

                      void withMutation(
                        (accessToken) =>
                          uploadPortfolioEventImage(
                            accessToken,
                            newestEvent.id,
                            eventImageFile
                          ),
                        "Event image uploaded"
                      );
                    }

                    setEventDraft({
                      title: "",
                      eventDate: "",
                      location: "",
                      ticketUrl: ""
                    });
                    setEventImageFile(null);
                  });
                }}
              >
                Add event
              </Button>
            </div>
          </Card>

          {state.content.events.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No events yet"
              description="Add an upcoming event or appearance so the live page shows motion and relevance."
            />
          ) : null}

          {state.content.events.map((eventItem) => (
            <Card key={eventItem.id}>
              <div style={{ display: "grid", gap: 12 }}>
                {eventItem.imageUrl ? (
                  <img
                    src={eventItem.imageUrl}
                    alt={eventItem.title}
                    style={{
                      width: "100%",
                      maxWidth: 320,
                      aspectRatio: "16 / 9",
                      objectFit: "cover",
                      borderRadius: 24
                    }}
                  />
                ) : null}
                <Field label="Title">
                  <TextInput
                    value={eventItem.title}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                events: current.content.events.map((item) =>
                                  item.id === eventItem.id
                                    ? { ...item, title: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Date">
                  <TextInput
                    type="datetime-local"
                    value={eventItem.eventDate.slice(0, 16)}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                events: current.content.events.map((item) =>
                                  item.id === eventItem.id
                                    ? { ...item, eventDate: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Location">
                  <TextInput
                    value={eventItem.location}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                events: current.content.events.map((item) =>
                                  item.id === eventItem.id
                                    ? { ...item, location: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Ticket URL">
                  <TextInput
                    value={eventItem.ticketUrl ?? ""}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                events: current.content.events.map((item) =>
                                  item.id === eventItem.id
                                    ? { ...item, ticketUrl: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    void withMutation(
                      (accessToken) =>
                        uploadPortfolioEventImage(accessToken, eventItem.id, file),
                      "Event image uploaded"
                    );
                  }}
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void withMutation(
                        (accessToken) =>
                          updatePortfolioEvent(accessToken, eventItem.id, {
                            title: eventItem.title,
                            eventDate: eventItem.eventDate,
                            location: eventItem.location,
                            ticketUrl: eventItem.ticketUrl
                          } as UpdatePortfolioEventInput),
                        "Event saved"
                      )
                    }
                  >
                    Save event
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={!eventItem.imageUrl}
                    onClick={() =>
                      void withMutation(
                        (accessToken) =>
                          deletePortfolioEventImage(accessToken, eventItem.id),
                        "Event image removed"
                      )
                    }
                  >
                    Remove image
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      void withMutation(
                        (accessToken) => deletePortfolioEvent(accessToken, eventItem.id),
                        "Event deleted"
                      )
                    }
                  >
                    Delete event
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Featured Cards"
        eyebrow="Content CRUD"
        description="Use featured cards for honest proof points such as collaborations, press, or booking-relevant highlights."
      >
        <div style={{ display: "grid", gap: 16 }}>
          <Card>
            <div style={{ display: "grid", gap: 12 }}>
              <strong>Add featured card</strong>
              <Field label="Title">
                <TextInput
                  value={featuredCardDraft.title}
                  onChange={(event) =>
                    setFeaturedCardDraft((current) => ({
                      ...current,
                      title: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Description">
                <TextArea
                  value={featuredCardDraft.description}
                  onChange={(event) =>
                    setFeaturedCardDraft((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="CTA label">
                <TextInput
                  value={featuredCardDraft.ctaLabel}
                  onChange={(event) =>
                    setFeaturedCardDraft((current) => ({
                      ...current,
                      ctaLabel: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="CTA URL">
                <TextInput
                  value={featuredCardDraft.ctaUrl}
                  onChange={(event) =>
                    setFeaturedCardDraft((current) => ({
                      ...current,
                      ctaUrl: event.target.value
                    }))
                  }
                />
              </Field>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setFeaturedCardImageFile(event.target.files?.[0] ?? null);
                }}
              />
              <Button
                disabled={
                  !featuredCardDraft.title ||
                  !featuredCardDraft.description ||
                  !featuredCardDraft.ctaLabel ||
                  !featuredCardDraft.ctaUrl ||
                  isSaving
                }
                onClick={() => {
                  void withMutation(
                    (accessToken) =>
                      createPortfolioFeaturedCard(accessToken, featuredCardDraft),
                    "Featured card added"
                  ).then((nextState) => {
                    if (
                      nextState &&
                      featuredCardImageFile &&
                      nextState.content.featuredCards.length > 0
                    ) {
                      const newestCard =
                        nextState.content.featuredCards[
                          nextState.content.featuredCards.length - 1
                        ];

                      void withMutation(
                        (accessToken) =>
                          uploadPortfolioFeaturedCardImage(
                            accessToken,
                            newestCard.id,
                            featuredCardImageFile
                          ),
                        "Featured card image uploaded"
                      );
                    }

                    setFeaturedCardDraft({
                      title: "",
                      description: "",
                      ctaLabel: "",
                      ctaUrl: ""
                    });
                    setFeaturedCardImageFile(null);
                  });
                }}
              >
                Add featured card
              </Button>
            </div>
          </Card>

          {state.content.featuredCards.length === 0 ? (
            <StatePanel
              kind="empty"
              title="No featured cards yet"
              description="Use featured cards only when they honestly highlight distinct calls-to-action or proof points."
            />
          ) : null}

          {state.content.featuredCards.map((card) => (
            <Card key={card.id}>
              <div style={{ display: "grid", gap: 12 }}>
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    style={{
                      width: "100%",
                      maxWidth: 320,
                      aspectRatio: "16 / 9",
                      objectFit: "cover",
                      borderRadius: 24
                    }}
                  />
                ) : null}
                <Field label="Title">
                  <TextInput
                    value={card.title}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                featuredCards: current.content.featuredCards.map((item) =>
                                  item.id === card.id
                                    ? { ...item, title: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Description">
                  <TextArea
                    value={card.description}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                featuredCards: current.content.featuredCards.map((item) =>
                                  item.id === card.id
                                    ? { ...item, description: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="CTA label">
                  <TextInput
                    value={card.ctaLabel}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                featuredCards: current.content.featuredCards.map((item) =>
                                  item.id === card.id
                                    ? { ...item, ctaLabel: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="CTA URL">
                  <TextInput
                    value={card.ctaUrl}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? {
                              ...current,
                              content: {
                                ...current.content,
                                featuredCards: current.content.featuredCards.map((item) =>
                                  item.id === card.id
                                    ? { ...item, ctaUrl: event.target.value }
                                    : item
                                )
                              }
                            }
                          : current
                      )
                    }
                  />
                </Field>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    void withMutation(
                      (accessToken) =>
                        uploadPortfolioFeaturedCardImage(accessToken, card.id, file),
                      "Featured card image uploaded"
                    );
                  }}
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void withMutation(
                        (accessToken) =>
                          updatePortfolioFeaturedCard(accessToken, card.id, {
                            title: card.title,
                            description: card.description,
                            ctaLabel: card.ctaLabel,
                            ctaUrl: card.ctaUrl
                          } as UpdatePortfolioFeaturedCardInput),
                        "Featured card saved"
                      )
                    }
                  >
                    Save card
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={!card.imageUrl}
                    onClick={() =>
                      void withMutation(
                        (accessToken) =>
                          deletePortfolioFeaturedCardImage(accessToken, card.id),
                        "Featured card image removed"
                      )
                    }
                  >
                    Remove image
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      void withMutation(
                        (accessToken) =>
                          deletePortfolioFeaturedCard(accessToken, card.id),
                        "Featured card deleted"
                      )
                    }
                  >
                    Delete card
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}
