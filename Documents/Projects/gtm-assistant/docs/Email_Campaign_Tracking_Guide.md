# Email Campaign Tracking Implementation Guide
## Rental Onboarding Email Parameter Capture

### Document Version
**Version:** 1.0
**Last Updated:** October 20, 2025
**Related PRD:** ECID_Cross_Domain_Tracking_PRD.md

---

## Overview

This guide documents the capture and tracking of email campaign parameters from Rental Onboarding emails. Users clicking CTAs in Eloqua emails will have their campaign parameters captured and persisted throughout their Phoenix session for attribution and journey analysis.

---

## Email Campaigns In Scope

### Rental Onboarding Email Series
1. **Email 1 - Welcome** (`2025_RTL_RentalOnboardingEmail1_Welcome_MP`)
2. **Email 2 - ELD-FRS** (`2025_RTL_RentalOnboardingEmail2_ELD-FRS_MP`)
3. **Email 3 - Port to Door** (`2025_RTL_RentalOnboardingEmail3_PortToDoor-MP`)
4. **Email 4 - Recap** (`2025_RTL_RentalOnboardingEmail4_Recap_MP`)

### CTA Types
- **Hero Image CTAs:** `Hero-Image-RentAgain`
- **Hero Button CTAs:** `Hero-Button-AccessPlatform`
- **Footer CTAs:** Standard footer links (no CTA parameter)

---

## URL Parameter Schema

### Example URLs from Amanda

#### Email #3 - Re-Rent Hero CTAs
```
https://rentals.ryder.com/?sfid=701Uw00000QQQO5IAP&CTA=Hero-Image-RentAgain&utm_campaign=2025_RTL_RentalOnboardingEmail3_PortToDoor-MP&utm_medium=email&utm_source=Eloqua

https://rentals.ryder.com/?sfid=701Uw00000QQQO5IAP&CTA=Hero-Button-AccessPlatform&utm_campaign=2025_RTL_RentalOnboardingEmail3_PortToDoor-MP&utm_medium=email&utm_source=Eloqua
```

#### Email Footer Links (Full Eloqua Tracking)
```
https://rentals.ryder.com/?utm_campaign=2025_RTL_RentalOnboardingEmail1_Welcome_MP&utm_medium=email&utm_source=Eloqua&sfid=701Uw00000QQQO5IAP&elqTrackId=13948bc2b85e4f0f8e2bba64d3f9f24a&elq=6fb18970e75e43b3b5c42d8b1989050b&elqaid=8635&elqat=1&elqCampaignId=&elqcst=272&elqcsid=1295&elqak=8AF556D7DE8F97744BBBCA9A36B57FB3030FEDDDDA0E35BB7386FB66467982AED2D8
```

### Parameter Definitions

| Parameter | Description | Example Value | Source | Required |
|-----------|-------------|---------------|--------|----------|
| **sfid** | Salesforce ID | `701Uw00000QQQO5IAP` | All emails | ✅ Yes |
| **CTA** | Call-to-Action identifier | `Hero-Image-RentAgain` | Hero CTAs only | ⚠️ Optional |
| **utm_campaign** | Campaign name | `2025_RTL_RentalOnboardingEmail3_PortToDoor-MP` | All emails | ✅ Yes |
| **utm_medium** | Traffic medium | `email` | All emails | ✅ Yes |
| **utm_source** | Traffic source | `Eloqua` | All emails | ✅ Yes |
| **elqTrackId** | Eloqua track ID | `13948bc2b85e4f0f8e2bba64d3f9f24a` | Footer links | ⚠️ Optional |
| **elq** | Eloqua identifier | `6fb18970e75e43b3b5c42d8b1989050b` | Footer links | ⚠️ Optional |
| **elqaid** | Eloqua asset ID | `8635` | Footer links | ⚠️ Optional |
| **elqat** | Eloqua asset type | `1` | Footer links | ⚠️ Optional |
| **elqCampaignId** | Eloqua campaign ID | *(empty in examples)* | Footer links | ⚠️ Optional |
| **elqcst** | Eloqua custom segment type | `272` | Footer links | ⚠️ Optional |
| **elqcsid** | Eloqua custom segment ID | `1295` | Footer links | ⚠️ Optional |
| **elqak** | Eloqua access key | `8AF556D7DE8F97744BBBCA9A36B...` | Footer links | ⚠️ Optional |

