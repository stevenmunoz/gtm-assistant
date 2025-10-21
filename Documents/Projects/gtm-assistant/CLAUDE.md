# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GTM (Google Tag Manager) scripts repository for a rental vehicle platform. All scripts are designed to be deployed as Custom HTML tags in GTM and execute in the browser. The codebase consists of standalone JavaScript files that track user interactions, modify UI elements, and manage user context for analytics purposes.

## Architecture

### Script Deployment Model
- All scripts are deployed as **Custom HTML tags in Google Tag Manager**
- Scripts execute in the browser as inline `<script>` tags
- No build process or bundling required
- Each script is self-contained with its own dependencies
- Scripts use ES5 JavaScript for maximum browser compatibility

### Data Flow Architecture

```
Browser Page Load
    ↓
GTM Container Loads
    ↓
Custom HTML Tags Fire (by priority/trigger)
    ↓
Scripts Execute:
    - Extract user data (window.oktaUid, cookies, localStorage)
    - Attach DOM event listeners (click, submit, etc.)
    - Monitor for UI changes (MutationObserver)
    ↓
User Interactions Occur
    ↓
Events Pushed to window.dataLayer
    ↓
GTM Processes Events → Analytics Platforms
```

### Key Global Variables
Scripts rely on and populate these global browser variables:
- `window.dataLayer` - GTM data layer for event tracking
- `window.oktaUid` - Authenticated user's Okta ID (set by application)
- `window.medalliaUserData` - User context for Medallia (set by user-context scripts)
- `localStorage['okta-token-storage-consumer']` - JWT token storage

### Common Patterns

#### 1. Event Tracking Pattern
Most analytics scripts follow this structure:
```javascript
// 1. Configuration object
var CONFIG = {
    EVENT_NAME: 'event_name',
    ELEMENTS: { /* testid mappings */ }
};

// 2. Event handlers that push to dataLayer
function handleEvent() {
    dataLayer.push({
        'event': CONFIG.EVENT_NAME,
        'element_click': 'button_name',
        'user_id': window.oktaUid || 'none'
    });
}

// 3. Attach listeners when DOM ready
document.addEventListener('click', function(event) {
    // Check data-testid attribute
    // Push event to dataLayer
});
```

#### 2. DOM Element Targeting
All scripts use `data-testid` attributes to target elements reliably:
```javascript
var element = document.querySelector('[data-testid="button_name"]');
```
This convention prevents breaking changes when CSS classes change.

#### 3. User Authentication Detection
```javascript
var userType = window.oktaUid ? 'authenticated' : 'not-authenticated';
```

#### 4. JWT Token Extraction
See utilities/jwt.js for the standard pattern of:
- Reading from localStorage['okta-token-storage-consumer']
- Base64 decoding the payload section
- Extracting email/user data

## Project Structure

- **analytics/** - Event tracking scripts that push to dataLayer
  - `tracking/` - Multi-step form tracking (rental orders, applications, registration)
  - `rental-agreements/` - Tab interaction tracking for rental agreements
  - `products/` - Product-related event tracking

- **ui-modifications/** - Scripts that modify DOM/UI behavior
  - `navigation/` - Header menu click tracking
  - `forms/` - Form field modifications
  - `buttons/` - Show/hide button logic
  - `banners/` - Banner interaction tracking
  - `reservations/` - Repeat rental/reservation flows

- **user-context/** - Scripts that extract and expose user identity
  - `gtm-medallia-user-context.js` - Decodes JWT from cookies, sets window.medalliaUserData
  - `ecid-capture.js` - Experience Cloud ID capture

- **utilities/** - Reusable helper scripts
  - `jwt.js` - JWT decoding from localStorage

- **archived/** - Old versions kept for reference (do not use)
- **testing/** - Test scripts and HTML test pages
- **templates/** - HTML email templates and visualizations
- **data/** - JSON configuration files
- **docs/** - Implementation guides and PRDs

## Key Implementation Details

### Rental Order Tracking (analytics/tracking/rental-order-tracking.js)
This is the most complex tracking script with multi-step form tracking:
- **Step 1**: Search location form (`form#search-location`)
- **Step 2**: Select location form (`form#select-location`)
- **Step 3**: Confirmation page (checks URL for `/confirmation`)

Key features:
- Calculates lead time (hours from now to pickup)
- Calculates rental duration (pickup to dropoff hours)
- Stores form values across page navigations
- Single confirmation event per session (confirmationEventSent flag)
- Integrates with `getRyderEventProps()` if available

### User Context Integration (user-context/gtm-medallia-user-context.js)
Extracts user data from `user-consumer` JWT cookie:
```javascript
// Sets window.medalliaUserData with:
{
    firstName: "...",
    lastName: "...",
    email: "...",
    oktaUid: "..."
}
```

**Important**: This script should have high GTM tag priority (100+) to run before other tags that depend on user context.

**Known Issue**: If the cookie has HttpOnly flag, JavaScript cannot access it. See docs/HttpOnly_Cookie_Issue_Solution.md.

### UI Modifications
Scripts in ui-modifications/ typically use MutationObserver to handle dynamically loaded content:
```javascript
var observer = new MutationObserver(function(mutations) {
    // React to DOM changes
});
observer.observe(document.body, { childList: true, subtree: true });
```

## Working with This Codebase

### Adding New Tracking Scripts
1. Place in appropriate analytics/ subdirectory
2. Follow the CONFIG object pattern for maintainability
3. Use data-testid attributes for element targeting
4. Include user_id from window.oktaUid in events
5. Handle both authenticated and anonymous users
6. Add defensive checks (element existence, null values)

### Modifying Existing Scripts
1. Check if script is in archived/ (if so, do not modify)
2. Test with both authenticated and anonymous users
3. Verify events appear in GTM Preview mode
4. Ensure ES5 compatibility (no arrow functions, const/let, etc.)

### Testing Scripts Locally
1. Use files in testing/ folder as starting points
2. Create HTML page that simulates the target environment
3. Include GTM container or mock window.dataLayer
4. Check browser console for errors and dataLayer events

### GTM Deployment
Reference docs/GTM_Implementation_Guide.md for:
- Creating Custom HTML tags
- Setting tag priorities
- Configuring triggers
- Testing in Preview mode
- Publishing workflow

### Common Pitfalls
1. **HttpOnly cookies**: JWT cookies with HttpOnly flag cannot be read by JavaScript
2. **Timing issues**: Use DOMContentLoaded or MutationObserver for dynamic content
3. **Multiple event firing**: Use flags like `confirmationEventSent` to prevent duplicates
4. **Browser compatibility**: Stick to ES5, avoid modern JS features
5. **Data-testid changes**: If QA updates testids, scripts will break - coordinate changes

## File Naming Conventions

- Use kebab-case for all files: `rental-order-tracking.js`
- Suffix with category when needed: `-tracking.js`, `-error.js`
- Archived files retain original names for traceability
- HTML test files: `test-*.html` or `*-test.html`

## Documentation

- **docs/GTM_Implementation_Guide.md** - Step-by-step GTM deployment
- **docs/GTM_Medallia_User_Context_PRD.md** - User context requirements
- **docs/HttpOnly_Cookie_Issue_Solution.md** - Cookie access issues
- **README.md** - Directory structure and file descriptions
