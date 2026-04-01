import cron from 'node-cron';
import { Match } from '../models';
import { processMatchScoring, recalculateAllScores } from './scoringService';
import { resolveBonusQuestionsForAllEvents } from './bonusScoringService';

let jobsStarted = false;

const scoreRecentFinishedMatches = async () => {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 2 * 60 * 60 * 1000); // last 2 hours

  const recentMatches = await Match.findAll({
    where: {
      status: 'finished',
      updatedAt: {
        // @ts-ignore - Sequelize Op imported lazily to avoid additional dependency here
        [require('sequelize').Op.gte]: windowStart,
      },
    },
    attributes: ['id'],
  });

  for (const match of recentMatches) {
    await processMatchScoring(match.id);
  }
};

export const startLeaderboardSchedulers = () => {
  if (jobsStarted) return;
  jobsStarted = true;

  // Hourly reconciliation: recently updated finished matches + bonus resolution
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🕐 Hourly leaderboard reconciliation started');
      await scoreRecentFinishedMatches();
      await resolveBonusQuestionsForAllEvents();
      console.log('✅ Hourly leaderboard reconciliation completed');
    } catch (error) {
      console.error('❌ Hourly leaderboard reconciliation failed:', error);
    }
  });

  // Daily integrity run
  cron.schedule('15 2 * * *', async () => {
    try {
      console.log('📆 Daily leaderboard integrity run started');
      await recalculateAllScores();
      await resolveBonusQuestionsForAllEvents();
      console.log('✅ Daily leaderboard integrity run completed');
    } catch (error) {
      console.error('❌ Daily leaderboard integrity run failed:', error);
    }
  });

  console.log('✅ Leaderboard schedulers initialized');
};
