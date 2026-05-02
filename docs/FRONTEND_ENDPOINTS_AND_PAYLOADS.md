# SMS Backend API Documentation

> This document contains all endpoints and payloads for the frontend team, generated automatically from swagger annotations.

## `/academic-calendar`

### <span style="color: orange;text-transform:uppercase">POST</span> /academic-calendar

**Tags**: Academic Calendar

**Summary**: Create a new calendar event

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "title",
    "date",
    "academicSessionId"
  ],
  "properties": {
    "title": {
      "type": "string",
      "maxLength": 200,
      "description": "Event title"
    },
    "description": {
      "type": "string",
      "maxLength": 2000,
      "description": "Event description"
    },
    "date": {
      "type": "string",
      "format": "date-time",
      "description": "Event date"
    },
    "type": {
      "type": "string",
      "enum": [
        "HOLIDAY",
        "EXAM",
        "EVENT",
        "MEETING"
      ],
      "default": "EVENT",
      "description": "Event type"
    },
    "subType": {
      "type": "string",
      "description": "Event subtype"
    },
    "priority": {
      "type": "string",
      "enum": [
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT"
      ],
      "default": "MEDIUM",
      "description": "Event priority"
    },
    "status": {
      "type": "string",
      "enum": [
        "DRAFT",
        "PUBLISHED",
        "CANCELLED"
      ],
      "default": "DRAFT",
      "description": "Event status"
    },
    "isRecurring": {
      "type": "boolean",
      "default": false,
      "description": "Whether event is recurring"
    },
    "recurringPattern": {
      "type": "string",
      "enum": [
        "DAILY",
        "WEEKLY",
        "MONTHLY",
        "YEARLY"
      ],
      "description": "Recurring pattern"
    },
    "recurringEndDate": {
      "type": "string",
      "format": "date-time",
      "description": "End date for recurring events"
    },
    "applicableClasses": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of class IDs"
    },
    "applicableSections": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of section IDs"
    },
    "applicableRoles": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "ALL",
          "STUDENTS",
          "TEACHERS",
          "PARENTS",
          "ADMIN",
          "SCHOOL_ADMIN",
          "TEACHER",
          "ACCOUNTANT"
        ]
      },
      "description": "Roles this event applies to"
    },
    "venue": {
      "type": "string",
      "maxLength": 200,
      "description": "Event venue"
    },
    "startTime": {
      "type": "string",
      "pattern": "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$",
      "description": "Start time in HH:MM format"
    },
    "endTime": {
      "type": "string",
      "pattern": "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$",
      "description": "End time in HH:MM format"
    },
    "sendNotifications": {
      "type": "boolean",
      "default": true,
      "description": "Whether to send notifications"
    },
    "academicSessionId": {
      "type": "string",
      "description": "Academic session ID"
    }
  }
}
```

**Example**:
```json
{
  "title": "string",
  "description": "string",
  "date": "string",
  "type": "string",
  "subType": "string",
  "priority": "string",
  "status": "string",
  "isRecurring": "boolean",
  "recurringPattern": "string",
  "recurringEndDate": "string",
  "applicableClasses": "array",
  "applicableSections": "array",
  "applicableRoles": "array",
  "venue": "string",
  "startTime": "string",
  "endTime": "string",
  "sendNotifications": "boolean",
  "academicSessionId": "string"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /academic-calendar

**Tags**: Academic Calendar

**Summary**: Get calendar events by date range

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `startDate` | query | Yes | string | Start date for filtering |
| `endDate` | query | Yes | string | End date for filtering |
| `academicSessionId` | query | Yes | string | Academic session ID |
| `type` | query | No | string | Filter by event type |
| `status` | query | No | string | Filter by event status |
| `applicableRoles` | query | No | array | Filter by applicable roles |
| `page` | query | No | integer | Page number for pagination |
| `limit` | query | No | integer | Number of items per page |

---

## `/academic-calendar/monthly/{year}/{month}`

### <span style="color: green;text-transform:uppercase">GET</span> /academic-calendar/monthly/{year}/{month}

**Tags**: Academic Calendar

**Summary**: Get monthly calendar

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `year` | path | Yes | integer | Year (YYYY) |
| `month` | path | Yes | integer | Month (1-12) |
| `academicSessionId` | query | Yes | string | Academic session ID |
| `type` | query | No | string | Filter by event type |
| `applicableRoles` | query | No | array | Filter by applicable roles |

---

## `/academic-calendar/upcoming`

### <span style="color: green;text-transform:uppercase">GET</span> /academic-calendar/upcoming

**Tags**: Academic Calendar

**Summary**: Get upcoming events

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `days` | query | No | integer | Number of days to look ahead |
| `academicSessionId` | query | Yes | string | Academic session ID |
| `type` | query | No | string | Filter by event type |
| `applicableRoles` | query | No | array | Filter by applicable roles |

---

## `/academic-calendar/holidays/{year}`

### <span style="color: green;text-transform:uppercase">GET</span> /academic-calendar/holidays/{year}

**Tags**: Academic Calendar

**Summary**: Get holidays for a year

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `year` | path | Yes | integer | Year (YYYY) |
| `academicSessionId` | query | Yes | string | Academic session ID |

---

## `/academic-calendar/exams/{year}`

### <span style="color: green;text-transform:uppercase">GET</span> /academic-calendar/exams/{year}

**Tags**: Academic Calendar

**Summary**: Get exams for a year

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `year` | path | Yes | integer | Year (YYYY) |
| `academicSessionId` | query | Yes | string | Academic session ID |
| `subType` | query | No | string | Filter by exam subtype |

---

## `/academic-calendar/{id}`

### <span style="color: blue;text-transform:uppercase">PUT</span> /academic-calendar/{id}

**Tags**: Academic Calendar

**Summary**: Update calendar event

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Calendar event ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "maxLength": 200,
      "description": "Event title"
    },
    "description": {
      "type": "string",
      "maxLength": 2000,
      "description": "Event description"
    },
    "date": {
      "type": "string",
      "format": "date-time",
      "description": "Event date"
    },
    "type": {
      "type": "string",
      "enum": [
        "HOLIDAY",
        "EXAM",
        "EVENT",
        "MEETING"
      ],
      "description": "Event type"
    },
    "subType": {
      "type": "string",
      "description": "Event subtype"
    },
    "priority": {
      "type": "string",
      "enum": [
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT"
      ],
      "description": "Event priority"
    },
    "status": {
      "type": "string",
      "enum": [
        "DRAFT",
        "PUBLISHED",
        "CANCELLED"
      ],
      "description": "Event status"
    },
    "isRecurring": {
      "type": "boolean",
      "description": "Whether event is recurring"
    },
    "recurringPattern": {
      "type": "string",
      "enum": [
        "DAILY",
        "WEEKLY",
        "MONTHLY",
        "YEARLY"
      ],
      "description": "Recurring pattern"
    },
    "recurringEndDate": {
      "type": "string",
      "format": "date-time",
      "description": "End date for recurring events"
    },
    "applicableClasses": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of class IDs"
    },
    "applicableSections": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of section IDs"
    },
    "applicableRoles": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Roles this event applies to"
    },
    "venue": {
      "type": "string",
      "maxLength": 200,
      "description": "Event venue"
    },
    "startTime": {
      "type": "string",
      "description": "Start time in HH:MM format"
    },
    "endTime": {
      "type": "string",
      "description": "End time in HH:MM format"
    },
    "sendNotifications": {
      "type": "boolean",
      "description": "Whether to send notifications"
    }
  }
}
```

**Example**:
```json
{
  "title": "string",
  "description": "string",
  "date": "string",
  "type": "string",
  "subType": "string",
  "priority": "string",
  "status": "string",
  "isRecurring": "boolean",
  "recurringPattern": "string",
  "recurringEndDate": "string",
  "applicableClasses": "array",
  "applicableSections": "array",
  "applicableRoles": "array",
  "venue": "string",
  "startTime": "string",
  "endTime": "string",
  "sendNotifications": "boolean"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /academic-calendar/{id}

**Tags**: Academic Calendar

**Summary**: Delete calendar event

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Calendar event ID |

---

## `/academic/summary`

### <span style="color: green;text-transform:uppercase">GET</span> /academic/summary

**Tags**: Academic Summary

**Summary**: Get comprehensive academic summary for dashboard

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `academicSessionId` | query | Yes | string | Academic session ID |

---

## `/academic/class-stats/{classId}`

### <span style="color: green;text-transform:uppercase">GET</span> /academic/class-stats/{classId}

**Tags**: Academic Summary

**Summary**: Get detailed statistics for a specific class

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | path | Yes | string | Class ID |
| `academicSessionId` | query | Yes | string | Academic session ID |

---

## `/academic/enrollment-trends`

### <span style="color: green;text-transform:uppercase">GET</span> /academic/enrollment-trends

**Tags**: Academic Summary

**Summary**: Get enrollment trends over multiple years

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `academicSessionId` | query | Yes | string | Current academic session ID |
| `years` | query | No | integer | Number of years to analyze |

---

## `/academic-years`

### <span style="color: green;text-transform:uppercase">GET</span> /academic-years

**Tags**: Academic Years

**Summary**: Get all academic years for the school

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `isActive` | query | No | boolean | Filter by active status |

---

### <span style="color: orange;text-transform:uppercase">POST</span> /academic-years

**Tags**: Academic Years

**Summary**: Create a new academic year

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "name",
    "startDate",
    "endDate"
  ],
  "properties": {
    "name": {
      "type": "string",
      "example": "2025-2026"
    },
    "startDate": {
      "type": "string",
      "format": "date"
    },
    "endDate": {
      "type": "string",
      "format": "date"
    },
    "isCurrent": {
      "type": "boolean"
    },
    "terms": {
      "type": "array"
    },
    "holidays": {
      "type": "array"
    }
  }
}
```

**Example**:
```json
{
  "name": "2025-2026",
  "startDate": "string",
  "endDate": "string",
  "isCurrent": "boolean",
  "terms": "array",
  "holidays": "array"
}
```

---

## `/academic-years/current`

### <span style="color: green;text-transform:uppercase">GET</span> /academic-years/current

**Tags**: Academic Years

**Summary**: Get current academic year

---

## `/academic-years/{id}`

### <span style="color: green;text-transform:uppercase">GET</span> /academic-years/{id}

**Tags**: Academic Years

**Summary**: Get academic year by ID

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

### <span style="color: blue;text-transform:uppercase">PUT</span> /academic-years/{id}

**Tags**: Academic Years

**Summary**: Update academic year

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /academic-years/{id}

**Tags**: Academic Years

**Summary**: Delete academic year (soft delete)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/academic-years/{id}/set-current`

### <span style="color: blue;text-transform:uppercase">PUT</span> /academic-years/{id}/set-current

**Tags**: Academic Years

**Summary**: Set academic year as current

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/academic-years/{id}/terms`

### <span style="color: orange;text-transform:uppercase">POST</span> /academic-years/{id}/terms

**Tags**: Academic Years

**Summary**: Add term to academic year

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "name",
    "startDate",
    "endDate"
  ],
  "properties": {
    "name": {
      "type": "string"
    },
    "startDate": {
      "type": "string",
      "format": "date"
    },
    "endDate": {
      "type": "string",
      "format": "date"
    }
  }
}
```

**Example**:
```json
{
  "name": "string",
  "startDate": "string",
  "endDate": "string"
}
```

---

## `/academic-years/{id}/holidays`

### <span style="color: orange;text-transform:uppercase">POST</span> /academic-years/{id}/holidays

**Tags**: Academic Years

**Summary**: Add holiday to academic year

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "name",
    "startDate",
    "endDate"
  ],
  "properties": {
    "name": {
      "type": "string"
    },
    "startDate": {
      "type": "string",
      "format": "date"
    },
    "endDate": {
      "type": "string",
      "format": "date"
    },
    "description": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "name": "string",
  "startDate": "string",
  "endDate": "string",
  "description": "string"
}
```

---

## `/admin/quizzes`

### <span style="color: green;text-transform:uppercase">GET</span> /admin/quizzes

**Tags**: Admin Quiz Management

**Summary**: Get all school quizzes

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | number |  |
| `limit` | query | No | number |  |
| `status` | query | No | string |  |
| `classId` | query | No | string |  |

---

## `/admin/quizzes/analytics`

### <span style="color: green;text-transform:uppercase">GET</span> /admin/quizzes/analytics

**Tags**: Admin Quiz Management

**Summary**: Get school quiz analytics

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `startDate` | query | No | string |  |
| `endDate` | query | No | string |  |

---

## `/admin/quizzes/{id}`

### <span style="color: blue;text-transform:uppercase">DELETE</span> /admin/quizzes/{id}

**Tags**: Admin Quiz Management

**Summary**: Delete quiz

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

### <span style="color: green;text-transform:uppercase">GET</span> /admin/quizzes/{id}

**Tags**: Admin Quiz Management

**Summary**: Get quiz details with submissions

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/admission/partial`

### <span style="color: orange;text-transform:uppercase">POST</span> /admission/partial

**Tags**: Admission

**Summary**: Create partial admission (basic info only)

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "firstName",
    "lastName",
    "gender",
    "dateOfBirth"
  ],
  "properties": {
    "firstName": {
      "type": "string",
      "description": "Student's first name",
      "example": "Rahul"
    },
    "lastName": {
      "type": "string",
      "description": "Student's last name",
      "example": "Sharma"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "Student's email",
      "example": "student@example.com"
    },
    "phone": {
      "type": "string",
      "description": "Student's phone number",
      "example": "1234567890"
    },
    "gender": {
      "type": "string",
      "enum": [
        "Male",
        "Female",
        "Other"
      ],
      "description": "Student's gender",
      "example": "Male"
    },
    "dateOfBirth": {
      "type": "string",
      "format": "date",
      "description": "Student's date of birth",
      "example": "2012-05-10"
    },
    "address": {
      "type": "string",
      "description": "Student's address",
      "example": "123 Main St, City"
    }
  }
}
```

**Example**:
```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "email": "student@example.com",
  "phone": "1234567890",
  "gender": "Male",
  "dateOfBirth": "2012-05-10",
  "address": "123 Main St, City"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /admission/partial

**Tags**: Admission

**Summary**: Get all partial admissions

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |
| `search` | query | No | string |  |

---

## `/admission/{studentId}/complete`

### <span style="color: blue;text-transform:uppercase">PUT</span> /admission/{studentId}/complete

**Tags**: Admission