**Note:** Eloqua parameters (`elq*`) vary per user and campaign. Values shown are examples only.

---

## Technical Implementation

### GTM Custom JavaScript Variable: CJS - ECID Capture (Enhanced)

**File:** `user-context/ecid-capture.js`

This variable has been updated to capture all email parameters in addition to ECID.

**Key Features:**
- Captures 14 total parameters (1 ECID + 13 email parameters)
- Stores all parameters in sessionStorage with `gtm_` prefix
- Maintains backward compatibility (still returns ECID value)
- Handles URL and referrer fallback
- Persists across all pages in the session

**sessionStorage Keys:**
```javascript
gtm_ecid           // ECID from One Ryder
gtm_sfid           // Salesforce ID
gtm_CTA            // Call-to-Action
gtm_utm_campaign   // Campaign name
gtm_utm_medium     // Medium (email)
gtm_utm_source     // Source (Eloqua)
gtm_elqTrackId     // Eloqua Track ID
gtm_elq            // Eloqua identifier
gtm_elqaid         // Eloqua Asset ID
gtm_elqat          // Eloqua Asset Type
gtm_elqCampaignId  // Eloqua Campaign ID
gtm_elqcst         // Eloqua Segment Type
gtm_elqcsid        // Eloqua Segment ID
gtm_elqak          // Eloqua Access Key
```

---

### Additional GTM Variables for Email Parameters

**File:** `user-context/email-parameter-variables.js`

Create these additional Custom JavaScript variables in GTM:

| Variable Name | Returns | Use Case |
|--------------|---------|----------|
| `CJS - Email SFID` | Salesforce ID | Link email to customer record |
| `CJS - Email CTA` | CTA identifier | Track which CTA was clicked |
| `CJS - Email Campaign` | Campaign name | Attribution reporting |
| `CJS - Email Medium` | Medium (email) | Traffic source analysis |
| `CJS - Email Source` | Source (Eloqua) | Platform identification |
| `CJS - Eloqua Track ID` | Eloqua track ID | Eloqua integration |
| `CJS - Eloqua ID` | Eloqua identifier | Eloqua integration |
| `CJS - Eloqua Asset ID` | Asset ID | Email asset tracking |
| `CJS - Eloqua Campaign ID` | Campaign ID | Campaign grouping |
| `CJS - All Email Parameters` | JSON object | Debug/comprehensive tracking |

**Code for each variable is provided in:** `user-context/email-parameter-variables.js`

---

### Google Tag Event Setting - Updated

Add these new parameters to your existing "Google Tag Event Setting" variable:

```javascript
// Existing parameters
link_text: {{Click Text}}
link_url: {{Click URL}}
gtm_info: {{Container ID}}: Version ID: {{Container Version}}
hit_timestamp: {{CJS - Hit Timestamp}}
ga4_session_id: {{GA4 Session ID}}
ga4_user_pseudo_id: {{GA4 User Pseudo-ID}}
ecid: {{CJS - ECID Capture}}

// NEW: Email campaign parameters
email_sfid: {{CJS - Email SFID}}
email_cta: {{CJS - Email CTA}}
email_campaign: {{CJS - Email Campaign}}
email_medium: {{CJS - Email Medium}}
email_source: {{CJS - Email Source}}
eloqua_track_id: {{CJS - Eloqua Track ID}}
eloqua_id: {{CJS - Eloqua ID}}
eloqua_asset_id: {{CJS - Eloqua Asset ID}}
eloqua_campaign_id: {{CJS - Eloqua Campaign ID}}
```

---

## Testing Plan

### Test Data from Amanda

Use these test URLs provided by Amanda for validation:

#### Email #3 Hero CTAs
```bash
# Test URL 1: Hero Image CTA
https://rentals.ryder.com/?sfid=701Uw00000QQQO5IAP&CTA=Hero-Image-RentAgain&utm_campaign=2025_RTL_RentalOnboardingEmail3_PortToDoor-MP&utm_medium=email&utm_source=Eloqua

# Test URL 2: Hero Button CTA
https://rentals.ryder.com/?sfid=701Uw00000QQQO5IAP&CTA=Hero-Button-AccessPlatform&utm_campaign=2025_RTL_RentalOnboardingEmail3_PortToDoor-MP&utm_medium=email&utm_source=Eloqua
```

