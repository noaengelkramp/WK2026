import { BonusAnswer, BonusQuestion, Match, Team, UserStatistics, User } from '../models';
import { isLeaderboardLocked } from './leaderboardLockService';

const normalize = (value: string): string => value.trim().toLowerCase();

const resolveChampion = async (): Promise<string | null> => {
  const finalMatch = await Match.findOne({
    where: { stage: 'final', status: 'finished' },
    include: [
      { model: Team, as: 'homeTeam', attributes: ['id', 'name'] },
      { model: Team, as: 'awayTeam', attributes: ['id', 'name'] },
    ],
  });

  if (!finalMatch || finalMatch.homeScore === null || finalMatch.awayScore === null) return null;
  const finalAny = finalMatch as any;
  const homeScore = finalMatch.homeScore ?? null;
  const awayScore = finalMatch.awayScore ?? null;
  if (homeScore === null || awayScore === null) return null;
  if (homeScore > awayScore) return finalAny.homeTeam?.name || null;
  if (awayScore > homeScore) return finalAny.awayTeam?.name || null;
  return null;
};

const resolveTotalGoals = async (): Promise<string | null> => {
  const finishedMatches = await Match.findAll({ where: { status: 'finished' }, attributes: ['homeScore', 'awayScore'] });
  if (!finishedMatches.length) return null;
  const total = finishedMatches.reduce((sum, match) => sum + (match.homeScore || 0) + (match.awayScore || 0), 0);
  return String(total);
};

const resolveHighestScoringTeam = async (): Promise<string | null> => {
  const finishedMatches = await Match.findAll({
    where: { status: 'finished' },
    include: [
      { model: Team, as: 'homeTeam', attributes: ['name'] },
      { model: Team, as: 'awayTeam', attributes: ['name'] },
    ],
  });

  if (!finishedMatches.length) return null;
  const goalsByTeam = new Map<string, number>();
  finishedMatches.forEach((match: any) => {
    const homeName = match.homeTeam?.name;
    const awayName = match.awayTeam?.name;
    if (homeName) goalsByTeam.set(homeName, (goalsByTeam.get(homeName) || 0) + (match.homeScore || 0));
    if (awayName) goalsByTeam.set(awayName, (goalsByTeam.get(awayName) || 0) + (match.awayScore || 0));
  });

  if (!goalsByTeam.size) return null;
  return [...goalsByTeam.entries()].sort((a, b) => b[1] - a[1])[0][0];
};

const resolveMostYellowCardsTeam = async (): Promise<string | null> => {
  // Placeholder: requires card feed integration; keep unresolved until data is available.
  return null;
};

const resolveTopScorer = async (): Promise<string | null> => {
  // Placeholder: requires player stats feed integration; keep unresolved until data is available.
  return null;
};

const resolveCorrectAnswer = async (questionType: string): Promise<string | null> => {
  switch (questionType) {
    case 'champion':
      return resolveChampion();
    case 'total_goals':
      return resolveTotalGoals();
    case 'highest_scoring_team':
      return resolveHighestScoringTeam();
    case 'most_yellow_cards':
      return resolveMostYellowCardsTeam();
    case 'top_scorer':
      return resolveTopScorer();
    default:
      return null;
  }
};

const recomputeUserBonusTotals = async (eventId: string) => {
  if (await isLeaderboardLocked(eventId)) {
    console.log(`🔒 Skipping bonus totals recompute for locked event ${eventId}`);
    return;
  }

  const users = await User.findAll({ where: { eventId }, attributes: ['id'] });

  for (const user of users) {
    const stats = await UserStatistics.findOne({ where: { eventId, userId: user.id } });
    if (!stats) continue;

    const answers = await BonusAnswer.findAll({ where: { eventId, userId: user.id } });
    const bonusPoints = answers.reduce((sum, answer) => sum + (answer.pointsEarned || 0), 0);

    // Base points from prediction points + bonus points
    const baseTotal = Math.max(0, stats.totalPoints - stats.bonusPoints);
    await stats.update({
      bonusPoints,
      totalPoints: baseTotal + bonusPoints,
    });
  }
};

export const resolveBonusQuestionsForEvent = async (eventId: string): Promise<{
  resolvedQuestions: number;
  updatedAnswers: number;
}> => {
  let resolvedQuestions = 0;
  let updatedAnswers = 0;

  const questions = await BonusQuestion.findAll({ where: { eventId, isActive: true } });

  for (const question of questions) {
    let correctAnswer = question.correctAnswer || null;
    if (!correctAnswer) {
      correctAnswer = await resolveCorrectAnswer(question.questionType);
      if (!correctAnswer) continue;
      await question.update({ correctAnswer });
      resolvedQuestions += 1;
    }

    const answers = await BonusAnswer.findAll({ where: { eventId, bonusQuestionId: question.id } });
    for (const answer of answers) {
      const isCorrect = normalize(answer.answer) === normalize(correctAnswer);
      const pointsEarned = isCorrect ? question.points : 0;
      if (answer.isCorrect !== isCorrect || (answer.pointsEarned || 0) !== pointsEarned) {
        await answer.update({ isCorrect, pointsEarned });
        updatedAnswers += 1;
      }
    }
  }

  if (updatedAnswers > 0) {
    await recomputeUserBonusTotals(eventId);
  }

  return { resolvedQuestions, updatedAnswers };
};

export const resolveBonusQuestionsForAllEvents = async (): Promise<void> => {
  const events = await User.findAll({ attributes: ['eventId'], group: ['eventId'] });
  const uniqueEventIds = [...new Set(events.map((u) => u.eventId))];

  for (const eventId of uniqueEventIds) {
    await resolveBonusQuestionsForEvent(eventId);
  }
};
