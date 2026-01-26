import { Match, Prediction, ScoringRule, UserStatistics, User } from '../models';

/**
 * Calculate points for a single prediction based on match result
 */
export async function calculatePredictionPoints(
  prediction: Prediction,
  match: Match
): Promise<{ pointsEarned: number; isCorrectScore: boolean; isCorrectWinner: boolean }> {
  // Get scoring rule for this match stage
  const scoringRule = await ScoringRule.findOne({
    where: { stage: match.stage },
  });

  if (!scoringRule) {
    throw new Error(`No scoring rule found for stage: ${match.stage}`);
  }

  const actualHomeScore = match.homeScore!;
  const actualAwayScore = match.awayScore!;
  const predictedHomeScore = prediction.homeScore;
  const predictedAwayScore = prediction.awayScore;

  // Determine actual winner
  let actualWinner: 'home' | 'away' | 'draw';
  if (actualHomeScore > actualAwayScore) {
    actualWinner = 'home';
  } else if (actualAwayScore > actualHomeScore) {
    actualWinner = 'away';
  } else {
    actualWinner = 'draw';
  }

  // Determine predicted winner
  let predictedWinner: 'home' | 'away' | 'draw';
  if (predictedHomeScore > predictedAwayScore) {
    predictedWinner = 'home';
  } else if (predictedAwayScore > predictedHomeScore) {
    predictedWinner = 'away';
  } else {
    predictedWinner = 'draw';
  }

  // Check if exact score
  const isCorrectScore =
    predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore;

  // Check if correct winner
  const isCorrectWinner = predictedWinner === actualWinner;

  // Calculate points
  let pointsEarned = 0;
  if (isCorrectScore) {
    pointsEarned = scoringRule.pointsExactScore;
  } else if (isCorrectWinner) {
    pointsEarned = scoringRule.pointsCorrectWinner;
  }

  return { pointsEarned, isCorrectScore, isCorrectWinner };
}

/**
 * Process all predictions for a finished match and update user statistics
 */
export async function processMatchScoring(matchId: string): Promise<void> {
  // Get the match
  const match = await Match.findOne({
    where: { id: matchId },
  });

  if (!match) {
    throw new Error(`Match not found: ${matchId}`);
  }

  if (match.status !== 'finished' || match.homeScore === null || match.awayScore === null) {
    throw new Error(`Match ${matchId} is not finished or has no scores`);
  }

  // Get all predictions for this match
  const predictions = await Prediction.findAll({
    where: { matchId },
    include: [{ model: User, as: 'user' }],
  });

  console.log(`Processing ${predictions.length} predictions for match ${matchId}`);

  // Calculate points for each prediction
  for (const prediction of predictions) {
    const { pointsEarned, isCorrectScore, isCorrectWinner } = await calculatePredictionPoints(
      prediction,
      match
    );

    // Update prediction with points
    await prediction.update({
      pointsEarned,
      isCorrectScore,
      isCorrectWinner,
    });

    // Update user statistics
    await updateUserStatistics(prediction.userId, pointsEarned, isCorrectScore, isCorrectWinner);

    console.log(`  User ${prediction.userId}: ${pointsEarned} points (exact: ${isCorrectScore}, winner: ${isCorrectWinner})`);
  }

  console.log(`✅ Scoring complete for match ${matchId}`);
}

/**
 * Update user statistics after scoring a prediction
 */
async function updateUserStatistics(
  userId: string,
  pointsEarned: number,
  isCorrectScore: boolean,
  isCorrectWinner: boolean
): Promise<void> {
  const stats = await UserStatistics.findOne({
    where: { userId },
  });

  if (!stats) {
    // Create statistics if they don't exist
    await UserStatistics.create({
      userId,
      totalPoints: pointsEarned,
      exactScores: isCorrectScore ? 1 : 0,
      correctWinners: isCorrectWinner ? 1 : 0,
      predictionsMade: 1,
      bonusPoints: 0,
    });
  } else {
    // Update existing statistics
    await stats.update({
      totalPoints: stats.totalPoints + pointsEarned,
      exactScores: stats.exactScores + (isCorrectScore ? 1 : 0),
      correctWinners: stats.correctWinners + (isCorrectWinner ? 1 : 0),
    });
  }
}

/**
 * Recalculate all match scores (useful after importing results)
 */
export async function recalculateAllScores(): Promise<void> {
  console.log('🔄 Recalculating all scores...');

  // Get all finished matches
  const finishedMatches = await Match.findAll({
    where: {
      status: 'finished',
    },
  });

  console.log(`Found ${finishedMatches.length} finished matches`);

  // Process each match
  for (const match of finishedMatches) {
    if (match.homeScore !== null && match.awayScore !== null) {
      await processMatchScoring(match.id);
    }
  }

  console.log('✅ All scores recalculated');
}
