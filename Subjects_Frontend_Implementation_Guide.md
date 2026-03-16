# Subjects Frontend Implementation Guide

## Overview
This document provides a complete guide for implementing the Subjects functionality on the frontend. The Subjects API allows school admins to manage subjects for different classes in their school.

## API Endpoints

### Base URL
```
http://localhost:5000/api/subjects
```

### Authentication
All endpoints require:
- **Authorization Header**: `Bearer <token>`
- **Role**: `school_admin` only

## Available Endpoints

### 1. Create Subject
**POST** `/subjects`

**Request Body:**
```json
{
  "name": "Mathematics",
  "classId": "60d5ecb54b24a1234567890a"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Subject created successfully",
  "data": {
    "_id": "60d5ecb54b24a1234567890b",
    "name": "Mathematics",
    "classId": "60d5ecb54b24a1234567890a",
    "schoolId": "60d5ecb54b24a1234567890c",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Subject already exists for this class
- `404`: Class not found
- `500`: Server error

---

### 2. Get All Subjects
**GET** `/subjects`

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "60d5ecb54b24a1234567890b",
      "name": "Mathematics",
      "classId": {
        "_id": "60d5ecb54b24a1234567890a",
        "name": "Class 10A"
      },
      "schoolId": "60d5ecb54b24a1234567890c",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Subjects by Class
**GET** `/subjects/class/{classId}`

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "60d5ecb54b24a1234567890b",
      "name": "Mathematics",
      "classId": {
        "_id": "60d5ecb54b24a1234567890a",
        "name": "Class 10A"
      },
      "schoolId": "60d5ecb54b24a1234567890c",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Update Subject
**PATCH** `/subjects/{id}`

**Request Body:**
```json
{
  "name": "Advanced Mathematics"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subject updated successfully",
  "data": {
    "_id": "60d5ecb54b24a1234567890b",
    "name": "Advanced Mathematics",
    "classId": "60d5ecb54b24a1234567890a",
    "schoolId": "60d5ecb54b24a1234567890c",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Subject with this name already exists
- `404`: Subject not found
- `500`: Server error

---

### 5. Delete Subject
**DELETE** `/subjects/{id}`

**Response (200):**
```json
{
  "success": true,
  "message": "Subject deleted successfully"
}
```

**Error Responses:**
- `404`: Subject not found
- `500`: Server error

---

## Frontend Implementation Guide

### 1. API Service Setup

Create an API service file for subjects:

```javascript
// services/subjectService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const subjectService = {
  // Get auth token from localStorage
  getAuthHeaders: () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }),

  // Create subject
  createSubject: async (subjectData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/subjects`,
        subjectData,
        { headers: subjectService.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get all subjects
  getAllSubjects: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subjects`,
        { headers: subjectService.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get subjects by class
  getSubjectsByClass: async (classId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subjects/class/${classId}`,
        { headers: subjectService.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Update subject
  updateSubject: async (id, updateData) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/subjects/${id}`,
        updateData,
        { headers: subjectService.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Delete subject
  deleteSubject: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/subjects/${id}`,
        { headers: subjectService.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};

export default subjectService;
```

### 2. React Component Implementation

#### Subject List Component

```jsx
// components/SubjectList.jsx
import React, { useState, useEffect } from 'react';
import subjectService from '../services/subjectService';

const SubjectList = ({ classId }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, [classId]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = classId 
        ? await subjectService.getSubjectsByClass(classId)
        : await subjectService.getAllSubjects();
      setSubjects(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectService.deleteSubject(subjectId);
        setSubjects(subjects.filter(subject => subject._id !== subjectId));
      } catch (err) {
        setError(err.message || 'Failed to delete subject');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="subject-list">
      <h2>Subjects</h2>
      {subjects.length === 0 ? (
        <p>No subjects found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Subject Name</th>
              <th>Class</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(subject => (
              <tr key={subject._id}>
                <td>{subject.name}</td>
                <td>{subject.classId?.name || 'N/A'}</td>
                <td>
                  <button onClick={() => handleEdit(subject)}>Edit</button>
                  <button onClick={() => handleDelete(subject._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SubjectList;
```

#### Create/Edit Subject Form

```jsx
// components/SubjectForm.jsx
import React, { useState, useEffect } from 'react';
import subjectService from '../services/subjectService';

const SubjectForm = ({ subjectId, classId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    classId: classId || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  const fetchSubject = async () => {
    try {
      const response = await subjectService.getSubjectById(subjectId);
      setFormData({
        name: response.data.name,
        classId: response.data.classId._id
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch subject');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (subjectId) {
        await subjectService.updateSubject(subjectId, { name: formData.name });
      } else {
        await subjectService.createSubject(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subject-form">
      <h2>{subjectId ? 'Edit Subject' : 'Create Subject'}</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Subject Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {!classId && (
          <div className="form-group">
            <label htmlFor="classId">Class:</label>
            <select
              id="classId"
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              required
            >
              <option value="">Select a class</option>
              {/* Add class options here */}
            </select>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (subjectId ? 'Update' : 'Create')}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubjectForm;
```

### 3. State Management (Redux/Context)

#### Redux Slice Example

```javascript
// store/subjectsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import subjectService from '../services/subjectService';

// Async thunks
export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async (classId = null) => {
    const response = classId 
      ? await subjectService.getSubjectsByClass(classId)
      : await subjectService.getAllSubjects();
    return response.data;
  }
);

export const createSubject = createAsyncThunk(
  'subjects/createSubject',
  async (subjectData) => {
    const response = await subjectService.createSubject(subjectData);
    return response.data;
  }
);

export const updateSubject = createAsyncThunk(
  'subjects/updateSubject',
  async ({ id, updateData }) => {
    const response = await subjectService.updateSubject(id, updateData);
    return response.data;
  }
);

export const deleteSubject = createAsyncThunk(
  'subjects/deleteSubject',
  async (id) => {
    await subjectService.deleteSubject(id);
    return id;
  }
);

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState: {
    subjects: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch subjects
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create subject
      .addCase(createSubject.fulfilled, (state, action) => {
        state.subjects.push(action.payload.data);
      })
      // Update subject
      .addCase(updateSubject.fulfilled, (state, action) => {
        const index = state.subjects.findIndex(
          subject => subject._id === action.payload.data._id
        );
        if (index !== -1) {
          state.subjects[index] = action.payload.data;
        }
      })
      // Delete subject
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.subjects = state.subjects.filter(
          subject => subject._id !== action.payload
        );
      });
  }
});

export const { clearError } = subjectsSlice.actions;
export default subjectsSlice.reducer;
```

### 4. Styling Guidelines

```css
/* components/SubjectStyles.css */
.subject-list {
  padding: 20px;
}

.subject-list table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.subject-list th,
.subject-list td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.subject-list th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.subject-form {
  max-width: 500px;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background-color: #007bff;
  color: white;
}

.form-actions button[type="button"] {
  background-color: #6c757d;
  color: white;
}

.error {
  color: #dc3545;
  padding: 10px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 15px;
}
```

### 5. Error Handling Best Practices

```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Invalid request data';
      case 401:
        return 'Unauthorized - Please login again';
      case 403:
        return 'Forbidden - You don\'t have permission';
      case 404:
        return data.message || 'Resource not found';
      case 500:
        return 'Server error - Please try again later';
      default:
        return data.message || 'An error occurred';
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error - Please check your connection';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};
```

### 6. Component Integration Example

```jsx
// pages/SubjectManagement.jsx
import React, { useState } from 'react';
import SubjectList from '../components/SubjectList';
import SubjectForm from '../components/SubjectForm';

const SubjectManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setEditingSubject(null);
    setShowForm(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSubject(null);
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSubject(null);
  };

  return (
    <div className="subject-management">
      <div className="page-header">
        <h1>Subject Management</h1>
        <button onClick={handleCreate}>Create New Subject</button>
      </div>

      {showForm && (
        <SubjectForm
          subjectId={editingSubject?._id}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <SubjectList key={refreshKey} />
    </div>
  );
};

export default SubjectManagement;
```

## Important Notes

1. **Authorization**: All API calls require the user to be logged in as a school admin
2. **Soft Delete**: Subjects are soft deleted (isActive set to false)
3. **Unique Constraint**: Subject names must be unique within each class
4. **Class Validation**: Class must exist and belong to the same school
5. **Error Handling**: Always handle API errors gracefully with user-friendly messages

## Testing Recommendations

1. Test all CRUD operations
2. Test authorization (non-admin users should get 403)
3. Test validation (duplicate subjects, invalid classId)
4. Test error scenarios (network errors, server errors)
5. Test loading states and user feedback

This implementation provides a complete, production-ready frontend solution for the Subjects functionality.
