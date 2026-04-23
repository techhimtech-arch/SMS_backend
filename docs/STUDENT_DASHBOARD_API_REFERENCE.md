# Student Dashboard API - Complete Response Reference
**For Frontend Team**

---

## 📋 API Endpoint

```
GET /api/v1/student/dashboard
```

**Headers:**
```
Authorization: Bearer <STUDENT_TOKEN>
Content-Type: application/json
```

---

## ✅ Complete Response Structure

```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "raman thakur",
      "class": "Class 5",
      "section": "A",
      "rollNumber": "1",
      "admissionNumber": "admn123",
      "status": "ENROLLED"
    },
    
    "attendance": {
      "totalDays": 20,
      "present": 18,
      "absent": 1,
      "late": 1,
      "percentage": "90.00"
    },
    
    "fees": {
      "totalAmount": 50000,
      "paidAmount": 30000,
      "balanceAmount": 20000,
      "dueDate": "2026-05-31T00:00:00.000Z"
    },
    
    "assignments": {
      "pending": 3,
      "completed": 5,
      "overdue": 1,
      "total": 8
    },
    
    "recentResults": [
      {
        "_id": "507f1f77bcf86cd799439022",
        "examId": {
          "_id": "507f1f77bcf86cd799439033",
          "name": "Half Yearly Exam"
        },
        "subjectId": {
          "_id": "507f1f77bcf86cd799439044",
          "name": "Mathematics"
        },
        "totalMarks": 100,
        "obtainedMarks": 85,
        "percentage": 85,
        "grade": "A",
        "status": "PUBLISHED",
        "createdAt": "2026-04-20T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439055",
        "examId": {
          "_id": "507f1f77bcf86cd799439066",
          "name": "Quarterly Exam"
        },
        "subjectId": {
          "_id": "507f1f77bcf86cd799439077",
          "name": "Science"
        },
        "totalMarks": 100,
        "obtainedMarks": 72,
        "percentage": 72,
        "grade": "B",
        "status": "PUBLISHED",
        "createdAt": "2026-04-15T09:00:00.000Z"
      }
    ],
    
    "upcomingExams": [
      {
        "_id": "507f1f77bcf86cd799439088",
        "title": "Final Exam - Mathematics",
        "description": "Final examination for Class 5 Mathematics",
        "subjectId": {
          "_id": "507f1f77bcf86cd799439044",
          "name": "Mathematics"
        },
        "totalMarks": 100,
        "passingMarks": 40,
        "examDate": "2026-05-10T09:00:00.000Z",
        "duration": 120,
        "classId": "507f1f77bcf86cd799439099",
        "isActive": true
      },
      {
        "_id": "507f1f77bcf86cd799439100",
        "title": "Final Exam - English",
        "description": "Final examination for Class 5 English",
        "subjectId": {
          "_id": "507f1f77bcf86cd799439111",
          "name": "English"
        },
        "totalMarks": 100,
        "passingMarks": 40,
        "examDate": "2026-05-12T09:00:00.000Z",
        "duration": 120,
        "classId": "507f1f77bcf86cd799439099",
        "isActive": true
      }
    ],
    
    "unreadAnnouncements": 2
  }
}
```

---

## 📊 Field Descriptions

### Student Information
| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | Student Profile ID |
| `name` | String | Student's full name |
| `class` | String | Class name (e.g., "Class 5") |
| `section` | String | Section (e.g., "A", "B") |
| `rollNumber` | String | Roll number in class |
| `admissionNumber` | String | Admission number |
| `status` | String | Enrollment status (ENROLLED, PROMOTED, etc.) |

### Attendance
| Field | Type | Description |
|-------|------|-------------|
| `totalDays` | Number | Total school days in current month |
| `present` | Number | Days present |
| `absent` | Number | Days absent |
| `late` | Number | Days came late |
| `percentage` | String | Attendance percentage |

