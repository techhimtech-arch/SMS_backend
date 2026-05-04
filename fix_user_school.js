const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function fixUserSchool() {
  try {
    await mongoose.connect('mongodb+srv://techhimtech_db_user:7kWRGlcUpVDFE6uE@cluster0.9uenbsu.mongodb.net/?appName=Cluster0&tls=true');
    
    console.log('=== Fixing User SchoolId ===');
    
    // Find or create a user with the correct schoolId
    const targetSchoolId = '699d8617f70f792501a8401b'; // School that has students
    
    let user = await User.findOne({ email: 'admin@school.com' });
    
    if (!user) {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      user = new User({
        name: 'Admin User',
        email: 'admin@school.com',
        password: hashedPassword,
        role: 'school_admin',
        schoolId: targetSchoolId,
        isActive: true
      });
      await user.save();
      console.log('✅ Created new admin user: admin@school.com');
    } else {
      // Update existing user's schoolId
      user.schoolId = targetSchoolId;
      await user.save();
      console.log('✅ Updated existing user schoolId');
    }
    
    console.log('\n=== User Details ===');
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`SchoolId: ${user.schoolId}`);
    console.log(`Active: ${user.isActive}`);
    
    console.log('\n=== Login Credentials ===');
    console.log('Email: admin@school.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

fixUserSchool();
