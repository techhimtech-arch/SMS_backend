# Teacher Login API Documentation

## Overview

This document provides comprehensive information about the Teacher Login API in the School Management System (SMS). The login system is role-based and supports multiple user types including teachers, school admins, students, parents, and accountants.

## API Endpoint

**POST** `/auth/login`

## Base URL
```
http://localhost:3000/auth/login
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with a two-token system:
- **Access Token**: Short-lived (15 minutes) token for API requests
- **Refresh Token**: Long-lived (7 days) token for obtaining new access tokens

## Request Headers

```json
{
  "Content-Type": "application/json"
}
```

## Request Body

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| email | string | Yes | Teacher's registered email address | "teacher@school.edu" |
| password | string | Yes | Teacher's password | "password123" |

### Sample Request

```json
{
  "email": "teacher@school.edu",
  "password": "password123"
}
```

## Response Format

### Successful Login (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f8a9b2c3d4e5f6a7b8c9d0",
      "name": "John Smith",
      "email": "teacher@school.edu",
      "role": "teacher",
      "schoolId": "64f8a9b2c3d4e5f6a7b8c9d1"
    }
  }
}
```

### Error Responses

#### 401 Unauthorized - Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### 401 Unauthorized - User Not Found
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

## Teacher User Role Details

Teachers have the following characteristics:
- **Role**: `"teacher"`
- **Permissions**: Access to teacher-specific endpoints
- **School Association**: Linked to a specific school via `schoolId`
- **Account Status**: Must be `isActive: true` to login

## Security Features

### Password Security
- Passwords are hashed using bcrypt with a salt factor of 12
- Minimum password length: 6 characters
- Password must contain at least one letter and one number

### Token Security
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Token rotation is implemented to prevent token reuse
- Invalid token attempts are logged and monitored

### Audit Logging
All login attempts are logged with:
- Timestamp
- IP Address
- User Agent
- Success/Failure status
- User details (for successful attempts)

## Token Usage

### Using Access Token
Include the access token in the Authorization header for protected routes:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refreshing Access Token
When the access token expires, use the refresh token to obtain a new one:

**POST** `/auth/refresh`

```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6..."
}
```

## Session Management

### Active Sessions
Get all active sessions for the logged-in teacher:

**GET** `/auth/sessions`

### Logout
Logout from current device:

**POST** `/auth/logout`

```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6..."
}
```

### Logout from All Devices
Logout from all devices:

**POST** `/auth/logout-all`

## Implementation Details

### Validation Rules
- **Email**: Must be valid email format, automatically normalized
- **Password**: Required field, no minimum length validation at login (creation has 6 char minimum)

### Error Handling
- Generic "Invalid credentials" message for both wrong email and wrong password (security best practice)
- All errors are logged for monitoring and debugging
- Failed login attempts are tracked for security monitoring

### Database Schema
The User model includes:
```javascript
{
  name: String,
  email: String, // unique
  password: String, // hashed
  role: String, // enum includes 'teacher'
  schoolId: ObjectId,
  isActive: Boolean, // default true
  passwordResetToken: String,
  passwordResetExpires: Date
}
```

## Testing the API

### Using curl
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.edu",
    "password": "password123"
  }'
```

### Using Postman
1. Set method to POST
2. Set URL to `http://localhost:3000/auth/login`
3. Set Body to raw JSON
4. Add the JSON request body
5. Click Send

## Common Issues and Solutions

### Issue: "Invalid credentials" with correct email/password
**Solution**: Check if the user account is active (`isActive: true`)

### Issue: Token expires quickly
**Solution**: Implement automatic token refresh using the refresh token endpoint

### Issue: Multiple login failures
**Solution**: Check audit logs for potential security issues or account lockouts

## Related Endpoints

- `POST /auth/register` - Register new school with admin
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user info
- `POST /auth/logout-all` - Logout from all devices
- `GET /auth/sessions` - Get active sessions

## Support

For technical support or questions about the Teacher Login API, please contact the development team or refer to the system documentation.
