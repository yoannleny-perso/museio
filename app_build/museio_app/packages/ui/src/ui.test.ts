import { describe, expect, it } from "vitest";
import { portfolioThemes, tokens } from "./index";

describe("ui tokens", () => {
  it("exposes an accent token", () => {
    expect(tokens.color.accent).toBe("#7A42E8");
  });

  it("re-exports the portfolio theme set", () => {
    expect(portfolioThemes).toHaveLength(5);
  });
});
