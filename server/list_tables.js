const { Client } = require('pg');

async function listTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // List all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables in database:');
    if (tables.rows.length === 0) {
      console.log('   ⚠️  No tables found!');
    } else {
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    console.log(`\n   Total: ${tables.rows.length} tables`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

listTables();
