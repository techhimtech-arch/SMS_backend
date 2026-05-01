# Timetable Management Module - Complete Documentation

## Overview

The Timetable Management Module is a comprehensive system for managing class schedules and teacher assignments in the school management system. It handles timetable creation, updates, deletion, and provides multiple query endpoints for different user roles.

## Key Features

✅ **Conflict Prevention**
- Prevents duplicate timetable entries for the same class/section/day/period
- Prevents teacher assignment conflicts (no teacher can teach two classes at the same time)
- Prevents class conflicts (no class can have two subjects in the same period)

✅ **Role-Based Access Control**
- **Admin**: Full CRUD operations
- **Teacher**: Can view their own timetables
- **Student/Parent**: Can view class timetables

✅ **Data Organization**
- Group by days for easy frontend grid rendering
- Support for multiple academic sessions and semesters
- Soft delete support for data preservation

✅ **Bulk Operations**
- Create multiple timetable entries in a single request
- Conflict validation for all entries before insertion

## Schema

```javascript
{
  classId: ObjectId (ref: Class),
  sectionId: ObjectId (ref: Section),
  day: String (enum: MONDAY-SUNDAY),
  periodNumber: Number (1-12),
  subjectId: ObjectId (ref: Subject),
  teacherId: ObjectId (ref: User),
  startTime: String (HH:MM format),
  endTime: String (HH:MM format),
  room: String (optional),
  academicSessionId: ObjectId (ref: AcademicYear),
  semester: String (FIRST or SECOND),
  schoolId: ObjectId (ref: School),
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  isActive: Boolean (default: true),
  isDeleted: Boolean (default: false - soft delete),
  deletedAt: Date,
  deletedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### 1. Create Timetable Entry
**POST** `/api/v1/timetable`

**Permission Required**: `TIMETABLE_CREATE` (School Admin only)

**Request Body**:
```json
{
  "classId": "ObjectId",
  "sectionId": "ObjectId",
  "day": "MONDAY",
  "periodNumber": 1,
  "subjectId": "ObjectId",
  "teacherId": "ObjectId",
  "startTime": "09:00",
  "endTime": "10:00",
  "room": "A-101",
  "academicSessionId": "ObjectId",
  "semester": "FIRST"
}
```

**Response**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Timetable slot created successfully",
  "data": {
    "_id": "ObjectId",
    "classId": "ObjectId",
    "sectionId": "ObjectId",
    // ... other fields
  }
}
```

**Error Responses**:
- `400`: Bad request - Invalid class/section ID
- `400`: Teacher conflict detected
- `400`: Class conflict detected
- `401`: Unauthorized
- `403`: Forbidden - Insufficient permissions

---

### 2. Create Bulk Timetable Entries
**POST** `/api/v1/timetable/bulk`

**Permission Required**: `TIMETABLE_CREATE` (School Admin only)

**Request Body**:
```json
{
  "academicSessionId": "ObjectId",
  "timetableSlots": [
    {
      "classId": "ObjectId",
      "sectionId": "ObjectId",
      "day": "MONDAY",
      "periodNumber": 1,
      "subjectId": "ObjectId",
      "teacherId": "ObjectId",
      "startTime": "09:00",
      "endTime": "10:00",
      "room": "A-101"
    },
    // ... more slots
  ]
}
```

**Response**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Timetable slots created successfully",
  "data": [
    // array of created entries
  ]
}
```

---

### 3. Get Class Timetable
**GET** `/api/v1/timetable/class/:classId/section/:sectionId`

**Permission Required**: `TIMETABLE_READ`

**Query Parameters**:
- `academicSessionId` (required): Academic session ID
- `day` (optional): Filter by specific day (MONDAY, TUESDAY, etc.)
- `semester` (optional): Filter by semester (FIRST or SECOND)

**Response**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Class timetable retrieved successfully",
  "data": [
    {
      "_id": "ObjectId",
      "classId": "ObjectId",
      "sectionId": "ObjectId",
      "day": "MONDAY",
      "periodNumber": 1,
      "startTime": "09:00",
      "endTime": "10:00",
      "subjectId": {
        "_id": "ObjectId",
        "name": "English",
        "code": "ENG101"
      },
      "teacherId": {
        "_id": "ObjectId",
        "name": "John Doe",
        "email": "john@school.com"
      }
    }
    // ... more entries sorted by periodNumber
  ]
}
```

---

### 4. Get Weekly Timetable (Grouped by Days)
**GET** `/api/v1/timetable/weekly/class/:classId/section/:sectionId`

**Permission Required**: `TIMETABLE_READ`

**Query Parameters**:
- `academicSessionId` (required): Academic session ID
- `semester` (optional): Filter by semester (FIRST or SECOND)

