export const REWARDS = {
  COLORING_COMPLETE: { xp: 25, stars: 10 },
  STORY_COMPLETE: { xp: 30, stars: 12 },
  GAME_COMPLETE: { xp: 20, stars: 10 }
} as const;

export const XP_PER_LEVEL = 250;

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export const GAME_SCORE_LIMITS = {
  maxScore: 100000,
  maxCorrectAnswers: 500,
  maxWrongAnswers: 500,
  minDurationSeconds: 2,
  maxDurationSeconds: 60 * 60
} as const;
