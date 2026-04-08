# 👥 User Role to API Mapping - Frontend Implementation Guide

**Version:** 1.0  
**Last Updated:** April 8, 2026  
**Purpose:** Align Frontend & Backend - Know exactly which APIs each user role needs

---

## 📊 Quick Overview Table

| User Role | Count | Main Features | Total APIs Needed |
|-----------|-------|---------------|-------------------|
| **Admin** | 1 | Setup, User Mgmt, Reports | 45+ |
| **Teacher** | 50+ | Class Mgmt, Attendance, Results | 15+ |
| **Student** | 1000+ | Dashboard, Marks, Attendance | 10+ |
| **Parent** | 500+ | Child Monitoring, Fees | 8+ |
| **Accountant** | 5+ | Fee Collection, Payments | 12+ |

---

## 🔐 COMMON APIs (All Users Need)

### 1. Authentication APIs
**Any user - Anonymous**

```
POST /api/v1/auth/register
- Body: { email, password, name, role }
- Response: { success, message, userId }
- Frontend: Show registration form

POST /api/v1/auth/login
- Body: { email, password }
- Response: { success, accessToken, refreshToken, user }
- Frontend: LOGIN PAGE
  1. Store token in localStorage
  2. Store user role
  3. Redirect based on role

POST /api/v1/auth/refresh-token
- Body: { refreshToken }
- Response: { success, accessToken }
- Frontend: Call this when token expires (401 error)

POST /api/v1/auth/logout
- Body: {}
- Response: { success, message }
- Frontend: Clear localStorage & redirect to login
```

---

## 👨‍💼 ADMIN - Complete Entity Features

### Admin Dashboard (Landing Page)

```
1️⃣ GET /api/v1/dashboard
   Purpose: Admin के लिए whole system dashboard
   Response:
   {
     totalStudents: 1000,
     totalTeachers: 50,
     totalClasses: 20,
     totalSections: 40,
     totalRevenue: 5000000,
     pendingFees: 500000,
     todayAttendance: 950,
     pendingApprovals: 5
   }
   Frontend: Show statistics cards
```

---

### A. User Management

#### Create User (Teacher/Student/Parent/Accountant)
```
POST /api/v1/users
Headers: Authorization: Bearer {token}
Body:
{
  name: "John Smith",
  email: "john@school.com",
  phone: "+1234567890",
  role: "teacher", // or student, parent, accountant
  password: "TempPassword123"
}

Response: 
{
  success: true,
  data: { userId, name, email, role }
}

Frontend Steps:
1. Show form with fields: Name, Email, Phone, Role, Password
2. Validate email format
3. POST to /api/v1/users
4. Show success message
5. Redirect to user list
```

#### List All Users
```
GET /api/v1/users?role=teacher&page=1&limit=10
Response:
{
  success: true,
  data: [
    { _id, name, email, role, createdAt },
    ...
  ],
  pagination: { page: 1, limit: 10, total: 50 }
}

Frontend:
1. Create table with columns: Name, Email, Role, Created Date, Actions
2. Add Edit/Delete buttons
3. Implement pagination
```

#### Update User
```
PUT /api/v1/users/:userId
Headers: Authorization: Bearer {token}
Body:
{
  name: "John Smith Updated",
  phone: "+1234567890",
  email: "john.new@school.com"
}

Response: { success: true, data: updatedUser }

Frontend:
1. Show edit form with current values
2. Allow modification
3. Send PUT request
4. Show success message
```

#### Delete User
```
DELETE /api/v1/users/:userId
Response: { success: true, message: "User deleted" }

Frontend:
1. Show confirmation dialog
2. Send DELETE request
3. Remove from list
```

---

### B. Academic Structure Setup

#### 1. Academic Year Management

**Create Academic Year**
```
POST /api/v1/academic-years
Body:
{
  name: "2024-2025",
  startDate: "2024-04-01",
  endDate: "2025-03-31",
  isActive: true
}

Response: { success: true, data: academicYear }

Frontend:
1. Show form with date pickers
2. POST to create
```

**List Academic Years**
```
GET /api/v1/academic-years
Response:
{
  success: true,
  data: [
    { _id, name, startDate, endDate, isActive }
  ]
}

Frontend:
1. Show list of academic years
2. Mark which one is active
3. Add Edit/Delete/Set Active buttons
```

#### 2. Create Classes