#### Footer Link Examples
```bash
# Email 1 Footer
https://rentals.ryder.com/?utm_campaign=2025_RTL_RentalOnboardingEmail1_Welcome_MP&utm_medium=email&utm_source=Eloqua&sfid=701Uw00000QQQO5IAP&elqTrackId=13948bc2b85e4f0f8e2bba64d3f9f24a&elq=6fb18970e75e43b3b5c42d8b1989050b&elqaid=8635&elqat=1&elqCampaignId=&elqcst=272&elqcsid=1295&elqak=8AF556D7DE8F97744BBBCA9A36B57FB3030FEDDDDA0E35BB7386FB66467982AED2D8

# Email 2 Footer
https://rentals.ryder.com/?utm_campaign=2025_RTL_RentalOnboardingEmail2_ELD-FRS_MP&utm_medium=email&utm_source=Eloqua&sfid=701Uw00000QQQO5IAP&elqTrackId=13948bc2b85e4f0f8e2bba64d3f9f24a&elq=9d6707231113498db202fbcef9fd0f83&elqaid=8636&elqat=1&elqCampaignId=&elqcst=272&elqcsid=1295&elqak=8AF5F611299593FC4C8A6767D041460B230F058BC2BA53F763717606A1BDB5CEB93A

# Email 3 Footer
https://rentals.ryder.com/?utm_campaign=2025_RTL_RentalOnboardingEmail3_PortToDoor-MP&utm_medium=email&utm_source=Eloqua&sfid=701Uw00000QQQO5IAP&elqTrackId=13948bc2b85e4f0f8e2bba64d3f9f24a&elq=674d96acf5d04850a18e34d2cd2b6b48&elqaid=8637&elqat=1&elqCampaignId=&elqcst=272&elqcsid=1295&elqak=8AF5B2E356D44F35097B809DFD7B7C026E219AD33ACD873599761131CEE7AE84F4E0

# Email 4 Footer
https://rentals.ryder.com/?utm_campaign=2025_RTL_RentalOnboardingEmail4_Recap_MP&utm_medium=email&utm_source=Eloqua&sfid=701Uw00000QQQO5IAP&elqTrackId=13948bc2b85e4f0f8e2bba64d3f9f24a&elq=8b3ee9e1d6a645849e340676cb06c612&elqaid=8638&elqat=1&elqCampaignId=&elqcst=272&elqcsid=1295&elqak=8AF59DBF26D61EC0067575404519542FAA34BC9BE0DEFA9E9BF03F3D2233523E5EB8
```

---

### Test Scenarios

#### Test 1: Hero CTA Parameter Capture
**Objective:** Verify Hero CTA parameters are captured

**Steps:**
1. Navigate to: `https://rentals.ryder.com/?sfid=701Uw00000QQQO5IAP&CTA=Hero-Image-RentAgain&utm_campaign=2025_RTL_RentalOnboardingEmail3_PortToDoor-MP&utm_medium=email&utm_source=Eloqua`
2. Open GTM Preview Mode
3. Check GTM Variables panel

**Expected Results:**
```javascript
{{CJS - Email SFID}} = "701Uw00000QQQO5IAP"
{{CJS - Email CTA}} = "Hero-Image-RentAgain"
{{CJS - Email Campaign}} = "2025_RTL_RentalOnboardingEmail3_PortToDoor-MP"
{{CJS - Email Medium}} = "email"
{{CJS - Email Source}} = "Eloqua"
```

**Validation:**
```javascript
// Run in browser console
console.log('SFID:', sessionStorage.getItem('gtm_sfid'));
console.log('CTA:', sessionStorage.getItem('gtm_CTA'));
console.log('Campaign:', sessionStorage.getItem('gtm_utm_campaign'));
console.log('Medium:', sessionStorage.getItem('gtm_utm_medium'));
console.log('Source:', sessionStorage.getItem('gtm_utm_source'));
```

---

#### Test 2: Footer Link with Full Eloqua Tracking
**Objective:** Verify all Eloqua parameters are captured

**Steps:**
1. Navigate to Email 1 footer link (see URLs above)
2. Open GTM Preview Mode
3. Check all Eloqua variables

**Expected Results:**
```javascript
{{CJS - Email SFID}} = "701Uw00000QQQO5IAP"
{{CJS - Email Campaign}} = "2025_RTL_RentalOnboardingEmail1_Welcome_MP"
{{CJS - Eloqua Track ID}} = "13948bc2b85e4f0f8e2bba64d3f9f24a"
{{CJS - Eloqua ID}} = "6fb18970e75e43b3b5c42d8b1989050b"
{{CJS - Eloqua Asset ID}} = "8635"
// ... all other Eloqua parameters
```

