# 🎯 Frontend Endpoint Verification Checklist
**School Management System - Backend API Testing Guide**

**Date:** April 29, 2026  
**Purpose:** Verify all endpoints are working correctly for frontend team  
**Status:** Ready for Testing

---

## 📋 HOW TO USE THIS DOCUMENT

1. **Copy this document** and share with frontend team
2. **Test each endpoint** using Postman/Thunder Client/Curl
3. **Check the ✅ box** when endpoint returns expected response
4. **Report any ❌ failures** with error message
5. **Share results** back to backend team

---

## 🔑 SETUP - Before Testing

### Step 1: Get Authentication Token
```
POST http://localhost:5000/api/v1/auth/login

Body:
{
  "email": "admin@school.com",
  "password": "Admin@12345"
}

Response:
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "...",
  "user": { "id": "...", "role": "school_admin", "name": "Admin" }
}

⚠️ COPY THIS TOKEN - You'll need it for all requests below
```

### Step 2: Add Token to Headers
```
Authorization: Bearer {paste_token_here}
Content-Type: application/json
```

---

## ✅ AUTHENTICATION ENDPOINTS

### 1. Login
```
POST http://localhost:5000/api/v1/auth/login
Body: { "email": "admin@school.com", "password": "Admin@12345" }
Expected: 200 OK, returns accessToken
☐ WORKING
```

### 2. Register New User
```
POST http://localhost:5000/api/v1/auth/register
Body: 
{
  "name": "John Doe",
  "email": "john@school.com",
  "password": "Test@12345",
  "phone": "+919999999999",
  "role": "teacher"
}
Expected: 201 Created, returns userId
☐ WORKING
```

### 3. Refresh Token
```
POST http://localhost:5000/api/v1/auth/refresh-token
Body: { "refreshToken": "your_refresh_token" }
Expected: 200 OK, returns new accessToken
☐ WORKING
```

### 4. Logout
```
POST http://localhost:5000/api/v1/auth/logout
Headers: Authorization: Bearer {token}
Body: {}
Expected: 200 OK
☐ WORKING
```

---

## 📊 ADMIN DASHBOARD ENDPOINTS

### 1. Admin Dashboard
```
GET http://localhost:5000/api/v1/dashboard
Headers: Authorization: Bearer {token}
Expected: 200 OK
Response Contains:
{
  "totalStudents": number,
  "totalTeachers": number,
  "totalClasses": number,
  "totalRevenue": number,
  "pendingFees": number,
  "todayAttendance": number
}
☐ WORKING
```

---

## 👥 USER MANAGEMENT ENDPOINTS

### 1. Create User
```
POST http://localhost:5000/api/v1/users
Headers: Authorization: Bearer {token}
Body:
{
  "name": "Jane Smith",
  "email": "jane@school.com",
  "phone": "+919999999999",
  "role": "teacher",
  "password": "Test@12345"
}
Expected: 201 Created, returns userId
☐ WORKING
```

### 2. List All Users
```
GET http://localhost:5000/api/v1/users?role=teacher&page=1&limit=10
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns array of users
☐ WORKING
```

### 3. Get Single User
```
GET http://localhost:5000/api/v1/users/:userId
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns user details
☐ WORKING
```

### 4. Update User
```
PUT http://localhost:5000/api/v1/users/:userId
Headers: Authorization: Bearer {token}
Body:
{
  "name": "Jane Smith Updated",
  "phone": "+918888888888"
}
Expected: 200 OK
☐ WORKING
```

### 5. Delete User
```
DELETE http://localhost:5000/api/v1/users/:userId
Headers: Authorization: Bearer {token}
Expected: 200 OK, message: "User deleted"
☐ WORKING
```

---

## 🎓 STUDENT MANAGEMENT ENDPOINTS

### 1. Create Student
```
POST http://localhost:5000/api/v1/students
Headers: Authorization: Bearer {token}
Body:
{
  "rollNumber": "STU001",
  "name": "Ahmed Ali",
  "email": "ahmed@school.com",
  "phone": "+919999999999",
  "classId": "class_id_here",
  "sectionId": "section_id_here",
  "dateOfBirth": "2010-05-15",
  "gender": "M"
}
Expected: 201 Created, returns studentId
☐ WORKING
```

