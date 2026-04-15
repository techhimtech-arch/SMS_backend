# School Management System - API Documentation

## Admin Dashboard APIs

### 1. Dashboard Statistics
```
GET /api/v1/dashboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalStudents": 0,
      "totalTeachers": 12,
      "totalClasses": 3,
      "totalSections": 3
    },
    "attendance": {
      "totalMarked": 6,
      "presentCount": 6,
      "absentCount": 0,
      "attendancePercentage": 100
    },
    "exams": {
      "totalExams": 1,
      "totalResultsEntered": 0
    },
    "fees": {
      "totalFeesCollected": 0,
      "totalPendingFees": 0
    },
    "dateRange": {
      "startDate": "2026-04-15",
      "endDate": "2026-04-15",
      "isCustomRange": false
    }
  }
}
```

### 2. Recent Activities Feed
```
GET /api/v1/dashboard/recent-activities?limit=10
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "student_registration",
      "title": "New Student Registered",
      "description": "John Doe registered in Class 10A",
      "timestamp": "2026-04-15T10:30:00.000Z",
      "data": {
        "name": "John Doe",
        "email": "john@example.com",
        "classId": {
          "name": "Class 10A"
        }
      }
    },
    {
      "type": "fee_payment",
      "title": "Fee Payment Received",
      "description": "Jane Smith paid Rs. 5000",
      "timestamp": "2026-04-15T09:15:00.000Z",
      "data": {
        "amount": 5000,
        "status": "Completed",
        "studentId": {
          "name": "Jane Smith"
        }
      }
    },
    {
      "type": "exam_result",
      "title": "Exam Result Added",
      "description": "Mike Wilson scored 85/100 in Mathematics Final",
      "timestamp": "2026-04-15T08:45:00.000Z",
      "data": {
        "marksObtained": 85,
        "maxMarks": 100,
        "grade": "A",
        "examId": {
          "name": "Mathematics Final"
        },
        "studentId": {
          "name": "Mike Wilson"
        }
      }
    },
    {
      "type": "announcement",
      "title": "School Holiday Notice",
      "description": "School will remain closed on Monday due to maintenance work...",
      "timestamp": "2026-04-14T16:30:00.000Z",
      "data": {
        "title": "School Holiday Notice",
        "status": "PUBLISHED"
      }
    }
  ]
}
```

### 3. Attendance Analytics
```
GET /api/v1/dashboard/attendance-analytics?months=6
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyTrends": [
      {
        "month": "2025-11",
        "totalStudents": 1200,
        "presentStudents": 1150,
        "absentStudents": 50,
        "attendancePercentage": 95.83
      },
      {
        "month": "2025-12",
        "totalStudents": 1180,
        "presentStudents": 1120,
        "absentStudents": 60,
        "attendancePercentage": 94.92
      },
      {
        "month": "2026-01",
        "totalStudents": 1220,
        "presentStudents": 1180,
        "absentStudents": 40,
        "attendancePercentage": 96.72
      }
    ],
    "classWiseTrends": [
      {
        "className": "Class 10A",
        "attendancePercentage": 98.5
      },
      {
        "className": "Class 9B",
        "attendancePercentage": 96.2
      },
      {
        "className": "Class 8A",
        "attendancePercentage": 94.8
      }
    ],
    "period": {
      "startDate": "2025-10-15",
      "endDate": "2026-04-15",
      "months": 6
    }
  }
}
```

### 4. Fee Analytics
```
GET /api/v1/dashboard/fee-analytics?months=6
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyTrends": [
      {
        "month": "2025-11",
        "totalCollected": 250000,
        "paymentCount": 45
      },
      {
        "month": "2025-12",
        "totalCollected": 320000,
        "paymentCount": 58
      },
      {
        "month": "2026-01",
        "totalCollected": 280000,
        "paymentCount": 52
      }
    ],
    "pendingFeesByClass": [
      {
        "className": "Class 10A",
        "totalPending": 45000,
        "studentCount": 8
      },
      {
        "className": "Class 9B",
        "totalPending": 32000,
        "studentCount": 6
      },
      {
        "className": "Class 8A",
        "totalPending": 28000,
        "studentCount": 5
      }
    ],
    "paymentMethods": [
      {
        "paymentMethod": "Online",
        "totalAmount": 450000,
        "count": 120,
        "percentage": 65.0
      },
      {
        "paymentMethod": "Cash",
        "totalAmount": 180000,
        "count": 45,
        "percentage": 25.0
      },
      {
        "paymentMethod": "Cheque",
        "totalAmount": 70000,
        "count": 15,
        "percentage": 10.0
      }
    ],
    "period": {
      "startDate": "2025-10-15",
      "endDate": "2026-04-15",
      "months": 6
    }
  }
}
```

