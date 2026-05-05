# 🚀 Backend Migration Guide for Frontend Developers

The School Management System (SMS) backend has recently undergone a major architectural refactor to standardize naming conventions, eliminate duplicate models, and provide a stable, production-grade API.

While we have implemented **global backward compatibility** on the backend to prevent the frontend from breaking immediately, we highly recommend updating the frontend code to align with the new schema standards to prevent future bugs.

---

## 1. 📅 Standardized Academic Year Naming

**What changed:** 
We have deprecated the inconsistent use of `academicSessionId` and `academicYear` across the codebase. The single source of truth for representing the current academic year/session is now **`academicYearId`**.

**Frontend Action Required:**
- Audit all your API requests (`GET` query parameters and `POST`/`PUT` JSON bodies).
- Replace any keys named `academicSessionId` or `academicYear` with **`academicYearId`**.

*Note: The backend currently intercepts `academicSessionId` and converts it to `academicYearId` automatically, but this is a temporary bridge. Please update your payloads!*

**Example Update:**
```diff
// Old Payload
{
-  "academicSessionId": "69b6cf719e43af3e24d5352c",
+  "academicYearId": "69b6cf719e43af3e24d5352c",
   "classId": "..."
}
```

---

## 2. 🧑‍🎓 Student vs. StudentProfile

**What changed:**
The legacy `Student` model has been completely deprecated in favor of **`StudentProfile`**. 

**Frontend Action Required:**
The API responses returning student data have changed in two major ways:
1. **Name Splitting:** The monolithic `name` field no longer exists. It has been split into **`firstName`** and **`lastName`**.
2. **Class & Section References:** The `classId` and `sectionId` are no longer directly attached to the root of the student object. A student's class is now tracked historically via enrollments. 

To access a student's current class in API responses, look for the **`currentEnrollment`** object.

**Example Update:**
```diff
// Old Frontend Rendering
- <h1>{student.name}</h1>
- <p>Class: {student.classId.name}</p>

// New Frontend Rendering
+ <h1>{student.firstName} {student.lastName}</h1>
+ <p>Class: {student.currentEnrollment?.classId?.name}</p>
```

---

## 3. 📊 Dashboard & Recent Activities

**What changed:**
The `/api/v1/dashboard/recent-activities` and `/api/v1/academic/summary` endpoints have been updated to support the new `StudentProfile` and `academicYearId` structures.

**Frontend Action Required:**
- You do not need to change how you parse the `recent-activities` response, as the backend constructs the string (`description: "John Doe registered in Class 10"`) for you.
- Ensure any date/analytics filters sent to the dashboard use the correct `academicYearId` parameter.

---

## 4. 👩‍🏫 Class Teacher Assignments

**What changed:**
The `ClassTeacherAssignment` endpoints have been standardized.

**Frontend Action Required:**
When assigning a class teacher via `POST /api/v1/class-teacher/assign` or querying `GET /api/v1/class-teacher`, ensure you pass `academicYearId` instead of `academicYear`.

```javascript
// Correct GET request
fetch(`/api/v1/class-teacher?academicYearId=${currentYearId}&classId=${selectedClassId}`)
```
