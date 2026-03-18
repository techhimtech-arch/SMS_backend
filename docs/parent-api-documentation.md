# Parent Portal API Documentation

## Overview
This document provides complete API documentation for the Parent Portal module of the School Management System. Parents can access their linked student's information including attendance, fees, and exam results.

## Base URL
```
http://your-server-url/api/v1
```

## Authentication
All parent portal endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer {accessToken}
```

---

## 1. Authentication Endpoints

### 1.1 Parent Login
**Endpoint:** `POST /auth/login`

**Description:** Authenticate parent with email and password.

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "parent@example.com",
      "role": "parent",
      "schoolId": "64f8a1b2c3d4e5f6a7b8c9d1"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid credentials
- `500 Internal Server Error`: Server error

### 1.2 Refresh Token
**Endpoint:** `POST /auth/refresh-token`

**Description:** Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.3 Logout
**Endpoint:** `POST /auth/logout`

**Description:** Logout user and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Parent Portal Endpoints

### 2.1 Get Parent Profile
**Endpoint:** `GET /parent/profile`

**Description:** Get parent profile information along with linked student details.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "parent": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "parent@example.com",
      "role": "parent"
    },
    "student": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "admissionNumber": "ADM2023001",
      "firstName": "Jane",
      "lastName": "Doe",
      "gender": "Female",
      "dateOfBirth": "2015-03-15T00:00:00.000Z",
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Class 5"
      },
      "sectionId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
        "name": "Section A"
      }
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Parent not found
- `401 Unauthorized`: Invalid or missing token

### 2.2 Get Student Attendance
**Endpoint:** `GET /parent/attendance`

**Description:** Get attendance records for the linked student.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (optional): Filter attendance from this date (YYYY-MM-DD format)
- `endDate` (optional): Filter attendance until this date (YYYY-MM-DD format)

**Example Request:**
```
GET /parent/attendance?startDate=2024-01-01&endDate=2024-01-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "attendance": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
        "studentId": "64f8a1b2c3d4e5f6a7b8c9d2",
        "date": "2024-01-15T00:00:00.000Z",
        "status": "Present",
        "remarks": "On time"
      },
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
        "studentId": "64f8a1b2c3d4e5f6a7b8c9d2",
        "date": "2024-01-16T00:00:00.000Z",
        "status": "Absent",
        "remarks": "Sick leave"
      }
    ]
  }
}
```

**Error Responses:**
- `404 Not Found`: No linked student found
- `401 Unauthorized`: Invalid or missing token

### 2.3 Get Student Fee Details
**Endpoint:** `GET /parent/fees`

**Description:** Get fee details and payment history for the linked student.

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
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "totalAmount": 50000,
    "paidAmount": 25000,
    "balanceAmount": 25000,
    "paymentHistory": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "studentId": "64f8a1b2c3d4e5f6a7b8c9d2",
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

**Error Responses:**
- `404 Not Found`: No linked student found
- `401 Unauthorized`: Invalid or missing token

### 2.4 Get Student Exam Results
**Endpoint:** `GET /parent/results`

**Description:** Get exam results for the linked student.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `examId` (optional): Filter results by specific exam ID

**Example Request:**
```
GET /parent/results?examId=64f8a1b2c3d4e5f6a7b8c9d8
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "subjectWiseMarks": [
      {
        "subject": "Mathematics",
        "marksObtained": 85,
        "maxMarks": 100,
        "grade": "A",
        "remarks": "Excellent performance"
      },
      {
        "subject": "Science",
        "marksObtained": 78,
        "maxMarks": 100,
        "grade": "B+",
        "remarks": "Good performance"
      },
      {
        "subject": "English",
        "marksObtained": 92,
        "maxMarks": 100,
        "grade": "A+",
        "remarks": "Outstanding performance"
      }
    ],
    "total": {
      "marksObtained": 255,
      "maxMarks": 300,
      "percentage": "85.00"
    },
    "grade": "A"
  }
}
```

**Error Responses:**
- `404 Not Found`: No linked student found
- `401 Unauthorized`: Invalid or missing token

---

## 3. Error Response Format

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

## 4. Rate Limiting

- **Authentication endpoints**: 10 requests per 15 minutes
- **All other endpoints**: 100 requests per 15 minutes

Rate limit headers are included in responses:
- `RateLimit-Limit`: Total requests allowed
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## 5. Security Features

### 5.1 CORS Configuration
- Requests from allowed origins only
- Credentials supported for authentication
- Preflight requests cached for 24 hours

### 5.2 Security Headers
- Helmet.js for security HTTP headers
- Content Security Policy configured
- Cross-origin resource policy set to cross-origin

### 5.3 Request Validation
- Request body size limited to 10KB
- Input validation on all endpoints
- SQL injection protection via Mongoose

---

## 6. Implementation Flow

### 6.1 Login Flow
1. Parent submits credentials to `POST /auth/login`
2. Server validates credentials and returns tokens
3. Frontend stores access token (short-lived) and refresh token (long-lived)
4. Use access token for all subsequent API calls

### 6.2 Token Refresh Flow
1. When access token expires, call `POST /auth/refresh-token`
2. Server validates refresh token and issues new tokens
3. Update stored tokens and continue with new access token

### 6.3 Data Fetching Flow
1. After login, call `GET /parent/profile` to get basic info
2. Use the response to determine if student is linked
3. Fetch attendance, fees, and results as needed
4. Handle 404 errors if no student is linked

---

## 7. Testing Examples

### 7.1 Login Test
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "password123"
  }'
```

### 7.2 Get Profile Test
```bash
curl -X GET http://localhost:5000/api/v1/parent/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7.3 Get Attendance Test
```bash
curl -X GET "http://localhost:5000/api/v1/parent/attendance?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 8. Frontend Integration Tips

### 8.1 Token Storage
- Store access token in memory or secure HTTP-only cookie
- Store refresh token securely (HTTP-only cookie recommended)
- Implement automatic token refresh mechanism

### 8.2 Error Handling
- Handle 401 responses by refreshing tokens
- Redirect to login on authentication failures
- Show user-friendly error messages

### 8.3 Loading States
- Show loading indicators while fetching data
- Implement skeleton screens for better UX
- Cache frequently accessed data appropriately

### 8.4 Security Best Practices
- Never store tokens in localStorage
- Use HTTPS in production
- Implement request cancellation for pending requests
- Validate data types on frontend

---

## 9. Support

For API support or issues:
- Check the server logs for detailed error information
- Verify token validity and expiration
- Ensure proper CORS configuration
- Contact development team for backend issues

---

*Last Updated: March 2024*
