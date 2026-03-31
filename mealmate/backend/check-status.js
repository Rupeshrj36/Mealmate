#!/usr/bin/env node

/**
 * Quick Status Check
 * Shows exactly what's wrong
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

(async () => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Database Status Check');
  console.log('='.repeat(60) + '\n');

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealmate';
    console.log(`Connecting to: ${MONGODB_URI}\n`);
    
    await mongoose.connect(MONGODB_URI, { 
      serverSelectionTimeoutMS: 3000 
    });
    console.log('✅ Connected to MongoDB\n');

    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    console.log(`👥 Users in database: ${userCount}\n`);
    
    if (userCount === 0) {
      console.log('❌ DATABASE IS EMPTY!');
      console.log('\nThis is why login/registration fails:');
      console.log('  • admin@mealmate.com does NOT exist');
      console.log('  • kalash@gmail.com does NOT exist');
      console.log('  • NO users exist at all\n');
      
      console.log('=' .repeat(60));
      console.log('✅ SOLUTION: Run the seed script');
      console.log('='.repeat(60) + '\n');
      
      console.log('Copy-paste these commands:\n');
      console.log('  npm run seed\n');
      
      console.log('Then wait for:\n');
      console.log('  🎉 SEED COMPLETED SUCCESSFULLY!\n');
      
      console.log('This will create:');
      console.log('  • 8 users (admin, owners, students)');
      console.log('  • 3 messes with menus');
      console.log('  • Test data for everything\n');
      
      console.log('After that, you can:');
      console.log('  1. Login as: admin@mealmate.com / admin123');
      console.log('  2. Register NEW users via the form');
      console.log('  3. Both will work!\n');
      
    } else {
      console.log('✅ Database has users!\n');
      
      const users = await User.find({}, { email: 1, name: 1, role: 1 });
      console.log('Users in database:');
      users.forEach(u => {
        console.log(`  • ${u.email} (${u.role})`);
      });
      console.log();
      
      // Try checking if kalash exists
      const kalash = await User.findOne({ email: 'kalash@gmail.com' });
      if (kalash) {
        console.log('✅ kalash@gmail.com EXISTS in database');
      } else {
        console.log('❌ kalash@gmail.com does NOT exist');
        console.log('   This user needs to be registered first\n');
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    console.log('❌ MongoDB Connection Failed\n');
    console.log(`Error: ${error.message}\n`);
    
    console.log('MongoDB is not running!');
    console.log('\nStart it with:\n');
    console.log('  docker run -d -p 27017:27017 --name mealmate-mongo mongo:7\n');
    
    process.exit(1);
  }
})();
