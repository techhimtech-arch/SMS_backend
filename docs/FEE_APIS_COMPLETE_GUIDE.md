# 💰 Fee Management APIs - مکمل فہرست

## **دو Fee Systems موجود ہیں:**

### **1️⃣ feeRoutes.js - مکمل Fee Management System** 
(18 APIs)

#### **Fee Structure APIs**
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/fees/structure` | Fee structure بنائیں | school_admin |
| GET | `/fees/structure` | تمام fee structures لیں | school_admin, teacher |

---

#### **Student Fee APIs**
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/fees/student/:studentId` | Student کا fee summary لیں | school_admin, teacher, parent |
| GET | `/fees/student/:studentId/payment-details` | Student کی تفصیلات لیں | school_admin, teacher, parent |
| GET | `/fees/student/:studentId/fees` | Student کی تمام fees لیں | school_admin, accountant, parent |
| POST | `/fees/generate-student-fees` | Bulk میں student fees بنائیں | school_admin, accountant |

---

#### **Payment APIs**
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/fees/pay` | Payment ریکارڈ کریں | school_admin, teacher |
| GET | `/fees/payment-history` | تمام payments کی history | school_admin, teacher |
| GET | `/fees/payments` | Payments لیں (filter کے ساتھ) | school_admin, accountant |
| GET | `/fees/receipt/:paymentId` | Receipt لیں | school_admin, accountant, parent |
| POST | `/fees/refund/:paymentId` | Refund پروسیس کریں | school_admin, accountant |

---

#### **Fee Dues & Overdue APIs**
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/fees/overdue` | Overdue fees لیں | school_admin, teacher |
| GET | `/fees/dues` | تمام dues لیں (filter کے ساتھ) | school_admin, accountant |

---

#### **Class & Dashboard APIs**
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/fees/class-summary` | پورے class کا fee summary | school_admin, teacher |
| GET | `/fees/dashboard` | Fee dashboard ڈیٹا | school_admin, teacher |

---

#### **Reporting APIs**
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/fees/reports/:reportType` | Report بنائیں | school_admin, teacher |

---

#### **Reminders API**
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/fees/reminders` | Fee reminders بھیجیں | school_admin |

---

#### **Receipt API**
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/fees/:feeId/receipt/:receiptNumber` | Receipt لیں | school_admin, teacher, parent |

---

### **2️⃣ feesRoutes.js - سادہ Fees System** 
(4 APIs - پرانا نظام)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/fees/structure` | Fee structure بنائیں |
| POST | `/fees/assign/:studentId` | Fee assign کریں student کو |
| POST | `/fees/payment/:studentId` | Payment ریکارڈ کریں |
| GET | `/fees/student/:studentId` | Student fee details لیں |

---

## **Key Points:**

✅ **feeRoutes.js** - مکمل، professional system ہے  
⚠️ **feesRoutes.js** - سادہ، پرانا system ہے

### **Fee Types:**
```javascript
[
  'tuition',      // سالانہ فیس
  'transport',    // ٹرانسپورٹ فیس
  'admission',    // داخلہ فیس
  'exam',         // امتحان فیس
  'library',      // لائبریری فیس
  'laboratory',   // لیب فیس
  'sports',       // کھیل فیس
  'other'         // دیگر فیس
]
```

### **Payment Modes:**
```javascript
[
  'Cash',         // نقد
  'UPI',
  'Bank'          // بینک ٹرانسفر
]
```

### **Report Types:**
- Fee collection report
- Outstanding fees report
- Class-wise fee summary
- Student fee statement
- Payment reconciliation

---

## **استعمال کی مثالیں:**

### **1. Fee Structure بنائیں:**
```bash
POST /api/v1/fees/structure
Headers: Authorization: Bearer <token>
Body:
{
  "classId": "65bb331b8f9e8a001c9e4a1c",
  "academicYearId": "65aa221b8f9e8a001c9e4a1b",
  "feeType": "tuition",
  "feeName": "Monthly Tuition",
  "amount": 5000,
  "dueDate": "2026-04-01",
  "lateFee": 100,
  "concessionPercentage": 10
}
```

### **2. Student Fee Summary:**
```bash
GET /api/v1/fees/student/{studentId}?academicYearId={yearId}
Headers: Authorization: Bearer <token>
```

### **3. Payment ریکارڈ کریں:**
```bash
POST /api/v1/fees/pay
Headers: Authorization: Bearer <token>
Body:
{
  "studentId": "...",
  "amount": 5000,
  "paymentMode": "Cash",
  "date": "2026-03-31",
  "chequeNumber": "..." // optional
}
```

### **4. Overdue Fees:**
```bash
GET /api/v1/fees/overdue?classId={id}&academicYearId={id}
Headers: Authorization: Bearer <token>
```

### **5. Fee Dashboard:**
```bash
GET /api/v1/fees/dashboard?academicYearId={id}
Headers: Authorization: Bearer <token>
```

---

## **Status Codes:**
- ✅ 200 - Success
- ✅ 201 - Created
- ❌ 400 - Bad Request
- ❌ 401 - Unauthorized
- ❌ 404 - Not Found
- ❌ 500 - Server Error

