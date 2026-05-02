# Exam Management Refactored API Guide

This document provides a clear reference for the newly refactored Exam Management endpoints. These changes replace the legacy systems and are strictly student-enrollment-based to simplify the architecture.

## Overview
The new exam management flow consists of just four primary endpoints:
1. **Create an Exam**: Define an exam with structure (sections and subjects with max marks).
2. **Fetch Enrolled Students**: Generate a list of enrollments eligible for the exam.
3. **Bulk Upsert Marks**: Enter or update marks for students using their enrollment IDs.
4. **Generate Results**: Retrieve aggregated totals and percentages.

---

### 1. Create Exam
**Endpoint**: `POST /api/v1/exams`
**Security**: Requires Bearer token (Permissions: `EXAM_CREATE`)
**Allowed Roles**: `superadmin`, `school_admin`

Creates one or more exams in a single request. You can still send the original single-class payload, but the preferred bulk format is to group multiple classes under `targets`. Each target can include its own sections, and the same subject list is applied to every created exam.

#### Payload Request (JSON)
```json
{
  "name": "Mid Term Examination 2026",
  "class_id": "60d5ecb8b3921c233c1fa5b1",
  "exam_type": "Mid Term",
  "sections": ["60d5eccfb3921c233c1fa5b2", "60d5ecd6b3921c233c1fa5b3"],
  "subjects": [
    {
      "subject_id": "60e1fac8b3921c233c1fa6e1",
      "max_marks": 100
    },
    {
      "subject_id": "60e1fac8b3921c233c1fa6e2",
      "max_marks": 50
    }
  ],
  "targets": [
    {
      "class_id": "60d5ecb8b3921c233c1fa5b1",
      "sections": ["60d5eccfb3921c233c1fa5b2", "60d5ecd6b3921c233c1fa5b3"]
    },
    {
      "class_id": "60d5ed4ab3921c233c1fa5c4",
      "sections": ["60d5ed5bb3921c233c1fa5c5"]
    }
  ]
}
```

#### Payload Rules
- Use either the legacy single-class shape (`class_id` + `sections`) or the bulk `targets` array.
- In bulk mode, each target must contain one `class_id` and at least one section.
- A class can appear only once inside `targets`.
- Every section must belong to the class in the same target.
- The same subject list is reused for every created exam.

#### Successful Response (201 Created)
```json
{
  "success": true,
  "message": "Exams created successfully",
  "data": [
    {
      "_id": "651a1d...",
      "name": "Mid Term Examination 2026",
      "class_id": "60d5ec...",
      ...
    },
    {
      "_id": "651a1e...",
      "name": "Mid Term Examination 2026",
      "class_id": "60d5ed...",
      ...
    }
  ]
}
```

---

### 2. Fetch Students for Exam
**Endpoint**: `GET /api/v1/exams/:id/students`
**Security**: Requires Bearer token (Permissions: `EXAM_READ`)
**Allowed Roles**: `superadmin`, `school_admin`, `teacher`, `parent`, `student` *(Primarily used by Admins & Teachers)*

Automatically fetches active students bound to the exam's sections. Use the `enrollment_id` returned here for future marks entry. 

#### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [
    {
      "enrollment_id": "651a2e...",
      "student_id": "651a2d...",
      "student_name": "Arjun Sharma"
    },
    {
      "enrollment_id": "651a2f...",
      "student_id": "651a2e...",
      "student_name": "Priya Singh"
    }
  ]
}
```

---

### 3. Bulk Marks Entry
**Endpoint**: `POST /api/v1/marks/bulk`
**Security**: Requires Bearer token (Permissions: `EXAM_CREATE`)
**Allowed Roles**: `superadmin`, `school_admin`

A clean upsert endpoint to save all marks at once or update existing marks dynamically based on `enrollment_id`.

#### Payload Request (JSON)
```json
{
  "exam_id": "651a1d...",
  "marks": [
    {
      "enrollment_id": "651a2e...",
      "subject_id": "60e1fac8b3921c233c1fa6e1",
      "marks": 85
    },
    {
      "enrollment_id": "651a2f...",
      "subject_id": "60e1fac8b3921c233c1fa6e1",
      "marks": 92
    }
  ]
}
```

#### Successful Response (201 Created)
```json
{
  "success": true,
  "message": "Marks saved successfully"
}
```

---

### 4. Fetch / Generate Results
**Endpoint**: `GET /api/v1/results/:examId`
**Security**: Requires Bearer token (Permissions: `EXAM_READ`)
**Allowed Roles**: `superadmin`, `school_admin`, `teacher`, `parent`, `student`

An aggregation endpoint that joins enrollments, subject info, and max marks to return a ready-to-render result dictionary for the frontend.

#### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Results generated successfully",
  "data": [
    {
      "enrollment_id": "651a2e...",
      "student_name": "Arjun Sharma",
      "subject_marks": [
        {
          "subject_name": "Mathematics",
          "marks_obtained": 85
        },
        {
          "subject_name": "Science",
          "marks_obtained": 48
        }
      ],
      "total": 133,
      "percentage": 88.67
    }
  ]
}
```
