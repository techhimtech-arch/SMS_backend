# 🎓 Student Quiz MCQ - Complete Frontend Implementation Guide

**Date:** April 30, 2026  
**Audience:** Frontend Team  
**Version:** 1.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quiz Workflow](#quiz-workflow)
3. [API Endpoints](#api-endpoints)
4. [Implementation Guide](#implementation-guide)
5. [Auto-Submit Logic](#auto-submit-logic)
6. [Frontend Checklist](#frontend-checklist)
7. [Error Handling](#error-handling)

---

## Overview

This document explains how MCQ (Multiple Choice Question) quizzes work in our SMS system. Students will:
1. **Start** the quiz
2. **Answer** questions in real-time
3. **Submit** the quiz (manually or auto-submit on time expiry)
4. **View** results immediately

### Key Features
- ✅ Real-time answer saving (each selection saved separately)
- ✅ Timer with auto-submit on timeout
- ✅ Multiple choice questions with 4 options
- ✅ Immediate results display
- ✅ Connection loss handling (answers are safe)

---

## 🚀 Quiz Publishing (For Admin/Teacher)

### **Before Students Can See Quiz:**

DRAFT quizzes नहीं दिखते students को! Admin/Teacher को **PUBLISH करना जरूरी है।**

**Endpoint:**
```
POST /api/v1/teacher/quizzes/{quizId}/publish
```

**Headers:**
```
Authorization: Bearer <teacher_or_admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz published successfully",
  "data": {
    "_id": "60f7b3b3b9e6a1a8c8d4f8",
    "title": "Physics Quick Quiz - Chapter 1",
    "status": "PUBLISHED",
    "publishedAt": "2026-04-30T10:05:00.000Z"
  }
}
```

### **How Admin Publishes:**

1. Admin go to quiz management panel
2. Find DRAFT quiz
3. Click "Publish" button
4. Make API call:
   ```bash
   curl -X POST http://localhost:5000/api/v1/teacher/quizzes/{quizId}/publish \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
5. ✅ Quiz status changes to PUBLISHED
6. ✅ Now students can see it in quiz list!

### **Status Progression:**
```
DRAFT → PUBLISHED → (Optional: ACTIVE → ENDED)
  ↑
Admin publishes here
```

---

## Quiz Workflow

### **Complete Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                    QUIZ LIFECYCLE                           │
└─────────────────────────────────────────────────────────────┘

Step 1: FETCH QUIZ LIST
└─→ GET /api/v1/student/quizzes
    Response: Available quizzes for student
    
Step 2: START QUIZ
└─→ POST /api/v1/student/quizzes/:quizId/start
    Response: 
    ├─ submissionId
    ├─ questions[]
    ├─ timeLimit
    └─ startedAt
    
Step 3: ANSWER QUESTIONS (Repeats for each selection)
└─→ POST /api/v1/student/quizzes/:quizId/answer
    Body: { questionIndex, selectedAnswer }
    Response: { timeRemaining }
    ✓ Real-time save to database
    
Step 4: SUBMIT (Manual or Auto)
├─ MANUAL: Student clicks "Submit" button
│  └─→ POST /api/v1/student/quizzes/:quizId/submit
│      Status: SUBMITTED
│
└─ AUTO: Timer reaches 0
   └─→ POST /api/v1/student/quizzes/:quizId/submit
       Status: AUTO_SUBMITTED

Step 5: DISPLAY RESULTS
└─→ GET /api/v1/student/quizzes/:quizId/results
    Response: Score, Grade, Correct/Wrong count, etc.
```

---

## API Endpoints

### 1️⃣ Get Available Quizzes (Display with Retake Logic)

**Endpoint:** `GET /api/v1/student/quizzes?page=1&limit=20`

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
      "submissionStatus": "ATTEMPTED",
      "attempts": 1,
      "bestScore": 85,
      "bestGrade": "A",
      "canRetake": true,
      "maxAttempts": 3,
      "allowRetake": true,
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

**Frontend Actions - IMPORTANT (Retake Logic):**

```javascript
// For each quiz in the response:
quizzes.forEach(quiz => {
  if (quiz.submissionStatus === 'NOT_ATTEMPTED') {
    // ✅ Fresh quiz - show "Take Quiz" button
    showButton('Take Quiz', {
      onClick: () => startQuiz(quiz._id),
      class: 'btn-primary'
    });
    
    // Show stats
    showStats(`${quiz.timeLimit} mins | ${quiz.maxMarks} marks`);
    
  } else if (quiz.submissionStatus === 'ATTEMPTED') {
    // Student has already taken this quiz
    
    if (quiz.canRetake) {
      // ✅ Can retake - show "Retake Quiz" button
      showButton('Retake Quiz', {
        onClick: () => startQuiz(quiz._id),
        class: 'btn-warning'  // Different color to distinguish
      });
      
      // Show previous score
      showStats(
        `Attempt ${quiz.attempts}/${quiz.maxAttempts} | ` +
        `Best: ${quiz.bestScore}% (${quiz.bestGrade}) | ` +
        `${quiz.timeLimit} mins`
      );
      
      // Show message
      showMessage(`You can attempt ${quiz.maxAttempts - quiz.attempts} more time(s)`);
      
    } else {
      // ❌ Can't retake (all attempts used)
      showButton('View Results', {
        onClick: () => viewResults(quiz._id),
        class: 'btn-secondary',
        disabled: true
      });
      
      // Show final score
      showStats(
        `${quiz.attempts}/${quiz.maxAttempts} attempts used | ` +
        `Final: ${quiz.bestScore}% (${quiz.bestGrade})`
      );
      
      // Show message
      showMessage('You have used all available attempts for this quiz');
    }
  }
});
```

**Key Fields to Check:**
- `submissionStatus`: "NOT_ATTEMPTED" | "ATTEMPTED"
- `attempts`: Number of times student has attempted
- `maxAttempts`: Maximum allowed attempts
- `canRetake`: true/false - can student attempt again?
- `bestScore`: Best percentage score
- `bestGrade`: Best grade achieved
- `allowRetake`: Teacher allows retakes?

---

### 2️⃣ Start Quiz (REQUIRED) - With Session Recovery

**Endpoint:** `POST /api/v1/student/quizzes/:quizId/start`

**Headers:**
```
Authorization: Bearer <student_token>
Content-Type: application/json
```

**Response (New Start):**
```json
{
  "success": true,
  "message": "Quiz started successfully",
  "data": {
    "submissionId": "60f7b3b3b9e6a1a8c8d4f9",
    "isResumed": false,
    "quiz": {
      "_id": "60f7b3b3b9e6a1a8c8d4f8",
      "title": "Physics Quick Quiz - Chapter 1",
      "timeLimit": 30,
      "maxMarks": 50,
      "showCorrectAnswers": true,
      "showResultsImmediately": true
    },
    "questions": [...],
    "timeRemaining": 1800,
    "startedAt": "2026-04-16T10:00:00.000Z"
  }
}
```

**Response (Resumed Session):**
```json
{
  "success": true,
  "message": "Quiz resumed successfully",
  "data": {
    "submissionId": "60f7b3b3b9e6a1a8c8d4f9",
    "isResumed": true,
    "quiz": {
      "_id": "60f7b3b3b9e6a1a8c8d4f8",
      "title": "Physics Quick Quiz - Chapter 1",
      "timeLimit": 30,
      "maxMarks": 50,
      "showCorrectAnswers": true,
      "showResultsImmediately": true
    },
    "questions": [...],
    "timeRemaining": 1245,
    "startedAt": "2026-04-16T10:00:00.000Z",
    "resumedAt": "2026-04-16T10:10:35.000Z"
  }
}
```

**Frontend Actions:**
```javascript
// When quiz starts or resumes:
if (response.data.isResumed) {
  // Session was resumed
  showMessage('Quiz resumed! You have ' + timeRemaining + ' seconds left');
} else {
  // New quiz session
  showMessage('Quiz started!');
}

1. Extract quiz details (title, timeLimit, maxMarks)
2. Start countdown timer with timeRemaining seconds (THIS IS IMPORTANT - use server time!)
3. Render all questions on the page
4. Initialize answer tracking object
5. Display timer countdown (update every second)
6. Enable answer selection
```

**⚠️ IMPORTANT - Session Recovery Logic:**

If student closes quiz mid-way and returns:
- ✅ **Within 30 minutes**: Quiz automatically resumes with remaining time
- ❌ **After 30 minutes**: Session times out and auto-submits, allows new attempt
- 📊 Student gets credit for the timed-out attempt

**How it works:**
1. Backend tracks `lastActivityAt` timestamp
2. When student returns after inactivity → checks if > 30 mins
3. If YES → auto-submits previous attempt, allows new start
4. If NO → returns previous session with remaining time

---

### 3️⃣ Submit Answer - Real-Time (REQUIRED - called for each selection)

**Endpoint:** `POST /api/v1/student/quizzes/:quizId/answer`

**Headers:**
```
Authorization: Bearer <student_token>
Content-Type: application/json
```

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

**Important Notes:**
- ⚠️ Called **every time** student selects an answer
- ✅ Answer is immediately saved to database
- 📱 Frontend can work offline - answers saved locally until connection restored
- ⏱️ Use timeRemaining from response to sync timer

**Frontend Implementation:**
```javascript
onSelectAnswer(questionIndex, answerIndex) {
  // 1. Update local state immediately for UI feedback
  answers[questionIndex] = answerIndex;
  updateUI(); // Highlight selected option
  
  // 2. Send to backend (async)
  fetch(`/api/v1/student/quizzes/${quizId}/answer`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      questionIndex: questionIndex,
      selectedAnswer: answerIndex
    })
  })
  .then(res => res.json())
  .then(data => {
    // 3. Sync timer with server
    updateTimer(data.data.timeRemaining);
  })
  .catch(err => {
    // Connection lost - answer still saved locally
    console.warn('Connection issue, but answer is saved locally');
  });
}
```

---

### 4️⃣ Submit Quiz (REQUIRED - called once at end)

**Endpoint:** `POST /api/v1/student/quizzes/:quizId/submit`

**Headers:**
```
Authorization: Bearer <student_token>
Content-Type: application/json
```

**Request Body:**
```json
{}
```
(Empty body - all answers were already submitted individually)

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
          "explanation": "Newton's First Law states that an object at rest stays at rest..."
        },
        {
          "questionIndex": 1,
          "selectedAnswer": 2,
          "isCorrect": false,
          "correctAnswer": 1,
          "explanation": "Newton (N) is the SI unit of force."
        }
      ]
    }
  }
}
```

**Frontend Actions:**
```javascript
// After quiz submit:
1. Stop the timer
2. Show loading state ("Submitting...")
3. Display results page with:
   - Total score and percentage
   - Grade (A+, A, B+, B, C, etc.)
   - Passed/Failed status
   - Question-wise breakdown
   - Correct answers (if showCorrectAnswers = true)
   - Time taken
4. Show "Go Back" or "View History" button
```

---

### 5️⃣ Get Quiz Results (Optional - if student wants to review later)

**Endpoint:** `GET /api/v1/student/quizzes/:quizId/results`

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
      "answers": [...]
    }
  }
}
```

---

## Implementation Guide

### Architecture Overview

```
┌──────────────────────────────┐
│   QUIZ PAGE COMPONENT        │
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │  QUIZ HEADER           │  │
│  │ - Title                │  │
│  │ - Timer (countdown)    │  │
│  │ - Question counter     │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  QUESTION DISPLAY      │  │
│  │ - Current Question     │  │
│  │ - 4 MCQ Options        │  │
│  │ - Navigation (Prev/Next)  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  ANSWER TRACKER        │  │
│  │ - Show answered/unanswered  │
│  │ - Progress bar         │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  BUTTONS               │  │
│  │ - Submit Button        │  │
│  │ - Review Button        │  │
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘
```

### State Management

```javascript
const quizState = {
  // Quiz info
  quizId: "60f7b3b3b9e6a1a8c8d4f8",
  submissionId: "60f7b3b3b9e6a1a8c8d4f9",
  title: "Physics Quick Quiz",
  totalQuestions: 10,
  timeLimit: 30, // minutes
  
  // Retake Info
  isRetake: false,           // true if this is a retake attempt
  attemptNumber: 1,          // Which attempt is this? 1, 2, or 3
  maxAttempts: 3,            // Maximum allowed
  previousAttempts: 0,       // How many already completed
  previousBestScore: 85,     // Best score from previous attempts
  
  // Timing
  startedAt: "2026-04-16T10:00:00.000Z",
  timeRemaining: 1800, // seconds
  
  // Answers
  answers: {
    0: 1,      // Question 0 → Selected option 1
    1: null,   // Question 1 → Not answered
    2: 3,      // Question 2 → Selected option 3
  },
  
  // Questions
  questions: [...],
  
  // Status
  status: 'IN_PROGRESS', // or 'SUBMITTED'
  isSubmitted: false,
  isAutoSubmitted: false
};
```

---

## Retake Quiz Implementation

### Handling Retake Scenarios

```javascript
// When user clicks "Retake Quiz" or "Take Quiz"
async function handleQuizStart(quizId, quiz) {
  // Check submission status
  if (quiz.submissionStatus === 'ATTEMPTED') {
    // This is a RETAKE
    if (!quiz.canRetake) {
      showError('All attempts for this quiz have been completed');
      return;
    }
    
    // Show confirmation
    const confirmed = confirm(
      `You will start attempt ${quiz.attempts + 1}/${quiz.maxAttempts}\n` +
      `Your best score so far: ${quiz.bestScore}% (${quiz.bestGrade})\n` +
      `Ready to continue?`
    );
    
    if (!confirmed) return;
  }
  
  // Start the quiz (same endpoint for both fresh start and retake)
  await initializeQuiz(quizId);
}

// In quiz UI, show this info:
function displayQuizInfo(quizState) {
  if (quizState.previousAttempts > 0) {
    // Show retake badge
    console.log(`🔄 Attempt ${quizState.attemptNumber} of ${quizState.maxAttempts}`);
    console.log(`📊 Previous best: ${quizState.previousBestScore}%`);
    
    // Show progress
    showMessage(
      `Retake in progress... ` +
      `Attempt ${quizState.attemptNumber}/${quizState.maxAttempts}. ` +
      `Beat your score of ${quizState.previousBestScore}%!`
    );
  }
}
```

### Detecting Retake in Response

```javascript
async function initializeQuiz(quizId) {
  try {
    const response = await fetch(`/api/v1/student/quizzes/${quizId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const quizState = {
        // ... other fields
        isRetake: data.data.attemptNumber > 1,  // True if attempt > 1
        attemptNumber: data.data.attemptNumber,
        // If this info is available in response
      };
      
      // Show appropriate header
      if (quizState.isRetake) {
        showBadge('RETAKE', 'warning');
        showStats(`Attempt ${quizState.attemptNumber}/${maxAttempts}`);
      }
      
      renderQuizHeader(quizState);
      renderQuestions(quizState.questions);
      startTimer(quizState.timeRemaining);
      
      return quizState;
    }
  } catch (error) {
    console.error('Failed to start quiz:', error);
    showError('Unable to start quiz. Please try again.');
  }
}
```

### Step-by-Step Implementation

#### **Step 1: Initialize Quiz**

```javascript
async function initializeQuiz(quizId) {
  try {
    const response = await fetch(`/api/v1/student/quizzes/${quizId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Check if this is a resumed session
      if (data.data.isResumed) {
        // Session was resumed - show appropriate message
        showMessage('📝 Your previous quiz has been restored. Continue answering questions.');
      }
      
      // Store quiz data
      const quizState = {
        quizId,
        submissionId: data.data.submissionId,
        title: data.data.quiz.title,
        timeLimit: data.data.quiz.timeLimit,
        maxMarks: data.data.quiz.maxMarks,
        questions: data.data.questions,
        timeRemaining: data.data.timeRemaining, // Use server time!
        showCorrectAnswers: data.data.quiz.showCorrectAnswers,
        answers: {}
      };
      
      // Display UI
      renderQuizHeader(quizState);
      renderQuestions(quizState.questions);
      startTimer(quizState.timeRemaining); // IMPORTANT: Start timer with server time
      
      return quizState;
    }
  } catch (error) {
    console.error('Failed to start quiz:', error);
    showError('Unable to start quiz. Please try again.');
  }
}
```

⚠️ **Critical:** Always use `timeRemaining` from the server response, not client-side calculation. This prevents timer sync issues when resuming.

#### **Step 2: Handle Answer Selection**

```javascript
async function handleAnswerSelection(questionIndex, optionIndex) {
  // 1. Update local state immediately
  quizState.answers[questionIndex] = optionIndex;
  
  // 2. Visual feedback
  highlightSelectedOption(questionIndex, optionIndex);
  updateProgressBar();
  
  // 3. Send to backend (async - don't block UI)
  saveAnswerToBackend(questionIndex, optionIndex);
}

async function saveAnswerToBackend(questionIndex, optionIndex) {
  try {
    const response = await fetch(
      `/api/v1/student/quizzes/${quizState.quizId}/answer`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionIndex: questionIndex,
          selectedAnswer: optionIndex
        })
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      // Sync timer with server
      quizState.timeRemaining = data.data.timeRemaining;
      updateTimerDisplay(quizState.timeRemaining);
    }
  } catch (error) {
    console.warn('Connection issue:', error);
    // Answer is saved locally, will sync when connection restored
    retryQueue.push({ questionIndex, optionIndex });
  }
}
```

#### **Step 3: Timer Implementation**

```javascript
function startTimer(initialSeconds) {
  let timeRemaining = initialSeconds;
  
  const timerInterval = setInterval(() => {
    timeRemaining--;
    
    // Update display
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Visual warning at different stages
    if (timeRemaining <= 60) {
      document.getElementById('timer').style.color = 'red';
    }
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      handleTimerExpiry();
    }
  }, 1000); // Update every second
  
  quizState.timerInterval = timerInterval;
}

function handleTimerExpiry() {
  console.log('Time is up! Auto-submitting...');
  submitQuiz(true); // true = auto-submitted
}
```

#### **Step 4: Submit Quiz**

```javascript
async function submitQuiz(isAutoSubmit = false) {
  // Stop timer
  if (quizState.timerInterval) {
    clearInterval(quizState.timerInterval);
  }
  
  // Show loading state
  showLoadingState('Submitting your quiz...');
  
  try {
    const response = await fetch(
      `/api/v1/student/quizzes/${quizState.quizId}/submit`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      quizState.isSubmitted = true;
      quizState.isAutoSubmitted = isAutoSubmit;
      quizState.results = data.data.results;
      
      // Hide loading and show results
      hideLoadingState();
      displayResults(quizState.results, isAutoSubmit);
    } else {
      showError('Failed to submit quiz');
    }
  } catch (error) {
    console.error('Submission error:', error);
    showError('Error submitting quiz. Please try again.');
  }
}
```

#### **Step 5: Display Results**

```javascript
function displayResults(results, isAutoSubmitted) {
  const resultsHTML = `
    <div class="results-container">
      <h2>Quiz Results</h2>
      
      ${isAutoSubmitted ? '<p class="warning">⏱️ Auto-submitted due to time expiry</p>' : ''}
      
      <div class="score-box">
        <div class="score-display">
          <h1>${results.percentage.toFixed(1)}%</h1>
          <p>Score: ${results.marksObtained}/${results.totalMarks}</p>
        </div>
        
        <div class="grade-display">
          <h1 class="grade-${results.grade.toLowerCase()}">
            ${results.grade}
          </h1>
          <p>${results.passed ? '✅ PASSED' : '❌ FAILED'}</p>
        </div>
      </div>
      
      <div class="stats">
        <p>✅ Correct: ${results.correctAnswers}</p>
        <p>❌ Wrong: ${results.wrongAnswers}</p>
        <p>⏱️ Time Taken: ${results.timeTaken}</p>
      </div>
      
      <div class="answer-review">
        ${results.answers.map((answer, idx) => `
          <div class="answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
            <p><strong>Q${idx + 1}: ${answer.questionIndex}</strong></p>
            <p>Your Answer: ${answer.selectedAnswer} 
               ${answer.isCorrect ? '✅' : '❌'}</p>
            ${!answer.isCorrect ? 
              `<p>Correct Answer: ${answer.correctAnswer}</p>` : ''}
            <p class="explanation">${answer.explanation}</p>
          </div>
        `).join('')}
      </div>
      
      <div class="actions">
        <button onclick="goBack()">Back to Dashboard</button>
        <button onclick="viewHistory()">View Quiz History</button>
      </div>
    </div>
  `;
  
  document.getElementById('quiz-container').innerHTML = resultsHTML;
}
```

---

## 🔄 Retake Quiz - Complete Guide

### What is a Retake?

When a student has already taken a quiz but is allowed to attempt it again:
- Student sees **Retake Quiz button** instead of Take Quiz
- Each attempt is tracked separately
- **Best score** is usually the one that counts (unless teacher specifies otherwise)
- **Attempts counter** shows: Attempt 1/3, Attempt 2/3, etc.
- Once **all attempts are used**, button becomes disabled

### Status Conditions

| Status | Button Text | Color | Action |
|--------|-------------|-------|--------|
| NOT_ATTEMPTED | Take Quiz | 🟢 Green | Click to start |
| ATTEMPTED + canRetake=true | Retake Quiz | 🟠 Orange | Can attempt again |
| ATTEMPTED + canRetake=false | View Results | ⚫ Gray | All attempts used |

### Quiz List Display Example

```
┌─────────────────────────────────────────────────────┐
│  📝 Physics Quick Quiz - Chapter 1                   │
│                                                      │
│  Attempt 1/3 | Best: 85% (A) | 30 mins | 50 marks   │
│                                                      │
│  [RETAKE QUIZ] [View Results]                        │
│  You can attempt 2 more time(s)                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📝 Chemistry Fundamentals                           │
│                                                      │
│  Attempt 3/3 | Best: 92% (A+) | 45 mins | 100 marks │
│                                                      │
│  [VIEW RESULTS]   ← Disabled - All attempts used     │
│  All attempts completed                              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📝 Biology Essentials                               │
│                                                      │
│  Not attempted yet | 20 mins | 25 marks              │
│                                                      │
│  [TAKE QUIZ]                                         │
└─────────────────────────────────────────────────────┘
```

### Retake Button Implementation

```javascript
// Render quiz card in list
function renderQuizCard(quiz) {
  const card = document.createElement('div');
  card.className = 'quiz-card';
  
  // Header
  const header = document.createElement('h3');
  header.textContent = quiz.title;
  
  // Stats
  const stats = document.createElement('div');
  stats.className = 'quiz-stats';
  
  if (quiz.submissionStatus === 'NOT_ATTEMPTED') {
    stats.innerHTML = `
      ⏱️ ${quiz.timeLimit} mins | 
      📊 ${quiz.maxMarks} marks | 
      ${quiz.quizType}
    `;
  } else {
    // ATTEMPTED
    stats.innerHTML = `
      Attempt ${quiz.attempts}/${quiz.maxAttempts} | 
      Best: ${quiz.bestScore}% (${quiz.bestGrade}) | 
      ${quiz.timeLimit} mins
    `;
  }
  
  // Button
  const button = document.createElement('button');
  
  if (quiz.submissionStatus === 'NOT_ATTEMPTED') {
    button.textContent = '📝 Take Quiz';
    button.className = 'btn btn-primary';
    button.onclick = () => startQuiz(quiz._id);
    
  } else if (quiz.canRetake) {
    button.textContent = '🔄 Retake Quiz';
    button.className = 'btn btn-warning';
    button.onclick = () => confirmAndRetakeQuiz(quiz);
    
  } else {
    button.textContent = '👁️ View Results';
    button.className = 'btn btn-secondary disabled';
    button.disabled = true;
    button.onclick = () => viewResults(quiz._id);
  }
  
  // Message
  const message = document.createElement('p');
  message.className = 'quiz-message';
  
  if (quiz.submissionStatus === 'NOT_ATTEMPTED') {
    message.textContent = 'Ready to take this quiz?';
  } else if (quiz.canRetake) {
    const remaining = quiz.maxAttempts - quiz.attempts;
    message.textContent = `You can attempt ${remaining} more time(s)`;
  } else {
    message.textContent = 'All attempts completed';
  }
  
  // Assemble
  card.appendChild(header);
  card.appendChild(stats);
  card.appendChild(button);
  card.appendChild(message);
  
  return card;
}

// Confirm before retaking
function confirmAndRetakeQuiz(quiz) {
  const remaining = quiz.maxAttempts - quiz.attempts;
  
  const message = `
🔄 RETAKE QUIZ

Title: ${quiz.title}
Current Attempt: ${quiz.attempts}/${quiz.maxAttempts}
Best Score: ${quiz.bestScore}% (${quiz.bestGrade})
Remaining Attempts: ${remaining}

Ready to attempt again? You have ${quiz.timeLimit} minutes.
  `;
  
  if (confirm(message)) {
    startQuiz(quiz._id);  // Same endpoint - backend handles it
  }
}
```

---

### When Does Auto-Submit Happen?

1. **Timer reaches 0 seconds** - Automatic submission
2. **Session Timeout (30 mins)** - After 30 minutes of inactivity, auto-submit
3. **Stale Session Resume** - If > 30 mins, previous session is auto-submitted before new one starts

### Session Recovery (NEW FEATURE!)

**Scenario 1: Student Closes Mid-Way Quiz**
```
00:00 → Student starts quiz (timer = 30 mins)
00:10 → Student answers Q1, Q2, Q3
00:12 → Browser closes / Connection lost ❌
        └─ Quiz is IN_PROGRESS with 28 mins left
        
        [Student returns 5 minutes later]
        
00:17 → Student clicks "Start Quiz" again
        └─ Backend checks: lastActivityAt was at 00:12
        └─ Time elapsed: 5 minutes (< 30 min timeout)
        └─ Response: isResumed = true ✅
        └─ Previous answers are restored ✅
        └─ Timer continues from 23 mins ✅
```

**Scenario 2: Session Expires**
```
00:00 → Student starts quiz (timer = 30 mins)
00:10 → Student answers Q1, Q2, Q3
00:12 → Browser closes ❌
        └─ Quiz is IN_PROGRESS with 28 mins left
        
        [Student returns 35 minutes later]
        
00:47 → Student clicks "Start Quiz" again
        └─ Backend checks: lastActivityAt was at 00:12
        └─ Time elapsed: 35 minutes (> 30 min timeout)
        └─ Previous session AUTO-SUBMITTED ✅
        └─ Score calculated and saved ✅
        └─ Can now start fresh attempt (if retakes allowed) ✅
```

### Auto-Submit Status

In the results, check for:
```javascript
results.status === 'AUTO_SUBMITTED'      // Auto-submitted (timeout or timer expired)
results.status === 'SUBMITTED'            // Manually submitted by student
results.status === 'TIMED_OUT'            // Session timeout auto-submit
```

### Frontend Implementation

```javascript
// Timer reaches 0
if (timeRemaining === 0) {
  submitQuiz(true); // true indicates auto-submit
}

// Session timeout (optional - if implementing heartbeat)
window.addEventListener('beforeunload', () => {
  // Browser closing - quiz will auto-submit after 30 mins
  console.log('Quiz will auto-submit in 30 minutes if not resumed');
});

// Show appropriate message
function displayResults(results, isAutoSubmitted) {
  if (results.status === 'AUTO_SUBMITTED' && isAutoSubmitted) {
    showMessage('⏱️ Your quiz was automatically submitted because time expired');
  } else if (results.status === 'TIMED_OUT') {
    showMessage('⏱️ Your quiz was automatically submitted due to session timeout after 30 minutes of inactivity');
  } else {
    showMessage('✅ Your quiz has been submitted successfully');
  }
}
```

### Recovery Detection

```javascript
// When quiz response comes back, check if it was resumed:
const response = await fetch('/api/v1/student/quizzes/:id/start', {...});
const data = await response.json();

if (data.data.isResumed) {
  // Show notification that quiz was resumed
  showNotification({
    type: 'info',
    message: 'Quiz resumed! ' + 
      formatTime(data.data.timeRemaining) + 
      ' remaining to complete.',
    duration: 3000
  });
  
  // You might want to show which answers were already saved
  console.log('Resuming from where you left off...');
} else {
  // Fresh start
  showNotification({
    type: 'info',
    message: 'Good luck! You have ' + 
      formatTime(data.data.timeRemaining) + 
      ' to complete this quiz.',
    duration: 3000
  });
}
```

---

## Frontend Checklist

### ✅ Quiz List Display (Critical for Retakes!)
- [ ] Fetch quiz list using GET /api/v1/student/quizzes
- [ ] **Check `submissionStatus` for each quiz**
  - [ ] If `"NOT_ATTEMPTED"`: Show "Take Quiz" button (green/primary)
  - [ ] If `"ATTEMPTED"` + `canRetake === true`: Show "Retake Quiz" button (orange/warning)
  - [ ] If `"ATTEMPTED"` + `canRetake === false`: Show "View Results" (disabled)
- [ ] **Display attempt counter**: `Attempt 1/3` or `Attempt 3/3 (All used)`
- [ ] **Display best score**: `Best: 85% (A)` if attempted
- [ ] **Display message** based on status:
  - Not attempted: "Take this quiz"
  - Can retake: "You can attempt 2 more time(s)"
  - All used: "All attempts completed"

### ✅ During Quiz
- [ ] Display one question at a time (or all - your choice)
- [ ] Highlight selected answer option
- [ ] Show progress bar (X of Y questions answered)
- [ ] Update timer every second
- [ ] Track answers locally
- [ ] Send each answer to backend immediately (async)
- [ ] Handle connection loss gracefully
- [ ] **Detect when user closes/leaves page (optional but recommended)**
- [ ] Show warning when 5 mins remaining (optional)
- [ ] Show warning when 1 min remaining (optional)
- [ ] Disable "Submit" button until at least one question answered (optional)

### ✅ At Quiz End (Manual or Auto)
- [ ] Stop timer
- [ ] Submit quiz to backend
- [ ] Show loading state
- [ ] Display results page
- [ ] Show score, grade, percentage
- [ ] Show question-wise review
- [ ] Show correct answers (if enabled)
- [ ] Show explanation for each question (if provided)
- [ ] Show whether it was auto-submitted or manual submission
- [ ] **If retake is allowed**: Show "Try Again" or "Retake" button
- [ ] **If all attempts used**: Show "Quiz Completed" message

### ✅ Error Handling
- [ ] Handle network errors gracefully
- [ ] Retry failed requests
- [ ] Save answers locally if backend unreachable
- [ ] Show appropriate error messages
- [ ] Allow student to submit again (if allowed by teacher)

### ✅ UI/UX
- [ ] Quiz looks good on mobile
- [ ] Timer is clearly visible
- [ ] Selected answers are highlighted
- [ ] Questions are readable
- [ ] Results page is clear
- [ ] Navigation works smoothly

---

## Error Handling

### Common Scenarios

#### **1. Network Error During Answer Submit**

```javascript
async function saveAnswerToBackend(questionIndex, optionIndex) {
  try {
    const response = await fetch(
      `/api/v1/student/quizzes/${quizState.quizId}/answer`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          questionIndex: questionIndex,
          selectedAnswer: optionIndex
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Network error');
    }
    
    const data = await response.json();
    if (data.success) {
      quizState.timeRemaining = data.data.timeRemaining;
    }
  } catch (error) {
    // Save to retry queue
    localStorage.setItem('answerQueue', JSON.stringify([
      ...JSON.parse(localStorage.getItem('answerQueue') || '[]'),
      { questionIndex, optionIndex }
    ]));
    
    // Try again in 5 seconds
    setTimeout(() => retryFailedAnswers(), 5000);
  }
}

function retryFailedAnswers() {
  const queue = JSON.parse(localStorage.getItem('answerQueue') || '[]');
  
  queue.forEach(async (item) => {
    await saveAnswerToBackend(item.questionIndex, item.selectedAnswer);
  });
}
```

#### **2. Quiz Start Fails**

```javascript
try {
  await initializeQuiz(quizId);
} catch (error) {
  console.error('Quiz start failed:', error);
  showError('Unable to start quiz. Please check your connection and try again.');
  // Show retry button
}
```

#### **3. Submit Fails**

```javascript
async function submitQuiz(isAutoSubmit = false) {
  try {
    const response = await fetch(`/api/v1/student/quizzes/${quizState.quizId}/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      throw new Error('Submit failed');
    }
    
    const data = await response.json();
    // Show results
  } catch (error) {
    showError('Failed to submit quiz. Retrying...');
    
    // Retry after 3 seconds
    setTimeout(() => submitQuiz(isAutoSubmit), 3000);
  }
}
```

#### **4. Quiz Session Recovery**

**Scenario: Student Browser Closes Mid-Quiz**

```javascript
// Backend automatically handles this:
// 1. No new request needed
// 2. When student returns and clicks "Start Quiz" again:

