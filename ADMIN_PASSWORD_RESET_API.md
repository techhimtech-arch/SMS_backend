# Admin Password Reset API Documentation

## Overview
This API allows school administrators to reset passwords for other users within their school. This is useful for account recovery, security management, and administrative password management.

## Endpoint
```
PATCH /api/v1/users/{userId}/reset-password
```

## Authentication
- **Required**: Bearer token authentication
- **Role Required**: `school_admin`
- **Scope**: Only users from the same school can be managed

## Request

### Headers
```json
{
  "Authorization": "Bearer YOUR_ADMIN_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### URL Parameters
- `userId` (string, required): The MongoDB ObjectId of the user whose password needs to be reset

### Request Body
```json
{
  "newPassword": "NewSecurePass123"
}
```

### Password Requirements
- Minimum 6 characters
- Maximum 128 characters
- Must contain at least:
  - 1 uppercase letter (A-Z)
  - 1 lowercase letter (a-z)
  - 1 number (0-9)

## Response

### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "newPassword",
      "message": "Password must be at least 6 characters with uppercase, lowercase, and number",
      "value": "weak"
    }
  ]
}
```

#### 400 Bad Request - Self Password Reset Attempt
```json
{
  "success": false,
  "message": "Use change-password endpoint to update your own password"
}
```

#### 401 Unauthorized - Invalid/Missing Token
```json
{
  "success": false,
  "message": "Access token is required"
}
```

#### 403 Forbidden - Insufficient Permissions
```json
{
  "success": false,
  "message": "Access denied. User belongs to different school."
}
```

#### 404 Not Found - User Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to reset password",
  "error": "Detailed error message"
}
```

## Security Features

### Access Control
- ✅ Only `school_admin` role can access this endpoint
- ✅ Admins can only reset passwords of users from their own school
- ✅ Admins cannot reset their own password through this endpoint (must use `/change-password`)

### Audit Logging
- ✅ All password reset actions are logged with:
  - Admin user ID who performed the reset
  - Target user ID whose password was reset
  - Target user email
  - Timestamp of the action

### Password Security
- ✅ Passwords are hashed using bcrypt with salt rounds of 12
- ✅ Strong password validation enforced
- ✅ No password history or reuse restrictions (can be added if needed)

## Usage Examples

### JavaScript (Frontend)
```javascript
// Reset a teacher's password
const resetPassword = async (userId, newPassword) => {
  try {
    const response = await fetch(`/api/v1/users/${userId}/reset-password`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newPassword: newPassword
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('Password reset successful');
      // Show success message to admin
    } else {
      console.error('Password reset failed:', result.message);
      // Show error message to admin
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Usage
resetPassword('64f1a2b3c4d5e6f7g8h9i0j1', 'TeacherNewPass123');
```

### cURL Command
```bash
curl -X PATCH \
  "http://localhost:5000/api/v1/users/64f1a2b3c4d5e6f7g8h9i0j1/reset-password" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewSecurePass123"
  }'
```

### Postman Request
```
Method: PATCH
URL: {{BASE_URL}}/api/v1/users/{{USER_ID}}/reset-password

Headers:
- Authorization: Bearer {{ADMIN_JWT_TOKEN}}
- Content-Type: application/json

Body (raw JSON):
{
  "newPassword": "NewSecurePass123"
}
```

## Implementation Details

### Controller Function
Located in: `src/controllers/improvedUserController.js`
Function: `adminResetPassword`

### Route Definition
Located in: `src/routes/improvedUserRoutes.js`
Route: `router.patch('/:id/reset-password', authMiddleware, authorizeRoles('school_admin'), adminResetPassword)`

### Validation
- User ID validation (MongoDB ObjectId format)
- Password strength validation
- School access validation
- Self-reset prevention

## Testing Checklist

### Positive Test Cases
- ✅ Admin can reset teacher password
- ✅ Admin can reset accountant password
- ✅ Admin can reset parent password
- ✅ Admin can reset student password
- ✅ Password meets all requirements
- ✅ Proper success response returned

### Negative Test Cases
- ❌ Non-admin user cannot access endpoint
- ❌ Admin cannot reset password of user from different school
- ❌ Admin cannot reset their own password
- ❌ Invalid user ID format
- ❌ Weak password (too short, missing requirements)
- ❌ Missing authentication token
- ❌ User not found

## Related Endpoints

### Change Own Password
```
PATCH /api/v1/users/change-password
```
Allows users to change their own password (requires current password)

### User Management
```
GET /api/v1/users - List all users
GET /api/v1/users/{id} - Get user details
PUT /api/v1/users/{id} - Update user info
DELETE /api/v1/users/{id} - Delete user
```

## Notes

1. **Password Communication**: After resetting a password, inform the user of their new password through secure means (email, SMS, or in-person).

2. **Temporary Passwords**: Consider using this API to set temporary passwords that users must change on first login.

3. **Rate Limiting**: Consider implementing rate limiting to prevent abuse of this endpoint.

4. **Password Policy**: The current implementation enforces basic password requirements. Additional policies (password history, expiration) can be added as needed.

5. **Audit Compliance**: All password reset actions are logged for security and compliance purposes.

---

**Last Updated**: April 1, 2026
**Version**: 1.0
**API Version**: v1