```
POST /api/v1/classes
Body:
{
  name: "Class 10",
  academicYearId: "academicYearId",
  startingClass: true
}

Response: { success: true, data: classData }

Frontend:
1. Form: Class Name, Academic Year (dropdown), Starting Class (checkbox)
2. POST to create
3. Show list after creation
```

#### 3. Create Sections

```
POST /api/v1/sections
Body:
{
  name: "Section A",
  classId: "classId",
  strength: 45,
  roomNumber: "10-A"
}

Response: { success: true, data: sectionData }

Frontend:
1. Form: Section Name, Class (dropdown), Student Strength, Room Number
2. POST to create
```

#### 4. Create Subjects

```
POST /api/v1/subjects
Body:
{
  name: "Mathematics",
  code: "MATH101",
  description: "Pure Mathematics",
  isOptional: false
}

Response: { success: true, data: subject }

Frontend:
1. Form: Subject Name, Code, Description, Optional (checkbox)
2. Create and list subjects
```

#### 5. Assign Subject to Class

```
POST /api/v1/subjects/:subjectId/assign-to-class
Body:
{
  classId: "classId",
  sectionId: "sectionId"
}

Response: { success: true, message: "Subject assigned" }

Frontend:
1. Show Classes list
2. For each class, show dropdown of subjects
3. Assign subjects
```

---

### C. User Assignment (Teachers to Classes/Subjects)

#### Assign Class Teacher
```
POST /api/v1/class-teacher
Body:
{
  teacherId: "teacherId",
  classId: "classId",
  sectionId: "sectionId"
}

Response: { success: true, data: assignment }

Frontend:
1. Select Teacher dropdown
2. Select Class dropdown
3. Select Section dropdown
4. Submit to assign
5. Show success message
```

#### Assign Subject Teacher
```
POST /api/v1/teacher-assignments
Body:
{
  teacherId: "teacherId",
  classId: "classId",
  sectionId: "sectionId",
  subjectId: "subjectId"
}

Response: { success: true, data: assignment }

Frontend:
1. Select Teacher
2. Select Class
3. Select Section
4. Select Subject
5. Submit to assign
```

#### List Teacher Assignments
```
GET /api/v1/teacher-assignments?classId=classId
Response:
{
  success: true,
  data: [
    {
      _id,
      teacherId: { name, email },
      classId: { name },
      subjectId: { name },
      createdAt
    }
  ]
}

Frontend:
1. Show table: Teacher, Class, Section, Subject, Actions
2. Add Edit/Delete buttons
```

---

### D. Student Management

#### Create Admission
```
POST /api/v1/admission
Body:
{
  firstName: "Alice",
  lastName: "Johnson",
  email: "alice@email.com",
  phone: "+1234567890",
  dateOfBirth: "2008-05-15",
  gender: "Female",
  address: "123 Main St",
  admissionNumber: "ADM2024001"
}

Response: { success: true, data: admission }

Frontend:
1. Show admission form
2. Validate fields
3. POST to create
4. Show success with admission Number
```

#### Complete Admission
```
PUT /api/v1/admission/:admissionId/complete
Body:
{
  classId: "classId",
  sectionId: "sectionId",
  rollNumber: "1",
  parentUserId: "parentUserId" // optional,
  academicYearId: "academicYearId"
}

Response: { success: true, data: completedAdmission }

Frontend:
1. Show form to input class, section, roll number
2. PUT to complete admission
3. This triggers automatic StudentProfile creation
```

#### List Students
```
GET /api/v1/students?classId=classId&page=1&limit=50
Response:
{
  success: true,
  data: [
    {
      _id, admissionNumber, firstName, lastName, 
      email, phone, classId, sectionId
    }
  ],
  pagination: { page: 1, total: 100 }
}

Frontend:
1. Show table: Admission No, Name, Email, Class, Section
2. Add filter by class/section
3. Add pagination
4. Edit/Delete buttons
```

#### Bulk Admission (CSV Upload)
```
POST /api/v1/admission/bulk
Body: FormData with CSV file
File format: firstName, lastName, email, phone, dateOfBirth, gender, address, admissionNumber

Response: 
{
  success: true,
  message: "50 students imported",
  importedCount: 50,
  failedCount: 0,
  errors: []
}

Frontend:
1. Show file upload input
2. Download template CSV
3. Upload CSV file
4. Show import results
```

---

### E. Enrollment

