# Student Quiz - Quick Reference Guide
**TL;DR Version For Frontend Team**

---

## Single Quiz Scenario - Quickest Way to Implement

### 1️⃣ On Student Dashboard Load
```javascript
// Fetch quizzes
GET /api/v1/student/quizzes
Headers: { Authorization: Bearer token }

// Response: array of quizzes
if (quizzes.length === 1) {
  // Show this one quiz directly
  // Don't show a list, just show the quiz card
}
```

### 2️⃣ Quiz Card Display (Key Info to Show)
```
┌─────────────────────────────────────┐
│ Quiz Title                          │
│ Subject: Math                       │
├─────────────────────────────────────┤
│ Time: 30 minutes  Marks: 50         │
│ Passing: 25       Attempts: 0/3     │
│ Status: ❌ Not Attempted            │
├─────────────────────────────────────┤
│ [Start Quiz] [View Results] [Retake]│
└─────────────────────────────────────┘
```

### 3️⃣ Start Quiz Button Click
```javascript
POST /api/v1/student/quizzes/{quizId}/start
Headers: { Authorization: Bearer token }

Response:
{
  submissionId: "...",
  quiz: { title, timeLimit, maxMarks... },
  questions: [ { question, options, marks... } ],
  timeRemaining: 1800 // seconds
}
```

### 4️⃣ Quiz Taking Interface
```
┌─────────────────────────────────────┐
│ Quiz Title        Time: 29:45       │
├─────────────────────────────────────┤
│ Q 1/20 Progress: ████░░░░░░░        │
├─────────────────────────────────────┤
│ What is 5 + 3?                      │
│ ○ 5   ○ 8   ○ 3   ○ 10             │
├─────────────────────────────────────┤
│ [← Prev] [Next →] [Submit Quiz]     │
└─────────────────────────────────────┘
```

**Important:** 
- Auto-save answer jab student select kare
- Timer chal rahe raho
- Auto-submit when time = 0

### 5️⃣ Save Answer (After Each Selection)
```javascript
POST /api/v1/student/quizzes/{quizId}/answer
Headers: { Authorization: Bearer token }
Body: {
  questionIndex: 0,
  selectedAnswer: "8"
}
```

### 6️⃣ Submit Quiz (Final Button)
```javascript
POST /api/v1/student/quizzes/{quizId}/submit
Headers: { Authorization: Bearer token }

Response:
{
  results: {
    percentage: 75,
    grade: "A",
    passed: true,
    marksObtained: 37.5,
    totalMarks: 50,
    answers: [ ... ] // if showCorrectAnswers = true
  }
}
```

### 7️⃣ Results Display
```
┌─────────────────────────────────────┐
│         Quiz Results - Grade A       │
├─────────────────────────────────────┤
│ Score: 75%  (37.5 / 50)             │
│ Status: ✅ PASSED                   │
│ Time: 18 minutes 45 seconds         │
│ Correct: 15/20                      │
├─────────────────────────────────────┤
│ [Retake Quiz] [Back to Dashboard]   │
└─────────────────────────────────────┘
```

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/student/quizzes` | Get all quizzes (with status) |
| `POST` | `/student/quizzes/{id}/start` | Start a quiz |
| `POST` | `/student/quizzes/{id}/answer` | Save an answer |
| `POST` | `/student/quizzes/{id}/submit` | Submit completed quiz |
| `GET` | `/student/quizzes/{id}/results` | View past results |

---

## Response Status Guide

| submissionStatus | Means | Button Show Karo |
|------------------|-------|------------------|
| `NOT_ATTEMPTED` | Kabhi try nahi kiya | "Start Quiz" |
| `ATTEMPTED` | Pehle try kar chuke ho | "Retake Quiz" or disabled |

| Status | Matlab |
|--------|--------|
| `canRetake: true` | dobara attempt kar sakte ho |
| `canRetake: false` | attempts khatam, nahi kar sakte |

---

## Field Mappings (Important)

```javascript
// What to show student:
quiz.title              → Quiz ka naam
quiz.timeLimit          → Kitne minutes
quiz.maxMarks           → Total marks
quiz.passingMarks       → Pass karne ke liye marks
quiz.maxAttempts        → Kitni baar attempt kar sakte
quiz.attempts           → Aapne kitni baar kiya
quiz.bestScore          → Best percentage
quiz.submissionStatus   → Attempted ya Not Attempted

// Question display:
question.question       → Question text
question.options        → Answer options (array)
question.marks          → This question ke marks
question.questionType   → "MCQ", "TRUE_FALSE", etc
```

---

## Conditional Display (Button Logic)

```javascript
// Start Quiz Button - Show when:
if (quiz.isActive && quiz.canRetake && quiz.attempts < quiz.maxAttempts) {
  showButton("Start Quiz");
}

// Retake Button - Show when:
if (quiz.isActive && quiz.canRetake && quiz.attempts > 0) {
  showButton("Retake Quiz");
}

// View Results - Show when:
if (quiz.attempts > 0) {
  showButton("View Results");
}

// Disabled State - Show when:
if (!quiz.canRetake || !quiz.isActive) {
  showButton("Quiz Not Available", { disabled: true });
}
```

---

## Error Handling - Quick Map

```javascript
// Status 400 - Bad Request
if (error.status === 400) {
  if (error.message.includes("not active")) {
    showError("Quiz abhi start nahi hua ya end ho gaya");
  }
  if (error.message.includes("Maximum attempts")) {
    showError("3 baar try kar chuke ho, aur nahi kar sakte");
  }
  if (error.message.includes("already in progress")) {
    showError("Quiz abhi chal raha hai, dobara start nahi kar sakte");
  }
}

// Status 403 - Forbidden
if (error.status === 403) {
  showError("Tum is class mein enrolled nahi ho");
}

// Status 404 - Not Found
if (error.status === 404) {
  showError("Quiz nahi mila");
}
```

---

## Timer Implementation (Critical!)

```javascript
const startTimer = (timeLimit) => {
  let secondsRemaining = timeLimit * 60; // minutes to seconds
  
  const interval = setInterval(() => {
    secondsRemaining--;
    
    // Display time
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    console.log(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
    
    // Warning when < 5 minutes
    if (secondsRemaining === 300) {
      showWarning("5 minutes remaining!");
    }
    
    // Auto-submit when time up
    if (secondsRemaining <= 0) {
      clearInterval(interval);
      submitQuiz();
    }
  }, 1000);
};
```

---

## Testing Checklist

- [ ] Single quiz shows directly (not in list)
- [ ] All quiz details visible
- [ ] Timer starts and counts down correctly
- [ ] Answers auto-save on selection
- [ ] Previous/Next navigation works
- [ ] Submit button submits correctly
- [ ] Results display properly
- [ ] Retake shows only if allowed
- [ ] Error messages display correctly
- [ ] Auto-submit works when time runs out

---

## Notes

✅ Ensure `Authorization: Bearer <token>` in every request
✅ Handle loading states
✅ Show proper error messages to users
✅ Don't allow submit if time is 0
✅ Disable retake if attempts = maxAttempts

❌ Don't send requests without token
❌ Don't allow quiz if isActive = false
❌ Don't show retake button if canRetake = false

---

**Created:** April 23, 2026  
**Version:** 1.0
