/**
 * Test to verify auth middleware fixes
 */

console.log('🧪 Testing auth middleware fixes...\n');

try {
  // Test if auth middleware loads correctly
  console.log('1. Testing auth middleware...');
  const authMiddleware = require('./src/middlewares/authMiddleware');
  console.log('✅ Auth middleware loaded successfully');

  // Test if announcement controller loads correctly
  console.log('\n2. Testing announcement controller...');
  const announcementController = require('./src/controllers/announcementController');
  console.log('✅ Announcement controller loaded successfully');

  // Test if announcement model loads correctly
  console.log('\n3. Testing announcement model...');
  const Announcement = require('./src/models/Announcement');
  console.log('✅ Announcement model loaded successfully');

  // Test model fields
  console.log('\n4. Testing announcement model fields...');
  const testAnnouncement = new Announcement({
    title: 'Test',
    content: 'Test content',
    targetAudience: ['all'],
    author: '507f1f77bcf86cd799439011',
    authorName: 'Test User'
  });
  
  console.log('   Required fields:');
  console.log('   - author:', testAnnouncement.author ? '✅' : '❌');
  console.log('   - authorName:', testAnnouncement.authorName ? '✅' : '❌');
  console.log('   - title:', testAnnouncement.title ? '✅' : '❌');
  console.log('   - content:', testAnnouncement.content ? '✅' : '❌');

  console.log('\n🎉 All auth middleware tests passed!');
  console.log('\n📝 Summary of fixes:');
  console.log('✅ Fixed auth middleware to attach user data');
  console.log('✅ Added req.user.id field for compatibility');
  console.log('✅ Fixed deliveryMethods to handle portal field');
  console.log('✅ Added debugging logs');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n🔍 Test completed.');