#### Enroll Student in Class
```
POST /api/v1/enrollments
Headers: Authorization: Bearer {token}
Body:
{
  studentId: "studentId", // StudentProfile ID
  academicYearId: "academicYearId",
  classId: "classId",
  sectionId: "sectionId",
  rollNumber: "1",
  schoolId: "schoolId"
}

Response: { success: true, data: enrollment }

Frontend:
1. Select Student (from StudentProfile collection)
2. Select Academic Year
3. Select Class
4. Select Section
5. Enter Roll Number
6. POST to enroll
```

#### List Enrollments
```
GET /api/v1/enrollments?classId=classId
Response:
{
  success: true,
  data: [
    {
      _id, studentId: { firstName, lastName }, 
      classId, sectionId, rollNumber, status
    }
  ]
}

Frontend:
1. Filter by class
2. Show table: Roll No, Student Name, Status
```

---

### F. Academic Calendar

#### Create Academic Calendar
```
POST /api/v1/academic-calendars
Body:
{
  academicYearId: "academicYearId",
  events: [
    { name: "Term 1", startDate: "2024-04-15", endDate: "2024-07-15" },
    { name: "Summer Break", startDate: "2024-07-16", endDate: "2024-08-15" },
    { name: "Term 2", startDate: "2024-08-16", endDate: "2024-12-15" }
  ]
}

Response: { success: true, data: calendar }

Frontend:
1. Show calendar event form
2. Add multiple events
3. POST to create
```

---

### G. Fee Management

#### Create Fee Structure
```
POST /api/v1/fees/structure
Body:
{
  name: "Class 10 Fee Structure",
  classId: "classId",
  components: [
    { name: "Tuition Fee", amount: 5000 },
    { name: "Lab Fee", amount: 1000 },
    { name: "Dev Fee", amount: 500 },
    { name: "Transport", amount: 2000 }
  ],
  totalAmount: 8500,
  dueDate: "2024-05-31"
}

Response: { success: true, data: feeStructure }

Frontend:
1. Select Class
2. Add fee components (dynamic form)
3. Calculate total automatically
4. Set due date
5. POST to create
```

#### Assign Fee to Students
```
POST /api/v1/fees/assign
Body:
{
  classId: "classId",
  sectionId: "sectionId",
  academicYearId: "academicYearId",
  feeStructureId: "feeStructureId"
}

Response: { success: true, message: "Fee assigned to 45 students" }

Frontend:
1. Select Class, Section, Academic Year
2. Select Fee Structure
3. Auto-generate fees for all students
4. Show success
```

#### List Student Fees
```
GET /api/v1/fees/student?classId=classId
Response:
{
  success: true,
  data: [
    {
      studentId, studentName, amount, paidAmount,
      remainingAmount, status, dueDate
    }
  ]
}

Frontend:
1. Show table: Student, Total Fee, Paid, Remaining, Status, Due Date
2. Add payment button
```

---

### H. Reports

#### Class Reports
```
GET /api/v1/reports/class-wise-students?classId=classId
Response:
{
  success: true,
  data: {
    className: "Class 10",
    totalStudents: 45,
    students: [
      { admissionNo, name, phone, email, rollNo }
    ]
  }
}

Frontend:
1. Show class selection
2. Fetch and display report
3. Add print/export buttons
```

#### Academic Summary
```
GET /api/v1/reports/academic-summary?classId=classId&examId=examId
Response:
{
  success: true,
  data: {
    gradeDistribution: {
      A: 10,
      B: 20,
      C: 10,
      D: 3,
      F: 2
    },
    averageMarks: 75.5,
    topScorer: { name, marks }
  }
}

Frontend:
1. Show charts for grade distribution
2. Show statistics
```

#### Fee Collection Report
```
GET /api/v1/reports/fee-collection?startDate=2024-01-01&endDate=2024-03-31
Response:
{
  success: true,
  data: {
    totalFeeStructured: 10000000,
    totalCollected: 8500000,
    totalPending: 1500000,
    collectionPercentage: 85
  }
}

Frontend:
1. Date range picker
2. Show collection stats
3. Show pie chart
4. Export to Excel
```

#### Attendance Report
```
GET /api/v1/reports/attendance?classId=classId&startDate=2024-01-01&endDate=2024-03-31
Response:
{
  success: true,
  data: [
    {
      studentName, totalDays, presentDays, absentDays,
      percentage
    }
  ]
}

Frontend:
1. Date range picker
2. Class filter
3. Show attendance table with percentages
```

---

### I. Announcements

