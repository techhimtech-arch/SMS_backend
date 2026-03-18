# Teacher Portal API Documentation

## Overview
This document provides complete API documentation for the Teacher Portal module of the School Management System. Teachers can manage their profile, view assigned classes and students, mark attendance, and manage exam results.

## Base URL
```
http://your-server-url/api/v1
```

## Authentication
All teacher portal endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer {accessToken}
```

---

## 1. Teacher Profile Management

### 1.1 Get Teacher Profile
**Endpoint:** `GET /teacher/profile`

**Description:** Get teacher profile with subject and class assignments.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "teacher": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Smith",
      "email": "john.smith@school.com",
      "role": "teacher",
      "phone": "+1234567890",
      "address": "123 School St, City",
      "qualification": "M.Sc. Mathematics",
      "experience": "5 years"
    },
    "subjectAssignments": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "teacherId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "classId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Class 10"
        },
        "sectionId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
          "name": "Section A"
        },
        "subjectId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
          "name": "Mathematics"
        }
      }
    ],
    "classTeacherAssignment": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "teacherId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Section A"
      }
    }
  }
}
```

---

## 2. Class and Student Management

### 2.1 Get Assigned Classes
**Endpoint:** `GET /teacher/classes`

**Description:** Get all classes and subjects assigned to the teacher.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subjectAssignments": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "teacherId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "classId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Class 10"
        },
        "sectionId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
          "name": "Section A"
        },
        "subjectId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
          "name": "Mathematics"
        }
      }
    ],
    "classTeacherAssignment": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "teacherId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Section A"
      }
    }
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1
  }
}
```

### 2.2 Get Assigned Students
**Endpoint:** `GET /teacher/students`

**Description:** Get students from teacher's assigned classes.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `classId` (optional): Filter by class ID
- `sectionId` (optional): Filter by section ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "admissionNumber": "ADM2023001",
      "firstName": "Alice",
      "lastName": "Johnson",
      "gender": "Female",
      "dateOfBirth": "2008-05-15T00:00:00.000Z",
      "email": "alice.johnson@email.com",
      "phone": "+1234567890",
      "parentUserId": "64f8a1b2c3d4e5f6a7b8c9d7",
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Section A"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalStudents": 1
  }
}
```

---

## 3. Attendance Management

### 3.1 Get Attendance Records
**Endpoint:** `GET /teacher/attendance`

**Description:** Get attendance records for assigned students.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `classId` (optional): Filter by class ID
- `sectionId` (optional): Filter by section ID
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
      "studentId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
        "admissionNumber": "ADM2023001",
        "firstName": "Alice",
        "lastName": "Johnson"
      },
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Section A"
      },
      "date": "2024-03-18T00:00:00.000Z",
      "status": "Present",
      "remarks": "On time",
      "markedBy": "64f8a1b2c3d4e5f6a7b8c9d0"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalRecords": 1
  }
}
```

### 3.2 Mark Attendance
**Endpoint:** `POST /teacher/attendance/mark`

**Description:** Mark attendance for students in a class.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "classId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "sectionId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "date": "2024-03-18",
  "attendanceRecords": [
    {
      "studentId": "64f8a1b2c3d4e5f6a7b8c9d6",
      "status": "Present",
      "remarks": "On time"
    },
    {
      "studentId": "64f8a1b2c3d4e5f6a7b8c9d9",
      "status": "Absent",
      "remarks": "Sick leave"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Attendance marked for 2 students",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
      "studentId": "64f8a1b2c3d4e5f6a7b8c9d6",
      "classId": "64f8a1b2c3d4e5f6a7b8c9d2",
      "sectionId": "64f8a1b2c3d4e5f6a7b8c9d3",
      "date": "2024-03-18T00:00:00.000Z",
      "status": "Present",
      "remarks": "On time",
      "markedBy": "64f8a1b2c3d4e5f6a7b8c9d0",
      "schoolId": "64f8a1b2c3d4e5f6a7b8c9d1"
    }
  ]
}
```

