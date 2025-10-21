# ECID Cross-Domain Tracking PRD
## Experience Cloud ID (ECID) Stitching Between One Ryder and Phoenix Rental Platform

### Document Version
**Version:** 1.1
**Last Updated:** October 20, 2025
**Status:** In Implementation

**Related Documents:**
- [Email Campaign Tracking Guide](./Email_Campaign_Tracking_Guide.md) - Email parameter capture (added v1.1)

---

## Executive Summary

This PRD documents the implementation of cross-domain tracking to stitch user journeys between Ryder properties:
- **One Ryder** (www.ryder.com) → Phoenix: ECID parameter for cross-domain stitching
- **Email Campaigns** (Eloqua) → Phoenix: Email campaign parameters for attribution
- **Phoenix Rental Platform** (rentals.ryder.com) - Captures all parameters and passes to analytics

The tracking system captures ECID from One Ryder exit links and email campaign parameters from Rental Onboarding emails, persisting both throughout the Phoenix session for comprehensive user journey analysis.

---

## Problem Statement

### Current State
- One Ryder (www.ryder.com) and Phoenix Rental Platform (rentals.ryder.com) operate as separate domains
- User journeys from marketing pages to rental bookings cannot be tracked across domains
- Analytics teams cannot measure conversion paths from awareness to booking
- Attribution data is incomplete for users who start on One Ryder and complete rentals on Phoenix

### Desired State
- ECID is appended to all exit links from One Ryder to Phoenix Rental Platform
- Phoenix captures and persists ECID throughout the user session
- All analytics events on Phoenix include ECID as a dimension
- Analytics teams can stitch user journeys across both domains using ECID

---

## Scope

### In Scope - Phase 1 (Current Test)
1. **One Ryder Pages:**
   - Existing Customer page - "Get Started" CTA exit link
   - Customer Tools section CTAs linking to rentals.ryder.com

2. **Email Campaigns:** *(Added v1.1)*
   - Rental Onboarding Email Series (4 emails)
   - Email campaign parameter capture (sfid, CTA, utm_*, elq*)
   - Eloqua tracking parameter persistence

3. **Phoenix Rental Platform:**
   - ECID capture from URL parameter
   - Email parameter capture from URL (13 parameters)
   - All parameters persist across session via sessionStorage
   - ECID + email parameters included in all GTM events

### Future Scope - Phase 2
- Expand ECID appending to all exit links across One Ryder
- Enable ECID tracking for all prospect/customer journeys
- Cross-domain reporting and attribution models

### Out of Scope
- ECID generation/management (handled by Adobe Experience Cloud)
- Changes to Adobe Analytics configuration
- Retrospective data stitching

---

## User Flows

### Primary User Journey

```
1. User lands on One Ryder (www.ryder.com/en-us/rent-trucks/existing-customer)
   ↓
2. User clicks "Get Started" CTA
   ↓
3. One Ryder appends ECID to exit link
   Example: https://rentals.ryder.com/?ecid=MCMID|12345678901234567890
   ↓
4. User arrives on Phoenix Rental Platform (rentals.ryder.com)
   ↓
5. GTM Custom JavaScript Variable "CJS - ECID Capture" executes:
   - Checks URL for ?ecid= parameter
   - If not in URL, checks document.referrer for ecid parameter
   - Stores ECID in sessionStorage as 'gtm_ecid'
   - Returns ECID value
   ↓
6. User navigates through rental booking flow
   ↓
7. All analytics events fire with ECID dimension
   - Via "Google Tag Event Setting" variable
   - ECID parameter: {{CJS - ECID Capture}}
   ↓
8. Analytics platforms receive events with ECID for cross-domain stitching
```

---

## Technical Implementation

### One Ryder Side (www.ryder.com)
**Owner:** Anusha (Adswerve)
**Status:** ✅ Completed

#### Implementation Details
- Modified exit link CTAs on Existing Customer page
- Appends ECID parameter to href attributes targeting rentals.ryder.com
- Exit link format: `https://rentals.ryder.com/?ecid={ECID_VALUE}`

#### Test Pages
1. **Existing Customer Page:**
   - URL: `https://www.ryder.com/en-us/rent-trucks/existing-customer`
   - CTA: "Get Started" button
   - Exit Link: `https://rentals.ryder.com/?ecid=...`

2. **Customer Tools Section:**
   - CTAs linking to rental platform
   - All include ECID parameter

---

### Phoenix Rental Platform Side (rentals.ryder.com)
**Owner:** Internal Team
**Status:** 🔄 In Implementation

#### GTM Custom JavaScript Variable: "CJS - ECID Capture"

**Variable Type:** Custom JavaScript
**Variable Name:** `CJS - ECID Capture`

