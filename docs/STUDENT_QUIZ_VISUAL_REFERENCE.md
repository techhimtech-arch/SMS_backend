# Student Quiz - Visual Reference & Quick Diagrams
**For Quick Understanding**

---

## 📱 UI Flow - Single Quiz Scenario

```
┌──────────────────────────────────────────┐
│ 1. STUDENT DASHBOARD (After Login)       │
├──────────────────────────────────────────┤
│                                          │
│  SINGLE QUIZ (Auto-shows - No List)     │
│  ┌────────────────────────────────┐     │
│  │  Math Chapter 5 Quiz           │     │
│  │  Subject: Mathematics          │     │
│  ├────────────────────────────────┤     │
│  │ ⏱️  Duration: 30 min            │     │
│  │ 📊 Total Marks: 50             │     │
│  │ ✅ Passing: 25                 │     │
│  │ 🔄 Attempts: 3                 │     │
│  │ 📝 Your Attempts: 0/3          │     │
│  │ 🏆 Best Score: -               │     │
│  ├────────────────────────────────┤     │
│  │ Status: ❌ Not Attempted       │     │
│  ├────────────────────────────────┤     │
│  │ [Start Quiz] [View Results]    │     │
│  └────────────────────────────────┘     │
│                                          │
│         Click "Start Quiz"               │
│               ↓↓↓                        │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ 2. QUIZ INTERFACE (Taking Quiz)          │
├──────────────────────────────────────────┤
│                                          │
│ Math Chapter 5 Quiz  ⏱️ Time: 29:45      │
│                                          │
│ Q 1/20  ████░░░░░░░░░░░░░░░░░░░░        │
│                                          │
│ What is 5 + 3?                          │
│ (2 marks)                                │
│                                          │
│ ○ 5                                      │
│ ○ 8                                      │
│ ○ 3                                      │
│ ○ 10                                     │
│                                          │
│ [← Previous] [Next →] [Submit Quiz]     │
│                                          │
│ Student answers questions...             │
│ Each answer auto-saved to backend        │
│                                          │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ 3. RESULTS (After Submission)            │
├──────────────────────────────────────────┤
│                                          │
│         📊 Quiz Results 📊                │
│                                          │
│  ╔════════╗                              │
│  ║   A    ║  75%  (37.5 / 50)            │
│  ╚════════╝  ✅ PASSED                   │
│                                          │
│ Correct Answers: 15/20                   │
│ Time Taken: 18 min 45 sec                │
│                                          │
│ ─────────── Answer Review ─────────────  │
│                                          │
│ Q1: What is 5 + 3?                       │
│ Your Answer: 8 ✅                        │
│                                          │
│ Q2: Capital of India?                    │
│ Your Answer: Mumbai ❌                   │
│ Correct: Delhi                           │
│ 💡 Delhi is the national capital         │
│                                          │
│ [Retake Quiz] [Back to Dashboard]       │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🔄 State Management Flow

```
┌────────────────────────────────────────────────┐
│ Component: SingleQuizView                       │
├────────────────────────────────────────────────┤
│                                                │
│ State:                                         │
│ • quizStarted = false ←──────┐                │
│ • submissionData = null       │                │
│ • quizSubmitted = false       │                │
│ • error = null                │                │
│                               │                │
└────────────────────────────────────────────────┘

         ↓ (User clicks Start)

┌────────────────────────────────────────────────┐
│ Component: QuizInterface                        │
├────────────────────────────────────────────────┤
│                                                │
│ State:                                         │
│ • currentQuestion = 0                          │
│ • answers = { 0: "option", 1: "option" }      │
│ • timeRemaining = 1800 (seconds)              │
│ • submitting = false                           │
│                                                │
│ Effects:                                       │
│ • Timer: Every second decrement timeRemaining│
│ • Auto-save: On answer select                │
│ • Auto-submit: When timeRemaining = 0        │
│                                                │
└────────────────────────────────────────────────┘

    ↓ (User clicks Submit or time runs out)

┌────────────────────────────────────────────────┐
│ Component: QuizResults                          │
├────────────────────────────────────────────────┤
│                                                │
│ Props:                                         │
│ • submission.results (from API response)       │
│ • quiz (original quiz object)                 │
│                                                │
│ Displays:                                      │
│ • Grade (A/B/C/D/F)                           │
│ • Score percentage                             │
│ • Pass/Fail status                            │
│ • Answer review (if enabled)                  │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 📡 API Call Sequence