#### Create Announcement
```
POST /api/v1/announcements
Body:
{
  title: "Important Notice",
  message: "School will be closed on 26 Jan",
  targetType: "broadcast", // or "class" or "classTeacher"
  targetIds: [], // IDs if targeted
  scheduledFor: "2024-01-25T09:00:00Z",
  deliveryChannels: ["dashboard", "email"]
}

Response: { success: true, data: announcement }

Frontend:
1. Title, Message textarea
2. Target type radio buttons (Broadcast/Class/Class Teacher)
3. If class: multi-select classes
4. Date-time picker for scheduling
5. Checkbox for delivery channels
6. POST to create
```

---

## 👨‍🏫 TEACHER - Class Management Features

### Teacher Dashboard (Landing Page)

```
GET /api/v1/teacher/dashboard
Response:
{
  totalStudents: 45,
  presentToday: 42,
  absentToday: 2,
  lateToday: 1,
  pendingResults: 15,
  totalExams: 8,
  completedExams: 6
}

Frontend:
1. Show welcome message: "Welcome, John Smith"
2. Display statistics cards
3. Show action buttons below
```

---

### A. Teacher Profile & Assignments

#### Get Teacher Profile
```
GET /api/v1/teacher/profile
Response:
{
  teacher: { _id, name, email, phone, qualification },
  subjectAssignments: [
    {
      classId: { name },
      sectionId: { name },
      subjectId: { name }
    }
  ],
  classTeacherAssignment: {
    classId: { name },
    sectionId: { name }
  }
}

Frontend:
1. Show teacher info card
2. List all assigned classes & subjects
3. Highlight which class is primary (class teacher)
```

---

### B. Attendance Management

#### Get Assigned Students
```
GET /api/v1/teacher/students?classId=classId&sectionId=sectionId
Response:
{
  success: true,
  data: [
    {
      _id, admissionNumber, firstName, lastName,
      gender, dateOfBirth
    }
  ],
  pagination: { totalStudents: 45 }
}

Frontend:
1. Fetch on page load
2. Store in component state
3. Use for attendance form below
```

#### Mark Attendance
```
POST /api/v1/teacher/attendance/mark
Body:
{
  classId: "classId",
  sectionId: "sectionId",
  date: "2024-03-18",
  attendanceRecords: [
    {
      studentId: "studentId1",
      status: "Present",
      remarks: "On time"
    },
    {
      studentId: "studentId2",
      status: "Absent",
      remarks: "Sick leave"
    },
    {
      studentId: "studentId3",
      status: "Late",
      remarks: "10 mins late"
    }
  ]
}

Response: 
{
  success: true,
  message: "Attendance marked for 45 students",
  data: [attendance records]
}

Frontend Steps:
1. Show date picker (default today)
2. Fetch students using GET /teacher/students
3. Create form:
   ┌──────────────────────────────────────┐
   │ Class 10 - Section A | 18-Mar-2024  │
   ├─────┬─────────────────┬──────────────┤
   │ No  │ Student Name    │ Status       │
   ├─────┼─────────────────┼──────────────┤
   │ 1   │ Alice Johnson   │ ⊙ Present    │
   │ 2   │ Bob Smith       │ ⊙ Absent     │
   │ 3   │ Carol Davis     │ ⊙ Late       │
   └─────┴─────────────────┴──────────────┘
4. For each student, add radio buttons:
   - Present (default)
   - Absent
   - Late
   - Leave
5. Optional remarks field
6. Submit button
7. POST with all records
8. Show success toast message
```

#### View Attendance History
```
GET /api/v1/teacher/attendance?classId=classId&startDate=2024-01-01&endDate=2024-03-31&page=1
Response:
{
  success: true,
  data: [
    {
      studentId: { firstName, lastName },
      date: "2024-03-18",
      status: "Present",
      remarks: "On time"
    }
  ],
  pagination: { page: 1, totalPages: 2 }
}

Frontend:
1. Show date range picker
2. Fetch and display attendance records
3. Table columns: Date, Student, Status, Remarks
4. Add filters: Class, Section, Date Range
5. Add pagination
```

#### Update Attendance
```
PUT /api/v1/teacher/attendance/update
Body:
{
  attendanceId: "attendanceId",
  status: "Late",
  remarks: "Updated - arrived late"
}

Response: { success: true, data: updatedAttendance }

Frontend:
1. Show edit button on attendance records
2. On click, show modal to edit status & remarks
3. PUT to update
4. Refresh the record
```

---

### C. Exam & Results Management

