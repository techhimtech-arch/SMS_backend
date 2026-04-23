# Single Quiz Implementation - Complete Step-by-Step Guide
**Jab Student ke Liye Sirf Ek Quiz Ho**

---

## Scenario
Student login karta hai → Backend check karta hai → Sirf 1 quiz available hai → Frontend us ek quiz ko seedha dikhaata hai (list nahi dikhata)

---

## Step 1: Dashboard Mein Quizzes Load Karna

### Backend API Call (Frontend)

```javascript
// hooks/useQuizzes.js
import { useState, useEffect } from 'react';

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = localStorage.getItem('authToken');
      
      try {
        const response = await fetch('/api/v1/student/quizzes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQuizzes(data.data); // Array of quizzes
        setError(null);
      } catch (err) {
        setError(err.message);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return { quizzes, loading, error };
};
```

---

## Step 2: Single Quiz vs Multiple Display Logic

### React Component Example

```javascript
// pages/StudentQuizDashboard.js
import { useQuizzes } from '../hooks/useQuizzes';
import SingleQuizView from '../components/SingleQuizView';
import QuizListView from '../components/QuizListView';
import LoadingSpinner from '../components/LoadingSpinner';

export default function StudentQuizDashboard() {
  const { quizzes, loading, error } = useQuizzes();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">Failed to load quizzes: {error}</div>;
  }

  // KEY LOGIC: Agar sirf 1 quiz hai
  if (quizzes.length === 1) {
    return <SingleQuizView quiz={quizzes[0]} />;
  }

  // Agar 0 quiz hai
  if (quizzes.length === 0) {
    return (
      <div className="no-quizzes">
        <p>🎯 Koi quiz available nahi hai abhi</p>
      </div>
    );
  }

  // Agar multiple quizzes hain
  return <QuizListView quizzes={quizzes} />;
}
```

---

## Step 3: Single Quiz Display Component (Full UI)

### Complete Component Code

