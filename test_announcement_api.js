/**
 * Simple test script for Announcement API
 * Run with: node test_announcement_api.js
 */

const mongoose = require('mongoose');
const Announcement = require('./src/models/Announcement');

// Test data
const testAnnouncement = {
  title: 'Test School Holiday Announcement',
  content: 'This is to inform all students, parents, and staff that the school will be closed on Monday, December 25, 2023, for Christmas holiday. Classes will resume on Tuesday, December 26, 2023. Please enjoy the holiday and stay safe!',
  type: 'holiday',
  priority: 'high',
  targetAudience: ['all'],
  author: new mongoose.Types.ObjectId(),
  authorName: 'Test Admin',
  deliveryMethods: {
    email: true,
    sms: false,
    push: true,
    dashboard: true
  },
  tags: ['holiday', 'christmas', 'closure'],
  allowComments: true,
  isPinned: true
};

async function testAnnouncementAPI() {
  try {
    // Connect to MongoDB (make sure your MONGODB_URI is set in .env)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sms_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Create announcement
    console.log('\n🧪 Test 1: Creating announcement...');
    const announcement = new Announcement(testAnnouncement);
    const savedAnnouncement = await announcement.save();
    console.log('✅ Announcement created successfully:', savedAnnouncement.title);

    // Test 2: Find active announcements
    console.log('\n🧪 Test 2: Finding active announcements...');
    const activeAnnouncements = await Announcement.findActive();
    console.log(`✅ Found ${activeAnnouncements.length} active announcements`);

    // Test 3: Test virtual properties
    console.log('\n🧪 Test 3: Testing virtual properties...');
    console.log('Is Active:', savedAnnouncement.isActive);
    console.log('Is Expired:', savedAnnouncement.isExpired);
    console.log('Is Scheduled:', savedAnnouncement.isScheduled);

    // Test 4: Mark as read
    console.log('\n🧪 Test 4: Marking announcement as read...');
    await savedAnnouncement.markAsRead(new mongoose.Types.ObjectId());
    console.log('✅ Announcement marked as read');
    console.log('View Count:', savedAnnouncement.viewCount);
    console.log('Read By Count:', savedAnnouncement.readBy.length);

    // Test 5: Add comment
    console.log('\n🧪 Test 5: Adding comment...');
    await savedAnnouncement.addComment(
      new mongoose.Types.ObjectId(),
      'Test Parent',
      'Thank you for the information!'
    );
    console.log('✅ Comment added successfully');
    console.log('Comments Count:', savedAnnouncement.comments.length);

    // Test 6: Update announcement
    console.log('\n🧪 Test 6: Updating announcement...');
    savedAnnouncement.priority = 'urgent';
    await savedAnnouncement.save();
    console.log('✅ Announcement updated successfully');

    // Test 7: Delete announcement
    console.log('\n🧪 Test 7: Deleting announcement...');
    await Announcement.findByIdAndDelete(savedAnnouncement._id);
    console.log('✅ Announcement deleted successfully');

    console.log('\n🎉 All tests passed! Announcement API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Check if this file is being run directly
if (require.main === module) {
  testAnnouncementAPI();
}

module.exports = testAnnouncementAPI;
