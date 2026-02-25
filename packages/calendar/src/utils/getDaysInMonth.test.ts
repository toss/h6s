import { describe, expect, it } from "vitest";

import getDaysInMonth from "./getDaysInMonth";

describe("getDaysInMonth function", () => {
  it("returns 31 for December", () => {
    expect(getDaysInMonth(new Date(2020, 11, 1))).toBe(31);
  });

  it("returns 29 for February in leap year", () => {
    expect(getDaysInMonth(new Date(2020, 1, 1))).toBe(29);
  });

  it("returns 28 for February in non-leap year", () => {
    expect(getDaysInMonth(new Date(2021, 1, 1))).toBe(28);
  });
});
