// All "today" and "overdue" decisions are made here, in the browser's timezone.
// The API stores and returns absolute instants, so the answer is right wherever the user is.

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole calendar days from `now` to `date`: 0 is today, -1 yesterday, 1 tomorrow. */
function calendarDaysFromNow(date: Date, now: Date): number {
  return Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY);
}

/** True when the follow-up falls on today's calendar date, whatever the time. */
export function isDueToday(followUpAt: string | null, now: Date = new Date()): boolean {
  if (!followUpAt) return false;
  return calendarDaysFromNow(new Date(followUpAt), now) === 0;
}

/** True once the follow-up moment has passed, including earlier today. */
export function isOverdue(followUpAt: string | null, now: Date = new Date()): boolean {
  if (!followUpAt) return false;
  return new Date(followUpAt).getTime() < now.getTime();
}

/** "just now", "5m ago", "3h ago", "2d ago", "3w ago", then a plain date. */
export function timeAgo(timestamp: string, now: Date = new Date()): string {
  const date = new Date(timestamp);
  const elapsed = now.getTime() - date.getTime();

  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)}d ago`;
  if (elapsed < 30 * DAY) return `${Math.floor(elapsed / (7 * DAY))}w ago`;
  return formatDate(date, now);
}

function formatDate(date: Date, now: Date): string {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** "Today, 6:00 PM", "Tomorrow, 9:30 AM", "Yesterday, 3:00 PM" or "16 Oct, 11:30 AM". */
export function formatFollowUp(followUpAt: string, now: Date = new Date()): string {
  const date = new Date(followUpAt);
  const days = calendarDaysFromNow(date, now);
  const day =
    days === 0 ? "Today" : days === 1 ? "Tomorrow" : days === -1 ? "Yesterday" : formatDate(date, now);
  return `${day}, ${formatTime(date)}`;
}

/** Full date and time for the discussion timeline, e.g. "13 Oct 2026, 4:05 PM". */
export function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  const day = date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return `${day}, ${formatTime(date)}`;
}

/**
 * Converts the value of an <input type="datetime-local"> ("2026-10-14T10:30", local time)
 * into the timezone-aware ISO string the API requires. Returns null for an empty or invalid value.
 */
export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
