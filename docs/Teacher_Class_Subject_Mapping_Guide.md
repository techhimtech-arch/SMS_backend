# Teacher-Class-Subject Mapping Guide

## 📋 Overview

Ye guide explain karti hai ki kaise teachers ko classes aur subjects assign kiye jaate hain aur kya API endpoints available hain frontend integration ke liye.

## 🏗️ System Architecture

### **Two Types of Teacher Assignments:**

1. **📚 Subject Teacher Assignment** - Kisi specific subject ko padhana
2. **👨‍🏫 Class Teacher Assignment** - Poore class ke incharge hona

---

## 📊 Database Models

### **1. TeacherAssignment Model**
```javascript
{
  teacherId: ObjectId,     // User ID (teacher)
  classId: ObjectId,       // Class ID  
  sectionId: ObjectId,     // Section ID
  subjectId: ObjectId,     // Subject ID
  schoolId: ObjectId,      // School ID
  isActive: Boolean        // Status
}
```

### **2. ClassTeacherAssignment Model**
```javascript
{
  teacherId: ObjectId,     // User ID (teacher)
  classId: ObjectId,       // Class ID
  sectionId: ObjectId,     // Section ID  
  schoolId: ObjectId,      // School ID
  academicYear: String,    // "2024-25"
  isActive: Boolean        // Status
}
```

---

## 🔗 API Endpoints

### **📚 Subject Teacher Assignment**

#### **Create Subject Assignment**
```http
POST /api/v1/teacher-assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "teacherId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "classId": "64f1a2b3c4d5e6f7g8h9i0j2", 
  "sectionId": "64f1a2b3c4d5e6f7g8h9i0j3",
  "subjectId": "64f1a2b3c4d5e6f7g8h9i0j4"
}
```

#### **Get All Teacher Assignments**
```http
GET /api/v1/teacher-assignments
Authorization: Bearer <token>
```

#### **Get Assignments by Teacher**
```http
GET /api/v1/teacher-assignments/teacher/:teacherId
Authorization: Bearer <token>
```

#### **Get Assignments by Class**
```http
GET /api/v1/teacher-assignments/class/:classId
Authorization: Bearer <token>
```

#### **Update Assignment**
```http
PATCH /api/v1/teacher-assignments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "isActive": false
}
```

---

### **👨‍🏫 Class Teacher Assignment**

#### **Create Class Teacher Assignment**
```http
POST /api/v1/class-teacher-assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "teacherId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "classId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "sectionId": "64f1a2b3c4d5e6f7g8h9i0j3", 
  "academicYear": "2024-25"
}
```

#### **Get All Class Teacher Assignments**
```http
GET /api/v1/class-teacher-assignments
Authorization: Bearer <token>
```

#### **Get Class Teacher by Class**
```http
GET /api/v1/class-teacher-assignments/class/:classId/section/:sectionId
Authorization: Bearer <token>
```

---

## 🎯 Role-Based Subject Access

### **GET /api/v1/subjects** - Same Endpoint, Different Data

#### **👨‍💼 School Admin Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "...",
      "name": "Mathematics",
      "classId": {
        "_id": "...",
        "name": "Class 10A"
      }
    }
  ],
  "role": "school_admin"
}
```

#### **👨‍🏫 Teacher Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "name": "Mathematics", 
      "classId": {
        "_id": "...",
        "name": "Class 10A"
      }
    }
  ],
  "role": "teacher"
}
```