```javascript
// components/SingleQuizView.js
import { useState } from 'react';
import QuizInterface from './QuizInterface';
import QuizResults from './QuizResults';
import './SingleQuizView.css';

export default function SingleQuizView({ quiz }) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartQuiz = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`/api/v1/student/quizzes/${quiz._id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      setSubmissionData(data.data);
      setQuizStarted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmitted = (results) => {
    setSubmissionData(results);
    setQuizSubmitted(true);
  };

  // Already submitted - Show results
  if (quizSubmitted) {
    return <QuizResults submission={submissionData} quiz={quiz} />;
  }

  // Quiz in progress
  if (quizStarted && submissionData) {
    return (
      <QuizInterface
        quiz={submissionData.quiz}
        questions={submissionData.questions}
        submissionId={submissionData.submissionId}
        timeRemaining={submissionData.timeRemaining}
        onSubmitted={handleQuizSubmitted}
      />
    );
  }

  // Quiz not started - Show quiz card
  return (
    <div className="single-quiz-container">
      <div className="quiz-card">
        {/* Header */}
        <div className="quiz-header">
          <h1>{quiz.title}</h1>
          <p className="subject">{quiz.subjectId?.name}</p>
        </div>

        {/* Description */}
        {quiz.description && (
          <div className="quiz-description">
            <p>{quiz.description}</p>
          </div>
        )}

        {/* Quiz Details Grid */}
        <div className="quiz-details-grid">
          {/* Row 1 */}
          <div className="detail-item">
            <span className="label">⏱️ Duration</span>
            <span className="value">{quiz.timeLimit} minutes</span>
          </div>

          <div className="detail-item">
            <span className="label">📊 Total Marks</span>
            <span className="value">{quiz.maxMarks}</span>
          </div>

          <div className="detail-item">
            <span className="label">✅ Passing Marks</span>
            <span className="value">{quiz.passingMarks}</span>
          </div>

          {/* Row 2 */}
          <div className="detail-item">
            <span className="label">🔄 Attempts Allowed</span>
            <span className="value">{quiz.maxAttempts}</span>
          </div>

          <div className="detail-item">
            <span className="label">📝 Your Attempts</span>
            <span className="value">
              {quiz.attempts}/{quiz.maxAttempts}
            </span>
          </div>

          <div className="detail-item">
            <span className="label">🏆 Best Score</span>
            <span className="value score">
              {quiz.bestScore}% ({quiz.bestGrade})
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="quiz-status">
          {quiz.submissionStatus === 'NOT_ATTEMPTED' ? (
            <div className="status-badge not-attempted">
              ❌ Not Attempted Yet
            </div>
          ) : (
            <div className="status-badge attempted">
              ✅ Attempted {quiz.attempts} time(s)
            </div>
          )}
        </div>

        {/* Active Status */}
        {!quiz.isActive && (
          <div className="alert alert-warning">
            ⏱️ This quiz is not active. It will be available from{' '}
            {new Date(quiz.startsAt).toLocaleString()} to{' '}
            {new Date(quiz.endsAt).toLocaleString()}
          </div>
        )}

        {/* Retake Info */}
        {quiz.attempts > 0 && !quiz.canRetake && (
          <div className="alert alert-info">
            ℹ️ You have reached the maximum number of attempts for this quiz.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="quiz-actions">
          <button
            onClick={handleStartQuiz}
            disabled={!quiz.isActive || !quiz.canRetake || loading}
            className="btn btn-primary btn-large"
          >
            {loading && <span className="spinner">⏳ </span>}
            {quiz.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}
          </button>

          {quiz.attempts > 0 && (
            <button
              onClick={() => {
                // Navigate to results page
                window.location.href = `/quiz/${quiz._id}/results`;
              }}
              className="btn btn-secondary btn-large"
            >
              View Results
            </button>
          )}
        </div>

        {/* Extra Info */}
        <div className="quiz-info">
          <p className="info-text">
            👨‍🏫 Created by: {quiz.teacherId?.firstName} {quiz.teacherId?.lastName}
          </p>
          <p className="info-text">
            📅 Active: {new Date(quiz.startsAt).toLocaleDateString()} -{' '}
            {new Date(quiz.endsAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
```

### CSS Styling

```css
/* components/SingleQuizView.css */

.single-quiz-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
}

.quiz-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.quiz-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.quiz-header h1 {
  margin: 0;
  font-size: 28px;
  margin-bottom: 10px;
}

.quiz-header .subject {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.quiz-description {
  padding: 20px;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.quiz-description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.quiz-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.detail-item {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.detail-item .label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
  font-weight: 600;
}

.detail-item .value {
  display: block;
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

.detail-item .score {
  color: #667eea;
}

.quiz-status {
  padding: 15px 20px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.status-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.not-attempted {
  background: #fff3cd;
  color: #856404;
}

.status-badge.attempted {
  background: #d4edda;
  color: #155724;
}

.alert {
  margin: 15px 20px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  border-left: 4px solid;
}

.alert-warning {
  background: #fff3cd;
  border-left-color: #ffc107;
  color: #856404;
}

.alert-info {
  background: #d1ecf1;
  border-left-color: #17a2b8;
  color: #0c5460;
}

.alert-error {
  background: #f8d7da;
  border-left-color: #dc3545;
  color: #721c24;
}

.quiz-actions {
  padding: 20px;
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn-large {
  padding: 15px 30px;
  font-size: 16px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #e9ecef;
  color: #333;
}

.btn-secondary:hover {
  background: #dee2e6;
}

.spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.quiz-info {
  padding: 15px 20px;
  background: #f5f5f5;
  border-top: 1px solid #eee;
  font-size: 13px;
  color: #666;
}

.info-text {
  margin: 5px 0;
}

@media (max-width: 600px) {
  .single-quiz-container {
    margin: 20px;
    padding: 0;
  }

  .quiz-details-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 15px;
  }

  .quiz-actions {
    flex-direction: column;
  }
}
```

---

## Step 4: Quiz Interface Component (Taking Quiz)

```javascript
// components/QuizInterface.js
import { useState, useEffect, useCallback } from 'react';

export default function QuizInterface({
  quiz,
  questions,
  submissionId,
  timeRemaining: initialTime,
  onSubmitted
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [submitting, setSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto-save answer
  const handleAnswerSelect = useCallback(async (selectedOption) => {
    // Save to state
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: selectedOption
    }));

    // Save to backend
    const token = localStorage.getItem('authToken');
    try {
      await fetch(`/api/v1/student/quizzes/${quiz._id}/answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionIndex: currentQuestion,
          selectedAnswer: selectedOption
        })
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  }, [currentQuestion, quiz._id]);

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`/api/v1/student/quizzes/${quiz._id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      onSubmitted(data.data);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const question = questions[currentQuestion];
  const timeColor = timeRemaining < 300 ? '#dc3545' : '#667eea';
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="quiz-interface">
      {/* Header */}
      <div className="quiz-header-active">
        <h2>{quiz.title}</h2>
        <div
          className="timer"
          style={{ color: timeColor, fontSize: '24px', fontWeight: 'bold' }}
        >
          ⏱️ {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Progress */}
      <div className="progress-section">
        <div className="progress-info">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="question-section">
        <h3>{question.question}</h3>
        <p className="marks">({question.marks} marks)</p>

        <div className="options">
          {question.options.map((option, index) => (
            <label key={index} className="option">
              <input
                type="radio"
                name={`q_${currentQuestion}`}
                value={option}
                checked={answers[currentQuestion] === option}
                onChange={() => handleAnswerSelect(option)}
              />
              <span className="option-text">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-navigation">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="btn btn-nav"
        >
          ← Previous
        </button>

        <span className="nav-info">
          {currentQuestion + 1} / {questions.length}
        </span>

        <button
          onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
          disabled={currentQuestion === questions.length - 1}
          className="btn btn-nav"
        >
          Next →
        </button>
      </div>

      {/* Submit Button */}
      <div className="submit-section">
        <button
          onClick={handleSubmitQuiz}
          disabled={submitting}
          className="btn btn-submit"
        >
          {submitting ? 'Submitting...' : '✓ Submit Quiz'}
        </button>
      </div>
    </div>
  );
}
```

---

## Step 5: Results Display Component

```javascript
// components/QuizResults.js
export default function QuizResults({ submission, quiz }) {
  const results = submission.results;
  const isPass = results.passed;
  const gradeColor = {
    'A': '#28a745',
    'B': '#17a2b8',
    'C': '#ffc107',
    'D': '#fd7e14',
    'F': '#dc3545'
  };

  return (
    <div className="results-container">
      {/* Score Card */}
      <div className="score-header" style={{ borderLeftColor: gradeColor[results.grade] }}>
        <div className="grade-circle" style={{ background: gradeColor[results.grade] }}>
          {results.grade}
        </div>
        <div className="score-info">
          <h2>{results.percentage}%</h2>
          <p>{results.marksObtained} / {results.totalMarks} marks</p>
        </div>
      </div>

      {/* Status */}
      <div className={`status ${isPass ? 'pass' : 'fail'}`}>
        {isPass ? '✅ PASSED' : '❌ FAILED'}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat">
          <span className="label">Correct</span>
          <span className="value">{results.correctAnswers}/{results.totalQuestions}</span>
        </div>
        <div className="stat">
          <span className="label">Time Taken</span>
          <span className="value">{results.timeTaken}</span>
        </div>
      </div>

      {/* Answer Review */}
      {results.answers && (
        <div className="answers-review">
          <h3>📋 Answer Review</h3>
          {results.answers.map((answer, idx) => (
            <div key={idx} className={`answer-item ${answer.isCorrect ? 'correct' : 'wrong'}`}>
              <p className="q-number">Q{idx + 1}</p>
              <p>Your Answer: <strong>{answer.selectedAnswer}</strong></p>
              {!answer.isCorrect && (
                <p className="correct">Correct: {answer.correctAnswer}</p>
              )}
              {answer.explanation && (
                <p className="explanation">💡 {answer.explanation}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="results-actions">
        {quiz.canRetake && (
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retake Quiz
          </button>
        )}
        <button
          onClick={() => (window.location.href = '/student/dashboard')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
```

---

## Complete Flow Diagram

```
┌──────────────────────────┐
│  Student Logs In         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ GET /student/quizzes     │
│ (Fetch all quizzes)      │
└────────────┬─────────────┘
             │
    ┌────────┴─────────┐
    │                  │
    ▼                  ▼
┌──────────┐      ┌──────────┐
│ Qty = 1  │      │ Qty > 1  │
│ (Single) │      │ (List)   │
└────┬─────┘      └──────────┘
     │
     ▼
┌───────────────────────────┐
│ Show Single Quiz Card      │
│ with details & buttons     │
└────────────┬──────────────┘
             │
      Click "Start Quiz"
             │
             ▼
┌───────────────────────────┐
│ POST /quizzes/:id/start   │
│ (Start Quiz)              │
└────────────┬──────────────┘
             │
             ▼
┌───────────────────────────┐
│ Show Quiz Interface       │
│ (Questions + Timer)       │
└────────────┬──────────────┘
             │
      Answer Questions
      (Auto-save each)
             │
      Click "Submit Quiz"
             │
             ▼
┌───────────────────────────┐
│ POST /quizzes/:id/submit  │
│ (Submit answers)          │
└────────────┬──────────────┘
             │
             ▼
┌───────────────────────────┐
│ Show Results              │
│ (Score + Review)          │
└───────────────────────────┘
```

---

## Testing the Implementation

### Manual Test Cases

```javascript
// Test 1: Single Quiz Display
Input: Fetch quizzes when 1 quiz available
Expected: Show SingleQuizView component directly

// Test 2: Start Quiz
Input: Click "Start Quiz" button
Expected: Timer starts, questions appear, auto-save works

// Test 3: Timer
Input: Let timer run to 0
Expected: Quiz auto-submits

// Test 4: Submit
Input: Click "Submit Quiz" button
Expected: Results display with marks and review

// Test 5: Retake
Input: Click "Retake Quiz"
Expected: New attempt starts (if allowed)
```

---

## Summary

✅ **When quiz.length === 1**: Show SingleQuizView (don't show list)  
✅ **Quiz Card**: Shows all important details  
✅ **Start Quiz**: Calls API, loads questions, starts timer  
✅ **Quiz Interface**: Auto-saves answers, timer counts down  
✅ **Submit**: Calculates results, shows in detailed format  
✅ **Results**: Shows score, grade, and answer review  

**Frontend Team: Ye documents dekh ke implement kar dena! 🚀**
