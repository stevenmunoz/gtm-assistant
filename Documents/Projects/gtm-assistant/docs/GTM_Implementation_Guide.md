# GTM Implementation Guide
## Medallia User Context Script

### Overview
This guide provides step-by-step instructions for implementing the Medallia User Context script in Google Tag Manager (GTM).

### Prerequisites
- Access to Google Tag Manager container
- Admin permissions to create and publish tags
- Understanding of GTM interface and basic concepts

## Implementation Steps

### Step 1: Create Custom HTML Tag

1. **Navigate to GTM Dashboard**
   - Log into your Google Tag Manager account
   - Select the appropriate container

2. **Create New Tag**
   - Click "Tags" in the left sidebar
   - Click "New" button
   - Name the tag: `Medallia User Context Extraction`

3. **Configure Tag Type**
   - Click "Tag Configuration"
   - Select "Custom HTML"

4. **Add Script Code**
   Copy and paste the following code into the HTML field:

```html
<script>
(function() {
    'use strict';
    
    function extractMedalliaUserData() {
        try {
            // Extract user-consumer cookie
            const cookies = document.cookie.split(';');
            let userConsumerToken = null;
            
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'user-consumer') {
                    userConsumerToken = decodeURIComponent(value);
                    break;
                }
            }
            
            // Handle anonymous users (no cookie or empty cookie)
            if (!userConsumerToken || userConsumerToken.trim() === '') {
                return; // Silent graceful degradation
            }
            
            // Validate JWT structure (should have 3 parts separated by dots)
            const tokenParts = userConsumerToken.split('.');
            if (tokenParts.length !== 3) {
                // Malformed JWT token
                if (typeof console !== 'undefined' && console.warn && window.location.hostname === 'localhost') {
                    console.warn('GTM Medallia: Malformed JWT token structure');
                }
                return;
            }
            
            // Decode the payload (second part of JWT)
            let payload;
            try {
                const base64Payload = tokenParts[1];
                // Add padding if necessary for proper base64 decoding
                const paddedPayload = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4);
                const decodedPayload = atob(paddedPayload);
                payload = JSON.parse(decodedPayload);
            } catch (decodeError) {
                // Base64 decoding or JSON parsing failed
                if (typeof console !== 'undefined' && console.warn && window.location.hostname === 'localhost') {
                    console.warn('GTM Medallia: Failed to decode JWT payload', decodeError);
                }
                return;
            }
            
            // Extract required user fields
            const userData = {};
            const requiredFields = ['firstName', 'lastName', 'email', 'oktaUid'];
            
            for (const field of requiredFields) {
                if (payload.hasOwnProperty(field) && payload[field] !== null && payload[field] !== undefined) {
                    userData[field] = payload[field];
                }
            }
            
            // Only create window object if we have at least one field
            if (Object.keys(userData).length > 0) {
                window.medalliaUserData = userData;
                
                // Development logging
                if (typeof console !== 'undefined' && console.log && window.location.hostname === 'localhost') {
                    console.log('GTM Medallia: User data extracted successfully', userData);
                }
            }
            
        } catch (error) {
            // Silent error handling - don't break the UI
            if (typeof console !== 'undefined' && console.error && window.location.hostname === 'localhost') {
                console.error('GTM Medallia: Unexpected error during user data extraction', error);
            }
        }
    }
    
    // Execute the function
    extractMedalliaUserData();
    
})();
</script>
```

### Step 2: Configure Triggering

1. **Set Up Trigger**
   - Click "Triggering" section
   - Click the "+" button to create new trigger
   - Name: `Page View - All Pages - Early`

2. **Configure Trigger Type**
   - Select "Page View"
   - Choose "All Pages"

3. **Set Tag Priority (Important)**
   - In the tag configuration, go to "Advanced Settings"
   - Set "Tag firing priority" to `100` (high priority)
   - This ensures the script runs before other tags that might depend on the user data

### Step 3: Testing

1. **Enable Preview Mode**
   - Click "Preview" in GTM
   - Navigate to your website in the new tab

2. **Verify Tag Execution**
   - Check that the tag fires on page load
   - Open browser console and verify no errors
   - Check for `window.medalliaUserData` object

3. **Test Different Scenarios**
   - Test with authenticated users
   - Test with anonymous users (no cookie)
   - Verify silent failure for edge cases

### Step 4: Quality Assurance

#### Pre-Deployment Checklist
- [ ] Tag fires on all pages
- [ ] No JavaScript errors in console
- [ ] User data appears in `window.medalliaUserData` when authenticated
- [ ] Silent handling for anonymous users
- [ ] No performance impact on page load
- [ ] Medallia team can access the data

#### Expected Output Format
When successful, the script creates:
```javascript
window.medalliaUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    oktaUid: "00umcvicpP3rY3QqId7"
}
```

### Step 5: Production Deployment

1. **Submit Changes**
   - Exit preview mode
   - Click "Submit" in GTM
   - Add version name: `Medallia User Context v1.0`
   - Add description of changes

2. **Publish Container**
   - Review changes summary
   - Click "Publish"

### Step 6: Post-Deployment Verification

1. **Monitor for 24-48 Hours**
   - Check for JavaScript errors in production
   - Verify Medallia integration works correctly
   - Monitor page load performance

2. **Coordinate with Medallia Team**
   - Confirm they can access `window.medalliaUserData`
   - Validate user context enrichment is working
   - Address any integration issues

## Troubleshooting

### Common Issues

#### 1. Tag Not Firing
**Symptoms**: No `window.medalliaUserData` object created
**Solutions**:
- Check trigger configuration
- Verify tag priority settings
- Check for JavaScript errors blocking execution

#### 2. Empty User Data Object
**Symptoms**: `window.medalliaUserData` exists but is empty
**Solutions**:
- Verify `user-consumer` cookie exists and contains valid JWT
- Check cookie domain and path settings
- Validate JWT structure and payload

#### 3. Console Errors (Development Only)
**Symptoms**: Warnings or errors in localhost console
**Solutions**:
- Check JWT token format and encoding
- Verify base64 payload structure
- Validate JSON structure of decoded payload

### Debug Commands

Run these in browser console for debugging:

```javascript
// Check if user data exists
console.log('Medallia User Data:', window.medalliaUserData);

// Check cookie value
document.cookie.split(';').find(c => c.trim().startsWith('user-consumer'));

// Manual JWT decode test
const token = 'your-jwt-token-here';
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Decoded payload:', payload);
```

## Performance Considerations

- Script execution time: < 10ms typically
- No external dependencies
- Synchronous execution ensures data availability
- Minimal DOM interaction
- Error handling prevents UI blocking

## Security Notes

- No JWT signature validation (as specified in PRD)
- Development logging only on localhost
- No sensitive data logged to console in production
- Read-only cookie access
- Graceful degradation for all error scenarios

## Maintenance

### Regular Tasks
- Monitor GTM container for conflicts
- Check for JWT token structure changes
- Review error logs periodically
- Coordinate with Medallia team for updates

### Version Updates
- Update version number in tag name
- Document changes in GTM submission notes
- Test thoroughly in preview mode
- Coordinate deployment with stakeholders

---

**Contact Information**
- Implementation: [Your Team]
- GTM Access: [GTM Admin Contact]
- Medallia Integration: [Medallia Team Contact]