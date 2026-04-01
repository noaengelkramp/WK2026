import { sortByTieBreak } from '../utils/tieBreak';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const rows = [
  {
    userId: 'u1',
    registrationDate: '2026-01-02T10:00:00.000Z',
    totalPoints: 20,
    exactScores: 5,
    correctWinners: 7,
    championPredictionCorrect: false,
  },
  {
    userId: 'u2',
    registrationDate: '2026-01-01T10:00:00.000Z',
    totalPoints: 20,
    exactScores: 5,
    correctWinners: 7,
    championPredictionCorrect: true,
  },
  {
    userId: 'u3',
    registrationDate: '2026-01-01T09:00:00.000Z',
    totalPoints: 20,
    exactScores: 5,
    correctWinners: 7,
    championPredictionCorrect: true,
  },
  {
    userId: 'u4',
    registrationDate: '2026-01-01T08:00:00.000Z',
    totalPoints: 21,
    exactScores: 1,
    correctWinners: 1,
    championPredictionCorrect: false,
  },
];

const sorted = sortByTieBreak(rows);

assert(sorted[0].userId === 'u4', 'Higher total points should rank first');
assert(sorted[1].userId === 'u3', 'Champion correct + earlier registration should rank higher');
assert(sorted[2].userId === 'u2', 'Champion correct should rank above champion incorrect');
assert(sorted[3].userId === 'u1', 'Champion incorrect should rank last among tied points');

console.log('✅ tieBreak.test passed');
