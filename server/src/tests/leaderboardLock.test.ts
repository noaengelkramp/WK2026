import { isLeaderboardLocked } from '../services/leaderboardLockService';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(typeof isLeaderboardLocked === 'function', 'isLeaderboardLocked should be a function');

console.log('✅ leaderboardLock.test passed');
