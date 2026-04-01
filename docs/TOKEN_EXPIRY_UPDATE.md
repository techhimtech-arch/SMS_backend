# JWT Token Expiry Configuration Update

## Overview
Updated JWT token expiry from 7 days to 10 days for better user experience while maintaining security best practices.

## Changes Made

### 1. Refresh Token Expiry
**File:** `src/services/authService.js`
**Change:** `REFRESH_TOKEN_EXPIRY_DAYS = 7` → `REFRESH_TOKEN_EXPIRY_DAYS = 10`

### 2. Legacy Token Expiry
**File:** `src/services/authService.js`
**Change:** `{ expiresIn: '7d' }` → `{ expiresIn: '10d' }`

## Current Token Configuration

### Access Tokens
- **Expiry:** 15 minutes (`15m`)
- **Purpose:** Short-lived tokens for API access
- **Security:** Very short expiry for maximum security
- **Refresh:** Automatically refreshed using refresh tokens

### Refresh Tokens
- **Expiry:** 10 days (updated from 7 days)
- **Purpose:** Long-lived tokens to obtain new access tokens
- **Storage:** Database-backed with device tracking
- **Security:** Token rotation, family-based revocation

## Security Analysis: 10 Days Expiry

### ✅ **Advantages**
1. **Better UX:** Users stay logged in longer, less frequent logins
2. **Reduced Server Load:** Fewer authentication requests
3. **Convenience:** Especially good for mobile users and teachers

### ⚠️ **Security Considerations**
1. **Extended Attack Window:** If refresh token compromised, attacker has 10 days access
2. **Device Management:** Important to have "Logout from all devices" feature
3. **Token Rotation:** Already implemented - mitigates some risks

### 🛡️ **Security Measures in Place**
- ✅ **Token Rotation:** New refresh token issued on each use
- ✅ **Device Tracking:** IP address and user agent monitoring
- ✅ **Family-based Revocation:** Can revoke all tokens from a family
- ✅ **Logout All Devices:** Admin can force logout everywhere
- ✅ **Automatic Revocation:** On suspicious activity
- ✅ **Short Access Tokens:** 15-minute expiry for API calls

## Impact Assessment

### User Experience
- **Before:** Users needed to login every ~7 days
- **After:** Users stay logged in for ~10 days
- **Mobile Apps:** Much better experience
- **Web Apps:** Less frequent authentication prompts

### Security Impact
- **Risk Level:** Low to Medium (acceptable with current safeguards)
- **Mitigation:** Existing security features provide adequate protection
- **Monitoring:** All token activities are logged for audit

### Server Performance
- **Authentication Requests:** ~30% reduction (3 fewer days of logins per user)
- **Database Load:** Slight reduction in token validation queries
- **API Performance:** No significant impact

## Recommendations

### ✅ **Proceed with 10 Days**
The 10-day expiry is reasonable and provides good balance between:
- User convenience
- Security requirements
- Operational efficiency

### 📋 **Additional Security Measures**
1. **Monitor Token Usage:** Implement dashboards for suspicious activity
2. **User Education:** Teach users about "Logout from all devices"
3. **Regular Audits:** Review token usage patterns
4. **IP-based Restrictions:** Consider geographic access controls

### 🔧 **Implementation Notes**
- **Backward Compatibility:** Existing tokens will expire at their original time
- **New Sessions:** All new logins will use 10-day expiry
- **Migration:** No database migration required
- **Testing:** Test login/logout flows thoroughly

## Testing Checklist

### Functional Testing
- [ ] User can login normally
- [ ] Access tokens refresh automatically
- [ ] Refresh tokens work for 10 days
- [ ] Logout functionality works
- [ ] Logout from all devices works
- [ ] Token rotation works correctly

### Security Testing
- [ ] Token reuse detection works
- [ ] Family-based revocation works
- [ ] IP monitoring logs correctly
- [ ] Suspicious activity triggers alerts

### Performance Testing
- [ ] Authentication endpoints handle load
- [ ] Token validation performance
- [ ] Database queries optimized

## Rollback Plan
If issues arise, rollback is simple:
1. Change `REFRESH_TOKEN_EXPIRY_DAYS = 10` back to `7`
2. Change `{ expiresIn: '10d' }` back to `'7d'`
3. Restart application
4. Existing tokens will continue until their natural expiry

## Conclusion
**Recommendation: ✅ APPROVE 10-day token expiry**

The change provides significant user experience improvements with acceptable security trade-offs, given the robust security measures already in place.

---

**Change Date:** April 1, 2026
**Effective:** Immediately for new sessions
**Risk Level:** Low
**Business Impact:** High (better UX)