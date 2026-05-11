const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');

async function migrateUserNames() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const users = await User.find({});
    console.log(`Found ${users.length} users to check.`);

    let updatedCount = 0;

    for (const user of users) {
      // Check if firstName is already set. If not, and name exists, split it.
      // Note: 'name' might not be in the model schema anymore, 
      // so we use user._doc.name to access the raw data from MongoDB.
      const rawName = user._doc.name;
      
      if (!user.firstName && rawName) {
        const parts = rawName.split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');

        user.firstName = firstName || 'User';
        user.lastName = lastName || '';
        
        // Remove the old 'name' field from the document
        // MongoDB will keep it unless we explicitly unset it, 
        // but for now, just setting the new fields is enough.
        await user.save();
        updatedCount++;
      }
    }

    console.log(`Migration complete! Updated ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateUserNames();