### 3.3 Update Attendance
**Endpoint:** `PUT /teacher/attendance/update`

**Description:** Update an existing attendance record.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "attendanceId": "64f8a1b2c3d4e5f6a7b8c9d8",
  "status": "Late",
  "remarks": "Arrived 10 minutes late"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
    "studentId": "64f8a1b2c3d4e5f6a7b8c9d6",
    "classId": "64f8a1b2c3d4e5f6a7b8c9d2",
    "sectionId": "64f8a1b2c3d4e5f6a7b8c9d3",
    "date": "2024-03-18T00:00:00.000Z",
    "status": "Late",
    "remarks": "Arrived 10 minutes late",
    "updatedBy": "64f8a1b2c3d4e5f6a7b8c9d0"
  }
}
```

---

## 4. Exam and Results Management

### 4.1 Get Exams
**Endpoint:** `GET /teacher/exams`

**Description:** Get exams for teacher's assigned classes.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `classId` (optional): Filter by class ID
- `sectionId` (optional): Filter by section ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9da",
      "name": "Mid-Term Examination",
      "description": "Mid-term examination for Class 10",
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Class 10"
      },
      "subjectId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
        "name": "Mathematics"
      },
      "examDate": "2024-03-25T00:00:00.000Z",
      "totalMarks": 100,
      "duration": "2 hours",
      "isActive": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalExams": 1
  }
}
```

### 4.2 Get Results
**Endpoint:** `GET /teacher/results`

**Description:** Get exam results for assigned students.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `classId` (optional): Filter by class ID
- `sectionId` (optional): Filter by section ID
- `examId` (optional): Filter by exam ID
- `subjectId` (optional): Filter by subject ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9db",
      "studentId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
        "admissionNumber": "ADM2023001",
        "firstName": "Alice",
        "lastName": "Johnson"
      },
      "examId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9da",
        "name": "Mid-Term Examination",
        "examDate": "2024-03-25T00:00:00.000Z"
      },
      "subjectId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
        "name": "Mathematics"
      },
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Section A"
      },
      "marksObtained": 85,
      "maxMarks": 100,
      "grade": "A",
      "remarks": "Excellent performance",
      "enteredBy": "64f8a1b2c3d4e5f6a7b8c9d0"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalResults": 1
  }
}
```

### 4.3 Add Results
**Endpoint:** `POST /teacher/results/add`

**Description:** Add exam results for multiple students.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "examId": "64f8a1b2c3d4e5f6a7b8c9da",
  "subjectId": "64f8a1b2c3d4e5f6a7b8c9d4",
  "classId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "sectionId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "results": [
    {
      "studentId": "64f8a1b2c3d4e5f6a7b8c9d6",
      "marksObtained": 85,
      "maxMarks": 100,
      "grade": "A",
      "remarks": "Excellent performance"
    },
    {
      "studentId": "64f8a1b2c3d4e5f6a7b8c9d9",
      "marksObtained": 72,
      "maxMarks": 100,
      "grade": "B+",
      "remarks": "Good performance"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Results added for 2 students",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9db",
      "studentId": "64f8a1b2c3d4e5f6a7b8c9d6",
      "examId": "64f8a1b2c3d4e5f6a7b8c9da",
      "subjectId": "64f8a1b2c3d4e5f6a7b8c9d4",
      "classId": "64f8a1b2c3d4e5f6a7b8c9d2",
      "sectionId": "64f8a1b2c3d4e5f6a7b8c9d3",
      "marksObtained": 85,
      "maxMarks": 100,
      "grade": "A",
      "remarks": "Excellent performance",
      "enteredBy": "64f8a1b2c3d4e5f6a7b8c9d0",
      "schoolId": "64f8a1b2c3d4e5f6a7b8c9d1"
    }
  ]
}
```

### 4.4 Update Result
**Endpoint:** `PUT /teacher/results/update`

