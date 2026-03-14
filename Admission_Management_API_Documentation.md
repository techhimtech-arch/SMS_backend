# Admission Management API Documentation

## Overview

The Admission Management module provides comprehensive functionality for managing student admissions in the school management system. It supports both partial and full admission workflows, allowing schools to initially capture basic student information and later complete the admission process with additional details.

## Base URL
```
/api/v1/admission
```

## Authentication
All endpoints require authentication using Bearer Token (JWT) in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Roles and Permissions
- **school_admin**: Full access to all admission operations
- **teacher**: Can create partial admissions and view admitted students

---

## 1. Partial Admission

### 1.1 Create Partial Admission

**Endpoint:** `POST /api/v1/admission/partial`

**Description:** Create a new partial admission with basic student information. This is useful when you want to initially capture student details before assigning class, section, and other academic details.

**Required Roles:** `school_admin`, `teacher`

**Request Body:**
```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "email": "rahul.sharma@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "2012-05-10",
  "gender": "Male",
  "address": "123 Main Street, Delhi, India",
  "emergencyContact": "+919876543211"
}
```

**Required Fields:**
- `firstName` (string, 2-50 characters): Student's first name
- `lastName` (string, 2-50 characters): Student's last name
- `gender` (enum): Must be "Male", "Female", or "Other"
- `dateOfBirth` (date): Student's date of birth (ISO 8601 format)

**Optional Fields:**
- `email` (email): Student's email address
- `phone` (string): Student's phone number
- `address` (string, max 200 chars): Student's residential address
- `emergencyContact` (string): Emergency contact number

**Validation Rules:**
- Student age must be between 5 and 25 years
- Phone numbers must be valid mobile numbers
- Email must be a valid email format

**Success Response (201):**
```json
{
  "success": true,
  "message": "Partial admission created successfully. Complete admission by adding class, section, and parent details.",
  "data": {
    "_id": "65aa221b8f9e8a001c9e4a1b",
    "firstName": "Rahul",
    "lastName": "Sharma",
    "email": "rahul.sharma@example.com",
    "phone": "+919876543210",
    "dateOfBirth": "2012-05-10T00:00:00.000Z",
    "gender": "Male",
    "address": "123 Main Street, Delhi, India",
    "emergencyContact": "+919876543211",
    "schoolId": "65bb331b8f9e8a001c9e4a1c",
    "status": "partial",
    "admittedBy": "65cc441b8f9e8a001c9e4a1d",
    "admissionDate": "2026-03-14T14:30:00.000Z",
    "createdAt": "2026-03-14T14:30:00.000Z",
    "updatedAt": "2026-03-14T14:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Unauthorized
- `500` - Internal server error

---

### 1.2 Get Partial Admissions

**Endpoint:** `GET /api/v1/admission/partial`

**Description:** Retrieve a paginated list of all partial admissions with search functionality.

**Required Roles:** `school_admin`, `teacher`

**Query Parameters:**
- `page` (integer, default: 1): Page number for pagination
- `limit` (integer, default: 10): Number of admissions per page
- `search` (string, optional): Search by student name or email

**Example Request:**
```
GET /api/v1/admission/partial?page=1&limit=10&search=Rahul
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65aa221b8f9e8a001c9e4a1b",
      "firstName": "Rahul",
      "lastName": "Sharma",
      "email": "rahul.sharma@example.com",
      "phone": "+919876543210",
      "dateOfBirth": "2012-05-10T00:00:00.000Z",
      "gender": "Male",
      "status": "partial",
      "admissionDate": "2026-03-14T14:30:00.000Z",
      "createdAt": "2026-03-14T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

### 1.3 Complete Partial Admission

**Endpoint:** `PUT /api/v1/admission/{studentId}/complete`

**Description:** Convert a partial admission to a complete admission by adding academic details.

**Required Roles:** `school_admin`, `teacher`

**Path Parameters:**
- `studentId` (string): The ID of the partial admission to complete

**Request Body:**
```json
{
  "classId": "65dd551b8f9e8a001c9e4a1f",
  "sectionId": "65ee661b8f9e8a001c9e4a20",
  "parentUserId": "65ff771b8f9e8a001c9e4a21",
  "rollNumber": 15,
  "bloodGroup": "O+",
  "admissionNumber": "ADM-2026-001"
}
```

