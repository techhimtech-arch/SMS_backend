# Teacher Portal API Documentation

## Overview
This document covers all APIs available for teachers to manage exams, attendance, results, and view their assignments.

## Base URL
```
https://sms-backend-d19v.onrender.com/api/v1/teacher
```

## Authentication
All APIs require Bearer token authentication in Authorization header:
```
Authorization: Bearer <teacher_token>
```

---

## 1. Teacher Profile & Assignments

### 1.1 Get Teacher Profile
**GET** `/profile`

**Description:** Get teacher profile with subject and class assignments

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher": {
      "_id": "teacher_id",
      "name": "Teacher Name",
      "email": "teacher@school.com",
      "role": "teacher",
      "phone": "1234567890",
      "address": "Teacher Address",
      "qualification": "M.Ed",
      "experience": "5 years"
    },
    "subjectAssignments": [
      {
        "_id": "assignment_id",
        "teacherId": "teacher_id",
        "classId": {
          "_id": "class_id",
          "name": "Class 10"
        },
        "sectionId": {
          "_id": "section_id", 
          "name": "Section A"
        },
        "subjectId": {
          "_id": "subject_id",
          "name": "Mathematics"
        }
      }
    ],
    "classTeacherAssignment": {
      "_id": "class_teacher_assignment_id",
      "teacherId": "teacher_id",
      "classId": {
        "_id": "class_id",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "section_id",
        "name": "Section A"
      }
    }
  }
}
```

### 1.2 Get Assigned Classes
**GET** `/classes?page=1&limit=10`

**Description:** Get classes assigned to teacher

**Response:**
```json
{
  "success": true,
  "data": {
    "subjectAssignments": [...],
    "classTeacherAssignment": {...}
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 2
  }
}
```

### 1.3 Get Assigned Students
**GET** `/students?classId=<class_id>&sectionId=<section_id>&page=1&limit=50`

**Description:** Get students from assigned classes

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "student_id",
      "admissionNumber": "ADM001",
      "firstName": "John",
      "lastName": "Doe",
      "gender": "Male",
      "dateOfBirth": "2005-05-15",
      "email": "student@school.com",
      "phone": "1234567890",
      "parentUserId": "parent_id",
      "classId": {
        "_id": "class_id",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "section_id",
        "name": "Section A"
      },
      "rollNumber": "15",
      "enrollmentId": "enrollment_id"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalStudents": 75
  }
}
```

---

## 2. Attendance Management

### 2.1 Get Attendance Records
**GET** `/attendance?classId=<class_id>&sectionId=<section_id>&startDate=2026-04-01&endDate=2026-04-30&page=1&limit=50`

**Description:** Get attendance records for assigned students

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "attendance_id",
      "studentId": {
        "_id": "student_id",
        "admissionNumber": "ADM001",
        "firstName": "John",
        "lastName": "Doe"
      },
      "classId": {
        "_id": "class_id",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "section_id",
        "name": "Section A"
      },
      "date": "2026-04-15T00:00:00.000Z",
      "status": "Present",
      "remarks": "",
      "markedBy": "teacher_id"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 125
  }
}
```

### 2.2 Mark Attendance
**POST** `/attendance/mark`

**Description:** Mark attendance for students in a class

**Request Body:**
```json
{
  "classId": "69b52ba2e396b541958064d9",
  "sectionId": "69b52bcce396b541958064e4",
  "date": "2026-04-16",
  "attendanceRecords": [
    {
      "studentId": "69d48f6f8345864e85b1739d",
      "status": "Present",
      "remarks": ""
    },
    {
      "studentId": "69d48f6f8345864e85b1739e",
      "status": "Absent",
      "remarks": "Sick"
    }
  ]
}
```

**Status Options:** `Present`, `Absent`, `Late`, `Half Day`, `Leave`

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked for 25 students",
  "data": [
    {
      "_id": "attendance_id",
      "enrollmentId": "enrollment_id",
      "studentId": "student_id",
      "classId": "class_id",
      "sectionId": "section_id",
      "academicYearId": "academic_year_id",
      "date": "2026-04-16T00:00:00.000Z",
      "status": "Present",
      "remarks": "",
      "markedBy": "teacher_id",
      "schoolId": "school_id"
    }
  ]
}
```

### 2.3 Update Attendance
**PUT** `/attendance/update`

**Description:** Update an existing attendance record

**Request Body:**
```json
{
  "attendanceId": "attendance_id",
  "status": "Present",
  "remarks": "Updated remark"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "_id": "attendance_id",
    "status": "Present",
    "remarks": "Updated remark"
  }
}
```

---

## 3. Exam Management

### 3.1 Get Exams
**GET** `/exams?classId=<class_id>&sectionId=<section_id>&page=1&limit=20`

