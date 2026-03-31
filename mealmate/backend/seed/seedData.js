const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Mess = require('../models/Mess');
const Menu = require('../models/Menu');
const Feedback = require('../models/Feedback');
const Announcement = require('../models/Announcement');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealmate';

const seedData = async () => {
  try {
    console.log(`\n🌱 Starting seed process...`);
    console.log(`📍 Using MongoDB URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🔄 Clearing existing data...');
    const results = await Promise.all([
      User.deleteMany(),
      Mess.deleteMany(),
      Menu.deleteMany(),
      Feedback.deleteMany(),
      Announcement.deleteMany()
    ]);
    console.log('✅ Cleared existing data');

    // Create users (passwords will be hashed by User model pre-save hook)
    console.log('👥 Creating users...');
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@mealmate.com',
      password: 'admin123',  // Plain password - will be hashed by pre-save hook
      role: 'admin',
      isApproved: true,
      isVerified: true,
      isActive: true
    });
    console.log(`   ✅ Admin created: ${admin.email}`);

    const owner1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@mealmate.com',
      password: 'owner123',  // Plain password - will be hashed by pre-save hook
      role: 'owner',
      phone: '9876543210',
      isApproved: true,
      isVerified: true,
      isActive: true
    });
    console.log(`   ✅ Owner 1 created: ${owner1.email}`);

    const owner2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@mealmate.com',
      password: 'owner123',  // Plain password - will be hashed by pre-save hook
      role: 'owner',
      phone: '9876543211',
      isApproved: true,
      isVerified: true,
      isActive: true
    });
    console.log(`   ✅ Owner 2 created: ${owner2.email}`);

    const owner3 = await User.create({
      name: 'Anand Patel',
      email: 'anand@mealmate.com',
      password: 'owner123',  // Plain password - will be hashed by pre-save hook
      role: 'owner',
      phone: '9876543212',
      isApproved: false,
      isVerified: true,
      isActive: true
    });
    console.log(`   ✅ Owner 3 created: ${owner3.email}`);

    const students = await User.insertMany([
      { name: 'Arjun Singh', email: 'arjun@student.com', password: 'student123', role: 'student', college: 'MIT Pune', isApproved: true, isVerified: true, isActive: true },
      { name: 'Sneha Reddy', email: 'sneha@student.com', password: 'student123', role: 'student', college: 'COEP', isApproved: true, isVerified: true, isActive: true },
      { name: 'Vikram Nair', email: 'vikram@student.com', password: 'student123', role: 'student', college: 'MIT Pune', isApproved: true, isVerified: true, isActive: true },
      { name: 'Kavya Menon', email: 'kavya@student.com', password: 'student123', role: 'student', college: 'PICT', isApproved: true, isVerified: true, isActive: true },
    ]);
    console.log(`   ✅ 4 students created`);

    // Create Messes
    const mess1 = await Mess.create({
      owner: owner1._id,
      name: 'Annapurna Mess',
      description: 'Authentic home-cooked North Indian meals with fresh ingredients daily. Loved by students for 10+ years.',
      location: { address: 'FC Road, Near Garware College', city: 'Pune' },
      contact: { phone: '9876543210', email: 'annapurna@mess.com', whatsapp: '9876543210' },
      coverImage: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600',
      images: ['https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400'],
      cuisine: ['North Indian', 'Veg Only'],
      mealTypes: ['breakfast', 'lunch', 'dinner'],
      timing: {
        breakfast: { open: '07:00', close: '09:30' },
        lunch: { open: '12:00', close: '14:30' },
        dinner: { open: '19:00', close: '21:30' }
      },
      pricing: { breakfast: 60, lunch: 120, dinner: 100, monthly: 3500 },
      isVeg: true,
      isApproved: true,
      isActive: true,
      rating: { average: 4.3, count: 24 },
      subscriberCount: 45,
      amenities: ['RO Water', 'AC Dining Hall', 'WiFi', 'Parking'],
      tags: ['budget-friendly', 'home-style', 'north-indian']
    });

    const mess2 = await Mess.create({
      owner: owner2._id,
      name: 'South Spice Kitchen',
      description: 'Authentic South Indian cuisine with traditional recipes. Famous for our special thali and filter coffee.',
      location: { address: 'Kothrud, Near Paud Road', city: 'Pune' },
      contact: { phone: '9876543211', email: 'southspice@mess.com', whatsapp: '9876543211' },
      coverImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600',
      images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400'],
      cuisine: ['South Indian', 'Veg Only'],
      mealTypes: ['breakfast', 'lunch', 'dinner'],
      timing: {
        breakfast: { open: '06:30', close: '09:00' },
        lunch: { open: '12:00', close: '15:00' },
        dinner: { open: '19:30', close: '22:00' }
      },
      pricing: { breakfast: 70, lunch: 130, dinner: 110, monthly: 3800 },
      isVeg: true,
      isApproved: true,
      isActive: true,
      rating: { average: 4.6, count: 38 },
      subscriberCount: 62,
      amenities: ['RO Water', 'Clean Utensils', 'Takeaway Available'],
      tags: ['south-indian', 'thali', 'filter-coffee']
    });

    const mess3 = await Mess.create({
      owner: owner1._id,
      name: 'Campus Bites',
      description: 'Multi-cuisine mess with both veg and non-veg options. Special weekend biryani!',
      location: { address: 'Shivajinagar, Near University', city: 'Pune' },
      contact: { phone: '9876540000', email: 'campusbites@mess.com' },
      coverImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600',
      images: ['https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400'],
      cuisine: ['North Indian', 'Chinese', 'Non-Veg Available'],
      mealTypes: ['lunch', 'dinner'],
      timing: {
        lunch: { open: '12:00', close: '14:00' },
        dinner: { open: '20:00', close: '22:30' }
      },
      pricing: { lunch: 140, dinner: 150, monthly: 4200 },
      isVeg: false,
      isApproved: true,
      isActive: true,
      rating: { average: 4.1, count: 19 },
      subscriberCount: 33,
      amenities: ['Takeaway', 'Online Payment', 'Weekend Specials'],
      tags: ['non-veg', 'biryani', 'multi-cuisine']
    });
    console.log('✅ 3 messes created');

    // Create Menus for today and next 6 days
    console.log('📋 Creating menus...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const menuTemplates = {
      annapurna: {
        breakfast: [
          { items: ['Poha', 'Jalebi', 'Chai', 'Banana'], price: 60 },
          { items: ['Upma', 'Coconut Chutney', 'Filter Coffee'], price: 60 },
          { items: ['Aloo Paratha', 'Curd', 'Pickle', 'Butter Milk'], price: 70 },
          { items: ['Idli Sambar', 'Coconut Chutney', 'Chai'], price: 60 },
          { items: ['Methi Paratha', 'Lassi', 'Mixed Pickle'], price: 65 },
          { items: ['Bread Butter', 'Boiled Eggs (Veg Alt: Sprouts)', 'Chai'], price: 55 },
          { items: ['Puri Bhaji', 'Halwa', 'Chai'], price: 70 }
        ],
        lunch: [
          { items: ['Dal Tadka', 'Jeera Rice', 'Roti', 'Sabzi', 'Salad', 'Papad', 'Buttermilk'], price: 120 },
          { items: ['Rajma', 'Steamed Rice', 'Roti', 'Aloo Gobi', 'Raita', 'Papad'], price: 120 },
          { items: ['Chole', 'Bhature', 'Raita', 'Salad', 'Lassi'], price: 130 },
          { items: ['Dal Makhani', 'Jeera Rice', 'Roti', 'Mix Veg', 'Gulab Jamun'], price: 140 },
          { items: ['Sambar Rice', 'Rasam', 'Papad', 'Pickle', 'Curd'], price: 110 },
          { items: ['Paneer Butter Masala', 'Rice', 'Roti', 'Dal', 'Salad'], price: 150 },
          { items: ['Special Thali – Dal Fry', 'Rice', 'Roti x3', 'Sabzi', 'Sweet', 'Salad', 'Buttermilk'], price: 160 }
        ],
        dinner: [
          { items: ['Roti x3', 'Dal', 'Sabzi', 'Rice', 'Salad'], price: 100 },
          { items: ['Paratha x2', 'Dal Makhani', 'Raita'], price: 110 },
          { items: ['Khichdi', 'Kadhi', 'Papad', 'Ghee'], price: 100 },
          { items: ['Roti x3', 'Paneer Sabzi', 'Dal', 'Rice'], price: 120 },
          { items: ['Roti x3', 'Aloo Matar', 'Dal Tadka', 'Rice', 'Curd'], price: 100 },
          { items: ['Missi Roti x2', 'Dal Fry', 'Aloo Sabzi', 'Salad'], price: 110 },
          { items: ['Special Dal Bati Churma', 'Ghee', 'Salad'], price: 130 }
        ]
      },
      south: {
        breakfast: [
          { items: ['Masala Dosa', 'Sambar', 'Coconut Chutney', 'Filter Coffee'], price: 70 },
          { items: ['Idli x3', 'Vada x2', 'Sambar', 'Chutneys', 'Coffee'], price: 70 },
          { items: ['Pongal', 'Sambar', 'Coconut Chutney', 'Coffee'], price: 65 },
          { items: ['Rava Dosa', 'Onion Chutney', 'Sambar', 'Coffee'], price: 70 },
          { items: ['Uttapam', 'Tomato Chutney', 'Sambar', 'Coffee'], price: 70 },
          { items: ['Upma', 'Banana', 'Coffee'], price: 60 },
          { items: ['Special Paper Dosa', 'Sambar', '3 Chutneys', 'Coffee'], price: 80 }
        ],
        lunch: [
          { items: ['Full South Indian Thali – Rice', 'Sambar', 'Rasam', 'Dal', 'Poriyal', 'Papad', 'Curd', 'Pickle', 'Payasam'], price: 130 },
          { items: ['Bisi Bele Bath', 'Raita', 'Papad', 'Pickle'], price: 120 },
          { items: ['Curd Rice', 'Sambar Rice', 'Rasam', 'Papad'], price: 110 },
          { items: ['Pulao', 'Dal', 'Sabzi', 'Raita', 'Papad'], price: 130 },
          { items: ['Millet Rice', 'Sambar', 'Kootu', 'Rasam', 'Curd', 'Papad'], price: 120 },
          { items: ['Tamarind Rice', 'Coconut Rice', 'Chips', 'Curd', 'Mango Pickle'], price: 110 },
          { items: ['Grand Sunday Thali – 12 Items', 'Sweet'], price: 160 }
        ],
        dinner: [
          { items: ['Chapati x3', 'Dal', 'Sabzi', 'Rice'], price: 110 },
          { items: ['Parotta x2', 'Kurma', 'Onion Raita'], price: 120 },
          { items: ['Idiyappam x3', 'Egg Curry (Veg Alt: Kurma)', 'Coconut Milk'], price: 110 },
          { items: ['Chapati x3', 'Aloo Kurma', 'Dal', 'Curd'], price: 110 },
          { items: ['Ven Pongal', 'Gothsu', 'Papad'], price: 100 },
          { items: ['Appam x2', 'Stew', 'Banana'], price: 110 },
          { items: ['Kerala Parotta x2', 'Chicken Curry (Veg: Paneer)', 'Raita', 'Papad'], price: 130 }
        ]
      }
    };

    const menuDocs = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Annapurna Mess menus
      menuDocs.push(
        { mess: mess1._id, date, mealType: 'breakfast', items: menuTemplates.annapurna.breakfast[i].items.map(name => ({ name, isVeg: true })), price: menuTemplates.annapurna.breakfast[i].price, isPublished: true },
        { mess: mess1._id, date, mealType: 'lunch', items: menuTemplates.annapurna.lunch[i].items.map(name => ({ name, isVeg: true })), price: menuTemplates.annapurna.lunch[i].price, isPublished: true, isSpecial: i === 6 },
        { mess: mess1._id, date, mealType: 'dinner', items: menuTemplates.annapurna.dinner[i].items.map(name => ({ name, isVeg: true })), price: menuTemplates.annapurna.dinner[i].price, isPublished: true },
        // South Spice
        { mess: mess2._id, date, mealType: 'breakfast', items: menuTemplates.south.breakfast[i].items.map(name => ({ name, isVeg: true })), price: menuTemplates.south.breakfast[i].price, isPublished: true },
        { mess: mess2._id, date, mealType: 'lunch', items: menuTemplates.south.lunch[i].items.map(name => ({ name, isVeg: true })), price: menuTemplates.south.lunch[i].price, isPublished: true, isSpecial: i === 6 },
        { mess: mess2._id, date, mealType: 'dinner', items: menuTemplates.south.dinner[i].items.map(name => ({ name, isVeg: true })), price: menuTemplates.south.dinner[i].price, isPublished: true },
        // Campus Bites - lunch & dinner only
        { mess: mess3._id, date, mealType: 'lunch', items: [{ name: 'Chicken Biryani', isVeg: false }, { name: 'Veg Biryani', isVeg: true }, { name: 'Raita', isVeg: true }, { name: 'Salad', isVeg: true }], price: 140, isPublished: true },
        { mess: mess3._id, date, mealType: 'dinner', items: [{ name: 'Paneer Tikka Masala', isVeg: true }, { name: 'Butter Chicken', isVeg: false }, { name: 'Naan x2', isVeg: true }, { name: 'Rice', isVeg: true }, { name: 'Dal', isVeg: true }], price: 150, isPublished: true }
      );
    }

    await Menu.insertMany(menuDocs);
    console.log('✅ Menus created (7 days x 3 messes)');

    // Add subscriptions for students
    await User.findByIdAndUpdate(students[0]._id, { subscriptions: [mess1._id, mess2._id] });
    await User.findByIdAndUpdate(students[1]._id, { subscriptions: [mess2._id] });
    await User.findByIdAndUpdate(students[2]._id, { subscriptions: [mess1._id, mess3._id] });
    await User.findByIdAndUpdate(students[3]._id, { subscriptions: [mess2._id, mess3._id] });
    console.log('✅ Subscriptions created');

    // Add feedback
    const feedbackData = [
      { user: students[0]._id, mess: mess1._id, rating: 5, comment: 'Best dal tadka in Pune! Clean and hygienic.', mealType: 'lunch', tags: ['tasty', 'hygienic', 'value for money'] },
      { user: students[1]._id, mess: mess1._id, rating: 4, comment: 'Good food, slightly spicy sometimes. Overall great!', mealType: 'dinner', tags: ['tasty'] },
      { user: students[2]._id, mess: mess2._id, rating: 5, comment: 'The filter coffee and dosas are absolutely authentic. Reminds me of home!', mealType: 'breakfast', tags: ['tasty', 'authentic'] },
      { user: students[3]._id, mess: mess2._id, rating: 4, comment: 'South Indian thali is very filling and authentic. Love the variety.', mealType: 'lunch', tags: ['value for money', 'authentic'] },
      { user: students[0]._id, mess: mess3._id, rating: 4, comment: 'Weekend biryani is a must try! Non-veg options are great.', mealType: 'lunch', tags: ['tasty'] },
      { user: students[1]._id, mess: mess2._id, rating: 5, comment: 'Idli vada combo is perfect. Service is quick too.', mealType: 'breakfast', tags: ['hygienic', 'quick service'] },
    ];

    await Feedback.insertMany(feedbackData);
    console.log('✅ Feedback created');

    // Add announcements
    await Announcement.insertMany([
      {
        mess: mess1._id,
        owner: owner1._id,
        title: 'Special Diwali Menu This Week! 🪔',
        content: 'We are delighted to announce a special festive menu for Diwali. Enjoy sweets, special thali, and festive treats all week. Prices remain the same!',
        type: 'special',
        isActive: true
      },
      {
        mess: mess1._id,
        owner: owner1._id,
        title: 'Mess Closed on Sunday (Maintenance)',
        content: 'Due to kitchen maintenance, the mess will remain closed this Sunday. We apologize for the inconvenience.',
        type: 'maintenance',
        isActive: true
      },
      {
        mess: mess2._id,
        owner: owner2._id,
        title: 'New Millet Menu Added!',
        content: 'We have added healthy millet-based options to our lunch menu starting this week. Try our Ragi Mudde and Jowar Roti!',
        type: 'menu_change',
        isActive: true
      }
    ]);
    console.log('✅ Announcements created');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📊 CREATED DATA:');
    console.log('   • 1 Admin + 3 Owners + 4 Students = 8 users');
    console.log('   • 3 Messes');
    console.log('   • 7 days × 3 messes = 21 menus');
    console.log('   • 6 feedback reviews');
    console.log('   • 3 announcements');
    
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('┌' + '─'.repeat(48) + '┐');
    console.log('│ ADMIN LOGIN                                        │');
    console.log('│ Email: admin@mealmate.com                          │');
    console.log('│ Password: admin123                                 │');
    console.log('├' + '─'.repeat(48) + '┤');
    console.log('│ OWNER LOGIN                                        │');
    console.log('│ Email: rajesh@mealmate.com                         │');
    console.log('│ Password: owner123                                 │');
    console.log('├' + '─'.repeat(48) + '┤');
    console.log('│ STUDENT LOGIN                                      │');
    console.log('│ Email: arjun@student.com                           │');
    console.log('│ Password: student123                               │');
    console.log('└' + '─'.repeat(48) + '┘');
    
    console.log('\n✅ You can now login and test the application!');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000/api\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ SEED ERROR:', error.message);
    console.error('\nFull Error:', error);
    process.exit(1);
  }
};

seedData();
