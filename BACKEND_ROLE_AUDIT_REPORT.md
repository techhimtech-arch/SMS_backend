# Backend Role-Based Audit Report
### School Management System
**Scope:** Node.js + Express.js backend 

## 1. Executive Summary

This report audits the current backend codebase, mapping implemented endpoints, modules, and authorization controls to the user roles supported by the API. 

**Roles supported:** Superadmin, School Admin, Teacher, Student, Parent, Accountant.

**Routing source:** `src/routes/` directory (~40 distinct module routers).

**Access control:** 
- `authMiddleware.js` (JWT token verification)
- `roleGuard.js` (Route-level legacy role array checking)
- `roleAuthorization.js` (Granular permission-based authorization via `authorizeResource` / `requirePermission`)
- `src/utils/rbac.js` (Source of truth for permission mapping per role)

**Note:** The backend defines a `superadmin` role with access to `Object.values(PERMISSIONS)` (all permissions), which currently lacks a distinct implementation in the frontend UI. 

## 2. Legend

* **✅ Yes** — Endpoint is fully exposed and role has functional permissions (Create/Update/Delete).
* **👁 Read-only** — Role can execute GET requests to fetch data but cannot use POST/PUT/DELETE.
* **⚠ Partial** — Some sub-actions allowed (e.g., self-management only, or grade updates without paper creation).
* **❌ No** — Route / Controller rejects request with 403 Forbidden for this role.
* **—** — Not applicable for this module.

***

## 3. Module × Role Matrix

High-level mapping of backend API modules to each role, derived from `src/utils/rbac.js` and `roleGuard` attachments on routes.

| Feature / Module | Super/Admin | Teacher | Student | Parent | Accountant |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Management API** | ✅ Yes | ⚠ Own | ⚠ Own | ⚠ Own | ⚠ Own |
| **Admission / Enrollment APIs** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Academic Year / Terms** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Class Management** | ✅ Yes | 👁 Read-only | 👁 Read-only | 👁 Read-only | 👁 Read-only |
| **Subject Management** | ✅ Yes | 👁 Read-only | 👁 Read-only | 👁 Read-only | ❌ No |
| **Teacher Assignments** | ✅ Yes | 👁 Read-only | 👁 Read-only | 👁 Read-only | 👁 Read-only |
| **Timetable API** | ✅ Yes | 👁 Read-only | 👁 Read-only | 👁 Read-only | ❌ No |
| **Academic Calendar API** | ✅ Yes | 👁 Read-only | 👁 Read-only | 👁 Read-only | ❌ No |
| **Roll Number Management** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Attendance (Mark/Update)** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Attendance (View Own/Child)** | ✅ Yes | ✅ Yes | 👁 Read-only | 👁 Read-only | ❌ No |
| **Exam Mgmt (Create Papers)** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Marks Entry / Grading API** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Results (View Publish)** | ✅ Yes | ✅ Yes | 👁 Read-only | 👁 Read-only | ❌ No |
| **Announcements (Create)** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Announcements (View)** | ✅ Yes | ✅ Yes | 👁 Read-only | 👁 Read-only | 👁 Read-only |
| **Assignments API (Create)** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Assignments API (Submit)** | ✅ Yes | ❌ No | ✅ Yes | ❌ No | ❌ No |
| **Quiz Management APIs** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Fee Structure / Master** | ✅ Yes | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Fee Payment / Transactions** | ✅ Yes | ❌ No | ⚠ Self | ⚠ Child | ✅ Yes |
| **Fee Reports Generator** | ✅ Yes | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Certificates API** | ✅ Yes | ❌ No | 👁 Read-only | 👁 Read-only | ❌ No |
| **System Settings & Audit** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |

***

## 4. Granular Permission Matrix (`src/utils/rbac.js`)

Permissions evaluated inside `authorizePermissions` and `authorizeResource` middlewares.