### 2. List All Students
```
GET http://localhost:5000/api/v1/students?classId=class_id&page=1&limit=20
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns array of students
☐ WORKING
```

### 3. Get Single Student
```
GET http://localhost:5000/api/v1/students/:studentId
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns student details
☐ WORKING
```

### 4. Update Student
```
PUT http://localhost:5000/api/v1/students/:studentId
Headers: Authorization: Bearer {token}
Body:
{
  "name": "Ahmed Ali Updated",
  "email": "ahmed.new@school.com"
}
Expected: 200 OK
☐ WORKING
```

### 5. Delete Student
```
DELETE http://localhost:5000/api/v1/students/:studentId
Headers: Authorization: Bearer {token}
Expected: 200 OK
☐ WORKING
```

---

## 📚 CLASS & SECTION MANAGEMENT

### 1. Create Class
```
POST http://localhost:5000/api/v1/classes
Headers: Authorization: Bearer {token}
Body:
{
  "name": "Class 10-A",
  "grade": "10",
  "academicYearId": "year_id_here"
}
Expected: 201 Created, returns classId
☐ WORKING
```

### 2. List All Classes
```
GET http://localhost:5000/api/v1/classes
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns array of classes
☐ WORKING
```

### 3. Create Section
```
POST http://localhost:5000/api/v1/sections
Headers: Authorization: Bearer {token}
Body:
{
  "name": "A",
  "classId": "class_id_here"
}
Expected: 201 Created, returns sectionId
☐ WORKING
```

### 4. List Sections
```
GET http://localhost:5000/api/v1/sections?classId=class_id
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns array of sections
☐ WORKING
```

---

## ✅ ATTENDANCE ENDPOINTS

### 1. Mark Attendance (Teacher)
```
POST http://localhost:5000/api/v1/attendance
Headers: Authorization: Bearer {token}
Body:
{
  "classId": "class_id_here",
  "date": "2026-04-29",
  "attendance": [
    { "studentId": "student_id_1", "status": "present" },
    { "studentId": "student_id_2", "status": "absent" },
    { "studentId": "student_id_3", "status": "late" }
  ]
}
Expected: 201 Created
☐ WORKING
```

### 2. Get Attendance for Student
```
GET http://localhost:5000/api/v1/attendance/:studentId?startDate=2026-04-01&endDate=2026-04-29
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns attendance records
Response:
{
  "records": [
    { "date": "2026-04-29", "status": "present" }
  ],
  "summary": {
    "present": 20,
    "absent": 2,
    "late": 1,
    "percentage": 95.5
  }
}
☐ WORKING
```

### 3. Get Class Attendance
```
GET http://localhost:5000/api/v1/attendance/class/:classId?date=2026-04-29
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns all attendance for class
☐ WORKING
```

---

## 📝 MARKS & RESULTS ENDPOINTS

### 1. Create Exam
```
POST http://localhost:5000/api/v1/exams
Headers: Authorization: Bearer {token}
Body:
{
  "name": "Midterm Exam",
  "examType": "midterm",
  "classId": "class_id_here",
  "date": "2026-05-15",
  "totalMarks": 100
}
Expected: 201 Created, returns examId
☐ WORKING
```

### 2. Enter Student Marks
```
POST http://localhost:5000/api/v1/marks
Headers: Authorization: Bearer {token}
Body:
{
  "studentId": "student_id_here",
  "examId": "exam_id_here",
  "subjectId": "subject_id_here",
  "marksObtained": 85,
  "marksOutOf": 100
}
Expected: 201 Created
☐ WORKING
```

### 3. Get Student Results
```
GET http://localhost:5000/api/v1/results/:studentId?examId=exam_id
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns results
Response:
{
  "examName": "Midterm Exam",
  "subjects": [
    { "name": "Math", "marks": 85, "totalMarks": 100 }
  ],
  "totalMarks": 425,
  "percentage": 85
}
☐ WORKING
```

### 4. Publish Results
```
PUT http://localhost:5000/api/v1/results/:examId/publish
Headers: Authorization: Bearer {token}
Body: { "isPublished": true }
Expected: 200 OK
☐ WORKING
```

---

## 💰 FEES ENDPOINTS

