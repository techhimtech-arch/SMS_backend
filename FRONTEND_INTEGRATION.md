# School Management System: Frontend Integration Guide

This document provides a comprehensive roadmap for frontend developers to implement the School Management System (SMS). It covers the required features, screen architecture, and the corresponding backend API endpoints.

## 🚀 General Configuration

- **Base URL**: `https://your-api-domain.com/api/v1` (or `http://localhost:5000/api/v1` for dev)
- **Authentication**: JWT via Bearer Token.
- **Headers**: 
  - `Authorization: Bearer <TOKEN>`
  - `Content-Type: application/json`
- **Error Handling**: Standard `{ success: false, message: "Error details" }` format.

---

## 🔑 1. Authentication & User Management
**Base Path**: `/auth`, `/users`

| Feature / Screen | Endpoints | Method | Description |
| :--- | :--- | :---: | :--- |
| **Login** | `/auth/login` | `POST` | Returns JWT and user profile (role-based). |
| **Profile** | `/auth/me` | `GET` | Get current logged-in user details. |
| **Change Password** | `/auth/change-password` | `POST` | Update account password. |
| **User List** | `/users` | `GET` | (Admin) List all staff, teachers, students. |
| **Create User** | `/users` | `POST` | (Admin) Manually add a new system user. |

---

## 🛠️ 2. Admin Portal
**Base Path**: `/admission`, `/classes`, `/sections`, `/subjects`, `/academic-years`, `/parent-linking`

### A. Academic Setup
- **Academic Years**: `GET /academic-years` (List), `POST /academic-years` (Create).
- **Class & Section**:
  - `GET /classes` & `POST /classes`
  - `GET /sections` & `POST /sections` (Nested under classes usually).
- **Subjects**:
  - `GET /subjects` (Full list).
  - `POST /subjects/bulk` (Bulk upload subjects).

### B. Student Management
- **Admissions**:
  - Single: `POST /admission`
  - Bulk: `POST /admission/bulk` (File upload/CSV).
- **Parent Linking**:
  - `GET /parent-linking/student/:studentId/parents` (View parents).
  - `POST /parent-linking/:studentId/link/:parentId` (Link parent).
  - `DELETE /parent-linking/:studentId/unlink/:parentId` (Unlink).
- **Roll Numbers**: `GET /roll-numbers/generate` (Auto-generate for a class).

### C. Timetable & Schedule
- **Timetable Builder**:
  - `GET /timetable/class/:classId` (View).
  - `POST /timetable/save` (Update grid).
  - `GET /timetable-periods` (Configure school periods).

---

## 👨‍🏫 3. Teacher Portal
**Base Path**: `/teacher`, `/attendance`, `/teacher-assignments`, `/teacher/quizzes`

| Feature / Screen | Endpoints | Method |
| :--- | :--- | :---: |
| **Teacher Dashboard** | `/teacher/dashboard` | `GET` |
| **Mark Attendance** | `/attendance/mark` | `POST` |
| **My Timetable** | `/teacher/timetable` | `GET` |
| **Assignments** | `/teacher-assignments` | `GET/POST` |
| **Exam Marks Entry** | `/exams/marks/entry` | `POST` |
| **Quizzes** | `/teacher/quizzes` | `GET/POST` |

---

## 👨‍👩‍👧 4. Parent Portal
**Base Path**: `/parent`, `/parent-linking`

- **Dashboard**: `GET /parent/dashboard` (Summary of all linked students).
- **Student Profile**: `GET /parent/student/:studentId/profile`.
- **Attendance**: `GET /parent/student/:studentId/attendance`.
- **Fee Payment**: `GET /fees/student/:studentId` & `POST /fees/pay`.
- **Exam Results**: `GET /exams/results/student/:studentId`.

---

## 🎓 5. Student Portal
**Base Path**: `/student`

- **My Timetable**: `GET /student/timetable`.
- **Study Materials**: `GET /student/study-materials`.
- **My Attendance**: `GET /student/attendance/summary`.
- **Assignments**: `GET /student/assignments`.
- **Quizzes**: `GET /student/quizzes`.

---

## 📢 6. Common Features (All Portals)
- **Announcements**: `GET /announcements` (Role-specific notifications).
- **Notifications**: `GET /notifications` (Real-time alerts).
- **Certificates**: `GET /certificates/verify/:id`.

---

## ✨ Premium UI/UX Recommendations

To make the frontend look **Elite/Premium**:

1.  **Dashboard Widgets**: Use glassmorphism cards for "Quick Stats" (Total Students, Pending Fees, Today's Attendance %).
2.  **State Management**: Use `React Query` or `SWR` for fetching. This ensures data is always fresh and provides built-in loading/error states.
3.  **Real-time Alerts**: Use **Socket.io** or Toast notifications for new announcements.
4.  **Empty States**: Never show a blank screen. Use beautiful 3D illustrations for "No Data Found" states.
5.  **Data Tables**: Use `TanStack Table` with features like:
    - Global Search
    - Column Filtering
    - Export to Excel/PDF
    - Virtualized scrolling for large student lists.
6.  **Form Validation**: Use `Zod` with `React Hook Form` for strict, user-friendly validation.
