# Quiz System API Documentation

## Overview
Complete quiz system for Teachers, Students, and Admins with real-time quiz creation, taking, and leaderboard functionality.

## Base URLs
```
Teacher API: https://sms-backend-d19v.onrender.com/api/v1/teacher
Student API: https://sms-backend-d19v.onrender.com/api/v1/student
Admin API: https://sms-backend-d19v.onrender.com/api/v1/admin
```

## Authentication
All APIs require Bearer token authentication:
```
Authorization: Bearer <user_token>
```

---

## 🎓 TEACHER QUIZ APIS

### 1. Create Quiz
**POST** `/teacher/quizzes`

**Description:** Create a new quiz with questions, options, and settings

**Request Body:**
```json
{
  "title": "Physics Quick Quiz - Chapter 1",
  "description": "Test your knowledge of basic physics concepts",
  "subjectId": "60f7b3b3b9e6a1a8c8d4f5",
  "classId": "60f7b3b3b9e6a1a8c8d4f6",
  "sectionId": "60f7b3b3b9e6a1a8c8d4f7",
  "quizType": "MCQ",
  "timeLimit": 30,
  "maxMarks": 50,
  "passingMarks": 25,
  "startsAt": "2026-04-16T10:00:00.000Z",
  "endsAt": "2026-04-16T11:00:00.000Z",
  "allowRetake": true,
  "maxAttempts": 3,
  "showCorrectAnswers": true,
  "showResultsImmediately": true,
  "randomizeQuestions": false,
  "randomizeOptions": false,
  "isSchoolWide": false,
  "questions": [
    {
      "question": "What is Newton's First Law of Motion?",
      "options": [
        "Every action has equal and opposite reaction",
        "An object at rest stays at rest unless acted upon",
        "Force equals mass times acceleration",
        "Energy cannot be created or destroyed"
      ],
      "correctAnswer": 1,
      "marks": 10,
      "explanation": "Newton's First Law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force."
    },
    {
      "question": "What is the SI unit of force?",
      "options": ["Joule", "Newton", "Watt", "Pascal"],
      "correctAnswer": 1,
      "marks": 10,
      "explanation": "Newton (N) is the SI unit of force."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "data": {
    "_id": "60f7b3b3b9e6a1a8c8d4f8",
    "title": "Physics Quick Quiz - Chapter 1",
    "status": "DRAFT",
    "teacherId": "60f7b3b3b9e6a1a8c8d4f0",
    "schoolId": "60f7b3b3b9e6a1a8c8d4f1",
    "totalQuestions": 2,
    "isActive": false,
    "createdAt": "2026-04-16T09:30:00.000Z"
  }
}
```

### 2. Get Teacher's Quizzes
**GET** `/teacher/quizzes?page=1&limit=20&status=DRAFT&classId=60f7b3b3b9e6a1a8c8d4f6`

**Description:** Get all quizzes created by the teacher with filters

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (DRAFT, PUBLISHED, ACTIVE, ENDED, CANCELLED)
- `classId` (optional): Filter by class ID
- `sectionId` (optional): Filter by section ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b9e6a1a8c8d4f8",
      "title": "Physics Quick Quiz - Chapter 1",
      "status": "DRAFT",
      "totalQuestions": 2,
      "maxMarks": 50,
      "startsAt": "2026-04-16T10:00:00.000Z",
      "endsAt": "2026-04-16T11:00:00.000Z",
      "subjectId": {
        "_id": "60f7b3b3b9e6a1a8c8d4f5",
        "name": "Physics"
      },
      "classId": {
        "_id": "60f7b3b3b9e6a1a8c8d4f6",
        "name": "Class 10"
      },
      "sectionId": {
        "_id": "60f7b3b3b9e6a1a8c8d4f7",
        "name": "Section A"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalQuizzes": 1
  }
}
```

### 3. Get Quiz Details
**GET** `/teacher/quizzes/:id`

**Description:** Get detailed quiz information with statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "_id": "60f7b3b3b9e6a1a8c8d4f8",
      "title": "Physics Quick Quiz - Chapter 1",
      "description": "Test your knowledge of basic physics concepts",
      "status": "PUBLISHED",
      "totalQuestions": 2,
      "maxMarks": 50,
      "passingMarks": 25,
      "timeLimit": 30,
      "questions": [...]
    },
    "stats": {
      "totalSubmissions": 25,
      "averagePercentage": 78.5,
      "highestScore": 95.0,
      "lowestScore": 45.0,
      "passedCount": 22
    }
  }
}
```

### 4. Update Quiz
**PUT** `/teacher/quizzes/:id`