**Summary**: Complete partial admission

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string | Student ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "classId": {
      "type": "string",
      "description": "Class ID to assign"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID to assign"
    },
    "parentUserId": {
      "type": "string",
      "description": "Parent user ID"
    },
    "rollNumber": {
      "type": "string",
      "description": "Roll number"
    },
    "bloodGroup": {
      "type": "string",
      "enum": [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
      ],
      "description": "Blood group"
    },
    "admissionNumber": {
      "type": "string",
      "description": "Admission number"
    }
  }
}
```

**Example**:
```json
{
  "classId": "string",
  "sectionId": "string",
  "parentUserId": "string",
  "rollNumber": "string",
  "bloodGroup": "string",
  "admissionNumber": "string"
}
```

---

## `/admission/form-data`

### <span style="color: green;text-transform:uppercase">GET</span> /admission/form-data

**Tags**: Admission

**Summary**: Get admission form data

---

## `/admission`

### <span style="color: green;text-transform:uppercase">GET</span> /admission

**Tags**: Admission

**Summary**: Get all admitted students list

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number |
| `limit` | query | No | integer | Number of students per page |
| `search` | query | No | string | Search by name or admission number |

---

### <span style="color: orange;text-transform:uppercase">POST</span> /admission

**Tags**: Admission

**Summary**: Admit new student

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "firstName",
    "lastName",
    "admissionNumber",
    "gender",
    "dateOfBirth"
  ],
  "properties": {
    "firstName": {
      "type": "string",
      "description": "Student's first name",
      "example": "Rahul"
    },
    "lastName": {
      "type": "string",
      "description": "Student's last name",
      "example": "Sharma"
    },
    "admissionNumber": {
      "type": "string",
      "description": "Unique admission number",
      "example": "ADM-2026-001"
    },
    "gender": {
      "type": "string",
      "enum": [
        "Male",
        "Female",
        "Other"
      ],
      "description": "Student's gender",
      "example": "Male"
    },
    "dateOfBirth": {
      "type": "string",
      "format": "date",
      "description": "Student's date of birth",
      "example": "2012-05-10"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "Student's email (optional)",
      "example": "rahul@example.com"
    },
    "password": {
      "type": "string",
      "description": "Student's password (optional, will use default if not provided)",
      "example": "TempPassword123"
    },
    "academicYearId": {
      "type": "string",
      "description": "Academic year ID (optional)",
      "example": "65aa221b8f9e8a001c9e4a1b"
    },
    "classId": {
      "type": "string",
      "description": "Class ID (optional)",
      "example": "65bb331b8f9e8a001c9e4a1c"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID (optional)",
      "example": "65cc441b8f9e8a001c9e4a1d"
    },
    "rollNumber": {
      "type": "integer",
      "description": "Roll number in section (optional)",
      "example": 12
    },
    "parentUserId": {
      "type": "string",
      "description": "Parent user ID (optional)",
      "example": "65df12ab8f9e8a001c9e4a1e"
    },
    "address": {
      "type": "string",
      "description": "Student's address (optional)",
      "example": "123 Main Street, Delhi"
    },
    "bloodGroup": {
      "type": "string",
      "enum": [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
      ],
      "description": "Blood group (optional)",
      "example": "O+"
    },
    "emergencyContact": {
      "type": "string",
      "description": "Emergency contact number (optional)",
      "example": "+919876543210"
    }
  }
}
```

**Example**:
```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "admissionNumber": "ADM-2026-001",
  "gender": "Male",
  "dateOfBirth": "2012-05-10",
  "email": "rahul@example.com",
  "password": "TempPassword123",
  "academicYearId": "65aa221b8f9e8a001c9e4a1b",
  "classId": "65bb331b8f9e8a001c9e4a1c",
  "sectionId": "65cc441b8f9e8a001c9e4a1d",
  "rollNumber": 12,
  "parentUserId": "65df12ab8f9e8a001c9e4a1e",
  "address": "123 Main Street, Delhi",
  "bloodGroup": "O+",
  "emergencyContact": "+919876543210"
}
```

---

## `/admission/{studentId}`

### <span style="color: green;text-transform:uppercase">GET</span> /admission/{studentId}

**Tags**: Admission

**Summary**: Get student admission details

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string | Student profile ID |

---

## `/api/v1/announcements`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/announcements

**Tags**: Announcements

**Summary**: Create a new announcement

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "title",
    "content",
    "targetAudience"
  ],
  "properties": {
    "title": {
      "type": "string",
      "maxLength": 200
    },
    "content": {
      "type": "string",
      "maxLength": 5000
    },
    "type": {
      "type": "string",
      "enum": [
        "general",
        "academic",
        "sports",
        "events",
        "emergency",
        "examination",
        "holiday"
      ]
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high",
        "urgent"
      ]
    },
    "targetAudience": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "targetClasses": {
      "type": "array",
      "items": {
        "type": "object"
      }
    },
    "targetSections": {
      "type": "array",
      "items": {
        "type": "object"
      }
    },
    "targetUsers": {
      "type": "array",
      "items": {
        "type": "object"
      }
    },
    "expiryDate": {
      "type": "string",
      "format": "date"
    },
    "scheduledDate": {
      "type": "string",
      "format": "date"
    },
    "deliveryMethods": {
      "type": "object"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "allowComments": {
      "type": "boolean"
    },
    "isPinned": {
      "type": "boolean"
    }
  }
}
```

**Example**:
```json
{
  "title": "string",
  "content": "string",
  "type": "string",
  "priority": "string",
  "targetAudience": "array",
  "targetClasses": "array",
  "targetSections": "array",
  "targetUsers": "array",
  "expiryDate": "string",
  "scheduledDate": "string",
  "deliveryMethods": "object",
  "tags": "array",
  "allowComments": "boolean",
  "isPinned": "boolean"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /api/v1/announcements

**Tags**: Announcements

**Summary**: Get all announcements with filtering and pagination

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number |
| `limit` | query | No | integer | Number of items per page |
| `status` | query | No | string | Filter by status |
| `type` | query | No | string | Filter by type |
| `priority` | query | No | string | Filter by priority |
| `targetAudience` | query | No | string | Filter by target audience |
| `author` | query | No | string | Filter by author ID |
| `search` | query | No | string | Search in title, content, and tags |
| `sortBy` | query | No | string | Sort field |
| `sortOrder` | query | No | string | Sort order |
| `startDate` | query | No | string | Filter by start date |
| `endDate` | query | No | string | Filter by end date |

---

## `/api/v1/announcements/my`

### <span style="color: green;text-transform:uppercase">GET</span> /api/v1/announcements/my

**Tags**: Announcements

**Summary**: Get announcements for the current user

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number |
| `limit` | query | No | integer | Number of items per page |
| `unreadOnly` | query | No | boolean | Get only unread announcements |

---

## `/api/v1/announcements/stats`

### <span style="color: green;text-transform:uppercase">GET</span> /api/v1/announcements/stats

**Tags**: Announcements

**Summary**: Get announcement statistics (Admin only)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `startDate` | query | No | string | Filter by start date |
| `endDate` | query | No | string | Filter by end date |

---

## `/api/v1/announcements/{id}`

### <span style="color: green;text-transform:uppercase">GET</span> /api/v1/announcements/{id}

**Tags**: Announcements

**Summary**: Get a single announcement by ID

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Announcement ID |

---

### <span style="color: blue;text-transform:uppercase">PUT</span> /api/v1/announcements/{id}

**Tags**: Announcements

**Summary**: Update an announcement

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Announcement ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "content": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
    "priority": {
      "type": "string"
    },
    "status": {
      "type": "string"
    },
    "targetAudience": {
      "type": "array"
    },
    "expiryDate": {
      "type": "string"
    },
    "deliveryMethods": {
      "type": "object"
    },
    "tags": {
      "type": "array"
    },
    "allowComments": {
      "type": "boolean"
    },
    "isPinned": {
      "type": "boolean"
    }
  }
}
```

**Example**:
```json
{
  "title": "string",
  "content": "string",
  "type": "string",
  "priority": "string",
  "status": "string",
  "targetAudience": "array",
  "expiryDate": "string",
  "deliveryMethods": "object",
  "tags": "array",
  "allowComments": "boolean",
  "isPinned": "boolean"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /api/v1/announcements/{id}

**Tags**: Announcements

**Summary**: Delete an announcement

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Announcement ID |

---

## `/api/v1/announcements/{id}/read`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/announcements/{id}/read

**Tags**: Announcements

**Summary**: Mark announcement as read

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Announcement ID |

---

## `/api/v1/announcements/{id}/publish`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/announcements/{id}/publish

**Tags**: Announcements

**Summary**: Publish an announcement

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Announcement ID |

---

## `/api/v1/announcements/{id}/unpublish`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/announcements/{id}/unpublish

**Tags**: Announcements

**Summary**: Unpublish an announcement

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Announcement ID |

---

## `/api/v1/announcements/{id}/comments`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/announcements/{id}/comments

**Tags**: Announcements

**Summary**: Add a comment to an announcement

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Announcement ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "comment"
  ],
  "properties": {
    "comment": {
      "type": "string",
      "maxLength": 1000
    }
  }
}
```

**Example**:
```json
{
  "comment": "string"
}
```

---

## `/api/v1/assignments`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/assignments

**Tags**: Assignments

**Summary**: Create a new assignment

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "$ref": "#/components/schemas/Assignment"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /api/v1/assignments

**Tags**: Assignments

**Summary**: Get all assignments with filtering

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |
| `status` | query | No | string |  |
| `subjectId` | query | No | string |  |
| `classId` | query | No | string |  |
| `sectionId` | query | No | string |  |
| `sortBy` | query | No | string |  |
| `sortOrder` | query | No | string |  |

---

## `/api/v1/assignments/{id}`

### <span style="color: green;text-transform:uppercase">GET</span> /api/v1/assignments/{id}

**Tags**: Assignments

**Summary**: Get a single assignment by ID

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

### <span style="color: blue;text-transform:uppercase">PUT</span> /api/v1/assignments/{id}

**Tags**: Assignments

**Summary**: Update an assignment

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "$ref": "#/components/schemas/Assignment"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /api/v1/assignments/{id}

**Tags**: Assignments

**Summary**: Delete an assignment (soft delete)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/api/v1/assignments/{id}/publish`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/assignments/{id}/publish

**Tags**: Assignments

**Summary**: Publish an assignment

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/api/v1/assignments/{id}/close`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/assignments/{id}/close

**Tags**: Assignments

**Summary**: Close an assignment

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/api/v1/assignments/{id}/submit`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/assignments/{id}/submit

**Tags**: Assignments

**Summary**: Submit an assignment (Student only)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "submissionText": {
      "type": "string"
    },
    "attachment": {
      "type": "object"
    },
    "lateSubmissionReason": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "submissionText": "string",
  "attachment": "object",
  "lateSubmissionReason": "string"
}
```

---

## `/api/v1/assignments/{id}/submissions`

### <span style="color: green;text-transform:uppercase">GET</span> /api/v1/assignments/{id}/submissions

**Tags**: Assignments

**Summary**: Get all submissions for an assignment (Teacher/Admin only)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |
| `status` | query | No | string |  |

---

## `/api/v1/assignments/{id}/grade`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/assignments/{id}/grade

**Tags**: Assignments

**Summary**: Grade a submission (Teacher/Admin only)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "submissionId",
    "marksObtained"
  ],
  "properties": {
    "submissionId": {
      "type": "string"
    },
    "marksObtained": {
      "type": "number",
      "minimum": 0
    },
    "remarks": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "submissionId": "string",
  "marksObtained": "number",
  "remarks": "string"
}
```

---

## `/attendance`

### <span style="color: orange;text-transform:uppercase">POST</span> /attendance

**Tags**: Attendance

**Summary**: Mark attendance for a single student

**Description**: Role-based access:
- superadmin/school_admin: Allowed without restriction
- teacher: Must have active TeacherAssignment for the class/section/subject
- Others: Not allowed


**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "studentId",
    "classId",
    "sectionId",
    "subjectId",
    "date",
    "status"
  ],
  "properties": {
    "studentId": {
      "type": "string",
      "description": "Student's ObjectId"
    },
    "classId": {
      "type": "string",
      "description": "Class ObjectId"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ObjectId"
    },
    "subjectId": {
      "type": "string",
      "description": "Subject ObjectId (required for teacher assignment verification)"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "status": {
      "type": "string",
      "enum": [
        "Present",
        "Absent",
        "Leave"
      ]
    }
  }
}
```

**Example**:
```json
{
  "studentId": "string",
  "classId": "string",
  "sectionId": "string",
  "subjectId": "string",
  "date": "string",
  "status": "string"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /attendance

**Tags**: Attendance

**Summary**: Get attendance records

**Description**: Role-based access:
- superadmin/school_admin/teacher: Can filter by classId, sectionId, studentId
- parent: Automatically filtered to only show their own children's attendance (query params ignored)


**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `date` | query | Yes | string |  |
| `classId` | query | No | string | Filter by class (ignored for parent role) |
| `sectionId` | query | No | string | Filter by section (ignored for parent role) |
| `studentId` | query | No | string | Filter by student (ignored for parent role) |

---

## `/attendance/bulk`

### <span style="color: orange;text-transform:uppercase">POST</span> /attendance/bulk

**Tags**: Attendance

**Summary**: Mark attendance for multiple students in bulk

**Description**: Role-based access:
- superadmin/school_admin: Allowed without restriction
- teacher: Must have active TeacherAssignment for the class/section/subject
- Others: Not allowed


**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "date",
    "classId",
    "sectionId",
    "subjectId",
    "records"
  ],
  "properties": {
    "date": {
      "type": "string",
      "format": "date"
    },
    "classId": {
      "type": "string",
      "description": "Class ObjectId"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ObjectId"
    },
    "subjectId": {
      "type": "string",
      "description": "Subject ObjectId (required for teacher assignment verification)"
    },
    "records": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "studentId",
          "status"
        ],
        "properties": {
          "studentId": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "Present",
              "Absent",
              "Leave"
            ]
          }
        }
      }
    }
  }
}
```

**Example**:
```json
{
  "date": "string",
  "classId": "string",
  "sectionId": "string",
  "subjectId": "string",
  "records": "array"
}
```

---

## `/attendance/{id}`

### <span style="color: blue;text-transform:uppercase">DELETE</span> /attendance/{id}

**Tags**: Attendance

**Summary**: Delete an attendance record

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/audit-logs`

### <span style="color: green;text-transform:uppercase">GET</span> /audit-logs

**Tags**: Audit Logs

**Summary**: Get audit logs

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |
| `action` | query | No | string | Filter by action type |
| `resourceType` | query | No | string | Filter by resource type |
| `userId` | query | No | string | Filter by user ID |
| `startDate` | query | No | string |  |
| `endDate` | query | No | string |  |
| `success` | query | No | boolean |  |

---

## `/audit-logs/stats`

### <span style="color: green;text-transform:uppercase">GET</span> /audit-logs/stats

**Tags**: Audit Logs

**Summary**: Get audit log statistics

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `startDate` | query | No | string |  |
| `endDate` | query | No | string |  |

---

## `/audit-logs/actions`

### <span style="color: green;text-transform:uppercase">GET</span> /audit-logs/actions

**Tags**: Audit Logs

**Summary**: Get available action types for filtering

---

## `/audit-logs/user/{userId}`

### <span style="color: green;text-transform:uppercase">GET</span> /audit-logs/user/{userId}

**Tags**: Audit Logs

**Summary**: Get activity logs for a specific user

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `userId` | path | Yes | string |  |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |
| `startDate` | query | No | string |  |
| `endDate` | query | No | string |  |

---

## `/audit-logs/{id}`

### <span style="color: green;text-transform:uppercase">GET</span> /audit-logs/{id}

**Tags**: Audit Logs

**Summary**: Get audit log by ID

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/auth/register`

### <span style="color: orange;text-transform:uppercase">POST</span> /auth/register

**Tags**: Auth

**Summary**: Register a new school with admin

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "schoolName",
    "schoolEmail",
    "adminName",
    "adminEmail",
    "adminPassword"
  ],
  "properties": {
    "schoolName": {
      "type": "string",
      "description": "Name of the school",
      "example": "Delhi Public School"
    },
    "schoolEmail": {
      "type": "string",
      "description": "School's official email",
      "example": "contact@dps.edu"
    },
    "adminName": {
      "type": "string",
      "description": "Name of the school admin",
      "example": "John Doe"
    },
    "adminEmail": {
      "type": "string",
      "description": "Admin's login email",
      "example": "admin@dps.edu"
    },
    "adminPassword": {
      "type": "string",
      "description": "Admin's password (min 6 characters)",
      "example": "password123"
    }
  }
}
```

**Example**:
```json
{
  "schoolName": "Delhi Public School",
  "schoolEmail": "contact@dps.edu",
  "adminName": "John Doe",
  "adminEmail": "admin@dps.edu",
  "adminPassword": "password123"
}
```

---

## `/auth/login`

### <span style="color: orange;text-transform:uppercase">POST</span> /auth/login

**Tags**: Auth

**Summary**: Login to the system

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string"
    },
    "password": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "email": "string",
  "password": "string"
}
```

---

## `/auth/refresh`

### <span style="color: orange;text-transform:uppercase">POST</span> /auth/refresh

**Tags**: Auth

**Summary**: Refresh access token

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "refreshToken"
  ],
  "properties": {
    "refreshToken": {
      "type": "string",
      "description": "The refresh token received during login"
    }
  }
}
```

