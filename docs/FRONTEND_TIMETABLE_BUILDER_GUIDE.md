# Frontend Timetable Builder Implementation Guide

This document outlines the step-by-step workflow for the frontend team to build a premium, drag-and-drop timetable management interface.

## 1. Conceptual Workflow

1.  **Period Configuration:** Define the school's daily timings once.
2.  **Subject-Teacher Sidebar:** Fetch only those subjects that are assigned to the selected class.
3.  **Grid Layout:** A grid where columns are **Days** and rows are **Predefined Periods**.
4.  **Drag & Drop:** Drag a subject card from the sidebar and drop it into a grid slot.
5.  **Validation:** Handle conflict errors (Teacher busy, Room occupied) gracefully.

---

## 2. API Endpoints Required

### A. Period Configuration (New)
*   **GET** `/api/v1/timetable-periods?academicYearId={{YEAR_ID}}`
    *   Used to render the **Rows** of the timetable grid.
*   **POST** `/api/v1/timetable-periods/bulk`
    *   Used in a "Settings" page to define the school's schedule (e.g., Period 1: 8:00-8:50, etc.).

### B. Assignment Inventory (Sidebar)
*   **GET** `/api/v1/teacher-assignments/class/{{CLASS_ID}}/section/{{SECTION_ID}}?academicYearId={{YEAR_ID}}`
    *   Returns a list of subjects and their assigned teachers for that specific class.
    *   *Payload:* `[{ subjectId: { name: 'Maths' }, teacherId: { name: 'Mr. Sharma' }, ... }]`

### C. Timetable Operations
*   **GET** `/api/v1/timetable/weekly/class/{{CLASS_ID}}/section/{{SECTION_ID}}?academicYearId={{YEAR_ID}}`
    *   Fetches the existing weekly schedule to populate the grid.
*   **POST** `/api/v1/timetable`
    *   Called when a card is dropped into an empty slot.
*   **PUT** `/api/v1/timetable/{{ID}}`
    *   Called when an existing slot is moved or edited.
*   **DELETE** `/api/v1/timetable/{{ID}}`
    *   Called to clear a slot.

---

## 3. Step-by-Step UI Implementation

### Phase 1: The Header
*   Implement filters for **Class**, **Section**, **Academic Year**, and **Semester**.
*   On change, trigger data fetching for both the **Periods** and the **Assignments**.

### Phase 2: The Inventory Sidebar (Draggable Items)
*   Render a list of "Subject Cards".
*   Each card should contain: `Subject Name`, `Teacher Name`, and `Icon`.
*   Make these cards **Draggable** using `dnd-kit` or `react-beautiful-dnd`.
*   *Note:* A subject can be used multiple times (e.g., Maths happens 5 times a week).

### Phase 3: The Timetable Grid (Drop Targets)
*   **Header Row:** `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`.
*   **Body Rows:** Map through the `timetable-periods` array.
    *   Left-most column: Show the period timing (e.g., `09:00 - 09:50`).
    *   Other columns: Empty "Drop Zones".
*   If data exists for a slot (from the `weekly` API), render the subject card inside the slot.

### Phase 4: Interaction Logic
1.  **On Drop:** 
    *   Identify the `day` (column) and `periodNumber` (row).
    *   Get the `subjectId` and `teacherId` from the dragged card.
    *   **Call API:** `POST /api/v1/timetable`
2.  **Error Handling:**
    *   If the backend returns a `400 Conflict`, show a Toast notification: 
        > "Conflict! Mr. Sharma is already assigned to Class 9-B during Monday Period 2."
    *   Revert the UI state (move the card back or clear the slot).

---

## 4. Pro-Features for Premium UX

*   **Color Coding:** Assign a unique color to each subject (e.g., Maths is always Blue, Science is Green).
*   **Empty Slot Glow:** When dragging a card, highlight all compatible empty slots in the grid.
*   **Bulk Copy:** Add a button "Copy Monday to All Days" to quickly fill the week.
*   **Print View:** Create a clean, CSS-print optimized layout so teachers can print their schedules.

---

## 5. Sample Data Structure (Frontend Mapping)

```javascript
// Map the "Weekly Timetable" response to a Grid Object for easy rendering
const gridData = {
  MONDAY: {
    1: { subject: 'Maths', teacher: 'Mr. Sharma', slotId: '...' },
    2: { subject: 'English', teacher: 'Ms. Gupta', slotId: '...' }
  },
  TUESDAY: {
    // ...
  }
};

// Rendering Logic
periods.map(p => (
  <Row>
    <TimeCell>{p.startTime}</TimeCell>
    {DAYS.map(day => (
      <DropSlot 
        day={day} 
        period={p.periodNumber}
        data={gridData[day][p.periodNumber]} 
      />
    ))}
  </Row>
))
```
