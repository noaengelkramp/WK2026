import axios from 'axios';
import { Team, Match } from '../models';
import { config } from '../config/environment';

/**
 * Populate matches using Football API data
 * 
 * Strategy:
 * 1. Fetch 2022 World Cup fixtures as a template (structure, rounds, schedule)
 * 2. Map to our 2026 teams in the database
 * 3. Update venues to 2026 host cities (USA, Canada, Mexico)
 * 4. Adjust dates to 2026 tournament schedule (June 11 - July 19, 2026)
 */

// 2026 World Cup venues (USA, Canada, Mexico)
const VENUES_2026 = [
  // USA
  { name: 'MetLife Stadium', city: 'New York/New Jersey' },
  { name: 'SoFi Stadium', city: 'Los Angeles' },
  { name: 'AT&T Stadium', city: 'Dallas' },
  { name: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  { name: 'NRG Stadium', city: 'Houston' },
  { name: 'Arrowhead Stadium', city: 'Kansas City' },
  { name: 'Lincoln Financial Field', city: 'Philadelphia' },
  { name: 'Lumen Field', city: 'Seattle' },
  { name: 'Levi\'s Stadium', city: 'San Francisco Bay Area' },
  { name: 'Gillette Stadium', city: 'Boston' },
  { name: 'Hard Rock Stadium', city: 'Miami' },
  // Mexico
  { name: 'Estadio Azteca', city: 'Mexico City' },
  { name: 'Estadio BBVA', city: 'Monterrey' },
  { name: 'Estadio Akron', city: 'Guadalajara' },
  // Canada
  { name: 'BMO Field', city: 'Toronto' },
  { name: 'BC Place', city: 'Vancouver' },
];

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    venue: { name: string; city: string };
    status: { short: string };
  };
  league: {
    round: string;
  };
  teams: {
    home: { id: number; name: string; code: string };
    away: { id: number; name: string; code: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

/**
 * Map 2022 round names to our stage enum
 */
function mapRoundToStage(round: string): string {
  const roundLower = round.toLowerCase();
  
  if (roundLower.includes('group')) return 'group';
  if (roundLower.includes('round of 32')) return 'round32';
  if (roundLower.includes('round of 16')) return 'round16';
  if (roundLower.includes('quarter')) return 'quarter';
  if (roundLower.includes('semi')) return 'semi';
  if (roundLower.includes('final') && !roundLower.includes('semi')) return 'final';
  if (roundLower.includes('3rd') || roundLower.includes('third')) return 'third_place';
  
  return 'group'; // default
}

/**
 * Extract group letter from round name (e.g., "Group A" -> "A")
 */
function extractGroupLetter(round: string): string | null {
  const match = round.match(/Group ([A-L])/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Adjust 2022 date to 2026 tournament schedule
 * 2022: Nov 20 - Dec 18 (28 days)
 * 2026: Jun 11 - Jul 19 (38 days)
 */
function adjustDateTo2026(date2022: string): Date {
  const originalDate = new Date(date2022);
  const tournamentStart2022 = new Date('2022-11-20');
  const tournamentStart2026 = new Date('2026-06-11');
  
  // Calculate days from start of 2022 tournament
  const daysFromStart = Math.floor(
    (originalDate.getTime() - tournamentStart2022.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Add same number of days to 2026 start
  const newDate = new Date(tournamentStart2026);
  newDate.setDate(newDate.getDate() + daysFromStart);
  
  return newDate;
}

/**
 * Find matching team in our database by name or country code
 */
async function findMatchingTeam(apiTeam: { name: string; code: string }): Promise<any> {
  // Try exact name match first
  let team = await Team.findOne({
    where: { name: apiTeam.name }
  });
  
  if (team) return team;
  
  // Try country code match (only if code is provided)
  if (apiTeam.code) {
    team = await Team.findOne({
      where: { countryCode: apiTeam.code }
    });
    
    if (team) return team;
  }
  
  // Try partial name match
  const allTeams = await Team.findAll();
  const foundTeam = allTeams.find(t => 
    t.name.toLowerCase().includes(apiTeam.name.toLowerCase()) ||
    apiTeam.name.toLowerCase().includes(t.name.toLowerCase())
  );
  
  return foundTeam ? foundTeam : null;
}

/**
 * Get random venue from 2026 venues
 */
function getRandomVenue(): { name: string; city: string } {
  return VENUES_2026[Math.floor(Math.random() * VENUES_2026.length)];
}

/**
 * Main function to populate matches from Football API
 */
export async function populateMatchesFromApi(): Promise<void> {
  try {
    console.log('🏆 Populating matches from Football API...\n');
    
    // Check if API is configured
    if (!config.footballApi.key || config.footballApi.key === 'your-api-key-here') {
      throw new Error('Football API key not configured. Please set FOOTBALL_API_KEY in .env');
    }
    
    // Fetch 2022 World Cup fixtures
    console.log('📡 Fetching 2022 World Cup fixtures...');
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'x-apisports-key': config.footballApi.key,
      },
      params: {
        league: 1, // World Cup
        season: 2022,
      },
    });
    
    const fixtures: ApiFootballFixture[] = response.data.response || [];
    console.log(`✅ Fetched ${fixtures.length} fixtures from 2022 World Cup\n`);
    
    if (fixtures.length === 0) {
      throw new Error('No fixtures found in API response');
    }
    
    // Clear existing matches
    console.log('🗑️  Clearing existing matches...');
    await Match.destroy({ where: {} });
    console.log('✅ Cleared existing matches\n');
    
    // Get all teams from database
    const allTeams = await Team.findAll();
    console.log(`📋 Found ${allTeams.length} teams in database\n`);
    
    // Process fixtures
    console.log('⚙️  Processing fixtures...\n');
    let matchNumber = 1;
    let created = 0;
    let skipped = 0;
    
    for (const fixture of fixtures) {
      try {
        // Find matching teams
        const homeTeam = await findMatchingTeam(fixture.teams.home);
        const awayTeam = await findMatchingTeam(fixture.teams.away);
        
        if (!homeTeam || !awayTeam) {
          console.log(`⏭️  Skipping: ${fixture.teams.home.name} vs ${fixture.teams.away.name} (teams not found)`);
          skipped++;
          continue;
        }
        
        // Map round to stage
        const stage = mapRoundToStage(fixture.league.round) as 'group' | 'round32' | 'round16' | 'quarter' | 'semi' | 'final' | 'third_place';
        const groupLetter = extractGroupLetter(fixture.league.round);
        
        // Adjust date to 2026
        const matchDate = adjustDateTo2026(fixture.fixture.date);
        
        // Get venue
        const venue = getRandomVenue();
        
        // Determine status
        let status: 'scheduled' | 'live' | 'finished' = 'scheduled';
        if (fixture.goals.home !== null && fixture.goals.away !== null) {
          status = 'finished';
        }
        
        // Create match
        await Match.create({
          matchNumber: matchNumber++,
          stage,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          venue: venue.name,
          city: venue.city,
          matchDate,
          homeScore: fixture.goals.home ?? undefined,
          awayScore: fixture.goals.away ?? undefined,
          status,
          groupLetter: groupLetter ?? undefined,
          apiMatchId: fixture.fixture.id.toString(),
        });
        
        console.log(`✅ Created: ${homeTeam.name} vs ${awayTeam.name} - ${venue.city} (${matchDate.toISOString().split('T')[0]})`);
        created++;
        
      } catch (error) {
        console.error(`❌ Error processing fixture:`, error);
        skipped++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created} matches`);
    console.log(`   ⏭️  Skipped: ${skipped} matches`);
    console.log(`   📅 Date range: June 11 - July 19, 2026`);
    console.log(`   🏟️  Venues: ${VENUES_2026.length} stadiums across USA, Canada, Mexico`);
    console.log('\n✅ Match population completed!');
    
  } catch (error: any) {
    console.error('❌ Error populating matches:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  populateMatchesFromApi()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}