**Example**:
```json
{
  "refreshToken": "string"
}
```

---

## `/auth/logout`

### <span style="color: orange;text-transform:uppercase">POST</span> /auth/logout

**Tags**: Auth

**Summary**: Logout (revoke refresh token)

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "refreshToken": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "refreshToken": "string"
}
```

---

## `/auth/logout-all`

### <span style="color: orange;text-transform:uppercase">POST</span> /auth/logout-all

**Tags**: Auth

**Summary**: Logout from all devices

---

## `/auth/sessions`

### <span style="color: green;text-transform:uppercase">GET</span> /auth/sessions

**Tags**: Auth

**Summary**: Get active sessions

---

## `/auth/sessions/{sessionId}`

### <span style="color: blue;text-transform:uppercase">DELETE</span> /auth/sessions/{sessionId}

**Tags**: Auth

**Summary**: Revoke a specific session

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `sessionId` | path | Yes | string |  |

---

## `/auth/forgot-password`

### <span style="color: orange;text-transform:uppercase">POST</span> /auth/forgot-password

**Tags**: Auth

**Summary**: Request password reset

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "email"
  ],
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "description": "User's email address",
      "example": "user@example.com"
    }
  }
}
```

**Example**:
```json
{
  "email": "user@example.com"
}
```

---

## `/auth/reset-password`

### <span style="color: orange;text-transform:uppercase">POST</span> /auth/reset-password

**Tags**: Auth

**Summary**: Reset password with token

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "token",
    "newPassword"
  ],
  "properties": {
    "token": {
      "type": "string",
      "description": "Password reset token received in email",
      "example": "abc123def456..."
    },
    "newPassword": {
      "type": "string",
      "minLength": 6,
      "description": "New password (min 6 characters)",
      "example": "newPassword123"
    }
  }
}
```

**Example**:
```json
{
  "token": "abc123def456...",
  "newPassword": "newPassword123"
}
```

---

## `/admission/bulk/template`

### <span style="color: green;text-transform:uppercase">GET</span> /admission/bulk/template

**Tags**: Bulk Admission

**Summary**: Download bulk admission template

---

## `/admission/bulk`

### <span style="color: orange;text-transform:uppercase">POST</span> /admission/bulk

**Tags**: Bulk Admission

**Summary**: Bulk create partial admissions from CSV/Excel

**Payload (Request Body)**:

Content-Type: `multipart/form-data`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "file"
  ],
  "properties": {
    "file": {
      "type": "string",
      "format": "binary",
      "description": "CSV or Excel file containing student data"
    }
  }
}
```

**Example**:
```json
{
  "file": "string"
}
```

---

## `/admission/bulk/complete`

### <span style="color: blue;text-transform:uppercase">PUT</span> /admission/bulk/complete

**Tags**: Bulk Admission

**Summary**: Bulk complete partial admissions

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "studentIds"
  ],
  "properties": {
    "studentIds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of student IDs to complete"
    },
    "updates": {
      "type": "object",
      "properties": {
        "classId": {
          "type": "string",
          "description": "Class ID to assign"
        },
        "sectionId": {
          "type": "string",
          "description": "Section ID to assign"
        },
        "parentUserId": {
          "type": "string",
          "description": "Parent user ID"
        },
        "rollNumber": {
          "type": "string",
          "description": "Roll number"
        },
        "bloodGroup": {
          "type": "string",
          "enum": [
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-"
          ],
          "description": "Blood group"
        },
        "admissionNumber": {
          "type": "string",
          "description": "Admission number"
        }
      }
    }
  }
}
```

**Example**:
```json
{
  "studentIds": "array",
  "updates": "object"
}
```

---

## `/certificates/templates`

### <span style="color: green;text-transform:uppercase">GET</span> /certificates/templates

**Tags**: Certificates

**Summary**: Get available certificate templates

---

## `/certificates/generate`

### <span style="color: orange;text-transform:uppercase">POST</span> /certificates/generate

**Tags**: Certificates

**Summary**: Generate a new certificate

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "studentId",
    "certificateType",
    "dataPayload"
  ],
  "properties": {
    "studentId": {
      "type": "string"
    },
    "certificateType": {
      "type": "string",
      "enum": [
        "TRANSFER_CERTIFICATE",
        "CHARACTER_CERTIFICATE",
        "BONAFIDE_CERTIFICATE",
        "MERIT_CERTIFICATE",
        "STUDY_CERTIFICATE",
        "ATTENDANCE_CERTIFICATE",
        "LEAVING_CERTIFICATE",
        "CONDUCT_CERTIFICATE"
      ]
    },
    "dataPayload": {
      "type": "object"
    },
    "purpose": {
      "type": "string"
    },
    "expiryDate": {
      "type": "string",
      "format": "date"
    }
  }
}
```

**Example**:
```json
{
  "studentId": "string",
  "certificateType": "string",
  "dataPayload": "object",
  "purpose": "string",
  "expiryDate": "string"
}
```

---

## `/certificates/student/{studentId}`

### <span style="color: green;text-transform:uppercase">GET</span> /certificates/student/{studentId}

**Tags**: Certificates

**Summary**: Get all certificates for a student

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |

---

## `/certificates/verify/{code}`

### <span style="color: green;text-transform:uppercase">GET</span> /certificates/verify/{code}

**Tags**: Certificates

**Summary**: Verify certificate by verification code (Public)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `code` | path | Yes | string |  |

---

## `/certificates/{id}`

### <span style="color: green;text-transform:uppercase">GET</span> /certificates/{id}

**Tags**: Certificates

**Summary**: Get certificate by ID

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /certificates/{id}

**Tags**: Certificates

**Summary**: Delete a certificate (soft delete)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/certificates/{id}/verify`

### <span style="color: orange;text-transform:uppercase">POST</span> /certificates/{id}/verify

**Tags**: Certificates

**Summary**: Verify a certificate (official verification)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/certificates/{id}/cancel`

### <span style="color: orange;text-transform:uppercase">POST</span> /certificates/{id}/cancel

**Tags**: Certificates

**Summary**: Cancel a certificate

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "reason"
  ],
  "properties": {
    "reason": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "reason": "string"
}
```

---

## `/classes`

### <span style="color: orange;text-transform:uppercase">POST</span> /classes

**Tags**: Classes

**Summary**: Create a new class

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Name of the class",
      "example": "Class 10"
    }
  }
}
```

**Example**:
```json
{
  "name": "Class 10"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /classes

**Tags**: Classes

**Summary**: Get all classes for the logged-in user's school

---

## `/classes/{id}`

### <span style="color: blue;text-transform:uppercase">PATCH</span> /classes/{id}

**Tags**: Classes

**Summary**: Update class name

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Class ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Updated name of the class",
      "example": "Class 12"
    }
  }
}
```

**Example**:
```json
{
  "name": "Class 12"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /classes/{id}

**Tags**: Classes

**Summary**: Soft delete a class

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Class ID |

---

## `/class-teacher/assign`

### <span style="color: orange;text-transform:uppercase">POST</span> /class-teacher/assign

**Tags**: Class Teacher

**Summary**: Assign a class teacher to a class+section

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "teacherId",
    "classId",
    "sectionId",
    "academicYear"
  ],
  "properties": {
    "teacherId": {
      "type": "string"
    },
    "classId": {
      "type": "string"
    },
    "sectionId": {
      "type": "string"
    },
    "academicYear": {
      "type": "string",
      "example": "2025-2026"
    }
  }
}
```

**Example**:
```json
{
  "teacherId": "string",
  "classId": "string",
  "sectionId": "string",
  "academicYear": "2025-2026"
}
```

---

## `/class-teacher`

### <span style="color: green;text-transform:uppercase">GET</span> /class-teacher

**Tags**: Class Teacher

**Summary**: Get all class teacher assignments

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `academicYear` | query | No | string | Filter by academic year |
| `classId` | query | No | string | Filter by class |

---

## `/class-teacher/my-classes`

### <span style="color: green;text-transform:uppercase">GET</span> /class-teacher/my-classes

**Tags**: Class Teacher

**Summary**: Get classes where current user is class teacher

---

## `/class-teacher/check/{classId}/{sectionId}`

### <span style="color: green;text-transform:uppercase">GET</span> /class-teacher/check/{classId}/{sectionId}

**Tags**: Class Teacher

**Summary**: Check if current user is class teacher of given class+section

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | path | Yes | string |  |
| `sectionId` | path | Yes | string |  |

---

## `/class-teacher/by-class/{classId}/{sectionId}`

### <span style="color: green;text-transform:uppercase">GET</span> /class-teacher/by-class/{classId}/{sectionId}

**Tags**: Class Teacher

**Summary**: Get class teacher for a specific class+section

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | path | Yes | string |  |
| `sectionId` | path | Yes | string |  |

---

## `/class-teacher/{id}`

### <span style="color: blue;text-transform:uppercase">DELETE</span> /class-teacher/{id}

**Tags**: Class Teacher

**Summary**: Remove class teacher assignment

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/dashboard`

### <span style="color: green;text-transform:uppercase">GET</span> /dashboard

**Tags**: Dashboard

**Summary**: Get dashboard statistics for school admin

---

## `/subjects`

### <span style="color: orange;text-transform:uppercase">POST</span> /subjects

**Tags**: Subjects

**Summary**: Create a new subject

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "name",
    "classId",
    "classId",
    "academicSessionId"
  ],
  "properties": {
    "name": {
      "type": "string",
      "maxLength": 100,
      "description": "Name of the subject",
      "example": "Mathematics"
    },
    "code": {
      "type": "string",
      "maxLength": 20,
      "description": "Subject code (will be converted to uppercase)",
      "example": "MATH101"
    },
    "description": {
      "type": "string",
      "maxLength": 500,
      "description": "Subject description",
      "example": "Advanced Mathematics for Grade 10"
    },
    "classId": {
      "type": "string",
      "description": "ID of the class this subject belongs to",
      "example": "60d5ecb54b24a1234567890a"
    },
    "department": {
      "type": "string",
      "enum": [
        "SCIENCE",
        "COMMERCE",
        "ARTS",
        "LANGUAGE",
        "MATHEMATICS",
        "PHYSICAL_EDUCATION",
        "COMPUTER_SCIENCE",
        "OTHER"
      ],
      "description": "Academic department",
      "example": "MATHEMATICS"
    },
    "academicSessionId": {
      "type": "string",
      "description": "Academic session ID",
      "example": "65aa221b8f9e8a001c9e4a1c"
    },
    "teacherIds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of teacher IDs to assign",
      "example": [
        "65aa221b8f9e8a001c9e4a1b",
        "65aa221b8f9e8a001c9e4a1c"
      ]
    },
    "isOptional": {
      "type": "boolean",
      "description": "Whether subject is optional",
      "example": false
    },
    "status": {
      "type": "string",
      "enum": [
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED"
      ],
      "description": "Subject status",
      "example": "ACTIVE"
    },
    "credits": {
      "type": "number",
      "minimum": 0,
      "maximum": 10,
      "description": "Subject credits",
      "example": 3
    },
    "weeklyHours": {
      "type": "number",
      "minimum": 0,
      "maximum": 40,
      "description": "Weekly teaching hours",
      "example": 6
    },
    "prerequisites": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of prerequisite subject IDs",
      "example": []
    }
  }
}
```

**Example**:
```json
{
  "name": "Mathematics",
  "code": "MATH101",
  "description": "Advanced Mathematics for Grade 10",
  "classId": "60d5ecb54b24a1234567890a",
  "department": "MATHEMATICS",
  "academicSessionId": "65aa221b8f9e8a001c9e4a1c",
  "teacherIds": [
    "65aa221b8f9e8a001c9e4a1b",
    "65aa221b8f9e8a001c9e4a1c"
  ],
  "isOptional": "boolean",
  "status": "ACTIVE",
  "credits": 3,
  "weeklyHours": 6,
  "prerequisites": []
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /subjects

**Tags**: Subjects

**Summary**: Get all subjects for the logged-in school

---

## `/subjects/class/{classId}`

### <span style="color: green;text-transform:uppercase">GET</span> /subjects/class/{classId}

**Tags**: Subjects

**Summary**: Get subjects for a specific class

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | path | Yes | string | Class ID |
| `academicSessionId` | query | No | string | Academic session ID |
| `search` | query | No | string | Search term for subject name, code, or description |
| `status` | query | No | string | Filter by subject status |
| `department` | query | No | string | Filter by department |
| `page` | query | No | integer | Page number for pagination |
| `limit` | query | No | integer | Number of items per page |

---

## `/subjects/teacher/{teacherId}`

### <span style="color: green;text-transform:uppercase">GET</span> /subjects/teacher/{teacherId}

**Tags**: Enhanced Subjects

**Summary**: Get subjects assigned to a teacher

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `teacherId` | path | Yes | string | Teacher ID |
| `academicSessionId` | query | No | string | Academic session ID |
| `search` | query | No | string | Search term for subject name, code, or description |
| `page` | query | No | integer | Page number for pagination |
| `limit` | query | No | integer | Number of items per page |

---

## `/subjects/{id}`

### <span style="color: blue;text-transform:uppercase">PUT</span> /subjects/{id}

**Tags**: Enhanced Subjects

**Summary**: Update subject

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Subject ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "maxLength": 100,
      "description": "Subject name"
    },
    "code": {
      "type": "string",
      "maxLength": 20,
      "description": "Subject code (will be converted to uppercase)"
    },
    "description": {
      "type": "string",
      "maxLength": 500,
      "description": "Subject description"
    },
    "department": {
      "type": "string",
      "enum": [
        "SCIENCE",
        "COMMERCE",
        "ARTS",
        "LANGUAGE",
        "MATHEMATICS",
        "PHYSICAL_EDUCATION",
        "COMPUTER_SCIENCE",
        "OTHER"
      ],
      "description": "Academic department"
    },
    "isOptional": {
      "type": "boolean",
      "description": "Whether subject is optional"
    },
    "status": {
      "type": "string",
      "enum": [
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED"
      ],
      "description": "Subject status"
    },
    "credits": {
      "type": "number",
      "minimum": 0,
      "maximum": 10,
      "description": "Subject credits"
    },
    "weeklyHours": {
      "type": "number",
      "minimum": 0,
      "maximum": 40,
      "description": "Weekly teaching hours"
    },
    "prerequisites": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of prerequisite subject IDs"
    },
    "teacherIds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of teacher IDs to assign"
    }
  }
}
```

**Example**:
```json
{
  "name": "string",
  "code": "string",
  "description": "string",
  "department": "string",
  "isOptional": "boolean",
  "status": "string",
  "credits": "number",
  "weeklyHours": "number",
  "prerequisites": "array",
  "teacherIds": "array"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /subjects/{id}

**Tags**: Subjects

**Summary**: Soft delete a subject

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Subject ID |

---

### <span style="color: blue;text-transform:uppercase">PATCH</span> /subjects/{id}

**Tags**: Subjects

**Summary**: Update a subject

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Subject ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "New name of the subject",
      "example": "Advanced Mathematics"
    }
  }
}
```

**Example**:
```json
{
  "name": "Advanced Mathematics"
}
```

---

## `/subjects/{subjectId}/assign-teacher`

### <span style="color: orange;text-transform:uppercase">POST</span> /subjects/{subjectId}/assign-teacher

**Tags**: Enhanced Subjects

