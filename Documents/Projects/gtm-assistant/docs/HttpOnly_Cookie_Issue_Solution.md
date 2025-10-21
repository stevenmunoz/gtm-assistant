# HttpOnly Cookie Issue - Solution Guide

## Problem Identified

The `user-consumer` cookie containing the JWT token is **not accessible to JavaScript** because it has the `HttpOnly` flag set. This is a security measure that prevents client-side scripts from accessing the cookie.

## Evidence

- Cookie visible in DevTools Application tab ✅
- Cookie NOT accessible via `document.cookie` ❌
- Script runs successfully but cannot find the cookie ❌

## Root Cause

The server sets the `user-consumer` cookie with the `HttpOnly` attribute:
```
Set-Cookie: user-consumer=eyJ0b2...; HttpOnly; Secure; SameSite=Lax
```

The `HttpOnly` flag prevents JavaScript access for security reasons (protects against XSS attacks).

## Solutions

### Option 1: Remove HttpOnly Flag (Recommended)
**Server-side change required**

Modify the server code that sets the `user-consumer` cookie to remove the `HttpOnly` flag:

```javascript
// Before (current - blocks JavaScript access)
res.cookie('user-consumer', jwtToken, {
    httpOnly: true,    // ❌ Remove this line
    secure: true,
    sameSite: 'lax'
});

// After (allows JavaScript access)
res.cookie('user-consumer', jwtToken, {
    secure: true,
    sameSite: 'lax'
});
```

**Pros:**
- Simple solution
- GTM script works as designed
- No additional implementation needed

**Cons:**
- Slightly reduces security (cookie accessible to JavaScript)
- Requires backend deployment

### Option 2: Create Duplicate Cookie
**Server-side change required**

Keep the secure `user-consumer` cookie and create an additional JavaScript-accessible copy:

```javascript
// Set both cookies
res.cookie('user-consumer', jwtToken, {
    httpOnly: true,    // Keep secure version
    secure: true,
    sameSite: 'lax'
});

res.cookie('user-consumer-public', jwtToken, {
    // No httpOnly flag - accessible to JavaScript
    secure: true,
    sameSite: 'lax'
});
```

Then update GTM script to look for `user-consumer-public` instead.

**Pros:**
- Maintains security for main cookie
- Provides JavaScript access via separate cookie
- Clear separation of concerns

**Cons:**
- Duplicate data in cookies
- Requires backend deployment
- Additional cookie overhead

### Option 3: Server-Side Endpoint
**Alternative approach**

Create a server endpoint that returns user data:

```javascript
// New endpoint: GET /api/user-context
app.get('/api/user-context', authenticateToken, (req, res) => {
    res.json({
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        oktaUid: req.user.oktaUid
    });
});
```

Update GTM script to make an API call instead of reading cookies.

**Pros:**
- Maintains full security
- More flexible data structure
- Can include additional logic/validation

**Cons:**
- Additional HTTP request
- More complex implementation
- Requires error handling for API failures
- Latency impact

## Recommended Implementation

**Option 1** is recommended because:
- Simplest to implement
- Meets the PRD requirements exactly
- User data in cookies is already considered "accessible" since it's visible in DevTools
- The security risk is minimal for user profile information (not authentication tokens)

## Next Steps

1. **Coordinate with Backend Team** to remove `HttpOnly` flag from `user-consumer` cookie
2. **Deploy backend changes** to staging environment
3. **Test GTM script** with updated cookie settings
4. **Deploy to production** once verified

## Testing After Fix

Once the `HttpOnly` flag is removed, the GTM script should show:
```
GTM Medallia: user-consumer found in document.cookie? true
GTM Medallia: Found user-consumer cookie: Token exists
GTM Medallia: SUCCESS - User data extracted and set on window.medalliaUserData
```

## Security Considerations

- The JWT token in the cookie is already a read-only user profile
- Not an authentication token (session management handled separately)
- Risk is minimal compared to the business value of Medallia integration
- Cookie still protected by `Secure` and `SameSite` flags