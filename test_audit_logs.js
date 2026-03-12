/**
 * Test audit logs functionality
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AuditLog = require('./src/models/AuditLog');

async function testAuditLogs() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sms', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Check total audit logs
    const totalCount = await AuditLog.countDocuments();
    console.log(`\n📊 Total audit logs: ${totalCount}`);

    // Get latest 5 audit logs
    const latest = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('action resourceType userId schoolId createdAt');
    
    if (latest.length > 0) {
      console.log('\n📝 Latest audit logs:');
      latest.forEach((log, i) => {
        console.log(`${i+1}. ${log.action} on ${log.resourceType}`);
        console.log(`   User: ${log.userId} | School: ${log.schoolId}`);
        console.log(`   Created: ${log.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No audit logs found');
    }

    // Check by action type
    const actionCounts = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 By action:');
    actionCounts.forEach(item => {
      console.log(`${item._id}: ${item.count}`);
    });

    // Check by resource type
    const resourceCounts = await AuditLog.aggregate([
      { $group: { _id: '$resourceType', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📋 By resource type:');
    resourceCounts.forEach(item => {
      console.log(`${item._id}: ${item.count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testAuditLogs();
