/**
 * Simple matching score for game recommendations.
 * Based on age_group, skill_level, and location (optional).
 * Used to sort or filter games by relevance for a user profile.
 */

export interface GameForScoring {
  id: string;
  age_group?: string | null;
  skill_level?: string | null;
  location?: string | null;
  game_date?: string | null;
  status?: string | null;
}

export interface UserPreferences {
  age_group?: string | null;
  skill_level?: string | null;
  location?: string | null; // e.g. city or area
}

const AGE_ORDER = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Adult'] as const;
const SKILL_ORDER = ['Beginner', 'Intermediate', 'Advanced', 'Elite'] as const;

/**
 * Returns a score 0–100: higher = better match.
 * - Same age_group: +40, adjacent age (e.g. U11 vs U13): +20, else +0.
 * - Same skill_level: +40, adjacent skill: +20, else +0.
 * - Location match (substring): +20.
 */
export function scoreGameMatch(
  game: GameForScoring,
  preferences: UserPreferences
): number {
  let score = 0;

  if (preferences.age_group && game.age_group) {
    const pi = AGE_ORDER.indexOf(preferences.age_group as (typeof AGE_ORDER)[number]);
    const gi = AGE_ORDER.indexOf(game.age_group as (typeof AGE_ORDER)[number]);
    if (pi >= 0 && gi >= 0) {
      const diff = Math.abs(pi - gi);
      if (diff === 0) score += 40;
      else if (diff === 1) score += 20;
    }
  } else {
    score += 20; // no preference = neutral
  }

  if (preferences.skill_level && game.skill_level) {
    const pi = SKILL_ORDER.indexOf(preferences.skill_level as (typeof SKILL_ORDER)[number]);
    const gi = SKILL_ORDER.indexOf(game.skill_level as (typeof SKILL_ORDER)[number]);
    if (pi >= 0 && gi >= 0) {
      const diff = Math.abs(pi - gi);
      if (diff === 0) score += 40;
      else if (diff === 1) score += 20;
    }
  } else {
    score += 20;
  }

  if (preferences.location && game.location) {
    const loc = (preferences.location as string).toLowerCase();
    const gameLoc = (game.location as string).toLowerCase();
    if (gameLoc.includes(loc) || loc.includes(gameLoc)) score += 20;
  }

  return Math.min(100, score);
}

/**
 * Sorts games by match score descending (best first).
 * Does not mutate; returns new array.
 */
export function sortGamesByMatch<T extends GameForScoring>(
  games: T[],
  preferences: UserPreferences
): T[] {
  return [...games].sort((a, b) => {
    const sa = scoreGameMatch(a, preferences);
    const sb = scoreGameMatch(b, preferences);
    return sb - sa;
  });
}
