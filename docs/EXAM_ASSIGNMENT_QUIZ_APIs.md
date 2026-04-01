# 📚 Academic Assessment APIs - مکمل فہرست

## **4 بڑے Academic Systems:**

---

## **1️⃣ EXAM Management** (17 APIs)
### اردو میں: **امتحانات کا نظام**

#### **Exam CRUD:**
| Method | Endpoint | Description | ہر type |
|--------|----------|-------------|--------|
| POST | `/exams` | نیا exam بنائیں | ✓ |
| GET | `/exams` | تمام exams لیں (filter کے ساتھ) | ✓ |
| GET | `/exams/:id` | ایک exam کی تفصیلات | ✓ |
| PUT | `/exams/:id` | Exam update کریں | ✓ |
| DELETE | `/exams/:id` | Exam ڈیلیٹ کریں | ✓ |

#### **Exam Papers/Subjects:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/exams/:id/papers` | Subjects سے papers assign کریں |
| GET | `/exams/:id/papers` | Exam کے تمام papers لیں |
| PUT | `/exams/:id/papers/:paperId` | Paper update کریں |
| DELETE | `/exams/:id/papers/:paperId` | Paper ہٹائیں |

#### **Marks Entry & Management:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/exams/:id/marks` | Bulk marks entry (سب طالب علموں کے) |
| GET | `/exams/:id/marks` | Exam کے تمام marks لیں |
| PUT | `/exams/:id/marks/:marksId` | ایک student کے marks update کریں |
| PUT | `/exams/:id/marks/lock` | Marks lock کریں (تبدیl نہ ہوں) |
| PUT | `/exams/:id/marks/unlock` | Marks unlock کریں |

#### **Results Generation:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/exams/:id/results` | Results generate کریں |
| GET | `/exams/:id/results` | تمام results لیں |
| GET | `/exams/:id/student/:studentId` | ایک student کا result |

---

### **Exam Types Available:**
```javascript
[
  'UNIT_TEST',      // یونٹ ٹیسٹ
  'MID_TERM',       // سنہ وار امتحان
  'FINAL_TERM',     // آخری امتحان
  'PRACTICAL',      // عملی امتحان
  'VIVA',          // زبانی امتحان
  'QUIZ',          // کوئز ✓ موجود ہے!
  'ASSIGNMENT'     // ہوم ورک ✓ موجود ہے!
]
```

---

## **2️⃣ ASSIGNMENT System** (10 APIs)
### اردو میں: **ہوم ورک/تکالیف**

#### **Assignment CRUD:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assignments` | نیا assignment بنائیں |
| GET | `/assignments` | تمام assignments لیں |
| GET | `/assignments/:id` | ایک assignment کی تفصیلات |
| PUT | `/assignments/:id` | Assignment edit کریں |
| DELETE | `/assignments/:id` | Assignment ڈیلیٹ کریں |

#### **Assignment Status Management:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assignments/:id/publish` | Publish کریں (طالب علموں کو دکھائیں) |
| POST | `/assignments/:id/close` | Submission deadline بند کریں |

#### **Student Submissions:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assignments/:id/submit` | طالب علم assignment جمع کرے |
| GET | `/assignments/:id/submissions` | تمام submissions لیں |
| POST | `/assignments/:id/grade` | Submission کو گریڈ دیں |

---

### **Assignment Fields:**
```javascript
{
  title: "String",              // عنوان
  description: "String",        // تفصیل
  subjectId: "ObjectId",        // کون سا مضمون
  classId: "ObjectId",          // کون سی کلاس
  sectionId: "ObjectId",        // سیکشن
  teacherId: "ObjectId",        // استاد
  dueDate: "Date",              // جمع کرنے کی تاریخ
  maxMarks: "Number",           // کل نمبر
  status: "DRAFT|PUBLISHED|CLOSED",
  allowLateSubmission: "Boolean", // دیر سے جمع کرنے دیں؟
  lateSubmissionPenalty: "Number" // دیر کا منہاہ
}
```

---

