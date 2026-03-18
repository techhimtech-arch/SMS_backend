# Dashboard API Date Filtering Guide

## 📋 Overview

Ye guide explain karti hai ki kaise Dashboard APIs mein date filtering implement ki gayi hai, taaki admin aur teachers purani dates ka data dekh sake.

## 🚀 Problem Statement

**Before:** Dashboard APIs sirf today ka data show karte the  
**After:** Admin/Teacher kisi bhi date range ka data dekh sakte hain

---

## 🔗 Updated API Endpoints

### **👨‍💼 School Admin Dashboard**
```http
GET /api/v1/dashboard?startDate=2024-03-01&endDate=2024-03-15
Authorization: Bearer <token>
```

### **👨‍🏫 Teacher Dashboard**
```http
GET /api/v1/dashboard/teacher?startDate=2024-03-01&endDate=2024-03-15
Authorization: Bearer <token>
```

---

## 📅 Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `startDate` | String | No | Start date (YYYY-MM-DD) | `2024-03-01` |
| `endDate` | String | No | End date (YYYY-MM-DD) | `2024-03-15` |

### **Default Behavior:**
- Agar **date parameters nahi diye**: Today ka data
- Agar **date parameters diye**: Custom date range ka data

---

## 📊 Response Structure

### **Updated Response with Date Info:**
```json
{
  "success": true,
  "data": {
    "dateRange": {
      "startDate": "2024-03-01",
      "endDate": "2024-03-15", 
      "isCustomRange": true
    },
    "stats": {
      "totalStudents": 250,
      "totalTeachers": 15,
      "totalClasses": 8,
      "totalSections": 16
    },
    "attendance": {
      "totalMarked": 3200,
      "presentCount": 2880,
      "absentCount": 320,
      "attendancePercentage": 90.0
    },
    "fees": {
      "totalFeesCollected": 1250000,
      "totalPendingFees": 250000
    },
    "exams": {
      "totalExams": 12,
      "totalResultsEntered": 8
    }
  }
}
```

---

## 🛠️ Frontend Integration

### **1. Basic Date Filter Component**
```javascript
const DashboardDateFilter = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const fetchDashboardData = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/v1/dashboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      updateDashboard(data.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  return (
    <div className="date-filter">
      <input
        type="date"
        value={dateRange.startDate}
        onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
        placeholder="Start Date"
      />
      <input
        type="date"
        value={dateRange.endDate}
        onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
        placeholder="End Date"
      />
      <button onClick={fetchDashboardData}>Apply Filter</button>
    </div>
  );
};
```

### **2. Quick Date Range Buttons**
```javascript
const QuickDateRanges = ({ onDateRangeSelect }) => {
  const ranges = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: 1 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'This Month', days: 'current' },
    { label: 'Last Month', days: 'previous' }
  ];

  const getDateRange = (range) => {
    const today = new Date();
    let startDate, endDate;

    switch(range) {
      case 'current':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'previous':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - range);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  return (
    <div className="quick-ranges">
      {ranges.map(range => (
        <button
          key={range.label}
          onClick={() => onDateRangeSelect(getDateRange(range.days))}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};
```