**Response** (Formatted for Frontend Grid Rendering):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Weekly timetable retrieved successfully",
  "data": {
    "MONDAY": [
      {
        "periodNumber": 1,
        "startTime": "09:00",
        "endTime": "10:00",
        "subject": {
          "_id": "ObjectId",
          "name": "English"
        },
        "teacher": {
          "_id": "ObjectId",
          "name": "John Doe"
        },
        "room": "A-101"
      }
      // ... more periods
    ],
    "TUESDAY": [
      // ... periods for Tuesday
    ],
    "WEDNESDAY": [ ... ],
    "THURSDAY": [ ... ],
    "FRIDAY": [ ... ],
    "SATURDAY": [ ... ]
  }
}
```

---

### 5. Get Teacher Timetable
**GET** `/api/v1/timetable/teacher/:teacherId`

**Permission Required**: `TIMETABLE_READ`

**Access Control**: Teachers can only view their own timetable

**Query Parameters**:
- `academicSessionId` (required): Academic session ID
- `day` (optional): Filter by specific day
- `semester` (optional): Filter by semester

**Response**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Teacher timetable retrieved successfully",
  "data": [
    {
      "_id": "ObjectId",
      "classId": {
        "_id": "ObjectId",
        "name": "10-A"
      },
      "sectionId": {
        "_id": "ObjectId",
        "name": "A"
      },
      "day": "MONDAY",
      "periodNumber": 1,
      "startTime": "09:00",
      "endTime": "10:00",
      "subjectId": {
        "_id": "ObjectId",
        "name": "English"
      }
    }
    // ... more entries sorted by day and periodNumber
  ]
}
```

---

### 6. Update Timetable Entry
**PUT** `/api/v1/timetable/:id`

**Permission Required**: `TIMETABLE_UPDATE` (School Admin only)

**Request Body** (All fields optional):
```json
{
  "classId": "ObjectId",
  "sectionId": "ObjectId",
  "day": "TUESDAY",
  "periodNumber": 2,
  "subjectId": "ObjectId",
  "teacherId": "ObjectId",
  "startTime": "10:00",
  "endTime": "11:00",
  "room": "B-202",
  "semester": "SECOND"
}
```

**Response**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Timetable slot updated successfully",
  "data": {
    // updated entry
  }
}
```

**Important**: If updating day, period, or teacher, conflict validation is performed

---

### 7. Delete Timetable Entry
**DELETE** `/api/v1/timetable/:id`

**Permission Required**: `TIMETABLE_DELETE` (School Admin only)

**Response**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Timetable slot deleted successfully"
}
```

---

### 8. Delete Entire Class Timetable
**DELETE** `/api/v1/timetable/class/:classId/section/:sectionId/session/:sessionId`

**Permission Required**: `TIMETABLE_DELETE` (School Admin only)

**Response**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Class timetable deleted successfully",
  "data": {
    "deletedCount": 25
  }
}
```

## Validation Rules

### 1. Duplicate Prevention
- **Unique Index**: `classId + sectionId + day + periodNumber + academicSessionId + schoolId`
- Attempting to create a duplicate will fail with: "Class conflict: Class already has another subject during [DAY] period [PERIOD]"

### 2. Teacher Conflict Prevention
- A teacher cannot be assigned to two different classes at the same period on the same day
- Error: "Teacher conflict: Teacher is already assigned during [DAY] period [PERIOD]"

### 3. Class Conflict Prevention
- A class/section cannot have two different subjects in the same period on the same day
- Error: "Class conflict: Class already has another subject during [DAY] period [PERIOD]"

### 4. Time Format Validation
- Times must be in 24-hour HH:MM format (e.g., "09:00", "14:30", "23:59")
- Invalid format error: "Time must be in HH:MM format (24-hour)"

### 5. Period Number Validation
- Valid range: 1-12
- Error: "Period number must be between 1 and 12"

### 6. Day Validation
- Valid values: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
- Values are case-insensitive but stored as uppercase

### 7. Semester Validation
- Valid values: FIRST, SECOND
- Default: FIRST

## Business Logic

### Conflict Checking Algorithm

When creating or updating a timetable entry:

1. **Teacher Conflict Check**:
   ```
   Query for any existing timetable entry where:
   - teacherId matches
   - day matches
   - periodNumber matches
   - academicSessionId matches
   - schoolId matches
   - isActive = true
   - isDeleted ≠ true
   - exclude current entry (for updates)
   ```

2. **Class Conflict Check**:
   ```
   Query for any existing timetable entry where:
   - classId matches
   - sectionId matches
   - day matches
   - periodNumber matches
   - academicSessionId matches
   - schoolId matches
   - isActive = true
   - isDeleted ≠ true
   - exclude current entry (for updates)
   ```

### Weekly Timetable Grouping

The system uses MongoDB aggregation pipeline to:
1. Match timetable entries for the specified class/section
2. Join with Subject and User collections for details
3. Group by day and periodNumber
4. Re-group by day to create day-based buckets
5. Sort days in week order (Monday to Sunday)

Result format is ideal for frontend grid rendering:
```javascript
{
  "MONDAY": [...periods],
  "TUESDAY": [...periods],
  // etc.
}
```

## Service Layer

The module includes a dedicated service layer (`timetableService.js`) that handles:
- Data validation
- Conflict checking
- Database operations
- Error handling
- Logging

**Available Service Functions**:
- `createTimetableSlot(slotData, schoolId, userId)`
- `createBulkTimetable(slots, academicSessionId, schoolId, userId)`
- `getClassTimetable(classId, sectionId, academicSessionId, schoolId, filters)`
- `getTeacherTimetable(teacherId, academicSessionId, schoolId, filters)`
- `getWeeklyTimetable(classId, sectionId, academicSessionId, schoolId, semester)`
- `updateTimetableSlot(timetableId, updateData, schoolId, userId)`
- `deleteTimetableSlot(timetableId, schoolId, userId)`
- `deleteClassTimetable(classId, sectionId, sessionId, schoolId, userId)`
- `validateTimetableSlot(slotData)`

## Usage Examples

### Frontend - Display Weekly Timetable in Grid

```javascript
// Fetch weekly timetable
const response = await fetch('/api/v1/timetable/weekly/class/classId/section/sectionId?academicSessionId=sessionId');
const { data } = await response.json();

