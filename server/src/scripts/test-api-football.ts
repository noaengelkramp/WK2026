/**
 * Test script for API-Football integration
 * Tests fetching real World Cup data from 2022 (free plan only has access to 2022-2024)
 * 
 * Usage:
 *   cd server
 *   npx ts-node src/scripts/test-api-football.ts
 */

import footballApiService from '../services/footballApiService';

async function testApiFootball() {
  console.log('🏆 API-FOOTBALL INTEGRATION TEST\n');
  console.log('='.repeat(60));
  console.log('Testing with World Cup 2022 data (2026 requires paid plan)\n');

  try {
    // Test 1: Check API Key Status
    console.log('📊 TEST 1: API Status');
    console.log('-'.repeat(60));
    
    const statusResponse = await footballApiService['client'].get('/status');
    const status = statusResponse.data.response;
    
    console.log(`✅ Account: ${status.account.firstname} ${status.account.lastname}`);
    console.log(`✅ Email: ${status.account.email}`);
    console.log(`✅ Plan: ${status.subscription.plan}`);
    console.log(`✅ Active: ${status.subscription.active}`);
    console.log(`✅ Expires: ${status.subscription.end}`);
    console.log(`✅ Requests Today: ${status.requests.current}/${status.requests.limit_day}`);
    console.log(`✅ Remaining: ${status.requests.limit_day - status.requests.current}\n`);

    // Test 2: Fetch Teams
    console.log('📊 TEST 2: Fetch Teams (2022)');
    console.log('-'.repeat(60));
    
    const teams = await footballApiService.getTeams('2022');
    console.log(`✅ Found ${teams.length} teams\n`);
    
    if (teams.length > 0) {
      console.log('Sample teams:');
      teams.slice(0, 5).forEach((team) => {
        console.log(`  - ${team.name} (${team.code}) - ID: ${team.id}`);
      });
      console.log(`  ... and ${teams.length - 5} more\n`);
    }

    // Test 3: Fetch Fixtures
    console.log('📊 TEST 3: Fetch Fixtures (2022)');
    console.log('-'.repeat(60));
    
    const fixtures = await footballApiService.getFixtures('2022');
    console.log(`✅ Found ${fixtures.length} fixtures\n`);
    
    if (fixtures.length > 0) {
      console.log('First 5 matches:');
      fixtures.slice(0, 5).forEach((fixture) => {
        const date = new Date(fixture.fixture.date).toLocaleDateString();
        const status = fixture.fixture.status.short;
        const homeTeam = fixture.teams.home.name;
        const awayTeam = fixture.teams.away.name;
        const homeGoals = fixture.goals.home ?? '-';
        const awayGoals = fixture.goals.away ?? '-';
        const venue = fixture.fixture.venue.city;
        
        console.log(`  ${date} | ${homeTeam} ${homeGoals}-${awayGoals} ${awayTeam} | ${venue} | ${status}`);
      });
      console.log(`  ... and ${fixtures.length - 5} more\n`);
      
      // Show match statistics
      const groupStage = fixtures.filter(f => f.league.round.includes('Group'));
      const knockoutStage = fixtures.filter(f => !f.league.round.includes('Group'));
      const finished = fixtures.filter(f => f.fixture.status.short === 'FT');
      
      console.log('Match Statistics:');
      console.log(`  - Total matches: ${fixtures.length}`);
      console.log(`  - Group stage: ${groupStage.length}`);
      console.log(`  - Knockout stage: ${knockoutStage.length}`);
      console.log(`  - Finished: ${finished.length}\n`);
    }

    // Test 4: Fetch Standings
    console.log('📊 TEST 4: Fetch Standings (2022)');
    console.log('-'.repeat(60));
    
    const standings = await footballApiService.getStandings('2022');
    console.log(`✅ Found ${standings.length} teams in standings\n`);
    
    if (standings.length > 0) {
      // Group by group letter
      const groups = standings.reduce((acc: any, standing: any) => {
        const group = standing.group;
        if (!acc[group]) acc[group] = [];
        acc[group].push(standing);
        return acc;
      }, {});
      
      console.log('Group Winners (Top team from each group):');
      Object.keys(groups).sort().forEach(group => {
        const winner = groups[group][0]; // Top team
        console.log(`  ${group}: ${winner.team.name} (${winner.points} pts, +${winner.goalsDiff} GD)`);
      });
      console.log();
    }

    // Test 5: Fetch Top Scorers
    console.log('📊 TEST 5: Fetch Top Scorers (2022)');
    console.log('-'.repeat(60));
    
    const topScorers = await footballApiService.getTopScorers('2022');
    console.log(`✅ Found ${topScorers.length} players\n`);
    
    if (topScorers.length > 0) {
      console.log('Top 10 Scorers:');
      topScorers.slice(0, 10).forEach((player: any, index: number) => {
        const name = player.player.name;
        const team = player.statistics[0].team.name;
        const goals = player.statistics[0].goals.total;
        console.log(`  ${index + 1}. ${name} (${team}) - ${goals} goals`);
      });
      console.log();
    }

    // Test 6: Check 2026 Access
    console.log('📊 TEST 6: Check 2026 Data Access');
    console.log('-'.repeat(60));
    
    try {
      const teams2026 = await footballApiService.getTeams('2026');
      if (teams2026.length > 0) {
        console.log(`✅ 2026 data accessible! Found ${teams2026.length} teams\n`);
      } else {
        console.log('⚠️  2026 data returned empty array\n');
      }
    } catch (error: any) {
      if (error.response?.data?.errors?.plan) {
        console.log('❌ 2026 data NOT accessible with free plan');
        console.log(`   Error: ${error.response.data.errors.plan}`);
        console.log('   Solution: Upgrade to paid plan or use 2022 data for testing\n');
      } else {
        console.log(`❌ Error checking 2026 access: ${error.message}\n`);
      }
    }

    // Final Status Check
    console.log('📊 FINAL STATUS CHECK');
    console.log('-'.repeat(60));
    const finalStatus = await footballApiService['client'].get('/status');
    const finalRequests = finalStatus.data.response.requests;
    console.log(`✅ API calls made in this test: ${finalRequests.current}`);
    console.log(`✅ Remaining today: ${finalRequests.limit_day - finalRequests.current}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    
    if (error.response?.data) {
      console.error('\nAPI Response:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

// Run the test
testApiFootball();