#### Get Exams for Teacher's Classes
```
GET /api/v1/teacher/exams?classId=classId
Response:
{
  success: true,
  data: [
    {
      _id, name, description, classId: { name },
      subjectId: { name }, examDate, totalMarks,
      duration, isActive
    }
  ]
}

Frontend:
1. Show list of exams
2. Filter by class (dropdown)
3. Table: Exam Name, Subject, Date, Total Marks, Actions
4. Add view/enter marks buttons
```

#### Add Exam Results (Bulk)
```
POST /api/v1/teacher/results/add
Body:
{
  examId: "examId",
  subjectId: "subjectId",
  classId: "classId",
  sectionId: "sectionId",
  results: [
    {
      studentId: "studentId1",
      marksObtained: 85,
      maxMarks: 100,
      grade: "A",
      remarks: "Excellent"
    },
    {
      studentId: "studentId2",
      marksObtained: 72,
      maxMarks: 100,
      grade: "B+",
      remarks: "Good"
    }
  ]
}

Response:
{
  success: true,
  message: "Results added for 45 students"
}

Frontend Steps:
1. Select Exam (dropdown - shows available exams)
2. Subject auto-populated from exam
3. Class auto-populated from exam
4. Fetch all students for that class
5. Create form:
   ┌─────┬─────────────────┬────────────┬──────────┐
   │ No  │ Student Name    │ Marks      │ Grade    │
   ├─────┼─────────────────┼────────────┼──────────┤
   │ 1   │ Alice Johnson   │ [85]       │ [A]      │
   │ 2   │ Bob Smith       │ [72]       │ [B+]     │
   │ 3   │ Carol Davis     │ [95]       │ [A+]     │
   └─────┴─────────────────┴────────────┴──────────┘
6. Auto-calculate grade from marks:
   - >= 90: A+
   - >= 80: A
   - >= 70: B+
   - >= 60: B
   - >= 50: C
   - < 50: F
7. Show remarks field (optional)
8. Submit button
9. POST with all results
10. Show success message
```

#### View Results
```
GET /api/v1/teacher/results?examId=examId&classId=classId
Response:
{
  success: true,
  data: [
    {
      studentId: { firstName, lastName },
      examId: { name },
      marksObtained: 85,
      maxMarks: 100,
      grade: "A",
      remarks: "Excellent"
    }
  ]
}

Frontend:
1. Show results table
2. Columns: Student, Exam, Marks, Grade, Remarks
3. Add filters: Exam, Class
4. Add sort by marks (ascending/descending)
```

#### Update Result
```
PUT /api/v1/teacher/results/update
Body:
{
  resultId: "resultId",
  marksObtained: 88,
  grade: "A+",
  remarks: "Updated"
}

Response: { success: true, data: updatedResult }

Frontend:
1. Add edit button on results
2. Show modal to edit marks & remarks
3. Auto-update grade
4. PUT to update
```

---

### D. Get Teacher's Classes
```
GET /api/v1/teacher/classes
Response:
{
  subjectAssignments: [
    { classId, className, sectionId, sectionName, subjectId, subjectName }
  ],
  classTeacherAssignment: {
    classId, className, sectionId, sectionName
  }
}

Frontend:
1. Show all classes and sections teacher teaches
2. Highlight primary class (class teacher role)
3. Use for filtering in other pages
```

---

## 👨‍🎓 STUDENT - Personal Dashboard

### Student Dashboard (Landing Page)

```
GET /api/v1/student/dashboard
Response:
{
  profile: {
    admissionNumber: "ADM2023001",
    firstName: "Alice",
    className: "Class 10",
    sectionName: "Section A",
    classTeacher: { name, email, phone }
  },
  attendanceSummary: {
    totalDays: 180,
    presentDays: 170,
    absentDays: 8,
    percentage: 94.4
  },
  recentResults: [
    { examName, subject, marksObtained, maxMarks, grade }
  ],
  upcomingExams: 3,
  pendingAssignments: 2,
  announcements: [...]
}

Frontend:
1. Show profile card with basic info
2. Show attendance percentage
3. Show recent results
4. Show pending tasks
5. Show announcements
```

---

### A. Attendance

#### View My Attendance
```
GET /api/v1/student/attendance?page=1&limit=50
Response:
{
  success: true,
  data: [
    {
      date: "2024-03-18",
      status: "Present",
      remarks: "On time"
    }
  ],
  summary: {
    totalDays: 180,
    presentDays: 170,
    absentDays: 8,
    lateCount: 2,
    percentage: 94.4
  }
}

Frontend:
1. Show attendance table
2. Display summary stats
3. Calculate and show attendance percentage
4. Color code: Present (green), Absent (red), Late (yellow)
```

