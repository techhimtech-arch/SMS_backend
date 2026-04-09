/**
 * Migration Script: Fix Announcement Schema
 * This script adds missing schoolId and visibleToRoles to existing announcements
 * Run this after updating Announcement.js schema
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Announcement = require('../src/models/Announcement');
const User = require('../src/models/User');

async function migrateAnnouncements() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    // Find all announcements without schoolId
    const announcementsToFix = await Announcement.find({
      $or: [
        { schoolId: null },
        { schoolId: { $exists: false } },
        { visibleToRoles: null },
        { visibleToRoles: { $exists: false } }
      ]
    });

    console.log(`Found ${announcementsToFix.length} announcements to fix`);

    if (announcementsToFix.length === 0) {
      console.log('✓ All announcements are already fixed!');
      process.exit(0);
    }

    // Update each announcement
    let updated = 0;
    for (const announcement of announcementsToFix) {
      // Get the creator's schoolId
      const creator = await User.findById(announcement.createdBy);
      
      const updates = {};
      
      if (!announcement.schoolId && creator?.schoolId) {
        updates.schoolId = creator.schoolId;
      }
      
      if (!announcement.visibleToRoles || announcement.visibleToRoles.length === 0) {
        updates.visibleToRoles = ['superadmin', 'school_admin', 'teacher', 'accountant', 'parent', 'student'];
      }

      if (Object.keys(updates).length > 0) {
        await Announcement.findByIdAndUpdate(announcement._id, updates);
        updated++;
        console.log(`✓ Updated announcement: ${announcement.title}`);
      }
    }

    console.log(`\n✓ Successfully updated ${updated} announcements`);
    
    // Verify the fix
    const remaining = await Announcement.countDocuments({
      $or: [
        { schoolId: null },
        { visibleToRoles: null }
      ]
    });

    if (remaining === 0) {
      console.log('✓ Verification successful - all announcements fixed!');
    } else {
      console.warn(`⚠ Warning: ${remaining} announcements still need fixing`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the migration
migrateAnnouncements();
