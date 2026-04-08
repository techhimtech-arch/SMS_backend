# Quick Reference - Parent Portal API Endpoints

## 🔑 Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 📊 Parent Portal Endpoints

### Dashboard & Overview
**GET** `/api/v1/parent/dashboard`
- Get complete parent dashboard
- Shows: linked children, attendance summary, fees due, latest results, announcements
- Requires: `parent` role
- Returns: Dashboard data for all linked students

**GET** `/api/v1/parent/students`
- List all students linked to this parent
- Requires: `parent` role
- Returns: Array of all children

---

## 👨‍👩‍👧 Child-Specific Data Access

All child endpoints require:
1. ✅ Valid JWT token (parent role)
2. ✅ Parent-student link verified via `hasAccess()`
3. ✅ Returns 403 if parent not linked to student

### Attendance
**GET** `/api/v1/parent/children/:studentId/attendance?startDate=2026-04-01&endDate=2026-04-07`
- Get child's attendance records
- Query params: startDate, endDate (optional)
- Returns: Attendance records + summary (present/absent/late/percentage)

### Fees & Payments
**GET** `/api/v1/parent/children/:studentId/fees`
- Get child's fee information
- Returns: Total fee, paid amount, balance, due amount

### Exam Results
**GET** `/api/v1/parent/children/:studentId/results?examId=exam123`
- Get child's exam results
- Query params: examId (optional - filter by exam)
- Returns: Subject-wise marks, overall grade

### Announcements
**GET** `/api/v1/parent/children/:studentId/announcements`
- Get announcements for child's class
- Returns: School and class-level announcements

### Timetable
**GET** `/api/v1/parent/children/:studentId/timetable`
- Get child's class timetable
- Returns: Class schedule with periods

---

## 🔗 Parent-Linking Management (Admin Only)

### Link Parent to Student
**POST** `/api/v1/parent-linking/:studentId/link/:parentId`
- Admin creates parent-student link
- Requires: `admin` role
- Body (optional):
```json
{
  "relationship": "FATHER",
  "isPrimary": true,
  "isEmergencyContact": true,
  "canPickup": true
}
```

### Unlink Parent from Student
**DELETE** `/api/v1/parent-linking/:studentId/unlink/:parentId`
- Admin removes parent-student link
- Requires: `admin` role

### Get Parent's Children
**GET** `/api/v1/parent-linking/parent/:parentId/students`
- Get all students linked to a parent
- Accessible by: admin or the parent themselves
- Returns: List of all children

### Get Student's Parents
**GET** `/api/v1/parent-linking/student/:studentId/parents`
- Get all parents linked to a student
- Requires: `admin` role
- Returns: List of all parent relationships

---

## 🔒 Security Layers

Each endpoint enforces:

1. **Authentication** - JWT token validation
   - Response: 401 Unauthorized (no token)

2. **Authorization** - Role-based access
   - Response: 403 Forbidden (wrong role)

3. **Relationship Verification** - Parent-student link check
   - Response: 403 Forbidden (not linked to student)

### Example Security Flow
```
Parent A tries to access Child B's attendance (not their child)
    ↓
Authentication: ✅ Token valid
    ↓
Authorization: ✅ User has parent role
    ↓
Relationship Check: ❌ Parent A not linked to Child B
    ↓
Result: 403 Forbidden - "Access denied. You are not linked to this student."
```

---

## 📝 Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden (Wrong Role)
```json
{
  "success": false,
  "message": "Access denied. Parent role required."
}
```

### 403 Forbidden (Not Linked)
```json
{
  "success": false,
  "message": "Access denied. You are not linked to this student."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Student not found"
}
```

---

## ✅ Success Response Format

All success responses follow:
```json
{
  "success": true,
  "data": {
    // endpoint-specific data
  }
}
```

---

## 🧪 Quick Test Examples

### Get Attendance (with valid parent token)
```bash
curl -X GET http://localhost:5000/api/v1/parent/children/612f3c1b/attendance \
  -H "Authorization: Bearer eyJhbGc..."
```

### Get Fees (with valid parent token)
```bash
curl -X GET http://localhost:5000/api/v1/parent/children/612f3c1b/fees \
  -H "Authorization: Bearer eyJhbGc..."
```

### Link Parent to Student (admin only)
```bash
curl -X POST http://localhost:5000/api/v1/parent-linking/612f3c1b/link/612f3d2b \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "relationship": "FATHER",
    "isPrimary": true,
    "isEmergencyContact": true,
    "canPickup": true
  }'
```

---

## 📱 Frontend Integration Checklist

- [ ] Import JWT token from login response
- [ ] Add Authorization header to all requests: `Authorization: Bearer ${token}`
- [ ] Handle 401 errors → redirect to login
- [ ] Handle 403 errors → show "Access Denied" message
- [ ] Display parent dashboard on login
- [ ] Show list of linked children
- [ ] Implement child detail page with tabs:
  - [ ] Attendance
  - [ ] Fees
  - [ ] Results
  - [ ] Announcements
  - [ ] Timetable

---

**API Base URL:** `http://localhost:5000/api/v1`  
**Status:** ✅ Operational  
**Last Updated:** April 7, 2026
