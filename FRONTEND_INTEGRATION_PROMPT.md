# Frontend Integration Prompt – SMS Backend Changes & Checks

**Use this prompt / doc for the frontend team.** Ensure the UI implements these checks and uses the APIs as described below. Base URL for all APIs: `/api/v1/` (API versioning is in place).

---

## 1. Authentication

- **Login**  
  - `POST /api/v1/auth/login`  
  - Body: `{ "email", "password" }`  
  - Response: `{ success, data: { accessToken, refreshToken, token (legacy), user: { id, name, email, role, schoolId } } }`  
  - **Check:** Store both `accessToken` and `refreshToken`. Use `accessToken` in `Authorization: Bearer <accessToken>` for all protected requests.

- **Refresh token**  
  - `POST /api/v1/auth/refresh`  
  - Body: `{ "refreshToken" }`  
  - Response: `{ success, data: { accessToken, refreshToken, token (legacy) } }`  
  - **Check:** When API returns 401, call refresh with stored `refreshToken`; on success update stored tokens and retry the failed request. On refresh failure, redirect to login.

- **Logout**  
  - `POST /api/v1/auth/logout`  
  - Body: `{ "refreshToken" }` (optional but recommended so backend can revoke the session).  
  - **Check:** Clear stored `accessToken` and `refreshToken` and redirect to login.

- **Logout all devices**  
  - `POST /api/v1/auth/logout-all`  
  - Header: `Authorization: Bearer <accessToken>`  
  - **Check:** After success, clear tokens and redirect to login.

- **Active sessions**  
  - `GET /api/v1/auth/sessions`  
  - **Check:** Use to show “My devices” and allow revoking a session by ID: `DELETE /api/v1/auth/sessions/:sessionId`.

---

## 2. Academic Year (important for all year-specific features)

- **Current academic year**  
  - Backend expects a **current academic year** to be set per school. Many features default to it if you don’t send `academicYear`.

- **Endpoints**  
  - `GET /api/v1/academic-years` – list academic years for school.  
  - `GET /api/v1/academic-years/current` – get current academic year.  
  - `POST /api/v1/academic-years` – create (school_admin).  
  - `PUT /api/v1/academic-years/:id/set-current` – set as current.

- **Check:**  
  - On app load (or after login), call `GET /api/v1/academic-years/current`. If 404 or “no current year”, show a message and ask admin to create/set current academic year before using exams, fees, class teacher, etc.  
  - Provide an **academic year dropdown** (e.g. “2023-24”, “2024-25”) where relevant and pass the selected value as below.

---

## 3. Exams & Results

- **Create exam**  
  - `POST /api/v1/results/exams`  
  - Body: `name`, `classId`, `examDate` (optional), `academicYear` (optional).  
  - **Check:** If you don’t send `academicYear`, backend uses current academic year. For “other year” exams, send `academicYear` (e.g. `"2024-2025"`).

- **Get student results**  
  - `GET /api/v1/results/results/student/:studentId`  
  - Query: `examId` (optional), **`academicYear`** (optional).  
  - **Check:**  
    - To show results for one exam: use `?examId=...`.  
    - To show results for a whole year: use `?academicYear=2024-2025` (no `examId`).  
  - Use the same academic year dropdown as elsewhere; when user changes year, refetch with new `academicYear`.

---

## 4. Fees

- **Create fee structure**  
  - `POST /api/v1/fees/structure`  
  - Body: `classId`, `tuitionFee`, optionally `academicYear`, `transportFee`, `examFee`, `otherCharges`.  
  - **Check:** Omit `academicYear` to use current year; otherwise send selected year.

- **Assign fee to student**  
  - `POST /api/v1/fees/assign/:studentId`  
  - Body: `classId`, optionally `academicYear`.  
  - **Check:** Same as above – optional `academicYear`, default is current year.

- **Record payment**  
  - `POST /api/v1/fees/payment/:studentId`  
  - Body: `amount`, `paymentMode` (Cash | UPI | Bank), optionally `academicYear`.  
  - **Check:** If the student has fees for multiple years, send `academicYear` for the year you’re collecting in; otherwise backend uses current year.

- **Get student fee details**  
  - `GET /api/v1/fees/student/:studentId`  
  - Query: **`academicYear`** (optional).  
  - **Check:**  
    - With `?academicYear=2024-2025`: show summary and payment history for that year.  
    - Without: backend returns the most recent year’s record.  
  - Use the same academic year dropdown; on change, refetch with new `academicYear`.

---

## 5. Teacher ↔ Class/Section association (two types)

### A) Subject-wise assignment (teacher teaches a subject in a class+section)

- **Create assignment**  
  - `POST /api/v1/teacher-assignments`  
  - Body: `teacherId`, `classId`, `sectionId`, `subjectId`.  
  - **Check:** Only school_admin (or superadmin). Used for “which teacher teaches which subject in which class/section”.

