#!/usr/bin/env node

/**
 * Verify MongoDB Connection and Seed Status
 * Run this to check if database is set up correctly
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealmate';

const verify = async () => {
  try {
    console.log('\n🔍 Verifying MealMate Database Setup...\n');
    console.log(`📍 MongoDB URI: ${MONGODB_URI}`);
    
    // Connect to MongoDB
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check database
    const db = mongoose.connection.db;
    const mongoClient = mongoose.connection.getClient();
    
    // Get db info
    console.log('📊 Database Information:');
    const collections = await db.listCollections().toArray();
    console.log(`   • Database: ${db.getName()}`);
    console.log(`   • Collections: ${collections.map(c => c.name).join(', ')}`);
    console.log();

    // Check each collection
    console.log('📋 Collection Contents:');
    
    const User = require('./models/User');
    const Mess = require('./models/Mess');
    const Menu = require('./models/Menu');
    const Feedback = require('./models/Feedback');
    const Announcement = require('./models/Announcement');

    const userCount = await User.countDocuments();
    const messCount = await Mess.countDocuments();
    const menuCount = await Menu.countDocuments();
    const feedbackCount = await Feedback.countDocuments();
    const announcementCount = await Announcement.countDocuments();

    console.log(`   • Users: ${userCount}`);
    console.log(`   • Messes: ${messCount}`);
    console.log(`   • Menus: ${menuCount}`);
    console.log(`   • Feedback: ${feedbackCount}`);
    console.log(`   • Announcements: ${announcementCount}`);
    console.log();

    if (userCount === 0) {
      console.log('⚠️  DATABASE IS EMPTY!');
      console.log('   Please run: npm run seed\n');
      return;
    }

    // List users
    console.log('👥 Users in Database:');
    const users = await User.find({}, { name: 1, email: 1, role: 1, isActive: 1 });
    users.forEach((user, i) => {
      const status = user.isActive ? '✅' : '❌';
      console.log(`   ${i+1}. ${status} ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log();

    console.log('🎉 Database is properly set up!\n');
    console.log('✅ You can now:');
    console.log('   1. Start backend: npm run dev');
    console.log('   2. Start frontend: npm start');
    console.log('   3. Login with: admin@mealmate.com / admin123\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('  1. Check MongoDB is running: mongodb://localhost:27017');
    console.error('  2. Check .env file exists in backend folder');
    console.error('  3. Run seed script: npm run seed');
    console.error('  4. Check MongoDB connection: mongosh mongodb://localhost:27017\n');
    process.exit(1);
  }
};

verify();
