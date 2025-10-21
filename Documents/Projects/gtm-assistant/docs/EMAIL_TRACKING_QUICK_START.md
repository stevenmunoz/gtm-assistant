# Email Campaign Tracking - Quick Start Guide

## Overview
Enhanced ECID capture script now also captures email campaign parameters from Rental Onboarding emails.

## What Changed

### ✅ Enhanced Script
**File:** `user-context/ecid-capture.js`

Now captures **14 total parameters:**
- 1 ECID (existing)
- 13 Email parameters (NEW)

### 📊 Parameters Captured

| Type | Parameters | Example |
|------|-----------|---------|
| **Salesforce** | `sfid` | `701Uw00000QQQO5IAP` |
| **CTA** | `CTA` | `Hero-Image-RentAgain` |
| **UTM** | `utm_campaign`, `utm_medium`, `utm_source` | Campaign tracking |
| **Eloqua** | `elqTrackId`, `elq`, `elqaid`, `elqat`, `elqCampaignId`, `elqcst`, `elqcsid`, `elqak` | Eloqua tracking |

## Quick Implementation

### Step 1: Update Main GTM Variable
```javascript
// Replace "CJS - ECID Capture" variable code with:
// Copy from: user-context/ecid-capture.js
```

### Step 2: Create Email Parameter Variables
Create 9 new GTM Custom JavaScript variables:
- `CJS - Email SFID`
- `CJS - Email CTA`
- `CJS - Email Campaign`
- `CJS - Email Medium`
- `CJS - Email Source`
- `CJS - Eloqua Track ID`
- `CJS - Eloqua ID`
- `CJS - Eloqua Asset ID`
- `CJS - Eloqua Campaign ID`

**Code:** See `user-context/email-parameter-variables.js`

### Step 3: Update Event Settings
Add to "Google Tag Event Setting":
```javascript
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

## Test URLs (From Amanda)

### Email #3 Hero CTAs
```
https://rentals.ryder.com/?sfid=701Uw00000QQQO5IAP&CTA=Hero-Image-RentAgain&utm_campaign=2025_RTL_RentalOnboardingEmail3_PortToDoor-MP&utm_medium=email&utm_source=Eloqua
```

### Email Footer (Full Tracking)
```
https://rentals.ryder.com/?utm_campaign=2025_RTL_RentalOnboardingEmail1_Welcome_MP&utm_medium=email&utm_source=Eloqua&sfid=701Uw00000QQQO5IAP&elqTrackId=13948bc2b85e4f0f8e2bba64d3f9f24a&elq=6fb18970e75e43b3b5c42d8b1989050b&elqaid=8635&elqat=1&elqCampaignId=&elqcst=272&elqcsid=1295&elqak=8AF556D7DE8F97744BBBCA9A36B57FB3030FEDDDDA0E35BB7386FB66467982AED2D8
```

## Quick Test
```javascript
// After landing from email, run in console:
console.log('SFID:', sessionStorage.getItem('gtm_sfid'));
console.log('CTA:', sessionStorage.getItem('gtm_CTA'));
console.log('Campaign:', sessionStorage.getItem('gtm_utm_campaign'));

// Should show captured values
```

## What Gets Tracked

### Rental Onboarding Emails (4 emails)
1. Email 1 - Welcome (`2025_RTL_RentalOnboardingEmail1_Welcome_MP`)
2. Email 2 - ELD-FRS (`2025_RTL_RentalOnboardingEmail2_ELD-FRS_MP`)
3. Email 3 - Port to Door (`2025_RTL_RentalOnboardingEmail3_PortToDoor-MP`)
4. Email 4 - Recap (`2025_RTL_RentalOnboardingEmail4_Recap_MP`)

### CTA Types
- Hero Image: `CTA=Hero-Image-RentAgain`
- Hero Button: `CTA=Hero-Button-AccessPlatform`
- Footer: No CTA parameter (still tracks campaign)

## Use Cases Enabled

✅ **Email Attribution:** Which email drives most rentals?
✅ **CTA Performance:** Hero vs Footer performance
✅ **Salesforce Integration:** Link Phoenix activity to SF records via sfid
✅ **Eloqua Optimization:** Track asset and campaign performance
✅ **Journey Mapping:** Complete email → rental conversion paths

## Documentation

- **Full Guide:** `docs/Email_Campaign_Tracking_Guide.md`
- **Main PRD:** `docs/ECID_Cross_Domain_Tracking_PRD.md`
- **Script Code:** `user-context/ecid-capture.js`
- **Variables Code:** `user-context/email-parameter-variables.js`

## Support

**Email URLs Provided By:** Amanda
**Implementation:** Steven Munoz
**Testing Coordinator:** Luke

---

**Last Updated:** October 20, 2025
