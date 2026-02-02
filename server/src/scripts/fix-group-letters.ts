/**
 * Fix group letters for 2022 World Cup data
 * The API doesn't provide group letters, so we assign them based on teams
 */

import { testConnection } from '../config/database';
import Team from '../models/Team';
import Match from '../models/Match';

// 2022 World Cup Groups (from Wikipedia)
const groups2022: { [key: string]: string[] } = {
  'A': ['Qatar', 'Ecuador', 'Senegal', 'Netherlands'],
  'B': ['England', 'Iran', 'USA', 'Wales'],
  'C': ['Argentina', 'Saudi Arabia', 'Mexico', 'Poland'],
  'D': ['France', 'Australia', 'Denmark', 'Tunisia'],
  'E': ['Spain', 'Costa Rica', 'Germany', 'Japan'],
  'F': ['Belgium', 'Canada', 'Morocco', 'Croatia'],
  'G': ['Brazil', 'Serbia', 'Switzerland', 'Cameroon'],
  'H': ['Portugal', 'Ghana', 'Uruguay', 'South Korea'],
};

async function fixGroupLetters() {
  console.log('🔧 Fixing group letters for 2022 World Cup data...\n');
  
  try {
    await testConnection();
    
    // Get all teams
    const teams = await Team.findAll();
    
    // Create name-to-team map
    const teamsByName: { [key: string]: Team } = {};
    for (const team of teams) {
      teamsByName[team.name] = team;
    }
    
    // Assign group letters to teams
    console.log('📝 Assigning group letters to teams...\n');
    for (const [groupLetter, teamNames] of Object.entries(groups2022)) {
      console.log(`Group ${groupLetter}:`);
      for (const teamName of teamNames) {
        const team = teamsByName[teamName];
        if (team) {
          await team.update({ groupLetter });
          console.log(`  ✅ ${teamName} -> Group ${groupLetter}`);
        } else {
          console.log(`  ⚠️  ${teamName} not found in database`);
        }
      }
      console.log('');
    }
    
    // Update group matches with group letters based on teams
    console.log('📝 Updating group stage matches...\n');
    const groupMatches = await Match.findAll({
      where: { stage: 'group' },
    });
    
    let updatedCount = 0;
    for (const match of groupMatches) {
      if (match.homeTeamId && match.awayTeamId) {
        const homeTeam = await Team.findByPk(match.homeTeamId);
        const awayTeam = await Team.findByPk(match.awayTeamId);
        
        if (homeTeam && awayTeam && homeTeam.groupLetter && homeTeam.groupLetter === awayTeam.groupLetter) {
          await match.update({ groupLetter: homeTeam.groupLetter });
          updatedCount++;
          console.log(`  ✅ Match #${match.matchNumber}: ${homeTeam.name} vs ${awayTeam.name} -> Group ${homeTeam.groupLetter}`);
        }
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} group stage matches\n`);
    
    // Summary
    console.log('='.repeat(70));
    console.log('✅ GROUP LETTERS FIXED!\n');
    
    const teamsByGroup = await Team.findAll({
      where: {},
      order: [['groupLetter', 'ASC'], ['name', 'ASC']],
    });
    
    const grouped: { [key: string]: Team[] } = {};
    for (const team of teamsByGroup) {
      const group = team.groupLetter || 'No Group';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(team);
    }
    
    for (const [group, teams] of Object.entries(grouped)) {
      console.log(`Group ${group}: ${teams.length} teams`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixGroupLetters();
