# Announcement API - Complete Guide

## **✅ Fixed Issues**
- ✓ Field name: `content` or `message` (both accepted, `message` preferred)
- ✓ Case sensitivity: Accepts lowercase, converts to UPPERCASE internally
- ✓ Status mapping: `'draft'` → `'DRAFT'`, `'published'` → `'PUBLISHED'`, `'expired'` → `'EXPIRED'`
- ✓ Type mapping: `'general'` → `'GENERAL'`, `'academic'` → `'ACADEMIC'`, etc.
- ✓ Priority mapping: `'urgent'` → `'URGENT'`, `'low'` → `'LOW'`, etc.

---

## **Correct Payload Format**

### **Create Announcement**
```javascript
{
  // Required fields
  "title": "Announcement Title",
  "message": "Announcement content (10-5000 chars)",
  // OR use "content" instead of "message" (both work)
  
  // Optional fields (with defaults)
  "type": "general",           // 'general', 'academic', 'exam', 'urgent'
  "priority": "medium",        // 'low', 'medium', 'high', 'urgent'
  "status": "published",       // 'draft', 'published', 'expired'
  "targetAudience": ["all"],   // 'all', 'students', 'teachers', 'parents', 'admin', 
                               // 'specific_classes', 'specific_sections'
  "expiryDate": "2026-04-07",
  "publishDate": "2026-03-31",
  "tags": ["announcement", "notice"],
  "allowComments": false,
  "isPinned": false
}
```

### **For Specific Classes/Sections**
```javascript
{
  "title": "Class Announcement",
  "message": "Message for specific classes",
  "targetAudience": ["specific_classes"],
  "targetClasses": [
    { "classId": "63f1a2b3c4d5e6f7g8h9i0j1" }
  ]
}
```

### **For Specific Sections**
```javascript
{
  "title": "Section Announcement",
  "message": "Message for specific sections",
  "targetAudience": ["specific_sections"],
  "targetSections": [
    { "sectionId": "63f1a2b3c4d5e6f7g8h9i0j1" }
  ]
}
```

---

## **Enum Values (Case-Insensitive Input)**

| Field | Accepted Values | Stored As |
|-------|-----------------|-----------|
| `type` | general, academic, exam, urgent | GENERAL, ACADEMIC, EXAM, URGENT |
| `priority` | low, medium, high, urgent | LOW, MEDIUM, HIGH, URGENT |
| `status` | draft, published, expired | DRAFT, PUBLISHED, EXPIRED |
| `targetAudience` | all, students, teachers, parents, admin, specific_classes, specific_sections | Same (lowercase) |

---

## **Field Compatibility**
- **Message Content**: Use either `message` or `content` (frontend flexibility)
- **Case**: Input accepts lowercase, automatically converted to uppercase for DB
- **Required**: Only `title` and `message`/`content` are required

---

## **Common Error Fixes**

### ❌ Error: "Invalid target audience option"
```javascript
// WRONG
"targetAudience": ["ALL"]  // uppercase

// CORRECT  
"targetAudience": ["all"]  // lowercase
```

### ❌ Error: "Invalid announcement type"
```javascript
// WRONG
"type": "ACADEMIC"  // uppercase

// CORRECT
"type": "academic"  // lowercase
```

### ❌ Error: "Announcement message is required"
```javascript
// WRONG
"content": "message"  // missing required message key

// CORRECT
"message": "message"  // or "content": "message"
```

### ❌ Error: "`published` is not a valid enum value"
```javascript
// WRONG
"status": "published"  // lowercase input

// CORRECT
"status": "published"  // automatically converted to PUBLISHED internally
```

---

## **API Endpoints**

### Create
```
POST /api/v1/announcements
Header: Authorization: Bearer <token>
```

### Update
```
PUT /api/v1/announcements/:id
Header: Authorization: Bearer <token>
```

### Delete
```
DELETE /api/v1/announcements/:id
Header: Authorization: Bearer <token>
```

### Get All
```
GET /api/v1/announcements
```

### Get Single
```
GET /api/v1/announcements/:id
```

---

## **Notes for Frontend Developers**
1. **Send lowercase values** - Backend converts to uppercase automatically
2. **Use either `message` or `content`** - Both fields are accepted
3. **createdBy is automatic** - Don't send; taken from authenticated user
4. **Dates in ISO format** - e.g., "2026-03-31"
5. **Target audience is flexible** - Default is "all" if not specified

---

## **Technical Details - System Conversion**

| When | Input | Output to DB |
|------|-------|--------------|
| Frontend sends | `"type": "general"` | Stored as `"GENERAL"` |
| Frontend sends | `"priority": "urgent"` | Stored as `"URGENT"` |
| Frontend sends | `"status": "published"` | Stored as `"PUBLISHED"` |
| Frontend sends | `"content": "..."` | Stored as `"message": "..."` |