**Description:** Update quiz details (only allowed for DRAFT status)

**Request Body:** Same as create quiz (all fields optional)

**Response:**
```json
{
  "success": true,
  "message": "Quiz updated successfully",
  "data": {
    "_id": "60f7b3b3b9e6a1a8c8d4f8",
    "title": "Updated Physics Quiz",
    "updatedAt": "2026-04-16T09:45:00.000Z"
  }
}
```

### 5. Publish Quiz
**POST** `/teacher/quizzes/:id/publish`

**Description:** Publish quiz to make it available for students

**Response:**
```json
{
  "success": true,
  "message": "Quiz published successfully",
  "data": {
    "_id": "60f7b3b3b9e6a1a8c8d4f8",
    "status": "PUBLISHED",
    "publishedAt": "2026-04-16T09:45:00.000Z"
  }
}
```

### 6. Delete Quiz
**DELETE** `/teacher/quizzes/:id`

**Description:** Delete quiz (only allowed if no submissions exist)

**Response:**
```json
{
  "success": true,
  "message": "Quiz deleted successfully"
}
```

### 7. Get Quiz Results
**GET** `/teacher/quizzes/:id/results?page=1&limit=50`

**Description:** Get all student submissions for a quiz

**Response:**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "_id": "60f7b3b3b9e6a1a8c8d4f8",
      "title": "Physics Quick Quiz - Chapter 1",
      "maxMarks": 50,
      "passingMarks": 25,
      "totalQuestions": 2
    },
    "submissions": [
      {
        "_id": "60f7b3b3b9e6a1a8c8d4f9",
        "studentId": {
          "_id": "60f7b3b3b9e6a1a8c8d4fa",
          "firstName": "John",
          "lastName": "Doe",
          "admissionNumber": "ADM001"
        },
        "attemptNumber": 1,
        "submittedAt": "2026-04-16T10:25:00.000Z",
        "timeTakenFormatted": "25m 15s",
        "marksObtained": 45,
        "percentage": 90.0,
        "grade": "A+",
        "passed": true
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalSubmissions": 25
  }
}
```

### 8. Get Quiz Leaderboard
**GET** `/teacher/quizzes/:id/leaderboard?limit=10`

**Description:** Get top performers for a specific quiz

**Response:**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "_id": "60f7b3b3b9e6a1a8c8d4f8",
      "title": "Physics Quick Quiz - Chapter 1",
      "maxMarks": 50
    },
    "leaderboard": [
      {
        "_id": "60f7b3b3b9e6a1a8c8d4f9",
        "studentId": {
          "_id": "60f7b3b3b9e6a1a8c8d4fa",
          "firstName": "Alice",
          "lastName": "Smith",
          "admissionNumber": "ADM002"
        },
        "percentage": 95.0,
        "grade": "A+",
        "submittedAt": "2026-04-16T10:20:00.000Z"
      }
    ]
  }
}
```

### 9. Get School Leaderboard
**GET** `/teacher/leaderboard?limit=20`

**Description:** Get school-wide quiz leaderboard

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "studentId": "60f7b3b3b9e6a1a8c8d4fa",
      "studentName": "Alice Smith",
      "admissionNumber": "ADM002",
      "totalQuizzes": 15,
      "totalMarks": 1250,
      "averagePercentage": 83.33,
      "bestScore": 95.0,
      "lastQuizDate": "2026-04-16T10:20:00.000Z"
    }
  ]
}
```

---

## 🎓 STUDENT QUIZ APIS

### 1. Get Available Quizzes
**GET** `/student/quizzes?page=1&limit=20`

**Description:** Get all available quizzes for the student

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b9e6a1a8c8d4f8",
      "title": "Physics Quick Quiz - Chapter 1",
      "description": "Test your knowledge of basic physics concepts",
      "timeLimit": 30,
      "maxMarks": 50,
      "startsAt": "2026-04-16T10:00:00.000Z",
      "endsAt": "2026-04-16T11:00:00.000Z",
      "submissionStatus": "NOT_ATTEMPTED",
      "attempts": 0,
      "bestScore": 0,
      "bestGrade": "F",
      "canRetake": true,
      "nextAttemptAvailable": true,
      "subjectId": {
        "_id": "60f7b3b3b9e6a1a8c8d4f5",
        "name": "Physics"
      },
      "teacherId": {
        "_id": "60f7b3b3b9e6a1a8c8d4f0",
        "firstName": "Mr.",
        "lastName": "Teacher"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalQuizzes": 1
  }
}
```

### 2. Start Quiz
**POST** `/student/quizzes/:id/start`

**Description:** Start a quiz attempt