**Optional Fields:**
- `classId` (string): Class ID to assign the student
- `sectionId` (string): Section ID to assign the student
- `parentUserId` (string): Parent user ID
- `rollNumber` (integer): Roll number in the section
- `bloodGroup` (enum): Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `admissionNumber` (string): Unique admission number

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admission completed successfully",
  "data": {
    "_id": "65aa221b8f9e8a001c9e4a1b",
    "firstName": "Rahul",
    "lastName": "Sharma",
    "classId": "65dd551b8f9e8a001c9e4a1f",
    "sectionId": "65ee661b8f9e8a001c9e4a20",
    "parentUserId": "65ff771b8f9e8a001c9e4a21",
    "rollNumber": 15,
    "bloodGroup": "O+",
    "admissionNumber": "ADM-2026-001",
    "status": "completed",
    "completedAt": "2026-03-14T14:35:00.000Z",
    "completedBy": "65cc441b8f9e8a001c9e4a1d"
  }
}
```

---

## 2. Full Admission

### 2.1 Admit New Student (Complete Flow)

**Endpoint:** `POST /api/v1/admission`

**Description:** Create a complete admission with all required student information in a single request.

**Required Roles:** `school_admin`

**Request Body:**
```json
{
  "firstName": "Priya",
  "lastName": "Gupta",
  "admissionNumber": "ADM-2026-002",
  "gender": "Female",
  "dateOfBirth": "2013-08-15",
  "email": "priya.gupta@example.com",
  "password": "TempPassword123",
  "academicYearId": "65aa221b8f9e8a001c9e4a1b",
  "classId": "65bb331b8f9e8a001c9e4a1c",
  "sectionId": "65cc441b8f9e8a001c9e4a1d",
  "rollNumber": 8,
  "parentUserId": "65dd551b8f9e8a001c9e4a1f",
  "address": "456 Park Avenue, Mumbai",
  "bloodGroup": "B+",
  "emergencyContact": "+919876543212"
}
```

**Required Fields:**
- `firstName` (string, 2-50 chars): Student's first name
- `lastName` (string, 2-50 chars): Student's last name
- `admissionNumber` (string, 3-20 chars): Unique admission number
- `gender` (enum): "Male", "Female", or "Other"
- `dateOfBirth` (date): Student's date of birth

**Optional Fields:**
- `email` (email): Student's email address
- `password` (string, min 6 chars): Student's password (default generated if not provided)
- `academicYearId` (string): Academic year ID (uses current active year if not provided)
- `classId` (string): Class ID
- `sectionId` (string): Section ID
- `rollNumber` (integer): Roll number
- `parentUserId` (string): Parent user ID
- `address` (string, max 200 chars): Student address
- `bloodGroup` (enum): Blood group
- `emergencyContact` (string): Emergency contact number

**Success Response (201):**
```json
{
  "success": true,
  "message": "Student admitted successfully",
  "data": {
    "studentProfile": {
      "_id": "65aa221b8f9e8a001c9e4a1b",
      "userId": "65bb331b8f9e8a001c9e4a1c",
      "admissionNumber": "ADM-2026-002",
      "firstName": "Priya",
      "lastName": "Gupta",
      "gender": "Female",
      "dateOfBirth": "2013-08-15T00:00:00.000Z",
      "email": "priya.gupta@example.com",
      "schoolId": "65cc441b8f9e8a001c9e4a1d",
      "status": "completed",
      "admissionDate": "2026-03-14T14:40:00.000Z"
    },
    "user": {
      "_id": "65bb331b8f9e8a001c9e4a1c",
      "name": "Priya Gupta",
      "email": "priya.gupta@example.com",
      "role": "student",
      "schoolId": "65cc441b8f9e8a001c9e4a1d"
    },
    "enrollment": {
      "_id": "65dd551b8f9e8a001c9e4a1f",
      "studentId": "65aa221b8f9e8a001c9e4a1b",
      "classId": "65ee661b8f9e8a001c9e4a20",
      "sectionId": "65ff771b8f9e8a001c9e4a21",
      "academicYearId": "65aa221b8f9e8a001c9e4a1b",
      "rollNumber": 8,
      "status": "enrolled"
    }
  }
}
```

---

## 3. Student Management

### 3.1 Get Admitted Students

**Endpoint:** `GET /api/v1/admission`

**Description:** Retrieve a paginated list of all admitted students with filtering and search capabilities.

**Required Roles:** `school_admin`, `teacher`

**Query Parameters:**
- `page` (integer, default: 1): Page number for pagination
- `limit` (integer, default: 10): Number of students per page
- `search` (string, optional): Search by name or admission number
- `classId` (string, optional): Filter by class ID
- `sectionId` (string, optional): Filter by section ID
- `academicYearId` (string, optional): Filter by academic year ID

**Example Request:**
```
GET /api/v1/admission?page=1&limit=10&search=Priya&classId=65dd551b8f9e8a001c9e4a1f
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65aa221b8f9e8a001c9e4a1b",
      "userId": {
        "_id": "65bb331b8f9e8a001c9e4a1c",
        "name": "Priya Gupta",
        "email": "priya.gupta@example.com",
        "role": "student"
      },
      "admissionNumber": "ADM-2026-002",
      "firstName": "Priya",
      "lastName": "Gupta",
      "gender": "Female",
      "dateOfBirth": "2013-08-15T00:00:00.000Z",
      "parentUserId": {
        "_id": "65dd551b8f9e8a001c9e4a1f",
        "name": "Ramesh Gupta",
        "email": "ramesh.gupta@example.com",
        "phone": "+919876543213"
      },
      "currentEnrollment": {
        "_id": "65ee661b8f9e8a001c9e4a20",
        "classId": {
          "_id": "65ff771b8f9e8a001c9e4a21",
          "name": "Grade 5"
        },
        "sectionId": {
          "_id": "65aa221b8f9e8a001c9e4a1b",
          "name": "A"
        },
        "academicYearId": {
          "_id": "65bb331b8f9e8a001c9e4a1c",
          "name": "2026-2027"
        },
        "rollNumber": 8
      },
      "schoolId": "65cc441b8f9e8a001c9e4a1d",
      "isActive": true,
      "status": "completed",
      "admissionDate": "2026-03-14T14:40:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

