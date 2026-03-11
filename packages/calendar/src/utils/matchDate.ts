import type { Matcher } from "../models/Selection";
import isSameDate from "./isSameDate";

function isBeforeMatcher(m: Matcher): m is { before: Date } {
  return typeof m === "object" && !Array.isArray(m) && "before" in m;
}

function isAfterMatcher(m: Matcher): m is { after: Date } {
  return typeof m === "object" && !Array.isArray(m) && "after" in m;
}

function isFromToMatcher(m: Matcher): m is { from: Date; to: Date } {
  return typeof m === "object" && !Array.isArray(m) && "from" in m && "to" in m;
}

function isDayOfWeekMatcher(m: Matcher): m is { dayOfWeek: number[] } {
  return typeof m === "object" && !Array.isArray(m) && "dayOfWeek" in m;
}

export function matchDate(date: Date, matcher: Matcher): boolean {
  if (typeof matcher === "function") {
    return matcher(date);
  }

  if (matcher instanceof Date) {
    return isSameDate(date, matcher);
  }

  if (Array.isArray(matcher)) {
    return matcher.some((d) => isSameDate(date, d));
  }

  if (isBeforeMatcher(matcher)) {
    return date < matcher.before;
  }

  if (isAfterMatcher(matcher)) {
    return date > matcher.after;
  }

  if (isFromToMatcher(matcher)) {
    return date >= matcher.from && date <= matcher.to;
  }

  if (isDayOfWeekMatcher(matcher)) {
    return matcher.dayOfWeek.includes(date.getDay());
  }

  return false;
}

export function matchDateArray(date: Date, matchers: Matcher | Matcher[] | undefined): boolean {
  if (matchers === undefined) {
    return false;
  }

  if (!Array.isArray(matchers)) {
    return matchDate(date, matchers);
  }

  // Date[] (all elements are Date instances) → single Matcher
  if (matchers.every((m) => m instanceof Date)) {
    return matchDate(date, matchers as Date[]);
  }

  // Matcher[] → check each matcher individually
  return (matchers as Matcher[]).some((m) => matchDate(date, m));
}