### 1. Create Fee Structure
```
POST http://localhost:5000/api/v1/fees/structure
Headers: Authorization: Bearer {token}
Body:
{
  "classId": "class_id_here",
  "academicYearId": "year_id_here",
  "feeType": "tuition",
  "feeName": "Monthly Tuition",
  "amount": 5000,
  "dueDate": "2026-05-01",
  "lateFee": 100
}
Expected: 201 Created
☐ WORKING
```

### 2. Get Student Fee Summary
```
GET http://localhost:5000/api/v1/fees/student/:studentId
Headers: Authorization: Bearer {token}
Expected: 200 OK
Response:
{
  "totalFee": 50000,
  "paidAmount": 25000,
  "balanceAmount": 25000,
  "dueAmount": 5000
}
☐ WORKING
```

### 3. Record Fee Payment (Mark as Paid)
```
POST http://localhost:5000/api/v1/fees/pay
Headers: Authorization: Bearer {token}
Body:
{
  "studentId": "student_id_here",
  "amount": 5000,
  "paymentMode": "Cash",
  "transactionDate": "2026-04-29",
  "remarks": "Full payment received"
}
Expected: 201 Created
☐ WORKING
```

### 4. Get Payment History
```
GET http://localhost:5000/api/v1/fees/payment-history?studentId=student_id
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns payment records
☐ WORKING
```

### 5. Get Fee Dashboard (Overall Summary)
```
GET http://localhost:5000/api/v1/fees/dashboard
Headers: Authorization: Bearer {token}
Expected: 200 OK
Response:
{
  "totalFeeCollection": 5000000,
  "pendingFees": 500000,
  "overdues": 100000,
  "totalStudents": 1000
}
☐ WORKING
```

### 6. Get Class Fee Summary
```
GET http://localhost:5000/api/v1/fees/class-summary?classId=class_id
Headers: Authorization: Bearer {token}
Expected: 200 OK
☐ WORKING
```

### 7. Get Overdue Fees
```
GET http://localhost:5000/api/v1/fees/overdue
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns students with overdue fees
☐ WORKING
```

---

## 📣 ANNOUNCEMENTS ENDPOINTS

### 1. Create Announcement
```
POST http://localhost:5000/api/v1/announcements
Headers: Authorization: Bearer {token}
Body:
{
  "title": "School Closed Tomorrow",
  "message": "Due to weather conditions, school will remain closed tomorrow",
  "type": "general",
  "classId": "class_id_here" (optional)
}
Expected: 201 Created
☐ WORKING
```

### 2. List Announcements
```
GET http://localhost:5000/api/v1/announcements?classId=class_id&page=1&limit=10
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns announcements
☐ WORKING
```

### 3. Get Single Announcement
```
GET http://localhost:5000/api/v1/announcements/:announcementId
Headers: Authorization: Bearer {token}
Expected: 200 OK
☐ WORKING
```

### 4. Update Announcement
```
PUT http://localhost:5000/api/v1/announcements/:announcementId
Headers: Authorization: Bearer {token}
Body:
{
  "title": "Updated Title",
  "message": "Updated message"
}
Expected: 200 OK
☐ WORKING
```

---

## 📋 ASSIGNMENTS ENDPOINTS

### 1. Create Assignment (Teacher)
```
POST http://localhost:5000/api/v1/assignments
Headers: Authorization: Bearer {token}
Body:
{
  "title": "Math Chapter 5",
  "description": "Solve all problems from page 45-50",
  "classId": "class_id_here",
  "subjectId": "subject_id_here",
  "dueDate": "2026-05-05",
  "attachments": []
}
Expected: 201 Created
☐ WORKING
```

### 2. List Assignments
```
GET http://localhost:5000/api/v1/assignments?classId=class_id
Headers: Authorization: Bearer {token}
Expected: 200 OK
☐ WORKING
```

### 3. Submit Assignment (Student)
```
POST http://localhost:5000/api/v1/assignments/:assignmentId/submit
Headers: Authorization: Bearer {token}
Body:
{
  "submissionText": "Solution text here",
  "attachments": []
}
Expected: 201 Created
☐ WORKING
```

---

## 🎯 QUIZ ENDPOINTS

