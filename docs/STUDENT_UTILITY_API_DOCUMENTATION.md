# Student Utility APIs - Complete Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer {JWT_TOKEN}
```

> **Note:** These endpoints are accessible only to users with `student` role.

---

## 1. Student Dashboard API

**Endpoint:** `GET /students/dashboard`

**Authorization:** Required (Student role only)

**Description:** Retrieves comprehensive dashboard data for a student including profile, enrollment details, attendance summary, upcoming exams, pending assignments, and recent announcements.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/students/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "_id": "64a5f8c3d4e9f2b8a1c2d3e4",
      "userId": "64a5f8c3d4e9f2b8a1c2d3e5",
      "currentEnrollment": {
        "_id": "64a5f8c3d4e9f2b8a1c2d3e6",
        "classId": {
          "_id": "64a5f8c3d4e9f2b8a1c2d3e7",
          "name": "Class 10-A"
        },
        "sectionId": {
          "_id": "64a5f8c3d4e9f2b8a1c2d3e8",
          "name": "Section A"
        }
      }
    },
    "attendanceSummary": {
      "totalDays": 200,
      "presentDays": 180,
      "absentDays": 20,
      "attendancePercentage": 90
    },
    "upcomingExams": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3e9",
        "subject": "Mathematics",
        "examDate": "2026-04-15T10:00:00Z",
        "totalMarks": 100
      }
    ],
    "pendingAssignments": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3ea",
        "title": "Math Assignment 5",
        "deadline": "2026-04-10T23:59:59Z",
        "subject": "Mathematics"
      }
    ],
    "recentAnnouncements": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3eb",
        "title": "Exam Schedule",
        "message": "Final exams will begin on April 15",
        "createdAt": "2026-04-07T14:00:00Z"
      }
    ]
  }
}
```

---

## 2. Student Attendance API

**Endpoint:** `GET /students/attendance`

**Authorization:** Required (Student role only)

**Description:** Retrieves attendance records for the logged-in student including daily attendance and monthly summary.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/students/attendance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentId": "64a5f8c3d4e9f2b8a1c2d3e5",
    "dailyAttendance": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3ec",
        "date": "2026-04-07",
        "status": "present",
        "subject": "Mathematics"
      },
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3ed",
        "date": "2026-04-06",
        "status": "absent",
        "subject": "English"
      }
    ],
    "monthlySummary": {
      "month": "April",
      "year": 2026,
      "totalDays": 20,
      "presentDays": 18,
      "absentDays": 2,
      "attendancePercentage": 90
    }
  }
}
```

---

## 3. Exam Results API

**Endpoint:** `GET /students/exam-results`

**Authorization:** Required (Student role only)

**Description:** Retrieves exam results for the student including subject-wise marks, total marks, grades, and result history.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/students/exam-results" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentId": "64a5f8c3d4e9f2b8a1c2d3e5",
    "results": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3ee",
        "subjectId": "64a5f8c3d4e9f2b8a1c2d3ef",
        "subject": "Mathematics",
        "marksObtained": 85,
        "totalMarks": 100,
        "percentage": 85,
        "grade": "A",
        "examDate": "2026-03-25T10:00:00Z"
      },
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3f0",
        "subjectId": "64a5f8c3d4e9f2b8a1c2d3f1",
        "subject": "English",
        "marksObtained": 78,
        "totalMarks": 100,
        "percentage": 78,
        "grade": "B+",
        "examDate": "2026-03-26T10:00:00Z"
      }
    ],
    "overallPerformance": {
      "totalMarks": 200,
      "marksObtained": 163,
      "averagePercentage": 81.5,
      "overallGrade": "A"
    }
  }
}
```

---

## 4. Fee Details API

**Endpoint:** `GET /students/fees`

**Authorization:** Required (Student role only)

