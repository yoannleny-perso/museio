import { z } from "zod";

export const portfolioThemeIdSchema = z.enum([
  "muse-light",
  "midnight-stage",
  "editorial-mono",
  "electric-club",
  "sunset-luxe"
]);

export const portfolioSectionKindSchema = z.enum([
  "hero",
  "bio",
  "photos",
  "videos",
  "music-releases",
  "events",
  "book-me",
  "featured-cards"
]);

export const socialLinksSchema = z.object({
  instagram: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  spotify: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal(""))
});

export const portfolioSectionDefinitionSchema = z.object({
  id: z.string().min(1),
  kind: portfolioSectionKindSchema,
  instanceKey: z.string().min(1).optional(),
  title: z.string().min(1),
  enabled: z.boolean()
});

export const portfolioSettingsSchema = z.object({
  portfolioId: z.string().min(1),
  accountId: z.string().min(1),
  handle: z.string(),
  artistName: z.string(),
  portraitUrl: z.string().url().optional().or(z.literal("")),
  shortBio: z.string(),
  fullBio: z.string(),
  socialLinks: socialLinksSchema,
  visibility: z.enum(["private", "public"]),
  themeId: portfolioThemeIdSchema,
  sectionOrder: z.array(z.string()),
  sections: z.array(portfolioSectionDefinitionSchema),
  updatedAt: z.string().min(1)
});

export const portfolioPhotoItemSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().url(),
  storagePath: z.string().min(1).optional(),
  altText: z.string().min(1),
  caption: z.string().optional(),
  sortOrder: z.number().int().optional()
});

export const portfolioVideoItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  embedUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  caption: z.string().optional(),
  sortOrder: z.number().int().optional()
});

export const portfolioReleaseLinkSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.string().url()
});

export const portfolioMusicReleaseItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  storagePath: z.string().min(1).optional(),
  links: z.array(portfolioReleaseLinkSchema),
  sortOrder: z.number().int().optional()
});

export const portfolioEventItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  eventDate: z.string().min(1),
  location: z.string().min(1),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  storagePath: z.string().min(1).optional(),
  sortOrder: z.number().int().optional()
});

export const portfolioFeaturedCardItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaUrl: z.string().url(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  storagePath: z.string().min(1).optional(),
  sortOrder: z.number().int().optional()
});

export const portfolioBookMeContentSchema = z.object({
  heading: z.string(),
  description: z.string(),
  primaryLabel: z.string(),
  secondaryLabel: z.string().optional()
});

export const portfolioContentCollectionsSchema = z.object({
  photos: z.array(portfolioPhotoItemSchema),
  videos: z.array(portfolioVideoItemSchema),
  musicReleases: z.array(portfolioMusicReleaseItemSchema),
  events: z.array(portfolioEventItemSchema),
  featuredCards: z.array(portfolioFeaturedCardItemSchema),
  bookMe: portfolioBookMeContentSchema
});

export const portfolioThemeOptionSchema = z.object({
  id: portfolioThemeIdSchema,
  label: z.string().min(1),
  description: z.string().min(1),
  surfaceMode: z.enum(["light", "dark"]),
  background: z.string().min(1),
  surface: z.string().min(1),
  text: z.string().min(1),
  mutedText: z.string().min(1),
  accent: z.string().min(1),
  border: z.string().min(1),
  gradient: z.tuple([z.string().min(1), z.string().min(1)])
});

export const portfolioEditorStateSchema = z.object({
  settings: portfolioSettingsSchema,
  availableThemes: z.array(portfolioThemeOptionSchema),
  content: portfolioContentCollectionsSchema
});

export const portfolioPublicStateSchema = z.object({
  handle: z.string().min(1),
  canonicalUrl: z.string().url().optional(),
  settings: portfolioSettingsSchema,
  theme: portfolioThemeOptionSchema,
  content: portfolioContentCollectionsSchema,
  visibleSections: z.array(portfolioSectionDefinitionSchema)
});

export const addPortfolioSectionInputSchema = z.object({
  kind: portfolioSectionKindSchema
});

export const reorderPortfolioSectionsInputSchema = z.object({
  orderedSectionIds: z.array(z.string())
});

export const updatePortfolioInputSchema = z.object({
  settings: portfolioSettingsSchema,
  content: portfolioContentCollectionsSchema
});

export const portfolioAssetUploadResultSchema = z.object({
  storagePath: z.string().min(1),
  publicUrl: z.string().url()
});

export const createPortfolioPhotoInputSchema = z.object({
  altText: z.string().min(1),
  caption: z.string().optional()
});

export const updatePortfolioPhotoInputSchema = createPortfolioPhotoInputSchema;

export const createPortfolioVideoInputSchema = z.object({
  title: z.string().min(1),
  embedUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  caption: z.string().optional()
});

export const updatePortfolioVideoInputSchema = createPortfolioVideoInputSchema;

export const createPortfolioMusicReleaseInputSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  links: z.array(portfolioReleaseLinkSchema)
});

export const updatePortfolioMusicReleaseInputSchema =
  createPortfolioMusicReleaseInputSchema;

export const createPortfolioEventInputSchema = z.object({
  title: z.string().min(1),
  eventDate: z.string().min(1),
  location: z.string().min(1),
  ticketUrl: z.string().url().optional().or(z.literal(""))
});

export const updatePortfolioEventInputSchema = createPortfolioEventInputSchema;

export const createPortfolioFeaturedCardInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaUrl: z.string().url()
});

export const updatePortfolioFeaturedCardInputSchema =
  createPortfolioFeaturedCardInputSchema;