### 1. Create Quiz (Teacher)
```
POST http://localhost:5000/api/v1/teacher/quizzes
Headers: Authorization: Bearer {token}
Body:
{
  "title": "Math Quiz - Chapter 5",
  "description": "Test your understanding",
  "classId": "class_id_here",
  "subjectId": "subject_id_here",
  "passingScore": 50,
  "questions": [
    {
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "correctOption": 1,
      "marks": 1
    }
  ]
}
Expected: 201 Created, returns quizId
☐ WORKING
```

### 2. Get Available Quizzes (Student)
```
GET http://localhost:5000/api/v1/student/quizzes
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns quizzes
☐ WORKING
```

### 3. Submit Quiz (Student)
```
POST http://localhost:5000/api/v1/student/quizzes/:quizId/submit
Headers: Authorization: Bearer {token}
Body:
{
  "answers": [
    { "questionId": "q1", "selectedOption": 1 },
    { "questionId": "q2", "selectedOption": 3 }
  ]
}
Expected: 201 Created
Response:
{
  "score": 80,
  "totalMarks": 100,
  "percentage": 80,
  "passed": true
}
☐ WORKING
```

### 4. Get Quiz Results
```
GET http://localhost:5000/api/v1/student/quizzes/:quizId/result
Headers: Authorization: Bearer {token}
Expected: 200 OK, returns score and answers
☐ WORKING
```

---

## 👨‍👩‍👧 PARENT PORTAL ENDPOINTS

### 1. Parent Dashboard
```
GET http://localhost:5000/api/v1/parent/dashboard
Headers: Authorization: Bearer {token} (parent role)
Expected: 200 OK
Response:
{
  "linkedChildren": [...],
  "attendanceSummary": {...},
  "feesDue": 5000,
  "recentResults": [...],
  "announcements": [...]
}
☐ WORKING
```

### 2. List Linked Children
```
GET http://localhost:5000/api/v1/parent/students
Headers: Authorization: Bearer {token} (parent role)
Expected: 200 OK, returns array of children
☐ WORKING
```

### 3. Get Child's Fees
```
GET http://localhost:5000/api/v1/parent/children/:studentId/fees
Headers: Authorization: Bearer {token} (parent role)
Expected: 200 OK
☐ WORKING
```

### 4. Get Child's Attendance
```
GET http://localhost:5000/api/v1/parent/children/:studentId/attendance?startDate=2026-04-01&endDate=2026-04-29
Headers: Authorization: Bearer {token} (parent role)
Expected: 200 OK, returns attendance
☐ WORKING
```

### 5. Get Child's Results
```
GET http://localhost:5000/api/v1/parent/children/:studentId/results?examId=exam_id
Headers: Authorization: Bearer {token} (parent role)
Expected: 200 OK
☐ WORKING
```

---

## 👨‍🏫 TEACHER PORTAL ENDPOINTS

### 1. Teacher Dashboard
```
GET http://localhost:5000/api/v1/teacher/dashboard
Headers: Authorization: Bearer {token} (teacher role)
Expected: 200 OK
Response:
{
  "assignedClasses": [...],
  "totalStudents": 150,
  "recentResults": [...],
  "pendingGrading": 5
}
☐ WORKING
```

### 2. Get Teacher's Classes
```
GET http://localhost:5000/api/v1/teacher/classes
Headers: Authorization: Bearer {token} (teacher role)
Expected: 200 OK
☐ WORKING
```

### 3. Get Class Students
```
GET http://localhost:5000/api/v1/teacher/classes/:classId/students
Headers: Authorization: Bearer {token} (teacher role)
Expected: 200 OK
☐ WORKING
```

---

## 🎓 ACADEMIC YEAR ENDPOINTS

### 1. Create Academic Year
```
POST http://localhost:5000/api/v1/academic-years
Headers: Authorization: Bearer {token}
Body:
{
  "name": "2026-2027",
  "startDate": "2026-04-01",
  "endDate": "2027-03-31",
  "isActive": true
}
Expected: 201 Created
☐ WORKING
```

### 2. List Academic Years
```
GET http://localhost:5000/api/v1/academic-years
Headers: Authorization: Bearer {token}
Expected: 200 OK
☐ WORKING
```

---

## 📄 SUBJECT ENDPOINTS