**Summary**: Assign teacher to subject

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `subjectId` | path | Yes | string | Subject ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "teacherId"
  ],
  "properties": {
    "teacherId": {
      "type": "string",
      "description": "Teacher ID to assign"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID (optional)"
    },
    "role": {
      "type": "string",
      "enum": [
        "PRIMARY_TEACHER",
        "ASSISTANT_TEACHER",
        "SUBSTITUTE_TEACHER"
      ],
      "default": "PRIMARY_TEACHER",
      "description": "Teacher role for this subject"
    }
  }
}
```

**Example**:
```json
{
  "teacherId": "string",
  "sectionId": "string",
  "role": "string"
}
```

---

## `/subjects/{subjectId}/remove-teacher/{teacherId}`

### <span style="color: blue;text-transform:uppercase">DELETE</span> /subjects/{subjectId}/remove-teacher/{teacherId}

**Tags**: Enhanced Subjects

**Summary**: Remove teacher assignment from subject

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `subjectId` | path | Yes | string | Subject ID |
| `teacherId` | path | Yes | string | Teacher ID to remove |

---

## `/subjects/optional/{classId}`

### <span style="color: green;text-transform:uppercase">GET</span> /subjects/optional/{classId}

**Tags**: Enhanced Subjects

**Summary**: Get optional subjects for a class

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | path | Yes | string | Class ID |
| `academicSessionId` | query | No | string | Academic session ID |

---

## `/attendance/enrollments`

### <span style="color: green;text-transform:uppercase">GET</span> /attendance/enrollments

**Tags**: Enrollment Attendance

**Summary**: Get enrollments for attendance marking

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `academicYearId` | query | Yes | string | Academic year ID |
| `classId` | query | Yes | string | Class ID |
| `sectionId` | query | No | string | Section ID (optional - if not provided, returns all sections of the class) |

---

## `/attendance/all-enrollments`

### <span style="color: green;text-transform:uppercase">GET</span> /attendance/all-enrollments

**Tags**: Enrollment Attendance

**Summary**: Get all enrollments for an academic year (all classes)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `academicYearId` | query | Yes | string | Academic year ID |

---

## `/attendance/mark`

### <span style="color: orange;text-transform:uppercase">POST</span> /attendance/mark

**Tags**: Enrollment Attendance

**Summary**: Mark attendance for multiple students

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "academicYearId",
    "classId",
    "sectionId",
    "date",
    "attendanceRecords"
  ],
  "properties": {
    "academicYearId": {
      "type": "string",
      "description": "Academic year ID",
      "example": "65aa221b8f9e8a001c9e4a1b"
    },
    "classId": {
      "type": "string",
      "description": "Class ID",
      "example": "65bb331b8f9e8a001c9e4a1c"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID",
      "example": "65cc441b8f9e8a001c9e4a1d"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Attendance date",
      "example": "2026-03-07"
    },
    "attendanceRecords": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "enrollmentId",
          "status"
        ],
        "properties": {
          "enrollmentId": {
            "type": "string",
            "description": "Enrollment ID",
            "example": "65dd12ab8f9e8a001c9e4a1e"
          },
          "studentId": {
            "type": "string",
            "description": "Student ID (for backward compatibility)",
            "example": "65ee12ab8f9e8a001c9e4a1f"
          },
          "status": {
            "type": "string",
            "enum": [
              "Present",
              "Absent",
              "Leave",
              "Late"
            ],
            "description": "Attendance status",
            "example": "Present"
          }
        }
      }
    }
  }
}
```

**Example**:
```json
{
  "academicYearId": "65aa221b8f9e8a001c9e4a1b",
  "classId": "65bb331b8f9e8a001c9e4a1c",
  "sectionId": "65cc441b8f9e8a001c9e4a1d",
  "date": "2026-03-07",
  "attendanceRecords": "array"
}
```

---

## `/attendance/enrollment/{enrollmentId}`

### <span style="color: green;text-transform:uppercase">GET</span> /attendance/enrollment/{enrollmentId}

**Tags**: Enrollment Attendance

**Summary**: Get attendance by enrollment

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `enrollmentId` | path | Yes | string | Enrollment ID |
| `startDate` | query | No | string | Start date for attendance period |
| `endDate` | query | No | string | End date for attendance period |

---

## `/attendance/class-summary`

### <span style="color: green;text-transform:uppercase">GET</span> /attendance/class-summary

**Tags**: Enrollment Attendance

**Summary**: Get class attendance summary for a specific date

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `academicYearId` | query | Yes | string | Academic year ID |
| `classId` | query | Yes | string | Class ID |
| `sectionId` | query | Yes | string | Section ID |
| `date` | query | Yes | string | Attendance date |

---

## `/attendance/class-statistics`

### <span style="color: green;text-transform:uppercase">GET</span> /attendance/class-statistics

**Tags**: Enrollment Attendance

**Summary**: Get class attendance statistics over a period

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `academicYearId` | query | Yes | string | Academic year ID |
| `classId` | query | Yes | string | Class ID |
| `sectionId` | query | Yes | string | Section ID |
| `startDate` | query | Yes | string | Start date |
| `endDate` | query | Yes | string | End date |

---

## `/attendance/dashboard`

### <span style="color: green;text-transform:uppercase">GET</span> /attendance/dashboard

**Tags**: Enrollment Attendance

**Summary**: Get attendance dashboard data

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `academicYearId` | query | No | string | Academic year ID |
| `classId` | query | No | string | Class ID |
| `sectionId` | query | No | string | Section ID |
| `date` | query | No | string | Attendance date (defaults to today) |

---

## `/exams`

### <span style="color: orange;text-transform:uppercase">POST</span> /exams

**Tags**: Exam Management

**Summary**: Create a new exam

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "name",
    "examType",
    "sessionId",
    "classId",
    "sectionId",
    "startDate",
    "endDate"
  ],
  "properties": {
    "name": {
      "type": "string",
      "maxLength": 200,
      "description": "Exam name"
    },
    "examType": {
      "type": "string",
      "enum": [
        "UNIT_TEST",
        "MID_TERM",
        "FINAL_TERM",
        "PRACTICAL",
        "VIVA",
        "QUIZ",
        "ASSIGNMENT"
      ],
      "default": "UNIT_TEST",
      "description": "Type of exam"
    },
    "sessionId": {
      "type": "string",
      "description": "Academic session ID"
    },
    "classId": {
      "type": "string",
      "description": "Class ID"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID"
    },
    "startDate": {
      "type": "string",
      "format": "date-time",
      "description": "Exam start date"
    },
    "endDate": {
      "type": "string",
      "format": "date-time",
      "description": "Exam end date"
    },
    "description": {
      "type": "string",
      "maxLength": 1000,
      "description": "Exam description"
    },
    "instructions": {
      "type": "string",
      "maxLength": 2000,
      "description": "Exam instructions"
    },
    "passingPercentage": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "default": 40,
      "description": "Passing percentage"
    },
    "duration": {
      "type": "number",
      "minimum": 1,
      "description": "Duration in minutes"
    },
    "venue": {
      "type": "string",
      "maxLength": 200,
      "description": "Exam venue"
    }
  }
}
```

**Example**:
```json
{
  "name": "string",
  "examType": "string",
  "sessionId": "string",
  "classId": "string",
  "sectionId": "string",
  "startDate": "string",
  "endDate": "string",
  "description": "string",
  "instructions": "string",
  "passingPercentage": "number",
  "duration": "number",
  "venue": "string"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /exams

**Tags**: Exam Management

**Summary**: List exams with filters

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | query | No | string | Filter by class ID |
| `sectionId` | query | No | string | Filter by section ID |
| `sessionId` | query | No | string | Filter by academic session ID |
| `status` | query | No | string | Filter by status |
| `examType` | query | No | string | Filter by exam type |

---

## `/exams/{id}`

### <span style="color: green;text-transform:uppercase">GET</span> /exams/{id}

**Tags**: Exam Management

**Summary**: Get exam details with subjects and marks statistics

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |

---

### <span style="color: blue;text-transform:uppercase">PUT</span> /exams/{id}

**Tags**: Exam Management

**Summary**: Update exam details

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "maxLength": 200
    },
    "examType": {
      "type": "string",
      "enum": [
        "UNIT_TEST",
        "MID_TERM",
        "FINAL_TERM",
        "PRACTICAL",
        "VIVA",
        "QUIZ",
        "ASSIGNMENT"
      ]
    },
    "startDate": {
      "type": "string",
      "format": "date-time"
    },
    "endDate": {
      "type": "string",
      "format": "date-time"
    },
    "description": {
      "type": "string",
      "maxLength": 1000
    },
    "instructions": {
      "type": "string",
      "maxLength": 2000
    },
    "passingPercentage": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "duration": {
      "type": "number",
      "minimum": 1
    },
    "venue": {
      "type": "string",
      "maxLength": 200
    },
    "status": {
      "type": "string",
      "enum": [
        "DRAFT",
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "PUBLISHED",
        "CANCELLED"
      ]
    }
  }
}
```

**Example**:
```json
{
  "name": "string",
  "examType": "string",
  "startDate": "string",
  "endDate": "string",
  "description": "string",
  "instructions": "string",
  "passingPercentage": "number",
  "duration": "number",
  "venue": "string",
  "status": "string"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /exams/{id}

**Tags**: Exam Management

**Summary**: Delete exam

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |

---

## `/exams/{id}/papers`

### <span style="color: orange;text-transform:uppercase">POST</span> /exams/{id}/papers

**Tags**: Exam Management

**Summary**: Assign subjects to exam

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "subjectAssignments"
  ],
  "properties": {
    "subjectAssignments": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "subjectId",
          "teacherId",
          "maxMarks",
          "passingMarks",
          "examDate",
          "startTime",
          "endTime"
        ],
        "properties": {
          "subjectId": {
            "type": "string",
            "description": "Subject ID"
          },
          "teacherId": {
            "type": "string",
            "description": "Teacher ID"
          },
          "maxMarks": {
            "type": "number",
            "minimum": 1,
            "maximum": 1000,
            "description": "Maximum marks"
          },
          "passingMarks": {
            "type": "number",
            "minimum": 0,
            "description": "Passing marks"
          },
          "examDate": {
            "type": "string",
            "format": "date-time",
            "description": "Exam date"
          },
          "startTime": {
            "type": "string",
            "pattern": "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$",
            "description": "Start time (HH:MM)"
          },
          "endTime": {
            "type": "string",
            "pattern": "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$",
            "description": "End time (HH:MM)"
          },
          "duration": {
            "type": "number",
            "minimum": 1,
            "description": "Duration in minutes"
          },
          "venue": {
            "type": "string",
            "maxLength": 200,
            "description": "Exam venue"
          },
          "instructions": {
            "type": "string",
            "maxLength": 2000,
            "description": "Paper instructions"
          }
        }
      }
    }
  }
}
```

**Example**:
```json
{
  "subjectAssignments": "array"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /exams/{id}/papers

**Tags**: Exam Management

**Summary**: Get exam subject papers

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |

---

## `/exams/{id}/papers/{paperId}`

### <span style="color: blue;text-transform:uppercase">PUT</span> /exams/{id}/papers/{paperId}

**Tags**: Exam Management

**Summary**: Update subject paper

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |
| `paperId` | path | Yes | string | Paper ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "maxMarks": {
      "type": "number",
      "minimum": 1,
      "maximum": 1000
    },
    "passingMarks": {
      "type": "number",
      "minimum": 0
    },
    "examDate": {
      "type": "string",
      "format": "date-time"
    },
    "startTime": {
      "type": "string",
      "pattern": "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$"
    },
    "endTime": {
      "type": "string",
      "pattern": "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$"
    },
    "duration": {
      "type": "number",
      "minimum": 1
    },
    "venue": {
      "type": "string",
      "maxLength": 200
    },
    "instructions": {
      "type": "string",
      "maxLength": 2000
    }
  }
}
```

**Example**:
```json
{
  "maxMarks": "number",
  "passingMarks": "number",
  "examDate": "string",
  "startTime": "string",
  "endTime": "string",
  "duration": "number",
  "venue": "string",
  "instructions": "string"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /exams/{id}/papers/{paperId}

**Tags**: Exam Management

**Summary**: Remove subject paper

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |
| `paperId` | path | Yes | string | Paper ID |

---

## `/exams/{id}/marks`

### <span style="color: orange;text-transform:uppercase">POST</span> /exams/{id}/marks

**Tags**: Exam Management

**Summary**: Bulk marks entry

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "marksData"
  ],
  "properties": {
    "marksData": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "studentId",
          "examSubjectPaperId",
          "marksObtained"
        ],
        "properties": {
          "studentId": {
            "type": "string",
            "description": "Student ID"
          },
          "examSubjectPaperId": {
            "type": "string",
            "description": "Subject paper ID"
          },
          "marksObtained": {
            "type": "number",
            "minimum": 0,
            "description": "Marks obtained"
          },
          "remarks": {
            "type": "string",
            "maxLength": 500,
            "description": "Remarks"
          }
        }
      }
    }
  }
}
```

**Example**:
```json
{
  "marksData": "array"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /exams/{id}/marks

**Tags**: Exam Management

**Summary**: Get exam marks

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |

---

## `/exams/{id}/marks/{marksId}`

### <span style="color: blue;text-transform:uppercase">PUT</span> /exams/{id}/marks/{marksId}

**Tags**: Exam Management

**Summary**: Update marks

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |
| `marksId` | path | Yes | string | Marks ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "marksObtained": {
      "type": "number",
      "minimum": 0,
      "description": "Marks obtained"
    },
    "remarks": {
      "type": "string",
      "maxLength": 500,
      "description": "Remarks"
    },
    "teacherRemarks": {
      "type": "string",
      "maxLength": 500,
      "description": "Teacher remarks"
    }
  }
}
```

**Example**:
```json
{
  "marksObtained": "number",
  "remarks": "string",
  "teacherRemarks": "string"
}
```

---

## `/exams/{id}/marks/lock`

### <span style="color: blue;text-transform:uppercase">PUT</span> /exams/{id}/marks/lock

**Tags**: Exam Management

**Summary**: Lock marks

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "subjectId"
  ],
  "properties": {
    "subjectId": {
      "type": "string",
      "description": "Subject ID to lock"
    }
  }
}
```

**Example**:
```json
{
  "subjectId": "string"
}
```

---

## `/exams/{id}/marks/unlock`

### <span style="color: blue;text-transform:uppercase">PUT</span> /exams/{id}/marks/unlock

**Tags**: Exam Management

**Summary**: Unlock marks

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "subjectId"
  ],
  "properties": {
    "subjectId": {
      "type": "string",
      "description": "Subject ID to unlock"
    }
  }
}
```

**Example**:
```json
{
  "subjectId": "string"
}
```

---

## `/exams/{id}/results`

### <span style="color: orange;text-transform:uppercase">POST</span> /exams/{id}/results

**Tags**: Exam Management

**Summary**: Generate exam results

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |

---

### <span style="color: green;text-transform:uppercase">GET</span> /exams/{id}/results

**Tags**: Exam Management

**Summary**: Get exam results

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |

---

## `/exams/{id}/student/{studentId}`

### <span style="color: green;text-transform:uppercase">GET</span> /exams/{id}/student/{studentId}

**Tags**: Exam Management

**Summary**: Get student result for exam

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Exam ID |
| `studentId` | path | Yes | string | Student ID |

---

## `/results/exams`

### <span style="color: orange;text-transform:uppercase">POST</span> /results/exams

**Tags**: Exams and Results

**Summary**: Create an exam

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "name",
    "classId"
  ],
  "properties": {
    "name": {
      "type": "string",
      "description": "Name of the exam"
    },
    "classId": {
      "type": "string",
      "description": "Class ObjectId"
    },
    "academicYear": {
      "type": "string",
      "description": "Optional academic year label (e.g. \"2024-2025\"). If omitted, the school's current academic year will be used.\n"
    },
    "examDate": {
      "type": "string",
      "format": "date",
      "description": "Optional exam date (YYYY-MM-DD)"
    }
  }
}
```

**Example**:
```json
{
  "name": "string",
  "classId": "string",
  "academicYear": "string",
  "examDate": "string"
}
```

---

## `/results/subjects`

### <span style="color: orange;text-transform:uppercase">POST</span> /results/subjects

**Tags**: Exams and Results

