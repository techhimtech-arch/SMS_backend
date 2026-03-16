---

# Dashboard API Documentation

## Overview
This document provides comprehensive API documentation for dashboard functionality in the School Management System. The dashboard API provides real-time statistics and analytics for school administrators.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All dashboard endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles
- `superadmin`: System administrator
- `school_admin`: School administrator (can access dashboard)
- `teacher`: Teacher
- `accountant`: Accountant  
- `parent`: Parent
- `student`: Student

---

## Endpoints

### 1. Get Dashboard Statistics
**GET** `/dashboard`

Retrieve comprehensive dashboard statistics including student counts, attendance data, fee information, and exam statistics for the current school.

#### Permissions
- Required Role: `school_admin`

#### Query Parameters
None

#### Response Examples

**Success (200)**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalStudents": 450,
      "totalTeachers": 25,
      "totalClasses": 12,
      "totalSections": 24
    },
    "attendance": {
      "totalMarked": 420,
      "presentCount": 380,
      "absentCount": 40,
      "attendancePercentage": 90.48
    },
    "fees": {
      "totalFeesCollected": 2500000,
      "totalPendingFees": 500000
    },
    "exams": {
      "totalExams": 8,
      "totalResultsEntered": 6
    }
  }
}
```

**Error (401) - Unauthorized**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Error (403) - Forbidden**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

**Error (500) - Server Error**
```json
{
  "success": false,
  "message": "Failed to fetch dashboard data",
  "error": "Database connection error"
}
```

#### Data Fields Description

##### stats Object
- `totalStudents`: Number of active students in the school
- `totalTeachers`: Number of active teachers in the school
- `totalClasses`: Number of active classes in the school
- `totalSections`: Number of active sections in the school

##### attendance Object
- `totalMarked`: Total number of attendance records marked for today
- `presentCount`: Number of students marked present today
- `absentCount`: Number of students marked absent today
- `attendancePercentage`: Percentage of students present today (calculated as presentCount/totalMarked * 100)

##### fees Object
- `totalFeesCollected`: Total amount of fees collected across all payments
- `totalPendingFees`: Total amount of pending fees (balance amounts)

##### exams Object
- `totalExams`: Number of active exams in the system
- `totalResultsEntered`: Number of results entered in the system

#### Performance Notes
- All database queries are executed in parallel for optimal performance
- Uses MongoDB aggregation pipelines for complex calculations
- Implements recommended database indexes for fast data retrieval
- Response time typically under 500ms for schools with up to 10,000 students

#### Recommended Database Indexes
```javascript
// Student collection
{ schoolId: 1, isActive: 1 }

// User collection  
{ schoolId: 1, role: 1, isActive: 1 }

// Class collection
{ schoolId: 1, isActive: 1 }

// Section collection
{ schoolId: 1, isActive: 1 }

// Attendance collection
{ schoolId: 1, date: 1, status: 1 }

// FeePayment collection
{ schoolId: 1 }

// StudentFee collection
{ schoolId: 1 }

// Exam collection
{ schoolId: 1, isActive: 1 }

// Result collection
{ schoolId: 1 }
```

---

# User Management API Documentation

## Overview
This document provides comprehensive API documentation for user management functionality in the School Management System. The API allows school administrators to manage users (teachers, accountants, etc.) within their school.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All user management endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles
- `superadmin`: System administrator
- `school_admin`: School administrator (can manage users)
- `teacher`: Teacher
- `accountant`: Accountant  
- `parent`: Parent
- `student`: Student

---

## Endpoints

### 1. Create New User
**POST** `/users`

Create a new user (teacher, accountant, etc.) in the system.

#### Permissions
- Required Role: `school_admin`

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@school.com",
  "password": "Password123",
  "role": "teacher",
  "schoolId": "65aa221b8f9e8a001c9e4a1b" // Optional, defaults to current user's school
}
```

#### Request Validation
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters  
- `email`: Required, valid email format, must be unique
- `password`: Required, 6-128 characters, at least one uppercase, lowercase, and number
- `role`: Required, must be one of: `teacher`, `accountant`, `parent`, `student`
- `schoolId`: Optional, ObjectId format

#### Response Examples

**Success (201)**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "65aa221b8f9e8a001c9e4a1c",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@school.com",
    "role": "teacher",
    "schoolId": "65aa221b8f9e8a001c9e4a1b",
    "isActive": true,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

