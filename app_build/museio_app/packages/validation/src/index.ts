import { z } from "zod";

const requiredUrl = z.string().url();
const requiredString = z.string().min(1);
const optionalBoolean = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const webEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: requiredUrl,
  NEXT_PUBLIC_API_URL: requiredUrl,
  NEXT_PUBLIC_SUPABASE_URL: requiredUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredString.optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: requiredString.optional(),
  NEXT_PUBLIC_ENABLE_DEMO_AUTH: optionalBoolean
}).superRefine((value, context) => {
  if (
    !value.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !value.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Provide NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      path: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"]
    });
  }
});

export const mobileEnvSchema = z.object({
  EXPO_PUBLIC_API_URL: requiredUrl,
  EXPO_PUBLIC_SUPABASE_URL: requiredUrl,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: requiredString.optional(),
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: requiredString.optional(),
  EXPO_PUBLIC_ENABLE_DEMO_AUTH: optionalBoolean
}).superRefine((value, context) => {
  if (
    !value.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    !value.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Provide EXPO_PUBLIC_SUPABASE_ANON_KEY or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      path: ["EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"]
    });
  }
});

export const apiEnvSchema = z.object({
  API_PORT: z.coerce.number().int().positive(),
  SUPABASE_URL: requiredUrl,
  SUPABASE_PUBLISHABLE_DEFAULT_KEY: requiredString.optional(),
  SUPABASE_SERVICE_ROLE_KEY: requiredString.optional(),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  STRIPE_SECRET_KEY: requiredString,
  STRIPE_WEBHOOK_SECRET: requiredString.optional()
}).superRefine((value, context) => {
  if (!value.SUPABASE_SERVICE_ROLE_KEY && !value.SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      path: ["SUPABASE_SERVICE_ROLE_KEY"]
    });
  }
});

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
