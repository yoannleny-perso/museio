import { describe, expect, it } from "vitest";

describe("web shell", () => {
  it("exposes a public shell foundation", () => {
    expect("public shell").toBe("public shell");
  });
});
