# 📚 School Management System - Master API Reference

Welcome to the definitive API documentation for the School Management System. This document serves as the **Single Source of Truth** for frontend-backend integration following the architectural consolidation.

---

## 🔐 1. Authentication & Security
Base Path: `/api/v1/auth`

| Endpoint | Method | Description | Roles | Payload (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/register` | `POST` | Register a new school & admin | Public | `schoolName`, `schoolEmail`, `adminName`, `adminEmail`, `adminPassword` |
| `/login` | `POST` | User login (returns tokens) | Public | `email`, `password` |
| `/refresh` | `POST` | Get new access token | Public | `refreshToken` |
| `/logout` | `POST` | Revoke current session | Authenticated | `refreshToken` |
| `/me` | `GET` | Get current user identity | Authenticated | None |
| `/forgot-password` | `POST` | Request reset link | Public | `email` |
| `/reset-password` | `POST` | Set new password | Public | `token`, `newPassword` |

---

## 👤 2. User Management
Base Path: `/api/v1/users`

| Endpoint | Method | Description | Roles | Query Params / Body |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | List all users (paginated) | school_admin | `page`, `limit`, `search`, `role` |
| `/` | `POST` | Create new staff/user | school_admin | `firstName`, `lastName`, `email`, `password`, `role`, `schoolId` |
| `/me` | `GET` | Get personal profile | All | None |
| `/me` | `PATCH` | Update personal profile | All | `firstName`, `lastName`, `phone`, etc. |
| `/change-password` | `PATCH` | Update own password | All | `oldPassword`, `newPassword` |
| `/profile-image` | `POST` | Upload profile picture | All | `file` (Multipart/form-data) |
| `/stats` | `GET` | Get user counts/stats | school_admin | None |
| `/:id` | `GET` | Get user by ID | school_admin | `id` (path) |
| `/:id` | `PUT` | Update user | school_admin | `firstName`, `lastName`, `role`, etc. |
| `/:id` | `DELETE` | Soft delete user | school_admin | `id` (path) |

---

## 📘 3. Subject Management (Consolidated)
Base Path: `/api/v1/subjects`

| Endpoint | Method | Description | Roles | Payload / Query |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | List all school subjects | admin, teacher | `academicYearId`, `classId`, `search` |
| `/` | `POST` | Create single subject | school_admin | `name`, `code`, `classId`, `academicYearId`, `teacherIds` |
| `/bulk` | `POST` | Bulk create subjects | school_admin | `classId`, `academicYearId`, `subjects` (array) |
| `/clone` | `POST` | Clone subjects to new class | school_admin | `sourceClassId`, `targetClassId`, `academicYearId` |
| `/migrate` | `POST` | Migrate to next session | school_admin | `sourceAcademicYearId`, `targetAcademicYearId` |
| `/class/:classId` | `GET` | Get subjects for class | All | `classId` (path), `academicYearId` |
| `/teacher/:teacherId` | `GET` | Get assigned subjects | Teacher | `teacherId` (path) |
| `/:subjectId/assign-teacher` | `POST` | Assign teacher to section | school_admin | `teacherId`, `sectionId`, `role` |

---

## 📝 4. Exam & Results (Standardized)
Base Path: `/api/v1/exams`

| Endpoint | Method | Description | Roles | Details |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `POST` | Create Exam (Multi-target) | school_admin | Body: `name`, `exam_type`, `subjects`, `targets` |
| `/` | `GET` | List Exams | All | Query: `class_id`, `exam_type` |
| `/:id/students` | `GET` | Get students for exam | teacher, admin | `id` (path) -> Returns student names & IDs |
| `/marks/bulk` | `POST` | Submit marks for students | teacher | Body: `exam_id`, `marks` (array) |
| `/results/:examId` | `GET` | Generate Result Cards | All | `examId` (path) -> Returns aggregated stats |

---

## 💰 5. Fee Management
Base Path: `/api/v1/fees`

| Endpoint | Method | Description | Roles | Details |
| :--- | :--- | :--- | :--- | :--- |
| `/structure` | `POST` | Define class fees | admin, accountant | `academicYearId`, `classId`, `feeType`, `amount`, `dueDate` |
| `/student/:studentId` | `GET` | View student fee summary | admin, parent | Returns pending/paid totals |
| `/pay` | `POST` | Record fee payment | accountant | `feeId`, `amount`, `paymentMethod`, `transactionId` |
| `/dashboard` | `GET` | Revenue & Dues analytics | admin | Financial overview |
| `/receipt/:paymentId` | `GET` | Generate payment receipt | accountant, parent | `paymentId` (path) |

---

## 🏫 6. Academic Core (Classes & Sessions)
Base Paths: `/api/v1/classes`, `/api/v1/sections`, `/api/v1/academic-years`

| Module | Method | Path | Description | Roles |
| :--- | :--- | :--- | :--- | :--- |
| **Class** | `GET` | `/api/v1/classes` | List all classes | All |
| **Section** | `GET` | `/api/v1/sections` | List sections (filter by classId) | All |
| **Session** | `GET` | `/api/v1/academic-years` | List academic sessions | All |
| **Enrollment** | `POST`| `/api/v1/enrollments`| Enroll student in class/section | school_admin |

---

## 📅 7. Attendance
Base Path: `/api/v1/attendance`

| Endpoint | Method | Description | Roles | Details |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `POST` | Take daily attendance | teacher | `classId`, `sectionId`, `date`, `students` (array) |
| `/report` | `GET` | Get attendance reports | admin, parent | `studentId`, `startDate`, `endDate` |

---

## 💡 Important Integration Notes

1.  **Academic Year ID**: Most GET requests for data (Subjects, Exams, Fees) require `academicYearId` in the query params to filter by the current session.
2.  **Pagination**: Most list endpoints support `page` and `limit` query parameters.
3.  **Search**: Use the `search` query parameter for name or code-based filtering.
4.  **Error Handling**: The API returns a standard response format:
    ```json
    {
      "success": false,
      "message": "Error message here",
      "errors": [] // Optional validation details
    }
    ```
5.  **Role Authorization**:
    - `school_admin`: Full access to setup and management.
    - `teacher`: Access to assigned classes, subjects, and marks entry.
    - `accountant`: Access to fee structures and payments.
    - `parent/student`: Read-only access to own profiles, results, and fees.

---
*Last Updated: 2026-05-08*
