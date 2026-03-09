/**
 * Test announcement routes loading
 */

console.log('🧪 Testing announcement routes...\n');

try {
  // Test if all dependencies load correctly
  console.log('1. Testing dependencies...');
  const express = require('express');
  const announcementRoutes = require('./src/routes/announcementRoutes');
  console.log('✅ Dependencies loaded successfully');

  // Test if routes can be used in an Express app
  console.log('\n2. Testing route integration...');
  const app = express();
  app.use('/api/v1/announcements', announcementRoutes);
  console.log('✅ Routes integrated successfully');

  // Test route methods
  console.log('\n3. Testing route structure...');
  console.log('   - Router type:', typeof announcementRoutes);
  console.log('   - Has stack:', Array.isArray(announcementRoutes.stack));
  console.log('   - Stack length:', announcementRoutes.stack.length);
  
  // List all routes
  console.log('\n4. Available routes:');
  announcementRoutes.stack.forEach((layer, index) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`   ${index + 1}. ${methods} ${layer.route.path}`);
    }
  });

  console.log('\n🎉 Announcement routes test completed successfully!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n🔍 Test completed.');
