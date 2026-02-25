import { describe, expect, it } from "vitest";

import startOfWeek from "./startOfWeek";

describe("startOfWeek function", () => {
  it("returns Sunday when weekStartsOn is 0", () => {
    // 2020-12-02 is Wednesday
    const date = new Date(2020, 11, 2);
    const result = startOfWeek(date, 0);
    expect(result.getDay()).toBe(0);
    expect(result).toEqual(new Date(2020, 10, 29));
  });

  it("returns Monday when weekStartsOn is 1", () => {
    // 2020-12-02 is Wednesday
    const date = new Date(2020, 11, 2);
    const result = startOfWeek(date, 1);
    expect(result.getDay()).toBe(1);
    expect(result).toEqual(new Date(2020, 10, 30));
  });

  it("returns same date when already start of week", () => {
    // 2020-11-29 is Sunday
    const date = new Date(2020, 10, 29);
    const result = startOfWeek(date, 0);
    expect(result).toEqual(new Date(2020, 10, 29));
  });
});
