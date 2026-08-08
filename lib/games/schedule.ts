/**
 * Local game schedule helpers (Ottawa/Eastern demo = browser local time).
 * Stored `game_date` is YYYY-MM-DD without timezone; `game_time` is HH:mm[:ss].
 */

export type LocalDateParts = { year: number; month: number; day: number };
export type LocalTimeParts = { hours: number; minutes: number; seconds: number };

/** Parse leading YYYY-MM-DD without UTC shifting. */
export function parseLocalDateParts(dateStr: string | null | undefined): LocalDateParts | null {
  if (!dateStr) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateStr).trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/**
 * Parse HH:mm[:ss]. When time is missing/invalid, use end of local day
 * so a dateless-time game stays upcoming until that calendar day ends.
 */
export function parseLocalTimeParts(timeStr: string | null | undefined): LocalTimeParts {
  if (!timeStr) return { hours: 23, minutes: 59, seconds: 59 };
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(String(timeStr).trim());
  if (!m) return { hours: 23, minutes: 59, seconds: 59 };
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  const seconds = m[3] != null ? Number(m[3]) : 0;
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return { hours: 23, minutes: 59, seconds: 59 };
  }
  return { hours, minutes, seconds: Number.isFinite(seconds) ? seconds : 0 };
}

/** Build a Date in the runtime's local timezone from stored date + time. */
export function getGameScheduledAt(
  gameDate: string | null | undefined,
  gameTime?: string | null,
  _now: Date = new Date()
): Date | null {
  const dateParts = parseLocalDateParts(gameDate);
  if (!dateParts) return null;
  const timeParts = parseLocalTimeParts(gameTime);
  return new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hours,
    timeParts.minutes,
    timeParts.seconds,
    0
  );
}

/** Past when scheduled local datetime is strictly before `now`. */
export function isGamePast(
  gameDate: string | null | undefined,
  gameTime?: string | null,
  now: Date = new Date()
): boolean {
  const at = getGameScheduledAt(gameDate, gameTime, now);
  if (!at) return false;
  return at.getTime() < now.getTime();
}

/** Upcoming when scheduled local datetime is at or after `now`. */
export function isGameUpcoming(
  gameDate: string | null | undefined,
  gameTime?: string | null,
  now: Date = new Date()
): boolean {
  const at = getGameScheduledAt(gameDate, gameTime, now);
  if (!at) return true;
  return at.getTime() >= now.getTime();
}

/** Local calendar YYYY-MM-DD (avoids UTC drift from toISOString). */
export function localIsoDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
