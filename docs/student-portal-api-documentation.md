# Student Portal API Documentation

## Overview
This document provides complete API documentation for the Student Portal module of the School Management System. Students can access their profile, view attendance, check fee status, view exam results, and stay updated with announcements.

## Base URL
```
http://your-server-url/api/v1
```

## Authentication
All student portal endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer {accessToken}
```

---

## 1. Student Profile Management

### 1.1 Get Student Profile
**Endpoint:** `GET /student/profile`

**Description:** Get student profile with user and academic information.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Alice Johnson",
      "email": "alice.johnson@school.com",
      "role": "student",
      "phone": "+1234567890"
    },
    "profile": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "admissionNumber": "ADM2023001",
      "firstName": "Alice",
      "lastName": "Johnson",
      "gender": "Female",
      "dateOfBirth": "2008-05-15T00:00:00.000Z",
      "address": "123 Student St, City",
      "bloodGroup": "O+",
      "emergencyContact": "+1234567891",
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Section A"
      },
      "parentUserId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
        "name": "John Johnson",
        "email": "john.johnson@email.com"
      },
      "admissionDate": "2023-04-01T00:00:00.000Z",
      "isActive": true
    }
  }
}
```

### 1.2 Update Student Profile
**Endpoint:** `PUT /student/profile`

**Description:** Update student profile information.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "firstName": "Alice Marie",
  "lastName": "Johnson",
  "address": "456 New Address, City",
  "bloodGroup": "O+",
  "emergencyContact": "+1234567892",
  "phone": "+1234567890"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "admissionNumber": "ADM2023001",
    "firstName": "Alice Marie",
    "lastName": "Johnson",
    "gender": "Female",
    "dateOfBirth": "2008-05-15T00:00:00.000Z",
    "address": "456 New Address, City",
    "bloodGroup": "O+",
    "emergencyContact": "+1234567892",
    "classId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Class 10"
    },
    "sectionId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": "Section A"
    },
    "parentUserId": "64f8a1b2c3d4e5f6a7b8c9d4",
    "admissionDate": "2023-04-01T00:00:00.000Z",
    "isActive": true
  }
}
```

---

## 2. Attendance Management

### 2.1 Get Attendance Records
**Endpoint:** `GET /student/attendance`

**Description:** Get student's attendance records with statistics.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
        "studentId": "64f8a1b2c3d4e5f6a7b8c9d1",
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
        "remarks": "On time"
      },
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
        "studentId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "classId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "Class 10"
        },
        "sectionId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
          "name": "Section A"
        },
        "date": "2024-03-17T00:00:00.000Z",
        "status": "Absent",
        "remarks": "Sick leave"
      }
    ],
    "statistics": {
      "totalDays": 20,
      "present": 18,
      "absent": 1,
      "late": 1,
      "halfDay": 0,
      "leave": 0,
      "percentage": 90.00
    }
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalRecords": 20
  }
}
```

---

## 3. Fee Management

### 3.1 Get Fee Details
**Endpoint:** `GET /student/fees`

**Description:** Get student's fee structure and payment history.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "admissionNumber": "ADM2023001",
      "firstName": "Alice",
      "lastName": "Johnson",
      "class": "Class 10",
      "section": "Section A"
    },
    "feeStructure": {
      "totalAmount": 50000,
      "paidAmount": 25000,
      "balanceAmount": 25000,
      "dueDate": "2024-04-15T00:00:00.000Z",
      "academicYear": "2023-2024"
    },
    "paymentHistory": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "studentId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "amount": 25000,
        "paymentDate": "2024-01-10T00:00:00.000Z",
        "paymentMethod": "Online",
        "transactionId": "TXN123456789",
        "status": "Completed",
        "createdAt": "2024-01-10T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 4. Exam Results

### 4.1 Get Exam Results
**Endpoint:** `GET /student/results`

**Description:** Get student's exam results with statistics.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `examId` (optional): Filter by exam ID
- `subjectId` (optional): Filter by subject ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
        "studentId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "examId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
          "name": "Mid-Term Examination",
          "examDate": "2024-03-01T00:00:00.000Z",
          "totalMarks": 100
        },
        "subjectId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9da",
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
        "remarks": "Excellent performance"
      }
    ],
    "statistics": {
      "totalMarksObtained": 425,
      "totalMaxMarks": 500,
      "overallPercentage": 85.00,
      "overallGrade": "A",
      "totalExams": 5,
      "subjectWiseStats": [
        {
          "subject": "Mathematics",
          "averagePercentage": 85.00,
          "totalExams": 2
        },
        {
          "subject": "Science",
          "averagePercentage": 82.50,
          "totalExams": 2
        }
      ]
    }
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalRecords": 5
  }
}
```

---

## 5. Exam Schedule

### 5.1 Get Exams
**Endpoint:** `GET /student/exams`

**Description:** Get upcoming and recent exams for the student.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (optional): Filter by status (`upcoming` or `completed`, default: `upcoming`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9db",
      "name": "Final Examination",
      "description": "Annual final examination",
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Class 10"
      },
      "subjectId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9dc",
        "name": "Physics"
      },
      "examDate": "2024-03-25T00:00:00.000Z",
      "totalMarks": 100,
      "duration": "3 hours",
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

---

## 6. Announcements

### 6.1 Get Announcements
**Endpoint:** `GET /student/announcements`

**Description:** Get announcements relevant to the student.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9dd",
      "title": "Annual Day Celebration",
      "content": "The school will celebrate its annual day on March 30th. All students are requested to participate.",
      "type": "Event",
      "priority": "High",
      "targetAudience": "all_students",
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9de",
        "name": "Admin User"
      },
      "isPinned": true,
      "isActive": true,
      "createdAt": "2024-03-18T10:00:00.000Z",
      "expiryDate": "2024-03-30T23:59:59.000Z"
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9df",
      "title": "Mathematics Test Postponed",
      "content": "Tomorrow's mathematics test has been postponed to next week due to unavoidable circumstances.",
      "type": "Academic",
      "priority": "Medium",
      "targetAudience": "specific_classes",
      "targetClasses": ["64f8a1b2c3d4e5f6a7b8c9d2"],
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9e0",
        "name": "Math Teacher"
      },
      "isPinned": false,
      "isActive": true,
      "createdAt": "2024-03-17T15:30:00.000Z",
      "expiryDate": "2024-03-24T23:59:59.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalAnnouncements": 2
  }
}
```

