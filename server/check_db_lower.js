const { Client } = require('pg');

async function checkDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check customers
    const customers = await client.query('SELECT COUNT(*) as count FROM customers');
    console.log(`👥 Customers: ${customers.rows[0].count}`);

    // Check teams
    const teams = await client.query('SELECT COUNT(*) as count FROM teams');
    console.log(`⚽ Teams: ${teams.rows[0].count}`);

    // Check matches
    const matches = await client.query('SELECT COUNT(*) as count FROM matches');
    console.log(`📅 Matches: ${matches.rows[0].count}`);

    // Check users
    const users = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`👤 Users: ${users.rows[0].count}`);

    // Check match details
    if (parseInt(matches.rows[0].count) > 0) {
      console.log('\n📊 Match breakdown:');
      const stages = await client.query('SELECT stage, COUNT(*) as count FROM matches GROUP BY stage ORDER BY stage');
      stages.rows.forEach(row => {
        console.log(`   ${row.stage}: ${row.count} matches`);
      });

      console.log('\n🏟️  Sample matches:');
      const sampleMatches = await client.query(`
        SELECT m.match_number, m.stage, m.venue, m.city, m.match_date,
               ht.name as home_team, at.name as away_team
        FROM matches m
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
        ORDER BY m.match_number
        LIMIT 5
      `);
      sampleMatches.rows.forEach(row => {
        console.log(`   Match ${row.match_number}: ${row.home_team} vs ${row.away_team} at ${row.city}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkDatabase();