### 3.2 Get Student Admission Details

**Endpoint:** `GET /api/v1/admission/{studentId}`

**Description:** Retrieve detailed information about a specific student's admission.

**Required Roles:** `school_admin`, `teacher`

**Path Parameters:**
- `studentId` (string): Student profile ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "studentProfile": {
      "_id": "65aa221b8f9e8a001c9e4a1b",
      "userId": {
        "_id": "65bb331b8f9e8a001c9e4a1c",
        "name": "Priya Gupta",
        "email": "priya.gupta@example.com",
        "role": "student"
      },
      "admissionNumber": "ADM-2026-002",
      "firstName": "Priya",
      "lastName": "Gupta",
      "gender": "Female",
      "dateOfBirth": "2013-08-15T00:00:00.000Z",
      "email": "priya.gupta@example.com",
      "phone": "+919876543214",
      "address": "456 Park Avenue, Mumbai",
      "bloodGroup": "B+",
      "emergencyContact": "+919876543212",
      "parentUserId": {
        "_id": "65dd551b8f9e8a001c9e4a1f",
        "name": "Ramesh Gupta",
        "email": "ramesh.gupta@example.com",
        "phone": "+919876543213"
      },
      "currentEnrollment": {
        "_id": "65ee661b8f9e8a001c9e4a20",
        "classId": {
          "_id": "65ff771b8f9e8a001c9e4a21",
          "name": "Grade 5"
        },
        "sectionId": {
          "_id": "65aa221b8f9e8a001c9e4a1b",
          "name": "A"
        },
        "academicYearId": {
          "_id": "65bb331b8f9e8a001c9e4a1c",
          "name": "2026-2027"
        },
        "rollNumber": 8
      },
      "schoolId": "65cc441b8f9e8a001c9e4a1d",
      "status": "completed",
      "admissionDate": "2026-03-14T14:40:00.000Z",
      "createdAt": "2026-03-14T14:40:00.000Z",
      "updatedAt": "2026-03-14T14:40:00.000Z"
    }
  }
}
```

---

## 4. Utility Endpoints

### 4.1 Get Admission Form Data

**Endpoint:** `GET /api/v1/admission/form-data`

**Description:** Retrieve dropdown options and other form data needed for admission forms.

**Required Roles:** `school_admin`, `teacher`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "currentAcademicYear": {
      "_id": "65aa221b8f9e8a001c9e4a1b",
      "name": "2026-2027",
      "startDate": "2026-04-01T00:00:00.000Z",
      "endDate": "2027-03-31T00:00:00.000Z",
      "isActive": true
    },
    "genderOptions": ["Male", "Female", "Other"],
    "bloodGroupOptions": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  }
}
```