**Code Implementation:**
```javascript
function() {
  // Get the current URL parameters
  var urlParams = new URLSearchParams(window.location.search);

  // Check if ecid parameter exists in current URL
  var ecid = urlParams.get('ecid');

  // If not found in current URL, check document.referrer
  if (!ecid && document.referrer) {
    try {
      var referrerUrl = new URL(document.referrer);
      var referrerParams = new URLSearchParams(referrerUrl.search);
      ecid = referrerParams.get('ecid');
    } catch (e) {
      // Handle invalid referrer URL
      ecid = null;
    }
  }

  // Store in sessionStorage for persistence across pages
  if (ecid) {
    sessionStorage.setItem('gtm_ecid', ecid);
    return String(ecid);
  }

  // If no ecid found, try to retrieve from sessionStorage
  var storedEcid = sessionStorage.getItem('gtm_ecid');
  return storedEcid ? String(storedEcid) : undefined;
}
```

**Logic Flow:**
1. **Check Current URL** - Parse `?ecid=` parameter from window.location.search
2. **Check Referrer URL** - If not in current URL, check document.referrer
3. **Persist to Session** - Store in sessionStorage as 'gtm_ecid'
4. **Return Value** - Return ECID string or undefined

**Persistence Strategy:**
- Uses sessionStorage for cross-page persistence
- ECID available throughout entire user session
- Survives page navigation and form submissions
- Clears when browser tab/window closes

---

#### GTM Event Settings Variable: "Google Tag Event Setting"

**Variable Type:** Google Tag: Event Settings
**Variable Name:** `Google Tag Event Setting`

**Event Parameters:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| `link_text` | `{{Click Text}}` | Text of clicked element |
| `link_url` | `{{Click URL}}` | URL of clicked link |
| `gtm_info` | `{{Container ID}}: Version ID: {{Container Version}}` | GTM container info |
| `hit_timestamp` | `{{CJS - Hit Timestamp}}` | Event timestamp |
| `ga4_session_id` | `{{GA4 Session ID}}` | GA4 session identifier |
| `ga4_user_pseudo_id` | `{{GA4 User Pseudo-ID}}` | GA4 user identifier |
| **`ecid`** | **`{{CJS - ECID Capture}}`** | **Experience Cloud ID** |

**References:**
- Used by: `[Both] GA4 Tag Configuration` (Tag)
- Applied to: All GA4 events fired on Phoenix platform

**Effect:**
- Every analytics event sent from Phoenix includes ECID dimension
- Enables cross-domain user journey stitching in reporting
- ECID available in GA4, Adobe Analytics, and other connected platforms

---

## Data Schema

### ECID Parameter Format
- **Parameter Name:** `ecid`
- **Format:** String (Adobe MCMID format)
- **Example:** `MCMID|12345678901234567890`
- **Source:** Adobe Experience Cloud ID Service
- **Passed Via:** URL query parameter

### Storage Locations

| Location | Key | Value | Lifetime | Purpose |
|----------|-----|-------|----------|---------|
| URL Parameter | `ecid` | ECID string | One-time | Cross-domain transfer |
| sessionStorage | `gtm_ecid` | ECID string | Session | Persistence across pages |
| GTM Variable | `{{CJS - ECID Capture}}` | ECID string | Per-page | Event parameter injection |
| Analytics Events | `ecid` | ECID string | Per-event | Reporting dimension |

---

## Testing Plan

### Test Environment
- **One Ryder Test URL:** `https://www.ryder.com/en-us/rent-trucks/existing-customer`
- **Phoenix Test URL:** `https://rentals.ryder.com/`
- **Testing Tool:** GTM Preview Mode + Browser DevTools

### Test Scenarios

#### Test 1: ECID Parameter Appended on One Ryder
**Steps:**
1. Navigate to Existing Customer page
2. Inspect "Get Started" CTA href attribute
3. Verify ECID parameter is present

**Expected Result:**
```html
<a href="https://rentals.ryder.com/?ecid=MCMID|12345678901234567890">Get Started</a>
```

**Status:** ✅ Completed by Anusha (Adswerve)

---

#### Test 2: ECID Captured on Phoenix Landing
**Steps:**
1. Click "Get Started" CTA from One Ryder
2. Land on Phoenix (rentals.ryder.com)
3. Open GTM Preview Mode
4. Check "CJS - ECID Capture" variable value
5. Open DevTools → Application → Session Storage
6. Verify `gtm_ecid` key exists with ECID value

**Expected Results:**
- GTM Variable `{{CJS - ECID Capture}}` = ECID string
- sessionStorage['gtm_ecid'] = ECID string
- Console log (if debugging enabled): "ECID captured: MCMID|12345678901234567890"