const response = await fetch('/api/v1/student/quizzes/:id/start', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({})
});

const data = await response.json();

if (data.data.isResumed) {
  // ✅ Session resumed within 30 minutes
  console.log('Quiz resumed with ' + data.data.timeRemaining + ' seconds left');
  
  // Load the same questions and previous answers
  const previousAnswers = data.data.answers || {};
  renderQuestions(data.data.questions, previousAnswers);
  startTimer(data.data.timeRemaining);
  
} else if (data.success) {
  // Either: New quiz OR timeout occurred and auto-submitted
  console.log('Fresh quiz session starting');
  renderQuestions(data.data.questions);
  startTimer(data.data.timeRemaining);
}
```

**Error Handling:**
```javascript
// Always expect these scenarios:
// 1. isResumed = true → Continue where left off ✅
// 2. isResumed = false → Fresh start (timeout or new attempt) ✅
// 3. Error: "Maximum attempts reached" → Student has exhausted retakes
// 4. Error: "Quiz not active" → Teacher hasn't activated quiz yet
```

---

## Quick Reference

### API Summary Table

| Operation | Method | Endpoint | When Called |
|-----------|--------|----------|-------------|
| **Start Quiz** | POST | `/api/v1/student/quizzes/:id/start` | When student opens quiz |
| **Submit Answer** | POST | `/api/v1/student/quizzes/:id/answer` | After each selection (real-time) |
| **Submit Quiz** | POST | `/api/v1/student/quizzes/:id/submit` | At the end or on timer expire |
| **Get Results** | GET | `/api/v1/student/quizzes/:id/results` | When student reviews quiz |

### Timeline Example (with Session Recovery)

```
00:00 → Student clicks "Start Quiz"
        ↓ POST /start
        → Receives questions, timer = 30 mins
        → isResumed = false (fresh start)
        → Display quiz UI, start timer