```
FRONTEND                          BACKEND
   │                                │
   ├─ GET /student/quizzes ─────→  │
   │                                │ Check enrollment
   │                                │ Fetch active quizzes
   │  ← Return quiz list ──────────┤
   │                                │
   │  (Display quiz if qty = 1)     │
   │                                │
   ├─ POST /quizzes/:id/start ──→  │
   │                                │ Create submission
   │                                │ Generate questions
   │  ← Quiz data + questions ─────┤
   │                                │
   │  (Start timer, show Q1)        │
   │                                │
   ├─ POST /quizzes/:id/answer ─→  │
   │                                │ Save answer
   │  ← OK ────────────────────────┤
   │                                │
   ├─ POST /quizzes/:id/answer ─→  │
   │                                │ Save answer
   │  ← OK ────────────────────────┤
   │                                │
   │  ... (repeat for each Q)       │
   │                                │
   ├─ POST /quizzes/:id/submit ──→  │
   │                                │ Calculate results
   │                                │ Grade assignment
   │  ← Results + answers ─────────┤
   │                                │
   │  (Show results page)           │
   │                                │
```

---

## 🎨 Data Structure Diagrams

### Quiz Object (From API)
```
Quiz {
  _id: "quiz_123"
  title: "Math Chapter 5 Quiz"
  description: "Basic arithmetic and geometry"
  subjectId: {
    _id: "subject_123"
    name: "Mathematics"
  }
  teacherId: {
    _id: "teacher_456"
    firstName: "Rajesh"
    lastName: "Kumar"
  }
  
  Configuration:
  timeLimit: 30 (minutes)
  maxMarks: 50
  passingMarks: 25
  maxAttempts: 3
  allowRetake: true
  isActive: true
  
  Timing:
  startsAt: "2026-04-23T10:00:00Z"
  endsAt: "2026-04-24T18:00:00Z"
  
  Student-specific:
  submissionStatus: "NOT_ATTEMPTED" | "ATTEMPTED"
  attempts: 0
  bestScore: 0
  bestGrade: "F"
  canRetake: true
  nextAttemptAvailable: true
}
```

### Question Object (From API)
```
Question {
  _id: "q1"
  questionIndex: 0
  question: "What is 5 + 3?"
  questionType: "MCQ"
  options: ["5", "8", "3", "10"]
  marks: 2
  correctAnswer: "8"
  explanation: "5 + 3 = 8"
}
```

### Submission/Results Object
```
Submission {
  submissionId: "sub_789"
  quiz: {
    _id: "quiz_123"
    title: "Math Quiz"
    timeLimit: 30
    maxMarks: 50
  }
  
  Results:
  totalQuestions: 20
  correctAnswers: 15
  wrongAnswers: 5
  totalMarks: 50
  marksObtained: 37.5
  percentage: 75
  grade: "A"
  passed: true
  timeTaken: "18 minutes 45 seconds"
  
  Answers: [
    {
      questionIndex: 0
      selectedAnswer: "8"
      isCorrect: true
      correctAnswer: "8"
      explanation: "5 + 3 = 8"
    },
    ...
  ]
}
```

---

## ✅ Button State Matrix

```
┌──────────────────────────────────────────────────┐
│ QUIZ STATUS CONDITIONS & BUTTON STATES           │
├──────────────────────────────────────────────────┤

Quiz ACTIVE & NOT ATTEMPTED:
├─ isActive: true
├─ attempts: 0
├─ canRetake: true
└─ Button: "Start Quiz" [ENABLED - BLUE]

Quiz ACTIVE & ATTEMPTED & CAN RETAKE:
├─ isActive: true
├─ attempts: 1
├─ canRetake: true
└─ Button: "Retake Quiz" [ENABLED - BLUE]
           "View Results" [ENABLED - GRAY]

Quiz ACTIVE & MAX ATTEMPTS REACHED:
├─ isActive: true
├─ attempts: 3 (= maxAttempts)
├─ canRetake: false
└─ Button: "Quiz Not Available" [DISABLED - GRAY]
           "View Results" [ENABLED - GRAY]

Quiz NOT ACTIVE YET:
├─ isActive: false
├─ startsAt: future date
└─ Button: "Start Quiz" [DISABLED - GRAY]

Quiz ENDED:
├─ isActive: false
├─ endsAt: past date
└─ Button: "Start Quiz" [DISABLED - GRAY]
           "View Results" [ENABLED - GRAY]
```

---

## 🔔 Timer Behavior

```
TIMER COUNTDOWN VISUALIZATION

┌─────────────────────────────────┐
│ Total Time: 30 minutes          │
│ = 1800 seconds                  │
└─────────────────────────────────┘

Time Status        Color   Display  Action
────────────────────────────────────────────
> 5 minutes        🟢 GREEN "29:45"  Normal
= 5 minutes        🟡 YELLOW "5:00"  Warning alert
< 5 minutes        🔴 RED   "4:59"   Urgent warning
= 1 minute         🔴 RED   "1:00"   Critical warning
= 0 seconds        🔴 RED   "0:00"   AUTO-SUBMIT
```

---

## 🎯 Grade Distribution

