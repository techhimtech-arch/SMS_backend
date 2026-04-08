# Enrollment API Documentation

*Overview*: This document contains all the necessary API endpoints for the **Enrollment** system. This is intended for the frontend team to integrate the Enrollment module.

---

## 1. Get Class Enrollments (Students in a specific Class/Section)

**Endpoint:** `GET /api/v1/enrollments/class`  
**Method:** `GET`  
**Description:** Retrieves a list of all enrolled students for a specific class, section, and academic year.

### Query Parameters (All Required)
* `academicYearId` (string)
* `classId` (string)
* `sectionId` (string)

**Example Request:**
```http
GET /api/v1/enrollments/class?academicYearId=65a1...&classId=65b2...&sectionId=65c3...
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Class enrollments retrieved",
  "data": [
    {
      "_id": "65e2a22b8f9e8a001c9e4abc",
      "studentId": {
        "_id": "65aa221b8f9e8a001c9e4a1b",
        "firstName": "Ali",
        "lastName": "Khan",
        "admissionNumber": "ADM-2024-001"
      },
      "academicYearId": "65a123...",
      "classId": "65b234...",
      "sectionId": "65c345...",
      "rollNumber": "10",
      "status": "ENROLLED"
    }
  ]
}
```

---

## 2. Get Current Enrollment for a Specific Student

**Endpoint:** `GET /api/v1/enrollments/student/{studentId}/current`  
**Method:** `GET`  
**Description:** Fetch the active/current enrollment details of a specific student.

### Path Variable
* `studentId`: ID of the student.

**Example Request:**
```http
GET /api/v1/enrollments/student/65aa221b8f9e8a001c9e4a1b/current
Authorization: Bearer <token>
```

---

## 3. Get Enrollment History for a Specific Student

**Endpoint:** `GET /api/v1/enrollments/student/{studentId}/history`  
**Method:** `GET`  
**Description:** Fetch the complete enrollment history (past classes) of a student.

### Path Variable
* `studentId`: ID of the student.

**Example Request:**
```http
GET /api/v1/enrollments/student/65aa221b8f9e8a001c9e4a1b/history
Authorization: Bearer <token>
```

---

## 4. Create New Enrollment

**Endpoint:** `POST /api/v1/enrollments`  
**Method:** `POST`  
**Description:** Enroll a student into a class/section manually.

### Request Body:
```json
{
  "studentId": "65aa221...",
  "academicYearId": "65bb331...",
  "classId": "65cc441...",
  "sectionId": "65dd551...",
  "schoolId": "65ee661...",
  "rollNumber": "15"
}
```

---

## 5. Promote Student (Next Year/Class)

**Endpoint:** `POST /api/v1/enrollments/promote`  
**Method:** `POST`  
**Description:** Promotes a student from their current enrollment to the next class context.

### Request Body:
```json
{
  "studentId": "65aa221...",
  "currentEnrollmentId": "65bb331...",
  "newClassId": "65cc441...",
  "newSectionId": "65dd551...",
  "newRollNumber": "25"
}
```

---

## 6. Bulk Enroll Students

**Endpoint:** `POST /api/v1/enrollments/bulk`  
**Method:** `POST`  
**Description:** Enroll multiple students simultaneously.

### Request Body:
```json
{
  "enrollments": [
    {
      "studentId": "65aa...",
      "academicYearId": "65bb...",
      "classId": "65cc...",
      "sectionId": "65dd...",
      "schoolId": "65ee...",
      "rollNumber": "1"
    },
    {
      "studentId": "65ab...",
      "academicYearId": "65bb...",
      "classId": "65cc...",
      "sectionId": "65dd...",
      "schoolId": "65ee...",
      "rollNumber": "2"
    }
  ]
}
```