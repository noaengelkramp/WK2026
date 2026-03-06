import sequelize from '../config/database';
import User from '../models/User';
import { Op } from 'sequelize';

async function testLoginLogic() {
  const testCases = [
    { identifier: 'admin@wk2026.com', password: 'password123' },
    { identifier: 'admin', password: 'password123' },
    { identifier: 'john.doe@wk2026.com', password: 'password123' },
    { identifier: 'johndoe', password: 'password123' }
  ];

  try {
    await sequelize.authenticate();
    console.log('✅ DB Connected.');

    for (const tc of testCases) {
      console.log(`\n🧪 Testing: ${tc.identifier}`);
      
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { email: tc.identifier },
            { username: tc.identifier }
          ]
        }
      });

      if (!user) {
        console.log(`❌ User NOT found for: ${tc.identifier}`);
        continue;
      }

      const isValid = await user.comparePassword(tc.password);
      if (isValid) {
        console.log(`✅ SUCCESS: Found ${user.username} (${user.email})`);
      } else {
        console.log(`❌ FAILED: Invalid password for ${user.username}`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

testLoginLogic();
