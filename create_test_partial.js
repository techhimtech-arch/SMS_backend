/**
 * Create Test Partial Admission
 */

require('dotenv').config();
const mongoose = require('mongoose');
const admissionService = require('./src/services/admissionService');

async function createTestPartialAdmission() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sms', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Create test partial admission
    const admissionData = {
      firstName: 'Test',
      lastName: 'Student',
      gender: 'Male',
      dateOfBirth: '2015-01-01',
      email: 'test@student.com',
      phone: '1234567890',
      address: 'Test Address'
    };

    const schoolId = 'test-school-id'; // Replace with actual school ID
    const adminId = 'test-admin-id'; // Replace with actual admin ID

    const result = await admissionService.createPartialAdmission(
      admissionData,
      schoolId,
      adminId
    );

    console.log('\n🎯 Partial Admission Result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ Partial admission created successfully!');
      console.log('📋 Student ID:', result.data.profile._id);
      console.log('👤 Student Name:', `${result.data.profile.firstName} ${result.data.profile.lastName}`);
      console.log('📧 Email:', result.data.profile.email);
      console.log('📱 Phone:', result.data.profile.phone);
      console.log('📊 Status:', result.data.profile.status);
      
      console.log('\n🔗 Now test API:');
      console.log('GET http://localhost:5000/api/v1/admission/partial');
      console.log('Authorization: Bearer YOUR_TOKEN');
    } else {
      console.log('\n❌ Failed to create partial admission');
      console.log('Error:', result.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createTestPartialAdmission();
