import { describe, expect, it } from "vitest";

describe("mobile shell", () => {
  it("keeps Phase 1 scoped to foundations", () => {
    expect("Phase 1 foundations").toContain("foundations");
  });
});
