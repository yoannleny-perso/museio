// V3 Portfolio System Types - Komi-inspired Premium Creator Experience

export type ThemePreset = 'muse-light' | 'midnight-stage' | 'editorial-mono' | 'electric-club' | 'sunset-luxe';

export type MediaTreatment = 'clean-crop' | 'soft-rounded' | 'edge-to-edge' | 'layered-collage' | 'blurred-backdrop' | 'framed-editorial' | 'glass-overlay';

export type MotionIntensity = 'calm' | 'expressive' | 'performance';

export type CTAPersonality = 'elegant' | 'bold' | 'minimal' | 'club' | 'luxe' | 'playful';

export type BuilderMode = 'edit' | 'preview' | 'live' | 'rearrange' | 'style' | 'analytics';

export type BlockType = 
  | 'hero'
  | 'artist-intro'
  | 'short-bio'
  | 'social-rail'
  | 'featured-video'
  | 'featured-music'
  | 'gallery'
  | 'testimonial-carousel'
  | 'brand-logos'
  | 'press-quote'
  | 'upcoming-gigs'
  | 'availability-preview'
  | 'booking-cta'
  | 'faq'
  | 'contact'
  | 'link-collection'
  | 'press-kit'
  | 'stats-milestones'
  | 'featured-package'
  | 'highlight-reel'
  | 'pinned-moment'
  | 'collaborator-spotlight'
  | 'moodboard-collage'
  | 'community-proof'
  | 'residency-package'
  | 'private-invite'
  | 'social-proof-ticker'
  | 'latest-release';

export type HeroLayout = 
  | 'full-bleed-portrait'
  | 'split-with-cta-card'
  | 'poster-overlaid'
  | 'carousel-swipeable'
  | 'minimal-editorial'
  | 'dark-performance';

export type AudiencePath = 'book-me' | 'watch-reel' | 'listen-now' | 'press-kit' | 'contact-manager';

export interface PortfolioTheme {
  preset: ThemePreset;
  accentColor?: string;
  ctaPersonality: CTAPersonality;
  mediaTreatment: MediaTreatment;
  motionIntensity: MotionIntensity;
  customColors?: {
    background?: string;
    surface?: string;
    text?: string;
    accent?: string;
  };
}

export interface HeroBlock {
  type: 'hero';
  layout: HeroLayout;
  artistPhoto?: string;
  artistName: string;
  descriptor: string;
  city?: string;
  availabilityNote?: string;
  genres?: string[];
  socialProof?: string;
  ctaButtons: {
    primary: { label: string; action: string };
    secondary?: { label: string; action: string };
  };
  trustIndicators?: {
    verified?: boolean;
    responseTime?: string;
    recentClients?: string[];
    eventTypes?: string[];
  };
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  photo?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface PackageItem {
  id: string;
  name: string;
  description: string;
  price?: number;
  duration?: string;
  features: string[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface PortfolioBlock {
  id: string;
  type: BlockType;
  title?: string;
  enabled: boolean;
  order: number;
  visibility: 'public' | 'draft' | 'hidden';
  content: any; // Flexible content structure based on block type
}

export interface PortfolioStats {
  views: number;
  uniqueVisitors: number;
  ctaTaps: number;
  bookingStarts: number;
  bookingSubmissions: number;
  conversionRate: number;
  topSection?: string;
  topReferrer?: string;
}

export interface PortfolioInsights {
  dateRange: { start: string; end: string };
  stats: PortfolioStats;
  sectionPerformance: Array<{
    sectionId: string;
    sectionTitle: string;
    views: number;
    engagement: number;
  }>;
  referrerSources: Array<{
    source: string;
    visits: number;
    conversions: number;
  }>;
  bookingFunnel: {
    views: number;
    bookingStarts: number;
    submissions: number;
    conversionRate: number;
  };
  insights: string[]; // AI-generated insights
}

export interface PortfolioV3 {
  id: string;
  userId: string;
  handle?: string;
  customDomain?: string;
  isPublic: boolean;
  isPrivate: boolean; // Token-only access
  theme: PortfolioTheme;
  audiencePath: AudiencePath;
  completionScore: number;
  bookingReadinessScore: number;
  blocks: PortfolioBlock[];
  analytics: PortfolioInsights;
  lastPublished?: string;
  draftVersion?: boolean;
}

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentLight: string;
  border: string;
  overlay: string;
  gradient: string[];
}

export const themePresets: Record<ThemePreset, ThemeColors> = {
  'muse-light': {
    background: '#FAF7F5',
    surface: '#FFFFFF',
    surfaceElevated: '#F8F4FF',
    text: '#1A1621',
    textSecondary: '#524A5E',
    accent: '#7A42E8',
    accentLight: '#E0D1FF',
    border: '#E0DBE7',
    overlay: 'rgba(122, 66, 232, 0.08)',
    gradient: ['#D4C5F9', '#B8ACE8'],
  },
  'midnight-stage': {
    background: '#050308',
    surface: '#1A1724',
    surfaceElevated: '#2A2540',
    text: '#FFFFFF',
    textSecondary: '#ACA3C4',
    accent: '#A78BFA',
    accentLight: '#6D28D9',
    border: '#2D2840',
    overlay: 'rgba(167, 139, 250, 0.12)',
    gradient: ['#3B1E8F', '#7C3AED'],
  },
  'editorial-mono': {
    background: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceElevated: '#F0F0F0',
    text: '#000000',
    textSecondary: '#404040',
    accent: '#0A0A0A',
    accentLight: '#D6D6D6',
    border: '#DBDBDB',
    overlay: 'rgba(0, 0, 0, 0.04)',
    gradient: ['#E8E8E8', '#D6D6D6'],
  },
  'electric-club': {
    background: '#06020D',
    surface: '#130A24',
    surfaceElevated: '#1F0F3D',
    text: '#FFFFFF',
    textSecondary: '#C9B8F5',
    accent: '#C084FC',
    accentLight: '#9333EA',
    border: '#2D1B54',
    overlay: 'rgba(192, 132, 252, 0.15)',
    gradient: ['#5B21B6', '#A855F7', '#EC4899'],
  },
  'sunset-luxe': {
    background: '#FFFCF8',
    surface: '#FFFFFF',
    surfaceElevated: '#FFF5EB',
    text: '#231A15',
    textSecondary: '#6B5B4F',
    accent: '#EA580C',
    accentLight: '#FDBA74',
    border: '#EBD9C8',
    overlay: 'rgba(234, 88, 12, 0.08)',
    gradient: ['#FED7AA', '#F97316'],
  },
};