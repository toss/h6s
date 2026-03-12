import { describe, expect, it } from "vitest";

import { matchDate, matchDateArray } from "./matchDate";

describe("matchDate", () => {
  // ─── Exact Date ──────────────────────────────────────
  it("matches exact Date", () => {
    const date = new Date(2024, 0, 15);
    expect(matchDate(date, new Date(2024, 0, 15))).toBe(true);
    expect(matchDate(date, new Date(2024, 0, 16))).toBe(false);
  });

  it("ignores time when comparing exact Date", () => {
    const date = new Date(2024, 0, 15, 10, 30);
    expect(matchDate(date, new Date(2024, 0, 15, 23, 59))).toBe(true);
  });

  // ─── Date[] ──────────────────────────────────────────
  it("matches Date[]", () => {
    const date = new Date(2024, 0, 15);
    const dates = [new Date(2024, 0, 10), new Date(2024, 0, 15)];
    expect(matchDate(date, dates)).toBe(true);
    expect(matchDate(new Date(2024, 0, 1), dates)).toBe(false);
  });

  it("returns false for empty Date[]", () => {
    expect(matchDate(new Date(2024, 0, 15), [])).toBe(false);
  });

  // ─── { before } ─────────────────────────────────────
  it("matches { before }", () => {
    const jan10 = new Date(2024, 0, 10);
    expect(matchDate(new Date(2024, 0, 5), { before: jan10 })).toBe(true);
    expect(matchDate(new Date(2024, 0, 15), { before: jan10 })).toBe(false);
  });

  it("{ before } is exclusive (same day returns false)", () => {
    const jan10 = new Date(2024, 0, 10);
    expect(matchDate(new Date(2024, 0, 10), { before: jan10 })).toBe(false);
  });

  // ─── { after } ──────────────────────────────────────
  it("matches { after }", () => {
    const jan10 = new Date(2024, 0, 10);
    expect(matchDate(new Date(2024, 0, 15), { after: jan10 })).toBe(true);
    expect(matchDate(new Date(2024, 0, 5), { after: jan10 })).toBe(false);
  });

  it("{ after } is exclusive (same day returns false)", () => {
    const jan10 = new Date(2024, 0, 10);
    expect(matchDate(new Date(2024, 0, 10), { after: jan10 })).toBe(false);
  });

  // ─── { from, to } ───────────────────────────────────
  it("matches { from, to } inclusive on boundaries", () => {
    const range = { from: new Date(2024, 0, 10), to: new Date(2024, 0, 20) };
    expect(matchDate(new Date(2024, 0, 10), range)).toBe(true);
    expect(matchDate(new Date(2024, 0, 20), range)).toBe(true);
    expect(matchDate(new Date(2024, 0, 15), range)).toBe(true);
    expect(matchDate(new Date(2024, 0, 5), range)).toBe(false);
    expect(matchDate(new Date(2024, 0, 25), range)).toBe(false);
  });

  it("matches { from, to } when from === to (single day range)", () => {
    const sameDay = { from: new Date(2024, 0, 15), to: new Date(2024, 0, 15) };
    expect(matchDate(new Date(2024, 0, 15), sameDay)).toBe(true);
    expect(matchDate(new Date(2024, 0, 14), sameDay)).toBe(false);
    expect(matchDate(new Date(2024, 0, 16), sameDay)).toBe(false);
  });

  // ─── { dayOfWeek } ──────────────────────────────────
  it("matches { dayOfWeek }", () => {
    // 2024-01-15 is Monday (1)
    const monday = new Date(2024, 0, 15);
    expect(matchDate(monday, { dayOfWeek: [1, 3, 5] })).toBe(true);
    expect(matchDate(monday, { dayOfWeek: [0, 6] })).toBe(false);
  });

  it("returns false for empty { dayOfWeek: [] }", () => {
    expect(matchDate(new Date(2024, 0, 15), { dayOfWeek: [] })).toBe(false);
  });

  // ─── Function matcher ───────────────────────────────
  it("matches function matcher", () => {
    const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    // 2024-01-14 is Sunday
    expect(matchDate(new Date(2024, 0, 14), isWeekend)).toBe(true);
    // 2024-01-15 is Monday
    expect(matchDate(new Date(2024, 0, 15), isWeekend)).toBe(false);
  });

  it("matches function that always returns true", () => {
    expect(matchDate(new Date(2024, 0, 15), () => true)).toBe(true);
  });

  it("matches function that always returns false", () => {
    expect(matchDate(new Date(2024, 0, 15), () => false)).toBe(false);
  });
});

describe("matchDateArray", () => {
  it("returns false for undefined", () => {
    expect(matchDateArray(new Date(), undefined)).toBe(false);
  });

  it("handles single Matcher", () => {
    expect(matchDateArray(new Date(2024, 0, 5), { before: new Date(2024, 0, 10) })).toBe(true);
  });

  it("handles Matcher[]", () => {
    const matchers = [{ before: new Date(2024, 0, 5) }, { after: new Date(2024, 0, 20) }];
    expect(matchDateArray(new Date(2024, 0, 3), matchers)).toBe(true);
    expect(matchDateArray(new Date(2024, 0, 25), matchers)).toBe(true);
    expect(matchDateArray(new Date(2024, 0, 10), matchers)).toBe(false);
  });

  it("handles Date[] as a single Matcher (not Matcher[])", () => {
    const dates = [new Date(2024, 0, 10), new Date(2024, 0, 15)];
    expect(matchDateArray(new Date(2024, 0, 10), dates)).toBe(true);
    expect(matchDateArray(new Date(2024, 0, 15), dates)).toBe(true);
    expect(matchDateArray(new Date(2024, 0, 12), dates)).toBe(false);
  });

  it("handles empty Matcher[] (returns false)", () => {
    expect(matchDateArray(new Date(2024, 0, 15), [])).toBe(false);
  });

  it("returns true if any matcher in array matches", () => {
    const matchers = [new Date(2024, 0, 10), { dayOfWeek: [0, 6] }, (d: Date) => d.getDate() === 25];
    // exact date match
    expect(matchDateArray(new Date(2024, 0, 10), matchers)).toBe(true);
    // dayOfWeek match (2024-01-14 is Sunday)
    expect(matchDateArray(new Date(2024, 0, 14), matchers)).toBe(true);
    // function match
    expect(matchDateArray(new Date(2024, 0, 25), matchers)).toBe(true);
    // no match
    expect(matchDateArray(new Date(2024, 0, 16), matchers)).toBe(false);
  });
});
