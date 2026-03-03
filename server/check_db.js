const { Client } = require('pg');

async function checkDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check customers
    const customers = await client.query('SELECT COUNT(*) as count FROM "Customers"');
    console.log(`👥 Customers: ${customers.rows[0].count}`);

    // Check teams
    const teams = await client.query('SELECT COUNT(*) as count FROM "Teams"');
    console.log(`⚽ Teams: ${teams.rows[0].count}`);

    // Check matches
    const matches = await client.query('SELECT COUNT(*) as count FROM "Matches"');
    console.log(`📅 Matches: ${matches.rows[0].count}`);

    // Check users
    const users = await client.query('SELECT COUNT(*) as count FROM "Users"');
    console.log(`👤 Users: ${users.rows[0].count}`);

    // Check match details
    if (matches.rows[0].count > 0) {
      console.log('\n📊 Match breakdown:');
      const stages = await client.query('SELECT stage, COUNT(*) as count FROM "Matches" GROUP BY stage ORDER BY stage');
      stages.rows.forEach(row => {
        console.log(`   ${row.stage}: ${row.count} matches`);
      });

      console.log('\n🏟️  Sample matches:');
      const sampleMatches = await client.query(`
        SELECT m."matchNumber", m.stage, m.venue, m.city, m."matchDate",
               ht.name as home_team, at.name as away_team
        FROM "Matches" m
        JOIN "Teams" ht ON m."homeTeamId" = ht.id
        JOIN "Teams" at ON m."awayTeamId" = at.id
        ORDER BY m."matchNumber"
        LIMIT 5
      `);
      sampleMatches.rows.forEach(row => {
        console.log(`   Match ${row.matchNumber}: ${row.home_team} vs ${row.away_team} at ${row.city}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
