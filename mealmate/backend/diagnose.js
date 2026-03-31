#!/usr/bin/env node

/**
 * MealMate Diagnostic Tool
 * Checks all components and shows exact errors
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

console.log('\n' + '='.repeat(60));
console.log('🔍 MealMate Diagnostic Tool');
console.log('='.repeat(60) + '\n');

let issues = [];
let warnings = [];

// ===== CHECK 1: .env File =====
console.log('1️⃣  Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  issues.push('❌ .env file not found at: ' + envPath);
  console.log(issues[issues.length - 1]);
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env file found');
  
  if (!envContent.includes('MONGODB_URI')) {
    issues.push('❌ MONGODB_URI not set in .env');
    console.log(issues[issues.length - 1]);
  } else {
    console.log('✅ MONGODB_URI configured');
  }
  
  if (!envContent.includes('JWT_SECRET')) {
    issues.push('❌ JWT_SECRET not set in .env');
    console.log(issues[issues.length - 1]);
  } else {
    console.log('✅ JWT_SECRET configured');
  }
}

console.log();

// ===== CHECK 2: Models =====
console.log('2️⃣  Checking models...');
try {
  require('./models/User');
  console.log('✅ User model found');
} catch (e) {
  issues.push('❌ User model error: ' + e.message);
  console.log(issues[issues.length - 1]);
}

try {
  require('./models/Mess');
  console.log('✅ Mess model found');
} catch (e) {
  issues.push('❌ Mess model error: ' + e.message);
  console.log(issues[issues.length - 1]);
}

console.log();

// ===== CHECK 3: Database Connection =====
console.log('3️⃣  Checking MongoDB connection...');

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealmate';

console.log(`   MongoDB URI: ${MONGODB_URI}`);

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected successfully\n');

    // ===== CHECK 4: Database Contents =====
    console.log('4️⃣  Checking database contents...');
    
    const User = require('./models/User');
    const Mess = require('./models/Mess');
    const Menu = require('./models/Menu');
    
    const userCount = await User.countDocuments();
    const messCount = await Mess.countDocuments();
    const menuCount = await Menu.countDocuments();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Messes: ${messCount}`);
    console.log(`   Menus: ${menuCount}`);
    
    if (userCount === 0) {
      issues.push('❌ DATABASE IS EMPTY - No users found!');
      console.log('\n' + issues[issues.length - 1]);
      console.log('   → Run: npm run seed\n');
    } else {
      console.log(`\n✅ Database has data (${userCount} users)\n`);
      
      // Show users
      console.log('5️⃣  Users in database:');
      const users = await User.find({}, {name: 1, email: 1, role: 1, password: 1});
      users.forEach((user, i) => {
        const hasPassword = user.password && user.password.startsWith('$2a$');
        const passStatus = hasPassword ? '✅' : '❌';
        console.log(`   ${i+1}. ${passStatus} ${user.email} (${user.role}) - ${user.name}`);
      });
      console.log();
    }
    
    // ===== CHECK 5: Test Login =====
    console.log('6️⃣  Testing password matching...');
    const testUser = await User.findOne({ email: 'admin@mealmate.com' }).select('+password');
    
    if (!testUser) {
      console.log('   ⚠️  Admin user not found - database needs seeding\n');
    } else {
      try {
        const passwordMatch = await testUser.comparePassword('admin123');
        if (passwordMatch) {
          console.log('✅ Password matching works correctly\n');
        } else {
          issues.push('❌ Password does not match for admin@mealmate.com');
          console.log(issues[issues.length - 1]);
          console.log('   → Password hash might be corrupted\n');
        }
      } catch (e) {
        issues.push('❌ Password comparison error: ' + e.message);
        console.log(issues[issues.length - 1] + '\n');
      }
    }
    
    // ===== SUMMARY =====
    console.log('='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    
    if (issues.length === 0) {
      console.log('✅ All checks passed! Everything looks good.\n');
      console.log('Next steps:');
      console.log('  1. Start backend: npm run dev');
      console.log('  2. Start frontend: npm start');
      console.log('  3. Login with: admin@mealmate.com / admin123\n');
    } else {
      console.log(`❌ Found ${issues.length} issue(s):\n`);
      issues.forEach((issue, i) => {
        console.log(`${i+1}. ${issue}`);
      });
      console.log('\n' + '='.repeat(60));
      console.log('⚠️  RECOMMENDED ACTIONS');
      console.log('='.repeat(60) + '\n');
      
      if (userCount === 0) {
        console.log('DATABASE IS EMPTY! Run this:');
        console.log('\n  cd backend');
        console.log('  npm run seed\n');
      }
    }
    
    await mongoose.disconnect();
    process.exit(issues.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.log(`❌ MongoDB connection failed: ${error.message}\n`);
    
    console.log('='.repeat(60));
    console.log('⚠️  MONGODB IS NOT RUNNING');
    console.log('='.repeat(60) + '\n');
    
    console.log('Start MongoDB with one of these commands:\n');
    console.log('Option 1 - Docker (Recommended):');
    console.log('  docker run -d -p 27017:27017 --name mealmate-mongo mongo:7\n');
    
    console.log('Option 2 - Local MongoDB (if installed):');
    console.log('  mongod\n');
    
    console.log('Then verify connection:');
    console.log('  mongosh mongodb://localhost:27017\n');
    
    process.exit(1);
  }
})();
