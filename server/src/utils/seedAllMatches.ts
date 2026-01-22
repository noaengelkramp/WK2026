import { Team, Match } from '../models';

/**
 * Seed all 104 World Cup 2026 matches
 * This includes:
 * - Group stage: 72 matches (12 groups × 6 matches each)
 * - Round of 32: 16 matches (32 teams)
 * - Round of 16: 8 matches (16 teams)
 * - Quarter-finals: 4 matches (8 teams)
 * - Semi-finals: 2 matches (4 teams)
 * - Third place: 1 match
 * - Final: 1 match
 * Total: 104 matches
 */
export async function seedAllMatches() {
  try {
    console.log('⚽ Seeding all 104 World Cup 2026 matches...');

    // Get all teams from database
    const teams = await Team.findAll({ order: [['groupLetter', 'ASC'], ['name', 'ASC']] });
    
    if (teams.length < 48) {
      throw new Error(`Need 48 teams, but only found ${teams.length}`);
    }

    // Organize teams by group
    const teamsByGroup: Record<string, any[]> = {};
    teams.forEach(team => {
      if (!teamsByGroup[team.groupLetter]) {
        teamsByGroup[team.groupLetter] = [];
      }
      teamsByGroup[team.groupLetter].push(team);
    });

    // Clear existing matches
    await Match.destroy({ where: {} });

    const matchesData = [];
    let matchNumber = 1;

    // ========================================
    // GROUP STAGE MATCHES (48 matches total)
    // Each group has 4 teams, playing round-robin (6 matches per group)
    // ========================================

    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const groupStartDate = new Date('2026-06-11T00:00:00Z');
    
    // Define venues for variety
    const venues = [
      { name: 'Estadio Azteca', city: 'Mexico City' },
      { name: 'Arrowhead Stadium', city: 'Kansas City' },
      { name: 'AT&T Stadium', city: 'Dallas' },
      { name: 'MetLife Stadium', city: 'New York' },
      { name: 'SoFi Stadium', city: 'Los Angeles' },
      { name: 'Mercedes-Benz Stadium', city: 'Atlanta' },
      { name: 'Gillette Stadium', city: 'Boston' },
      { name: 'Lincoln Financial Field', city: 'Philadelphia' },
      { name: 'Hard Rock Stadium', city: 'Miami' },
      { name: 'NRG Stadium', city: 'Houston' },
      { name: 'BMO Field', city: 'Toronto' },
      { name: 'BC Place', city: 'Vancouver' },
    ];

    // Generate group stage matches
    for (const group of groups) {
      const groupTeams = teamsByGroup[group];
      if (!groupTeams || groupTeams.length !== 4) {
        console.warn(`Group ${group} doesn't have 4 teams, skipping`);
        continue;
      }

      // Round-robin: each team plays each other once
      // Matchday 1
      matchesData.push({
        matchNumber: matchNumber++,
        stage: 'group' as const,
        homeTeamId: groupTeams[0].id,
        awayTeamId: groupTeams[1].id,
        venue: venues[(matchNumber % venues.length)].name,
        city: venues[(matchNumber % venues.length)].city,
        matchDate: new Date(groupStartDate.getTime() + (groups.indexOf(group) * 6 + 0) * 24 * 60 * 60 * 1000),
        status: 'scheduled' as const,
        groupLetter: group,
      });
      matchesData.push({
        matchNumber: matchNumber++,
        stage: 'group' as const,
        homeTeamId: groupTeams[2].id,
        awayTeamId: groupTeams[3].id,
        venue: venues[(matchNumber % venues.length)].name,
        city: venues[(matchNumber % venues.length)].city,
        matchDate: new Date(groupStartDate.getTime() + (groups.indexOf(group) * 6 + 0) * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        status: 'scheduled' as const,
        groupLetter: group,
      });

      // Matchday 2
      matchesData.push({
        matchNumber: matchNumber++,
        stage: 'group' as const,
        homeTeamId: groupTeams[0].id,
        awayTeamId: groupTeams[2].id,
        venue: venues[(matchNumber % venues.length)].name,
        city: venues[(matchNumber % venues.length)].city,
        matchDate: new Date(groupStartDate.getTime() + (groups.indexOf(group) * 6 + 4) * 24 * 60 * 60 * 1000),
        status: 'scheduled' as const,
        groupLetter: group,
      });
      matchesData.push({
        matchNumber: matchNumber++,
        stage: 'group' as const,
        homeTeamId: groupTeams[1].id,
        awayTeamId: groupTeams[3].id,
        venue: venues[(matchNumber % venues.length)].name,
        city: venues[(matchNumber % venues.length)].city,
        matchDate: new Date(groupStartDate.getTime() + (groups.indexOf(group) * 6 + 4) * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        status: 'scheduled' as const,
        groupLetter: group,
      });

      // Matchday 3 (final round - simultaneous kickoffs)
      matchesData.push({
        matchNumber: matchNumber++,
        stage: 'group' as const,
        homeTeamId: groupTeams[0].id,
        awayTeamId: groupTeams[3].id,
        venue: venues[(matchNumber % venues.length)].name,
        city: venues[(matchNumber % venues.length)].city,
        matchDate: new Date(groupStartDate.getTime() + (groups.indexOf(group) * 6 + 8) * 24 * 60 * 60 * 1000),
        status: 'scheduled' as const,
        groupLetter: group,
      });
      matchesData.push({
        matchNumber: matchNumber++,
        stage: 'group' as const,
        homeTeamId: groupTeams[1].id,
        awayTeamId: groupTeams[2].id,
        venue: venues[(matchNumber % venues.length)].name,
        city: venues[(matchNumber % venues.length)].city,
        matchDate: new Date(groupStartDate.getTime() + (groups.indexOf(group) * 6 + 8) * 24 * 60 * 60 * 1000),
        status: 'scheduled' as const,
        groupLetter: group,
      });
    }

    console.log(`Generated ${matchesData.length} group stage matches`);

    // ========================================
    // KNOCKOUT STAGE MATCHES (56 matches)
    // ========================================

    const knockoutStartDate = new Date('2026-06-30T00:00:00Z');

    // Round of 32 (16 matches - 32 teams) - June 30 - July 3
    for (let i = 0; i < 16; i++) {
      matchesData.push({
        matchNumber: matchNumber++,
        stage: 'round32' as const,
        // homeTeamId: undefined (omitted - TBD), // TBD based on group results
        // awayTeamId: undefined (omitted - TBD),
        venue: venues[i % venues.length].name,
        city: venues[i % venues.length].city,
        matchDate: new Date(knockoutStartDate.getTime() + Math.floor(i / 4) * 24 * 60 * 60 * 1000 + (i % 4) * 3 * 60 * 60 * 1000),
        status: 'scheduled' as const,
      });
    }

    // Round of 16 (8 matches - 16 teams) - July 5-7
    const round16Date = new Date('2026-07-05T00:00:00Z');
    for (let i = 0; i < 8; i++) {
      matchesData.push({
        matchNumber: matchNumber++,
        stage: 'round16' as const,
        // homeTeamId: undefined (omitted - TBD),
        // awayTeamId: undefined (omitted - TBD),
        venue: venues[i % venues.length].name,
        city: venues[i % venues.length].city,
        matchDate: new Date(round16Date.getTime() + Math.floor(i / 4) * 24 * 60 * 60 * 1000 + (i % 4) * 3 * 60 * 60 * 1000),
        status: 'scheduled' as const,
      });
    }

    // Quarter-finals (4 matches - 8 teams) - July 9-10
    const quarterDate = new Date('2026-07-09T00:00:00Z');
    for (let i = 0; i < 4; i++) {
      matchesData.push({
        matchNumber: matchNumber++,
        stage: 'quarter' as const,
        // homeTeamId: undefined (omitted - TBD),
        // awayTeamId: undefined (omitted - TBD),
        venue: venues[i % 4].name,
        city: venues[i % 4].city,
        matchDate: new Date(quarterDate.getTime() + Math.floor(i / 2) * 24 * 60 * 60 * 1000 + (i % 2) * 4 * 60 * 60 * 1000),
        status: 'scheduled' as const,
      });
    }

    // Semi-finals (2 matches - 4 teams) - July 13-14
    const semiDate = new Date('2026-07-13T00:00:00Z');
    for (let i = 0; i < 2; i++) {
      matchesData.push({
        matchNumber: matchNumber++,
        stage: 'semi' as const,
        // homeTeamId: undefined (omitted - TBD),
        // awayTeamId: undefined (omitted - TBD),
        venue: i === 0 ? 'MetLife Stadium' : 'SoFi Stadium',
        city: i === 0 ? 'New York' : 'Los Angeles',
        matchDate: new Date(semiDate.getTime() + i * 24 * 60 * 60 * 1000),
        status: 'scheduled' as const,
      });
    }

    // Third Place Playoff (1 match) - July 18
    matchesData.push({
      matchNumber: matchNumber++,
      stage: 'third_place' as const,
      // homeTeamId: undefined (omitted - TBD),
      // awayTeamId: undefined (omitted - TBD),
      venue: 'Hard Rock Stadium',
      city: 'Miami',
      matchDate: new Date('2026-07-18T20:00:00Z'),
      status: 'scheduled' as const,
    });

    // Final (1 match) - July 19
    matchesData.push({
      matchNumber: matchNumber++,
      stage: 'final' as const,
      // homeTeamId: undefined (omitted - TBD),
      // awayTeamId: undefined (omitted - TBD),
      venue: 'MetLife Stadium',
      city: 'New York',
      matchDate: new Date('2026-07-19T19:00:00Z'),
      status: 'scheduled' as const,
    });

    console.log(`Generated ${matchesData.length} total matches (group + knockout)`);

    // Insert all matches
    const matches = await Match.bulkCreate(matchesData);
    console.log(`✅ Successfully seeded ${matches.length} matches`);

    // Summary
    const groupMatches = matches.filter(m => m.stage === 'group').length;
    const knockoutMatches = matches.filter(m => m.stage !== 'group').length;
    console.log(`   📊 Group stage: ${groupMatches} matches`);
    console.log(`   📊 Knockout: ${knockoutMatches} matches`);
    console.log(`   📊 Total: ${matches.length} matches`);

    return matches;
  } catch (error) {
    console.error('❌ Error seeding matches:', error);
    throw error;
  }
}