**Description:** Get exams for assigned classes

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "exam_id",
      "title": "Mid-Term Examination",
      "description": "Mid-term exams for all subjects",
      "examDate": "2026-04-20T00:00:00.000Z",
      "duration": "2 hours",
      "maxMarks": 100,
      "classId": {
        "_id": "class_id",
        "name": "Class 10"
      },
      "subjectId": {
        "_id": "subject_id",
        "name": "Mathematics"
      },
      "isActive": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalExams": 25
  }
}
```

### 3.2 Create Exam (Not Available)
**Note:** Currently, there is no API for teachers to create exams. Teachers can only view exams created by administrators.

---

## 4. Results Management

### 4.1 Get Results
**GET** `/results?classId=<class_id>&sectionId=<section_id>&examId=<exam_id>&subjectId=<subject_id>&page=1&limit=50`

**Description:** Get results for assigned students

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "result_id",
      "studentId": {
        "_id": "student_id",
        "admissionNumber": "ADM001",
        "firstName": "John",
        "lastName": "Doe"
      },
      "examId": {
        "_id": "exam_id",
        "name": "Mid-Term Examination",
        "examDate": "2026-04-20T00:00:00.000Z"
      },
      "subjectId": {
        "_id": "subject_id",
        "name": "Mathematics"
      },
      "classId": {
        "_id": "class_id",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "section_id",
        "name": "Section A"
      },
      "marksObtained": 85,
      "maxMarks": 100,
      "grade": "A",
      "remarks": "Good performance",
      "enteredBy": "teacher_id"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalResults": 50
  }
}
```

### 4.2 Add Results
**POST** `/results/add`

**Description:** Add exam results for students

**Request Body:**
```json
{
  "examId": "exam_id",
  "subjectId": "subject_id", 
  "classId": "class_id",
  "sectionId": "section_id",
  "results": [
    {
      "studentId": "student_id_1",
      "marksObtained": 85,
      "maxMarks": 100,
      "grade": "A",
      "remarks": "Good performance"
    },
    {
      "studentId": "student_id_2",
      "marksObtained": 72,
      "maxMarks": 100,
      "grade": "B",
      "remarks": "Needs improvement"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Results added for 25 students",
  "data": [
    {
      "_id": "result_id",
      "studentId": "student_id",
      "examId": "exam_id",
      "subjectId": "subject_id",
      "classId": "class_id",
      "sectionId": "section_id",
      "marksObtained": 85,
      "maxMarks": 100,
      "grade": "A",
      "remarks": "Good performance",
      "enteredBy": "teacher_id",
      "schoolId": "school_id"
    }
  ]
}
```

### 4.3 Update Result
**PUT** `/results/update`

**Description:** Update an existing result record

**Request Body:**
```json
{
  "resultId": "result_id",
  "marksObtained": 88,
  "maxMarks": 100,
  "grade": "A+",
  "remarks": "Excellent performance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Result updated successfully",
  "data": {
    "_id": "result_id",
    "marksObtained": 88,
    "maxMarks": 100,
    "grade": "A+",
    "remarks": "Excellent performance",
    "updatedBy": "teacher_id"
  }
}
```

---

## 5. Dashboard Statistics

### 5.1 Get Dashboard Stats
**GET** `/dashboard`

**Description:** Get teacher dashboard statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 75,
    "todayAttendance": 68,
    "pendingResults": 12,
    "totalExams": 8,
    "totalAssignments": 5
  }
}
```

---

## Important Notes

### Permissions & Access Control
- Teachers can only access data for classes/subjects assigned to them
- All APIs validate teacher assignments before processing requests
- Teachers cannot delete exams or results (only create/update)

### Error Responses
All APIs return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info (if available)"
}
```

### Common Error Codes
- **400**: Bad Request (missing/invalid data)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (no access to requested resource)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

### Date Formats
- Use ISO format: `YYYY-MM-DD` for dates
- DateTime fields use ISO 8601 format in responses

### File Uploads
- Currently, there are no file upload APIs for teachers
- All data is sent as JSON in request body

---

## Teacher Workflow Example

### Complete Workflow for Conducting an Exam:

1. **View Assigned Classes**: `GET /classes`
2. **View Students**: `GET /students?classId=<id>&sectionId=<id>`
3. **View Exams**: `GET /exams?classId=<id>&sectionId=<id>`
4. **Mark Attendance**: `POST /attendance/mark`
5. **Add Results**: `POST /results/add`

### What Teachers CAN Do:
- ✅ View their profile and assignments
- ✅ View students in assigned classes
- ✅ Mark daily attendance
- ✅ Update existing attendance records
- ✅ View exams for their classes
- ✅ Add exam results
- ✅ Update existing results
- ✅ View dashboard statistics

### What Teachers CANNOT Do:
- ❌ Create new exams
- ❌ Delete exams or results
- ❌ Access other classes/sections not assigned to them
- ❌ Modify other teachers' data

This documentation covers all available APIs for teachers to manage their daily tasks effectively.