**Description:** Retrieves fee information for the student including total fee, paid amount, pending dues, and installment details.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/students/fees" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentId": "64a5f8c3d4e9f2b8a1c2d3e5",
    "academicYear": "2025-2026",
    "totalFee": 50000,
    "paidAmount": 35000,
    "dueAmount": 15000,
    "feeStatus": "Pending",
    "installments": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3f2",
        "amount": 12500,
        "date": "2025-06-30",
        "status": "Paid"
      },
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3f3",
        "amount": 12500,
        "date": "2025-09-30",
        "status": "Paid"
      },
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3f4",
        "amount": 12500,
        "date": "2025-12-31",
        "status": "Paid"
      },
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3f5",
        "amount": 12500,
        "date": "2026-03-31",
        "status": "Pending"
      }
    ],
    "receipts": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3f6",
        "receiptNumber": "RCPT/2025/0001",
        "amount": 12500,
        "date": "2025-07-05",
        "downloadUrl": "/files/receipts/RCPT_2025_0001.pdf"
      }
    ]
  }
}
```

---

## 5. Study Materials API

**Endpoint:** `GET /students/study-materials`

**Authorization:** Required (Student role only)

**Description:** Retrieves study materials (documents, notes, etc.) uploaded by teachers for the student's class.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/students/study-materials" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "classId": "64a5f8c3d4e9f2b8a1c2d3e7",
    "materials": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3f7",
        "title": "Algebra Basics",
        "subject": "Mathematics",
        "description": "Comprehensive notes on algebraic expressions",
        "fileUrl": "/files/study-materials/algebra_basics.pdf",
        "fileType": "PDF",
        "fileSize": "2.5 MB",
        "uploadedBy": "Mr. Sharma",
        "uploadedDate": "2026-04-01T10:00:00Z"
      },
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3f8",
        "title": "English Literature - Poetry",
        "subject": "English",
        "description": "Selected poems and analysis",
        "fileUrl": "/files/study-materials/poetry_collection.pdf",
        "fileType": "PDF",
        "fileSize": "1.8 MB",
        "uploadedBy": "Mrs. Gupta",
        "uploadedDate": "2026-03-28T09:30:00Z"
      }
    ]
  }
}
```

---

## 6. Assignments API

**Endpoint:** `GET /students/assignments`

**Authorization:** Required (Student role only)

**Description:** Retrieves assignments for the student including pending, submitted assignments with deadlines and submission status.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/students/assignments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentId": "64a5f8c3d4e9f2b8a1c2d3e5",
    "pendingAssignments": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3f9",
        "title": "Quadratic Equations Problem Set",
        "subject": "Mathematics",
        "description": "Solve 20 problems in chapter 4",
        "deadline": "2026-04-10T23:59:59Z",
        "status": "pending",
        "submissionStatus": "Not Submitted",
        "daysRemaining": 3,
        "priority": "High"
      }
    ],
    "submittedAssignments": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3fa",
        "title": "Shakespeare Analysis",
        "subject": "English",
        "description": "Write an essay on Hamlet",
        "deadline": "2026-04-03T23:59:59Z",
        "status": "completed",
        "submissionStatus": "Submitted",
        "submittedDate": "2026-04-02T15:30:00Z",
        "score": 18,
        "totalScore": 20,
        "teacherFeedback": "Excellent analysis! Well structured essay."
      }
    ]
  }
}
```

---

## 7. Announcements API

**Endpoint:** `GET /students/announcements`

**Authorization:** Required (Student role only)

**Description:** Retrieves announcements targeted for the student including school-wide, class-specific, and role-targeted notices.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/students/announcements" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentId": "64a5f8c3d4e9f2b8a1c2d3e5",
    "announcements": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3fb",
        "title": "Summer Vacation Schedule",
        "message": "Summer vacations will start from May 15 and end on June 30",
        "type": "school",
        "priority": "High",
        "createdBy": "Principal",
        "createdAt": "2026-04-05T10:00:00Z",
        "targetAudience": ["All"],
        "isRead": false
      },
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3fc",
        "title": "Class Field Trip",
        "message": "Class 10-A field trip to Science Museum on April 20. Permission form required.",
        "type": "class",
        "priority": "Medium",
        "createdBy": "Class Teacher",
        "createdAt": "2026-04-04T14:15:00Z",
        "targetAudience": ["Class 10-A"],
        "isRead": false
      },
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d3fd",
        "title": "Exam Results Out",
        "message": "Your midterm exam results are now available. Check your portal.",
        "type": "student",
        "priority": "High",
        "createdBy": "Academic Head",
        "createdAt": "2026-04-03T16:45:00Z",
        "targetAudience": ["Students"],
        "isRead": true
      }
    ]
  }
}
```

---

## 8. Timetable API

**Endpoint:** `GET /students/timetable`

**Authorization:** Required (Student role only)