**Summary**: Create a subject for a class

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "classId": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "name": "string",
  "classId": "string"
}
```

---

## `/results/results`

### <span style="color: orange;text-transform:uppercase">POST</span> /results/results

**Tags**: Exams and Results

**Summary**: Add marks for a student

**Description**: Role-based access:
- superadmin/school_admin: Allowed without restriction
- teacher: Must have active TeacherAssignment for student's class/section and the subject
- Others: Not allowed


**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "studentId",
    "examId",
    "subjectId",
    "marksObtained",
    "maxMarks"
  ],
  "properties": {
    "studentId": {
      "type": "string",
      "description": "Student's ObjectId"
    },
    "examId": {
      "type": "string",
      "description": "Exam ObjectId"
    },
    "subjectId": {
      "type": "string",
      "description": "Subject ObjectId (used for teacher assignment verification)"
    },
    "marksObtained": {
      "type": "number"
    },
    "maxMarks": {
      "type": "number"
    },
    "grade": {
      "type": "string"
    },
    "remarks": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "studentId": "string",
  "examId": "string",
  "subjectId": "string",
  "marksObtained": "number",
  "maxMarks": "number",
  "grade": "string",
  "remarks": "string"
}
```

---

## `/results/results/student/{studentId}`

### <span style="color: green;text-transform:uppercase">GET</span> /results/results/student/{studentId}

**Tags**: Exams and Results

**Summary**: Get student results for a specific exam

**Description**: Role-based access:
- superadmin/school_admin/teacher: Can access any student's results
- parent: Can only access their own children's results (403 if studentId doesn't belong to them)


**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |
| `examId` | query | No | string | Filter results for a specific exam |
| `academicYear` | query | No | string | Optional academic year label (e.g. "2024-2025"). Used when examId is not provided to fetch all results for that year.  |

---

## `/fees/structure`

### <span style="color: orange;text-transform:uppercase">POST</span> /fees/structure

**Tags**: Fees

**Summary**: Create class fee structure

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "classId",
    "tuitionFee",
    "feeType",
    "feeName",
    "amount",
    "dueDate"
  ],
  "properties": {
    "academicYearId": {
      "type": "string",
      "description": "Academic year ID",
      "example": "65aa221b8f9e8a001c9e4a1b"
    },
    "classId": {
      "type": "string",
      "description": "Class ObjectId",
      "example": "65bb331b8f9e8a001c9e4a1c"
    },
    "feeType": {
      "type": "string",
      "enum": [
        "tuition",
        "transport",
        "admission",
        "exam",
        "library",
        "laboratory",
        "sports",
        "other"
      ],
      "description": "Type of fee",
      "example": "tuition"
    },
    "feeName": {
      "type": "string",
      "description": "Name of the fee",
      "example": "Monthly Tuition Fee"
    },
    "amount": {
      "type": "number",
      "description": "Fee amount",
      "example": 5000
    },
    "dueDate": {
      "type": "string",
      "format": "date",
      "description": "Due date for the fee",
      "example": "2026-04-01"
    },
    "lateFee": {
      "type": "number",
      "description": "Late fee amount",
      "example": 100
    },
    "concessionPercentage": {
      "type": "number",
      "description": "Concession percentage",
      "example": 10
    },
    "academicYear": {
      "type": "string",
      "description": "Optional academic year label (e.g. \"2024-2025\"). If omitted, the school's current academic year will be used.\n"
    },
    "tuitionFee": {
      "type": "number"
    },
    "transportFee": {
      "type": "number"
    },
    "examFee": {
      "type": "number"
    },
    "otherCharges": {
      "type": "number"
    }
  }
}
```

**Example**:
```json
{
  "academicYearId": "65aa221b8f9e8a001c9e4a1b",
  "classId": "65bb331b8f9e8a001c9e4a1c",
  "feeType": "tuition",
  "feeName": "Monthly Tuition Fee",
  "amount": 5000,
  "dueDate": "2026-04-01",
  "lateFee": 100,
  "concessionPercentage": 10,
  "academicYear": "string",
  "tuitionFee": "number",
  "transportFee": "number",
  "examFee": "number",
  "otherCharges": "number"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /fees/structure

**Tags**: Fee Management

**Summary**: Get fee structures for a class

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `academicYearId` | query | Yes | string | Academic year ID |
| `classId` | query | Yes | string | Class ID |

---

## `/fees/student/{studentId}`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/student/{studentId}

**Tags**: Fees

**Summary**: Get student fee details

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string | Student ID |
| `academicYear` | query | Yes | string | Optional academic year label (e.g. "2024-2025"). If provided, returns fee summary and payment history for that year. If omitted, returns the most recent academic year's record.  |

---

## `/fees/class-summary`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/class-summary

**Tags**: Fee Management

**Summary**: Get class fee summary

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | query | Yes | string | Class ID |
| `academicYearId` | query | Yes | string | Academic year ID |

---

## `/fees/pay`

### <span style="color: orange;text-transform:uppercase">POST</span> /fees/pay

**Tags**: Fee Management

**Summary**: Process fee payment

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "feeId",
    "amount",
    "paymentMethod"
  ],
  "properties": {
    "feeId": {
      "type": "string",
      "description": "Fee ID",
      "example": "65dd12ab8f9e8a001c9e4a1e"
    },
    "amount": {
      "type": "number",
      "description": "Payment amount",
      "example": 2500
    },
    "paymentMethod": {
      "type": "string",
      "enum": [
        "cash",
        "cheque",
        "bank_transfer",
        "online",
        "card",
        "upi"
      ],
      "description": "Payment method",
      "example": "cash"
    },
    "transactionId": {
      "type": "string",
      "description": "Transaction ID for online payments",
      "example": "TXN123456789"
    },
    "remarks": {
      "type": "string",
      "description": "Payment remarks",
      "example": "Partial payment for March tuition"
    }
  }
}
```

**Example**:
```json
{
  "feeId": "65dd12ab8f9e8a001c9e4a1e",
  "amount": 2500,
  "paymentMethod": "cash",
  "transactionId": "TXN123456789",
  "remarks": "Partial payment for March tuition"
}
```

---

## `/fees/overdue`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/overdue

**Tags**: Fee Management

**Summary**: Get overdue fees

---

## `/fees/payment-history`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/payment-history

**Tags**: Fee Management

**Summary**: Get payment history

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `startDate` | query | No | string | Start date for payment history |
| `endDate` | query | No | string | End date for payment history |
| `classId` | query | No | string | Filter by class ID |
| `feeType` | query | No | string | Filter by fee type |
| `paymentMethod` | query | No | string | Filter by payment method |

---

## `/fees/reports/{reportType}`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/reports/{reportType}

**Tags**: Fee Management

**Summary**: Generate fee reports

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `reportType` | path | Yes | string | Type of report to generate |
| `academicYearId` | query | No | string | Academic year ID (for class-wise reports) |
| `classId` | query | No | string | Class ID (for class-wise reports) |
| `startDate` | query | No | string | Start date (for collection-summary) |
| `endDate` | query | No | string | End date (for collection-summary) |

---

## `/fees/reminders`

### <span style="color: orange;text-transform:uppercase">POST</span> /fees/reminders

**Tags**: Fee Management

**Summary**: Send fee reminders

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "reminderType": {
      "type": "string",
      "enum": [
        "overdue",
        "upcoming"
      ],
      "default": "overdue",
      "description": "Type of reminders to send",
      "example": "overdue"
    }
  }
}
```

**Example**:
```json
{
  "reminderType": "overdue"
}
```

---

## `/fees/dashboard`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/dashboard

**Tags**: Fee Management

**Summary**: Get fee dashboard data

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `academicYearId` | query | No | string | Academic year ID (for class-specific dashboard) |
| `classId` | query | No | string | Class ID (for class-specific dashboard) |

---

## `/fees/student/{studentId}/payment-details`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/student/{studentId}/payment-details

**Tags**: Fee Management

**Summary**: Get student fee details for payment

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string | Student ID |
| `academicYearId` | query | Yes | string | Academic year ID |

---

## `/fees/{feeId}/receipt/{receiptNumber}`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/{feeId}/receipt/{receiptNumber}

**Tags**: Fee Management

**Summary**: Get fee receipt

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `feeId` | path | Yes | string | Fee ID |
| `receiptNumber` | path | Yes | string | Receipt number |

---

## `/fees/generate-student-fees`

### <span style="color: orange;text-transform:uppercase">POST</span> /fees/generate-student-fees

**Tags**: Fee Management

**Summary**: Generate student fees from fee structure

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "studentId",
    "classId",
    "sectionId",
    "academicSessionId"
  ],
  "properties": {
    "studentId": {
      "type": "string"
    },
    "classId": {
      "type": "string"
    },
    "sectionId": {
      "type": "string"
    },
    "academicSessionId": {
      "type": "string"
    },
    "customFeeItems": {
      "type": "array"
    }
  }
}
```

**Example**:
```json
{
  "studentId": "string",
  "classId": "string",
  "sectionId": "string",
  "academicSessionId": "string",
  "customFeeItems": "array"
}
```

---

## `/fees/student/{studentId}/fees`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/student/{studentId}/fees

**Tags**: Fee Management

**Summary**: Get all fees for a student

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |
| `academicSessionId` | query | No | string |  |

---

## `/fees/payments`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/payments

**Tags**: Fee Management

**Summary**: Get all fee payments

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | query | No | string |  |
| `academicSessionId` | query | No | string |  |
| `paymentMode` | query | No | string |  |
| `fromDate` | query | No | string |  |
| `toDate` | query | No | string |  |

---

## `/fees/dues`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/dues

**Tags**: Fee Management

**Summary**: Get all fee dues

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | query | No | string |  |
| `sectionId` | query | No | string |  |
| `academicSessionId` | query | No | string |  |
| `status` | query | No | string |  |

---

## `/fees/receipt/{paymentId}`

### <span style="color: green;text-transform:uppercase">GET</span> /fees/receipt/{paymentId}

**Tags**: Fee Management

**Summary**: Get payment receipt by payment ID

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `paymentId` | path | Yes | string |  |

---

## `/fees/refund/{paymentId}`

### <span style="color: orange;text-transform:uppercase">POST</span> /fees/refund/{paymentId}

**Tags**: Fee Management

**Summary**: Process refund for a payment

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `paymentId` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "refundAmount",
    "reason"
  ],
  "properties": {
    "refundAmount": {
      "type": "number"
    },
    "reason": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "refundAmount": "number",
  "reason": "string"
}
```

---

## `/fees/assign/{studentId}`

### <span style="color: orange;text-transform:uppercase">POST</span> /fees/assign/{studentId}

**Tags**: Fees

**Summary**: Assign fee to a student

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "classId"
  ],
  "properties": {
    "academicYear": {
      "type": "string",
      "description": "Optional academic year label (e.g. \"2024-2025\"). If omitted, the school's current academic year will be used.\n"
    },
    "classId": {
      "type": "string",
      "description": "Class ObjectId to match fee structure"
    }
  }
}
```

**Example**:
```json
{
  "academicYear": "string",
  "classId": "string"
}
```

---

## `/fees/payment/{studentId}`

### <span style="color: orange;text-transform:uppercase">POST</span> /fees/payment/{studentId}

**Tags**: Fees

**Summary**: Record a fee payment

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "amount",
    "paymentMode"
  ],
  "properties": {
    "amount": {
      "type": "number"
    },
    "paymentMode": {
      "type": "string",
      "enum": [
        "Cash",
        "UPI",
        "Bank"
      ]
    },
    "academicYear": {
      "type": "string",
      "description": "Optional academic year label (e.g. \"2024-2025\"). If omitted, the school's current academic year will be used to locate the StudentFee record and tag the payment.\n"
    }
  }
}
```

**Example**:
```json
{
  "amount": "number",
  "paymentMode": "string",
  "academicYear": "string"
}
```

---

## `/users`

### <span style="color: orange;text-transform:uppercase">POST</span> /users

**Tags**: Users

**Summary**: Create a new user (teacher or accountant)

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "firstName",
    "lastName",
    "email",
    "password",
    "role"
  ],
  "properties": {
    "firstName": {
      "type": "string",
      "minLength": 2,
      "maxLength": 50,
      "description": "First name (2-50 characters)",
      "example": "John"
    },
    "lastName": {
      "type": "string",
      "minLength": 2,
      "maxLength": 50,
      "description": "Last name (2-50 characters)",
      "example": "Doe"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "Valid email address",
      "example": "john.doe@school.com"
    },
    "password": {
      "type": "string",
      "minLength": 6,
      "maxLength": 128,
      "description": "Password with at least one uppercase, lowercase, and number",
      "example": "Password123"
    },
    "role": {
      "type": "string",
      "enum": [
        "teacher",
        "accountant",
        "teacher",
        "accountant",
        "parent",
        "student"
      ],
      "description": "User role",
      "example": "teacher"
    },
    "schoolId": {
      "type": "string",
      "description": "School ID (optional, defaults to current user's school)",
      "example": "65aa221b8f9e8a001c9e4a1b"
    },
    "name": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@school.com",
  "password": "Password123",
  "role": "teacher",
  "schoolId": "65aa221b8f9e8a001c9e4a1b",
  "name": "string"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /users

**Tags**: Users

**Summary**: Get all users of the same school

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number for pagination |
| `limit` | query | No | integer | Number of users per page |
| `search` | query | No | string | Search users by name or email |
| `role` | query | No | string | Filter by role |

---

## `/users/stats`

### <span style="color: green;text-transform:uppercase">GET</span> /users/stats

**Tags**: Users (Improved)

**Summary**: Get user statistics

---

## `/users/{id}`

### <span style="color: green;text-transform:uppercase">GET</span> /users/{id}

**Tags**: Users (Improved)

**Summary**: Get user by ID

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | User ID |

---

### <span style="color: blue;text-transform:uppercase">PUT</span> /users/{id}

**Tags**: Users (Improved)

**Summary**: Update user

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | User ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "minLength": 2,
      "maxLength": 50
    },
    "lastName": {
      "type": "string",
      "minLength": 2,
      "maxLength": 50
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "role": {
      "type": "string",
      "enum": [
        "superadmin",
        "school_admin",
        "teacher",
        "accountant",
        "parent",
        "student"
      ]
    }
  }
}
```

**Example**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "string"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /users/{id}

**Tags**: Users (Improved)

**Summary**: Delete user

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | User ID |

---

## `/users/me`

### <span style="color: green;text-transform:uppercase">GET</span> /users/me

**Tags**: Users (Improved)

**Summary**: Get current user profile

---

### <span style="color: blue;text-transform:uppercase">PATCH</span> /users/me

**Tags**: Users (Improved)

**Summary**: Update current user profile

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100,
      "description": "Full name",
      "example": "John Doe"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "New email address",
      "example": "john.doe@newschool.com"
    },
    "phone": {
      "type": "string",
      "description": "Phone number",
      "example": "+1234567890"
    },
    "address": {
      "type": "object",
      "properties": {
        "street": {
          "type": "string",
          "example": "123 Main St"
        },
        "city": {
          "type": "string",
          "example": "New York"
        },
        "state": {
          "type": "string",
          "example": "NY"
        },
        "zipCode": {
          "type": "string",
          "example": "10001"
        }
      }
    }
  }
}
```

**Example**:
```json
{
  "name": "John Doe",
  "email": "john.doe@newschool.com",
  "phone": "+1234567890",
  "address": "object"
}
```

---

## `/users/change-password`

### <span style="color: blue;text-transform:uppercase">PATCH</span> /users/change-password

**Tags**: Users (Improved)

**Summary**: Change current user password

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "currentPassword",
    "newPassword"
  ],
  "properties": {
    "currentPassword": {
      "type": "string",
      "minLength": 6,
      "description": "Current password",
      "example": "oldPassword123"
    },
    "newPassword": {
      "type": "string",
      "minLength": 6,
      "maxLength": 128,
      "description": "New password (min 6 characters, at least one uppercase, lowercase, and number)",
      "example": "newPassword123"
    }
  }
}
```

**Example**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

---

## `/users/profile-image`

### <span style="color: orange;text-transform:uppercase">POST</span> /users/profile-image

**Tags**: Users (Improved)

**Summary**: Upload profile image

**Payload (Request Body)**:

Content-Type: `multipart/form-data`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "image"
  ],
  "properties": {
    "image": {
      "type": "string",
      "format": "binary",
      "description": "Profile image file (max 5MB, jpg/jpeg/png only)"
    }
  }
}
```