**Response:**
```json
{
  "success": true,
  "message": "Quiz started successfully",
  "data": {
    "submissionId": "60f7b3b3b9e6a1a8c8d4f9",
    "quiz": {
      "_id": "60f7b3b3b9e6a1a8c8d4f8",
      "title": "Physics Quick Quiz - Chapter 1",
      "timeLimit": 30,
      "maxMarks": 50,
      "showCorrectAnswers": true,
      "showResultsImmediately": true
    },
    "questions": [
      {
        "question": "What is Newton's First Law of Motion?",
        "options": [
          "Every action has equal and opposite reaction",
          "An object at rest stays at rest unless acted upon",
          "Force equals mass times acceleration",
          "Energy cannot be created or destroyed"
        ],
        "marks": 10
      }
    ],
    "timeRemaining": 1800,
    "startedAt": "2026-04-16T10:00:00.000Z"
  }
}
```

### 3. Submit Answer
**POST** `/student/quizzes/:id/answer`

**Description:** Save answer for a specific question (real-time)

**Request Body:**
```json
{
  "questionIndex": 0,
  "selectedAnswer": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer saved successfully",
  "data": {
    "timeRemaining": 1650
  }
}
```

### 4. Submit Quiz
**POST** `/student/quizzes/:id/submit`

**Description:** Submit the completed quiz for grading

**Response:**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "submissionId": "60f7b3b3b9e6a1a8c8d4f9",
    "results": {
      "totalQuestions": 2,
      "correctAnswers": 1,
      "wrongAnswers": 1,
      "totalMarks": 50,
      "marksObtained": 35,
      "percentage": 70.0,
      "grade": "B+",
      "passed": true,
      "timeTaken": "25m 15s",
      "answers": [
        {
          "questionIndex": 0,
          "selectedAnswer": 1,
          "isCorrect": true,
          "correctAnswer": 1,
          "explanation": "Newton's First Law states that..."
        }
      ]
    }
  }
}
```

### 5. Get Quiz Results
**GET** `/student/quizzes/:id/results`

**Description:** Get detailed results for a completed quiz

**Response:**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "_id": "60f7b3b3b9e6a1a8c8d4f8",
      "title": "Physics Quick Quiz - Chapter 1",
      "maxMarks": 50,
      "passingMarks": 25,
      "totalQuestions": 2
    },
    "submission": {
      "attemptNumber": 1,
      "submittedAt": "2026-04-16T10:25:00.000Z",
      "timeTakenFormatted": "25m 15s",
      "totalQuestions": 2,
      "correctAnswers": 1,
      "wrongAnswers": 1,
      "totalMarks": 50,
      "marksObtained": 35,
      "percentage": 70.0,
      "grade": "B+",
      "passed": true,
      "answers": [
        {
          "questionIndex": 0,
          "question": "What is Newton's First Law of Motion?",
          "selectedAnswer": 1,
          "isCorrect": true,
          "correctAnswer": 1,
          "explanation": "Newton's First Law states that...",
          "options": [
            "Every action has equal and opposite reaction",
            "An object at rest stays at rest unless acted upon",
            "Force equals mass times acceleration",
            "Energy cannot be created or destroyed"
          ]
        }
      ]
    }
  }
}
```

### 6. Get Quiz History
**GET** `/student/quizzes/history?page=1&limit=20`

**Description:** Get student's complete quiz attempt history

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b9e6a1a8c8d4f9",
      "quizId": {
        "_id": "60f7b3b3b9e6a1a8c8d4f8",
        "title": "Physics Quick Quiz - Chapter 1",
        "subjectId": {
          "name": "Physics"
        },
        "teacherId": {
          "firstName": "Mr.",
          "lastName": "Teacher"
        }
      },
      "attemptNumber": 1,
      "submittedAt": "2026-04-16T10:25:00.000Z",
      "percentage": 70.0,
      "grade": "B+",
      "passed": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalSubmissions": 1
  }
}
```

### 7. Get Quiz Statistics
**GET** `/student/quizzes/stats`

**Description:** Get student's overall quiz performance statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQuizzes": 15,
    "totalMarks": 1250,
    "averagePercentage": 83.33,
    "bestScore": 95.0,
    "passedCount": 13,
    "totalCorrectAnswers": 65,
    "totalQuestionsAttempted": 80,
    "accuracy": 81.25
  }
}
```

---

## 🔧 ADMIN QUIZ APIS

### 1. Get All School Quizzes
**GET** `/admin/quizzes?page=1&limit=50&schoolId=60f7b3b3b9e6a1a8c8d4f1`

