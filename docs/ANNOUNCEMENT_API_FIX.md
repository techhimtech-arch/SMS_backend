# Announcement API Fix - Empty Data Response Issue

## Problem
The GET `/api/v1/announcements` endpoint was returning empty data even though announcements might exist:
```json
{
  "success": true,
  "count": 0,
  "total": 0,
  "data": []
}
```

## Root Cause
The `getAnnouncements` controller (line 218-219) was filtering announcements by:
- `schoolId` - was querying for announcements matching `req.user.schoolId`
- `visibleToRoles` - was checking if user's role is in `visibleToRoles` array

However, these fields were **missing from the Announcement schema**, so MongoDB couldn't find any matches.

## Solution Implemented

### 1. Updated Announcement Schema (`src/models/Announcement.js`)
Added two new fields:
```javascript
schoolId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'School'
},
visibleToRoles: [{
  type: String,
  enum: ['admin', 'teacher', 'student', 'parent'],
  default: ['admin', 'teacher', 'student', 'parent']
}]
```

Added indexes for performance:
```javascript
announcementSchema.index({ schoolId: 1, visibleToRoles: 1 });
announcementSchema.index({ schoolId: 1, status: 1 });
```

### 2. Updated `createAnnouncement` Controller
Now sets these fields automatically when creating announcements:
```javascript
schoolId: req.user.schoolId,
visibleToRoles: ['admin', 'teacher', 'student', 'parent']
```

### 3. Created Migration Script (`scripts/fixAnnouncementSchema.js`)
To fix existing announcements in the database.

## How to Apply Fix

### Step 1: Apply Schema Changes
The schema changes are already in the code. MongoDB will accept the new fields automatically.

### Step 2: Migrate Existing Announcements
Run the migration script to add missing fields to existing announcements:

```bash
# From SMS_backend directory
node scripts/fixAnnouncementSchema.js
```

You should see output like:
```
✓ Connected to MongoDB
Found X announcements to fix
✓ Updated announcement: [title]
✓ Successfully updated X announcements
✓ Verification successful - all announcements fixed!
```

### Step 3: Test the API
Now create an announcement and fetch it:

```bash
# Create announcement
curl -X POST http://localhost:5000/api/v1/announcements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Announcement",
    "content": "This is a test",
    "type": "general",
    "priority": "medium"
  }'

# Fetch announcements
curl -X GET http://localhost:5000/api/v1/announcements \
  -H "Authorization: Bearer YOUR_TOKEN"
```

You should now see announcements in the response!

## Files Modified
- `src/models/Announcement.js` - Added schema fields and indexes
- `src/controllers/announcementController.js` - Set fields on creation
- `scripts/fixAnnouncementSchema.js` - Migration script (new)

## Why This Happened
The controller and schema were out of sync. The controller expected fields that the schema didn't define, causing all queries to return empty results even if announcements existed in the database.