**Example**:
```json
{
  "image": "string"
}
```

---

## `/users/{id}/reset-password`

### <span style="color: blue;text-transform:uppercase">PATCH</span> /users/{id}/reset-password

**Tags**: Users (Improved)

**Summary**: Admin reset user password

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | User ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "newPassword"
  ],
  "properties": {
    "newPassword": {
      "type": "string",
      "minLength": 6,
      "maxLength": 128,
      "description": "New password (min 6 characters, at least one uppercase, lowercase, and number)",
      "example": "NewSecurePass123"
    }
  }
}
```

**Example**:
```json
{
  "newPassword": "NewSecurePass123"
}
```

---

## `/marks/students`

### <span style="color: green;text-transform:uppercase">GET</span> /marks/students

**Tags**: Marks & Results

**Summary**: Get students for mark entry

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `examId` | query | Yes | string | Exam ID |
| `classId` | query | Yes | string | Class ID |
| `sectionId` | query | Yes | string | Section ID |

---

## `/marks/save`

### <span style="color: orange;text-transform:uppercase">POST</span> /marks/save

**Tags**: Marks & Results

**Summary**: Save marks for multiple students

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "examId",
    "classId",
    "sectionId",
    "students"
  ],
  "properties": {
    "examId": {
      "type": "string",
      "description": "Exam ID",
      "example": "65aa221b8f9e8a001c9e4a1b"
    },
    "classId": {
      "type": "string",
      "description": "Class ID",
      "example": "65bb331b8f9e8a001c9e4a1c"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID",
      "example": "65cc441b8f9e8a001c9e4a1d"
    },
    "students": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "enrollmentId",
          "subjects"
        ],
        "properties": {
          "enrollmentId": {
            "type": "string",
            "description": "Enrollment ID",
            "example": "65dd12ab8f9e8a001c9e4a1e"
          },
          "subjects": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "subjectId",
                "marksObtained",
                "maxMarks"
              ],
              "properties": {
                "subjectId": {
                  "type": "string",
                  "description": "Subject ID",
                  "example": "65ee12ab8f9e8a001c9e4a1f"
                },
                "marksObtained": {
                  "type": "number",
                  "description": "Marks obtained",
                  "example": 85
                },
                "maxMarks": {
                  "type": "number",
                  "description": "Maximum marks",
                  "example": 100
                },
                "remarks": {
                  "type": "string",
                  "description": "Subject remarks",
                  "example": "Good performance"
                }
              }
            }
          },
          "status": {
            "type": "string",
            "enum": [
              "draft",
              "submitted",
              "verified",
              "published"
            ],
            "description": "Result status",
            "example": "draft"
          }
        }
      }
    }
  }
}
```

**Example**:
```json
{
  "examId": "65aa221b8f9e8a001c9e4a1b",
  "classId": "65bb331b8f9e8a001c9e4a1c",
  "sectionId": "65cc441b8f9e8a001c9e4a1d",
  "students": "array"
}
```

---

## `/marks/student/{enrollmentId}/exam/{examId}`

### <span style="color: green;text-transform:uppercase">GET</span> /marks/student/{enrollmentId}/exam/{examId}

**Tags**: Marks & Results

**Summary**: Get student results for an exam

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `enrollmentId` | path | Yes | string | Enrollment ID |
| `examId` | path | Yes | string | Exam ID |

---

## `/marks/class-results`

### <span style="color: green;text-transform:uppercase">GET</span> /marks/class-results

**Tags**: Marks & Results

**Summary**: Get class results for an exam

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `examId` | query | Yes | string | Exam ID |
| `classId` | query | Yes | string | Class ID |
| `sectionId` | query | Yes | string | Section ID |

---

## `/marks/class-statistics`

### <span style="color: green;text-transform:uppercase">GET</span> /marks/class-statistics

**Tags**: Marks & Results

**Summary**: Get class exam statistics

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `examId` | query | Yes | string | Exam ID |
| `classId` | query | Yes | string | Class ID |
| `sectionId` | query | Yes | string | Section ID |

---

## `/marks/subject-performance`

### <span style="color: green;text-transform:uppercase">GET</span> /marks/subject-performance

**Tags**: Marks & Results

**Summary**: Get subject-wise performance for a class

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `examId` | query | Yes | string | Exam ID |
| `classId` | query | Yes | string | Class ID |
| `sectionId` | query | Yes | string | Section ID |

---

## `/marks/submit`

### <span style="color: orange;text-transform:uppercase">POST</span> /marks/submit

**Tags**: Marks & Results

**Summary**: Submit results for verification

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "examId",
    "classId",
    "sectionId"
  ],
  "properties": {
    "examId": {
      "type": "string",
      "description": "Exam ID"
    },
    "classId": {
      "type": "string",
      "description": "Class ID"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID"
    }
  }
}
```

**Example**:
```json
{
  "examId": "string",
  "classId": "string",
  "sectionId": "string"
}
```

---

## `/marks/verify`

### <span style="color: orange;text-transform:uppercase">POST</span> /marks/verify

**Tags**: Marks & Results

**Summary**: Verify results

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "examId",
    "classId",
    "sectionId"
  ],
  "properties": {
    "examId": {
      "type": "string",
      "description": "Exam ID"
    },
    "classId": {
      "type": "string",
      "description": "Class ID"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID"
    }
  }
}
```

**Example**:
```json
{
  "examId": "string",
  "classId": "string",
  "sectionId": "string"
}
```

---

## `/marks/publish`

### <span style="color: orange;text-transform:uppercase">POST</span> /marks/publish

**Tags**: Marks & Results

**Summary**: Publish results

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "examId",
    "classId",
    "sectionId"
  ],
  "properties": {
    "examId": {
      "type": "string",
      "description": "Exam ID"
    },
    "classId": {
      "type": "string",
      "description": "Class ID"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID"
    }
  }
}
```

**Example**:
```json
{
  "examId": "string",
  "classId": "string",
  "sectionId": "string"
}
```

---

## `/marks/student/{enrollmentId}/academic-record`

### <span style="color: green;text-transform:uppercase">GET</span> /marks/student/{enrollmentId}/academic-record

**Tags**: Marks & Results

**Summary**: Get student's complete academic record

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `enrollmentId` | path | Yes | string | Enrollment ID |

---

## `/marks/dashboard`

### <span style="color: green;text-transform:uppercase">GET</span> /marks/dashboard

**Tags**: Marks & Results

**Summary**: Get mark entry dashboard data

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `examId` | query | No | string | Exam ID |
| `classId` | query | No | string | Class ID |
| `sectionId` | query | No | string | Section ID |

---

## `/api/v1/notifications`

### <span style="color: green;text-transform:uppercase">GET</span> /api/v1/notifications

**Tags**: Notifications

**Summary**: Get all notifications for current user

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number |
| `limit` | query | No | integer | Number of items per page |
| `isRead` | query | No | boolean | Filter by read status |
| `type` | query | No | string | Filter by notification type |
| `priority` | query | No | string | Filter by priority |
| `includeArchived` | query | No | boolean | Include archived notifications |

---

## `/api/v1/notifications/count`

### <span style="color: green;text-transform:uppercase">GET</span> /api/v1/notifications/count

**Tags**: Notifications

**Summary**: Get unread notification count

---

## `/api/v1/notifications/{id}/mark-read`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/notifications/{id}/mark-read

**Tags**: Notifications

**Summary**: Mark a notification as read

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Notification ID |

---

## `/api/v1/notifications/mark-all-read`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/notifications/mark-all-read

**Tags**: Notifications

**Summary**: Mark all notifications as read

---

## `/api/v1/notifications/{id}/archive`

### <span style="color: orange;text-transform:uppercase">POST</span> /api/v1/notifications/{id}/archive

**Tags**: Notifications

**Summary**: Archive a notification

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Notification ID |

---

## `/api/v1/notifications/{id}`

### <span style="color: blue;text-transform:uppercase">DELETE</span> /api/v1/notifications/{id}

**Tags**: Notifications

**Summary**: Delete a notification (soft delete)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Notification ID |

---

## `/parent/dashboard`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/dashboard

**Tags**: Parent Portal

**Summary**: Get parent dashboard data (Phase 5)

---

## `/parent/students`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/students

**Tags**: Parent Portal

**Summary**: Get all students linked to parent (Phase 5)

---

## `/parent/student/{studentId}`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/student/{studentId}

**Tags**: Parent Portal

**Summary**: Get detailed information for a specific student (Phase 5)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string | Student ID |

---

## `/parent/profile`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/profile

**Tags**: Parent Portal

**Summary**: Get parent profile with linked student info

---

## `/parent/attendance`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/attendance

**Tags**: Parent Portal

**Summary**: Get linked student's attendance records

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `startDate` | query | No | string |  |
| `endDate` | query | No | string |  |

---

## `/parent/fees`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/fees

**Tags**: Parent Portal

**Summary**: Get linked student's fee details and payment history

---

## `/parent/results`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/results

**Tags**: Parent Portal

**Summary**: Get linked student's exam results

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `examId` | query | No | string | Optional - Filter by specific exam |

---

## `/parent/children/{studentId}/attendance`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/children/{studentId}/attendance

**Tags**: Parent Portal

**Summary**: Get specific child's attendance records

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |
| `startDate` | query | No | string |  |
| `endDate` | query | No | string |  |

---

## `/parent/children/{studentId}/fees`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/children/{studentId}/fees

**Tags**: Parent Portal

**Summary**: Get specific child's fee details

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |

---

## `/parent/children/{studentId}/results`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/children/{studentId}/results

**Tags**: Parent Portal

**Summary**: Get specific child's exam results

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |
| `examId` | query | No | string |  |

---

## `/parent/children/{studentId}/announcements`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/children/{studentId}/announcements

**Tags**: Parent Portal

**Summary**: Get announcements for child's class

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |

---

## `/parent/children/{studentId}/timetable`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/children/{studentId}/timetable

**Tags**: Parent Portal

**Summary**: Get child's class timetable

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |

---

## `/parent/children/{studentId}/homework`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/children/{studentId}/homework

**Tags**: Parent Portal

**Summary**: Get child's homework assignments

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |
| `status` | query | No | string | Filter by homework status |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/parent/children/{studentId}/remarks`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/children/{studentId}/remarks

**Tags**: Parent Portal

**Summary**: Get child's remarks

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |
| `category` | query | No | string | Filter by remark category |
| `type` | query | No | string | Filter by remark type |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/parent/children/{studentId}/performance`

### <span style="color: green;text-transform:uppercase">GET</span> /parent/children/{studentId}/performance

**Tags**: Parent Portal

**Summary**: Get child's performance summary

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |

---

## `/parents`

### <span style="color: orange;text-transform:uppercase">POST</span> /parents

**Tags**: Parents

**Summary**: Create a new parent user

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "name",
    "email",
    "password"
  ],
  "properties": {
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "password": {
      "type": "string"
    },
    "studentId": {
      "type": "string",
      "description": "Optional - Link parent to student immediately"
    }
  }
}
```

**Example**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "studentId": "string"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /parents

**Tags**: Parents

**Summary**: Get all parents of the school

---

## `/parents/link-student`

### <span style="color: blue;text-transform:uppercase">PUT</span> /parents/link-student

**Tags**: Parents

**Summary**: Link a parent to a student

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "parentId",
    "studentId"
  ],
  "properties": {
    "parentId": {
      "type": "string"
    },
    "studentId": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "parentId": "string",
  "studentId": "string"
}
```

---

## `/teacher/quizzes`

### <span style="color: orange;text-transform:uppercase">POST</span> /teacher/quizzes

**Tags**: Quiz Management

**Summary**: Create new quiz

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "title",
    "subjectId",
    "classId",
    "sectionId",
    "timeLimit",
    "questions",
    "startsAt",
    "endsAt"
  ],
  "properties": {
    "title": {
      "type": "string",
      "maxLength": 200,
      "description": "Quiz title"
    },
    "description": {
      "type": "string",
      "maxLength": 1000,
      "description": "Quiz description"
    },
    "subjectId": {
      "type": "string",
      "description": "Subject ID"
    },
    "classId": {
      "type": "string",
      "description": "Class ID"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID"
    },
    "quizType": {
      "type": "string",
      "enum": [
        "MCQ",
        "TRUE_FALSE",
        "SHORT_ANSWER",
        "MIXED"
      ],
      "default": "MCQ",
      "description": "Type of quiz"
    },
    "timeLimit": {
      "type": "number",
      "minimum": 1,
      "maximum": 180,
      "description": "Time limit in minutes"
    },
    "maxMarks": {
      "type": "number",
      "minimum": 1,
      "description": "Maximum marks"
    },
    "passingMarks": {
      "type": "number",
      "minimum": 0,
      "description": "Passing marks"
    },
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "question",
          "options",
          "correctAnswer",
          "marks"
        ],
        "properties": {
          "question": {
            "type": "string",
            "maxLength": 500,
            "description": "Question text"
          },
          "options": {
            "type": "array",
            "items": {
              "type": "string",
              "maxLength": 200
            },
            "description": "Answer options"
          },
          "correctAnswer": {
            "type": "number",
            "minimum": 0,
            "description": "Index of correct option"
          },
          "marks": {
            "type": "number",
            "minimum": 1,
            "description": "Question marks"
          },
          "explanation": {
            "type": "string",
            "maxLength": 500,
            "description": "Explanation for correct answer"
          }
        }
      }
    },
    "startsAt": {
      "type": "string",
      "format": "date-time",
      "description": "Quiz start time"
    },
    "endsAt": {
      "type": "string",
      "format": "date-time",
      "description": "Quiz end time"
    },
    "allowRetake": {
      "type": "boolean",
      "default": false,
      "description": "Allow quiz retake"
    },
    "maxAttempts": {
      "type": "number",
      "default": 1,
      "minimum": 1,
      "description": "Maximum attempts allowed"
    },
    "showCorrectAnswers": {
      "type": "boolean",
      "default": true,
      "description": "Show correct answers after submission"
    },
    "showResultsImmediately": {
      "type": "boolean",
      "default": true,
      "description": "Show results immediately after submission"
    },
    "randomizeQuestions": {
      "type": "boolean",
      "default": false,
      "description": "Randomize question order"
    },
    "randomizeOptions": {
      "type": "boolean",
      "default": false,
      "description": "Randomize option order"
    },
    "isSchoolWide": {
      "type": "boolean",
      "default": false,
      "description": "Make quiz school-wide"
    }
  }
}
```

**Example**:
```json
{
  "title": "string",
  "description": "string",
  "subjectId": "string",
  "classId": "string",
  "sectionId": "string",
  "quizType": "string",
  "timeLimit": "number",
  "maxMarks": "number",
  "passingMarks": "number",
  "questions": "array",
  "startsAt": "string",
  "endsAt": "string",
  "allowRetake": "boolean",
  "maxAttempts": "number",
  "showCorrectAnswers": "boolean",
  "showResultsImmediately": "boolean",
  "randomizeQuestions": "boolean",
  "randomizeOptions": "boolean",
  "isSchoolWide": "boolean"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/quizzes

**Tags**: Quiz Management

**Summary**: Get teacher's quizzes

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number |
| `limit` | query | No | integer | Items per page |
| `status` | query | No | string | Filter by status |
| `classId` | query | No | string | Filter by class ID |
| `sectionId` | query | No | string | Filter by section ID |

---

## `/teacher/quizzes/{id}`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/quizzes/{id}

**Tags**: Quiz Management

**Summary**: Get quiz details with statistics

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Quiz ID |

---

### <span style="color: blue;text-transform:uppercase">PUT</span> /teacher/quizzes/{id}

**Tags**: Quiz Management

**Summary**: Update quiz

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Quiz ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "maxLength": 200
    },
    "description": {
      "type": "string",
      "maxLength": 1000
    },
    "timeLimit": {
      "type": "number",
      "minimum": 1,
      "maximum": 180
    },
    "passingMarks": {
      "type": "number",
      "minimum": 0
    },
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "question": {
            "type": "string"
          },
          "options": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "correctAnswer": {
            "type": "number"
          },
          "marks": {
            "type": "number"
          },
          "explanation": {
            "type": "string"
          }
        }
      }
    },
    "startsAt": {
      "type": "string",
      "format": "date-time"
    },
    "endsAt": {
      "type": "string",
      "format": "date-time"
    },
    "allowRetake": {
      "type": "boolean"
    },
    "maxAttempts": {
      "type": "number"
    },
    "showCorrectAnswers": {
      "type": "boolean"
    },
    "showResultsImmediately": {
      "type": "boolean"
    },
    "randomizeQuestions": {
      "type": "boolean"
    },
    "randomizeOptions": {
      "type": "boolean"
    }
  }
}
```

