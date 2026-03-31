#!/usr/bin/env node

/**
 * Manually Create Admin User
 * Use this if seed script didn't create admin properly
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

(async () => {
  try {
    console.log('\n🔧 Creating Admin User Manually...\n');
    
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealmate';
    console.log(`Connecting to: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = require('./models/User');

    // Check if admin exists
    console.log('Checking for existing admin...');
    const existingAdmin = await User.findOne({ email: 'admin@mealmate.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}\n`);
      
      console.log('Trying to login with password: admin123...');
      const passwordMatch = await existingAdmin.comparePassword('admin123');
      
      if (passwordMatch) {
        console.log('✅ Password is correct!\n');
        console.log('You can login with:');
        console.log('  Email: admin@mealmate.com');
        console.log('  Password: admin123\n');
      } else {
        console.log('❌ Password does not match!\n');
        console.log('Updating admin password to: admin123\n');
        
        const updated = await User.findByIdAndUpdate(
          existingAdmin._id,
          { password: 'admin123' },
          { new: true }
        );
        
        console.log('✅ Admin password updated!\n');
        console.log('You can now login with:');
        console.log('  Email: admin@mealmate.com');
        console.log('  Password: admin123\n');
      }
    } else {
      console.log('✅ Admin does not exist, creating new admin user...\n');
      
      const admin = await User.create({
        name: 'Super Admin',
        email: 'admin@mealmate.com',
        password: 'admin123',
        role: 'admin',
        isApproved: true,
        isVerified: true,
        isActive: true
      });

      console.log('✅ Admin user created successfully!\n');
      console.log('Admin Details:');
      console.log(`  • ID: ${admin._id}`);
      console.log(`  • Name: ${admin.name}`);
      console.log(`  • Email: ${admin.email}`);
      console.log(`  • Role: ${admin.role}\n`);
      
      console.log('You can now login with:');
      console.log('  Email: admin@mealmate.com');
      console.log('  Password: admin123\n');
    }

    // List all users
    console.log('='  .repeat(50));
    console.log('All Users in Database:');
    console.log('='.repeat(50) + '\n');
    
    const allUsers = await User.find({}, { name: 1, email: 1, role: 1 });
    allUsers.forEach((user, i) => {
      console.log(`${i+1}. ${user.email} (${user.role}) - ${user.name}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Admin account is ready!\n');
    console.log('Next steps:');
    console.log('  1. Make sure backend is running: npm run dev');
    console.log('  2. Open browser: http://localhost:3000');
    console.log('  3. Login with: admin@mealmate.com / admin123\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
})();
