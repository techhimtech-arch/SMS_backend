# 🎓 Teacher APIs - Quick Reference Guide

**Base URL:** `http://localhost:5000/api/v1`

**Authentication:** All endpoints require JWT token in header:
```
Authorization: Bearer {accessToken}
```

---

## 📋 Table of Contents
1. [Profile Management](#1-profile-management)
2. [Classes & Students](#2-classes--students)
3. [Attendance Management](#3-attendance-management)
4. [Exam & Results](#4-exam--results)
5. [Dashboard](#5-dashboard)

---

## 1. Profile Management

### Get Teacher Profile
**Endpoint:** `GET /teacher/profile`

**Description:** Get complete teacher profile with all assignments

**Response (200):**
```json
{
  "success": true,
  "data": {
    "teacher": {
      "_id": "userId",
      "name": "John Smith",
      "email": "john@school.com",
      "phone": "+1234567890",
      "qualification": "M.Sc. Mathematics",
      "experience": "5 years"
    },
    "subjectAssignments": [
      {
        "_id": "assignmentId",
        "classId": { "_id": "classId", "name": "Class 10" },
        "sectionId": { "_id": "sectionId", "name": "Section A" },
        "subjectId": { "_id": "subjectId", "name": "Mathematics" }
      }
    ],
    "classTeacherAssignment": {
      "_id": "assignmentId",
      "classId": { "_id": "classId", "name": "Class 10" },
      "sectionId": { "_id": "sectionId", "name": "Section A" }
    }
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:5000/api/v1/teacher/profile \
  -H "Authorization: Bearer {token}"
```

---

## 2. Classes & Students

### Get Assigned Classes
**Endpoint:** `GET /teacher/classes`

**Query Parameters:**
- `page` (optional): Default 1
- `limit` (optional): Default 10

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subjectAssignments": [
      {
        "_id": "assignmentId",
        "classId": { "_id": "classId", "name": "Class 10" },
        "sectionId": { "_id": "sectionId", "name": "Section A" },
        "subjectId": { "_id": "subjectId", "name": "Mathematics" }
      }
    ],
    "classTeacherAssignment": { ... }
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:5000/api/v1/teacher/classes?page=1&limit=10" \
  -H "Authorization: Bearer {token}"
```

---

### Get Assigned Students
**Endpoint:** `GET /teacher/students`

**Query Parameters:**
- `classId` (optional): Filter by class
- `sectionId` (optional): Filter by section
- `page` (optional): Default 1
- `limit` (optional): Default 50

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "studentId",
      "admissionNumber": "ADM2023001",
      "firstName": "Alice",
      "lastName": "Johnson",
      "gender": "Female",
      "dateOfBirth": "2008-05-15T00:00:00.000Z",
      "email": "alice@email.com",
      "phone": "+1234567890",
      "classId": { "_id": "classId", "name": "Class 10" },
      "sectionId": { "_id": "sectionId", "name": "Section A" }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalStudents": 45
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:5000/api/v1/teacher/students?classId=classId&sectionId=sectionId" \
  -H "Authorization: Bearer {token}"
```

---

## 3. Attendance Management

### Get Attendance Records
**Endpoint:** `GET /teacher/attendance`

**Query Parameters:**
- `classId` (optional)
- `sectionId` (optional)
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `page` (optional): Default 1
- `limit` (optional): Default 50

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "attendanceId",
      "studentId": {
        "_id": "studentId",
        "admissionNumber": "ADM2023001",
        "firstName": "Alice",
        "lastName": "Johnson"
      },
      "classId": { "_id": "classId", "name": "Class 10" },
      "sectionId": { "_id": "sectionId", "name": "Section A" },
      "date": "2024-03-18T00:00:00.000Z",
      "status": "Present",
      "remarks": "On time"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalRecords": 90
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:5000/api/v1/teacher/attendance?classId=classId&sectionId=sectionId" \
  -H "Authorization: Bearer {token}"
```

---

### Mark Attendance
**Endpoint:** `POST /teacher/attendance/mark`

**Request Body:**
```json
{
  "classId": "classId",
  "sectionId": "sectionId",
  "date": "2024-03-18",
  "attendanceRecords": [
    {
      "studentId": "studentId1",
      "status": "Present",
      "remarks": "On time"
    },
    {
      "studentId": "studentId2",
      "status": "Absent",
      "remarks": "Sick leave"
    },
    {
      "studentId": "studentId3",
      "status": "Late",
      "remarks": "10 minutes late"
    }
  ]
}
```

**Status Options:** `Present`, `Absent`, `Late`, `Leave`

**Response (201):**
```json
{
  "success": true,
  "message": "Attendance marked for 3 students",
  "data": [
    {
      "_id": "attendanceId",
      "studentId": "studentId1",
      "classId": "classId",
      "sectionId": "sectionId",
      "date": "2024-03-18T00:00:00.000Z",
      "status": "Present",
      "remarks": "On time",
      "markedBy": "teacherId"
    }
  ]
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/v1/teacher/attendance/mark \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "classId",
    "sectionId": "sectionId",
    "date": "2024-03-18",
    "attendanceRecords": [
      {"studentId": "studentId1", "status": "Present", "remarks": "On time"}
    ]
  }'
```

---

### Update Attendance
**Endpoint:** `PUT /teacher/attendance/update`

**Request Body:**
```json
{
  "attendanceId": "attendanceId",
  "status": "Late",
  "remarks": "Arrived 15 minutes late"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "_id": "attendanceId",
    "studentId": "studentId",
    "classId": "classId",
    "sectionId": "sectionId",
    "date": "2024-03-18T00:00:00.000Z",
    "status": "Late",
    "remarks": "Arrived 15 minutes late",
    "updatedBy": "teacherId"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/teacher/attendance/update \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "attendanceId": "attendanceId",
    "status": "Late",
    "remarks": "Arrived 15 minutes late"
  }'
```

---

## 4. Exam & Results

### Get Exams
**Endpoint:** `GET /teacher/exams`

**Query Parameters:**
- `classId` (optional)
- `sectionId` (optional)
- `page` (optional): Default 1
- `limit` (optional): Default 20

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "examId",
      "name": "Mid-Term Examination",
      "description": "Mid-term exam for Class 10",
      "classId": { "_id": "classId", "name": "Class 10" },
      "subjectId": { "_id": "subjectId", "name": "Mathematics" },
      "examDate": "2024-03-25T00:00:00.000Z",
      "totalMarks": 100,
      "duration": "2 hours",
      "isActive": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalExams": 8
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:5000/api/v1/teacher/exams?classId=classId" \
  -H "Authorization: Bearer {token}"
```

---

### Get Results
**Endpoint:** `GET /teacher/results`

**Query Parameters:**
- `classId` (optional)
- `sectionId` (optional)
- `examId` (optional)
- `subjectId` (optional)
- `page` (optional): Default 1
- `limit` (optional): Default 50

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "resultId",
      "studentId": {
        "_id": "studentId",
        "admissionNumber": "ADM2023001",
        "firstName": "Alice",
        "lastName": "Johnson"
      },
      "examId": {
        "_id": "examId",
        "name": "Mid-Term Examination",
        "examDate": "2024-03-25T00:00:00.000Z"
      },
      "subjectId": { "_id": "subjectId", "name": "Mathematics" },
      "classId": { "_id": "classId", "name": "Class 10" },
      "sectionId": { "_id": "sectionId", "name": "Section A" },
      "marksObtained": 85,
      "maxMarks": 100,
      "grade": "A",
      "remarks": "Excellent performance",
      "enteredBy": "teacherId"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalResults": 45
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:5000/api/v1/teacher/results?examId=examId" \
  -H "Authorization: Bearer {token}"
```

---

### Add Results (Bulk)
**Endpoint:** `POST /teacher/results/add`

**Request Body:**
```json
{
  "examId": "examId",
  "subjectId": "subjectId",
  "classId": "classId",
  "sectionId": "sectionId",
  "results": [
    {
      "studentId": "studentId1",
      "marksObtained": 85,
      "maxMarks": 100,
      "grade": "A",
      "remarks": "Excellent performance"
    },
    {
      "studentId": "studentId2",
      "marksObtained": 72,
      "maxMarks": 100,
      "grade": "B+",
      "remarks": "Good performance"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Results added for 2 students",
  "data": [
    {
      "_id": "resultId",
      "studentId": "studentId1",
      "examId": "examId",
      "subjectId": "subjectId",
      "marksObtained": 85,
      "maxMarks": 100,
      "grade": "A",
      "remarks": "Excellent performance"
    }
  ]
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/v1/teacher/results/add \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "examId": "examId",
    "subjectId": "subjectId",
    "classId": "classId",
    "sectionId": "sectionId",
    "results": [
      {
        "studentId": "studentId1",
        "marksObtained": 85,
        "maxMarks": 100,
        "grade": "A",
        "remarks": "Excellent"
      }
    ]
  }'
```

---

### Update Result
**Endpoint:** `PUT /teacher/results/update`

**Request Body:**
```json
{
  "resultId": "resultId",
  "marksObtained": 88,
  "grade": "A+",
  "remarks": "Outstanding performance"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Result updated successfully",
  "data": {
    "_id": "resultId",
    "studentId": "studentId",
    "examId": "examId",
    "subjectId": "subjectId",
    "marksObtained": 88,
    "maxMarks": 100,
    "grade": "A+",
    "remarks": "Outstanding performance",
    "updatedBy": "teacherId"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/teacher/results/update \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "resultId": "resultId",
    "marksObtained": 88,
    "grade": "A+",
    "remarks": "Outstanding"
  }'
```

---

## 5. Dashboard

### Get Dashboard Statistics
**Endpoint:** `GET /teacher/dashboard`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalStudents": 45,
    "presentToday": 42,
    "absentToday": 2,
    "lateToday": 1,
    "pendingResults": 15,
    "totalExams": 8,
    "completedExams": 6,
    "totalAssignments": 12,
    "pendingAssignments": 3
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:5000/api/v1/teacher/dashboard \
  -H "Authorization: Bearer {token}"
```

---

## 📌 Important Notes

### Grades & Marking Scale
- **A/A+**: 90-100
- **B/B+**: 80-89
- **C/C+**: 70-79
- **D**: 60-69
- **F**: Below 60

### Date Format
- All dates use: **YYYY-MM-DD** (for requests) and ISO 8601 (for responses)

### Attendance Status
- **Present**: Student present
- **Absent**: Student absent
- **Late**: Student arrived late
- **Leave**: Student on approved leave

### Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Only teachers can access this resource"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Details about what went wrong"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔑 Quick Token Usage Example (JavaScript/Fetch)

```javascript
const token = "your_jwt_token_here";

// Get Teacher Profile
fetch('http://localhost:5000/api/v1/teacher/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Mark Attendance
fetch('http://localhost:5000/api/v1/teacher/attendance/mark', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    classId: "classId",
    sectionId: "sectionId",
    date: "2024-03-18",
    attendanceRecords: [
      {
        studentId: "studentId",
        status: "Present",
        remarks: "On time"
      }
    ]
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---

## 🔗 Additional Resources

- Full Documentation: `/docs/teacher-portal-api-documentation.md`
- Swagger UI: `http://localhost:5000/api-docs`

---

**Last Updated:** March 2026
**Version:** 1.0