**Error (400) - Validation Failed**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email",
      "value": "invalid-email"
    },
    {
      "field": "password", 
      "message": "Password must be at least 6 characters",
      "value": "123"
    }
  ]
}
```

**Error (400) - User Already Exists**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### 2. Get All Users
**GET** `/users`

Retrieve all users for the current school with pagination and filtering options.

#### Permissions
- Required Role: `school_admin`

#### Query Parameters
- `page`: Page number (default: 1, min: 1)
- `limit`: Users per page (default: 10, min: 1, max: 100)
- `search`: Search users by first name, last name, or email (max 100 characters)
- `role`: Filter by role (`teacher`, `accountant`, `parent`, `student`)

#### Request Examples
```
GET /users?page=1&limit=20&search=john&role=teacher
```

#### Response Examples

**Success (200)**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65aa221b8f9e8a001c9e4a1c",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@school.com",
      "role": "teacher",
      "schoolId": "65aa221b8f9e8a001c9e4a1b",
      "isActive": true,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    },
    {
      "_id": "65aa221b8f9e8a001c9e4a1d",
      "firstName": "Jane",
      "lastName": "Smith", 
      "email": "jane.smith@school.com",
      "role": "accountant",
      "schoolId": "65aa221b8f9e8a001c9e4a1b",
      "isActive": true,
      "createdAt": "2024-01-19T14:15:00.000Z",
      "updatedAt": "2024-01-19T14:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 3. Get User by ID
**GET** `/users/{id}`

Retrieve a specific user by their ID.

#### Permissions
- Required Role: `school_admin`

#### Path Parameters
- `id`: User ID (ObjectId)

#### Response Examples

**Success (200)**
```json
{
  "success": true,
  "data": {
    "_id": "65aa221b8f9e8a001c9e4a1c",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@school.com",
    "role": "teacher",
    "schoolId": {
      "_id": "65aa221b8f9e8a001c9e4a1b",
      "name": "Example School"
    },
    "isActive": true,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

**Error (404)**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 4. Update User
**PUT** `/users/{id}`

Update user information.

#### Permissions
- Required Role: `school_admin`

#### Path Parameters
- `id`: User ID (ObjectId)

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@school.com",
  "role": "teacher"
}
```

#### Request Validation
- `firstName`: Optional, 2-50 characters
- `lastName`: Optional, 2-50 characters
- `email`: Optional, valid email format, must be unique if changed
- `role`: Optional, must be one of: `teacher`, `accountant`, `parent`, `student`

#### Response Examples

**Success (200)**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "65aa221b8f9e8a001c9e4a1c",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@school.com",
    "role": "teacher",
    "schoolId": "65aa221b8f9e8a001c9e4a1b",
    "isActive": true,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-21T09:15:00.000Z"
  }
}
```

**Error (400) - Email Already in Use**
```json
{
  "success": false,
  "message": "Email is already in use"
}
```

---

### 5. Delete User
**DELETE** `/users/{id}`

Delete a user from the system.

#### Permissions
- Required Role: `school_admin`

#### Path Parameters
- `id`: User ID (ObjectId)

#### Important Notes
- You cannot delete your own account
- User must belong to the same school as the admin

#### Response Examples

**Success (200)**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error (400) - Trying to Delete Own Account**
```json
{
  "success": false,
  "message": "Cannot delete your own account"
}
```

---

### 6. Get User Statistics
**GET** `/users/stats`

Get statistics about users in the school.

#### Permissions
- Required Role: `school_admin`

#### Response Examples

**Success (200)**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "roleBreakdown": [
      {
        "role": "teacher",
        "count": 25
      },
      {
        "role": "accountant", 
        "count": 5
      },
      {
        "role": "parent",
        "count": 80
      },
      {
        "role": "student",
        "count": 40
      }
    ]
  }
}
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied - insufficient permissions"
}
```

**500 Server Error**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Frontend Integration Guide

### Authentication Flow
1. Login using `/auth/login` endpoint
2. Store the JWT token securely (localStorage, sessionStorage, or secure cookie)
3. Include the token in all subsequent API calls

### Example Frontend Implementation

#### JavaScript/React Example
```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API call failed');
  }

  return data;
};

// Create User Example
const createUser = async (userData) => {
  try {
    const response = await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    console.log('User created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
};

// Get Users Example
const getUsers = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    const response = await apiCall(endpoint);
    console.log('Users retrieved:', response.data);
    return response;
  } catch (error) {
    console.error('Error getting users:', error.message);
    throw error;
  }
};

// Usage Examples
const handleCreateUser = async () => {
  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@school.com',
    password: 'Password123',
    role: 'teacher'
  };

  try {
    const newUser = await createUser(userData);
    // Handle success (e.g., show notification, redirect, update UI)
  } catch (error) {
    // Handle error (e.g., show error message)
  }
};

const handleGetUsers = async () => {
  try {
    const result = await getUsers({ page: 1, limit: 10, search: 'john' });
    // Update UI with users data
    console.log('Total users:', result.pagination.total);
  } catch (error) {
    // Handle error
  }
};
```

### Form Validation Guidelines
- Implement client-side validation matching the API requirements
- Show specific error messages for each field
- Validate email format before sending to API
- Ensure password meets requirements (6+ chars, uppercase, lowercase, number)

### UI/UX Recommendations
- Show loading states during API calls
- Implement proper error handling with user-friendly messages
- Use pagination for user lists
- Implement search and filtering functionality
- Show confirmation dialogs for delete operations
- Display user statistics in dashboard

### Security Considerations
- Never expose passwords in frontend
- Store JWT tokens securely
- Implement token refresh mechanism
- Handle token expiration gracefully
- Validate user permissions on frontend as well

---

## Testing

### Sample Test Data
```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test.user@school.com", 
  "password": "TestPass123",
  "role": "teacher"
}
```

### Postman Collection
You can import the following collection for testing:

```json
{
  "info": {
    "name": "User Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john.doe@school.com\",\"password\":\"Password123\",\"role\":\"teacher\"}"
        },
        "url": {
          "raw": "{{baseUrl}}/users",
          "host": ["{{baseUrl}}"],
          "path": ["users"]
        }
      }
    }
  ]
}
```

---

## Support
For any issues or questions regarding the User Management API, please contact the backend development team.

**Last Updated**: January 2024
**Version**: 1.0.0