### **3. Complete Dashboard Component**
```javascript
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (customDateRange = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const range = customDateRange || dateRange;
      
      if (range.startDate) params.append('startDate', range.startDate);
      if (range.endDate) params.append('endDate', range.endDate);

      const response = await fetch(`/api/v1/dashboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      setDashboardData(result.data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    fetchDashboardData(newRange);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>School Dashboard</h2>
        <DashboardDateFilter 
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
        <QuickDateRanges onDateRangeSelect={handleDateRangeChange} />
      </div>

      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : dashboardData ? (
        <DashboardContent data={dashboardData} />
      ) : (
        <div className="no-data">No data available</div>
      )}
    </div>
  );
};
```

---

## 📈 Data Visualization Examples

### **Weekly Attendance Chart with Date Filter**
```javascript
const AttendanceChart = ({ attendanceData, dateRange }) => {
  const chartData = useMemo(() => {
    // Process attendance data based on date range
    return generateWeeklyData(attendanceData, dateRange);
  }, [attendanceData, dateRange]);

  return (
    <div className="attendance-chart">
      <h3>Attendance ({dateRange.startDate} - {dateRange.endDate})</h3>
      <BarChart data={chartData}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="present" fill="#10b981" name="Present" />
        <Bar dataKey="absent" fill="#ef4444" name="Absent" />
      </BarChart>
    </div>
  );
};
```

### **Fee Collection Progress**
```javascript
const FeeCollectionChart = ({ feesData, dateRange }) => {
  const collected = feesData.totalFeesCollected;
  const pending = feesData.totalPendingFees;
  const total = collected + pending;

  return (
    <div className="fee-chart">
      <h3>Fee Collection ({dateRange.startDate} - {dateRange.endDate})</h3>
      <PieChart>
        <Pie
          data={[
            { name: 'Collected', value: collected, color: '#10b981' },
            { name: 'Pending', value: pending, color: '#f59e0b' }
          ]}
          dataKey="value"
          nameKey="name"
        >
          <Cell fill="#10b981" />
          <Cell fill="#f59e0b" />
        </Pie>
        <Tooltip />
      </PieChart>
      
      <div className="fee-stats">
        <div className="collected">
          <span>Collected: ₹{collected.toLocaleString()}</span>
          <span>{((collected/total)*100).toFixed(1)}%</span>
        </div>
        <div className="pending">
          <span>Pending: ₹{pending.toLocaleString()}</span>
          <span>{((pending/total)*100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
```

---

## 🎯 Use Cases

### **1. Monthly Report Generation**
```javascript
const generateMonthlyReport = async (month, year) => {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
  
  const response = await fetch(
    `/api/v1/dashboard?startDate=${startDate}&endDate=${endDate}`,
    { headers: { 'Authorization': `Bearer ${token}` }}
  );
  
  return await response.json();
};
```

### **2. Academic Year Comparison**
```javascript
const compareAcademicYears = async (year1, year2) => {
  const year1Start = `${year1}-04-01`; // Assuming academic year starts in April
  const year1End = `${year1}-03-31`;
  const year2Start = `${year2}-04-01`;
  const year2End = `${year2}-03-31`;

  const [year1Data, year2Data] = await Promise.all([
    fetch(`/api/v1/dashboard?startDate=${year1Start}&endDate=${year1End}`),
    fetch(`/api/v1/dashboard?startDate=${year2Start}&endDate=${year2End}`)
  ]);

  return {
    year1: await year1Data.json(),
    year2: await year2Data.json()
  };
};
```

---

## 🔍 Advanced Features

### **1. Real-time Dashboard Updates**
```javascript
const useRealTimeDashboard = (dateRange) => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:5000/dashboard-updates`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (isInDateRange(update.timestamp, dateRange)) {
        setData(prevData => updateDashboardData(prevData, update));
      }
    };
    
    return () => ws.close();
  }, [dateRange]);
  
  return data;
};
```

### **2. Export Dashboard Data**
```javascript
const exportDashboardData = async (dateRange, format = 'excel') => {
  const params = new URLSearchParams({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    format: format
  });

  const response = await fetch(`/api/v1/dashboard/export?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
    a.click();
  }
};
```

---

## 🚨 Important Notes

### **Performance Considerations:**
1. **Large Date Ranges**: 1+ year ka data slow ho sakta hai
2. **Database Indexing**: Date fields pe index zaroori hai
3. **Caching**: Frequent requests ke liye caching implement karein

### **Validation Rules:**
1. **Date Format**: YYYY-MM-DD hi valid hai
2. **Date Range**: Start date <= End date hona chahiye
3. **Future Dates**: Future dates ka data empty hoga

### **Error Responses:**
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```

```json
{
  "success": false,
  "message": "Start date cannot be after end date"
}
```

---

## 📱 Mobile Responsive Design

### **Mobile Date Picker**
```javascript
const MobileDateFilter = () => {
  return (
    <div className="mobile-date-filter">
      <input
        type="date"
        className="mobile-date-input"
        max={new Date().toISOString().split('T')[0]}
      />
      <input
        type="date"
        className="mobile-date-input"
        max={new Date().toISOString().split('T')[0]}
      />
    </div>
  );
};
```

---

## 🔧 Troubleshooting

### **Common Issues:**
1. **Empty Data**: Date range mein koi records nahi
2. **Slow Response**: Bahut bada date range
3. **Time Zone Issues**: Server aur client time zone difference

### **Debug Steps:**
1. Console mein date parameters check karein
2. Network tab mein API response dekhain
3. Database queries log check karein

---

## 📞 API Support

### **Test Examples:**
```bash
# Today's data (default)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/v1/dashboard

# Custom date range
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/v1/dashboard?startDate=2024-03-01&endDate=2024-03-15"

# Last 30 days
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/v1/dashboard?startDate=2024-02-18&endDate=2024-03-18"
```

---

**Last Updated:** March 2026  
**Version:** 2.0 (With Date Filtering)  
**Maintained by:** SMS Backend Team

## 🎉 Summary

Ab dashboard APIs fully flexible hain! Admin aur teachers kisi bhi date range ka data dekh sakte hain:

- ✅ **Today ka data** (default behavior)
- ✅ **Custom date range** filtering  
- ✅ **Quick date ranges** (Last 7 days, This month, etc.)
- ✅ **Date info** in response
- ✅ **Same endpoints**, enhanced functionality
