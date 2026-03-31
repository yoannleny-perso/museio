export interface HealthResponse {
  status: "ok";
  service: "api";
  phase: "foundations";
}

export interface AppLinks {
  mobileAppScheme: string;
  publicWebUrl: string;
  apiBaseUrl: string;
}

export type AppRole = "artist" | "manager" | "admin" | "support";

export interface TenantIdentity {
  tenantId: string;
  accountId: string;
  handle?: string;
}

export interface ProfileShell {
  profileId: string;
  displayName: string;
  avatarUrl?: string;
  onboardingComplete: boolean;
}

export interface AuthUser {
  authUserId: string;
  email: string;
  role: AppRole;
  tenant: TenantIdentity;
  profile: ProfileShell;
}

export interface SessionSnapshot {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

export * from "./booking.js";
export * from "./calendar.js";
export * from "./client.js";
export * from "./finance.js";
export * from "./invoice.js";
export * from "./job.js";
export * from "./messaging.js";
export * from "./payment.js";
export * from "./portfolio.js";
export * from "./quote.js";