### 5. Academic Summary (For Graphs)
```
GET /api/v1/academic/summary?academicSessionId={sessionId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalClasses": 3,
      "totalSections": 3,
      "totalSubjects": 15,
      "totalEnrollments": 45,
      "totalTeachers": 12,
      "enrollmentStatusBreakdown": {
        "active": 40,
        "inactive": 5
      }
    },
    "classWiseStats": [
      {
        "className": "Class 10",
        "totalStudents": 20,
        "maleStudents": 12,
        "femaleStudents": 8
      }
    ],
    "subjectDistribution": {
      "SCIENCE": 5,
      "COMMERCE": 4,
      "ARTS": 3,
      "OTHER": 3
    },
    "topTeachers": [
      {
        "teacherName": "John Doe",
        "studentCount": 25
      }
    ],
    "sessionInfo": {
      "name": "2025-2026",
      "startDate": "2025-04-01",
      "endDate": "2026-03-31"
    }
  }
}
```

### 6. Class Statistics
```
GET /api/v1/academic/class-stats/{classId}?academicSessionId={sessionId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Class 10",
    "totalSections": 2,
    "totalSubjects": 8,
    "totalEnrollments": 20,
    "maleStudents": 12,
    "femaleStudents": 8
  }
}
```

### 7. Enrollment Trends (For Line Charts)
```
GET /api/v1/academic/enrollment-trends?academicSessionId={sessionId}&years=3
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "year": 2023,
      "totalEnrollments": 35,
      "newEnrollments": 35,
      "promotedStudents": 30,
      "droppedStudents": 2
    },
    {
      "year": 2024,
      "totalEnrollments": 40,
      "newEnrollments": 10,
      "promotedStudents": 32,
      "droppedStudents": 5
    },
    {
      "year": 2025,
      "totalEnrollments": 45,
      "newEnrollments": 15,
      "promotedStudents": 35,
      "droppedStudents": 3
    }
  ]
}
```

## Required Headers
```
Content-Type: application/json
Authorization: Bearer {your_jwt_token}
```

## Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Usage Examples

### Get Academic Session ID First
```
GET /api/v1/academic-years
Authorization: Bearer {token}
```

### Then Use It in Dashboard APIs
```
GET /api/v1/academic/summary?academicSessionId=69b6cf719e43af3e24d5352c
Authorization: Bearer {token}
```

## Graph Data Mapping

### For Pie Charts:
- Use `subjectDistribution` from Academic Summary API
- Use `paymentMethods` from Fee Analytics API

### For Bar Charts:
- Use `classWiseStats` from Academic Summary API
- Use `topTeachers` from Academic Summary API
- Use `classWiseTrends` from Attendance Analytics API
- Use `pendingFeesByClass` from Fee Analytics API

### For Line Charts:
- Use `enrollment-trends` API for multi-year data
- Use `monthlyTrends` from Attendance Analytics API
- Use `monthlyTrends` from Fee Analytics API

### For Activity Feed:
- Use `recent-activities` API for timeline display

### For Overview Cards:
- Use basic `/api/v1/dashboard` API for current stats

## Query Parameters

### Recent Activities:
- `limit`: Number of activities to return (default: 10, max: 50)

### Attendance Analytics:
- `months`: Number of months to analyze (default: 6, max: 12)

### Fee Analytics:
- `months`: Number of months to analyze (default: 6, max: 12)

### Academic Summary:
- `academicSessionId`: Required academic session ID

### Enrollment Trends:
- `academicSessionId`: Required current academic session ID
- `years`: Number of years to analyze (default: 3, max: 10)
