# 🎯 School Management System: Frontend Demo Flow Guide

This document outlines the **exact UI/UX requirements** and backend API mappings needed to nail the minimum demo flow. 
School owners don't look at individual features; they look at the **flow and ease of use**. The UI must feel premium, responsive, and completely friction-free for these 7 core steps.

---

## 🌟 General UX Principles for the Demo
1. **Zero Dead Ends:** Every success message should have a "Go to next step" button. (e.g., After creating a class -> "Assign Teacher to this Class").
2. **Skeleton Loaders:** Do not use basic spinners. Use skeleton loaders for a premium feel.
3. **Empty States:** If there's no data (e.g., no timetable yet), show a beautiful SVG illustration with a "Create your first..." CTA.
4. **Toast Notifications:** Clean, modern toast notifications (bottom-right or top-right) for all CRUD operations. Do not use native `alert()`.
5. **Fast Transitions:** Modals and drawer menus should slide in smoothly.

---

## 🛣️ The 7-Step Demo Flow

### Step 1: Admin Creates Class
**Goal:** Show how easy it is to set up the academic structure.

* **UI Components:** 
  * A clear "Academic Setup" dashboard.
  * A side-drawer or clean modal for "Add New Class".
  * Needs fields: `className` (e.g., "Class 10"), `sections` (multi-select/tags: A, B, C).
* **UX Wow Factor:** After saving, show a success toast and instantly reflect the new class in the data table without a full page reload.
* **Backend API Mapping:** `POST /api/v1/classes` & `POST /api/v1/sections`

### Step 2: Admin Assigns Teacher
**Goal:** Demonstrate staff management and delegation.

* **UI Components:**
  * Two distinct views: "Assign Class Teacher" and "Assign Subject Teacher".
  * Searchable dropdowns for selecting the Teacher (don't make them scroll through a list of 100).
* **UX Wow Factor:** Use a drag-and-drop interface or a clean multi-select pill interface. Show a small avatar of the teacher next to their name.
* **Backend API Mapping:** `POST /api/v1/teacher-assignments/class-teacher`

### Step 3: Student Enrollment (The "Aha!" Moment)
**Goal:** Show how quickly a student can be onboarded into the system.

* **UI Components:**
  * Multi-step wizard form: (1) Basic Details -> (2) Academic History -> (3) Review & Submit.
  * Required fields: First Name, Last Name, Admission Number, Class, Section, Academic Year.
* **UX Wow Factor:** As soon as Class/Section is selected, auto-generate the next available Roll Number. When the form submits, redirect to the newly created Student Profile page with a celebratory UI.
* **Backend API Mapping:** `POST /api/v1/admissions` (creates User & Profile) -> `POST /api/v1/enrollments`

### Step 4: Parent Linked to Student
**Goal:** Prove the system connects families securely.

* **UI Components:**
  * Inside the Student Profile view, a dedicated "Family / Parents" tab.
  * "Link Parent" button opening a modal. Search parent by email/phone.
* **UX Wow Factor:** If the parent email doesn't exist, provide an inline option to "Quick Create Parent Account" right there in the modal, preventing the user from losing their flow.
* **Backend API Mapping:** `POST /api/v1/parent-linking/:studentId/link/:parentId`

### Step 5: Timetable Visible
**Goal:** Show daily operational clarity.

* **UI Components:**
  * A beautifully rendered CSS Grid weekly calendar view (Monday - Saturday).
  * Color-coded blocks for different subjects.
* **UX Wow Factor:** Admin can click on an empty slot to instantly assign a Subject + Teacher. Students/Parents viewing this page see a "Today's Schedule" highlight.
* **Backend API Mapping:** `GET /api/v1/timetables`

### Step 6: Attendance (Daily Marking)
**Goal:** Show speed. Teachers hate slow attendance systems.

* **UI Components:**
  * A tabular list of enrolled students for the specific class.
  * Default state: EVERYONE is marked "Present" (Green check). 
  * Teacher only clicks to toggle to "Absent" (Red cross) or "Late" (Yellow).
* **UX Wow Factor:** A "Submit Attendance" button that stays sticky at the bottom of the screen. Show a summary ("45 Present, 3 Absent") before final confirmation.
* **Backend API Mapping:** `POST /api/v1/attendance/mark` or `POST /api/v1/teacher/attendance/mark`

### Step 7: Exam + Result (Marks Entry)
**Goal:** Show how the system handles the heaviest data entry task.

* **UI Components:**
  * An Excel-like data grid. Teachers should be able to use the `Tab` or `Enter` key on their keyboard to quickly jump to the next student's input field.
  * Validate inputs on blur (e.g., if max marks is 100, entering 105 turns the box red instantly).
* **UX Wow Factor:** "Save Draft" vs "Publish Results". Show a real-time class average calculation at the top of the screen as marks are entered.
* **Backend API Mapping:** `POST /api/v1/marks/bulk` -> `POST /api/v1/results/generate`

---

## 🚦 Final UI Checklist Before Demo
- [ ] Are all login credentials for Admin, Teacher, and Parent pre-saved or easily accessible for the presenter?
- [ ] Does the UI handle the `schoolId` context seamlessly so the presenter doesn't have to worry about it?
- [ ] Are error states pretty? (No raw JSON objects should ever appear on screen).
- [ ] Is the sidebar navigation logical and clean? Hide complex settings under an "Advanced" tab to not overwhelm the buyer.