00:15 → Student selects answer to Q1 (option 2)
        ↓ POST /answer { questionIndex: 0, selectedAnswer: 2 }
        → Backend: Answer saved, lastActivityAt updated ✓
        → Response: timeRemaining = 1785 seconds

00:20 → Student answers Q2, Q3...
        
00:25 → BROWSER CLOSES! ❌
        Quiz is IN_PROGRESS with 25 mins left
        
        [5 minutes later...]
        
00:30 → Student clicks "Start Quiz" again
        ↓ POST /start
        → Backend checks: lastActivityAt = 00:25
        → Time elapsed: 5 mins (< 30 mins timeout)
        → Response: isResumed = true ✅
        → timeRemaining = 1500 seconds (25 mins)
        → Previous answers Q1, Q2, Q3 are shown as selected
        → Timer continues counting down ✅

00:45 → Student answers remaining questions Q4, Q5...
        
00:55 → Student clicks "SUBMIT" button
        ↓ POST /submit { }
        → Results calculated
        
        OR

00:55 → Timer reaches 00:00 (originally 30 mins from 00:00)
        ↓ POST /submit triggered automatically
        → Results calculated with AUTO_SUBMITTED status
        
00:56 → Display results page
        ✓ Quiz Complete
```

**Alternative Timeline (Session Timeout):**

```
00:00 → Student starts quiz (timer = 30 mins)
00:10 → Answers Q1, Q2
00:12 → BROWSER CLOSES ❌
        
        [45 minutes later...]
        
00:57 → Student clicks "Start Quiz" again
        ↓ POST /start
        → Backend checks: lastActivityAt = 00:12
        → Time elapsed: 45 mins (> 30 mins timeout)
        → Previous attempt AUTO-SUBMITTED ✅
        → Score saved from partial answers
        → New fresh quiz session starts
        → isResumed = false
        → timer = 30 mins (fresh)
```

---

## Support & Questions

If frontend team has questions:
1. Refer to this document
2. Check API response formats
3. Verify timer implementation
4. Test with manual/auto submit
5. Contact backend team for API issues

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-30 | Initial documentation |

