/**
 * Sync World Cup 2022 data into database for testing
 * This allows full testing of prediction flow with real API data
 * 
 * Usage:
 *   cd server
 *   npx ts-node src/scripts/sync-2022-data.ts
 * 
 * What it does:
 * 1. Fetches 32 teams from 2022 World Cup
 * 2. Fetches 64 fixtures (48 group + 16 knockout)
 * 3. Imports into database (replaces existing data)
 * 4. Maps team IDs to our schema
 */

import footballApiService from '../services/footballApiService';
import { testConnection } from '../config/database';
import Team from '../models/Team';
import Match from '../models/Match';

interface TeamMapping {
  apiId: number;
  dbId: string;
  name: string;
  code: string;
}

const groupMapping: { [key: string]: string } = {
  'Group A': 'A',
  'Group B': 'B',
  'Group C': 'C',
  'Group D': 'D',
  'Group E': 'E',
  'Group F': 'F',
  'Group G': 'G',
  'Group H': 'H',
};

const stageMapping: { [key: string]: string } = {
  'Group Stage': 'group',
  'Round of 16': 'round16',
  'Quarter-finals': 'quarter',
  'Semi-finals': 'semi',
  'Final': 'final',
  '3rd Place Final': 'third_place',
};

async function sync2022Data() {
  console.log('🏆 SYNCING WORLD CUP 2022 DATA\n');
  console.log('='.repeat(70));
  
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await testConnection();
    console.log('✅ Connected to database\n');

    // Step 1: Fetch teams from API
    console.log('📊 Step 1: Fetching teams from API-Football (2022)...');
    const apiTeams = await footballApiService.getTeams('2022');
    console.log(`✅ Fetched ${apiTeams.length} teams\n`);

    // Step 2: Clear existing teams and matches
    console.log('🗑️  Step 2: Clearing existing teams and matches...');
    await Match.destroy({ where: {} });
    await Team.destroy({ where: {} });
    console.log('✅ Cleared existing data\n');

    // Step 3: Import teams
    console.log('📥 Step 3: Importing teams...');
    const teamMappings: TeamMapping[] = [];
    
    for (const apiTeam of apiTeams) {
      const team = await Team.create({
        name: apiTeam.name,
        countryCode: apiTeam.code,
        flagUrl: apiTeam.logo,
        groupLetter: null, // Will be set based on fixtures
        fifaRank: 0, // Not in API response
        apiTeamId: apiTeam.id.toString(),
      });

      teamMappings.push({
        apiId: apiTeam.id,
        dbId: team.id,
        name: apiTeam.name,
        code: apiTeam.code,
      });

      console.log(`  ✅ ${apiTeam.name} (${apiTeam.code}) - API ID: ${apiTeam.id}`);
    }
    console.log(`\n✅ Imported ${teamMappings.length} teams\n`);

    // Step 4: Fetch fixtures
    console.log('📊 Step 4: Fetching fixtures from API-Football (2022)...');
    const apiFixtures = await footballApiService.getFixtures('2022');
    console.log(`✅ Fetched ${apiFixtures.length} fixtures\n`);

    // Step 5: Import fixtures
    console.log('📥 Step 5: Importing fixtures...');
    let matchNumber = 1;
    
    for (const apiFixture of apiFixtures) {
      // Find home and away teams in our database
      const homeTeamMapping = teamMappings.find(t => t.apiId === apiFixture.teams.home.id);
      const awayTeamMapping = teamMappings.find(t => t.apiId === apiFixture.teams.away.id);

      if (!homeTeamMapping || !awayTeamMapping) {
        console.warn(`  ⚠️  Skipping match: Team not found (${apiFixture.teams.home.name} vs ${apiFixture.teams.away.name})`);
        continue;
      }

      // Extract group letter from round (e.g., "Group Stage - 1" -> "A")
      const roundName = apiFixture.league.round;
      let groupLetter = null;
      
      for (const [key, value] of Object.entries(groupMapping)) {
        if (roundName.includes(key)) {
          groupLetter = value;
          break;
        }
      }

      // Determine stage
      let stage = 'group';
      for (const [key, value] of Object.entries(stageMapping)) {
        if (roundName.includes(key)) {
          stage = value;
          break;
        }
      }

      // Create match
      const match = await Match.create({
        matchNumber: matchNumber++,
        stage: stage as any,
        homeTeamId: homeTeamMapping.dbId,
        awayTeamId: awayTeamMapping.dbId,
        venue: apiFixture.fixture.venue.name || 'Unknown',
        city: apiFixture.fixture.venue.city || 'Unknown',
        matchDate: new Date(apiFixture.fixture.date),
        homeScore: apiFixture.goals.home,
        awayScore: apiFixture.goals.away,
        status: apiFixture.fixture.status.short === 'FT' ? 'finished' : 
                apiFixture.fixture.status.short === 'NS' ? 'scheduled' : 'live',
        groupLetter: groupLetter,
        apiMatchId: apiFixture.fixture.id.toString(),
      });

      console.log(
        `  ${matchNumber - 1}. ${homeTeamMapping.name} vs ${awayTeamMapping.name} ` +
        `(${apiFixture.goals.home}-${apiFixture.goals.away}) - ${stage} - ${groupLetter || 'N/A'}`
      );
    }

    console.log(`\n✅ Imported ${matchNumber - 1} fixtures\n`);

    // Step 6: Update team groups based on fixtures
    console.log('📥 Step 6: Updating team groups...');
    const groupMatches = await Match.findAll({
      where: { stage: 'group' },
      include: [
        { model: Team, as: 'homeTeam' },
        { model: Team, as: 'awayTeam' },
      ],
    });

    for (const match of groupMatches) {
      if (match.groupLetter) {
        if (match.homeTeam && !match.homeTeam.groupLetter) {
          await match.homeTeam.update({ groupLetter: match.groupLetter });
        }
        if (match.awayTeam && !match.awayTeam.groupLetter) {
          await match.awayTeam.update({ groupLetter: match.groupLetter });
        }
      }
    }
    console.log('✅ Updated team groups\n');

    // Summary
    console.log('='.repeat(70));
    console.log('✅ SYNC COMPLETED SUCCESSFULLY!\n');
    
    const teamCount = await Team.count();
    const matchCount = await Match.count();
    const groupCount = await Match.count({ where: { stage: 'group' } });
    const knockoutCount = await Match.count({ where: { stage: ['round16', 'quarter', 'semi', 'final', 'third_place'] } });
    const finishedCount = await Match.count({ where: { status: 'finished' } });

    console.log('Summary:');
    console.log(`  - Teams: ${teamCount}`);
    console.log(`  - Total Matches: ${matchCount}`);
    console.log(`  - Group Stage: ${groupCount}`);
    console.log(`  - Knockout Stage: ${knockoutCount}`);
    console.log(`  - Finished Matches: ${finishedCount}`);
    
    console.log('\n📝 Next Steps:');
    console.log('  1. Test prediction submission with these matches');
    console.log('  2. Test scoring calculation');
    console.log('  3. Test leaderboards');
    console.log('  4. When 2026 data is available, re-run with 2026 season');
    
    console.log('='.repeat(70));
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ SYNC FAILED:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the sync
sync2022Data();