---

### B. Results & Marks

#### View My Results
```
GET /api/v1/student/results?page=1&limit=50
Response:
{
  success: true,
  data: [
    {
      examName: "Mid-Term Math",
      subject: "Mathematics",
      examDate: "2024-03-25",
      marksObtained: 85,
      maxMarks: 100,
      grade: "A",
      rank: 3
    }
  ],
  summary: {
    totalExams: 8,
    completedExams: 6,
    averageMarks: 78,
    overallGrade: "B+"
  }
}

Frontend:
1. Show results table: Exam, Subject, Date, Marks, Grade, Rank
2. Show summary stats
3. Display average marks with chart
4. Highlight top subjects
```

---

### C. Assignments

#### View My Assignments
```
GET /api/v1/student/assignments?status=pending
Response:
{
  success: true,
  data: [
    {
      _id, title, subject, description,
      dueDate, submittedDate, grade, status
    }
  ]
}

Frontend:
1. Show assignments table
2. Filter by status: Pending, Submitted, Graded
3. Columns: Title, Subject, Due Date, Status, Grade
4. Add submit button for pending assignments
```

#### Submit Assignment
```
POST /api/v1/student/assignments/:assignmentId/submit
Body: FormData with file upload
{
  file: [assignment file],
  submissionNotes: "Done with all questions"
}

Response: { success: true, message: "Assignment submitted" }

Frontend:
1. Show file upload input
2. Show textarea for notes
3. Show submit button
4. Upload file
5. Show success message
```

---

### D. Announcements

#### View Class Announcements
```
GET /api/v1/student/announcements
Response:
{
  success: true,
  data: [
    {
      _id, title, message, createdAt, createdBy
    }
  ]
}

Frontend:
1. Show announcements list
2. Newest first
3. Click to expand full message
4. Show metadata (who posted, when)
```

---

### E. Timetable

#### View My Timetable
```
GET /api/v1/student/timetable
Response:
{
  success: true,
  data: [
    {
      day: "Monday",
      schedule: [
        { time: "09:00-10:00", subject: "Mathematics", teacher: "John Smith", room: "10-A" },
        { time: "10:00-11:00", subject: "English", teacher: "Jane Doe", room: "10-B" }
      ]
    }
  ]
}

Frontend:
1. Show weekly timetable grid
2. Days as columns, Time as rows
3. Display subject, teacher, room
4. Color code different subjects
```

---

### F. Profile

#### View My Profile
```
GET /api/v1/student/profile
Response:
{
  _id, admissionNumber, firstName, lastName,
  email, phone, gender, dateOfBirth,
  classId: { name }, sectionId: { name },
  parentUserId: { name, phone }
}

Frontend:
1. Show profile information
2. Edit button for editable fields
3. Display parent contact
```

---

## 👨‍👩‍👧 PARENT - Child Monitoring

### Parent Dashboard (Landing Page)

```
GET /api/v1/parent/dashboard
Response:
{
  children: [
    {
      _id, firstName, lastName, className,
      sectionName, admissionNumber,
      attendance: 94.4,
      averageMarks: 78,
      pendingFeeAmount: 5000
    }
  ],
  announcements: [...]
}

Frontend:
1. Show list of all children
2. Key stats for each child: Name, Class, Attendance %, Avg Marks, Pending Fee
3. Click on child to see details
4. Show recent announcements
```

---

### A. Child Monitoring

#### View Child Attendance
```
GET /api/v1/parent/children/:studentId/attendance
Response:
{
  success: true,
  data: [
    { date, status, remarks }
  ],
  summary: {
    totalDays: 180,
    presentDays: 170,
    percentage: 94.4
  }
}

Frontend:
1. Show attendance table
2. Display overall attendance percentage
3. Color code by status
4. Optional: Chart showing attendance trend
```

#### View Child Results
```
GET /api/v1/parent/children/:studentId/results
Response:
{
  success: true,
  data: [
    { examName, subject, marksObtained, maxMarks, grade, rank }
  ],
  summary: {
    averageMarks: 78,
    overallGrade: "B+"
  }
}

Frontend:
1. Show results in table
2. Display performance summary
3. Highlight weak subjects
4. Show trend (if multiple exams available)
```