---

## 7. Dashboard

### 7.1 Get Dashboard Statistics
**Endpoint:** `GET /student/dashboard`

**Description:** Get student dashboard with comprehensive statistics.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Alice Johnson",
      "class": "Class 10",
      "section": "Section A",
      "admissionNumber": "ADM2023001"
    },
    "attendance": {
      "totalDays": 22,
      "present": 20,
      "absent": 1,
      "late": 1,
      "percentage": 90.91
    },
    "fees": {
      "totalAmount": 50000,
      "paidAmount": 25000,
      "balanceAmount": 25000,
      "dueDate": "2024-04-15T00:00:00.000Z"
    },
    "recentResults": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
        "examId": {
          "name": "Mid-Term Examination"
        },
        "subjectId": {
          "name": "Mathematics"
        },
        "marksObtained": 85,
        "maxMarks": 100,
        "grade": "A"
      }
    ],
    "upcomingExams": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9db",
        "name": "Final Examination",
        "subjectId": {
          "name": "Physics"
        },
        "examDate": "2024-03-25T00:00:00.000Z",
        "totalMarks": 100
      }
    ],
    "unreadAnnouncements": 3
  }
}
```

---

## 8. Error Response Format

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
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## 9. Rate Limiting

- **All endpoints**: 100 requests per 15 minutes

Rate limit headers are included in responses:
- `RateLimit-Limit`: Total requests allowed
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## 10. Security Features

### 10.1 Role-Based Access Control
- Only users with `student` role can access these endpoints
- Students can only access their own data
- No cross-student data access is permitted

### 10.2 Data Privacy
- Student profiles are protected and only accessible by the student
- Attendance and results are filtered by student ID
- Fee information is restricted to the student's own records

### 10.3 Input Validation
- All input data is validated before processing
- Date ranges are validated to prevent data leakage
- Query parameters are sanitized to prevent injection attacks

---

## 11. Implementation Flow

### 11.1 Student Login Flow
1. Student submits credentials to `POST /auth/login`
2. Server validates credentials and returns tokens
3. Frontend stores tokens and redirects to student dashboard

### 11.2 Dashboard Loading
1. Get dashboard statistics: `GET /student/dashboard`
2. Display key metrics (attendance, fees, results, announcements)
3. Load detailed data as needed

### 11.3 Navigation Flow
1. Profile: `GET /student/profile`, `PUT /student/profile`
2. Attendance: `GET /student/attendance`
3. Fees: `GET /student/fees`
4. Results: `GET /student/results`
5. Exams: `GET /student/exams`
6. Announcements: `GET /student/announcements`

---

## 12. Testing Examples

### 12.1 Get Profile Test
```bash
curl -X GET http://localhost:5000/api/v1/student/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 12.2 Get Dashboard Test
```bash
curl -X GET http://localhost:5000/api/v1/student/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 12.3 Update Profile Test
```bash
curl -X PUT http://localhost:5000/api/v1/student/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice Marie",
    "lastName": "Johnson",
    "address": "456 New Address, City",
    "phone": "+1234567890"
  }'
```

### 12.4 Get Attendance Test
```bash
curl -X GET "http://localhost:5000/api/v1/student/attendance?startDate=2024-03-01&endDate=2024-03-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 12.5 Get Results Test
```bash
curl -X GET http://localhost:5000/api/v1/student/results \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 13. Frontend Integration Tips

### 13.1 Authentication
- Store access token securely (preferably in HTTP-only cookies)
- Implement automatic token refresh
- Handle 401 responses by redirecting to login page

### 13.2 Data Management
- Cache dashboard data for better performance
- Implement pagination for large datasets
- Use optimistic updates for profile changes

### 13.3 User Experience
- Show loading states during API calls
- Display attendance percentage with visual indicators
- Use color coding for grades and fee status
- Implement push notifications for new announcements

### 13.4 Mobile Optimization
- Ensure responsive design for mobile devices
- Optimize API calls for slower connections
- Implement offline viewing for cached data

### 13.5 Error Handling
- Display user-friendly error messages
- Implement retry mechanisms for failed requests
- Provide feedback for successful operations

---

## 14. Performance Optimization

### 14.1 Caching Strategy
- Cache static profile information
- Store attendance statistics locally
- Implement result caching with invalidation

### 14.2 API Optimization
- Use selective field loading for mobile
- Implement compression for large responses
- Optimize database queries for better performance

### 14.3 Frontend Optimization
- Implement lazy loading for historical data
- Use virtual scrolling for large lists
- Optimize image and asset loading

---

## 15. Support

For API support or issues:
- Check the server logs for detailed error information
- Verify token validity and student status
- Ensure student profile is complete and active
- Contact development team for backend issues

---

*Last Updated: March 2024*