#### **💰 Accountant Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [...],
  "role": "accountant"
}
```

---

## 🛠️ Frontend Integration Steps

### **Step 1: Get Available Data**
```javascript
// Get all classes, sections, subjects, and teachers
const classes = await fetch('/api/v1/classes');
const sections = await fetch('/api/v1/sections'); 
const subjects = await fetch('/api/v1/subjects');
const teachers = await fetch('/api/v1/users/role/teacher');
```

### **Step 2: Create Subject Assignment**
```javascript
const createSubjectAssignment = async (assignmentData) => {
  try {
    const response = await fetch('/api/v1/teacher-assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(assignmentData)
    });
    
    return await response.json();
  } catch (error) {
    console.error('Assignment failed:', error);
  }
};
```

### **Step 3: Create Class Teacher Assignment**
```javascript
const createClassTeacherAssignment = async (assignmentData) => {
  try {
    const response = await fetch('/api/v1/class-teacher-assignments', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(assignmentData)
    });
    
    return await response.json();
  } catch (error) {
    console.error('Class teacher assignment failed:', error);
  }
};
```

---

## 📝 Frontend Implementation Example

### **Assignment Form Component**
```javascript
const AssignmentForm = () => {
  const [formData, setFormData] = useState({
    teacherId: '',
    classId: '',
    sectionId: '', 
    subjectId: '',
    academicYear: '2024-25'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (assignmentType === 'subject') {
      await createSubjectAssignment(formData);
    } else {
      await createClassTeacherAssignment(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={formData.teacherId} onChange={(e) => 
        setFormData({...formData, teacherId: e.target.value})}>
        <option value="">Select Teacher</option>
        {teachers.map(teacher => (
          <option key={teacher._id} value={teacher._id}>
            {teacher.name}
          </option>
        ))}
      </select>
      
      <select value={formData.classId} onChange={(e) => 
        setFormData({...formData, classId: e.target.value})}>
        <option value="">Select Class</option>
        {classes.map(cls => (
          <option key={cls._id} value={cls._id}>
            {cls.name}
          </option>
        ))}
      </select>
      
      {/* Other fields... */}
      
      <button type="submit">Assign Teacher</button>
    </form>
  );
};
```

---

## 🎨 UI/UX Recommendations

### **1. Assignment Dashboard**
- **Table View** with filters for Class, Section, Subject
- **Search** by teacher name
- **Status indicators** (Active/Inactive)

### **2. Assignment Form**
- **Multi-select** for multiple subjects
- **Academic Year** selector
- **Validation** for duplicate assignments

### **3. Teacher Profile View**
- **Assigned Classes** section
- **Subjects** they teach
- **Class Teacher** responsibilities

---

## 🔍 Validation Rules

### **Business Logic:**
1. **One Subject Teacher** per class-section-subject combination
2. **One Class Teacher** per class-section per academic year  
3. **Teacher** cannot be assigned to same subject twice in same class
4. **Active assignments** only considered for subject access

### **Error Responses:**
```json
{
  "success": false,
  "message": "Teacher already assigned to this subject in this class"
}
```

---

## 📊 Sample Data Flow

### **Teacher Login → Subject Access:**
```
1. Teacher logs in with JWT token
2. Frontend calls: GET /api/v1/subjects
3. Backend checks teacher's assignments
4. Returns only assigned subjects
5. Frontend displays filtered subjects
```

### **Admin Assignment Process:**
```
1. Admin selects teacher, class, section, subject
2. Frontend calls: POST /api/v1/teacher-assignments  
3. Backend validates and creates assignment
4. Teacher gets access to assigned subjects
```

---

## 🚀 Advanced Features

### **Bulk Assignment**
```javascript
const bulkAssign = async (assignments) => {
  const promises = assignments.map(assignment => 
    createSubjectAssignment(assignment)
  );
  
  await Promise.all(promises);
};
```

### **Assignment History**
```javascript
// Get assignment history for audit
const getAssignmentHistory = async (teacherId) => {
  const response = await fetch(`/api/v1/teacher-assignments/history/${teacherId}`);
  return await response.json();
};
```

---

## 🔧 Troubleshooting

### **Common Issues:**
1. **403 Forbidden** - Check user role and permissions
2. **Empty Subjects** - Verify teacher has active assignments
3. **Duplicate Assignment** - Check existing assignments before creating

### **Debug Steps:**
1. Verify JWT token validity
2. Check teacher's assignments in database
3. Validate class/section/subject existence
4. Review isActive status

---

## 📞 Support

For any implementation issues:
1. Check API response messages
2. Review database assignments
3. Verify user roles and permissions
4. Contact development team for complex issues

---

**Last Updated:** March 2026  
**Version:** 1.0  
**Maintained by:** SMS Backend Team
