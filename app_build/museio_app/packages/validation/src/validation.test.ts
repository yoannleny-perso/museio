import { describe, expect, it } from "vitest";
import { apiEnvSchema } from "./index";

describe("validation", () => {
  it("parses api environment values", () => {
    const parsed = apiEnvSchema.parse({
      API_PORT: "4000",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      STRIPE_SECRET_KEY: "stripe-key"
    });

    expect(parsed.API_PORT).toBe(4000);
  });
});
