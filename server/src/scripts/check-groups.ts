/**
 * Check if group matches have groupLetter populated
 */

import { testConnection } from '../config/database';
import Match from '../models/Match';
import Team from '../models/Team';

async function checkGroups() {
  console.log('🔍 Checking group data in database...\n');
  
  try {
    await testConnection();
    
    // Check group stage matches
    const groupMatches = await Match.findAll({
      where: { stage: 'group' },
      order: [['matchNumber', 'ASC']],
      limit: 10
    });

    console.log(`Found ${groupMatches.length} group matches (showing first 10):\n`);
    
    for (const match of groupMatches) {
      const homeTeam = match.homeTeamId ? await Team.findByPk(match.homeTeamId) : null;
      const awayTeam = match.awayTeamId ? await Team.findByPk(match.awayTeamId) : null;
      
      console.log(`Match #${match.matchNumber}: ${homeTeam?.name || 'TBD'} vs ${awayTeam?.name || 'TBD'}`);
      console.log(`  Group Letter: ${match.groupLetter || 'NULL'}`);
      console.log(`  Score: ${match.homeScore}-${match.awayScore}`);
      console.log(`  Status: ${match.status}\n`);
    }

    // Check teams
    console.log('\n--- Teams with groups ---\n');
    const teams = await Team.findAll({
      where: {},
      order: [['groupLetter', 'ASC'], ['name', 'ASC']],
      limit: 32
    });

    const groupedTeams: { [key: string]: any[] } = {};
    for (const team of teams) {
      const group = team.groupLetter || 'No Group';
      if (!groupedTeams[group]) {
        groupedTeams[group] = [];
      }
      groupedTeams[group].push(team);
    }

    for (const [group, groupTeams] of Object.entries(groupedTeams)) {
      console.log(`Group ${group}: ${groupTeams.length} teams`);
      groupTeams.forEach(t => console.log(`  - ${t.name}`));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkGroups();