- **List assignments**  
  - `GET /api/v1/teacher-assignments`  
  - Teachers get only their own; admin gets all.  
  - **Check:** Use for “Assign teacher to subject” screen and for teachers to see their timetable.

- **Other:**  
  - `GET /api/v1/teacher-assignments/:id`, `PUT`, `DELETE` – use as needed for edit/remove.

### B) Class teacher (one teacher per class+section for the year)

- **Assign class teacher**  
  - `POST /api/v1/class-teacher/assign`  
  - Body: `teacherId`, `classId`, `sectionId`, **`academicYear`** (required here).  
  - **Check:** Send `academicYear` (e.g. `"2024-2025"`). Use current year from `GET /api/v1/academic-years/current` if that’s the default in your UI.

- **List class teacher assignments**  
  - `GET /api/v1/class-teacher`  
  - Query: `academicYear`, `classId` (optional).  
  - **Check:** Use for “Class teacher” management screen; filter by `academicYear` and optionally `classId`.

- **Teacher: “My classes”**  
  - `GET /api/v1/class-teacher/my-classes`  
  - **Check:** For teacher dashboard – show classes/sections where they are class teacher.

- **Check if current user is class teacher**  
  - `GET /api/v1/class-teacher/check/:classId/:sectionId`  
  - **Check:** Use before showing “Mark attendance” or other class-teacher-only actions.

- **Get class teacher for a class+section**  
  - `GET /api/v1/class-teacher/by-class/:classId/:sectionId`  
  - **Check:** Use to show “Class teacher: <name>” on class/section screens.

- **Remove class teacher**  
  - `DELETE /api/v1/class-teacher/:id`  
  - **Check:** Only school_admin; use the assignment `id` from list.

---

## 6. Reports (PDF)

- **Report card (single student)**  
  - `GET /api/v1/reports/report-card/:studentId/:examId` – download PDF.  
  - `GET /api/v1/reports/report-card/:studentId/:examId/view` – open inline in browser.  
  - **Check:** Send `studentId` and `examId`; response is PDF (binary). Use `view` for “View” and report-card for “Download”.

- **Bulk report cards**  
  - `POST /api/v1/reports/report-cards/bulk`  
  - Body: `classId`, `sectionId`, `examId`.  
  - **Check:** Admin only; response is JSON with success/error counts, not PDF stream.

- **Attendance report PDF**  
  - `GET /api/v1/reports/attendance/:studentId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`  
  - **Check:** Required query params: `startDate`, `endDate`; response is PDF.

---

## 7. Audit logs (admin)

- **List logs**  
  - `GET /api/v1/audit-logs`  
  - Query: `page`, `limit`, `action`, `resourceType`, `userId`, `startDate`, `endDate`, `success`.  
  - **Check:** School admin / superadmin only; use for “Activity log” or “Audit” page.

- **Stats**  
  - `GET /api/v1/audit-logs/stats`  
  - Query: `startDate`, `endDate`.  
  - **Check:** For dashboard widgets (e.g. actions by type, by day).

- **User activity**  
  - `GET /api/v1/audit-logs/user/:userId`  
  - Query: `page`, `limit`, `startDate`, `endDate`.  
  - **Check:** For “View user activity” in user management.

---

## 8. Quick checklist for frontend

- [ ] Use **base path `/api/v1/`** for all API calls.
- [ ] After login, store **accessToken** and **refreshToken**; use accessToken in `Authorization: Bearer <token>`.
- [ ] On 401, call **refresh** with refreshToken; on success retry request; on failure redirect to login.
- [ ] On logout, call **logout** with refreshToken (and clear tokens).
- [ ] After login, call **GET /api/v1/academic-years/current**; if no current year, show message and block year-dependent flows until admin sets it.
- [ ] Add **academic year dropdown** (from `GET /api/v1/academic-years`) on: Results, Fees (structure, assign, payment, student fee details), Class teacher assign/list.
- [ ] **Results:** Use `?academicYear=...` when viewing by year; use `?examId=...` when viewing by exam.
- [ ] **Fees:** Use `?academicYear=...` on GET student fee details; send optional `academicYear` in POST body for structure, assign, payment when needed.
- [ ] **Class teacher:** Always send `academicYear` in POST assign; use `academicYear` (and optionally `classId`) in GET list; use “my-classes” and “check” for teacher flows.
- [ ] **Teacher assignments:** Use teacher-assignments APIs for subject–class–section assignment; use class-teacher APIs for “class teacher” per class+section.
- [ ] **Reports:** Use correct query/body params (studentId, examId for report card; startDate/endDate for attendance).
- [ ] **Audit:** Use audit-logs and audit-logs/stats (and optional user/:userId) for admin activity views.

---

**API docs (Swagger):** `GET /api-docs` on the same host as the API (e.g. `https://your-api.com/api-docs`). Use it to verify request/response shapes and query/body parameters.
