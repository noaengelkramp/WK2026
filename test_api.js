// Test script to verify API responses
// Run with: node test_api.js

const BASE_URL = 'https://wk2026.netlify.app/api';

async function testGroupsAPI() {
  console.log('🔍 Testing Groups API...\n');
  
  try {
    // Test 1: Get group stage matches
    console.log('1️⃣ Fetching group stage matches...');
    const matchesResponse = await fetch(`${BASE_URL}/matches?stage=group`);
    const matchesData = await matchesResponse.json();
    
    console.log(`   Total matches: ${matchesData.matches.length}`);
    
    // Count statuses
    const statusCount = matchesData.matches.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});
    console.log('   Status breakdown:', statusCount);
    
    // Check for finished matches
    const finishedMatches = matchesData.matches.filter(m => m.status === 'finished');
    console.log(`   Finished matches: ${finishedMatches.length}`);
    
    if (finishedMatches.length > 0) {
      console.log('\n   Sample finished matches:');
      finishedMatches.slice(0, 5).forEach(m => {
        const homeTeam = m.homeTeam?.name || 'NULL';
        const awayTeam = m.awayTeam?.name || 'NULL';
        console.log(`   - Match ${m.matchNumber} (Group ${m.groupLetter}): ${homeTeam} ${m.homeScore}-${m.awayScore} ${awayTeam}`);
      });
    } else {
      console.log('   ⚠️ No finished matches found!');
    }
    
    // Check for null teams
    const nullTeams = matchesData.matches.filter(m => !m.homeTeam || !m.awayTeam);
    console.log(`\n   Matches with null teams: ${nullTeams.length}`);
    if (nullTeams.length > 0) {
      console.log('   Sample null team matches:');
      nullTeams.slice(0, 3).forEach(m => {
        console.log(`   - Match ${m.matchNumber}: homeTeam=${m.homeTeam ? 'OK' : 'NULL'}, awayTeam=${m.awayTeam ? 'OK' : 'NULL'}`);
      });
    }
    
    // Test 2: Get teams
    console.log('\n2️⃣ Fetching teams...');
    const teamsResponse = await fetch(`${BASE_URL}/teams`);
    const teamsData = await teamsResponse.json();
    console.log(`   Total teams: ${teamsData.teams.length}`);
    
    // Group breakdown
    const groupCount = teamsData.teams.reduce((acc, t) => {
      acc[t.groupLetter] = (acc[t.groupLetter] || 0) + 1;
      return acc;
    }, {});
    console.log('   Teams per group:', groupCount);
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGroupsAPI();
