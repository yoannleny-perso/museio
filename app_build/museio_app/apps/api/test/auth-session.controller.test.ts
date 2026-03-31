import { describe, expect, it } from "vitest";
import { AuthSessionController } from "../src/auth/auth-session.controller";

describe("AuthSessionController", () => {
  it("exposes the session strategy without demo fallback", () => {
    const controller = new AuthSessionController();
    const contract = controller.getSessionContract();

    expect(contract.strategy).toBe("supabase-session");
    expect(contract.developmentFallback).toBe("disabled");
    expect(contract.user).toBeNull();
    expect(contract.protectedRoutes).toContain("/app");
    expect(contract.publicRoutes).toContain("/:handle");
  });
});
