import type {
  PortfolioContentCollections,
  PortfolioSectionDefinition,
  PortfolioSectionKind,
  PortfolioThemeId,
  PortfolioThemeOption
} from "@museio/types";

export const portfolioSectionKinds = [
  "hero",
  "bio",
  "photos",
  "videos",
  "music-releases",
  "events",
  "book-me",
  "featured-cards"
] as const satisfies readonly PortfolioSectionKind[];

export const portfolioThemeIds = [
  "muse-light",
  "midnight-stage",
  "editorial-mono",
  "electric-club",
  "sunset-luxe"
] as const satisfies readonly PortfolioThemeId[];

export const portfolioSectionLabels: Record<PortfolioSectionKind, string> = {
  hero: "Hero",
  bio: "Bio",
  photos: "Photos",
  videos: "Videos",
  "music-releases": "Music Releases",
  events: "Events",
  "book-me": "Book Me",
  "featured-cards": "Featured Cards"
};

export const portfolioThemeOptions: PortfolioThemeOption[] = [
  {
    id: "muse-light",
    label: "Muse Light",
    description: "A polished editorial light theme with soft stage-glow gradients.",
    surfaceMode: "light",
    background: "#FAF8F5",
    surface: "#FFFFFF",
    text: "#1A1621",
    mutedText: "#5D5568",
    accent: "#6D45E3",
    border: "#E5DFF0",
    gradient: ["#E6D9FF", "#C8B8FF"]
  },
  {
    id: "midnight-stage",
    label: "Midnight Stage",
    description: "Dark cinematic presentation with luminous violet accents.",
    surfaceMode: "dark",
    background: "#07050C",
    surface: "#151123",
    text: "#FFFFFF",
    mutedText: "#B0A6D3",
    accent: "#A98DFF",
    border: "#2B2342",
    gradient: ["#2D1871", "#7B53FF"]
  },
  {
    id: "editorial-mono",
    label: "Editorial Mono",
    description: "Quiet monochrome with gallery-first sophistication.",
    surfaceMode: "light",
    background: "#FCFCFC",
    surface: "#FFFFFF",
    text: "#111111",
    mutedText: "#575757",
    accent: "#181818",
    border: "#DEDEDE",
    gradient: ["#EAEAEA", "#D0D0D0"]
  },
  {
    id: "electric-club",
    label: "Electric Club",
    description: "High-contrast nightlife palette with a vivid performance edge.",
    surfaceMode: "dark",
    background: "#050311",
    surface: "#140A2A",
    text: "#FFFFFF",
    mutedText: "#C8B7FF",
    accent: "#D16CFF",
    border: "#2D2059",
    gradient: ["#4E22B5", "#FF4F94"]
  },
  {
    id: "sunset-luxe",
    label: "Sunset Luxe",
    description: "Warm premium neutrals for a softer booking-first mood.",
    surfaceMode: "light",
    background: "#FFF9F1",
    surface: "#FFFFFF",
    text: "#241A13",
    mutedText: "#68584D",
    accent: "#E16C1D",
    border: "#EED7C4",
    gradient: ["#FFD8A8", "#F38D4F"]
  }
];

export function createSectionDefinition(
  kind: PortfolioSectionKind,
  index: number
): PortfolioSectionDefinition {
  return {
    id: `${kind}-${index + 1}`,
    kind,
    title: portfolioSectionLabels[kind],
    enabled: kind === "hero" || kind === "bio" || kind === "book-me"
  };
}

export function createEmptyPortfolioContent(): PortfolioContentCollections {
  return {
    photos: [],
    videos: [],
    musicReleases: [],
    events: [],
    featuredCards: [],
    bookMe: {
      heading: "Ready to Book?",
      description:
        "Use this section as your premium booking entry point once scheduling flows are connected.",
      primaryLabel: "Booking Coming Soon",
      secondaryLabel: "Send an Inquiry"
    }
  };
}

export function getPortfolioThemeOption(themeId: PortfolioThemeId) {
  return (
    portfolioThemeOptions.find((theme) => theme.id === themeId) ??
    portfolioThemeOptions[0]
  );
}

export function hasContentForSection(
  kind: PortfolioSectionKind,
  content: PortfolioContentCollections,
  settingsFields: {
    artistName: string;
    shortBio: string;
    fullBio: string;
  }
) {
  switch (kind) {
    case "hero":
      return Boolean(settingsFields.artistName || settingsFields.shortBio);
    case "bio":
      return Boolean(settingsFields.fullBio || settingsFields.shortBio);
    case "photos":
      return content.photos.length > 0;
    case "videos":
      return content.videos.length > 0;
    case "music-releases":
      return content.musicReleases.length > 0;
    case "events":
      return content.events.length > 0;
    case "book-me":
      return Boolean(content.bookMe.heading || content.bookMe.description);
    case "featured-cards":
      return content.featuredCards.length > 0;
  }
}