### 1. Create Subject
```
POST http://localhost:5000/api/v1/subjects
Headers: Authorization: Bearer {token}
Body:
{
  "name": "Mathematics",
  "code": "MATH101",
  "classId": "class_id_here"
}
Expected: 201 Created
☐ WORKING
```

### 2. List Subjects
```
GET http://localhost:5000/api/v1/subjects?classId=class_id
Headers: Authorization: Bearer {token}
Expected: 200 OK
☐ WORKING
```

---

## 🏆 CERTIFICATES ENDPOINTS

### 1. View Student Certificates
```
GET http://localhost:5000/api/v1/certificates/:studentId
Headers: Authorization: Bearer {token}
Expected: 200 OK
☐ WORKING
```

---

## 🔗 PARENT LINKING ENDPOINTS (Admin Only)

### 1. Link Parent to Student
```
POST http://localhost:5000/api/v1/parent-linking/:studentId/link/:parentId
Headers: Authorization: Bearer {token}
Body:
{
  "relationship": "FATHER",
  "isPrimary": true,
  "isEmergencyContact": true
}
Expected: 201 Created
☐ WORKING
```

### 2. Get Student's Parents
```
GET http://localhost:5000/api/v1/parent-linking/student/:studentId/parents
Headers: Authorization: Bearer {token}
Expected: 200 OK
☐ WORKING
```

### 3. Unlink Parent from Student
```
DELETE http://localhost:5000/api/v1/parent-linking/:studentId/unlink/:parentId
Headers: Authorization: Bearer {token}
Expected: 200 OK
☐ WORKING
```

---

## 📊 REPORT ENDPOINTS

### 1. Generate Report
```
GET http://localhost:5000/api/v1/reports/:reportType?classId=class_id&academicYearId=year_id
Headers: Authorization: Bearer {token}
reportType options: fee-collection, outstanding-fees, class-summary, student-statement, attendance-report
Expected: 200 OK
☐ WORKING
```

---

## ⚠️ ERROR RESPONSES GUIDE

### 401 Unauthorized
```
Response:
{
  "success": false,
  "message": "No token provided"
}
Fix: Add Authorization header with token
```

### 403 Forbidden
```
Response:
{
  "success": false,
  "message": "Access denied. You don't have permission"
}
Fix: Check user role and permissions
```

### 404 Not Found
```
Response:
{
  "success": false,
  "message": "Resource not found"
}
Fix: Check if ID is correct
```

### 400 Bad Request
```
Response:
{
  "success": false,
  "message": "Invalid input data",
  "errors": [...]
}
Fix: Validate request body
```

### 500 Server Error
```
Response:
{
  "success": false,
  "message": "Server error"
}
Fix: Check backend logs
```

---

## 🚀 TESTING TIPS

### Using Postman
1. Import all endpoints as collection
2. Set variable `{{baseUrl}}` = `http://localhost:5000/api/v1`
3. Set variable `{{token}}` = from login response
4. Use `{{baseUrl}}` in URLs
5. Use `{{token}}` in Authorization

### Using cURL
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"Admin@12345"}'
```

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Create new request
3. Paste endpoint URL
4. Add headers and body
5. Click Send

---

## 📋 FINAL VERIFICATION CHECKLIST

After testing all endpoints, confirm:

- [ ] All 50+ endpoints return expected status codes
- [ ] Authentication tokens are working
- [ ] Role-based access is enforced
- [ ] CRUD operations (Create, Read, Update, Delete) work
- [ ] Filtering and pagination work
- [ ] Error messages are clear
- [ ] No CORS errors
- [ ] Response times are acceptable (<500ms)
- [ ] Data is being saved to database correctly
- [ ] Parent portal can access only their children's data

---

## 📞 REPORTING ISSUES

If any endpoint fails:

1. **Note the endpoint URL**
2. **Record the request body**
3. **Copy the error response**
4. **Check user role permissions**
5. **Share with backend team with:**
   - Endpoint name
   - HTTP method
   - Request body
   - Error message
   - User role
   - User ID

---

## ✅ SIGN OFF

Frontend Team Member: _______________
Date: _______________
All Endpoints Working: ☐ YES  ☐ NO
Issues Found: _______________

---

**Backend Team Contact:** [Your Contact]  
**Last Updated:** April 29, 2026  
**Swagger Docs:** http://localhost:5000/api-docs