#### View Child Fees
```
GET /api/v1/parent/children/:studentId/fees
Response:
{
  success: true,
  data: {
    totalFee: 50000,
    paidAmount: 45000,
    pendingAmount: 5000,
    dueDate: "2024-05-31",
    status: "pending",
    paymentHistory: [
      { paymentDate, amount, method, transactionId }
    ]
  }
}

Frontend:
1. Show fee status card
   ┌──────────────────────────┐
   │ Total Fee: Rs. 50,000    │
   │ Paid: Rs. 45,000         │
   │ Pending: Rs. 5,000       │
   │ Status: PENDING          │
   └──────────────────────────┘
2. Show payment history table
3. Add payment button (if pending)
4. Show due date warning
```

#### View Child Announcements
```
GET /api/v1/parent/children/:studentId/announcements
Response:
{
  success: true,
  data: [
    { title, message, createdAt, audience }
  ]
}

Frontend:
1. Show class-specific announcements
2. Show school-wide announcements
3. Filter by type
```

#### View Child Timetable
```
GET /api/v1/parent/children/:studentId/timetable
Response:
{
  success: true,
  data: [
    {
      day: "Monday",
      schedule: [
        { time, subject, teacher, room }
      ]
    }
  ]
}

Frontend:
1. Show weekly timetable
2. Print-friendly format
```

---

### B. Payment

#### Make Payment
```
POST /api/v1/fees/payment
Body:
{
  feeId: "feeId",
  amount: 5000,
  paymentMethod: "bank-transfer", // or "cash", "check"
  transactionId: "TXN123456",
  paymentDate: "2024-03-18"
}

Response: { success: true, data: payment }

Frontend:
1. Show payment form
2. Payment method dropdown: Bank Transfer, Cash, Check
3. Input amount, transaction ID
4. Date picker
5. POST to payment
6. Show receipt
```

---

## 💰 ACCOUNTANT - Fee Management

### Accountant Dashboard

```
GET /api/v1/dashboard
Response:
{
  totalFeeStructured: 10000000,
  totalCollected: 8500000,
  totalPending: 1500000,
  collectionPercentage: 85,
  todayCollection: 500000
}

Frontend:
1. Show collection stats
2. Show pie chart: Collected vs Pending
3. Today's collection amount
```

---

### A. Fee Collection

#### Record Payment
```
POST /api/v1/fees/payment
Body:
{
  studentId: "studentId",
  feeId: "feeId",
  amount: 10000,
  paymentMethod: "cash", // or bank-transfer, check, online
  transactionId: "TXN123",
  remarks: "Paid by student"
}

Response: { success: true, data: payment }

Frontend:
1. Search student by admission number
2. Show pending fees
3. Select fee to pay
4. Enter amount and method
5. POST to record payment
6. Print receipt
```

#### View Payment History
```
GET /api/v1/fees/payments?startDate=2024-01-01&endDate=2024-03-31
Response:
{
  success: true,
  data: [
    {
      studentId: { name, admissionNumber },
      amount, paymentMethod, transactionId,
      paymentDate, remarks
    }
  ]
}

Frontend:
1. Date range picker
2. Table: Student, Amount, Method, Date, Status
3. Add filters by payment method
4. Export to Excel
```

#### Fee Collection Report
```
GET /api/v1/reports/fee-collection
Response:
{
  success: true,
  data: {
    totalStructured: 10000000,
    totalCollected: 8500000,
    classWiseCollection: [
      { className, totalFee, collectedFee, percentage }
    ]
  }
}

Frontend:
1. Show collection stats
2. Table: Class, Total Fee, Collected, Pending, %
3. Chart: Collection percentage by class
4. Export report
```

#### DefaulterList (Overdue Fees)
```
GET /api/v1/reports/defaulters?daysOverdue=30
Response:
{
  success: true,
  data: [
    {
      studentId, studentName, className,
      totalFee, paidAmount, pendingAmount,
      daysOverdue, dueDate, parentContact
    }
  ]
}

Frontend:
1. Show defaulters list
2. Columns: Student, Class, Amount Due, Days Overdue, Parent Phone
3. Add SMS reminder button (if SMS configured)
4. Add email reminder button
5. Export list
```

---

## 📊 SUMMARY TABLE - All APIs by User Role