**Description:** Retrieves the student's class timetable including daily schedule and weekly schedule.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/students/timetable" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "classId": "64a5f8c3d4e9f2b8a1c2d3e7",
    "dailyTimetable": [
      {
        "day": "Monday",
        "periods": [
          {
            "_id": "64a5f8c3d4e9f2b8a1c2d3fe",
            "periodNumber": 1,
            "subject": "Mathematics",
            "teacher": "Mr. Sharma",
            "startTime": "09:00",
            "endTime": "10:00",
            "room": "102"
          },
          {
            "_id": "64a5f8c3d4e9f2b8a1c2d3ff",
            "periodNumber": 2,
            "subject": "English",
            "teacher": "Mrs. Gupta",
            "startTime": "10:00",
            "endTime": "11:00",
            "room": "105"
          },
          {
            "_id": "64a5f8c3d4e9f2b8a1c2d400",
            "periodNumber": 3,
            "subject": "Science",
            "teacher": "Dr. Patel",
            "startTime": "11:15",
            "endTime": "12:15",
            "room": "Lab A"
          }
        ]
      },
      {
        "day": "Tuesday",
        "periods": [
          {
            "_id": "64a5f8c3d4e9f2b8a1c2d401",
            "periodNumber": 1,
            "subject": "History",
            "teacher": "Mr. Verma",
            "startTime": "09:00",
            "endTime": "10:00",
            "room": "103"
          }
        ]
      }
    ],
    "weeklySchedule": "Monday to Friday, 9:00 AM to 3:30 PM"
  }
}
```

---

## 9. Certificates API

**Endpoint:** `GET /students/certificates`

**Authorization:** Required (Student role only)

**Description:** Retrieves available certificates for the student including academic certificates and achievement certificates with download information.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/students/certificates" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentId": "64a5f8c3d4e9f2b8a1c2d3e5",
    "certificates": [
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d402",
        "title": "Certificate of Excellence",
        "type": "Academic",
        "description": "Awarded for outstanding performance in Class 9",
        "issuedDate": "2025-03-30",
        "academicYear": "2024-2025",
        "fileUrl": "/files/certificates/Certificate_Excellence_2025.pdf",
        "downloadable": true,
        "status": "issued"
      },
      {
        "_id": "64a5f8c3d4e9f2b8a1c2d403",
        "title": "Sports Achievement Award",
        "type": "Achievement",
        "description": "Cricket champion - School tournament",
        "issuedDate": "2025-02-15",
        "academicYear": "2024-2025",
        "fileUrl": "/files/certificates/Sports_Award_Cricket_2025.pdf",
        "downloadable": true,
        "status": "issued"
      }
    ]
  }
}
```

---

## Error Responses

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access forbidden: You do not have the required role."
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token, authorization denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Student or resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## Additional Features

### Class Teacher Roll Number Assignment

**Endpoint:** `PATCH /class-teachers/enrollments/:enrollmentId/roll-number`

**Authorization:** Required (Teacher role only)

**Description:** Allows class teachers to assign or change roll numbers for student enrollments.

**Request Body:**
```json
{
  "rollNumber": "15"
}
```

**Request:**
```bash
curl -X PATCH "http://localhost:5000/api/v1/class-teachers/enrollments/64a5f8c3d4e9f2b8a1c2d3e6/roll-number" \
  -H "Authorization: Bearer TEACHER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rollNumber": "15"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Roll number updated successfully",
  "data": {
    "_id": "64a5f8c3d4e9f2b8a1c2d3e6",
    "studentId": "64a5f8c3d4e9f2b8a1c2d3e5",
    "classId": "64a5f8c3d4e9f2b8a1c2d3e7",
    "sectionId": "64a5f8c3d4e9f2b8a1c2d3e8",
    "academicYearId": "64a5f8c3d4e9f2b8a1c2d3e9",
    "rollNumber": "15"
  }
}
```

---

## Important Notes

1. **Authentication:** All student endpoints require a valid JWT token with `student` role.
2. **Data Privacy:** Students can only access their own data. The API enforces this using `req.user.userId`.
3. **Role-based Filtering:** All endpoints apply role-based filtering to ensure data security.
4. **Pagination:** Some endpoints may support pagination. Check the response structure.
5. **Rate Limiting:** Implement appropriate rate limiting on the frontend.

---

## Testing with Postman

1. Import the endpoints into Postman
2. Set the JWT token in Authorization header: `Bearer {token}`
3. Test each endpoint with appropriate role (student)
4. Verify response structure and error handling

---

**Last Updated:** April 7, 2026
**API Version:** v1