**Validation:**
```javascript
// Run in browser console
console.log('All Email Params:', sessionStorage);
// Should show all gtm_* keys with values
```

---

#### Test 3: Parameter Persistence Across Pages
**Objective:** Ensure email parameters persist throughout session

**Steps:**
1. Land on Phoenix from Email 3 Hero CTA
2. Navigate to vehicle selection page
3. Navigate to booking form
4. Check sessionStorage on each page

**Expected Results:**
- All email parameters remain in sessionStorage
- GTM variables return same values on every page
- No parameters lost during navigation

---

#### Test 4: Parameters Included in Analytics Events
**Objective:** Verify email parameters appear in all GA4 events

**Steps:**
1. Land on Phoenix from email link
2. Trigger various events (clicks, form submissions)
3. Use GTM Preview to inspect event payloads

**Expected Results:**
Each event includes:
```javascript
{
  "event": "create_rental_order_activity",
  "user_id": "...",
  "ecid": "MCMID|...",
  "email_sfid": "701Uw00000QQQO5IAP",           // ✅ NEW
  "email_cta": "Hero-Image-RentAgain",          // ✅ NEW
  "email_campaign": "2025_RTL_RentalOnboardingEmail3_PortToDoor-MP",  // ✅ NEW
  "email_medium": "email",                       // ✅ NEW
  "email_source": "Eloqua",                      // ✅ NEW
  "eloqua_track_id": "13948bc2b85e4f0f8e2bba64d3f9f24a",  // ✅ NEW
  // ... other parameters
}
```

---

#### Test 5: Missing CTA Parameter (Footer Links)
**Objective:** Graceful handling when CTA parameter absent

**Steps:**
1. Navigate from Email 1 footer link (no CTA parameter)
2. Check GTM variables

**Expected Results:**
```javascript
{{CJS - Email SFID}} = "701Uw00000QQQO5IAP"  // ✅ Present
{{CJS - Email CTA}} = undefined              // ✅ Gracefully absent
{{CJS - Email Campaign}} = "2025_RTL_RentalOnboardingEmail1_Welcome_MP"  // ✅ Present
```

- No JavaScript errors
- Other parameters still captured correctly
- Events still fire with available parameters

---

#### Test 6: Direct Navigation (No Email Parameters)
**Objective:** Ensure existing functionality unaffected

**Steps:**
1. Navigate directly to `https://rentals.ryder.com/` (no parameters)
2. Verify no errors
3. Check that core tracking still works

**Expected Results:**
- No console errors
- All email parameter variables return `undefined`
- Core event tracking (non-email) works normally
- User experience unaffected

---

## Reporting & Analytics Use Cases

### 1. Email Campaign Attribution
**Question:** Which email drives the most rental bookings?

**Metrics:**
- Rentals by `email_campaign`
- Revenue by `email_campaign`
- Conversion rate by email (Email 1 vs 2 vs 3 vs 4)

**Implementation:**
```sql
-- Example GA4 query
SELECT
  email_campaign,
  COUNT(DISTINCT user_id) as users,
  COUNT(DISTINCT CASE WHEN event_name = 'rental_order_confirmed' THEN user_id END) as conversions,
  SUM(CASE WHEN event_name = 'rental_order_confirmed' THEN revenue END) as total_revenue
FROM analytics_events
WHERE email_campaign IS NOT NULL
GROUP BY email_campaign
```

---

### 2. CTA Performance Analysis
**Question:** Do Hero Image CTAs or Hero Button CTAs perform better?

**Metrics:**
- Click-through rate by CTA type
- Conversion rate by CTA
- Average order value by CTA

**Segmentation:**
- `email_cta = "Hero-Image-RentAgain"` vs `"Hero-Button-AccessPlatform"`
- By email (Email 3 only has CTAs)

---

### 3. Salesforce Integration
**Question:** Link Phoenix activity back to Salesforce records

**Use Case:**
- Match `email_sfid` to Salesforce opportunities
- Attribute Phoenix rental completions to SF campaigns
- Close the loop on email marketing ROI

**Data Flow:**
```
Salesforce Campaign → Eloqua Email → Phoenix Click (sfid captured)
  → Rental Order (sfid in event) → Export to Salesforce (sfid matches opportunity)
```

