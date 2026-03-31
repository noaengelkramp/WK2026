import sequelize from '../config/database';
import User from '../models/User';

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection established.');
    
    const users = await User.findAll({
      attributes: ['id', 'eventId', 'username', 'email', 'role']
    });

    if (users.length === 0) {
      console.log('❌ No users found in database.');
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(u => {
        console.log(`- ${u.username} (${u.email}) [Event: ${u.eventId}] [Role: ${u.role}]`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