### Fees
| Field | Type | Description |
|-------|------|-------------|
| `totalAmount` | Number | Total fees amount |
| `paidAmount` | Number | Amount already paid |
| `balanceAmount` | Number | Remaining amount to pay |
| `dueDate` | Date | Payment due date |

### Assignments
| Field | Type | Description |
|-------|------|-------------|
| `pending` | Number | Number of assignments not submitted |
| `completed` | Number | Number of assignments submitted |
| `overdue` | Number | Number of overdue assignments |
| `total` | Number | Total assignments |

### Recent Results
Array of exam results with:
| Field | Type | Description |
|-------|------|-------------|
| `examId.name` | String | Exam name |
| `subjectId.name` | String | Subject name |
| `totalMarks` | Number | Total marks for exam |
| `obtainedMarks` | Number | Marks obtained |
| `percentage` | Number | Percentage score |
| `grade` | String | Grade (A, B, C, D, F) |
| `status` | String | Result status |

### Upcoming Exams
Array of upcoming exams with:
| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Exam title |
| `subjectId.name` | String | Subject name |
| `totalMarks` | Number | Total marks |
| `passingMarks` | Number | Passing marks |
| `examDate` | Date | Exam date & time |
| `duration` | Number | Duration in minutes |

### Announcements
| Field | Type | Description |
|-------|------|-------------|
| `unreadAnnouncements` | Number | Count of unread announcements |

---

## 🎨 Frontend Display Guide

### Dashboard Layout (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│ Welcome, [student.name]                                     │
│ [student.class] - [student.section] | Roll: [rollNumber]   │
├─────────────────────────────────────────────────────────────┤
│ Row 1:                                                       │
│ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐│
│ │ Attendance      │ │ Assignments     │ │ Upcoming Exams   ││
│ │ ═══════════     │ │ ═══════════════ │ │ ═════════════════││
│ │ 90%             │ │ Pending:    3   │ │ 2 exams          ││
│ │ 18/20 days      │ │ Completed:  5   │ │ Mathematics      ││
│ │ [Progress bar]  │ │ Overdue:    1   │ │ English          ││
│ └─────────────────┘ └─────────────────┘ └──────────────────┘│
│                                                              │
│ Row 2:                                                       │
│ ┌──────────────────────┐ ┌─────────────────────────────────┐│
│ │ Fees                 │ │ Announcements                   ││
│ │ ════════════         │ │ ═════════════════════════════   ││
│ │ Total: ₹50,000       │ │ 2 Unread announcements          ││
│ │ Paid: ₹30,000        │ │                                 ││
│ │ Balance: ₹20,000     │ │ [View All Announcements]        ││
│ │ Due: 31-May-2026     │ │                                 ││
│ └──────────────────────┘ └─────────────────────────────────┘│
│                                                              │
│ Row 3:                                                       │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Recent Results                                           ││
│ │ ══════════════════════════════════════════════════════   ││
│ │                                                          ││
│ │ Half Yearly Exam - Mathematics: 85% (Grade A)           ││
│ │ Quarterly Exam - Science: 72% (Grade B)                 ││
│ │                                                          ││
│ │ [View All Results]                                       ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Frontend Implementation Example

