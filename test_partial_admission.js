/**
 * Test partial admission system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const StudentProfile = require('./src/models/StudentProfile');

async function testPartialAdmission() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sms', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Check partial admissions
    const partialAdmissions = await StudentProfile.find({ status: 'partial' })
      .populate('userId', 'name email')
      .populate('admittedBy', 'name')
      .limit(10);

    console.log('\n📋 Partial Admissions:');
    if (partialAdmissions.length > 0) {
      partialAdmissions.forEach((admission, i) => {
        console.log(`${i+1}. ${admission.firstName} ${admission.lastName}`);
        console.log(`   Status: ${admission.status}`);
        console.log(`   Email: ${admission.email || 'Not provided'}`);
        console.log(`   Phone: ${admission.phone || 'Not provided'}`);
        console.log(`   Admitted by: ${admission.admittedBy?.name || 'Unknown'}`);
        console.log(`   Date: ${admission.admissionDate?.toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No partial admissions found');
    }

    // Check completed admissions
    const completedAdmissions = await StudentProfile.find({ status: 'completed' })
      .populate('userId', 'name email')
      .populate('admittedBy', 'name')
      .limit(10);

    console.log('\n✅ Completed Admissions:');
    if (completedAdmissions.length > 0) {
      completedAdmissions.forEach((admission, i) => {
        console.log(`${i+1}. ${admission.firstName} ${admission.lastName}`);
        console.log(`   Status: ${admission.status}`);
        console.log(`   Class: ${admission.classId || 'Not assigned'}`);
        console.log(`   Section: ${admission.sectionId || 'Not assigned'}`);
        console.log(`   Parent: ${admission.parentUserId || 'Not linked'}`);
        console.log(`   Completed: ${admission.completedAt?.toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No completed admissions found');
    }

    // Check total by status
    const statusCounts = await StudentProfile.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Admissions by Status:');
    statusCounts.forEach(item => {
      console.log(`${item._id}: ${item.count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testPartialAdmission();
