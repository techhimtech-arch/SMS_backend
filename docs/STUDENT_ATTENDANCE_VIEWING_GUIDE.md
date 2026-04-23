# Student Attendance Viewing Guide

## 📱 Attendance Dekhne Ke Tarike

### **Option 1: Dashboard Mein Attendance Summary**

**API:** `GET /api/v1/student/dashboard`

```bash
curl -X GET "http://localhost:5000/api/v1/student/dashboard" \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

**Response (Current Month Only):**
```json
{
  "success": true,
  "data": {
    "attendance": {
      "totalDays": 20,
      "present": 18,
      "absent": 1,
      "late": 1,
      "percentage": "90.00"
    }
  }
}
```

**Display:** 📊 Dashboard Card में
```
┌──────────────────────┐
│ Attendance           │
│ ════════════════════ │
│ This Month: 90%      │
│ 18/20 days present   │
│ [Progress Bar]       │
└──────────────────────┘
```

---

### **Option 2: Complete Attendance History** ⭐ **DETAILED VIEW**

**API:** `GET /api/v1/student/attendance`

```bash
# सभी attendance records (paginated)
curl -X GET "http://localhost:5000/api/v1/student/attendance?page=1&limit=50" \
  -H "Authorization: Bearer STUDENT_TOKEN"

# किसी specific date range के लिए
curl -X GET "http://localhost:5000/api/v1/student/attendance?startDate=2026-04-01&endDate=2026-04-30" \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Records per page (default: 50) |
| `startDate` | Date | Start date (YYYY-MM-DD) |
| `endDate` | Date | End date (YYYY-MM-DD) |

**Response (Full History):**
```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "date": "2026-04-23T00:00:00.000Z",
        "status": "Present",
        "classId": {
          "_id": "507f1f77bcf86cd799439022",
          "name": "Class 5"
        },
        "sectionId": {
          "_id": "507f1f77bcf86cd799439033",
          "name": "Section A"
        },
        "remarks": "On time"
      },
      {
        "_id": "507f1f77bcf86cd799439044",
        "date": "2026-04-22T00:00:00.000Z",
        "status": "Present",
        "classId": {
          "_id": "507f1f77bcf86cd799439022",
          "name": "Class 5"
        },
        "sectionId": {
          "_id": "507f1f77bcf86cd799439033",
          "name": "Section A"
        },
        "remarks": "Late arrival"
      },
      {
        "_id": "507f1f77bcf86cd799439055",
        "date": "2026-04-20T00:00:00.000Z",
        "status": "Absent",
        "classId": {
          "_id": "507f1f77bcf86cd799439022",
          "name": "Class 5"
        },
        "sectionId": {
          "_id": "507f1f77bcf86cd799439033",
          "name": "Section A"
        },
        "remarks": "Not present"
      }
    ],
    "statistics": {
      "totalDays": 20,
      "present": 18,
      "absent": 1,
      "late": 1,
      "halfDay": 0,
      "leave": 0,
      "percentage": "90.00"
    }
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalRecords": 20
  }
}
```

---

## 🎯 Frontend Implementation

### **Dashboard Card (Quick View)**

```javascript
import { useState, useEffect } from 'react';

export default function AttendanceDashboard() {
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const response = await fetch('/api/v1/student/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      setAttendance(data.data.attendance);
    };
    
    fetchDashboard();
  }, []);

  return (
    <div className="attendance-card">
      <h3>Attendance (This Month)</h3>
      <div className="percentage">{attendance?.percentage}%</div>
      <p>{attendance?.present}/{attendance?.totalDays} days present</p>
      <div className="progress-bar">
        <div style={{ width: `${attendance?.percentage}%` }} />
      </div>
      <p>Absent: {attendance?.absent} | Late: {attendance?.late}</p>
      <a href="/attendance-detail">View Full History →</a>
    </div>
  );
}
```

---

### **Detailed Attendance Page**

