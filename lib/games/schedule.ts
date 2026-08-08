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

/**
 * Format a stored game_date for list UI using local calendar parts.
 * Pass an explicit `now` (prefer client clock after mount) so SSR/client labels match.
 */
export function formatGameListDate(
  dateStr: string | null | undefined,
  now: Date = new Date(),
  locale: string = 'en-US'
): string {
  if (!dateStr) return 'TBD';
  const parts = parseLocalDateParts(dateStr);
  const d = parts
    ? new Date(parts.year, parts.month - 1, parts.day)
    : new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((dayOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let relative = '';
  if (diffDays === 0) relative = ' (Today)';
  else if (diffDays === 1) relative = ' (Tomorrow)';
  else if (diffDays === -1) relative = ' (Yesterday)';
  else if (diffDays < -1) relative = ` (${Math.abs(diffDays)} days ago)`;
  else if (diffDays > 1 && diffDays <= 7) relative = ` (In ${diffDays} days)`;

  return (
    d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' }) + relative
  );
}