---

## 5. Admission Workflow States

### 5.1 Admission Status Types

The admission system supports the following status types:

1. **`partial`**: Initial admission with basic information only
2. **`completed`**: Full admission with all required details
3. **`enrolled`**: Student is actively enrolled in classes

### 5.2 Typical Workflow

1. **Partial Admission** (Optional)
   - Create basic student information
   - Status: `partial`
   - Can be completed later

2. **Complete Admission**
   - Add class, section, and academic details
   - Status changes from `partial` to `completed`
   - Student user account is created

3. **Enrollment**
   - Student is enrolled in specific classes
   - Status: `enrolled`
   - Can access student portal

---

## 6. Error Handling

### 6.1 Common Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "firstName",
      "message": "First name is required",
      "value": ""
    }
  ]
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "Access denied. Please authenticate."
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Student not found"
}
```

**Conflict (409):**
```json
{
  "success": false,
  "message": "Admission number already exists"
}
```

**Internal Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### 6.2 Validation Rules Summary

- **Names**: 2-50 characters, required
- **Email**: Valid email format, optional but unique if provided
- **Phone**: Valid mobile number format
- **Date of Birth**: Valid date, age between 5-25 years
- **Admission Number**: 3-20 characters, unique per school
- **Roll Number**: Numeric, optional
- **Address**: Maximum 200 characters
- **Blood Group**: Must be from predefined list

---

## 7. Integration Notes

### 7.1 Related Models

- **User**: Student user accounts are created automatically
- **StudentProfile**: Main student information storage
- **Enrollment**: Academic enrollment records
- **AcademicYear**: Academic year management
- **Class/Section**: Class and section assignments

### 7.2 Automatic Processes

1. **User Account Creation**: When a student is admitted, a user account is automatically created with the `student` role
2. **Enrollment Creation**: If class, section, and academic year are provided, enrollment is automatically created
3. **Password Generation**: If no password is provided, a default password is generated
4. **Admission Number**: System can generate unique admission numbers if not provided

### 7.3 Bulk Admissions

For bulk admission operations, refer to the Bulk Admission API documentation. The bulk admission module supports:
- CSV file upload
- Batch processing
- Error reporting
- Progress tracking

---

## 8. Testing Examples

### 8.1 Partial Admission Test

```bash
curl -X POST http://localhost:5000/api/v1/admission/partial \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Student",
    "email": "test.student@example.com",
    "dateOfBirth": "2012-05-10",
    "gender": "Male"
  }'
```

### 8.2 Complete Admission Test

```bash
curl -X POST http://localhost:5000/api/v1/admission \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Full",
    "lastName": "Student",
    "admissionNumber": "ADM-2026-TEST",
    "dateOfBirth": "2012-05-10",
    "gender": "Male",
    "classId": "class_id_here",
    "sectionId": "section_id_here",
    "academicYearId": "academic_year_id_here"
  }'
```

---

## 9. Rate Limiting

All admission endpoints are subject to rate limiting to prevent abuse:
- **POST requests**: 10 requests per minute per user
- **GET requests**: 100 requests per minute per user

---

## 10. Security Considerations

1. **Input Validation**: All inputs are validated and sanitized
2. **SQL Injection Prevention**: Using Mongoose ODM prevents SQL injection
3. **XSS Protection**: Input sanitization prevents XSS attacks
4. **Authentication**: JWT-based authentication with role-based access
5. **Data Encryption**: Sensitive data is encrypted at rest
6. **Audit Logging**: All admission actions are logged for audit purposes

---

*This documentation covers the complete Admission Management API. For additional features or troubleshooting, refer to the API logs or contact the development team.*