### React Component
```javascript
import { useState, useEffect } from 'react';

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('authToken');
      
      try {
        const response = await fetch('/api/v1/student/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard');
        }

        const data = await response.json();
        setDashboard(data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!dashboard) return <div>No data available</div>;

  return (
    <div className="dashboard">
      {/* Student Info */}
      <div className="student-info">
        <h1>Welcome, {dashboard.student.name}</h1>
        <p>Class {dashboard.student.class} - Section {dashboard.student.section}</p>
        <p>Roll Number: {dashboard.student.rollNumber}</p>
      </div>

      {/* Attendance Card */}
      <div className="card attendance">
        <h3>Attendance</h3>
        <p className="percentage">{dashboard.attendance.percentage}%</p>
        <p>{dashboard.attendance.present}/{dashboard.attendance.totalDays} days</p>
        <div className="progress-bar">
          <div 
            className="fill"
            style={{width: `${dashboard.attendance.percentage}%`}}
          />
        </div>
      </div>

      {/* Assignments Card */}
      <div className="card assignments">
        <h3>Assignments</h3>
        <div className="stats">
          <p>Pending: <strong>{dashboard.assignments.pending}</strong></p>
          <p>Completed: <strong>{dashboard.assignments.completed}</strong></p>
          <p>Overdue: <strong>{dashboard.assignments.overdue}</strong></p>
        </div>
      </div>

      {/* Fees Card */}
      <div className="card fees">
        <h3>Fees</h3>
        <p>Total: ₹{dashboard.fees.totalAmount.toLocaleString()}</p>
        <p>Paid: ₹{dashboard.fees.paidAmount.toLocaleString()}</p>
        <p style={{color: 'red'}}>
          Balance: ₹{dashboard.fees.balanceAmount.toLocaleString()}
        </p>
        <p>Due: {new Date(dashboard.fees.dueDate).toLocaleDateString()}</p>
      </div>

      {/* Recent Results */}
      <div className="card results">
        <h3>Recent Results</h3>
        {dashboard.recentResults.map(result => (
          <div key={result._id} className="result-item">
            <p>
              {result.examId.name} - {result.subjectId.name}
            </p>
            <p>
              {result.obtainedMarks}/{result.totalMarks} ({result.percentage}%)
            </p>
            <p>Grade: {result.grade}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Exams */}
      <div className="card exams">
        <h3>Upcoming Exams</h3>
        {dashboard.upcomingExams.length > 0 ? (
          dashboard.upcomingExams.map(exam => (
            <div key={exam._id} className="exam-item">
              <p><strong>{exam.title}</strong></p>
              <p>{new Date(exam.examDate).toLocaleDateString()}</p>
              <p>Total Marks: {exam.totalMarks}</p>
            </div>
          ))
        ) : (
          <p>No upcoming exams</p>
        )}
      </div>

      {/* Announcements */}
      <div className="card announcements">
        <h3>Announcements</h3>
        <p>You have {dashboard.unreadAnnouncements} unread announcements</p>
      </div>
    </div>
  );
}
```

---

## 🧪 cURL Test

```bash
curl -X GET "http://localhost:5000/api/v1/student/dashboard" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## ✅ What's Included in Response

| Component | Included | Status |
|-----------|----------|--------|
| Class Information | ✅ | Complete with roll number & status |
| Attendance | ✅ | Current month statistics |
| Fees | ✅ | Payment details |
| Assignments | ✅ | Pending, completed, overdue count |
| Recent Results | ✅ | Last 5 exam results |
| Upcoming Exams | ✅ | Next 3 exams |
| Announcements | ✅ | Unread count |

---

## 📱 UI Components to Build

- [ ] **Student Info Card** - Name, class, section, roll number
- [ ] **Attendance Card** - Percentage with progress bar, days breakdown
- [ ] **Assignment Status** - Pending/Completed/Overdue counts
- [ ] **Fee Details** - Total, paid, balance amount
- [ ] **Recent Results** - List of exam results with grades
- [ ] **Upcoming Exams** - List of exams with dates
- [ ] **Announcements Badge** - Unread count indicator

---

## 🔗 Related APIs

- `GET /api/v1/student/quizzes` - Student's available quizzes
- `GET /api/v1/student/homework` - Student's homework assignments
- `GET /api/v1/student/attendance` - Detailed attendance records
- `GET /api/v1/student/results` - All exam results

---

## 💡 Notes for Frontend

1. **Attendance Percentage** - Returned as string, convert to number if needed
2. **Dates** - All dates are ISO 8601 format, use `new Date()` to parse
3. **Fee Status** - If `balanceAmount > 0`, show payment reminder
4. **Overdue Assignments** - Highlight in red if count > 0
5. **Unread Announcements** - Show badge with count
6. **Roll Number** - May be '-' if not assigned

---

**This API gives frontend everything needed for a complete student dashboard! 🚀**
