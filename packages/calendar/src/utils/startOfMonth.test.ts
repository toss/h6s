import { describe, expect, it } from "vitest";

import startOfMonth from "./startOfMonth";

describe("startOfMonth function", () => {
  it("returns first day of the month", () => {
    const date = new Date(2020, 11, 27);
    const result = startOfMonth(date);
    expect(result).toEqual(new Date(2020, 11, 1));
  });

  it("returns same date when already first day", () => {
    const date = new Date(2020, 11, 1);
    const result = startOfMonth(date);
    expect(result.getDate()).toBe(1);
  });
});