### ADMIN APIs
```
Authentication:
- POST /auth/register
- POST /auth/login

Dashboard:
- GET /dashboard

User Management:
- POST /users
- GET /users
- GET /users/:id
- PUT /users/:id
- DELETE /users/:id

Academic Setup:
- POST /academic-years
- GET /academic-years
- PUT /academic-years/:id

Classes & Sections:
- POST /classes
- GET /classes
- PUT /classes/:id
- POST /sections
- GET /sections
- PUT /sections/:id

Subjects:
- POST /subjects
- GET /subjects
- POST /subjects/:id/assign-to-class

Teacher Assignment:
- POST /class-teacher
- POST /teacher-assignments
- GET /teacher-assignments
- DELETE /teacher-assignments/:id

Student Management:
- POST /admission
- PUT /admission/:id/complete
- GET /students
- GET /students/:id
- POST /admission/bulk
- GET /enrollments
- POST /enrollments

Calendar & Timetable:
- POST /academic-calendars
- POST /timetable
- GET /timetable

Announcements:
- POST /announcements
- GET /announcements

Reports:
- GET /reports/class-wise-students
- GET /reports/academic-summary
- GET /reports/fee-collection
- GET /reports/attendance
- GET /reports/export

Total: 45+ APIs
```

### TEACHER APIs
```
Dashboard:
- GET /teacher/dashboard

Profile & Class Management:
- GET /teacher/profile
- GET /teacher/classes
- GET /teacher/students

Attendance:
- GET /teacher/attendance
- POST /teacher/attendance/mark
- PUT /teacher/attendance/update

Exam & Results:
- GET /teacher/exams
- GET /teacher/results
- POST /teacher/results/add
- PUT /teacher/results/update

Total: 15+ APIs
```

### STUDENT APIs
```
Authentication:
- POST /auth/login

Dashboard:
- GET /student/dashboard

Attendance:
- GET /student/attendance

Results:
- GET /student/results

Assignments:
- GET /student/assignments
- POST /student/assignments/:id/submit

Announcements:
- GET /student/announcements

Timetable:
- GET /student/timetable

Profile:
- GET /student/profile

Total: 10+ APIs
```

### PARENT APIs
```
Authentication:
- POST /auth/login

Dashboard:
- GET /parent/dashboard

Child Monitoring:
- GET /parent/children/:studentId/attendance
- GET /parent/children/:studentId/results
- GET /parent/children/:studentId/fees
- GET /parent/children/:studentId/announcements
- GET /parent/children/:studentId/timetable

Payment:
- POST /fees/payment

Total: 8+ APIs
```

---

## ✅ FRONTEND IMPLEMENTATION CHECKLIST

```
ADMIN PORTAL:
☐ Login Page
☐ Dashboard with statistics
☐ User Management (CRUD)
☐ Academic Year Management
☐ Class & Section Management
☐ Subject Management
☐ Teacher Assignment (Class & Subject)
☐ Student Admission (Single & Bulk CSV)
☐ Enrollment Management
☐ Timetable Management
☐ Announcement Management
☐ Reports Module (5+ report types)
☐ Fee Management
☐ Logout functionality

TEACHER PORTAL:
☐ Login Page
☐ Dashboard with statistics
☐ View Profile & Assignments
☐ View Assigned Classes & Students
☐ Attendance Marking Form (UI-heavy)
☐ Attendance History View
☐ Attendance Update
☐ Exam List View
☐ Result Entry Form (Bulk marks with grade auto-calc)
☐ Result View
☐ Result Update
☐ Logout functionality

STUDENT PORTAL:
☐ Login Page
☐ Dashboard with statistics
☐ Attendance View
☐ Results View
☐ Assignments View
☐ Assignment Submission
☐ Announcements View
☐ Timetable View
☐ Profile View
☐ Logout functionality

PARENT PORTAL:
☐ Login Page
☐ Dashboard - All children
☐ Child Attendance View
☐ Child Results View
☐ Child Fees & Payment Status
☐ Child Announcements View
☐ Child Timetable View
☐ Payment Form & History
☐ Logout functionality

COMMON:
☐ Authentication module (Login/Token/Refresh)
☐ Protected routes middleware
☐ Error handling & toaster notifications
☐ Loading states
☐ Pagination implementation
☐ Filtering & Search
☐ Export to Excel/PDF (optional)
☐ Print functionality (optional)
☐ Responsive design (mobile-friendly)
☐ Dark mode (optional)
```

---

**Frontend Team:** Go through this document and implement exactly these APIs!  
**Backend Team:** Make sure all these APIs are working and tested!

Both teams should refer to this document for alignment! ✅
