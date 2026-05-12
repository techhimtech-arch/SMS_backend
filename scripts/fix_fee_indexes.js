const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixIndexes = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not found in .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, { dbName: 'test' });
    console.log('Connected to MongoDB...');

    const collection = mongoose.connection.collection('feestructures');
    
    // List all indexes to be sure
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the specific stale index
    console.log('Attempting to drop stale index...');
    try {
      await collection.dropIndex('classId_1_academicYear_1_schoolId_1');
      console.log('Successfully dropped: classId_1_academicYear_1_schoolId_1');
    } catch (e) {
      console.log('Index classId_1_academicYear_1_schoolId_1 not found or already dropped.');
    }

    // Also drop any other suspicious ones if they exist
    try {
      await collection.dropIndex('academicYear_1');
    } catch (e) {}

    console.log('Cleanup complete. Please restart your server.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixIndexes();
