import { describe, expect, it } from "vitest";

import addDays from "./addDays";

describe("addDays function", () => {
  it("adds positive days", () => {
    const date = new Date(2020, 11, 27);
    const result = addDays(date, 5);
    expect(result).toEqual(new Date(2021, 0, 1));
  });

  it("adds negative days", () => {
    const date = new Date(2021, 0, 1);
    const result = addDays(date, -1);
    expect(result).toEqual(new Date(2020, 11, 31));
  });

  it("does not mutate original date", () => {
    const date = new Date(2020, 11, 27);
    addDays(date, 5);
    expect(date).toEqual(new Date(2020, 11, 27));
  });
});
