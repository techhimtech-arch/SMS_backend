# Academic Year, Class & Section Management API Documentation

## Overview

This document provides comprehensive API documentation for managing Academic Years, Classes, and Sections in the School Management System. All endpoints require authentication and appropriate authorization.

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All API requests must include the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All responses follow a consistent format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...},
  "count": 10 // Optional, for list endpoints
}
```

---

# Academic Year Management

## Model Structure

```json
{
  "_id": "string",
  "name": "2025-2026",
  "schoolId": "string",
  "startDate": "2025-04-01T00:00:00.000Z",
  "endDate": "2026-03-31T00:00:00.000Z",
  "isCurrent": true,
  "isActive": true,
  "terms": [
    {
      "name": "Term 1",
      "startDate": "2025-04-01T00:00:00.000Z",
      "endDate": "2025-09-30T00:00:00.000Z",
      "isActive": true,
      "_id": "string"
    }
  ],
  "holidays": [
    {
      "name": "Summer Vacation",
      "startDate": "2025-06-01T00:00:00.000Z",
      "endDate": "2025-06-15T00:00:00.000Z",
      "description": "Summer break for students",
      "_id": "string"
    }
  ],
  "settings": {
    "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "gradingSystem": "percentage"
  },
  "description": "Academic year 2025-2026",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## API Endpoints

### 1. Create Academic Year
**POST** `/academic-years`

**Required Roles:** `superadmin`, `school_admin`

**Request Body:**
```json
{
  "name": "2025-2026",
  "startDate": "2025-04-01",
  "endDate": "2026-03-31",
  "isCurrent": false,
  "terms": [
    {
      "name": "Term 1",
      "startDate": "2025-04-01",
      "endDate": "2025-09-30"
    }
  ],
  "holidays": [
    {
      "name": "Summer Vacation",
      "startDate": "2025-06-01",
      "endDate": "2025-06-15",
      "description": "Summer break"
    }
  ],
  "settings": {
    "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "gradingSystem": "percentage"
  },
  "description": "Academic year 2025-2026"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Academic year created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "2025-2026",
    "startDate": "2025-04-01T00:00:00.000Z",
    "endDate": "2026-03-31T00:00:00.000Z",
    "isCurrent": false,
    "isActive": true,
    "schoolId": "64f8a1b2c3d4e5f6a7b8c9d1"
  }
}
```

### 2. Get All Academic Years
**GET** `/academic-years`

**Required Roles:** All authenticated users

**Query Parameters:**
- `isActive` (optional, boolean): Filter by active status

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "2025-2026",
      "startDate": "2025-04-01T00:00:00.000Z",
      "endDate": "2026-03-31T00:00:00.000Z",
      "isCurrent": true,
      "isActive": true
    }
  ]
}
```

### 3. Get Current Academic Year
**GET** `/academic-years/current`

**Required Roles:** All authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "2025-2026",
    "startDate": "2025-04-01T00:00:00.000Z",
    "endDate": "2026-03-31T00:00:00.000Z",
    "isCurrent": true,
    "isActive": true,
    "terms": [...],
    "holidays": [...],
    "settings": {...}
  }
}
```

### 4. Get Academic Year by ID
**GET** `/academic-years/{id}`