## **3️⃣ MARKS Entry & Results** (11 APIs)
### اردو میں: **نمبرات کا نظام**

#### **Marks Entry:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/marks/students` | Exam کے لیے طالب علموں کی لسٹ |
| POST | `/marks/save` | Marks save کریں |

#### **Results Viewing:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/marks/student/:enrollmentId/exam/:examId` | ایک student کے marks |
| GET | `/marks/class-results` | پورے class کے results |
| GET | `/marks/student/:enrollmentId/academic-record` | Student کا مکمل academic record |

#### **Analysis & Reports:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/marks/class-statistics` | Class کے اعدادوشمار |
| GET | `/marks/subject-performance` | ہر مضمون کی performance |
| GET | `/marks/dashboard` | Dashboard ڈیٹا |

#### **Results Publishing:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/marks/submit` | Results submit کریں |
| POST | `/marks/verify` | Admin results verify کریں |
| POST | `/marks/publish` | Results publicly publish کریں |

---

## **4️⃣ EXAM RESULTS (examsResults)** (4 APIs)
### اردو میں: **نتائج**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/examsResults/`... | Results generate/submit |
| POST | `/examsResults/`... | Results verify |
| POST | `/examsResults/`... | Results publish |
| GET | `/examsResults/student/:studentId` | Student کے نتائج |

---

## **📊 مختلف نظام کے درمیان فرق:**

| Feature | EXAM | ASSIGNMENT | MARKS | RESULTS |
|---------|------|-----------|-------|---------|
| Create | ✓ | ✓ | ✗ | ✗ |
| Grades | ✓ | ✓ | ✓ | ✓ |
| Bulk Entry | ✓ | ✗ | ✓ | ✓ |
| Deadline | ✓ | ✓ | ✗ | ✓ |
| Late Submit | ✗ | ✓ | ✗ | ✗ |
| Publish | ✓ | ✓ | ✓ | ✓ |

---

## **استعمال کی مثالیں:**

### **1. Quiz بنائیں (Exam Type = QUIZ):**
```bash
POST /api/v1/exams
Headers: Authorization: Bearer <token>
Body:
{
  "name": "General Knowledge Quiz",
  "examType": "QUIZ",            # ✓ یہ ہے!
  "sessionId": "...",
  "classId": "...",
  "sectionId": "...",
  "startDate": "2026-04-01",
  "endDate": "2026-04-02",
  "description": "اردو کوئز"
}
```

### **2. Assignment بنائیں:**
```bash
POST /api/v1/assignments
Headers: Authorization: Bearer <token>
Body:
{
  "title": "اردو کمپوزیشن",
  "description": "500 الفاظ میں...",
  "subjectId": "...",
  "classId": "...",
  "dueDate": "2026-04-05",
  "maxMarks": 20,
  "allowLateSubmission": true
}
```

### **3. Marks Entry:**
```bash
POST /api/v1/marks/save
Headers: Authorization: Bearer <token>
Body:
{
  "examId": "...",
  "marks": [
    { "enrollmentId": "...", "marksObtained": 85 },
    { "enrollmentId": "...", "marksObtained": 92 }
  ]
}
```

### **4. Student کے Results دیکھیں:**
```bash
GET /api/v1/marks/student/{enrollmentId}/exam/{examId}
Headers: Authorization: Bearer <token>
```

---

## **مکمل سسٹم میں اور بھی ہے:**

✅ **Attendance** - حاضری کا نظام  
✅ **Report Cards** - رپورٹ کارڈز  
✅ **Dashboard** - تمام ڈیٹا کو دیکھیں  
✅ **Timetable** - ٹائم ٹیبل  
✅ **Notifications** - اطلاعات  

---

## **Key Features:**

🔒 **Lock/Unlock Marks** - غلطی میں تبدیل ہونے سے بچائیں  
📱 **Bulk Operations** - سو سو طالب علموں کو ایک ساتھ گریڈ دیں  
📊 **Analytics** - Class performance، subject performance  
📈 **Reports** - Detailed reports اور statistics  
👁️ **Role Based** - مختلف roles کو مختلف رسائی  

