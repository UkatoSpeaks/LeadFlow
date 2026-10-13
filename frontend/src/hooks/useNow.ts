import { useMemo, useSyncExternalStore } from "react";

const TICK_MS = 60_000;

// One shared clock for the whole page. It only advances on a tick, so every
// component reads the same "now" during a render.
let currentTime: number | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  currentTime = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (timer === undefined) {
    currentTime = Date.now();
    timer = setInterval(tick, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot(): number | null {
  return (currentTime ??= Date.now());
}

function getServerSnapshot(): number | null {
  return null;
}

/**
 * The current time, refreshed every minute so "3h ago", "due today" and
 * "overdue" stay correct while the page is left open.
 *
 * Returns null while the page is prerendered on the server: "now" is only
 * meaningful in the browser, in the user's own timezone.
 */
export function useNow(): Date | null {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => (time === null ? null : new Date(time)), [time]);
}