---

### 4. Email Journey Mapping
**Question:** What's the typical path from email to rental completion?

**Analysis:**
- Time from email click to rental completion
- Pages visited after email arrival
- Drop-off points for email traffic

**Segmentation:**
```javascript
// Users from Email 1
WHERE email_campaign = '2025_RTL_RentalOnboardingEmail1_Welcome_MP'

// Users who clicked Hero CTAs
WHERE email_cta IS NOT NULL

// Users from any onboarding email
WHERE email_campaign LIKE '%RentalOnboarding%'
```

---

### 5. Eloqua Integration & Optimization
**Question:** Which Eloqua assets and campaigns are most effective?

**Metrics:**
- Performance by `eloqua_asset_id`
- Conversion by `elqaid` (Email 1 vs 2 vs 3 vs 4)
- Segment performance via `elqcsid`

**Use Case:**
- Optimize email creative based on asset performance
- A/B test different email variations
- Refine audience segmentation in Eloqua

---

## GTM Configuration Checklist

### Step 1: Update CJS - ECID Capture Variable
- [ ] Replace existing "CJS - ECID Capture" code with enhanced version
- [ ] Source: `user-context/ecid-capture.js`
- [ ] Verify variable still returns ECID (backward compatible)

### Step 2: Create Email Parameter Variables
Create these Custom JavaScript variables:

- [ ] `CJS - Email SFID`
- [ ] `CJS - Email CTA`
- [ ] `CJS - Email Campaign`
- [ ] `CJS - Email Medium`
- [ ] `CJS - Email Source`
- [ ] `CJS - Eloqua Track ID`
- [ ] `CJS - Eloqua ID`
- [ ] `CJS - Eloqua Asset ID`
- [ ] `CJS - Eloqua Campaign ID`
- [ ] `CJS - All Email Parameters` (optional, for debugging)

**Source:** `user-context/email-parameter-variables.js`

### Step 3: Update Google Tag Event Setting
- [ ] Open "Google Tag Event Setting" variable
- [ ] Add new event parameters for email tracking
- [ ] Map each parameter to corresponding GTM variable
- [ ] Save changes

### Step 4: Configure GA4 Custom Dimensions
Create custom dimensions in GA4:

| Dimension Name | Scope | GTM Parameter |
|----------------|-------|---------------|
| Email SFID | User | `email_sfid` |
| Email CTA | Event | `email_cta` |
| Email Campaign | Session | `email_campaign` |
| Email Medium | Session | `email_medium` |
| Email Source | Session | `email_source` |
| Eloqua Track ID | Session | `eloqua_track_id` |
| Eloqua Asset ID | Session | `eloqua_asset_id` |

### Step 5: Testing
- [ ] Test with Amanda's example URLs
- [ ] Run all 6 test scenarios
- [ ] Validate parameters in GTM Preview
- [ ] Verify events in GA4 DebugView
- [ ] Check sessionStorage persistence

### Step 6: Deployment
- [ ] Submit GTM changes with descriptive version name
- [ ] Publish GTM container
- [ ] Coordinate with Amanda for live email testing
- [ ] Monitor for 48 hours post-deployment

---

## Important Notes from Amanda

### Variable Parameters
> "Starting in the URL parameter where the Eloqua Track ID starts ('&elqTrackId=___'), that is variable, varies based on the user clicking thru or the assigned campaign."

**Implication:**
- Eloqua parameters will have different values per user/campaign
- Test URLs show example formats only
- Don't hardcode expected values in validation

### Footer Links on All Emails
> "In the footer, it will be on all our rental onboarding emails so the utm_campaign will vary depending on the email name."

**Implication:**
- Footer links present on all 4 onboarding emails
- `utm_campaign` is the primary email identifier
- CTA parameter only on Hero CTAs (Email 3)

---

## Troubleshooting

### Issue: Email parameters not captured
**Symptoms:** GTM variables return `undefined`

**Checks:**
1. Verify URL contains expected parameters
2. Check browser console for JavaScript errors
3. Confirm sessionStorage is enabled in browser
4. Validate URLSearchParams API supported

**Solution:**
```javascript
// Test parameter extraction manually
var urlParams = new URLSearchParams(window.location.search);
console.log('SFID from URL:', urlParams.get('sfid'));
console.log('Campaign from URL:', urlParams.get('utm_campaign'));
```

---

