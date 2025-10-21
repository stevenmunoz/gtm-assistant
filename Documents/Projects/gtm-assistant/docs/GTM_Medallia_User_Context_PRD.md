# Product Requirements Document (PRD)
## GTM Script for Medallia User Context Enrichment

### 1. Overview

**Project Name**: GTM User Context Extraction for Medallia Integration  
**Version**: 1.0  
**Date**: September 8, 2025  
**Owner**: Steven Munoz  

### 2. Problem Statement

The Medallia team requires user context information to enrich user feedback and analytics. Currently, user data is stored in a JWT token within the `user-consumer` cookie but is not accessible to Medallia's tracking scripts in a structured format.

### 3. Solution Overview

Implement a Google Tag Manager (GTM) script that:
- Extracts and decodes the JWT token from the `user-consumer` cookie
- Parses user information from the token payload
- Injects structured user data into a global window object for Medallia consumption

### 4. Functional Requirements

#### 4.1 Core Functionality
- **FR-1**: Extract JWT token from `user-consumer` cookie
- **FR-2**: Base64 decode the JWT payload (second segment)
- **FR-3**: Parse JSON payload to extract user fields
- **FR-4**: Create `window.medalliaUserData` object with required fields
- **FR-5**: Execute on page load via GTM trigger

#### 4.2 Data Extraction Requirements
The script must extract the following fields from the JWT payload:
- `firstName` (string)
- `lastName` (string)  
- `email` (string)
- `oktaUid` (string)

#### 4.3 Output Format
```javascript
window.medalliaUserData = {
    firstName: "Alekhya",
    lastName: "Dandamudi", 
    email: "utest6904+multibill4@gmail.com",
    oktaUid: "00umcvicpP3rY3QqId7"
}
```

### 5. Non-Functional Requirements

#### 5.1 Performance
- **NFR-1**: Script execution time < 50ms
- **NFR-2**: Minimal impact on page load performance
- **NFR-3**: Synchronous execution to ensure data availability for subsequent scripts

#### 5.2 Reliability
- **NFR-4**: Graceful error handling - no UI breaking errors
- **NFR-5**: Silent failure for anonymous users (missing cookie)
- **NFR-6**: Fallback handling for malformed tokens

#### 5.3 Security
- **NFR-7**: No sensitive data logging to console in production
- **NFR-8**: JWT decoding only (no signature validation required)

### 6. Error Handling Requirements

#### 6.1 Anonymous Users
- **EH-1**: When `user-consumer` cookie is missing/empty:
  - Do not create `window.medalliaUserData` object
  - No console errors or warnings
  - Silent graceful degradation

#### 6.2 Invalid Token Scenarios
- **EH-2**: Malformed JWT token (not 3 segments):
  - Log warning to console (development only)
  - Do not create window object
  - Continue script execution

#### 6.3 Decoding Errors
- **EH-3**: Base64 decoding failures:
  - Catch and handle decode exceptions
  - Do not create window object
  - Log error for debugging (development only)

#### 6.4 Missing Fields
- **EH-4**: When required fields are missing from payload:
  - Create window object with available fields only
  - Set missing fields as `null` or omit them

### 7. Technical Specifications

#### 7.1 GTM Implementation
- **Tag Type**: Custom HTML Tag
- **Trigger**: Page View - All Pages
- **Priority**: High (execute early)

#### 7.2 JavaScript Requirements
```javascript
// Pseudo-code structure
function extractUserData() {
    try {
        // Extract cookie
        // Decode JWT
        // Parse payload
        // Create window object
    } catch (error) {
        // Silent error handling
    }
}
```

#### 7.3 Dependencies
- No external libraries required
- Pure vanilla JavaScript implementation
- Browser native APIs only (document.cookie, atob, JSON.parse)

### 8. Testing Requirements

#### 8.1 Test Scenarios
- **TS-1**: Valid JWT token with all required fields
- **TS-2**: Anonymous user (no cookie)
- **TS-3**: Empty cookie value
- **TS-4**: Malformed JWT token
- **TS-5**: Invalid Base64 in JWT payload
- **TS-6**: Valid JWT with missing user fields
- **TS-7**: JWT with extra/unexpected fields

#### 8.2 Success Criteria
- All test scenarios handle gracefully without UI errors
- Medallia team can consistently access user data when available
- No performance degradation on page load

### 9. Implementation Timeline

- **Phase 1**: Script development and unit testing (2 days)
- **Phase 2**: GTM integration and staging testing (1 day)  
- **Phase 3**: UAT with Medallia team (1 day)
- **Phase 4**: Production deployment (1 day)

### 10. Success Metrics

- Zero JavaScript errors in production
- 100% uptime for user data extraction (when cookie exists)
- Successful Medallia integration with user context enrichment
- Page load performance impact < 10ms

### 11. Assumptions and Constraints

#### 11.1 Assumptions
- JWT token structure remains consistent
- `user-consumer` cookie name remains unchanged
- Required fields are consistently present in authenticated user tokens

#### 11.2 Constraints
- Must not break existing functionality
- Cannot modify existing authentication flow
- Read-only access to cookie data

### 12. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| JWT structure changes | High | Version the script, monitor for changes |
| Cookie domain issues | Medium | Test across all environments |
| Performance impact | Low | Implement performance monitoring |

---

**Next Steps**: Proceed with implementing the actual GTM script based on this PRD.