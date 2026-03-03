const { Client } = require('pg');

async function checkGroupMatches() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check overall match status breakdown
    console.log('📊 Match Status Breakdown:');
    const statusBreakdown = await client.query(`
      SELECT status, COUNT(*) as count 
      FROM "Matches" 
      GROUP BY status 
      ORDER BY status
    `);
    statusBreakdown.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count} matches`);
    });

    // Check group stage matches specifically
    console.log('\n🏆 Group Stage Matches:');
    const groupMatches = await client.query(`
      SELECT 
        stage,
        "groupLetter",
        COUNT(*) as total,
        SUM(CASE WHEN status = 'finished' THEN 1 ELSE 0 END) as finished,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled
      FROM "Matches"
      WHERE stage = 'group'
      GROUP BY stage, "groupLetter"
      ORDER BY "groupLetter"
    `);
    groupMatches.rows.forEach(row => {
      console.log(`   Group ${row.groupLetter}: ${row.total} total (${row.finished} finished, ${row.scheduled} scheduled)`);
    });

    // Show sample finished group matches with scores
    console.log('\n⚽ Sample Finished Group Matches:');
    const finishedSample = await client.query(`
      SELECT 
        m."matchNumber",
        m."groupLetter",
        m.status,
        m."homeScore",
        m."awayScore",
        ht.name as home_team,
        at.name as away_team
      FROM "Matches" m
      LEFT JOIN "Teams" ht ON m."homeTeamId" = ht.id
      LEFT JOIN "Teams" at ON m."awayTeamId" = at.id
      WHERE m.stage = 'group' AND m.status = 'finished'
      ORDER BY m."matchNumber"
      LIMIT 10
    `);
    
    if (finishedSample.rows.length === 0) {
      console.log('   ⚠️ No finished group matches found!');
    } else {
      finishedSample.rows.forEach(row => {
        console.log(`   Match ${row.matchNumber} (Group ${row.groupLetter}): ${row.home_team} ${row.homeScore} - ${row.awayScore} ${row.away_team} [${row.status}]`);
      });
    }

    // Check for TBD teams
    console.log('\n❓ Matches with TBD Teams:');
    const tbdMatches = await client.query(`
      SELECT COUNT(*) as count
      FROM "Matches"
      WHERE "homeTeamId" IS NULL OR "awayTeamId" IS NULL
    `);
    console.log(`   ${tbdMatches.rows[0].count} matches have TBD teams`);

    // Check group A specifically (first 6 matches)
    console.log('\n🔍 Group A Detailed:');
    const groupA = await client.query(`
      SELECT 
        m."matchNumber",
        m.status,
        m."homeScore",
        m."awayScore",
        m."matchDate",
        ht.name as home_team,
        at.name as away_team
      FROM "Matches" m
      LEFT JOIN "Teams" ht ON m."homeTeamId" = ht.id
      LEFT JOIN "Teams" at ON m."awayTeamId" = at.id
      WHERE m."groupLetter" = 'A'
      ORDER BY m."matchNumber"
    `);
    groupA.rows.forEach(row => {
      const homeTeam = row.home_team || 'TBD';
      const awayTeam = row.away_team || 'TBD';
      const score = row.status === 'finished' ? `${row.homeScore}-${row.awayScore}` : 'vs';
      console.log(`   Match ${row.matchNumber}: ${homeTeam} ${score} ${awayTeam} [${row.status}] - ${row.matchDate}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

checkGroupMatches();
