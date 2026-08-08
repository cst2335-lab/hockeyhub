/** Game capacity / “full” helpers for list and card UI. */

export type GameCapacityInput = {
  currentPlayers?: number | null;
  maxPlayers?: number | null;
};

export type GameCapacityState = {
  /** True only when maxPlayers is a positive number and currentPlayers >= maxPlayers. */
  isFull: boolean;
  hasMaxCapacity: boolean;
  currentPlayers: number;
  maxPlayers: number | null;
  spotsLeft: number | null;
  /** Label like `0 / Open` or `3 / 10`. */
  playersLabel: string;
  /** 0–100 for progress bar; 0 when capacity is unknown. */
  fillPercent: number;
};

function toNonNegInt(value: number | null | undefined): number {
  if (value == null || Number.isNaN(Number(value))) return 0;
  const n = Math.floor(Number(value));
  return n < 0 ? 0 : n;
}

/**
 * maxPlayers is usable only when it is a finite number strictly greater than 0.
 */
export function hasValidMaxPlayers(maxPlayers: number | null | undefined): maxPlayers is number {
  return typeof maxPlayers === 'number' && Number.isFinite(maxPlayers) && maxPlayers > 0;
}

export function getGameCapacityState(input: GameCapacityInput): GameCapacityState {
  const currentPlayers = toNonNegInt(input.currentPlayers);
  const maxPlayers = hasValidMaxPlayers(input.maxPlayers) ? Math.floor(input.maxPlayers) : null;
  const hasMaxCapacity = maxPlayers != null;

  if (!hasMaxCapacity) {
    return {
      isFull: false,
      hasMaxCapacity: false,
      currentPlayers,
      maxPlayers: null,
      spotsLeft: null,
      playersLabel: `${currentPlayers} / Open`,
      fillPercent: 0,
    };
  }

  const spotsLeft = Math.max(0, maxPlayers - currentPlayers);
  const isFull = currentPlayers >= maxPlayers;
  const fillPercent = Math.min(100, Math.round((currentPlayers / maxPlayers) * 100));

  return {
    isFull,
    hasMaxCapacity: true,
    currentPlayers,
    maxPlayers,
    spotsLeft,
    playersLabel: `${currentPlayers} / ${maxPlayers}`,
    fillPercent,
  };
}
