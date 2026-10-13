import { describe, expect, it } from "vitest";

import { formatFollowUp, isDueToday, isOverdue, localInputToIso, timeAgo } from "./dates";

// Dates are built from local-time parts so the tests pass in any timezone.
const NOW = new Date(2026, 9, 13, 14, 0); // 13 Oct 2026, 2:00 PM local

function local(day: number, hour: number, minute = 0): string {
  return new Date(2026, 9, day, hour, minute).toISOString();
}

describe("isDueToday", () => {
  it("is true for any time on today's date", () => {
    expect(isDueToday(local(13, 0, 0), NOW)).toBe(true);
    expect(isDueToday(local(13, 10), NOW)).toBe(true);
    expect(isDueToday(local(13, 23, 59), NOW)).toBe(true);
  });

  it("is false for yesterday and tomorrow, even when less than 24 hours away", () => {
    expect(isDueToday(local(12, 23, 59), NOW)).toBe(false);
    expect(isDueToday(local(14, 0, 0), NOW)).toBe(false);
  });

  it("is false when there is no follow-up", () => {
    expect(isDueToday(null, NOW)).toBe(false);
  });
});

describe("isOverdue", () => {
  it("is true for earlier days and for earlier today", () => {
    expect(isOverdue(local(11, 11), NOW)).toBe(true);
    expect(isOverdue(local(13, 10), NOW)).toBe(true);
  });

  it("is false for later today and for future days", () => {
    expect(isOverdue(local(13, 18), NOW)).toBe(false);
    expect(isOverdue(local(16, 11, 30), NOW)).toBe(false);
  });

  it("is false when there is no follow-up", () => {
    expect(isOverdue(null, NOW)).toBe(false);
  });
});

describe("timeAgo", () => {
  it("picks the largest whole unit", () => {
    expect(timeAgo(new Date(NOW.getTime() - 20_000).toISOString(), NOW)).toBe("just now");
    expect(timeAgo(local(13, 13, 55), NOW)).toBe("5m ago");
    expect(timeAgo(local(13, 11), NOW)).toBe("3h ago");
    expect(timeAgo(local(11, 14), NOW)).toBe("2d ago");
    expect(timeAgo(new Date(2026, 8, 22, 14, 0).toISOString(), NOW)).toBe("3w ago");
  });

  it("does not round up to the next unit", () => {
    expect(timeAgo(local(13, 13, 1), NOW)).toBe("59m ago");
    expect(timeAgo(local(12, 14, 1), NOW)).toBe("23h ago");
  });
});

describe("formatFollowUp", () => {
  it("names the days around today", () => {
    expect(formatFollowUp(local(13, 18), NOW)).toMatch(/^Today, /);
    expect(formatFollowUp(local(14, 9), NOW)).toMatch(/^Tomorrow, /);
    expect(formatFollowUp(local(12, 15), NOW)).toMatch(/^Yesterday, /);
  });

  it("falls back to a date for other days", () => {
    expect(formatFollowUp(local(16, 11, 30), NOW)).not.toMatch(/^(Today|Tomorrow|Yesterday)/);
  });
});

describe("localInputToIso", () => {
  it("reads the input value as local time", () => {
    expect(localInputToIso("2026-10-14T10:30")).toBe(new Date(2026, 9, 14, 10, 30).toISOString());
  });

  it("returns null for an empty or invalid value", () => {
    expect(localInputToIso("")).toBeNull();
    expect(localInputToIso("not a date")).toBeNull();
  });
});
