# 🚀 Frontend Full Functionality & Integration Checklist

This document is the **Ultimate Checklist** for the frontend team. It goes beyond the basic demo and ensures that **every single module** in the School Management System is 100% functional, edge-case proof, and production-ready.

---

## 🔐 1. Authentication & User Management
**Goal:** Secure, seamless access control across 4 different portals (Admin, Teacher, Parent, Student).

- [ ] **Login Portal:** Handled correctly for all 4 roles.
  - *API:* `POST /api/v1/auth/login`
  - *UI Check:* Redirects to the correct dashboard based on the `role` returned in the token.
- [ ] **Token Management:**
  - *UI Check:* Interceptors are set up in Axios/fetch to automatically inject `Bearer {token}` into headers.
  - *UI Check:* Refresh token logic is implemented (or graceful logout if the token expires).
- [ ] **School Context Isolation:**
  - *UI Check:* All requests correctly pass `schoolId` (if it's required in headers or body, though usually inferred from the token).

---

## 🏫 2. Academic Core (Admin)
**Goal:** The foundation of the school must be easy to set up and impossible to break.

- [ ] **Academic Years:**
  - *API:* `CRUD /api/v1/academic-years`
  - *UI Check:* Can create, list, and set the "Active" academic year.
- [ ] **Classes & Sections:**
  - *API:* `CRUD /api/v1/classes` & `CRUD /api/v1/sections`
  - *UI Check:* Prevent deleting a class if students are currently enrolled in it (handle 400 errors gracefully).
- [ ] **Subjects:**
  - *API:* `CRUD /api/v1/subjects`
  - *UI Check:* Ability to map subjects to specific classes.

---

## 👨‍🎓 3. Student Lifecycle
**Goal:** Flawless tracking from admission to promotion.

- [ ] **Student Admission:**
  - *API:* `POST /api/v1/admissions`
  - *UI Check:* Form validation for required fields (Name, DOB, Gender).
- [ ] **Enrollment Management:**
  - *API:* `POST /api/v1/enrollments`
  - *UI Check:* Ensure the UI uses `StudentProfile` data. Roll numbers must be uniquely validated per class/section.
- [ ] **Parent Linking:**
  - *API:* `POST /api/v1/parent-linking/:studentId/link/:parentId`
  - *UI Check:* Parent search works (by email/phone). Clear visual indication of linked parents on the student's profile.
- [ ] **Student Promotion:**
  - *API:* `POST /api/v1/enrollments/promote` (or equivalent promotion route)
  - *UI Check:* Bulk selection UI for promoting students to the next academic year.

---

## 👨‍🏫 4. Teacher Management
**Goal:** Clear delegation of responsibilities.

- [ ] **Teacher Creation:**
  - *API:* `POST /api/v1/users` (Role: Teacher)
- [ ] **Class Teacher Assignment:**
  - *API:* `POST /api/v1/teacher-assignments/class-teacher`
  - *UI Check:* Clear error if a teacher is already assigned to a conflicting class.
- [ ] **Subject Teacher Assignment:**
  - *API:* `POST /api/v1/teacher-assignments/subject-teacher`
  - *UI Check:* Multi-select UI for assigning multiple subjects to a single teacher.

---

## 📅 5. Timetable & Attendance
**Goal:** Daily operations must be fast and error-free.

- [ ] **Timetable Creation:**
  - *API:* `CRUD /api/v1/timetables`
  - *UI Check:* Drag-and-drop or grid UI. Validation to prevent assigning the same teacher to two different classes at the exact same time.
- [ ] **Daily Attendance:**
  - *API:* `POST /api/v1/attendance/mark`
  - *UI Check:* "Mark All Present" button. Visual distinction between Present (Green), Absent (Red), Late (Yellow).
- [ ] **Attendance Reports:**
  - *API:* `GET /api/v1/reports/attendance`
  - *UI Check:* Date-range pickers work correctly and filter the data dynamically.

---

## 📝 6. Exams & Results
**Goal:** Handle the heaviest data-entry period of the year without crashing.

- [ ] **Exam Creation:**
  - *API:* `CRUD /api/v1/exams`
  - *UI Check:* Define exam types (Mid-term, Final), start/end dates, and maximum marks.
- [ ] **Marks Entry (Bulk):**
  - *API:* `POST /api/v1/marks/bulk`
  - *UI Check:* Keyboard navigation (Tab/Enter). Input validation (cannot enter 105 if max marks is 100).
- [ ] **Result Generation:**
  - *API:* `POST /api/v1/results/generate`
  - *UI Check:* Loading state (processing results can take time). Display generated Report Cards in a printable format (CSS `@media print`).

---

## 💰 7. Fee Management
**Goal:** Track every penny accurately.

- [ ] **Fee Structures:**
  - *API:* `CRUD /api/v1/fees/structures`
  - *UI Check:* UI to define different fee components (Tuition, Transport, Library).
- [ ] **Fee Assignment:**
  - *API:* `POST /api/v1/fees/assign`
  - *UI Check:* Assign fee structures to entire classes or specific students.
- [ ] **Payment Processing:**
  - *API:* `POST /api/v1/fees/pay`
  - *UI Check:* Show outstanding balance. Print/Download PDF receipt upon successful payment.

---

## 📢 8. Communication & Dashboards
**Goal:** Keep everyone informed.

- [ ] **Announcements:**
  - *API:* `CRUD /api/v1/announcements`
  - *UI Check:* Rich text editor for announcement body. Target selection (All, Teachers Only, Parents of Class X).
- [ ] **Dashboards:**
  - *API:* `GET /api/v1/dashboard/admin` (and teacher/parent/student)
  - *UI Check:* Dynamic charts (Chart.js / Recharts) mapping to real data. Empty states if no data is available.

---

## 🛡️ Critical Frontend "Must-Haves"
1. **Global Error Handling:** Axios interceptors must catch `401 Unauthorized` and redirect to Login. They must catch `500 Server Error` and show a generic "Something went wrong" toast (NEVER crash the UI).
2. **Form Validation (Zod / Yup):** Validate everything *before* hitting the API. (e.g., Email format, Password length, Required fields).
3. **Loading States:** Every API call must have a loading state. Disable the "Submit" button while `isLoading` is true to prevent double-submissions.
4. **Responsive Design:** Teacher portal MUST work perfectly on mobile/tablets (teachers mark attendance on their phones in class).