**Validation:**
```javascript
// Run in browser console
console.log('GTM ECID Variable:', {{CJS - ECID Capture}});
console.log('sessionStorage ECID:', sessionStorage.getItem('gtm_ecid'));
console.log('URL ECID:', new URLSearchParams(window.location.search).get('ecid'));
```

---

#### Test 3: ECID Persists Across Pages
**Steps:**
1. Land on Phoenix with ECID parameter
2. Navigate to vehicle selection page
3. Navigate to booking form page
4. Check sessionStorage on each page

**Expected Result:**
- sessionStorage['gtm_ecid'] persists across all pages
- `{{CJS - ECID Capture}}` returns same value on every page

---

#### Test 4: ECID Included in Analytics Events
**Steps:**
1. Land on Phoenix with ECID parameter
2. Trigger various events (button clicks, form submissions, page views)
3. Use GTM Preview Mode to inspect event parameters
4. Verify each event includes `ecid` parameter

**Expected Result:**
All events fired include:
```javascript
{
  "event": "create_rental_order_activity",
  "element_click": "rental_order_search_location_button",
  "user_id": "...",
  "ecid": "MCMID|12345678901234567890",  // ✅ ECID present
  // ... other parameters
}
```

---

#### Test 5: ECID Fallback to Referrer
**Steps:**
1. Navigate from One Ryder to Phoenix (ECID in URL)
2. From Phoenix, navigate to another Phoenix page (no ECID in URL)
3. Verify ECID still captured from sessionStorage

**Expected Result:**
- Page 1: ECID captured from URL → stored in sessionStorage
- Page 2: ECID captured from sessionStorage (URL has no ecid param)
- Both pages fire events with same ECID value

---

#### Test 6: ECID Missing - Graceful Degradation
**Steps:**
1. Navigate directly to rentals.ryder.com (no ECID parameter)
2. Verify no errors in console
3. Verify events still fire (without ECID dimension)

**Expected Result:**
- No JavaScript errors
- `{{CJS - ECID Capture}}` returns `undefined`
- Events fire with `ecid: undefined` or parameter omitted
- User experience unaffected

---

### Acceptance Criteria

#### One Ryder Side
- [x] ECID appended to exit links on Existing Customer page
- [x] ECID appended to Customer Tools CTAs
- [x] ECID format matches Adobe MCMID specification
- [x] Exit links navigate to rentals.ryder.com with ECID parameter

#### Phoenix Side
- [ ] GTM Variable "CJS - ECID Capture" created and configured
- [ ] Variable captures ECID from URL parameter
- [ ] Variable captures ECID from referrer if not in URL
- [ ] ECID stored in sessionStorage as 'gtm_ecid'
- [ ] ECID persists across page navigations
- [ ] Google Tag Event Setting includes ECID parameter
- [ ] All GA4 events include ECID dimension
- [ ] No console errors when ECID missing
- [ ] Testing completed with Luke and team

---

## Reporting & Analytics

### Use Cases Enabled

1. **Cross-Domain Conversion Funnel**
   - Track users from One Ryder marketing pages → Phoenix rental booking
   - Calculate conversion rates from awareness to booking
   - Identify drop-off points in cross-domain journey

2. **Attribution Modeling**
   - Attribute rentals to specific One Ryder pages/campaigns
   - Multi-touch attribution across domains
   - ROI measurement for marketing initiatives

3. **User Journey Mapping**
   - Visualize complete user paths across both domains
   - Understand behavior patterns before rental conversion
   - Optimize content and CTAs based on journey data

4. **A/B Testing Validation**
   - Test changes on One Ryder and measure impact on Phoenix conversions
   - Cross-domain experiment measurement

### Required Reporting Dimensions

| Dimension | Source | Purpose |
|-----------|--------|---------|
| ECID | {{CJS - ECID Capture}} | Primary stitching key |
| Session ID | {{GA4 Session ID}} | Session-level analysis |
| User Pseudo ID | {{GA4 User Pseudo-ID}} | User-level analysis |
| Source Domain | Derived | Differentiate One Ryder vs Phoenix events |
| Landing Page | First page URL | Entry point tracking |

---

## Rollout Plan

### Phase 1: Limited Test (Current)
**Timeline:** Week of October 20, 2025
**Scope:** 2 pages on One Ryder → Phoenix

**Activities:**
1. ✅ Adswerve implements ECID appending on One Ryder (Completed)
2. 🔄 Internal team implements GTM variable on Phoenix (In Progress)
3. 🔄 Joint testing session with Luke (Scheduled)
4. Validate data in analytics platforms
5. Monitor for 1 week, assess data quality

**Success Metrics:**
- ECID capture rate > 95% for users from One Ryder
- No increase in error rates
- Analytics events include ECID dimension
- Cross-domain reporting validates user journey stitching

