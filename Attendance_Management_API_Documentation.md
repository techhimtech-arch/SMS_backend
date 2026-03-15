# Attendance Management API Documentation

## Overview
This document provides comprehensive API endpoints for attendance management in the School Management System. The attendance system supports both daily attendance (marked by class teachers) and subject-wise attendance (marked by subject teachers).

## Base URL
```
https://your-backend-url.com/api/v1/attendance
```

## Authentication
All API requests require authentication using Bearer Token:
```
Authorization: Bearer <jwt_token>
```

## Attendance Types
- **Daily Attendance**: Marked by class teachers for the entire day
- **Subject Attendance**: Marked by subject teachers for specific periods

## API Endpoints

### 1. Mark Single Student Attendance
**Endpoint:** `POST /api/v1/attendance`

**Description:** Mark attendance for a single student. Role-based access applies.

**Roles Allowed:**
- `superadmin`: Can mark attendance for any class/section
- `school_admin`: Can mark attendance for any class/section in their school
- `teacher`: Can only mark attendance for assigned classes/sections/subjects

**Request Body:**
```json
{
  "studentId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "classId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "sectionId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "subjectId": "64f8a1b2c3d4e5f6a7b8c9d3", // Optional - only required for subject-wise attendance
  "date": "2024-03-15",
  "status": "Present", // Enum: ["Present", "Absent", "Leave", "Late"]
  "attendanceType": "daily" // Optional: "daily" (default) or "subject"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "studentId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "classId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "sectionId": "64f8a1b2c3d4e5f6a7b8c9d2",
    "subjectId": null,
    "attendanceType": "daily",
    "schoolId": "64f8a1b2c3d4e5f6a7b8c9d5",
    "date": "2024-03-15T00:00:00.000Z",
    "status": "Present",
    "markedBy": "64f8a1b2c3d4e5f6a7b8c9d6",
    "createdAt": "2024-03-15T08:30:00.000Z",
    "updatedAt": "2024-03-15T08:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Bad request or duplicate attendance
- `403`: Not authorized (teacher not assigned to this class/section/subject)
- `404`: Student/class/section not found

---

### 2. Mark Bulk Attendance
**Endpoint:** `POST /api/v1/attendance/bulk`

**Description:** Mark attendance for multiple students in a single request. Ideal for class-wide attendance marking.

**Roles Allowed:** Same as single attendance marking

**Request Body:**
```json
{
  "date": "2024-03-15",
  "classId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "sectionId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "subjectId": "64f8a1b2c3d4e5f6a7b8c9d3", // Optional - only required for subject-wise attendance
  "attendanceType": "daily", // Optional: "daily" (default) or "subject"
  "records": [
    {
      "studentId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "status": "Present"
    },
    {
      "studentId": "64f8a1b2c3d4e5f6a7b8c9d7",
      "status": "Absent"
    },
    {
      "studentId": "64f8a1b2c3d4e5f6a7b8c9d8",
      "status": "Leave"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "studentId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "status": "Present",
      // ... other fields
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
      "studentId": "64f8a1b2c3d4e5f6a7b8c9d7",
      "status": "Absent",
      // ... other fields
    }
  ]
}
```

---

### 3. Get Attendance Records
**Endpoint:** `GET /api/v1/attendance`

**Description:** Retrieve attendance records with role-based filtering.

**Roles Allowed:**
- `superadmin`/`school_admin`/`teacher`: Can filter by class, section, student
- `parent`: Automatically filtered to show only their children's attendance

**Query Parameters:**
```
date (required): 2024-03-15
classId (optional): 64f8a1b2c3d4e5f6a7b8c9d1
sectionId (optional): 64f8a1b2c3d4e5f6a7b8c9d2
studentId (optional): 64f8a1b2c3d4e5f6a7b8c9d0
```

**Example Request:**
```
GET /api/v1/attendance?date=2024-03-15&classId=64f8a1b2c3d4e5f6a7b8c9d1&sectionId=64f8a1b2c3d4e5f6a7b8c9d2
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "studentId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "firstName": "John",
        "lastName": "Doe",
        "admissionNumber": "ADM2024001"
      },
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "A"
      },
      "subjectId": null, // or subject details for subject-wise attendance
      "attendanceType": "daily",
      "date": "2024-03-15T00:00:00.000Z",
      "status": "Present",
      "markedBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
        "name": "Jane Smith"
      },
      "createdAt": "2024-03-15T08:30:00.000Z",
      "updatedAt": "2024-03-15T08:30:00.000Z"
    }
  ]
}
```

---

### 4. Delete Attendance Record
**Endpoint:** `DELETE /api/v1/attendance/:id`

**Description:** Delete a specific attendance record.

**Roles Allowed:** `superadmin`, `school_admin`, `teacher`

**Path Parameter:**
```
id: Attendance record ObjectId
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

**Error Responses:**
- `404`: Attendance record not found
- `403`: Not authorized to delete this attendance

---

## Role-Based Access Control

### For Teachers:
- **Daily Attendance**: Must be assigned as Class Teacher for the section
- **Subject Attendance**: Must have active TeacherAssignment for the specific class/section/subject
- Can only mark attendance for their assigned classes/sections

### For Parents:
- Can only view attendance of their own children
- Query parameters (classId, sectionId, studentId) are ignored and automatically filtered
- Cannot mark or delete attendance

### For Admins:
- `superadmin`: Full access across all schools
- `school_admin`: Full access within their school only

## Important Notes for Frontend Development

### 1. Date Format
- All dates should be in ISO 8601 format: `YYYY-MM-DD`
- The API expects dates in UTC timezone

### 2. Error Handling
- Always check the `success` field in responses
- Handle specific error codes appropriately:
  - `400`: Validation errors or duplicate attendance
  - `403`: Permission issues
  - `404`: Resource not found

### 3. Bulk Operations
- Use bulk attendance endpoint for marking multiple students
- Maximum recommended batch size: 50 students per request
- The API will continue processing even if some records fail

### 4. Attendance Status Values
```javascript
const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent', 
  LEAVE: 'Leave',
  LATE: 'Late'
};
```

### 5. Sample Frontend Implementation

#### Mark Single Attendance:
```javascript
const markAttendance = async (attendanceData) => {
  try {
    const response = await fetch('/api/v1/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(attendanceData)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to mark attendance');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};
```

#### Get Attendance:
```javascript
const getAttendance = async (date, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({ date, ...filters });
    const response = await fetch(`/api/v1/attendance?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
};
```

#### Bulk Attendance:
```javascript
const markBulkAttendance = async (bulkData) => {
  try {
    const response = await fetch('/api/v1/attendance/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bulkData)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to mark bulk attendance');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    throw error;
  }
};
```

## Testing the APIs

You can test these APIs using:
1. **Swagger UI**: Visit `/api-docs` on your backend
2. **Postman**: Import the collection and set authorization header
3. **cURL**: Use command-line requests with proper headers

## Common Issues and Solutions

### Issue: "You are not the class teacher of this section"
**Solution**: Ensure the teacher is properly assigned as Class Teacher for that section

### Issue: "Attendance already marked for this student on this date"
**Solution**: Use PUT endpoint to update existing attendance or delete first

### Issue: "Not authorized to mark attendance for this subject"
**Solution**: Verify teacher has active assignment for the specific subject

### Issue: Parents seeing no attendance data
**Solution**: Ensure parent-child relationships are properly set up in the system

## Support
For any API-related issues, contact the backend development team or check the application logs for detailed error information.
