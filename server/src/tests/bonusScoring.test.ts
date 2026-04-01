import { resolveBonusQuestionsForEvent } from '../services/bonusScoringService';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

// Non-db smoke expectation: function should exist and be callable.
assert(typeof resolveBonusQuestionsForEvent === 'function', 'resolveBonusQuestionsForEvent should be a function');

console.log('✅ bonusScoring.test passed');
