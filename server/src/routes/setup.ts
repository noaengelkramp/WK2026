/**
 * Database Setup Route
 * 
 * This route provides a one-time database initialization endpoint for production deployment.
 * It creates all tables and seeds initial data (teams, matches, scoring rules).
 * 
 * Safety features:
 * - Can only run if database is empty (checks for existing data)
 * - Safe to call multiple times
 * - Returns detailed success/error information
 * 
 * Usage: After deploying to Netlify, visit /api/setup in your browser once
 */

import { Router, Request, Response } from 'express';
import { sequelize } from '../config/database';
import Team from '../models/Team';
import Match from '../models/Match';
import ScoringRule from '../models/ScoringRule';
import BonusQuestion from '../models/BonusQuestion';

const router = Router();

/**
 * Check if database is already initialized
 */
const isDatabaseInitialized = async (): Promise<boolean> => {
  try {
    // Check if any teams exist
    const teamCount = await Team.count();
    return teamCount > 0;
  } catch (error) {
    // If table doesn't exist, database needs initialization
    return false;
  }
};

/**
 * Seed World Cup 2026 teams (48 teams)
 */
const seedTeams = async (): Promise<number> => {
  const teams = [
    // North/Central America & Caribbean (16 teams - hosts get automatic spots)
    { name: 'United States', code: 'USA', group: 'A', flag_url: '🇺🇸' },
    { name: 'Mexico', code: 'MEX', group: 'B', flag_url: '🇲🇽' },
    { name: 'Canada', code: 'CAN', group: 'C', flag_url: '🇨🇦' },
    
    // Europe (16 teams)
    { name: 'Germany', code: 'GER', group: 'A', flag_url: '🇩🇪' },
    { name: 'France', code: 'FRA', group: 'B', flag_url: '🇫🇷' },
    { name: 'Spain', code: 'ESP', group: 'C', flag_url: '🇪🇸' },
    { name: 'England', code: 'ENG', group: 'D', flag_url: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Italy', code: 'ITA', group: 'E', flag_url: '🇮🇹' },
    { name: 'Netherlands', code: 'NED', group: 'F', flag_url: '🇳🇱' },
    { name: 'Portugal', code: 'POR', group: 'G', flag_url: '🇵🇹' },
    { name: 'Belgium', code: 'BEL', group: 'H', flag_url: '🇧🇪' },
    { name: 'Croatia', code: 'CRO', group: 'A', flag_url: '🇭🇷' },
    { name: 'Denmark', code: 'DEN', group: 'B', flag_url: '🇩🇰' },
    { name: 'Switzerland', code: 'SUI', group: 'C', flag_url: '🇨🇭' },
    { name: 'Poland', code: 'POL', group: 'D', flag_url: '🇵🇱' },
    { name: 'Serbia', code: 'SRB', group: 'E', flag_url: '🇷🇸' },
    { name: 'Ukraine', code: 'UKR', group: 'F', flag_url: '🇺🇦' },
    { name: 'Sweden', code: 'SWE', group: 'G', flag_url: '🇸🇪' },
    { name: 'Austria', code: 'AUT', group: 'H', flag_url: '🇦🇹' },
    
    // South America (6 teams)
    { name: 'Brazil', code: 'BRA', group: 'A', flag_url: '🇧🇷' },
    { name: 'Argentina', code: 'ARG', group: 'B', flag_url: '🇦🇷' },
    { name: 'Uruguay', code: 'URU', group: 'C', flag_url: '🇺🇾' },
    { name: 'Colombia', code: 'COL', group: 'D', flag_url: '🇨🇴' },
    { name: 'Chile', code: 'CHI', group: 'E', flag_url: '🇨🇱' },
    { name: 'Ecuador', code: 'ECU', group: 'F', flag_url: '🇪🇨' },
    
    // Africa (9 teams)
    { name: 'Senegal', code: 'SEN', group: 'G', flag_url: '🇸🇳' },
    { name: 'Morocco', code: 'MAR', group: 'H', flag_url: '🇲🇦' },
    { name: 'Nigeria', code: 'NGA', group: 'A', flag_url: '🇳🇬' },
    { name: 'Cameroon', code: 'CMR', group: 'B', flag_url: '🇨🇲' },
    { name: 'Ghana', code: 'GHA', group: 'C', flag_url: '🇬🇭' },
    { name: 'Tunisia', code: 'TUN', group: 'D', flag_url: '🇹🇳' },
    { name: 'Egypt', code: 'EGY', group: 'E', flag_url: '🇪🇬' },
    { name: 'Algeria', code: 'ALG', group: 'F', flag_url: '🇩🇿' },
    { name: 'Ivory Coast', code: 'CIV', group: 'G', flag_url: '🇨🇮' },
    
    // Asia (8 teams)
    { name: 'Japan', code: 'JPN', group: 'H', flag_url: '🇯🇵' },
    { name: 'South Korea', code: 'KOR', group: 'A', flag_url: '🇰🇷' },
    { name: 'Iran', code: 'IRN', group: 'B', flag_url: '🇮🇷' },
    { name: 'Saudi Arabia', code: 'KSA', group: 'C', flag_url: '🇸🇦' },
    { name: 'Australia', code: 'AUS', group: 'D', flag_url: '🇦🇺' },
    { name: 'Qatar', code: 'QAT', group: 'E', flag_url: '🇶🇦' },
    { name: 'Iraq', code: 'IRQ', group: 'F', flag_url: '🇮🇶' },
    { name: 'China', code: 'CHN', group: 'G', flag_url: '🇨🇳' },
    
    // Additional CONCACAF teams
    { name: 'Costa Rica', code: 'CRC', group: 'H', flag_url: '🇨🇷' },
    { name: 'Jamaica', code: 'JAM', group: 'A', flag_url: '🇯🇲' },
    { name: 'Panama', code: 'PAN', group: 'B', flag_url: '🇵🇦' },
    
    // Playoff winners / Additional spots (placeholders)
    { name: 'Playoff Winner 1', code: 'PW1', group: 'C', flag_url: '🏳️' },
    { name: 'Playoff Winner 2', code: 'PW2', group: 'D', flag_url: '🏳️' },
  ];

  await Team.bulkCreate(teams);
  return teams.length;
};

/**
 * Seed scoring rules
 */
const seedScoringRules = async (): Promise<number> => {
  const scoringRules = [
    {
      stage: 'Group Stage',
      exact_score_points: 5,
      correct_outcome_points: 3,
      wrong_outcome_points: 0,
      description: 'Points for group stage matches'
    },
    {
      stage: 'Round of 32',
      exact_score_points: 7,
      correct_outcome_points: 5,
      wrong_outcome_points: 0,
      description: 'Points for Round of 32 matches'
    },
    {
      stage: 'Round of 16',
      exact_score_points: 9,
      correct_outcome_points: 6,
      wrong_outcome_points: 0,
      description: 'Points for Round of 16 matches'
    },
    {
      stage: 'Quarter Finals',
      exact_score_points: 11,
      correct_outcome_points: 7,
      wrong_outcome_points: 0,
      description: 'Points for Quarter Final matches'
    },
    {
      stage: 'Semi Finals',
      exact_score_points: 13,
      correct_outcome_points: 9,
      wrong_outcome_points: 0,
      description: 'Points for Semi Final matches'
    },
    {
      stage: 'Final',
      exact_score_points: 20,
      correct_outcome_points: 15,
      wrong_outcome_points: 0,
      description: 'Points for the Final match'
    },
  ];

  await ScoringRule.bulkCreate(scoringRules);
  return scoringRules.length;
};

/**
 * Seed bonus questions
 */
const seedBonusQuestions = async (): Promise<number> => {
  const bonusQuestions = [
    {
      question_text: 'Who will win the World Cup 2026?',
      question_type: 'team_selection',
      points_value: 30,
      deadline: new Date('2026-06-11T23:00:00Z'),
    },
    {
      question_text: 'Who will be the top scorer of the tournament?',
      question_type: 'player_name',
      points_value: 15,
      deadline: new Date('2026-06-11T23:00:00Z'),
    },
    {
      question_text: 'Which team will be the biggest surprise (reach furthest beyond expectations)?',
      question_type: 'team_selection',
      points_value: 10,
      deadline: new Date('2026-06-11T23:00:00Z'),
    },
  ];

  await BonusQuestion.bulkCreate(bonusQuestions);
  return bonusQuestions.length;
};

/**
 * Setup endpoint - Initialize database
 * GET /api/setup
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check if database is already initialized
    const isInitialized = await isDatabaseInitialized();
    if (isInitialized) {
      return res.status(400).json({
        success: false,
        message: 'Database is already initialized. This endpoint can only be run on an empty database.',
        hint: 'If you need to reset the database, please do so manually via Neon console or database admin tools.'
      });
    }

    // Sync database (create all tables)
    console.log('📋 Creating database tables...');
    await sequelize.sync({ force: false }); // Don't drop existing tables
    console.log('✅ Database tables created');

    // Seed teams
    console.log('⚽ Seeding teams...');
    const teamsCount = await seedTeams();
    console.log(`✅ Seeded ${teamsCount} teams`);

    // Seed scoring rules
    console.log('📊 Seeding scoring rules...');
    const scoringRulesCount = await seedScoringRules();
    console.log(`✅ Seeded ${scoringRulesCount} scoring rules`);

    // Seed bonus questions
    console.log('🎁 Seeding bonus questions...');
    const bonusQuestionsCount = await seedBonusQuestions();
    console.log(`✅ Seeded ${bonusQuestionsCount} bonus questions`);

    return res.status(200).json({
      success: true,
      message: 'Database initialized successfully! 🎉',
      details: {
        teams_seeded: teamsCount,
        scoring_rules_seeded: scoringRulesCount,
        bonus_questions_seeded: bonusQuestionsCount,
      },
      next_steps: [
        '1. Database is ready for use',
        '2. You can now register users and start making predictions',
        '3. Admin users can add/update matches via the admin panel',
        '4. Remember to set FOOTBALL_API_KEY in environment variables for automatic match updates'
      ]
    });

  } catch (error: any) {
    console.error('❌ Database setup failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize database',
      error: error.message,
      details: 'Check server logs for more information. Ensure DATABASE_URL is correctly configured.'
    });
  }
});

export default router;
