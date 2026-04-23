# Student Quiz Viewing & Taking Implementation Guide
**For Frontend Team**

---

## Overview
Jab student login karta hai, usey uske sabhi available quizzes dikhayi dete hain. Agar sirf ek quiz hai to student directly uss quiz ko dekh aur attempt kar sakta hai. Ye document us puri flow ko explain karta hai.

---

## 1. Quiz Discovery Flow (Student Login ke Baad)

### Step 1: Available Quizzes Fetch Karna
Jab student dashboard mein aata hai, ye API call karna hai:

**API Endpoint:**
```
GET /api/v1/student/quizzes
```

**Headers Required:**
```
Authorization: Bearer <student_token>
Content-Type: application/json
```

**Query Parameters (Optional):**
```
page=1 (default)
limit=20 (default)
```

**Example Request:**
```javascript
// Frontend Code Example
const fetchAvailableQuizzes = async () => {
  const token = localStorage.getItem('authToken'); // Student ka token
  
  try {
    const response = await fetch('/api/v1/student/quizzes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data.data; // Quiz list
  } catch (error) {
    console.error('Error fetching quizzes:', error);
  }
};
```

---

## 2. API Response Structure

### Successful Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "quiz_id_123",
      "title": "Math Chapter 5 Quiz",
      "description": "Basic arithmetic and geometry",
      "subjectId": {
        "_id": "subject_123",
        "name": "Mathematics"
      },
      "teacherId": {
        "_id": "teacher_456",
        "firstName": "Rajesh",
        "lastName": "Kumar"
      },
      "timeLimit": 30,
      "maxMarks": 50,
      "passingMarks": 25,
      "maxAttempts": 3,
      "allowRetake": true,
      "startsAt": "2026-04-23T10:00:00Z",
      "endsAt": "2026-04-24T18:00:00Z",
      "isActive": true,
      "showCorrectAnswers": true,
      "showResultsImmediately": true,
      
      // Student-specific data
      "submissionStatus": "NOT_ATTEMPTED",
      "attempts": 0,
      "bestScore": 0,
      "bestGrade": "F",
      "canRetake": true,
      "nextAttemptAvailable": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalQuizzes": 1
  }
}
```

### Response Data Explanation:
| Field | Matalab |
|-------|---------|
| `title` | Quiz ka naam |
| `description` | Quiz ka topic/details |
| `timeLimit` | Minutes mein time limit |
| `maxMarks` | Total marks |
| `passingMarks` | Pass karne ke liye zaruri marks |
| `maxAttempts` | Kitni baar attempt kar sakte ho |
| `allowRetake` | Kya retake allowed hai |
| `submissionStatus` | `NOT_ATTEMPTED` or `ATTEMPTED` |
| `attempts` | Kitni baar attempt kiye ho |
| `bestScore` | Best score percentage |
| `canRetake` | Kya dobara attempt kar sakte ho |

---

## 3. Single Quiz Display (Agar Sirf Ek Quiz Hai)

### Frontend Logic:

```javascript
const QuizDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableQuizzes().then(data => {
      setQuizzes(data);
      setLoading(false);
    });
  }, []);

  // Agar sirf ek quiz hai
  if (quizzes.length === 1 && !loading) {
    return <QuizCard quiz={quizzes[0]} />;
  }

  // Agar multiple quizzes hain
  return (
    <div className="quiz-list">
      {quizzes.map(quiz => (
        <QuizCard key={quiz._id} quiz={quiz} />
      ))}
    </div>
  );
};
```

### Single Quiz Display Card UI (Required Fields):

```html
<!-- Single Quiz Card -->
<div class="quiz-card">
  <div class="quiz-header">
    <h2>{{ quiz.title }}</h2>
    <span class="subject">{{ quiz.subjectId.name }}</span>
  </div>

  <div class="quiz-details">
    <p class="description">{{ quiz.description }}</p>
    
    <div class="quiz-info-grid">
      <div class="info-item">
        <label>Time Limit:</label>
        <span>{{ quiz.timeLimit }} minutes</span>
      </div>
      <div class="info-item">
        <label>Total Marks:</label>
        <span>{{ quiz.maxMarks }}</span>
      </div>
      <div class="info-item">
        <label>Passing Marks:</label>
        <span>{{ quiz.passingMarks }}</span>
      </div>
      <div class="info-item">
        <label>Attempts Allowed:</label>
        <span>{{ quiz.maxAttempts }}</span>
      </div>
      <div class="info-item">
        <label>Your Attempts:</label>
        <span>{{ quiz.attempts }}/{{ quiz.maxAttempts }}</span>
      </div>
      <div class="info-item">
        <label>Best Score:</label>
        <span class="score">{{ quiz.bestScore }}% ({{ quiz.bestGrade }})</span>
      </div>
    </div>

    <!-- Status Section -->
    <div class="status-section">
      <p v-if="quiz.submissionStatus === 'NOT_ATTEMPTED'" class="status-not-attempted">
        ❌ Not Attempted Yet
      </p>
      <p v-else class="status-attempted">
        ✅ Attempted {{ quiz.attempts }} time(s)
      </p>
    </div>

    <!-- Quiz Timing -->
    <div class="timing-section">
      <p>
        <strong>Active From:</strong> {{ formatDate(quiz.startsAt) }}
        to {{ formatDate(quiz.endsAt) }}
      </p>
      <p v-if="!quiz.isActive" class="quiz-inactive">
        ⏱️ Quiz is not active yet or has ended
      </p>
    </div>
  </div>

  <!-- Action Button -->
  <div class="quiz-actions">
    <button 
      v-if="quiz.canRetake && quiz.isActive"
      @click="startQuiz(quiz._id)"
      class="btn btn-primary"
    >
      {{ quiz.attempts > 0 ? 'Retake Quiz' : 'Start Quiz' }}
    </button>
    
    <button 
      v-if="quiz.attempts > 0"
      @click="viewResults(quiz._id)"
      class="btn btn-secondary"
    >
      View Results
    </button>
    
    <button 
      v-if="!quiz.canRetake"
      class="btn btn-disabled"
      disabled
    >
      Max Attempts Reached
    </button>
  </div>