### Issue: Parameters lost after navigation
**Symptoms:** sessionStorage cleared mid-session

**Checks:**
1. Verify same origin (rentals.ryder.com throughout)
2. Check for sessionStorage.clear() calls
3. Confirm no Private/Incognito mode issues

**Solution:**
- sessionStorage is origin-specific and persists for tab lifetime
- If issues persist, consider localStorage as alternative

---

### Issue: Eloqua parameters missing
**Symptoms:** UTM parameters present, Eloqua parameters absent

**Explanation:**
- Hero CTAs don't include Eloqua tracking parameters
- Only footer links have full Eloqua tracking
- This is expected behavior per Amanda's examples

**Expected State:**
```javascript
// Hero CTA - No Eloqua params
sfid ✅
CTA ✅
utm_campaign ✅
elqTrackId ❌

// Footer Link - Full Eloqua tracking
sfid ✅
CTA ❌
utm_campaign ✅
elqTrackId ✅
```

---

## Stakeholders

| Role | Contact | Responsibility |
|------|---------|----------------|
| **Email Campaign Manager** | Amanda | Provide test URLs, email specifications |
| **GTM Implementation** | Steven Munoz | Configure GTM variables and event settings |
| **QA/Testing** | Luke | Coordinate testing, validate data capture |
| **Analytics** | Analytics Team | Configure GA4 dimensions, build reports |

---

## Timeline

| Phase | Timeline | Activities |
|-------|----------|-----------|
| **Development** | Week of Oct 20 | Update GTM variables, create email param variables |
| **Testing** | Week of Oct 20 | Test with Amanda's URLs, validate capture |
| **Deployment** | Week of Oct 27 | Publish GTM changes, coordinate with email team |
| **Validation** | Week of Nov 3 | Monitor live email clicks, validate reporting |

---

## Appendix

### A. Complete Parameter Mapping

| URL Parameter | sessionStorage Key | GTM Variable | GA4 Dimension |
|---------------|-------------------|--------------|---------------|
| `ecid` | `gtm_ecid` | `{{CJS - ECID Capture}}` | `ecid` |
| `sfid` | `gtm_sfid` | `{{CJS - Email SFID}}` | `email_sfid` |
| `CTA` | `gtm_CTA` | `{{CJS - Email CTA}}` | `email_cta` |
| `utm_campaign` | `gtm_utm_campaign` | `{{CJS - Email Campaign}}` | `email_campaign` |
| `utm_medium` | `gtm_utm_medium` | `{{CJS - Email Medium}}` | `email_medium` |
| `utm_source` | `gtm_utm_source` | `{{CJS - Email Source}}` | `email_source` |
| `elqTrackId` | `gtm_elqTrackId` | `{{CJS - Eloqua Track ID}}` | `eloqua_track_id` |
| `elq` | `gtm_elq` | `{{CJS - Eloqua ID}}` | `eloqua_id` |
| `elqaid` | `gtm_elqaid` | `{{CJS - Eloqua Asset ID}}` | `eloqua_asset_id` |
| `elqCampaignId` | `gtm_elqCampaignId` | `{{CJS - Eloqua Campaign ID}}` | `eloqua_campaign_id` |

### B. Email Campaign Naming Convention

**Format:** `YEAR_BRAND_EmailName_Variant_Audience`

**Examples:**
- `2025_RTL_RentalOnboardingEmail1_Welcome_MP`
- `2025_RTL_RentalOnboardingEmail2_ELD-FRS_MP`
- `2025_RTL_RentalOnboardingEmail3_PortToDoor-MP`
- `2025_RTL_RentalOnboardingEmail4_Recap_MP`

**Components:**
- `2025` = Year
- `RTL` = Ryder Truck Leasing (brand)
- `RentalOnboardingEmail[1-4]` = Email series identifier
- `Welcome/ELD-FRS/PortToDoor/Recap` = Email topic
- `MP` = Audience segment (Multi-Point?)

---

## Related Documentation

- [ECID Cross-Domain Tracking PRD](./ECID_Cross_Domain_Tracking_PRD.md) - Main ECID implementation
- [GTM Implementation Guide](./GTM_Implementation_Guide.md) - GTM deployment process
- `user-context/ecid-capture.js` - Enhanced ECID capture script
- `user-context/email-parameter-variables.js` - Email parameter GTM variables

---

## Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-20 | 1.0 | Initial guide created with email parameter tracking | Steven Munoz |
