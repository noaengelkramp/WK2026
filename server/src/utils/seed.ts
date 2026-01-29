import {
  Customer,
  Team,
  Match,
  ScoringRule,
  BonusQuestion,
  User,
  UserStatistics,
} from '../models';
import bcrypt from 'bcrypt';
import { testConnection } from '../config/database';

/**
 * Seed database with initial data for World Cup 2026 Prediction Game
 */
export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Initialize database connection
    await testConnection();
    // Note: Don't sync here - tables should already exist from migration
    // await syncDatabase(false);

    // Clear existing data (in correct order to respect foreign keys)
    await UserStatistics.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Match.destroy({ where: {} });
    await Team.destroy({ where: {} });
    await Customer.destroy({ where: {} });
    await ScoringRule.destroy({ where: {} });
    await BonusQuestion.destroy({ where: {} });

    // 1. Seed Customers (50 test customers)
    console.log('🏢 Seeding customers...');
    const customers = [];
    for (let i = 1; i <= 50; i++) {
      customers.push({
        customerNumber: `C1234_${String(i).padStart(7, '0')}`,
        companyName: `Test Company ${i}`,
        isActive: true,
      });
    }
    const createdCustomers = await Customer.bulkCreate(customers);
    console.log(`✅ Created ${createdCustomers.length} customers`);

    // 2. Seed Teams (48 World Cup 2026 teams)
    console.log('⚽ Seeding teams...');
    const teams = await Team.bulkCreate([
      // Group A
      { name: 'Mexico', countryCode: 'MEX', flagUrl: 'https://flagcdn.com/w320/mx.png', groupLetter: 'A', fifaRank: 12 },
      { name: 'Canada', countryCode: 'CAN', flagUrl: 'https://flagcdn.com/w320/ca.png', groupLetter: 'A', fifaRank: 41 },
      { name: 'Morocco', countryCode: 'MAR', flagUrl: 'https://flagcdn.com/w320/ma.png', groupLetter: 'A', fifaRank: 13 },
      { name: 'Croatia', countryCode: 'CRO', flagUrl: 'https://flagcdn.com/w320/hr.png', groupLetter: 'A', fifaRank: 10 },
      
      // Group B
      { name: 'England', countryCode: 'ENG', flagUrl: 'https://flagcdn.com/w320/gb-eng.png', groupLetter: 'B', fifaRank: 3 },
      { name: 'USA', countryCode: 'USA', flagUrl: 'https://flagcdn.com/w320/us.png', groupLetter: 'B', fifaRank: 11 },
      { name: 'Iran', countryCode: 'IRN', flagUrl: 'https://flagcdn.com/w320/ir.png', groupLetter: 'B', fifaRank: 21 },
      { name: 'Wales', countryCode: 'WAL', flagUrl: 'https://flagcdn.com/w320/gb-wls.png', groupLetter: 'B', fifaRank: 28 },
      
      // Group C
      { name: 'Argentina', countryCode: 'ARG', flagUrl: 'https://flagcdn.com/w320/ar.png', groupLetter: 'C', fifaRank: 1 },
      { name: 'Saudi Arabia', countryCode: 'KSA', flagUrl: 'https://flagcdn.com/w320/sa.png', groupLetter: 'C', fifaRank: 53 },
      { name: 'Poland', countryCode: 'POL', flagUrl: 'https://flagcdn.com/w320/pl.png', groupLetter: 'C', fifaRank: 26 },
      { name: 'Japan', countryCode: 'JPN', flagUrl: 'https://flagcdn.com/w320/jp.png', groupLetter: 'C', fifaRank: 20 },
      
      // Group D
      { name: 'France', countryCode: 'FRA', flagUrl: 'https://flagcdn.com/w320/fr.png', groupLetter: 'D', fifaRank: 2 },
      { name: 'Australia', countryCode: 'AUS', flagUrl: 'https://flagcdn.com/w320/au.png', groupLetter: 'D', fifaRank: 38 },
      { name: 'Denmark', countryCode: 'DEN', flagUrl: 'https://flagcdn.com/w320/dk.png', groupLetter: 'D', fifaRank: 9 },
      { name: 'Tunisia', countryCode: 'TUN', flagUrl: 'https://flagcdn.com/w320/tn.png', groupLetter: 'D', fifaRank: 30 },
      
      // Group E
      { name: 'Spain', countryCode: 'ESP', flagUrl: 'https://flagcdn.com/w320/es.png', groupLetter: 'E', fifaRank: 7 },
      { name: 'Costa Rica', countryCode: 'CRC', flagUrl: 'https://flagcdn.com/w320/cr.png', groupLetter: 'E', fifaRank: 31 },
      { name: 'Germany', countryCode: 'GER', flagUrl: 'https://flagcdn.com/w320/de.png', groupLetter: 'E', fifaRank: 11 },
      { name: 'Cameroon', countryCode: 'CMR', flagUrl: 'https://flagcdn.com/w320/cm.png', groupLetter: 'E', fifaRank: 43 },
      
      // Group F
      { name: 'Belgium', countryCode: 'BEL', flagUrl: 'https://flagcdn.com/w320/be.png', groupLetter: 'F', fifaRank: 4 },
      { name: 'Panama', countryCode: 'PAN', flagUrl: 'https://flagcdn.com/w320/pa.png', groupLetter: 'F', fifaRank: 56 },
      { name: 'Switzerland', countryCode: 'SUI', flagUrl: 'https://flagcdn.com/w320/ch.png', groupLetter: 'F', fifaRank: 14 },
      { name: 'South Korea', countryCode: 'KOR', flagUrl: 'https://flagcdn.com/w320/kr.png', groupLetter: 'F', fifaRank: 28 },
      
      // Group G
      { name: 'Brazil', countryCode: 'BRA', flagUrl: 'https://flagcdn.com/w320/br.png', groupLetter: 'G', fifaRank: 1 },
      { name: 'Serbia', countryCode: 'SRB', flagUrl: 'https://flagcdn.com/w320/rs.png', groupLetter: 'G', fifaRank: 21 },
      { name: 'Ecuador', countryCode: 'ECU', flagUrl: 'https://flagcdn.com/w320/ec.png', groupLetter: 'G', fifaRank: 44 },
      { name: 'Nigeria', countryCode: 'NGA', flagUrl: 'https://flagcdn.com/w320/ng.png', groupLetter: 'G', fifaRank: 42 },
      
      // Group H
      { name: 'Portugal', countryCode: 'POR', flagUrl: 'https://flagcdn.com/w320/pt.png', groupLetter: 'H', fifaRank: 8 },
      { name: 'Ghana', countryCode: 'GHA', flagUrl: 'https://flagcdn.com/w320/gh.png', groupLetter: 'H', fifaRank: 61 },
      { name: 'Uruguay', countryCode: 'URU', flagUrl: 'https://flagcdn.com/w320/uy.png', groupLetter: 'H', fifaRank: 13 },
      { name: 'Senegal', countryCode: 'SEN', flagUrl: 'https://flagcdn.com/w320/sn.png', groupLetter: 'H', fifaRank: 18 },
      
      // Group I
      { name: 'Netherlands', countryCode: 'NED', flagUrl: 'https://flagcdn.com/w320/nl.png', groupLetter: 'I', fifaRank: 6 },
      { name: 'Egypt', countryCode: 'EGY', flagUrl: 'https://flagcdn.com/w320/eg.png', groupLetter: 'I', fifaRank: 34 },
      { name: 'Colombia', countryCode: 'COL', flagUrl: 'https://flagcdn.com/w320/co.png', groupLetter: 'I', fifaRank: 17 },
      { name: 'Peru', countryCode: 'PER', flagUrl: 'https://flagcdn.com/w320/pe.png', groupLetter: 'I', fifaRank: 22 },
      
      // Group J
      { name: 'Italy', countryCode: 'ITA', flagUrl: 'https://flagcdn.com/w320/it.png', groupLetter: 'J', fifaRank: 5 },
      { name: 'Chile', countryCode: 'CHI', flagUrl: 'https://flagcdn.com/w320/cl.png', groupLetter: 'J', fifaRank: 27 },
      { name: 'Sweden', countryCode: 'SWE', flagUrl: 'https://flagcdn.com/w320/se.png', groupLetter: 'J', fifaRank: 18 },
      { name: 'Norway', countryCode: 'NOR', flagUrl: 'https://flagcdn.com/w320/no.png', groupLetter: 'J', fifaRank: 39 },
      
      // Group K
      { name: 'Ukraine', countryCode: 'UKR', flagUrl: 'https://flagcdn.com/w320/ua.png', groupLetter: 'K', fifaRank: 27 },
      { name: 'Turkey', countryCode: 'TUR', flagUrl: 'https://flagcdn.com/w320/tr.png', groupLetter: 'K', fifaRank: 29 },
      { name: 'South Africa', countryCode: 'RSA', flagUrl: 'https://flagcdn.com/w320/za.png', groupLetter: 'K', fifaRank: 68 },
      { name: 'Algeria', countryCode: 'ALG', flagUrl: 'https://flagcdn.com/w320/dz.png', groupLetter: 'K', fifaRank: 37 },
      
      // Group L
      { name: 'Czech Republic', countryCode: 'CZE', flagUrl: 'https://flagcdn.com/w320/cz.png', groupLetter: 'L', fifaRank: 33 },
      { name: 'Iceland', countryCode: 'ISL', flagUrl: 'https://flagcdn.com/w320/is.png', groupLetter: 'L', fifaRank: 62 },
      { name: 'Qatar', countryCode: 'QAT', flagUrl: 'https://flagcdn.com/w320/qa.png', groupLetter: 'L', fifaRank: 50 },
      { name: 'Mali', countryCode: 'MLI', flagUrl: 'https://flagcdn.com/w320/ml.png', groupLetter: 'L', fifaRank: 47 },
    ]);
    console.log(`✅ Created ${teams.length} teams`);

    // 3. Seed Matches (Sample - 48 group stage matches)
    console.log('📅 Seeding matches...');
    const matches = await Match.bulkCreate([
      // Group A matches
      { matchNumber: 1, stage: 'group', homeTeamId: teams[0].id, awayTeamId: teams[1].id, venue: 'Estadio Azteca', city: 'Mexico City', matchDate: new Date('2026-06-11T19:00:00Z'), status: 'scheduled', groupLetter: 'A' },
      { matchNumber: 2, stage: 'group', homeTeamId: teams[2].id, awayTeamId: teams[3].id, venue: 'SoFi Stadium', city: 'Los Angeles', matchDate: new Date('2026-06-11T22:00:00Z'), status: 'scheduled', groupLetter: 'A' },
      { matchNumber: 17, stage: 'group', homeTeamId: teams[0].id, awayTeamId: teams[2].id, venue: 'AT&T Stadium', city: 'Dallas', matchDate: new Date('2026-06-16T19:00:00Z'), status: 'scheduled', groupLetter: 'A' },
      { matchNumber: 18, stage: 'group', homeTeamId: teams[1].id, awayTeamId: teams[3].id, venue: 'BMO Field', city: 'Toronto', matchDate: new Date('2026-06-16T22:00:00Z'), status: 'scheduled', groupLetter: 'A' },
      { matchNumber: 33, stage: 'group', homeTeamId: teams[0].id, awayTeamId: teams[3].id, venue: 'Estadio Azteca', city: 'Mexico City', matchDate: new Date('2026-06-21T20:00:00Z'), status: 'scheduled', groupLetter: 'A' },
      { matchNumber: 34, stage: 'group', homeTeamId: teams[1].id, awayTeamId: teams[2].id, venue: 'BC Place', city: 'Vancouver', matchDate: new Date('2026-06-21T20:00:00Z'), status: 'scheduled', groupLetter: 'A' },
      
      // Group B matches
      { matchNumber: 3, stage: 'group', homeTeamId: teams[4].id, awayTeamId: teams[5].id, venue: 'Rose Bowl', city: 'Los Angeles', matchDate: new Date('2026-06-12T18:00:00Z'), status: 'scheduled', groupLetter: 'B' },
      { matchNumber: 4, stage: 'group', homeTeamId: teams[6].id, awayTeamId: teams[7].id, venue: 'Arrowhead Stadium', city: 'Kansas City', matchDate: new Date('2026-06-12T21:00:00Z'), status: 'scheduled', groupLetter: 'B' },
      { matchNumber: 19, stage: 'group', homeTeamId: teams[4].id, awayTeamId: teams[6].id, venue: 'MetLife Stadium', city: 'New York', matchDate: new Date('2026-06-17T18:00:00Z'), status: 'scheduled', groupLetter: 'B' },
      { matchNumber: 20, stage: 'group', homeTeamId: teams[5].id, awayTeamId: teams[7].id, venue: 'Gillette Stadium', city: 'Boston', matchDate: new Date('2026-06-17T21:00:00Z'), status: 'scheduled', groupLetter: 'B' },
      { matchNumber: 35, stage: 'group', homeTeamId: teams[4].id, awayTeamId: teams[7].id, venue: 'Lincoln Financial Field', city: 'Philadelphia', matchDate: new Date('2026-06-22T20:00:00Z'), status: 'scheduled', groupLetter: 'B' },
      { matchNumber: 36, stage: 'group', homeTeamId: teams[5].id, awayTeamId: teams[6].id, venue: 'Mercedes-Benz Stadium', city: 'Atlanta', matchDate: new Date('2026-06-22T20:00:00Z'), status: 'scheduled', groupLetter: 'B' },
      
      // Add more matches for other groups...
      // (Abbreviated for seed script - in production, all 104 matches would be here)
    ]);
    console.log(`✅ Created ${matches.length} matches`);

    // 4. Seed Scoring Rules
    console.log('📊 Seeding scoring rules...');
    const scoringRules = await ScoringRule.bulkCreate([
      { stage: 'group', pointsExactScore: 5, pointsCorrectWinner: 3, description: 'Group stage matches' },
      { stage: 'round32', pointsExactScore: 7, pointsCorrectWinner: 5, description: 'Round of 32 knockout matches' },
      { stage: 'round16', pointsExactScore: 10, pointsCorrectWinner: 7, description: 'Round of 16 knockout matches' },
      { stage: 'quarter', pointsExactScore: 12, pointsCorrectWinner: 9, description: 'Quarter-final matches' },
      { stage: 'semi', pointsExactScore: 15, pointsCorrectWinner: 12, description: 'Semi-final matches' },
      { stage: 'third_place', pointsExactScore: 10, pointsCorrectWinner: 7, description: 'Third place playoff' },
      { stage: 'final', pointsExactScore: 20, pointsCorrectWinner: 15, description: 'Final match' },
    ]);
    console.log(`✅ Created ${scoringRules.length} scoring rules`);

    // 5. Seed Bonus Questions
    console.log('❓ Seeding bonus questions...');
    const bonusQuestions = await BonusQuestion.bulkCreate([
      {
        questionType: 'champion',
        questionTextEn: 'Who will win the World Cup 2026?',
        questionTextNl: 'Wie wint het Wereldkampioenschap 2026?',
        points: 30,
        isActive: true,
      },
      {
        questionType: 'top_scorer',
        questionTextEn: 'Who will be the top scorer?',
        questionTextNl: 'Wie wordt de topscorer?',
        points: 15,
        isActive: true,
      },
      {
        questionType: 'total_goals',
        questionTextEn: 'How many total goals will be scored in the tournament?',
        questionTextNl: 'Hoeveel doelpunten worden er in totaal gescoord in het toernooi?',
        points: 10,
        isActive: true,
      },
      {
        questionType: 'highest_scoring_team',
        questionTextEn: 'Which team will score the most goals?',
        questionTextNl: 'Welk team scoort de meeste doelpunten?',
        points: 15,
        isActive: true,
      },
      {
        questionType: 'most_yellow_cards',
        questionTextEn: 'Which team will receive the most yellow cards?',
        questionTextNl: 'Welk team krijgt de meeste gele kaarten?',
        points: 10,
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${bonusQuestions.length} bonus questions`);

    // 6. Seed Test Users
    console.log('👥 Seeding test users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = await User.bulkCreate([
      {
        email: 'admin@wk2026.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        customerNumber: 'C1234_0000001',
        isAdmin: true,
        languagePreference: 'en',
      },
      {
        email: 'john.doe@wk2026.com',
        passwordHash: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        customerNumber: 'C1234_0000002',
        isAdmin: false,
        languagePreference: 'en',
      },
      {
        email: 'jane.smith@wk2026.com',
        passwordHash: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        customerNumber: 'C1234_0000003',
        isAdmin: false,
        languagePreference: 'nl',
      },
    ]);
    console.log(`✅ Created ${users.length} test users`);

    // 7. Create UserStatistics for each user
    console.log('📈 Creating user statistics...');
    for (const user of users) {
      await UserStatistics.create({
        userId: user.id,
        totalPoints: 0,
        exactScores: 0,
        correctWinners: 0,
        predictionsMade: 0,
        bonusPoints: 0,
      });
    }
    console.log(`✅ Created statistics for ${users.length} users`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test User Credentials:');
    console.log('  Admin: admin@wk2026.com / password123');
    console.log('  User 1: john.doe@wk2026.com / password123');
    console.log('  User 2: jane.smith@wk2026.com / password123');
    console.log('\n📊 Summary:');
    console.log(`  - ${createdCustomers.length} customers`);
    console.log(`  - ${teams.length} teams`);
    console.log(`  - ${matches.length} matches`);
    console.log(`  - ${scoringRules.length} scoring rules`);
    console.log(`  - ${bonusQuestions.length} bonus questions`);
    console.log(`  - ${users.length} test users`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}
