import type { AuthUser } from "@museio/types";

export const jobStates = [
  "draft",
  "upcoming",
  "in-progress",
  "past",
  "cancelled",
  "archived"
] as const;

export const invoiceStates = [
  "draft",
  "sent",
  "viewed",
  "deposit-requested",
  "deposit-paid",
  "balance-due",
  "overdue",
  "paid",
  "void"
] as const;

export const paymentStates = [
  "pending",
  "requires-action",
  "processing",
  "succeeded",
  "failed",
  "refunded",
  "partially-refunded"
] as const;

export const portfolioPublishStates = [
  "private",
  "draft-live-preview",
  "public",
  "paused"
] as const;

export const calendarConnectionStates = [
  "not-connected",
  "connecting",
  "connected",
  "sync-error",
  "revoked"
] as const;

export const taxSetupStates = [
  "not-registered",
  "registered-incomplete",
  "registered-ready",
  "report-warning",
  "report-ready"
] as const;

export const appRoles = ["artist", "manager", "admin", "support"] as const;

export const protectedRoutePrefixes = {
  web: ["/app"],
  mobile: ["/app"]
} as const;

export const publicRoutePatterns = {
  web: ["/", "/auth/sign-in", "/:handle", "/:handle/book"],
  mobile: ["/", "/sign-in"]
} as const;

export const demoAuthUser: AuthUser = {
  authUserId: "demo-user-001",
  email: "nova@example.com",
  role: "artist",
  tenant: {
    tenantId: "tenant_demo_artist",
    accountId: "acct_demo_artist",
    handle: "nova-lune"
  },
  profile: {
    profileId: "profile_demo_artist",
    displayName: "Nova Lune",
    avatarUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80",
    onboardingComplete: true
  }
};

export type JobState = (typeof jobStates)[number];
export type InvoiceState = (typeof invoiceStates)[number];
export type PaymentState = (typeof paymentStates)[number];
export type PortfolioPublishState = (typeof portfolioPublishStates)[number];
export type CalendarConnectionState =
  (typeof calendarConnectionStates)[number];
export type TaxSetupState = (typeof taxSetupStates)[number];
export type AppRole = (typeof appRoles)[number];

export * from "./booking.js";
export * from "./commercial.js";
export * from "./coordination.js";
export * from "./finance.js";
export * from "./operations.js";
export * from "./portfolio.js";
