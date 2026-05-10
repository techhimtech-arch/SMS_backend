# Parent Portal: UI/UX & Feature Guide

This guide outlines exactly what a parent should see after logging into the School Management System. The goal is to provide a "Premium" and "Reassuring" experience for parents.

---

## 1. Login & Initial Landing
When a parent logs in, the first thing they should see is a **"Child Selector"** (if they have multiple children linked).

### **Feature: Multi-Child Switcher**
- **UX**: A top-bar dropdown or a grid of profile cards (Student Name + Photo + Class).
- **Endpoint**: `GET /api/v1/parent/students`
- **Logic**: Once a student is selected, all subsequent data (Attendance, Fees, etc.) should update for *that* specific student.

---

## 2. Parent Dashboard (Home)
The dashboard should give a **"Bird's Eye View"** of their child's status.

### **Key Widgets:**
1.  **Attendance Snapshot**: Simple donut chart showing current attendance percentage (e.g., 85%).
2.  **Fee Alert**: High-priority card showing "Pending Balance" (if any) with a "Pay Now" button.
3.  **Upcoming Exams**: List of the next 3 scheduled exams.
4.  **Latest Announcement**: A scrolling ticker or a "Notice Board" widget.
5.  **Recent Results**: A small sparkline or bar chart showing the last exam's performance.

---

## 3. Academic Tracking
Parents are most concerned about studies and attendance.

### **A. Attendance Section**
- **View**: Monthly Calendar view.
- **Indicators**: Green (Present), Red (Absent), Yellow (Late), Blue (Holiday).
- **Summary**: Total days present vs. total working days.
- **Endpoint**: `GET /api/v1/parent/children/:studentId/attendance`

### **B. Exam Results**
- **View**: List of exams (Term 1, Final Exam, Unit Test).
- **Details**: Clicking an exam opens a subject-wise table (Subject, Marks, Max Marks, Grade).
- **Visual**: A "Result Card" view that looks like a physical report card.
- **Endpoint**: `GET /api/v1/parent/children/:studentId/results`

### **C. Timetable**
- **Today's View**: What classes are happening *right now*.
- **Weekly View**: Full grid of the week.
- **Endpoint**: `GET /api/v1/parent/children/:studentId/timetable`

---

## 4. Finance & Fees
A transparent view of all financial transactions.

### **A. Fee Summary**
- **Cards**: "Total Amount", "Paid Amount", "Outstanding Balance".
- **Action**: "Download Invoice" button for each installment.
- **Endpoint**: `GET /api/v1/parent/children/:studentId/fees`

---

## 5. Communication & Feedback
Bridging the gap between school and home.

### **A. Homework & Assignments**
- **List**: Title, Subject, Due Date, Status (Pending/Submitted).
- **Endpoint**: `GET /api/v1/parent/children/:studentId/homework`

### **B. Teacher Remarks**
- **UX**: A "Feedback" wall. Teachers can post Positive (Behavior) or Academic remarks.
- **Categories**: Academic, Behavior, Discipline, Extra-Curricular.
- **Endpoint**: `GET /api/v1/parent/children/:studentId/remarks`

### **C. Announcements**
- **Filter**: General School notices vs. Class-specific notices.
- **Endpoint**: `GET /api/v1/parent/children/:studentId/announcements`

---

## ✨ Premium UI Elements for Parent Portal

1.  **Progress Tracking**: Use a line chart to show performance trends across multiple exams.
2.  **Push Notifications**: Even if it's a web app, show a "Badge" on the Bell icon for new remarks.
3.  **Student Identity Card**: A digital ID card on the profile page that parents can save or print.
4.  **Teacher Contact**: A simple list of Subject Teachers for their child (name only, no direct chat unless enabled).
5.  **Dark Mode Support**: Because many parents check portals at night.

---

## 🛠️ Data Strategy for Developers
- **Context API**: Store the `selectedStudentId` globally in React.
- **Role Guards**: Ensure the frontend checks the `user.role === 'parent'` before rendering these routes.
- **Data Pre-fetching**: Use `React Query` to pre-fetch dashboard data so the transition between "Child A" and "Child B" feels instantaneous.