**Description:** Update an existing result record.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "resultId": "64f8a1b2c3d4e5f6a7b8c9db",
  "marksObtained": 88,
  "grade": "A+",
  "remarks": "Outstanding performance"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Result updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9db",
    "studentId": "64f8a1b2c3d4e5f6a7b8c9d6",
    "examId": "64f8a1b2c3d4e5f6a7b8c9da",
    "subjectId": "64f8a1b2c3d4e5f6a7b8c9d4",
    "marksObtained": 88,
    "maxMarks": 100,
    "grade": "A+",
    "remarks": "Outstanding performance",
    "updatedBy": "64f8a1b2c3d4e5f6a7b8c9d0"
  }
}
```

---

## 5. Dashboard

### 5.1 Get Dashboard Statistics
**Endpoint:** `GET /teacher/dashboard`

**Description:** Get teacher dashboard statistics.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalStudents": 45,
    "todayAttendance": 42,
    "pendingResults": 15,
    "totalExams": 8,
    "totalAssignments": 6
  }
}
```

---

## 6. Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (if available)"
}
```

### Common HTTP Status Codes:
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## 7. Rate Limiting

- **All endpoints**: 100 requests per 15 minutes

Rate limit headers are included in responses:
- `RateLimit-Limit`: Total requests allowed
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## 8. Security Features

### 8.1 Role-Based Access Control
- Only users with `teacher` role can access these endpoints
- Teachers can only access data for their assigned classes and subjects
- Class teachers have additional privileges for their assigned class

### 8.2 Data Validation
- All input data is validated before processing
- Teacher assignments are verified before granting access to student data
- Attendance and result updates are tracked with audit information

---

## 9. Implementation Flow

### 9.1 Teacher Login Flow
1. Teacher submits credentials to `POST /auth/login`
2. Server validates credentials and returns tokens
3. Frontend stores tokens and redirects to teacher dashboard

### 9.2 Daily Workflow
1. Get teacher profile and assignments: `GET /teacher/profile`
2. View assigned students: `GET /teacher/students`
3. Mark attendance: `POST /teacher/attendance/mark`
4. View/update existing attendance: `GET /teacher/attendance`, `PUT /teacher/attendance/update`
5. Manage exam results: `GET /teacher/exams`, `POST /teacher/results/add`, `PUT /teacher/results/update`

---

## 10. Testing Examples

### 10.1 Get Profile Test
```bash
curl -X GET http://localhost:5000/api/v1/teacher/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 10.2 Mark Attendance Test
```bash
curl -X POST http://localhost:5000/api/v1/teacher/attendance/mark \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "CLASS_ID",
    "sectionId": "SECTION_ID",
    "date": "2024-03-18",
    "attendanceRecords": [
      {
        "studentId": "STUDENT_ID",
        "status": "Present",
        "remarks": "On time"
      }
    ]
  }'
```

### 10.3 Add Results Test
```bash
curl -X POST http://localhost:5000/api/v1/teacher/results/add \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "examId": "EXAM_ID",
    "subjectId": "SUBJECT_ID",
    "classId": "CLASS_ID",
    "sectionId": "SECTION_ID",
    "results": [
      {
        "studentId": "STUDENT_ID",
        "marksObtained": 85,
        "maxMarks": 100,
        "grade": "A",
        "remarks": "Excellent performance"
      }
    ]
  }'
```

---

## 11. Frontend Integration Tips

### 11.1 Authentication
- Store access token securely
- Implement automatic token refresh
- Handle 401 responses by redirecting to login

### 11.2 Data Management
- Cache teacher profile and assignments for better UX
- Implement pagination for student lists
- Use optimistic updates for attendance marking

### 11.3 User Experience
- Show loading states during API calls
- Implement bulk operations for attendance and results
- Provide confirmation dialogs for destructive actions

### 11.4 Error Handling
- Display user-friendly error messages
- Implement retry mechanisms for failed requests
- Log errors for debugging purposes

---

## 12. Support

For API support or issues:
- Check the server logs for detailed error information
- Verify token validity and role permissions
- Ensure proper class/section assignments
- Contact development team for backend issues

---

*Last Updated: March 2024*
