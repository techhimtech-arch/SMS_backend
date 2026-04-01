# Announcement Model Schema Mismatch - FIXED ✅

## **Problem**
GET announcements API was throwing error:
```
StrictPopulateError: Cannot populate path `targetClasses.classId` 
because it is not in your schema
```

## **Root Cause**
The controller was trying to populate fields that don't exist in the Announcement model:
- ❌ `targetClasses.classId` 
- ❌ `targetSections.sectionId`
- ❌ `targetUsers.userId`
- ❌ `comments.userId`

**Actual Model Structure:**
```javascript
// What the model ACTUALLY has:
{
  targetIds: [ObjectId],        // Array of IDs
  targetRefPath: String,        // Type of reference: 'Class', 'Section', 'User'
  // NOT:
  // targetClasses: [...]
  // targetSections: [...]
  // targetUsers: [...]
}
```

## **Solution**
Removed all invalid populate calls. Controller now only populates fields that exist:

```javascript
// BEFORE (Wrong)
Announcement.find(query)
  .populate('createdBy', 'name email')
  .populate('targetClasses.classId', 'name')      // ❌ doesn't exist
  .populate('targetSections.sectionId', 'name')   // ❌ doesn't exist
  .populate('targetUsers.userId', 'name email')   // ❌ doesn't exist
  .populate('comments.userId', 'name email');     // ❌ doesn't exist

// AFTER (Correct)
Announcement.find(query)
  .populate('createdBy', 'name email')     // ✅ exists
  .populate('updatedBy', 'name email');    // ✅ exists
```

## **Files Changed**
✅ `src/controllers/announcementController.js`
- Fixed `getAnnouncements()` function (lines 216-217)
- Fixed `getAnnouncement()` function (lines 289-290)

## **Result**
```
✅ GET /api/v1/announcements → Returns announcements with creator info
✅ No schema validation errors
✅ Server running successfully
```

## **Actual Model Reference Fields**
The Announcement model only has two populated references:
1. **createdBy** → User who created the announcement
2. **updatedBy** → User who last updated the announcement

For target-specific data (classes/sections/users), use:
- `targetIds` (array of ObjectIds)
- `targetRefPath` (indicates: 'Class', 'Section', or 'User')