**Required Roles:** All authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "2025-2026",
    "startDate": "2025-04-01T00:00:00.000Z",
    "endDate": "2026-03-31T00:00:00.000Z",
    "isCurrent": true,
    "isActive": true,
    "terms": [...],
    "holidays": [...],
    "settings": {...}
  }
}
```

### 5. Update Academic Year
**PUT** `/academic-years/{id}`

**Required Roles:** `superadmin`, `school_admin`

**Request Body:**
```json
{
  "name": "2025-2026 (Updated)",
  "startDate": "2025-04-01",
  "endDate": "2026-03-31",
  "terms": [...],
  "holidays": [...],
  "settings": {
    "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "gradingSystem": "gpa"
  },
  "description": "Updated description",
  "isActive": true
}
```

### 6. Set Current Academic Year
**PUT** `/academic-years/{id}/set-current`

**Required Roles:** `superadmin`, `school_admin`

**Response (200):**
```json
{
  "success": true,
  "message": "Current academic year updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "2025-2026",
    "isCurrent": true
  }
}
```

### 7. Add Term to Academic Year
**POST** `/academic-years/{id}/terms`

**Required Roles:** `superadmin`, `school_admin`

**Request Body:**
```json
{
  "name": "Term 2",
  "startDate": "2025-10-01",
  "endDate": "2026-03-31"
}
```

### 8. Add Holiday to Academic Year
**POST** `/academic-years/{id}/holidays`

**Required Roles:** `superadmin`, `school_admin`

**Request Body:**
```json
{
  "name": "Winter Break",
  "startDate": "2025-12-25",
  "endDate": "2026-01-05",
  "description": "Winter vacation for students"
}
```

### 9. Delete Academic Year (Soft Delete)
**DELETE** `/academic-years/{id}`

**Required Roles:** `superadmin`, `school_admin`

**Note:** Cannot delete the current academic year. Set another year as current first.

---

# Class Management

## Model Structure

```json
{
  "_id": "string",
  "name": "Class 10",
  "schoolId": "string",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## API Endpoints

### 1. Create Class
**POST** `/classes`

**Required Roles:** `school_admin`

**Request Body:**
```json
{
  "name": "Class 10"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "name": "Class 10",
    "schoolId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "isActive": true
  }
}
```

### 2. Get All Classes
**GET** `/classes`

**Required Roles:** `school_admin`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Class 10",
      "schoolId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "isActive": true
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": "Class 9",
      "schoolId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "isActive": true
    }
  ]
}
```

### 3. Update Class
**PATCH** `/classes/{id}`

**Required Roles:** `school_admin`

**Request Body:**
```json
{
  "name": "Class 10 - Science"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Class updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "name": "Class 10 - Science",
    "schoolId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "isActive": true
  }
}
```

### 4. Delete Class (Soft Delete)
**DELETE** `/classes/{id}`

**Required Roles:** `school_admin`

**Response (200):**
```json
{
  "success": true,
  "message": "Class deleted successfully",
  "data": {}
}
```

---

# Section Management

## Model Structure

```json
{
  "_id": "string",
  "name": "Section A",
  "classId": "string",
  "schoolId": "string",
  "capacity": 40,
  "roomNumber": "101",
  "floor": "Ground Floor",
  "building": "Main Building",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## API Endpoints

### 1. Create Section
**POST** `/sections`

**Required Roles:** `school_admin`

**Request Body:**
```json
{
  "name": "Section A",
  "classId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "capacity": 40,
  "roomNumber": "101",
  "floor": "Ground Floor",
  "building": "Main Building"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Section created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "name": "Section A",
    "classId": "64f8a1b2c3d4e5f6a7b8c9d2",
    "schoolId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "capacity": 40,
    "roomNumber": "101",
    "floor": "Ground Floor",
    "building": "Main Building",
    "isActive": true
  }
}
```

### 2. Get All Sections
**GET** `/sections`

**Required Roles:** `school_admin`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "name": "Section A",
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Class 10"
      },
      "capacity": 40,
      "roomNumber": "101",
      "floor": "Ground Floor",
      "building": "Main Building",
      "isActive": true
    }
  ]
}
```

### 3. Get Sections by Class
**GET** `/sections/class/{classId}`

**Required Roles:** `school_admin`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "name": "Section A",
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Class 10"
      },
      "capacity": 40,
      "roomNumber": "101",
      "floor": "Ground Floor",
      "building": "Main Building",
      "isActive": true
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "name": "Section B",
      "classId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Class 10"
      },
      "capacity": 35,
      "roomNumber": "102",
      "floor": "Ground Floor",
      "building": "Main Building",
      "isActive": true
    }
  ]
}
```

### 4. Update Section
**PATCH** `/sections/{id}`

**Required Roles:** `school_admin`

**Request Body:**
```json
{
  "name": "Section A - Advanced",
  "capacity": 45,
  "roomNumber": "103"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Section updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "name": "Section A - Advanced",
    "classId": "64f8a1b2c3d4e5f6a7b8c9d2",
    "schoolId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "capacity": 45,
    "roomNumber": "103",
    "floor": "Ground Floor",
    "building": "Main Building",
    "isActive": true
  }
}
```

### 5. Delete Section (Soft Delete)
**DELETE** `/sections/{id}`

**Required Roles:** `school_admin`

**Response (200):**
```json
{
  "success": true,
  "message": "Section deleted successfully"
}
```

---

# Error Handling

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Detailed error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

# Frontend Implementation Guide

## 1. Academic Year Management Flow

