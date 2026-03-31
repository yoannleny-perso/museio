export type PortfolioThemeId =
  | "muse-light"
  | "midnight-stage"
  | "editorial-mono"
  | "electric-club"
  | "sunset-luxe";

export type PortfolioSectionKind =
  | "hero"
  | "bio"
  | "photos"
  | "videos"
  | "music-releases"
  | "events"
  | "book-me"
  | "featured-cards";

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  spotify?: string;
  website?: string;
}

export interface PortfolioThemeOption {
  id: PortfolioThemeId;
  label: string;
  description: string;
  surfaceMode: "light" | "dark";
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  accent: string;
  border: string;
  gradient: [string, string];
}

export interface PortfolioSectionDefinition {
  id: string;
  kind: PortfolioSectionKind;
  instanceKey?: string;
  title: string;
  enabled: boolean;
}

export interface PortfolioSettings {
  portfolioId: string;
  accountId: string;
  handle: string;
  artistName: string;
  portraitUrl?: string;
  shortBio: string;
  fullBio: string;
  socialLinks: SocialLinks;
  visibility: "private" | "public";
  themeId: PortfolioThemeId;
  sectionOrder: string[];
  sections: PortfolioSectionDefinition[];
  updatedAt: string;
}

export interface PortfolioPhotoItem {
  id: string;
  imageUrl: string;
  storagePath?: string;
  altText: string;
  caption?: string;
  sortOrder?: number;
}

export interface PortfolioVideoItem {
  id: string;
  title: string;
  embedUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  sortOrder?: number;
}

export interface PortfolioReleaseLink {
  id: string;
  label: string;
  url: string;
}

export interface PortfolioMusicReleaseItem {
  id: string;
  title: string;
  subtitle?: string;
  coverUrl?: string;
  storagePath?: string;
  links: PortfolioReleaseLink[];
  sortOrder?: number;
}

export interface PortfolioEventItem {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  ticketUrl?: string;
  imageUrl?: string;
  storagePath?: string;
  sortOrder?: number;
}

export interface PortfolioFeaturedCardItem {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl?: string;
  storagePath?: string;
  sortOrder?: number;
}

export interface PortfolioBookMeContent {
  heading: string;
  description: string;
  primaryLabel: string;
  secondaryLabel?: string;
}

export type PortfolioVisibility = "private" | "public";

export interface PortfolioContentCollections {
  photos: PortfolioPhotoItem[];
  videos: PortfolioVideoItem[];
  musicReleases: PortfolioMusicReleaseItem[];
  events: PortfolioEventItem[];
  featuredCards: PortfolioFeaturedCardItem[];
  bookMe: PortfolioBookMeContent;
}

export interface PortfolioEditorState {
  settings: PortfolioSettings;
  availableThemes: PortfolioThemeOption[];
  content: PortfolioContentCollections;
}

export interface PortfolioPublicState {
  handle: string;
  canonicalUrl?: string;
  settings: PortfolioSettings;
  theme: PortfolioThemeOption;
  content: PortfolioContentCollections;
  visibleSections: PortfolioSectionDefinition[];
}

export interface AddPortfolioSectionInput {
  kind: PortfolioSectionKind;
}

export interface ReorderPortfolioSectionsInput {
  orderedSectionIds: string[];
}

export interface UpdatePortfolioInput {
  settings: PortfolioSettings;
  content: PortfolioContentCollections;
}

export interface PortfolioAssetUploadResult {
  storagePath: string;
  publicUrl: string;
}

export interface CreatePortfolioPhotoInput {
  altText: string;
  caption?: string;
}

export interface UpdatePortfolioPhotoInput {
  altText: string;
  caption?: string;
}

export interface CreatePortfolioVideoInput {
  title: string;
  embedUrl: string;
  thumbnailUrl?: string;
  caption?: string;
}

export type UpdatePortfolioVideoInput = CreatePortfolioVideoInput;

export interface CreatePortfolioMusicReleaseInput {
  title: string;
  subtitle?: string;
  links: PortfolioReleaseLink[];
}

export type UpdatePortfolioMusicReleaseInput = CreatePortfolioMusicReleaseInput;

export interface CreatePortfolioEventInput {
  title: string;
  eventDate: string;
  location: string;
  ticketUrl?: string;
}

export type UpdatePortfolioEventInput = CreatePortfolioEventInput;

export interface CreatePortfolioFeaturedCardInput {
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
}

export type UpdatePortfolioFeaturedCardInput = CreatePortfolioFeaturedCardInput;