| Permission | Admin | Teacher | Student | Parent | Accountant |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user:create` / `update` / `delete` | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| `user:manage_own` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| `student:manage_own` | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| `class:create` / `update` / `delete` | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| `subject:create` / `update` / `delete` | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| `attendance:create` / `update` | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| `exam:create` / `delete` | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| `exam:grade` | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| `announcement:create` / `update` | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| `fee:create` / `update` / `delete` | ✅ Yes | ❌ No | ❌ No | ❌ No | ✅ Yes |
| `report:generate` | ✅ Yes | ❌ No | ❌ No | ❌ No | ✅ Yes |
| `school:manage` | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |

***

## 5. Per-Role Detailed Breakdown

### 5.1 Superadmin / School Admin
**Primary logic:** Has access to all PERMISSIONS mapped in `rbac.js`.
*Full CRUD access across all routers.*
- **Accessible APIs:** `/api/users/*`, `/api/admission/*`, `/api/enrollment/*`, `/api/classes/*`, `/api/subjects/*`, `/api/attendance/*`, `/api/academic-years/*`, `/api/exams/*`, `/api/fees/*`, `/api/audit/*`, `/api/reports/*`, and all other endpoints.

### 5.2 Teacher
**Primary logic:** Focused on `attendance:*`, `exam:grade`, `announcement:create`, and `manage_own` permissions.
- **Allowed (Write):** Own profile updates, Marking attendance for assigned classes, Grading exams, Publishing announcements/assignments.
- **Allowed (Read):** Students in their classes, other teachers in their school, classes, subjects they teach, reports.
- **Denied:** Creation of Classes, Subjects, Exams, Fees, Users.

### 5.3 Student
**Primary logic:** Focused entirely on read access and self-management.
- **Allowed (Write):** Own profile updates (`user:manage_own`), Submitting assignments, taking quizzes, fetching own fee transaction history.
- **Allowed (Read):** Read their teachers, view assigned class data, announcements, timetable, academic calendar, results, own attendance.
- **Denied:** Modifying any academic structure, grading, viewing other students' private data.

### 5.4 Parent
**Primary logic:** Multi-tenant read logic via `student:manage_own` mapping.
- **Allowed (Write):** Paying child fees, managing own profile.
- **Allowed (Read):** Fetching data scoped *strictly* to their children's parameters (child's teachers, child's classes, child's attendance, child's fees, child's exam results).
- **Denied:** Modifying core data, grading, viewing unmatched students.

### 5.5 Accountant
**Primary logic:** Isolated strictly to Finance, reporting, and basic structural read access.
- **Allowed (Write):** `fee:create`, `fee:update`, `fee:delete`, Fee collection endpoints (`/api/fees/*`).
- **Allowed (Read):** Students (for billing), Teachers (for payroll/reporting), Classes (mapping fee structures), Reports generation.
- **Denied:** Exams, Grading, Timetable, Subjects, Admissions.

***

## 6. Gaps & Observations

1. **Role Discrepancy:** The backend explicitly defines a `superadmin` role with global permissions, but frontend routing (`role-config.ts`) only checks for `school_admin`, `teacher`, `student`, `parent`, `accountant`. Backend routes that might rely explicitly on `superadmin` will be inaccessible via UI.
2. **Subject & Exam Creation:** The frontend implies Teachers have `⚠ Partial` permissions to create/edit subjects and exams. However, in backend `rbac.js`, Teachers **strictly** lack `subject:create`, `subject:update`, `exam:create`, or `exam:update`. They only possess `exam:grade`. Any frontend form attempting to edit a subject or create an exam wrapper as a Teacher will result in a `403 Forbidden`.
3. **Accountant API Exposure vs UI:** The Accountant role on the backend has full `fee:delete` and `fee:update` permissions, but the frontend accountant portal is noted as "minimal". This means the backend supports complex fee operations that currently have no matching UI.
4. **Endpoint Duplication:** There are heavily overlapping routers deployed (e.g., `feeRoutes.js` vs `feesRoutes.js`, `examRoutes.js` vs `examsResultsRoutes.js`, `parentRoutes.js` vs `parentPortalRoutes.js`), indicating legacy routes alongside new modular implementations. Ensure frontend hits the correct module.
5. **Route Guard Implementation:** The backend maintains both `roleGuard` (legacy array checking) and `authorizeResource` (strict RBAC checking). The transition is incomplete; some routes may enforce strict ownership (`:manage_own`), while older routes only check if the user is a `teacher` blindly.

***

## 7. Backend ↔ Frontend Comparison Matrix

Use this to verify the UI correctly calls the secured scopes.

| Module / Endpoint area | Frontend Status | Backend Status | Compatibility Notes / Gaps |
| :--- | :--- | :--- | :--- |
| **Auth (login / register / reset)** | ✅ | ✅ | Backend handles all tokens. |
| **Student Admission (Admin)** | ✅ | ✅ | Covered correctly. |
| **Subjects & Teacher Assignments** | ✅ | ⚠ | **Mismatch:** Frontend tries to give teachers partial edit access; backend strictly blocks subject edits for teachers. |
| **Exams + Subject Papers** | ✅ | ⚠ | **Mismatch:** Backend allows `exam:grade` for teachers but strictly denies `exam:create`. Frontend implies partial paper creation. |
| **Assignments & Quizzes** | ✅ | ✅ | Aligned via `studentQuizRoutes.js` and `assignmentRoutes.js`. |
| **Parent Portal Data Mapping** | ✅ | ✅ | Backend properly scoped via `student:manage_own`. |
| **Fee Management (Accountant)** | ⚠ | ✅ | Backend has full Fee CRUD APIs. Frontend UI is missing features (collection workflow, receipts) that backend supports. |
| **Profile & Sessions** | ✅ | ✅ | Covered by `user:manage_own`. |

***

## 8. References (Source Files)

* `src/utils/rbac.js` — Core Permission array mappings and Constants
* `src/middlewares/roleAuthorization.js` — RBAC middleware checking resource policies
* `src/middlewares/roleGuard.js` — Legacy array-based Role enforcement
* `src/routes/` — (Dashboard, User, Admission, Attendance, Exams, Fees, Timetable, and specific Portal routers)