import { isGamePast } from '@/lib/games/schedule';

/** DB statuses we preserve when still meaningful for display. */
export type GameDbStatus = 'open' | 'matched' | 'closed' | 'cancelled' | string;

/**
 * UI-facing status after applying schedule rules.
 * Past datetime overrides `open` (and unknown) to `past`.
 * Explicit cancelled / matched / closed are kept.
 */
export type GameDisplayStatus = 'open' | 'matched' | 'closed' | 'cancelled' | 'past';

export type GameStatusInput = {
  status?: string | null;
  gameDate?: string | null;
  gameTime?: string | null;
  now?: Date;
};

export function normalizeGameDbStatus(status: string | null | undefined): GameDbStatus {
  const s = (status || 'open').toLowerCase();
  if (s === 'matched' || s === 'closed' || s === 'cancelled' || s === 'open') return s;
  return 'open';
}

/**
 * Resolve the badge/CTA status for a game.
 * - cancelled → cancelled
 * - matched → matched
 * - closed → closed
 * - open (or other) + scheduled datetime < now → past
 * - otherwise open
 */
export function getGameDisplayStatus(input: GameStatusInput): GameDisplayStatus {
  const raw = normalizeGameDbStatus(input.status);
  if (raw === 'cancelled') return 'cancelled';
  if (raw === 'matched') return 'matched';
  if (raw === 'closed') return 'closed';

  if (isGamePast(input.gameDate, input.gameTime, input.now ?? new Date())) {
    return 'past';
  }
  return 'open';
}

/** True when the game is still actively open for interest/join. */
export function isGameActivelyOpen(input: GameStatusInput): boolean {
  return getGameDisplayStatus(input) === 'open';
}

/** Interest / join CTAs only for actively open games. */
export function canExpressGameInterest(input: GameStatusInput): boolean {
  return isGameActivelyOpen(input);
}

export function getGameDisplayStatusLabel(status: GameDisplayStatus): string {
  switch (status) {
    case 'past':
      return 'past';
    case 'closed':
      return 'closed';
    case 'cancelled':
      return 'cancelled';
    case 'matched':
      return 'matched';
    case 'open':
    default:
      return 'open';
  }
}
