# GTM Variables Reference - Email Campaign Tracking

## Complete Variable List

Create these **14 Custom JavaScript variables** in GTM (in addition to the existing CJS - ECID Capture):

| # | GTM Variable Name | Returns | sessionStorage Key | Required? |
|---|-------------------|---------|-------------------|-----------|
| 1 | `CJS - Email SFID` | Salesforce ID | `gtm_sfid` | ✅ Yes |
| 2 | `CJS - Email CTA` | Call-to-Action ID | `gtm_CTA` | ⚠️ Hero CTAs only |
| 3 | `CJS - Email Campaign` | UTM Campaign | `gtm_utm_campaign` | ✅ Yes |
| 4 | `CJS - Email Medium` | UTM Medium | `gtm_utm_medium` | ✅ Yes |
| 5 | `CJS - Email Source` | UTM Source | `gtm_utm_source` | ✅ Yes |
| 6 | `CJS - Eloqua Track ID` | Eloqua Track ID | `gtm_elqTrackId` | ⚠️ Footer only |
| 7 | `CJS - Eloqua ID` | Eloqua Identifier | `gtm_elq` | ⚠️ Footer only |
| 8 | `CJS - Eloqua Asset ID` | Asset ID | `gtm_elqaid` | ⚠️ Footer only |
| 9 | `CJS - Eloqua Asset Type` | Asset Type | `gtm_elqat` | ⚠️ Footer only |
| 10 | `CJS - Eloqua Campaign ID` | Campaign ID | `gtm_elqCampaignId` | ⚠️ Footer only |
| 11 | `CJS - Eloqua Segment Type` | Segment Type | `gtm_elqcst` | ⚠️ Footer only |
| 12 | `CJS - Eloqua Segment ID` | Segment ID | `gtm_elqcsid` | ⚠️ Footer only |
| 13 | `CJS - Eloqua Access Key` | Access Key | `gtm_elqak` | ⚠️ Footer only |
| 14 | `CJS - All Email Parameters` | JSON object | N/A | 🔧 Debug only |

## Source Code

All variable code is in: `user-context/email-parameter-variables.js`

Copy each function from that file into a new GTM Custom JavaScript variable.

## Usage in Google Tag Event Setting

### Recommended Parameters (Minimal)

Add these to your event settings for basic email tracking:

```javascript
email_sfid: {{CJS - Email SFID}}
email_cta: {{CJS - Email CTA}}
email_campaign: {{CJS - Email Campaign}}
email_medium: {{CJS - Email Medium}}
email_source: {{CJS - Email Source}}
```

### Full Tracking (With Eloqua)

Add all parameters for complete Eloqua integration:

```javascript
// Core email parameters
email_sfid: {{CJS - Email SFID}}
email_cta: {{CJS - Email CTA}}
email_campaign: {{CJS - Email Campaign}}
email_medium: {{CJS - Email Medium}}
email_source: {{CJS - Email Source}}

// Eloqua tracking
eloqua_track_id: {{CJS - Eloqua Track ID}}
eloqua_id: {{CJS - Eloqua ID}}
eloqua_asset_id: {{CJS - Eloqua Asset ID}}
eloqua_asset_type: {{CJS - Eloqua Asset Type}}
eloqua_campaign_id: {{CJS - Eloqua Campaign ID}}
eloqua_segment_type: {{CJS - Eloqua Segment Type}}
eloqua_segment_id: {{CJS - Eloqua Segment ID}}
eloqua_access_key: {{CJS - Eloqua Access Key}}
```

## Parameter Availability by Email Type

### Hero CTA Links (Email #3)
Example: `?sfid=701...&CTA=Hero-Image-RentAgain&utm_campaign=...&utm_medium=email&utm_source=Eloqua`

✅ Available:
- SFID
- CTA
- UTM Campaign
- UTM Medium
- UTM Source

❌ Not Available:
- All Eloqua parameters (elq*)

### Footer Links (All Emails)
Example: `?utm_campaign=...&utm_medium=email&utm_source=Eloqua&sfid=701...&elqTrackId=...&elq=...&elqaid=...`

✅ Available:
- SFID
- UTM Campaign
- UTM Medium
- UTM Source
- All Eloqua parameters (elqTrackId, elq, elqaid, elqat, elqCampaignId, elqcst, elqcsid, elqak)

❌ Not Available:
- CTA (footer links don't have CTA identifier)

## Quick Test

After implementing, test with Amanda's URLs:

```javascript
// Run in browser console after landing from email:

// Check all captured parameters
console.table({
  'SFID': sessionStorage.getItem('gtm_sfid'),
  'CTA': sessionStorage.getItem('gtm_CTA'),
  'Campaign': sessionStorage.getItem('gtm_utm_campaign'),
  'Medium': sessionStorage.getItem('gtm_utm_medium'),
  'Source': sessionStorage.getItem('gtm_utm_source'),
  'Eloqua Track ID': sessionStorage.getItem('gtm_elqTrackId'),
  'Eloqua ID': sessionStorage.getItem('gtm_elq'),
  'Eloqua Asset ID': sessionStorage.getItem('gtm_elqaid'),
  'Eloqua Asset Type': sessionStorage.getItem('gtm_elqat'),
  'Eloqua Campaign ID': sessionStorage.getItem('gtm_elqCampaignId'),
  'Eloqua Segment Type': sessionStorage.getItem('gtm_elqcst'),
  'Eloqua Segment ID': sessionStorage.getItem('gtm_elqcsid'),
  'Eloqua Access Key': sessionStorage.getItem('gtm_elqak')
});

// Or use the all-in-one variable
console.log('All Params:', {{CJS - All Email Parameters}});
```

## Implementation Checklist

- [ ] Update `CJS - ECID Capture` with enhanced code from `ecid-capture.js`
- [ ] Create variable #1: `CJS - Email SFID`
- [ ] Create variable #2: `CJS - Email CTA`
- [ ] Create variable #3: `CJS - Email Campaign`
- [ ] Create variable #4: `CJS - Email Medium`
- [ ] Create variable #5: `CJS - Email Source`
- [ ] Create variable #6: `CJS - Eloqua Track ID`
- [ ] Create variable #7: `CJS - Eloqua ID`
- [ ] Create variable #8: `CJS - Eloqua Asset ID`
- [ ] Create variable #9: `CJS - Eloqua Asset Type`
- [ ] Create variable #10: `CJS - Eloqua Campaign ID`
- [ ] Create variable #11: `CJS - Eloqua Segment Type`
- [ ] Create variable #12: `CJS - Eloqua Segment ID`
- [ ] Create variable #13: `CJS - Eloqua Access Key`
- [ ] Create variable #14: `CJS - All Email Parameters` (optional)
- [ ] Add email parameters to Google Tag Event Setting
- [ ] Test with Hero CTA URL (verify CTA captured, Eloqua params absent)
- [ ] Test with Footer URL (verify Eloqua params captured, CTA absent)
- [ ] Verify parameters persist across page navigation
- [ ] Publish GTM container

---

**Related Documentation:**
- Full Implementation Guide: `docs/Email_Campaign_Tracking_Guide.md`
- Quick Start: `docs/EMAIL_TRACKING_QUICK_START.md`
- Main PRD: `docs/ECID_Cross_Domain_Tracking_PRD.md`