**Description:** Get all quizzes in the school with filters

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b9e6a1a8c8d4f8",
      "title": "Physics Quick Quiz - Chapter 1",
      "status": "PUBLISHED",
      "teacherId": {
        "_id": "60f7b3b3b9e6a1a8c8d4f0",
        "firstName": "Mr.",
        "lastName": "Teacher"
      },
      "classId": {
        "_id": "60f7b3b3b9e6a1a8c8d4f6",
        "name": "Class 10"
      },
      "totalSubmissions": 25,
      "averagePercentage": 78.5
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalQuizzes": 45
  }
}
```

### 2. Get School Quiz Analytics
**GET** `/admin/quizzes/analytics?schoolId=60f7b3b3b9e6a1a8c8d4f1&startDate=2026-04-01&endDate=2026-04-30`

**Description:** Get comprehensive quiz analytics for the school

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQuizzes": 45,
    "activeQuizzes": 8,
    "totalSubmissions": 1250,
    "averageParticipation": 85.5,
    "topSubjects": [
      {
        "subjectName": "Physics",
        "quizCount": 12,
        "totalSubmissions": 350
      }
    ],
    "topPerformers": [
      {
        "studentName": "Alice Smith",
        "averageScore": 92.5,
        "totalQuizzes": 15
      }
    ],
    "participationByClass": [
      {
        "className": "Class 10",
        "totalStudents": 45,
        "participatedStudents": 42,
        "participationRate": 93.3
      }
    ]
  }
}
```

### 3. Delete Quiz (Admin)
**DELETE** `/admin/quizzes/:id`

**Description:** Admin can delete any quiz (even with submissions)

**Response:**
```json
{
  "success": true,
  "message": "Quiz deleted successfully by admin"
}
```

---

## 🎯 QUIZ TYPES & SETTINGS

### Quiz Types
- **MCQ**: Multiple Choice Questions
- **TRUE_FALSE**: True/False questions
- **SHORT_ANSWER**: Text-based answers
- **MIXED**: Combination of types

### Quiz Status Flow
1. **DRAFT** → Quiz being created
2. **PUBLISHED** → Quiz available for students
3. **ACTIVE** → Quiz currently running
4. **ENDED** → Quiz time expired
5. **CANCELLED** → Quiz cancelled

### Grading Scale
- **90-100%**: A+
- **80-89%**: A
- **70-79%**: B+
- **60-69%**: B
- **50-59%**: C+
- **40-49%**: C
- **33-39%**: D
- **0-32%**: F

---

## 📱 ERROR RESPONSES

All APIs return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common Error Codes
- **400**: Bad Request (validation error, quiz not active)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (no permission, not enrolled)
- **404**: Not Found (quiz not found)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

---

## 🚀 QUICK START GUIDE

### For Teachers:
1. **Create Quiz**: `POST /teacher/quizzes`
2. **Add Questions**: Include MCQ questions with options
3. **Set Time Limit**: Define quiz duration
4. **Publish Quiz**: `POST /teacher/quizzes/:id/publish`
5. **Monitor Results**: `GET /teacher/quizzes/:id/results`

### For Students:
1. **View Available Quizzes**: `GET /student/quizzes`
2. **Start Quiz**: `POST /student/quizzes/:id/start`
3. **Answer Questions**: `POST /student/quizzes/:id/answer`
4. **Submit Quiz**: `POST /student/quizzes/:id/submit`
5. **View Results**: `GET /student/quizzes/:id/results`

### For Admins:
1. **Monitor All Quizzes**: `GET /admin/quizzes`
2. **View Analytics**: `GET /admin/quizzes/analytics`
3. **Manage School Settings**: Configure quiz policies
4. **Access Leaderboard**: View school-wide performance

---

## 📊 FEATURES SUMMARY

### ✅ Teacher Features:
- Create MCQ quizzes with multiple questions
- Set time limits and passing criteria
- Randomize questions and options
- Allow quiz retakes
- View real-time results
- Access class and school leaderboards
- Manage quiz drafts and publishing

### ✅ Student Features:
- View available quizzes
- Real-time quiz taking with timer
- Save answers progressively
- Instant results with explanations
- View quiz history and statistics
- Track personal performance

### ✅ Admin Features:
- Oversight of all school quizzes
- Comprehensive analytics dashboard
- School-wide leaderboard management
- Quiz policy configuration
- Performance monitoring

### ✅ System Features:
- Auto-grading with instant results
- Real-time timer and auto-submit
- Comprehensive validation
- Audit logging for all actions
- Rate limiting and security
- Soft delete for data integrity

This complete quiz system enables teachers to create engaging MCQ quizzes, students to participate in real-time assessments, and admins to monitor overall performance across the school.
