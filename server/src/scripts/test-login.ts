import axios from 'axios';

async function testLogin() {
  const url = 'http://localhost:3001/api/auth/login';
  
  const testCases = [
    {
      name: 'Login with email (admin)',
      data: { identifier: 'admin@wk2026.com', password: 'password123' }
    },
    {
      name: 'Login with username (admin)',
      data: { identifier: 'admin', password: 'password123' }
    },
    {
      name: 'Login with email (johndoe)',
      data: { identifier: 'john.doe@wk2026.com', password: 'password123' }
    },
    {
      name: 'Login with username (johndoe)',
      data: { identifier: 'johndoe', password: 'password123' }
    }
  ];

  console.log('🧪 Testing Login Endpoint...');

  for (const tc of testCases) {
    try {
      const response = await axios.post(url, tc.data);
      console.log(`✅ ${tc.name}: SUCCESS (User: ${response.data.user.username})`);
    } catch (error: any) {
      console.log(`❌ ${tc.name}: FAILED (${error.response?.data?.message || error.message})`);
    }
  }
}

testLogin();