```
Percentage    Grade    Color   Status
─────────────────────────────────────
90-100        A        🟢 Green   Excellent
80-89         B        🟢 Green   Good
70-79         C        🟡 Yellow  Average
60-69         D        🟠 Orange  Below Avg
< 60          F        🔴 Red     Failed

Pass Threshold:
├─ Passing Marks = 25 (out of 50)
├─ Percentage = 50%
├─ Student needs >= 25 marks to PASS
└─ Else marked as FAILED (red)
```

---

## 🔄 Retry/Retake Logic

```
Flow:

┌─────────────┐
│ maxAttempts │ = 3
└──────┬──────┘
       │
       ├─────────────────────────────────┐
       │                                 │
    Attempt 1:                        Attempt 2:
    ✅ Completed                      ✅ Completed
    Score: 40%                        Score: 75%
    ├─ canRetake: true                ├─ canRetake: true
    ├─ Show "Retake"                  ├─ Show "Retake"
    └─ attempts: 1/3                  └─ attempts: 2/3
                                          │
                                      Attempt 3:
                                      ✅ Completed
                                      Score: 85%
                                      ├─ canRetake: false (max reached)
                                      ├─ Show "View Results" only
                                      └─ attempts: 3/3
```

---

## 📍 Component Hierarchy

```
App
└── StudentQuizDashboard
    ├── Condition: quizzes.length === 1
    │   └── SingleQuizView
    │       ├── QuizCard (Not Started)
    │       ├── QuizInterface (During Quiz)
    │       │   ├── Timer
    │       │   ├── Question Display
    │       │   ├── Options
    │       │   └── Navigation
    │       └── QuizResults (After Submit)
    │           ├── ScoreCard
    │           ├── StatsGrid
    │           └── AnswerReview
    │
    └── Condition: quizzes.length > 1
        └── QuizListView
            └── QuizCard[] (Multiple)
```

---

## 🚨 Error Handling Flow

```
User Action
    ↓
Make API Call
    ↓
    ├─ Success (200) ──→ Update State ──→ Render Success
    │
    └─ Error
        ├─ 400 (Bad Request)
        │   ├─ "Quiz not active"
        │   ├─ "Maximum attempts reached"
        │   └─ "Quiz already in progress"
        │
        ├─ 403 (Forbidden)
        │   └─ "Not enrolled in this class"
        │
        ├─ 404 (Not Found)
        │   └─ "Quiz not found"
        │
        └─ 500 (Server Error)
            └─ "Internal server error"

For Each Error:
1. Log to console
2. Show user-friendly message in UI
3. Keep button disabled or show retry option
```

---

## ⏱️ Timer Implementation Pattern

```javascript
useEffect(() => {
  if (timeRemaining <= 0) {
    submitQuiz();
    return;
  }

  const interval = setInterval(() => {
    setTimeRemaining(prev => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timeRemaining, submitQuiz]);
```

```
Timeline:

Start
1800s  ──────────────────────────────── 0s
│                                        │
Test interval                     Quiz auto-submit
every 1 second                    (submitQuiz called)

Warning at:
- 300s (5 minutes): Show yellow warning
- 60s (1 minute): Show red critical alert
- 0s: Auto-submit triggered
```

---

## 📊 Response Status Summary

```
┌─────────────────────────────────────┐
│ API Response Status Codes            │
├─────────────────────────────────────┤

200 OK
└─ Success: Quiz fetched/started/submitted

400 Bad Request
├─ Quiz not active
├─ Maximum attempts reached
├─ Quiz already in progress
└─ Quiz time limit exceeded

401 Unauthorized
└─ Token missing/invalid

403 Forbidden
└─ Not enrolled in class

404 Not Found
├─ Quiz not found
└─ Student enrollment not found

500 Internal Server Error
└─ Backend error
```

---

## 🎬 Animation Guide

```
Loading State:
┌──────────────────┐
│  ⏳ Loading...   │ (Spinner or skeleton)
└──────────────────┘

Timer Critical:
┌──────────────────┐
│  ⏱️ 2:34 ⚠️      │ (Red color + animation)
│  (Pulse effect)  │
└──────────────────┘

Submit Animation:
┌──────────────────┐
│  ✓ Submitting... │ (Disable button + spinner)
│  [Submit Quiz]   │ (Disabled state)
└──────────────────┘

Success Message:
┌──────────────────┐
│  ✅ Quiz submitted│ (Show 2 seconds then fade)
│     successfully │
└──────────────────┘
```

---

## 📱 Responsive Design Hints

```
DESKTOP (>1024px):
┌──────────────────────────────────┐
│ 600px centered card              │
│ 3-column grid for details        │
└──────────────────────────────────┘

TABLET (768px - 1024px):
┌──────────────────┐
│ Full width card  │
│ 2-column grid    │
└──────────────────┘

MOBILE (<768px):
┌────────┐
│ Full   │
│ width  │
│ 1-col  │
└────────┘
```

---

**Print or Bookmark This Page for Quick Reference! 📌**