// data structure:
// {
//   MONDAY: [{periodNumber: 1, startTime: "09:00", subject: {...}, teacher: {...}}],
//   TUESDAY: [...],
//   ...
// }

// Render as grid
const grid = {};
Object.keys(data).forEach(day => {
  grid[day] = data[day].map(period => ({
    period: period.periodNumber,
    subject: period.subject.name,
    teacher: period.teacher.name,
    time: `${period.startTime} - ${period.endTime}`,
    room: period.room
  }));
});
```

### Frontend - Student View Class Timetable

```javascript
const response = await fetch('/api/v1/timetable/class/classId/section/sectionId?academicSessionId=sessionId');
const { data } = await response.json();

// Display as list or calendar
```

### Backend - Create Timetable via Service

```javascript
const timetableService = require('../services/timetableService');

// Validate data
const errors = timetableService.validateTimetableSlot(slotData);
if (errors.length > 0) {
  throw new Error(errors.join(', '));
}

// Create entry
const entry = await timetableService.createTimetableSlot(
  slotData,
  schoolId,
  userId
);
```

## Performance Considerations

### Indexes
- `classId + sectionId + day + periodNumber + academicSessionId + schoolId` (unique)
- `schoolId + isActive`
- `schoolId + isDeleted`
- `academicSessionId + schoolId`
- `classId + sectionId + academicSessionId + isActive`
- `teacherId + day + academicSessionId + isActive`
- `subjectId + academicSessionId + isActive`
- `createdBy`

### Query Optimization
- Always filter by `schoolId` for multi-tenant data isolation
- Use `.lean()` for read-only queries
- Use aggregation pipeline for complex grouping operations
- Sort queries use existing indexes

## Error Handling

All errors are handled with proper HTTP status codes and descriptive messages:

```javascript
{
  "success": false,
  "statusCode": 400,
  "message": "Teacher conflict: Teacher is already assigned during MONDAY period 2"
}
```

**Common Status Codes**:
- `201`: Created successfully
- `200`: Success
- `400`: Bad request / Validation error / Conflict
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Internal server error

## Audit Trail

All changes are tracked with:
- `createdBy`: User who created the entry
- `updatedBy`: User who last updated the entry
- `deletedBy`: User who deleted the entry (if soft deleted)
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update
- `deletedAt`: Timestamp of deletion

## Future Enhancements

Potential improvements for future versions:
1. **Teacher Load Balancing**: Track total teaching hours per teacher
2. **Room Availability**: Prevent double-booking of rooms
3. **Student Batch Assignment**: Assign entire batches to timetables
4. **Timetable Templates**: Reusable timetable patterns
5. **Break Periods**: Define break/lunch periods
6. **Notifications**: Alert students/teachers of changes
7. **Export**: Export timetables to PDF/Excel
8. **Analytics**: Timetable utilization reports

## Support & Troubleshooting

### Common Issues

**Issue**: "Class conflict" error when creating duplicate entries
**Solution**: Check if entry already exists using GET endpoint. Duplicate detection is working as intended.

**Issue**: "Teacher conflict" error for valid assignments
**Solution**: Verify the teacher is not already assigned to another class at that time. Check teacher's timetable using GET teacher endpoint.

**Issue**: Empty weekly timetable response
**Solution**: Verify academicSessionId is provided and valid. Check that timetable entries exist for that session.

---

## References

- [Timetable Model](../models/Timetable.js)
- [Timetable Controller](../controllers/timetableController.js)
- [Timetable Routes](../routes/timetableRoutes.js)
- [Timetable Service](../services/timetableService.js)
- [RBAC Permissions](../utils/rbac.js)