---

### Phase 2: Full Rollout
**Timeline:** TBD (After Phase 1 validation)
**Scope:** All One Ryder exit links to Phoenix

**Prerequisites:**
- Phase 1 testing completed successfully
- Data quality validated in reporting
- Stakeholder approval to expand scope

**Activities:**
1. Adswerve expands ECID appending to all One Ryder exit links
2. Monitor data quality across expanded traffic
3. Build cross-domain reports and dashboards
4. Train analytics teams on cross-domain reporting

---

## Stakeholders

| Role | Name/Team | Responsibility |
|------|-----------|----------------|
| **One Ryder Implementation** | Anusha (Adswerve) | Append ECID to exit links |
| **Phoenix Implementation** | Internal Team | GTM variable configuration |
| **Testing Lead** | Luke | Coordinate joint testing |
| **Analytics/Reporting** | Analytics Team | Configure dimensions, build reports |
| **Project Coordination** | Steven Munoz | Overall implementation coordination |

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| ECID parameter stripped by browser/proxy | High | Low | Use POST requests for critical flows, monitor capture rates |
| sessionStorage cleared mid-session | Medium | Low | Accept as edge case, focus on initial capture |
| GTM variable conflicts | Medium | Low | Use unique variable naming, test thoroughly |
| ECID format changes by Adobe | High | Low | Monitor Adobe documentation, version GTM code |
| Performance impact of sessionStorage | Low | Very Low | Minimal overhead, monitor page load times |

---

## Technical Dependencies

### One Ryder
- Adobe Experience Cloud ID Service (ECID generation)
- GTM container with access to ECID variable
- Ability to modify exit link href attributes

### Phoenix Rental Platform
- GTM container with Custom JavaScript variables enabled
- Browser support for sessionStorage
- URLSearchParams API support (IE11+)

### Analytics Platforms
- GA4 custom dimensions configured for ECID
- Adobe Analytics (if used) configured for ECID dimension
- Cross-domain tracking enabled in analytics configuration

---

## Maintenance & Monitoring

### Ongoing Monitoring
- **ECID Capture Rate:** % of sessions from One Ryder with ECID present
- **Email Parameter Capture Rate:** % of email sessions with sfid/campaign captured *(Added v1.1)*
- **Data Quality:** Validate ECID format matches Adobe MCMID specification
- **Error Rates:** Monitor console errors related to parameter capture
- **sessionStorage Success:** Track sessionStorage availability

### Alerts
- ECID capture rate drops below 90%
- Email parameter capture rate drops below 95% *(Added v1.1)*
- JavaScript errors exceed threshold
- Adobe ECID format changes detected

### Documentation Updates
- Update this PRD when expanding to Phase 2
- Document any ECID format changes from Adobe
- Maintain changelog of GTM variable modifications

---

## Appendix

### A. ECID Format Specification
**Format:** `MCMID|[20-digit number]`
**Example:** `MCMID|12345678901234567890`
**Source:** Adobe Experience Cloud ID Service
**Documentation:** [Adobe ECID Service Documentation](https://experienceleague.adobe.com/docs/id-service/using/home.html)

### B. Browser Compatibility
- URLSearchParams: Chrome 49+, Firefox 44+, Safari 10.1+, Edge 17+
- sessionStorage: All modern browsers including IE8+
- Custom JavaScript Variables in GTM: All browsers

### C. Related Documentation
- [Email Campaign Tracking Guide](./Email_Campaign_Tracking_Guide.md) - Email parameter implementation *(Added v1.1)*
- [GTM Implementation Guide](./GTM_Implementation_Guide.md)
- [GTM Medallia User Context PRD](./GTM_Medallia_User_Context_PRD.md)
- [HttpOnly Cookie Issue Solution](./HttpOnly_Cookie_Issue_Solution.md)

### D. GTM Variable Code
- **Main Script:** `user-context/ecid-capture.js` - ECID + Email parameter capture *(Enhanced v1.1)*
- **Email Variables:** `user-context/email-parameter-variables.js` - Individual email parameter variables *(Added v1.1)*

---

## Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-20 | 1.0 | Initial PRD created | Steven Munoz |
| 2025-10-20 | 1.1 | Added email campaign parameter tracking (Rental Onboarding emails) | Steven Munoz |

---

## Approval

**Pending Approvals:**
- [ ] Analytics Team - Reporting requirements validated
- [ ] Engineering Lead - Technical implementation approved
- [ ] Product Owner - Business requirements confirmed
- [ ] Testing Complete - Phase 1 validation successful

**Next Steps:**
1. Complete Phoenix GTM variable implementation
2. Schedule joint testing session with Luke
3. Validate ECID data in analytics platforms
4. Obtain stakeholder approval for Phase 2 rollout
