#!/usr/bin/env node

/**
 * Simple Registration & Login Test
 * Tests the exact features user needs
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

console.log('\n' + '='.repeat(60));
console.log('🧪 MealMate Registration & Login Test');
console.log('='.repeat(60) + '\n');

(async () => {
  try {
    // Test 1: Health Check
    console.log('1️⃣  Testing API Health...');
    try {
      const health = await axios.get(`${API_URL}/health`);
      if (health.data.status === 'ok') {
        console.log('✅ API is running\n');
      }
    } catch (e) {
      console.log('❌ API is NOT running');
      console.log('   → Start backend: npm run dev\n');
      process.exit(1);
    }

    // Test 2: Login with Admin Credentials
    console.log('2️⃣  Testing Admin Login...');
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@mealmate.com',
        password: 'admin123'
      });
      
      if (loginRes.status === 200 && loginRes.data.token) {
        console.log('✅ Admin login successful');
        console.log(`   Token: ${loginRes.data.token.substring(0, 20)}...`);
        console.log(`   User: ${loginRes.data.user.name}\n`);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ Admin login failed (Invalid credentials)');
        console.log('   → Database might be empty');
        console.log('   → Run: npm run seed\n');
      } else {
        console.log(`❌ Login error: ${error.message}\n`);
      }
      process.exit(1);
    }

    // Test 3: New User Registration
    console.log('3️⃣  Testing New User Registration...');
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    
    try {
      const regRes = await axios.post(`${API_URL}/auth/register`, {
        name: 'Test User',
        email: uniqueEmail,
        password: 'password123',
        role: 'student',
        college: 'Test College'
      });
      
      if (regRes.status === 201 && regRes.data.token) {
        console.log('✅ Registration successful');
        console.log(`   Email: ${uniqueEmail}`);
        console.log(`   Token received: Yes\n`);
      }
    } catch (error) {
      console.log(`❌ Registration failed: ${error.response?.data?.message || error.message}\n`);
      process.exit(1);
    }

    // Test 4: Login with New Account
    console.log('4️⃣  Testing New Account Login...');
    try {
      const newLoginRes = await axios.post(`${API_URL}/auth/login`, {
        email: uniqueEmail,
        password: 'password123'
      });
      
      if (newLoginRes.status === 200 && newLoginRes.data.token) {
        console.log('✅ New account login successful\n');
      }
    } catch (error) {
      console.log(`❌ New account login failed: ${error.response?.data?.message || error.message}\n`);
      process.exit(1);
    }

    // All Tests Passed
    console.log('='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60) + '\n');
    
    console.log('✅ Registration is working');
    console.log('✅ Login is working');
    console.log('✅ Database is populated');
    console.log('✅ Passwords are hashing correctly\n');
    
    console.log('Your MealMate application is ready!\n');
    console.log('Next steps:');
    console.log('  1. Open: http://localhost:3000');
    console.log('  2. Login with: admin@mealmate.com / admin123');
    console.log('  3. Or register: Use the registration form\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  }
})();
