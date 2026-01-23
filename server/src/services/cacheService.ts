import { deleteCachePattern, deleteCache, CACHE_KEYS } from '../config/redis';

/**
 * Cache invalidation service
 * Call these functions when data changes to keep cache fresh
 */

/**
 * Invalidate all leaderboard caches
 * Call after: match results updated, predictions scored
 */
export const invalidateLeaderboards = async (): Promise<void> => {
  console.log('🗑️  Invalidating leaderboard caches...');
  await deleteCachePattern(`${CACHE_KEYS.LEADERBOARD_INDIVIDUAL}*`);
  await deleteCachePattern(`${CACHE_KEYS.LEADERBOARD_DEPARTMENT}*`);
  await deleteCache(CACHE_KEYS.LEADERBOARD_DEPARTMENT);
};

/**
 * Invalidate all match caches
 * Call after: match result entered, match status changed
 */
export const invalidateMatches = async (): Promise<void> => {
  console.log('🗑️  Invalidating match caches...');
  await deleteCachePattern(`${CACHE_KEYS.MATCHES_ALL}*`);
  await deleteCachePattern('matches:*');
};

/**
 * Invalidate specific match cache
 * Call after: single match updated
 */
export const invalidateMatch = async (matchId: string): Promise<void> => {
  console.log(`🗑️  Invalidating cache for match ${matchId}...`);
  await deleteCache(CACHE_KEYS.MATCH_BY_ID(matchId));
  // Also invalidate match lists since they contain this match
  await invalidateMatches();
};

/**
 * Invalidate group standings caches
 * Call after: group stage match completed
 */
export const invalidateGroupStandings = async (groupLetter?: string): Promise<void> => {
  if (groupLetter) {
    console.log(`🗑️  Invalidating cache for group ${groupLetter}...`);
    await deleteCache(CACHE_KEYS.GROUP_STANDINGS(groupLetter));
  } else {
    console.log('🗑️  Invalidating all group standings caches...');
    await deleteCachePattern('group:standings:*');
  }
};

/**
 * Invalidate user-specific caches
 * Call after: user makes/updates predictions
 */
export const invalidateUserCache = async (userId: string): Promise<void> => {
  console.log(`🗑️  Invalidating cache for user ${userId}...`);
  await deleteCache(CACHE_KEYS.USER_PREDICTIONS(userId));
  await deleteCache(CACHE_KEYS.USER_STATS(userId));
};

/**
 * Invalidate department caches
 * Call after: department standings recalculated
 */
export const invalidateDepartmentCache = async (departmentId: string): Promise<void> => {
  console.log(`🗑️  Invalidating cache for department ${departmentId}...`);
  await deleteCache(CACHE_KEYS.DEPARTMENT_STATS(departmentId));
  await deleteCache(CACHE_KEYS.LEADERBOARD_DEPARTMENT);
};

/**
 * Invalidate teams cache
 * Call after: team data updated (rare)
 */
export const invalidateTeams = async (): Promise<void> => {
  console.log('🗑️  Invalidating teams cache...');
  await deleteCache(CACHE_KEYS.TEAMS_ALL);
  await deleteCachePattern('team:*');
};

/**
 * Invalidate bonus questions cache
 * Call after: bonus question added/updated
 */
export const invalidateBonusQuestions = async (): Promise<void> => {
  console.log('🗑️  Invalidating bonus questions cache...');
  await deleteCache(CACHE_KEYS.BONUS_QUESTIONS);
};

/**
 * Invalidate scoring rules cache
 * Call after: scoring rules updated
 */
export const invalidateScoringRules = async (): Promise<void> => {
  console.log('🗑️  Invalidating scoring rules cache...');
  await deleteCache(CACHE_KEYS.SCORING_RULES);
};

/**
 * Complete cache invalidation after match result
 * This is the main function to call when a match finishes
 */
export const invalidateAfterMatchResult = async (matchId: string, groupLetter?: string): Promise<void> => {
  console.log(`🗑️  Complete cache invalidation after match ${matchId} result...`);
  
  // Invalidate in parallel for speed
  await Promise.all([
    invalidateMatch(matchId),
    invalidateLeaderboards(),
    groupLetter ? invalidateGroupStandings(groupLetter) : Promise.resolve(),
  ]);
  
  console.log('✅ Cache invalidation complete');
};

export default {
  invalidateLeaderboards,
  invalidateMatches,
  invalidateMatch,
  invalidateGroupStandings,
  invalidateUserCache,
  invalidateDepartmentCache,
  invalidateTeams,
  invalidateBonusQuestions,
  invalidateScoringRules,
  invalidateAfterMatchResult,
};