</div>
```

---

## 4. Quiz Starting Flow

### Step 1: Start Quiz Button Click

```javascript
const startQuiz = async (quizId) => {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`/api/v1/student/quizzes/${quizId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      showError(errorData.message); // Show error message
      return;
    }

    const data = await response.json();
    startQuizSession(data.data); // Quiz session start karo
  } catch (error) {
    console.error('Error starting quiz:', error);
  }
};
```

### Step 2: API Response (Quiz Start)

```json
{
  "success": true,
  "message": "Quiz started successfully",
  "data": {
    "submissionId": "submission_789",
    "quiz": {
      "_id": "quiz_123",
      "title": "Math Chapter 5 Quiz",
      "description": "Basic arithmetic",
      "timeLimit": 30,
      "maxMarks": 50,
      "passingMarks": 25,
      "showCorrectAnswers": true,
      "showResultsImmediately": true
    },
    "questions": [
      {
        "_id": "q1",
        "questionIndex": 0,
        "question": "What is 5 + 3?",
        "questionType": "MCQ",
        "options": ["5", "8", "3", "10"],
        "marks": 2
      },
      {
        "_id": "q2",
        "questionIndex": 1,
        "question": "What is the capital of India?",
        "questionType": "MCQ",
        "options": ["Mumbai", "Delhi", "Bangalore", "Kolkata"],
        "marks": 2
      }
    ],
    "timeRemaining": 1800,
    "startedAt": "2026-04-23T15:30:00Z"
  }
}
```

---

## 5. Quiz Taking Interface

### UI Component (React Example):

```javascript
import { useState, useEffect } from 'react';

const QuizInterface = ({ submissionId, quiz, questions, initialTimeRemaining }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      submitQuiz(); // Auto-submit when time is up
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = async (selectedOption) => {
    // Answer save karo
    setAnswers({
      ...answers,
      [currentQuestionIndex]: selectedOption
    });

    // Backend ko bataao
    await saveAnswer(submissionId, currentQuestionIndex, selectedOption);
  };

  const saveAnswer = async (submissionId, questionIndex, selectedAnswer) => {
    const token = localStorage.getItem('authToken');
    const quizId = quiz._id;

    try {
      await fetch(`/api/v1/student/quizzes/${quizId}/answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionIndex,
          selectedAnswer
        })
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const submitQuiz = async () => {
    const token = localStorage.getItem('authToken');
    const quizId = quiz._id;

    try {
      const response = await fetch(`/api/v1/student/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      showResults(data.data.results); // Results dikha do
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  return (
    <div className="quiz-interface">
      {/* Timer */}
      <div className="quiz-header">
        <h2>{quiz.title}</h2>
        <div className="timer" style={{ color: timeRemaining < 300 ? 'red' : 'black' }}>
          Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60)
            .toString()
            .padStart(2, '0')}
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        <div className="progress">
          <div
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="question-section">
        <h3>{currentQuestion.question}</h3>
        <div className="options">
          {currentQuestion.options.map((option, index) => (
            <label key={index} className="option">
              <input
                type="radio"
                name={`question_${currentQuestionIndex}`}
                value={option}
                checked={answers[currentQuestionIndex] === option}
                onChange={() => handleAnswerSelect(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-navigation">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
        >
          ← Previous
        </button>

        <button
          onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next →
        </button>

        <button onClick={submitQuiz} className="btn-submit">
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizInterface;
```

---

## 6. Quiz Results Display

### Results API Response:

```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "submissionId": "submission_789",
    "results": {
      "totalQuestions": 20,
      "correctAnswers": 15,
      "wrongAnswers": 5,
      "totalMarks": 50,
      "marksObtained": 37.5,
      "percentage": 75,
      "grade": "A",
      "passed": true,
      "timeTaken": "18 minutes 45 seconds",
      "answers": [
        {
          "questionIndex": 0,
          "selectedAnswer": "8",
          "isCorrect": true,
          "correctAnswer": "8",
          "explanation": "5 + 3 = 8"
        },
        {
          "questionIndex": 1,
          "selectedAnswer": "Delhi",
          "isCorrect": true,
          "correctAnswer": "Delhi",
          "explanation": "Delhi is the capital of India"
        }
      ]
    }
  }
}
```

### Results Display UI:

```html
<!-- Results Card -->
<div class="results-container">
  <div class="results-header">
    <h2>Quiz Results</h2>
    <span class="grade" :class="results.grade.toLowerCase()">{{ results.grade }}</span>
  </div>

  <!-- Score Summary -->
  <div class="score-summary">
    <div class="score-card">
      <p class="label">Score</p>
      <p class="value">{{ results.percentage }}%</p>
      <p class="marks">{{ results.marksObtained }} / {{ results.totalMarks }}</p>
    </div>

    <div class="score-card">
      <p class="label">Status</p>
      <p class="value" :style="{ color: results.passed ? 'green' : 'red' }">
        {{ results.passed ? '✅ Passed' : '❌ Failed' }}
      </p>
      <p class="passing">Passing: {{ results.totalMarks * 0.5 }}</p>
    </div>

    <div class="score-card">
      <p class="label">Time Taken</p>
      <p class="value">{{ results.timeTaken }}</p>
    </div>
  </div>

  <!-- Detailed Analysis -->
  <div class="analysis">
    <h3>Performance</h3>
    <ul>
      <li>Correct Answers: {{ results.correctAnswers }}</li>
      <li>Wrong Answers: {{ results.wrongAnswers }}</li>
      <li>Total Questions: {{ results.totalQuestions }}</li>
    </ul>
  </div>

  <!-- Review Answers (Agar showCorrectAnswers enabled hai) -->
  <div v-if="results.answers.length > 0" class="answers-review">
    <h3>Answer Review</h3>
    <div v-for="(answer, index) in results.answers" :key="index" class="answer-item">
      <p class="question-num">Question {{ index + 1 }}</p>
      <p class="user-answer" :class="{ 'correct': answer.isCorrect, 'wrong': !answer.isCorrect }">
        Your Answer: {{ answer.selectedAnswer }}
        {{ answer.isCorrect ? '✅' : '❌' }}
      </p>
      <p v-if="!answer.isCorrect" class="correct-answer">
        Correct Answer: {{ answer.correctAnswer }}
      </p>
      <p v-if="answer.explanation" class="explanation">
        Explanation: {{ answer.explanation }}
      </p>
    </div>
  </div>

  <!-- Retake Button (Agar allowed hai) -->
  <div class="results-actions">
    <button 
      v-if="canRetake"
      @click="retakeQuiz"
      class="btn btn-primary"
    >
      Retake Quiz
    </button>
    <button @click="goBack" class="btn btn-secondary">
      Back to Dashboard
    </button>
  </div>
</div>
```

---

## 7. Error Handling

### Common Errors:

```javascript
// Error response structure
{
  "success": false,
  "message": "Error message",
  "statusCode": 400
}
```

| Error | HTTP | Matlab |
|-------|------|---------|
| Quiz not found | 404 | Quiz exist nahi karta |
| Quiz is not active | 400 | Quiz abhi start nahi hua ya end ho gaya |
| You are not enrolled in this class | 403 | Tum is class mein enrolled nahi ho |
| Maximum attempts reached | 400 | Sirf 3 (ya max limit) baar attempt kar sakte the |
| Quiz already in progress | 400 | Pehle se ye quiz chal raha hai |
| No active quiz attempt found | 404 | Quiz attempt nahi hua |
| Quiz time limit exceeded | 400 | Time limit khatam ho gaya |

---

## 8. Complete Flow Diagram

```
Student Login
    ↓
Fetch Available Quizzes (GET /student/quizzes)
    ↓
Display Quiz(zes) - Agar ek hai to direct dikha do
    ↓
Click "Start Quiz" Button
    ↓
Call Start API (POST /student/quizzes/:id/start)
    ↓
Display Quiz Interface with Timer
    ↓
Answer Questions (Save each answer)
    ↓
Submit Quiz (POST /student/quizzes/:id/submit)
    ↓
Display Results
    ↓
Option to Retake (agar allowed hai) ya Back to Dashboard
```

---

## 9. Frontend Implementation Checklist

- [ ] **Quiz List Screen**
  - [ ] Fetch quizzes on component mount
  - [ ] Handle loading state
  - [ ] Display single quiz directly if only one exists
  - [ ] Show all quiz details (title, marks, time limit, etc.)
  - [ ] Show student's previous attempt status

- [ ] **Quiz Start**
  - [ ] Add "Start Quiz" button (enable only if active & attempts available)
  - [ ] Call start API
  - [ ] Handle errors gracefully
  - [ ] Navigate to quiz interface on success

- [ ] **Quiz Interface**
  - [ ] Display current question (numbered)
  - [ ] Show all options (MCQ format)
  - [ ] Implement timer with countdown
  - [ ] Auto-save answers as student selects them
  - [ ] Show progress (Q 5/20)
  - [ ] Implement Previous/Next navigation
  - [ ] Add Submit button

- [ ] **Timer Management**
  - [ ] Start timer on quiz load
  - [ ] Show remaining time prominently
  - [ ] Auto-submit when time expires
  - [ ] Warn when time is running out (< 5 minutes)

- [ ] **Results Display**
  - [ ] Show final score and percentage
  - [ ] Display pass/fail status
  - [ ] Show performance metrics
  - [ ] Display detailed answer review (if enabled)
  - [ ] Show correct answer + explanation
  - [ ] Provide retake option

- [ ] **Error Handling**
  - [ ] Handle all error scenarios
  - [ ] Show user-friendly error messages
  - [ ] Implement retry logic where applicable

---

## 10. API Test Examples (Using cURL)

### Get Available Quizzes
```bash
curl -X GET "http://localhost:3000/api/v1/student/quizzes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Start Quiz
```bash
curl -X POST "http://localhost:3000/api/v1/student/quizzes/QUIZ_ID/start" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Submit Answer
```bash
curl -X POST "http://localhost:3000/api/v1/student/quizzes/QUIZ_ID/answer" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"questionIndex": 0, "selectedAnswer": "B"}'
```

### Submit Quiz
```bash
curl -X POST "http://localhost:3000/api/v1/student/quizzes/QUIZ_ID/submit" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 11. Key Points for Frontend Implementation

✅ **Do's:**
- Always send authorization token in header
- Implement proper error handling and user feedback
- Auto-save answers so students don't lose progress
- Implement timer with auto-submit on timeout
- Show clear pass/fail status
- Allow retakes if `allowRetake: true` and attempts available

❌ **Don'ts:**
- Don't allow quiz start if `isActive: false`
- Don't allow retake if maximum attempts reached
- Don't modify answers after submission
- Don't skip timer validation
- Don't allow quiz if student is not enrolled

---

## Contact
Kisi bhi issue ke liye backend team se contact karo.

**Happy Coding! 🚀**
