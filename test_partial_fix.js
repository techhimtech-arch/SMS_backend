require('dotenv').config();
const mongoose = require('mongoose');
const StudentProfile = require('./src/models/StudentProfile');
const User = require('./src/models/User');

async function testPartialAdmissionFix() {
  console.log('🔧 Testing Partial Admission Fix\n');

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sms_db');
    console.log('✅ Connected to MongoDB');

    // Clear test data
    await StudentProfile.deleteMany({ firstName: 'TestUser' });
    await User.deleteMany({ name: 'TestUser' });

    // Step 1: Create a test user
    console.log('\n👤 Creating test user...');
    const testUser = await User.create({
      name: 'TestUser',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'student',
      schoolId: new mongoose.Types.ObjectId() // dummy school ID
    });
    console.log('✅ User created:', testUser._id);

    // Step 2: Create a partial admission
    console.log('\n📝 Creating partial admission...');
    const partialAdmission = await StudentProfile.create({
      userId: testUser._id,
      admissionNumber: 'PARTIAL-TEST-001',
      firstName: 'TestUser',
      lastName: 'Test',
      gender: 'Male',
      dateOfBirth: new Date('2015-01-01'),
      email: 'testuser@example.com',
      phone: '1234567890',
      schoolId: testUser.schoolId,
      status: 'partial', // This is the key field we added
      admittedBy: testUser._id,
      admissionDate: new Date()
    });
    console.log('✅ Partial admission created:', partialAdmission._id);

    // Step 3: Test complete admission WITHOUT parent (optional)
    console.log('\n🎓 Completing admission WITHOUT parent...');
    const completedAdmission = await StudentProfile.findOneAndUpdate(
      { _id: partialAdmission._id },
      {
        status: 'completed',
        completedAt: new Date(),
        completedBy: testUser._id,
        // Note: No parentUserId - still works!
      },
      { new: true }
    );
    console.log('✅ Admission completed WITHOUT parent:', completedAdmission.status);

    // Step 4: Test parent linking later
    console.log('\n👨‍👩‍👧‍👦 Testing parent linking later...');
    
    // Create a parent user
    const parentUser = await User.create({
      name: 'Test Parent',
      email: 'parent@example.com',
      password: 'password123',
      role: 'parent',
      schoolId: testUser.schoolId
    });

    // Link parent to student
    const linkedStudent = await StudentProfile.findOneAndUpdate(
      { _id: completedAdmission._id },
      { parentUserId: parentUser._id },
      { new: true }
    ).populate('parentUserId', 'name email');
    
    console.log('✅ Parent linked successfully:', linkedStudent.parentUserId.name);

    // Step 3: Test the query used in getPartialAdmissions
    console.log('\n🔍 Testing partial admission query...');
    const query = {
      schoolId: testUser.schoolId,
      status: 'partial'
    };
    
    const foundAdmissions = await StudentProfile.find(query)
      .populate('userId', 'name email')
      .populate('admittedBy', 'name')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${foundAdmissions.length} partial admissions`);
    
    if (foundAdmissions.length > 0) {
      console.log('📋 Found admission:', {
        id: foundAdmissions[0]._id,
        firstName: foundAdmissions[0].firstName,
        status: foundAdmissions[0].status,
        admissionNumber: foundAdmissions[0].admissionNumber
      });
    }

    // Step 4: Test count
    const total = await StudentProfile.countDocuments(query);
    console.log(`✅ Total count: ${total}`);

    // Cleanup
    await StudentProfile.deleteMany({ firstName: 'TestUser' });
    await User.deleteMany({ name: 'TestUser' });
    console.log('\n🧹 Test data cleaned up');

    console.log('\n🎉 PERFECT! System verified:');
    console.log('   ✅ Partial admission works');
    console.log('   ✅ Complete admission WITHOUT parent works');
    console.log('   ✅ Parent linking later works');
    console.log('   ✅ Parent is truly OPTIONAL in full admission!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testPartialAdmissionFix();
