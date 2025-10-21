# GTM Event Parameter Descriptions
## Email Campaign Tracking - Parameter Reference

Use these descriptions when configuring your Google Tag Event Settings in GTM.

---

## Parameter Descriptions (Short & Clean)

```javascript
ecid // Cross-domain tracking ID
sfid // Salesforce ID
cta // Email CTA identifier
utm_campaign // Campaign name
utm_medium // Medium (email)
utm_source // Source (Eloqua)
elqTrackId // Eloqua track ID
elq // Eloqua ID
elqaid // Eloqua asset ID
elqCampaignId // Eloqua campaign ID
elqcst // Eloqua segment type
elqcsid // Eloqua segment ID
elqat // Eloqua asset type
```

---

## Full Mapping Table

| Parameter Name | GTM Variable | Description |
|----------------|--------------|-------------|
| `ecid` | `{{CJS - ECID Capture}}` | Cross-domain tracking ID |
| `sfid` | `{{CJS - Email SFID}}` | Salesforce ID |
| `cta` | `{{CJS - Email CTA}}` | Email CTA identifier |
| `utm_campaign` | `{{CJS - Email Campaign}}` | Campaign name |
| `utm_medium` | `{{CJS - Email Medium}}` | Medium (email) |
| `utm_source` | `{{CJS - Email Source}}` | Source (Eloqua) |
| `elqTrackId` | `{{CJS - Eloqua Track ID}}` | Eloqua track ID |
| `elq` | `{{CJS - Eloqua ID}}` | Eloqua ID |
| `elqaid` | `{{CJS - Eloqua Asset ID}}` | Eloqua asset ID |
| `elqCampaignId` | `{{CJS - Eloqua Campaign ID}}` | Eloqua campaign ID |
| `elqcst` | `{{CJS - Eloqua Custom Segment Type}}` | Eloqua segment type |
| `elqcsid` | `{{CJS - Eloqua Custom Segment ID}}` | Eloqua segment ID |
| `elqat` | `{{CJS - Eloqua Asset Type}}` | Eloqua asset type |

---

## Usage in Google Tag Event Setting

When configuring your "Google Tag Event Setting" variable in GTM, add these event parameters:

### Parameter Setup

| Event Parameter | Value |
|-----------------|-------|
| ecid | `{{CJS - ECID Capture}}` |
| sfid | `{{CJS - Email SFID}}` |
| cta | `{{CJS - Email CTA}}` |
| utm_campaign | `{{CJS - Email Campaign}}` |
| utm_medium | `{{CJS - Email Medium}}` |
| utm_source | `{{CJS - Email Source}}` |
| elqTrackId | `{{CJS - Eloqua Track ID}}` |
| elq | `{{CJS - Eloqua ID}}` |
| elqaid | `{{CJS - Eloqua Asset ID}}` |
| elqCampaignId | `{{CJS - Eloqua Campaign ID}}` |
| elqcst | `{{CJS - Eloqua Custom Segment Type}}` |
| elqcsid | `{{CJS - Eloqua Custom Segment ID}}` |
| elqat | `{{CJS - Eloqua Asset Type}}` |

---

## Parameter Details

### ECID (Experience Cloud ID)
- **Purpose:** Cross-domain user stitching between One Ryder and Phoenix
- **Source:** One Ryder exit links
- **Format:** `MCMID|[20-digit number]`
- **Example:** `MCMID|12345678901234567890`

### SFID (Salesforce ID)
- **Purpose:** Link Phoenix activity to Salesforce customer records
- **Source:** All Rental Onboarding emails
- **Format:** Salesforce record ID
- **Example:** `701Uw00000QQQO5IAP`

### CTA (Call-to-Action)
- **Purpose:** Identify which email CTA was clicked
- **Source:** Email #3 Hero CTAs only
- **Format:** String identifier
- **Examples:**
  - `Hero-Image-RentAgain`
  - `Hero-Button-AccessPlatform`

### UTM Parameters
- **utm_campaign:** Email campaign name
  - Example: `2025_RTL_RentalOnboardingEmail3_PortToDoor-MP`
- **utm_medium:** Always `email`
- **utm_source:** Always `Eloqua`

### Eloqua Parameters
All Eloqua parameters come from footer links in the email campaigns.

- **elqTrackId:** Eloqua tracking identifier (varies per user/campaign)
- **elq:** Eloqua unique identifier for email recipient
- **elqaid:** Eloqua asset ID (identifies which email: 8635, 8636, 8637, 8638)
- **elqat:** Eloqua asset type (typically `1`)
- **elqCampaignId:** Eloqua campaign ID (may be empty)
- **elqcst:** Eloqua custom segment type (e.g., `272`)
- **elqcsid:** Eloqua custom segment ID (e.g., `1295`)
- **elqak:** Eloqua access key (long alphanumeric string) - *Not in event settings by default*

---

## Parameter Availability by Email Type

### Hero CTA Links (Email #3 Only)
✅ **Available:** ecid, sfid, cta, utm_campaign, utm_medium, utm_source
❌ **Not Available:** All elq* parameters

### Footer Links (All 4 Emails)
✅ **Available:** ecid, sfid, utm_campaign, utm_medium, utm_source, all elq* parameters
❌ **Not Available:** cta

---

## Related Documentation
- [Email Campaign Tracking Guide](./Email_Campaign_Tracking_Guide.md) - Full implementation guide
- [GTM Variables Reference](../user-context/GTM_VARIABLES_REFERENCE.md) - Complete variable list
- [Quick Start Guide](./EMAIL_TRACKING_QUICK_START.md) - Quick implementation
- [ECID Cross-Domain Tracking PRD](./ECID_Cross_Domain_Tracking_PRD.md) - Main PRD

---

**Last Updated:** October 20, 2025