### Creating Academic Year
1. Get current academic year to check if one exists
2. If creating new academic year, validate dates
3. Set `isCurrent: true` only if no current year exists
4. Handle terms and holidays as optional arrays

### Setting Current Academic Year
1. Get list of all academic years
2. Allow user to select which year to set as current
3. Call `PUT /academic-years/{id}/set-current`
4. Refresh current academic year data

## 2. Class Management Flow

### Creating Classes
1. Simple form with class name input
2. Automatically assigns schoolId from authenticated user
3. Validate for duplicate class names within school

### Managing Classes
1. List all active classes
2. Provide edit/delete options
3. Soft delete maintains data integrity

## 3. Section Management Flow

### Creating Sections
1. First fetch available classes using `GET /classes`
2. Populate class dropdown in section creation form
3. Optional fields: capacity, roomNumber, floor, building
4. Validate classId belongs to user's school

### Managing Sections
1. List all sections with populated class names
2. Filter sections by class using `GET /sections/class/{classId}`
3. Update section details as needed

## 4. Data Validation Rules

### Academic Year
- `name`: Required, unique per school
- `startDate`: Required, must be before `endDate`
- `endDate`: Required, must be after `startDate`
- `isCurrent`: Only one can be true per school
- `terms.name`: Required within terms array
- `holidays.name`: Required within holidays array

### Class
- `name`: Required, unique per school
- `isActive`: Defaults to true

### Section
- `name`: Required, unique per class-school combination
- `classId`: Required, must belong to same school
- `capacity`: Optional, defaults to 40
- `roomNumber`, `floor`, `building`: Optional strings

## 5. Frontend State Management

### Recommended State Structure
```javascript
{
  academicYears: {
    current: null,
    list: [],
    loading: false,
    error: null
  },
  classes: {
    list: [],
    loading: false,
    error: null
  },
  sections: {
    list: [],
    byClass: {}, // sections grouped by classId
    loading: false,
    error: null
  }
}
```

### API Service Functions
```javascript
// Academic Year API
export const academicYearAPI = {
  getAll: () => api.get('/academic-years'),
  getCurrent: () => api.get('/academic-years/current'),
  create: (data) => api.post('/academic-years', data),
  update: (id, data) => api.put(`/academic-years/${id}`, data),
  setCurrent: (id) => api.put(`/academic-years/${id}/set-current`),
  addTerm: (id, data) => api.post(`/academic-years/${id}/terms`, data),
  addHoliday: (id, data) => api.post(`/academic-years/${id}/holidays`, data),
  delete: (id) => api.delete(`/academic-years/${id}`)
};

// Class API
export const classAPI = {
  getAll: () => api.get('/classes'),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.patch(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`)
};

// Section API
export const sectionAPI = {
  getAll: () => api.get('/sections'),
  getByClass: (classId) => api.get(`/sections/class/${classId}`),
  create: (data) => api.post('/sections', data),
  update: (id, data) => api.patch(`/sections/${id}`, data),
  delete: (id) => api.delete(`/sections/${id}`)
};
```

---

# Testing Examples

## Postman Collection Examples

### Academic Year Creation
```http
POST http://localhost:5000/api/v1/academic-years
Content-Type: application/json
Authorization: Bearer <your-token>

{
  "name": "2025-2026",
  "startDate": "2025-04-01",
  "endDate": "2026-03-31",
  "isCurrent": true,
  "description": "Main academic year 2025-2026"
}
```

### Class Creation
```http
POST http://localhost:5000/api/v1/classes
Content-Type: application/json
Authorization: Bearer <your-token>

{
  "name": "Class 10"
}
```

### Section Creation
```http
POST http://localhost:5000/api/v1/sections
Content-Type: application/json
Authorization: Bearer <your-token>

{
  "name": "Section A",
  "classId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "capacity": 40,
  "roomNumber": "101"
}
```

---

## Notes for Frontend Developers

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Different endpoints have different role requirements
3. **Soft Deletes**: Classes and sections use soft delete (isActive: false)
4. **School Context**: All data is automatically filtered by user's schoolId
5. **Date Formats**: Use ISO date format (YYYY-MM-DD) for all date fields
6. **Error Handling**: Implement proper error handling for all API calls
7. **Loading States**: Show loading indicators during API operations
8. **Validation**: Implement client-side validation matching server rules

## Support

For any API-related issues or questions, contact the backend development team or check the Swagger documentation at `http://localhost:5000/api-docs` for interactive API testing.