```javascript
import { useState, useEffect } from 'react';

export default function AttendanceDetail() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAttendance = async () => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', 30);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`/api/v1/student/attendance?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    const data = await response.json();
    setRecords(data.data.attendance);
    setStats(data.data.statistics);
  };

  useEffect(() => {
    fetchAttendance();
  }, [page]);

  return (
    <div className="attendance-detail">
      <h2>Your Attendance History</h2>
      
      {/* Filter Section */}
      <div className="filters">
        <input 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="From Date"
        />
        <input 
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="To Date"
        />
        <button onClick={() => {setPage(1); fetchAttendance();}}>
          Search
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat">
          <h4>Total Days</h4>
          <p className="big">{stats?.totalDays}</p>
        </div>
        <div className="stat">
          <h4>Present</h4>
          <p className="big" style={{color: 'green'}}>{stats?.present}</p>
        </div>
        <div className="stat">
          <h4>Absent</h4>
          <p className="big" style={{color: 'red'}}>{stats?.absent}</p>
        </div>
        <div className="stat">
          <h4>Late</h4>
          <p className="big" style={{color: 'orange'}}>{stats?.late}</p>
        </div>
        <div className="stat">
          <h4>Percentage</h4>
          <p className="big" style={{color: '#007bff'}}>{stats?.percentage}%</p>
        </div>
      </div>

      {/* Attendance Records */}
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Class</th>
            <th>Section</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record._id} className={`status-${record.status.toLowerCase()}`}>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>
                <span className={`badge badge-${record.status.toLowerCase()}`}>
                  {record.status}
                </span>
              </td>
              <td>{record.classId.name}</td>
              <td>{record.sectionId.name}</td>
              <td>{record.remarks || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button 
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## 💄 CSS Styling

```css
.attendance-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.percentage {
  font-size: 48px;
  font-weight: bold;
  color: #007bff;
  margin: 10px 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-bar div {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #45a049);
  transition: width 0.3s ease;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.stat {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.stat .big {
  font-size: 32px;
  font-weight: bold;
  margin: 5px 0;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.attendance-table th {
  background: #f5f5f5;
  padding: 12px;
  text-align: left;
  font-weight: 600;
}

.attendance-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e0e0e0;
}

.status-present { background-color: #f0f8f0; }
.status-absent { background-color: #fff0f0; }
.status-late { background-color: #fff8f0; }

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge-present {
  background: #d4edda;
  color: #155724;
}

.badge-absent {
  background: #f8d7da;
  color: #721c24;
}

.badge-late {
  background: #fff3cd;
  color: #856404;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background: #007bff;
  color: white;
}
```

---

## 📊 What Student Can See

### **Dashboard (Quick Overview)**
- ✅ This month's attendance percentage
- ✅ Present/Absent/Late count
- ✅ Progress bar visual
- ✅ Link to see full history

### **Detailed History Page (Full Analysis)**
- ✅ Complete attendance records (date-wise)
- ✅ Each day's status (Present, Absent, Late, etc.)
- ✅ Class & Section info
- ✅ Remarks/Notes
- ✅ Filter by date range
- ✅ Overall statistics
- ✅ Pagination (50 records per page)

---

## 🔗 API Flow

```
Student Login
    ↓
Dashboard Page
    ├─→ GET /api/v1/student/dashboard
    │   └─→ Shows: Month's attendance summary
    │
    └─→ "View Full History" link
        ↓
        Attendance Detail Page
        └─→ GET /api/v1/student/attendance?startDate=...&endDate=...
            └─→ Shows: Complete records, statistics, filters
```

---

## ✅ Ready to Use!

**Ab frontend mein ye dono endpoints use kar sakte ho:**

1. **Dashboard mein:** Month ka summary (quick view)
2. **Attendance page mein:** Complete history with filters

**Data aaj mark kiya, to dashboard aur attendance dono mein dikhega! 🎉**