**Example**:
```json
{
  "title": "string",
  "description": "string",
  "timeLimit": "number",
  "passingMarks": "number",
  "questions": "array",
  "startsAt": "string",
  "endsAt": "string",
  "allowRetake": "boolean",
  "maxAttempts": "number",
  "showCorrectAnswers": "boolean",
  "showResultsImmediately": "boolean",
  "randomizeQuestions": "boolean",
  "randomizeOptions": "boolean"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /teacher/quizzes/{id}

**Tags**: Quiz Management

**Summary**: Delete quiz

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Quiz ID |

---

## `/teacher/quizzes/{id}/publish`

### <span style="color: orange;text-transform:uppercase">POST</span> /teacher/quizzes/{id}/publish

**Tags**: Quiz Management

**Summary**: Publish quiz

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Quiz ID |

---

## `/teacher/quizzes/{id}/results`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/quizzes/{id}/results

**Tags**: Quiz Management

**Summary**: Get quiz results

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Quiz ID |
| `page` | query | No | integer | Page number |
| `limit` | query | No | integer | Items per page |

---

## `/teacher/quizzes/{id}/leaderboard`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/quizzes/{id}/leaderboard

**Tags**: Quiz Management

**Summary**: Get quiz leaderboard

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Quiz ID |
| `limit` | query | No | integer | Number of top performers |

---

## `/teacher/leaderboard`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/leaderboard

**Tags**: Quiz Management

**Summary**: Get school-wide quiz leaderboard

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `limit` | query | No | integer | Number of top performers |

---

## `/reports/report-card/{studentId}/{examId}`

### <span style="color: green;text-transform:uppercase">GET</span> /reports/report-card/{studentId}/{examId}

**Tags**: Reports

**Summary**: Generate and download report card PDF

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string | Student ID |
| `examId` | path | Yes | string | Exam ID |

---

## `/reports/report-card/{studentId}/{examId}/view`

### <span style="color: green;text-transform:uppercase">GET</span> /reports/report-card/{studentId}/{examId}/view

**Tags**: Reports

**Summary**: View report card PDF inline (in browser)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |
| `examId` | path | Yes | string |  |

---

## `/reports/report-cards/bulk`

### <span style="color: orange;text-transform:uppercase">POST</span> /reports/report-cards/bulk

**Tags**: Reports

**Summary**: Generate bulk report cards for a class

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "classId",
    "sectionId",
    "examId"
  ],
  "properties": {
    "classId": {
      "type": "string",
      "description": "Class ID"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID"
    },
    "examId": {
      "type": "string",
      "description": "Exam ID"
    }
  }
}
```

**Example**:
```json
{
  "classId": "string",
  "sectionId": "string",
  "examId": "string"
}
```

---

## `/reports/attendance/{studentId}`

### <span style="color: green;text-transform:uppercase">GET</span> /reports/attendance/{studentId}

**Tags**: Reports

**Summary**: Generate attendance report PDF

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `studentId` | path | Yes | string |  |
| `startDate` | query | Yes | string | Start date (YYYY-MM-DD) |
| `endDate` | query | Yes | string | End date (YYYY-MM-DD) |

---

## `/roll-numbers/bulk-assign`

### <span style="color: orange;text-transform:uppercase">POST</span> /roll-numbers/bulk-assign

**Tags**: Roll Number Management

**Summary**: Assign roll numbers to multiple students

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "enrollments",
    "academicSessionId"
  ],
  "properties": {
    "enrollments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "enrollmentId": {
            "type": "string",
            "description": "Enrollment ID"
          },
          "studentId": {
            "type": "string",
            "description": "Student ID"
          }
        }
      }
    },
    "description": "Array of enrollment objects with IDs",
    "startFrom": {
      "type": "integer",
      "minimum": 1,
      "default": 1,
      "description": "Starting roll number"
    },
    "prefix": {
      "type": "string",
      "description": "Prefix for roll numbers"
    },
    "academicSessionId": {
      "type": "string",
      "description": "Academic session ID"
    }
  }
}
```

**Example**:
```json
{
  "enrollments": "array",
  "startFrom": "integer",
  "prefix": "string",
  "academicSessionId": "string"
}
```

---

## `/roll-numbers/reassign`

### <span style="color: orange;text-transform:uppercase">POST</span> /roll-numbers/reassign

**Tags**: Roll Number Management

**Summary**: Reassign roll numbers for a class-section

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "classId",
    "sectionId",
    "academicSessionId"
  ],
  "properties": {
    "classId": {
      "type": "string",
      "description": "Class ID"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID"
    },
    "academicSessionId": {
      "type": "string",
      "description": "Academic session ID"
    },
    "startFrom": {
      "type": "integer",
      "minimum": 1,
      "default": 1,
      "description": "Starting roll number"
    },
    "prefix": {
      "type": "string",
      "description": "Prefix for roll numbers"
    },
    "preserveExisting": {
      "type": "boolean",
      "default": false,
      "description": "Whether to preserve existing roll numbers"
    }
  }
}
```

**Example**:
```json
{
  "classId": "string",
  "sectionId": "string",
  "academicSessionId": "string",
  "startFrom": "integer",
  "prefix": "string",
  "preserveExisting": "boolean"
}
```

---

## `/roll-numbers/class/{classId}/section/{sectionId}`

### <span style="color: green;text-transform:uppercase">GET</span> /roll-numbers/class/{classId}/section/{sectionId}

**Tags**: Roll Number Management

**Summary**: Get roll number assignments for a class-section

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | path | Yes | string | Class ID |
| `sectionId` | path | Yes | string | Section ID |
| `academicSessionId` | query | Yes | string | Academic session ID |
| `search` | query | No | string | Search by student name or roll number |

---

## `/roll-numbers/auto-assign-session`

### <span style="color: orange;text-transform:uppercase">POST</span> /roll-numbers/auto-assign-session

**Tags**: Roll Number Management

**Summary**: Auto-assign roll numbers for all classes in a session

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "academicSessionId"
  ],
  "properties": {
    "academicSessionId": {
      "type": "string",
      "description": "Academic session ID"
    },
    "prefix": {
      "type": "string",
      "description": "Prefix for roll numbers"
    }
  }
}
```

**Example**:
```json
{
  "academicSessionId": "string",
  "prefix": "string"
}
```

---

## `/roll-numbers/validate`

### <span style="color: orange;text-transform:uppercase">POST</span> /roll-numbers/validate

**Tags**: Roll Number Management

**Summary**: Validate roll number uniqueness

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "rollNumber",
    "classId",
    "sectionId",
    "academicSessionId"
  ],
  "properties": {
    "rollNumber": {
      "type": "string",
      "description": "Roll number to validate"
    },
    "classId": {
      "type": "string",
      "description": "Class ID"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID"
    },
    "academicSessionId": {
      "type": "string",
      "description": "Academic session ID"
    },
    "excludeId": {
      "type": "string",
      "description": "Enrollment ID to exclude from check"
    }
  }
}
```

**Example**:
```json
{
  "rollNumber": "string",
  "classId": "string",
  "sectionId": "string",
  "academicSessionId": "string",
  "excludeId": "string"
}
```

---

## `/sections`

### <span style="color: orange;text-transform:uppercase">POST</span> /sections

**Tags**: Sections

**Summary**: Create a new section

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "classId": {
      "type": "string"
    },
    "classTeacher": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "name": "string",
  "classId": "string",
  "classTeacher": "string"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /sections

**Tags**: Sections

**Summary**: Get all sections of the logged-in school

---

## `/sections/class/{classId}`

### <span style="color: green;text-transform:uppercase">GET</span> /sections/class/{classId}

**Tags**: Sections

**Summary**: Get sections for a specific class

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | path | Yes | string |  |

---

## `/sections/{id}`

### <span style="color: blue;text-transform:uppercase">PATCH</span> /sections/{id}

**Tags**: Sections

**Summary**: Update a section

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "classTeacher": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "name": "string",
  "classTeacher": "string"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /sections/{id}

**Tags**: Sections

**Summary**: Soft delete a section

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

## `/student/profile`

### <span style="color: green;text-transform:uppercase">GET</span> /student/profile

**Tags**: Student Portal

**Summary**: Get student profile

---

### <span style="color: blue;text-transform:uppercase">PUT</span> /student/profile

**Tags**: Student Portal

**Summary**: Update student profile

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "address": {
      "type": "string"
    },
    "bloodGroup": {
      "type": "string"
    },
    "emergencyContact": {
      "type": "string"
    },
    "phone": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "address": "string",
  "bloodGroup": "string",
  "emergencyContact": "string",
  "phone": "string"
}
```

---

## `/student/attendance`

### <span style="color: green;text-transform:uppercase">GET</span> /student/attendance

**Tags**: Student Portal

**Summary**: Get student's attendance records

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `startDate` | query | No | string | Start date (YYYY-MM-DD) |
| `endDate` | query | No | string | End date (YYYY-MM-DD) |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/student/fees`

### <span style="color: green;text-transform:uppercase">GET</span> /student/fees

**Tags**: Student Portal

**Summary**: Get student's fee details

---

## `/student/results`

### <span style="color: green;text-transform:uppercase">GET</span> /student/results

**Tags**: Student Portal

**Summary**: Get student's exam results

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `examId` | query | No | string | Filter by exam ID |
| `subjectId` | query | No | string | Filter by subject ID |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/student/exams`

### <span style="color: green;text-transform:uppercase">GET</span> /student/exams

**Tags**: Student Portal

**Summary**: Get upcoming and recent exams

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `status` | query | No | string | Filter exam status |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/student/announcements`

### <span style="color: green;text-transform:uppercase">GET</span> /student/announcements

**Tags**: Student Portal

**Summary**: Get announcements for student

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/student/dashboard`

### <span style="color: green;text-transform:uppercase">GET</span> /student/dashboard

**Tags**: Student Portal

**Summary**: Get student dashboard statistics

---

## `/student/homework`

### <span style="color: green;text-transform:uppercase">GET</span> /student/homework

**Tags**: Student Portal

**Summary**: Get student homework assignments

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `status` | query | No | string | Filter by homework status |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/student/homework/{homeworkId}`

### <span style="color: green;text-transform:uppercase">GET</span> /student/homework/{homeworkId}

**Tags**: Student Portal

**Summary**: Get single homework with submission details

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `homeworkId` | path | Yes | string |  |

---

## `/student/homework/{homeworkId}/submit`

### <span style="color: orange;text-transform:uppercase">POST</span> /student/homework/{homeworkId}/submit

**Tags**: Student Portal

**Summary**: Submit homework assignment

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `homeworkId` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "content"
  ],
  "properties": {
    "content": {
      "type": "string"
    },
    "attachments": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
```

**Example**:
```json
{
  "content": "string",
  "attachments": "array"
}
```

---

## `/student/remarks`

### <span style="color: green;text-transform:uppercase">GET</span> /student/remarks

**Tags**: Student Portal

**Summary**: Get student remarks

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `category` | query | No | string | Filter by remark category |
| `type` | query | No | string | Filter by remark type |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/student/quizzes`

### <span style="color: green;text-transform:uppercase">GET</span> /student/quizzes

**Tags**: Student Quiz

**Summary**: Get available quizzes for student

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number |
| `limit` | query | No | integer | Items per page |

---

## `/student/quizzes/{id}/start`

### <span style="color: orange;text-transform:uppercase">POST</span> /student/quizzes/{id}/start

**Tags**: Student Quiz

**Summary**: Start quiz attempt

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Quiz ID |

---

## `/student/quizzes/{id}/answer`

### <span style="color: orange;text-transform:uppercase">POST</span> /student/quizzes/{id}/answer

**Tags**: Student Quiz

**Summary**: Submit quiz answer

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Quiz ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "questionIndex",
    "selectedAnswer"
  ],
  "properties": {
    "questionIndex": {
      "type": "integer",
      "description": "Index of question"
    },
    "selectedAnswer": {
      "type": "integer",
      "description": "Selected option index"
    }
  }
}
```

**Example**:
```json
{
  "questionIndex": "integer",
  "selectedAnswer": "integer"
}
```

---

## `/student/quizzes/{id}/submit`

### <span style="color: orange;text-transform:uppercase">POST</span> /student/quizzes/{id}/submit

**Tags**: Student Quiz

**Summary**: Submit quiz

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Quiz ID |

---

## `/student/quizzes/{id}/results`

### <span style="color: green;text-transform:uppercase">GET</span> /student/quizzes/{id}/results

**Tags**: Student Quiz

**Summary**: Get quiz results

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Quiz ID |

---

## `/student/quizzes/history`

### <span style="color: green;text-transform:uppercase">GET</span> /student/quizzes/history

**Tags**: Student Quiz

**Summary**: Get student's quiz history

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number |
| `limit` | query | No | integer | Items per page |

---

## `/student/quizzes/stats`

### <span style="color: green;text-transform:uppercase">GET</span> /student/quizzes/stats

**Tags**: Student Quiz

**Summary**: Get student's quiz statistics

---

## `/students`

### <span style="color: orange;text-transform:uppercase">POST</span> /students

**Tags**: Students

**Summary**: Add a new student

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "admissionNumber": {
      "type": "string"
    },
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "gender": {
      "type": "string",
      "enum": [
        "Male",
        "Female",
        "Other"
      ]
    },
    "dateOfBirth": {
      "type": "string",
      "format": "date"
    },
    "classId": {
      "type": "string"
    },
    "sectionId": {
      "type": "string"
    },
    "parentName": {
      "type": "string"
    },
    "parentPhone": {
      "type": "string"
    },
    "address": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "admissionNumber": "string",
  "firstName": "string",
  "lastName": "string",
  "gender": "string",
  "dateOfBirth": "string",
  "classId": "string",
  "sectionId": "string",
  "parentName": "string",
  "parentPhone": "string",
  "address": "string"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /students

**Tags**: Students

**Summary**: Get all students for the logged-in user's school

**Description**: Role-based access:
- superadmin/school_admin/teacher: Returns all students in school
- parent: Returns only their own children (filtered by parentUserId)


**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number |
| `limit` | query | No | integer | Number of students per page (max 100) |

---

## `/students/{id}`

### <span style="color: green;text-transform:uppercase">GET</span> /students/{id}

**Tags**: Students

**Summary**: Get a single student by ID

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Student ID |

---

### <span style="color: blue;text-transform:uppercase">PUT</span> /students/{id}

**Tags**: Students

**Summary**: Update a student

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Student ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "gender": {
      "type": "string",
      "enum": [
        "Male",
        "Female",
        "Other"
      ]
    },
    "dateOfBirth": {
      "type": "string",
      "format": "date"
    },
    "classId": {
      "type": "string"
    },
    "sectionId": {
      "type": "string"
    },
    "parentName": {
      "type": "string"
    },
    "parentPhone": {
      "type": "string"
    },
    "address": {
      "type": "string"
    },
    "rollNumber": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "gender": "string",
  "dateOfBirth": "string",
  "classId": "string",
  "sectionId": "string",
  "parentName": "string",
  "parentPhone": "string",
  "address": "string",
  "rollNumber": "string"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /students/{id}

**Tags**: Students

**Summary**: Soft delete a student

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Student ID |

---

## `/students/import/template`

### <span style="color: green;text-transform:uppercase">GET</span> /students/import/template

**Tags**: Students

**Summary**: Download CSV template for bulk import

---

## `/students/import/bulk`

### <span style="color: orange;text-transform:uppercase">POST</span> /students/import/bulk

**Tags**: Students

**Summary**: Bulk import students from CSV

**Payload (Request Body)**:

Content-Type: `multipart/form-data`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "file": {
      "type": "string",
      "format": "binary",
      "description": "CSV file with student data"
    }
  }
}
```

