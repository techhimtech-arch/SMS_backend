# Academic Year – Kaise Set Karein

Exams, fees, class teacher wagairah ke liye **current academic year** set hona zaroori hai. Neeche step-by-step hai.

---

## 1. Route 404 aa raha ho?

Agar **"Route GET /api/v1/academic-years/current not found"** aaye to:

- **Server restart karein** (latest code ke baad `npm run dev` ya `node src/server.js`).
- Request me **Authorization header** hona chahiye: `Authorization: Bearer <accessToken>` (login ke baad milta hai).
- Verify karein ki `app.js` me ye line hai:  
  `app.use('/api/v1/academic-years', academicYearRoutes);`

---

## 2. Pehla academic year create karna

**Endpoint:** `POST /api/v1/academic-years`

**Headers:**  
`Content-Type: application/json`  
`Authorization: Bearer <accessToken>`

**Body (JSON):**
```json
{
  "name": "2024-2025",
  "startDate": "2024-04-01",
  "endDate": "2025-03-31"
}
```

- `name`: Year label (e.g. "2024-2025", "2025-2026").
- `startDate` / `endDate`: ISO date (YYYY-MM-DD).
- Optional: `isCurrent: true` agar turant isi ko current banana ho.

**Response (201):**  
`{ "success": true, "message": "Academic year created successfully", "data": { "_id": "...", "name": "2024-2025", ... } }`

---

## 3. Current academic year set karna

Agar create karte waqt `isCurrent: true` nahi diya, to baad me set karne ke liye:

**Endpoint:** `PUT /api/v1/academic-years/:id/set-current`

**Example:**  
`PUT /api/v1/academic-years/507f1f77bcf86cd799439011/set-current`

**Headers:**  
`Authorization: Bearer <accessToken>`

**Body:** Empty (ya `{}`).

**Response (200):**  
`{ "success": true, "message": "Current academic year updated successfully", "data": { ... } }`

`id` wahi use karein jo create response me `data._id` me aaya tha.

---

## 4. Flow (short)

1. **Login** → `accessToken` lo.
2. **List years (optional):**  
   `GET /api/v1/academic-years`  
   Agar list khali hai to pehla year create karna hai.
3. **Create year:**  
   `POST /api/v1/academic-years`  
   Body: `name`, `startDate`, `endDate` (optional: `isCurrent: true`).
4. **Agar current set nahi kiya ho:**  
   `PUT /api/v1/academic-years/<id>/set-current`  
   (same `id` jo create response me aaya).
5. **Verify:**  
   `GET /api/v1/academic-years/current`  
   → 200 + current year data.  
   Agar abhi bhi koi year set nahi hai to 404 aayega: "No current academic year set".

---

## 5. Frontend flow (UI)

1. Login ke baad **`GET /api/v1/academic-years/current`** call karein.
2. **200** → current year mil gaya; is year ko dropdown/default me use karein.
3. **404** ("No current academic year set") →  
   - Message dikhao: *"No current academic year. Many features (exams, fees, class teacher) need a current academic year. Please create and set one."*  
   - Admin ke liye:
     - "Academic Years" screen pe jao.
     - "Add academic year" → name (e.g. 2024-2025), start date, end date → Save.
     - List me us year ke saamne "Set as current" / "Set current" button → `PUT .../set-current` call karo.
   - Phir dubara `GET /api/v1/academic-years/current` karo; ab 200 aana chahiye.

Iske baad exams, fees, class teacher sab current year use karenge jab tum `academicYear` optional chhod doge (backend already default laga chuka hai).

---

## 6. MongoDB – Check / manual entry

### Kya MongoDB me academic years ki koi entry hai?

- Collection name: **`academicyears`** (Mongoose model `AcademicYear` → lowercase plural).
- MongoDB Compass / shell me:
  - Database: jis DB me app connect hai (e.g. `school_management` ya `.env` me `MONGO_URI` jisme hai).
  - Collection: **academicyears**
- Agar ye collection **empty** hai, ya koi bhi document me **`isCurrent: true`** nahi hai, to `GET /api/v1/academic-years/current` 404 dega: **"No current academic year set"**.

### Current year set karna – do tarike

1. **API use karo (recommended):**  
   Postman / Swagger / frontend se:
   - `POST /api/v1/academic-years` body: `{ "name": "2024-2025", "startDate": "2024-04-01", "endDate": "2025-03-31", "isCurrent": true }`  
   - Ya create ke baad `PUT /api/v1/academic-years/<id>/set-current`  
   **MongoDB me kuch manually nahi karna.**

2. **MongoDB me direct (sirf zarurat par):**  
   Pehle apne school ka `_id` lo (collection **schools** me). Phir **academicyears** me insert:

   ```javascript
   db.academicyears.insertOne({
     name: "2024-2025",
     schoolId: ObjectId("YOUR_SCHOOL_ID_YAHAN"),
     startDate: new Date("2024-04-01"),
     endDate: new Date("2025-03-31"),
     isCurrent: true,
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   });
   ```

   `YOUR_SCHOOL_ID_YAHAN` replace karo apne **schools** collection ke kisi document ke `_id` se.  
   Ek school ke liye ek hi document me `isCurrent: true` hona chahiye; baaki sab me `isCurrent: false`.

### Seed script (current year ek run me)

Project root se:

```bash
node scripts/seedAcademicYear.js
```

Ye script pehla school dhundh kar uske liye ek academic year create karega aur **current** set karega. Detail `scripts/seedAcademicYear.js` me hai.