**Example**:
```json
{
  "file": "string"
}
```

---

## `/teacher-assignments`

### <span style="color: orange;text-transform:uppercase">POST</span> /teacher-assignments

**Tags**: TeacherAssignments

**Summary**: Create a new teacher assignment

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "teacherId",
    "classId",
    "sectionId",
    "subjectId"
  ],
  "properties": {
    "teacherId": {
      "type": "string",
      "description": "Teacher's User ID"
    },
    "classId": {
      "type": "string",
      "description": "Class ID"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID"
    },
    "subjectId": {
      "type": "string",
      "description": "Subject ID"
    }
  }
}
```

**Example**:
```json
{
  "teacherId": "string",
  "classId": "string",
  "sectionId": "string",
  "subjectId": "string"
}
```

---

### <span style="color: green;text-transform:uppercase">GET</span> /teacher-assignments

**Tags**: TeacherAssignments

**Summary**: Get all teacher assignments (teachers see only their own)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer | Page number |
| `limit` | query | No | integer | Items per page (max 100) |
| `teacherId` | query | No | string | Filter by teacher ID |
| `classId` | query | No | string | Filter by class ID |
| `sectionId` | query | No | string | Filter by section ID |
| `isActive` | query | No | boolean | Filter by active status |

---

## `/teacher-assignments/teacher/{teacherId}`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher-assignments/teacher/{teacherId}

**Tags**: TeacherAssignments

**Summary**: Get all assignments for a specific teacher

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `teacherId` | path | Yes | string | Teacher's User ID |

---

## `/teacher-assignments/{id}`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher-assignments/{id}

**Tags**: TeacherAssignments

**Summary**: Get a single assignment by ID

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Assignment ID |

---

### <span style="color: blue;text-transform:uppercase">PATCH</span> /teacher-assignments/{id}

**Tags**: TeacherAssignments

**Summary**: Update a teacher assignment

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Assignment ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "teacherId": {
      "type": "string"
    },
    "classId": {
      "type": "string"
    },
    "sectionId": {
      "type": "string"
    },
    "subjectId": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean"
    }
  }
}
```

**Example**:
```json
{
  "teacherId": "string",
  "classId": "string",
  "sectionId": "string",
  "subjectId": "string",
  "isActive": "boolean"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /teacher-assignments/{id}

**Tags**: TeacherAssignments

**Summary**: Delete a teacher assignment

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Assignment ID |

---

## `/teacher/profile`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/profile

**Tags**: Teacher Portal

**Summary**: Get teacher profile with assignments

---

## `/teacher/classes`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/classes

**Tags**: Teacher Portal

**Summary**: Get classes assigned to teacher

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/teacher/students`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/students

**Tags**: Teacher Portal

**Summary**: Get students from assigned classes

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | query | No | string | Filter by class ID |
| `sectionId` | query | No | string | Filter by section ID |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/teacher/attendance`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/attendance

**Tags**: Teacher Portal

**Summary**: Get attendance for assigned students

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | query | No | string | Filter by class ID |
| `sectionId` | query | No | string | Filter by section ID |
| `startDate` | query | No | string | Start date (YYYY-MM-DD) |
| `endDate` | query | No | string | End date (YYYY-MM-DD) |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/teacher/attendance/mark`

### <span style="color: orange;text-transform:uppercase">POST</span> /teacher/attendance/mark

**Tags**: Teacher Portal

**Summary**: Mark attendance for students

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "classId",
    "sectionId",
    "date",
    "attendanceRecords"
  ],
  "properties": {
    "classId": {
      "type": "string"
    },
    "sectionId": {
      "type": "string"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "attendanceRecords": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "studentId",
          "status"
        ],
        "properties": {
          "studentId": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "Present",
              "Absent",
              "Late",
              "Half Day",
              "Leave"
            ]
          },
          "remarks": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

**Example**:
```json
{
  "classId": "string",
  "sectionId": "string",
  "date": "string",
  "attendanceRecords": "array"
}
```

---

## `/teacher/attendance/update`

### <span style="color: blue;text-transform:uppercase">PUT</span> /teacher/attendance/update

**Tags**: Teacher Portal

**Summary**: Update attendance record

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "attendanceId",
    "status"
  ],
  "properties": {
    "attendanceId": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "Present",
        "Absent",
        "Late",
        "Half Day",
        "Leave"
      ]
    },
    "remarks": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "attendanceId": "string",
  "status": "string",
  "remarks": "string"
}
```

---

## `/teacher/exams`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/exams

**Tags**: Teacher Portal

**Summary**: Get exams for assigned classes

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | query | No | string | Filter by class ID |
| `sectionId` | query | No | string | Filter by section ID |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/teacher/results`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/results

**Tags**: Teacher Portal

**Summary**: Get results for assigned students

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | query | No | string | Filter by class ID |
| `sectionId` | query | No | string | Filter by section ID |
| `examId` | query | No | string | Filter by exam ID |
| `subjectId` | query | No | string | Filter by subject ID |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/teacher/results/add`

### <span style="color: orange;text-transform:uppercase">POST</span> /teacher/results/add

**Tags**: Teacher Portal

**Summary**: Add exam results for students

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "examId",
    "subjectId",
    "classId",
    "sectionId",
    "results"
  ],
  "properties": {
    "examId": {
      "type": "string"
    },
    "subjectId": {
      "type": "string"
    },
    "classId": {
      "type": "string"
    },
    "sectionId": {
      "type": "string"
    },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "studentId",
          "marksObtained",
          "maxMarks"
        ],
        "properties": {
          "studentId": {
            "type": "string"
          },
          "marksObtained": {
            "type": "number"
          },
          "maxMarks": {
            "type": "number"
          },
          "grade": {
            "type": "string"
          },
          "remarks": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

**Example**:
```json
{
  "examId": "string",
  "subjectId": "string",
  "classId": "string",
  "sectionId": "string",
  "results": "array"
}
```

---

## `/teacher/results/update`

### <span style="color: blue;text-transform:uppercase">PUT</span> /teacher/results/update

**Tags**: Teacher Portal

**Summary**: Update exam result

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "resultId"
  ],
  "properties": {
    "resultId": {
      "type": "string"
    },
    "marksObtained": {
      "type": "number"
    },
    "maxMarks": {
      "type": "number"
    },
    "grade": {
      "type": "string"
    },
    "remarks": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "resultId": "string",
  "marksObtained": "number",
  "maxMarks": "number",
  "grade": "string",
  "remarks": "string"
}
```

---

## `/teacher/dashboard`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/dashboard

**Tags**: Teacher Portal

**Summary**: Get teacher dashboard statistics

---

## `/teacher/homework`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/homework

**Tags**: Teacher Portal

**Summary**: Get homework assignments for teacher

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | query | No | string | Filter by class ID |
| `sectionId` | query | No | string | Filter by section ID |
| `subjectId` | query | No | string | Filter by subject ID |
| `status` | query | No | string | Filter by status |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

### <span style="color: orange;text-transform:uppercase">POST</span> /teacher/homework

**Tags**: Teacher Portal

**Summary**: Create new homework assignment

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "title",
    "description",
    "subjectId",
    "classId",
    "sectionId",
    "dueDate"
  ],
  "properties": {
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "subjectId": {
      "type": "string"
    },
    "classId": {
      "type": "string"
    },
    "sectionId": {
      "type": "string"
    },
    "dueDate": {
      "type": "string",
      "format": "date"
    },
    "maxMarks": {
      "type": "number"
    },
    "attachments": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "allowLateSubmission": {
      "type": "boolean"
    },
    "lateSubmissionPenalty": {
      "type": "number"
    }
  }
}
```

**Example**:
```json
{
  "title": "string",
  "description": "string",
  "subjectId": "string",
  "classId": "string",
  "sectionId": "string",
  "dueDate": "string",
  "maxMarks": "number",
  "attachments": "array",
  "allowLateSubmission": "boolean",
  "lateSubmissionPenalty": "number"
}
```

---

## `/teacher/homework/{homeworkId}/submissions`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/homework/{homeworkId}/submissions

**Tags**: Teacher Portal

**Summary**: Get homework submissions

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `homeworkId` | path | Yes | string |  |
| `status` | query | No | string | Filter by submission status |
| `page` | query | No | integer |  |
| `limit` | query | No | integer |  |

---

## `/teacher/homework/{homeworkId}/grade`

### <span style="color: blue;text-transform:uppercase">PUT</span> /teacher/homework/{homeworkId}/grade

**Tags**: Teacher Portal

**Summary**: Grade homework submission

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `homeworkId` | path | Yes | string |  |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "submissionId",
    "marks"
  ],
  "properties": {
    "submissionId": {
      "type": "string"
    },
    "marks": {
      "type": "number"
    },
    "grade": {
      "type": "string"
    },
    "feedback": {
      "type": "string"
    }
  }
}
```

**Example**:
```json
{
  "submissionId": "string",
  "marks": "number",
  "grade": "string",
  "feedback": "string"
}
```

---

## `/teacher/homework/stats`

### <span style="color: green;text-transform:uppercase">GET</span> /teacher/homework/stats

**Tags**: Teacher Portal

**Summary**: Get homework statistics

---

## `/timetable`

### <span style="color: orange;text-transform:uppercase">POST</span> /timetable

**Tags**: Timetable

**Summary**: Create a new timetable slot

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "classId",
    "sectionId",
    "day",
    "periodNumber",
    "subjectId",
    "teacherId",
    "startTime",
    "endTime",
    "academicSessionId"
  ],
  "properties": {
    "classId": {
      "type": "string",
      "description": "Class ID"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID"
    },
    "day": {
      "type": "string",
      "enum": [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY"
      ],
      "description": "Day of the week"
    },
    "periodNumber": {
      "type": "integer",
      "minimum": 1,
      "maximum": 12,
      "description": "Period number (1-12)"
    },
    "subjectId": {
      "type": "string",
      "description": "Subject ID"
    },
    "teacherId": {
      "type": "string",
      "description": "Teacher ID"
    },
    "startTime": {
      "type": "string",
      "pattern": "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$",
      "description": "Start time in HH:MM format (24-hour)"
    },
    "endTime": {
      "type": "string",
      "pattern": "^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$",
      "description": "End time in HH:MM format (24-hour)"
    },
    "room": {
      "type": "string",
      "maxLength": 50,
      "description": "Room number (optional)"
    },
    "academicSessionId": {
      "type": "string",
      "description": "Academic session ID"
    },
    "semester": {
      "type": "string",
      "enum": [
        "FIRST",
        "SECOND"
      ],
      "default": "FIRST",
      "description": "Semester"
    }
  }
}
```

**Example**:
```json
{
  "classId": "string",
  "sectionId": "string",
  "day": "string",
  "periodNumber": "integer",
  "subjectId": "string",
  "teacherId": "string",
  "startTime": "string",
  "endTime": "string",
  "room": "string",
  "academicSessionId": "string",
  "semester": "string"
}
```

---

## `/timetable/bulk`

### <span style="color: orange;text-transform:uppercase">POST</span> /timetable/bulk

**Tags**: Timetable

**Summary**: Create multiple timetable slots

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "required": [
    "timetableSlots",
    "academicSessionId"
  ],
  "properties": {
    "timetableSlots": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Array of timetable slot objects"
    },
    "academicSessionId": {
      "type": "string",
      "description": "Academic session ID for all slots"
    }
  }
}
```

**Example**:
```json
{
  "timetableSlots": "array",
  "academicSessionId": "string"
}
```

---

## `/timetable/class/{classId}/section/{sectionId}`

### <span style="color: green;text-transform:uppercase">GET</span> /timetable/class/{classId}/section/{sectionId}

**Tags**: Timetable

**Summary**: Get class timetable

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | path | Yes | string | Class ID |
| `sectionId` | path | Yes | string | Section ID |
| `academicSessionId` | query | Yes | string | Academic session ID |
| `day` | query | No | string | Filter by specific day |
| `semester` | query | No | string | Filter by semester |

---

## `/timetable/teacher/{teacherId}`

### <span style="color: green;text-transform:uppercase">GET</span> /timetable/teacher/{teacherId}

**Tags**: Timetable

**Summary**: Get teacher timetable

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `teacherId` | path | Yes | string | Teacher ID |
| `academicSessionId` | query | Yes | string | Academic session ID |
| `day` | query | No | string | Filter by specific day |
| `semester` | query | No | string | Filter by semester |

---

## `/timetable/weekly/class/{classId}/section/{sectionId}`

### <span style="color: green;text-transform:uppercase">GET</span> /timetable/weekly/class/{classId}/section/{sectionId}

**Tags**: Timetable

**Summary**: Get weekly timetable (organized by day)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | path | Yes | string | Class ID |
| `sectionId` | path | Yes | string | Section ID |
| `academicSessionId` | query | Yes | string | Academic session ID |
| `semester` | query | No | string | Filter by semester |

---

## `/timetable/{id}`

### <span style="color: blue;text-transform:uppercase">PUT</span> /timetable/{id}

**Tags**: Timetable

**Summary**: Update timetable slot

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Timetable entry ID |

**Payload (Request Body)**:

Content-Type: `application/json`

**Schema**:
```json
{
  "type": "object",
  "properties": {
    "classId": {
      "type": "string",
      "description": "Class ID"
    },
    "sectionId": {
      "type": "string",
      "description": "Section ID"
    },
    "day": {
      "type": "string",
      "enum": [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY"
      ],
      "description": "Day of the week"
    },
    "periodNumber": {
      "type": "integer",
      "minimum": 1,
      "maximum": 12,
      "description": "Period number (1-12)"
    },
    "subjectId": {
      "type": "string",
      "description": "Subject ID"
    },
    "teacherId": {
      "type": "string",
      "description": "Teacher ID"
    },
    "startTime": {
      "type": "string",
      "description": "Start time in HH:MM format"
    },
    "endTime": {
      "type": "string",
      "description": "End time in HH:MM format"
    },
    "room": {
      "type": "string",
      "description": "Room number"
    },
    "semester": {
      "type": "string",
      "enum": [
        "FIRST",
        "SECOND"
      ],
      "description": "Semester"
    }
  }
}
```

**Example**:
```json
{
  "classId": "string",
  "sectionId": "string",
  "day": "string",
  "periodNumber": "integer",
  "subjectId": "string",
  "teacherId": "string",
  "startTime": "string",
  "endTime": "string",
  "room": "string",
  "semester": "string"
}
```

---

### <span style="color: blue;text-transform:uppercase">DELETE</span> /timetable/{id}

**Tags**: Timetable

**Summary**: Delete timetable slot

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string | Timetable entry ID |

---

## `/timetable/class/{classId}/section/{sectionId}/session/{sessionId}`

### <span style="color: blue;text-transform:uppercase">DELETE</span> /timetable/class/{classId}/section/{sectionId}/session/{sessionId}

**Tags**: Timetable

**Summary**: Delete entire class timetable

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `classId` | path | Yes | string | Class ID |
| `sectionId` | path | Yes | string | Section ID |
| `sessionId` | path | Yes | string | Academic session ID |

---

## `/users/{id}/status`

### <span style="color: blue;text-transform:uppercase">PATCH</span> /users/{id}/status

**Tags**: Users

**Summary**: Toggle user status (activate/deactivate)

**Parameters**:

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `id` | path | Yes | string |  |

---

