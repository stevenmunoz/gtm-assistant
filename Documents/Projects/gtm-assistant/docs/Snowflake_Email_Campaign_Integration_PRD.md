# Snowflake Email Campaign Integration PRD

## Executive Summary

Marketing is implementing 15 new tracking parameters for email campaign attribution and cross-domain user journey tracking. This document outlines the Snowflake data engineering impact and provides recommendations to minimize development effort.

## Background

### Current Snowflake Integration
- **Status**: Production (recently completed)
- **Data Flow**: GA4 → BigQuery → Snowflake (via API)
- **Current Dimensions**: 3 regular columns (GA SessionId, Date, Event) + 6 custom dimensions
- **API Constraint**: GA API accepts maximum 9 dimensions per call

### Business Need
Marketing needs to track:
1. **Cross-domain attribution**: Stitching user journeys between www.ryder.com and rentals.ryder.com
2. **Email campaign performance**: Which emails drive reservations and revenue
3. **Eloqua integration**: Connecting marketing automation data to rental outcomes

## New Parameters Overview

### Summary
| Category | Count | Snowflake Impact |
|----------|-------|------------------|
| **Custom Dimensions** (Low cardinality) | 5 | ✅ No code changes needed |
| **Event Parameters** (High cardinality) | 9 | ⚠️ Requires ETL + DB + Code changes |
| **Debug Only** | 1 | ➖ Not sent to analytics |
| **Total** | **15** | **Impact: 9 new columns + ETL refactor** |

## Detailed Parameter Analysis

### ✅ Parameters as Custom Dimensions (No Code Changes)

These parameters have **low cardinality** and should be configured as GA4 Custom Dimensions (starting with "custom_"):

| # | Parameter | Cardinality | Example Values | Custom Dimension Name |
|---|-----------|-------------|----------------|----------------------|
| 1 | `utm_medium` | ~10 values | email, organic, cpc, social | `custom_traffic_medium` |
| 2 | `utm_source` | ~20 values | Eloqua, Google, Facebook, Direct | `custom_traffic_source` |
| 3 | `email_cta` | ~15 values | Hero-Image-RentAgain, Footer-Link, CTA-Reserve | `custom_email_cta` |
| 4 | `eloqua_asset_type` | ~10 values | Email, Landing Page, Form | `custom_asset_type` |
| 5 | `eloqua_segment_type` | ~8 values | Geographic, Behavioral, Demographic | `custom_segment_type` |

**Snowflake Impact**: None. These flow automatically with existing custom dimension logic.

---

### ⚠️ Parameters Requiring Database Changes (High Cardinality)

These parameters have **unique or high cardinality values** and must be stored as event parameters:

| # | Parameter | Cardinality | Storage Requirement | New Column |
|---|-----------|-------------|---------------------|------------|
| 1 | `ecid` | Unique per user | STRING (with `ecid_` prefix) | `ecid` |
| 2 | `email_sfid` | Unique per opportunity | STRING | `email_sfid` |
| 3 | `utm_campaign` | 100+ campaigns | STRING | `utm_campaign` |
| 4 | `eloqua_track_id` | Unique per email send | STRING | `eloqua_track_id` |
| 5 | `eloqua_id` | Unique per recipient | STRING | `eloqua_id` |
| 6 | `eloqua_asset_id` | 1000+ assets | STRING | `eloqua_asset_id` |
| 7 | `eloqua_campaign_id` | 50+ campaigns | STRING | `eloqua_campaign_id` |
| 8 | `eloqua_segment_id` | 100+ segments | STRING | `eloqua_segment_id` |
| 9 | `eloqua_access_key` | Security token | STRING | `eloqua_access_key` |

**Snowflake Impact**:
- ✅ **9 new columns** to add to events table
- ⚠️ **ETL code changes** to handle 14 dimensions (currently hardcoded for 9)
- ⚠️ **API pagination logic** (GA API limit is 9 dimensions per call, need multiple calls)

---

## Snowflake Engineering Requirements

### Option A: Minimal Impact (Recommended)
**Convert 5 parameters to Custom Dimensions**

**Effort**: 2-3 days
- Add 9 new columns to events table
- Modify ETL to pull 9 new event parameters
- Test and deploy

**Trade-off**: Lose ability to filter by utm_medium, utm_source, email_cta, asset_type, segment_type in GA4 UI (but still available in Snowflake and BigQuery)

---

### Option B: Full Implementation
**Keep all 15 as Event Parameters**

**Effort**: 1-2 weeks
- Add 14 new columns to events table
- **Refactor ETL** to handle pagination (9 dimension limit per API call)
  - Call 1: SessionId, Date, Event + 6 custom dimensions
  - Call 2: 9 event parameters (ecid, sfid, utm_campaign, etc.)
  - Call 3: 5 remaining event parameters
- Implement data merge logic for multi-call results
- Update data model and schema
- Test and deploy

**Trade-off**: Significant development time and complexity for minimal benefit

---

## Recommended Approach

### Phase 1: Immediate (Week 1)
**Implement 5 Custom Dimensions + 9 Event Parameters**

#### Step 1: Configure GA4 Custom Dimensions
Create 5 new Custom Dimensions in GA4:
```
custom_traffic_medium    → utm_medium
custom_traffic_source    → utm_source
custom_email_cta         → email_cta (from CTA parameter)
custom_asset_type        → eloqua_asset_type
custom_segment_type      → eloqua_segment_type
```

#### Step 2: Update GTM Variables
Modify GTM to send 5 parameters as custom dimensions instead of event parameters.

#### Step 3: Snowflake Database Changes
Add 9 new columns to `events` table:
```sql
ALTER TABLE events ADD COLUMN ecid STRING;
ALTER TABLE events ADD COLUMN email_sfid STRING;
ALTER TABLE events ADD COLUMN utm_campaign STRING;
ALTER TABLE events ADD COLUMN eloqua_track_id STRING;
ALTER TABLE events ADD COLUMN eloqua_id STRING;
ALTER TABLE events ADD COLUMN eloqua_asset_id STRING;
ALTER TABLE events ADD COLUMN eloqua_campaign_id STRING;
ALTER TABLE events ADD COLUMN eloqua_segment_id STRING;
ALTER TABLE events ADD COLUMN eloqua_access_key STRING;
```

#### Step 4: Update ETL Logic
Modify ETL to extract 9 new event parameters from GA4 API:
- `event_params` array parsing for new fields
- Mapping to new columns
- NULL handling for events without email parameters

**Estimated Effort**: 2-3 days

---

### Phase 2: Validation (Week 2)
1. Validate all parameters flowing from GA4 → BigQuery
2. Validate all parameters flowing BigQuery → Snowflake
3. Verify custom dimensions appear in GA4 reports
4. Test identity stitching with `ecid` and `email_sfid`

---

## Data Dictionary

### Core Attribution Fields

#### `ecid` (Experience Cloud ID)
- **Format**: `ecid_25388727614949790491303971192145180621` (34-digit number with prefix)
- **Purpose**: Stitch user sessions between www.ryder.com and rentals.ryder.com
- **Source**: Adobe Experience Cloud passed via URL parameter
- **Cardinality**: Unique per user (1:1 mapping)
- **Snowflake Type**: STRING
- **Remove Prefix**: `REPLACE(ecid, 'ecid_', '')`

#### `email_sfid` (Salesforce Opportunity ID)
- **Format**: `701...` (Salesforce 15 or 18-char ID)
- **Purpose**: Connect rental reservations back to Salesforce opportunity
- **Source**: Email campaign URL parameters
- **Cardinality**: Unique per opportunity
- **Snowflake Type**: STRING

#### `utm_campaign`
- **Format**: Free text (e.g., `"Rental_Onboarding_Email_3"`)
- **Purpose**: Identify specific marketing campaign
- **Source**: Email URLs, paid ads, referrals
- **Cardinality**: ~100-500 unique campaigns
- **Snowflake Type**: STRING

---

### Eloqua Email Tracking Fields

All Eloqua parameters are available only in **footer links** (not hero CTA links).

#### `eloqua_track_id` (elqTrackId)
- **Purpose**: Unique identifier for email send/recipient pair
- **Cardinality**: High (millions)
- **Snowflake Type**: STRING

#### `eloqua_id` (elq)
- **Purpose**: Eloqua contact identifier
- **Cardinality**: High (unique per contact)
- **Snowflake Type**: STRING

#### `eloqua_asset_id` (elqaid)
- **Purpose**: Eloqua email template/asset ID
- **Cardinality**: Medium (~1000s of assets)
- **Snowflake Type**: STRING

#### `eloqua_campaign_id` (elqCampaignId)
- **Purpose**: Eloqua campaign identifier
- **Cardinality**: Medium (~50-200 campaigns)
- **Snowflake Type**: STRING

#### `eloqua_segment_id` (elqcsid)
- **Purpose**: Eloqua segment identifier
- **Cardinality**: Medium (~100s of segments)
- **Snowflake Type**: STRING

#### `eloqua_access_key` (elqak)
- **Purpose**: Security token for Eloqua tracking
- **Cardinality**: High (rotating tokens)
- **Snowflake Type**: STRING

---

## Data Availability by Email Type

### Hero CTA Links (Email #3 - "Rent Again")
✅ **Available**:
- ecid
- email_sfid
- email_cta (e.g., `"Hero-Image-RentAgain"`)
- utm_campaign
- utm_medium
- utm_source

❌ **Not Available**:
- All Eloqua parameters (elq*)

### Footer Links (All Emails)
✅ **Available**:
- ecid
- email_sfid
- utm_campaign
- utm_medium
- utm_source
- All Eloqua parameters (elqTrackId, elq, elqaid, elqat, elqCampaignId, elqcst, elqcsid, elqak)

❌ **Not Available**:
- email_cta (footer links don't have CTA identifiers)

---

## Key Decisions Needed

### Decision 1: Custom Dimensions vs. Event Parameters
**Question**: Are you willing to configure 5 parameters as GA4 Custom Dimensions to reduce Snowflake effort from 2 weeks to 3 days?

**Recommendation**: Yes - use Custom Dimensions for low-cardinality fields

**Impact**:
- ✅ No ETL refactoring needed
- ✅ Faster implementation
- ✅ Data still available in Snowflake and BigQuery
- ⚠️ Slightly different field names in GA4 UI (`custom_traffic_medium` instead of `utm_medium`)

---

### Decision 2: Historical Backfill
**Question**: Do you need historical data for these new parameters?

**Recommendation**: No - start capturing going forward only

**Rationale**:
- These are NEW email campaigns that haven't launched yet
- No historical email sends with these parameters exist
- ECID cross-domain tracking is new (no historical ECIDs)

---

## Testing Plan

### GTM Testing (Pre-Deployment)
1. Use GTM Preview mode with test email URLs
2. Verify all parameters captured in dataLayer
3. Verify ECID has `ecid_` prefix
4. Test parameter persistence across page navigation (sessionStorage)

### GA4 Validation (Post-Deployment)
1. DebugView: Verify custom dimensions appear with `custom_` prefix
2. DebugView: Verify event parameters appear in event payload
3. BigQuery: Query `event_params` array for new fields
4. BigQuery: Verify ECID stored as STRING (not scientific notation)

### Snowflake Validation
1. Run query to check new columns exist and are populated
2. Verify NULL handling for non-email traffic
3. Test join logic with Salesforce data using `email_sfid`
4. Test identity stitching using `ecid`
5. Validate custom dimension values match event parameter values

---

## Open Questions

1. **Enterprise Org Integration**: How do we map `ecid` to Enterprise Org for customer MDM?
2. **Identity Graph**: Should `ecid` be added to the customer identity graph alongside email, Okta UID, etc.?
3. **Data Retention**: What's the retention policy for Eloqua tracking parameters (PII considerations)?
4. **Salesforce Sync**: Does `email_sfid` need to sync back to Salesforce or is this one-way attribution only?

---

## Success Metrics

### Technical Success
- ✅ All 9 event parameters flowing to Snowflake
- ✅ 5 custom dimensions available in GA4 reports
- ✅ ECID stored as STRING (no scientific notation)
- ✅ Zero data loss during ETL process

### Business Success
- 📊 Ability to answer: "Which email campaigns drive the most reservations?"
- 📊 Ability to answer: "What's the conversion rate from www.ryder.com referrals?"
- 📊 Ability to answer: "Which Eloqua segments have the highest revenue per customer?"
- 📊 Identity stitching success rate >80% for cross-domain traffic

---

## Timeline

| Phase | Duration | Owner | Status |
|-------|----------|-------|--------|
| **Phase 1: GTM Implementation** | Week 1 | Steven Muñoz | ✅ Complete |
| **Phase 2: GA4 Configuration** | Week 2 | Steven Muñoz | 🔄 In Progress |
| **Phase 3: Snowflake Validation** | Week 2 | Steven Muñoz | ⏳ Pending |
| **Phase 4: Snowflake Schema Changes** | Week 3 | Ranga (Snowflake Team) | ⏳ Pending |
| **Phase 5: ETL Updates** | Week 3-4 | Ranga (Snowflake Team) | ⏳ Pending |
| **Phase 6: Testing & Validation** | Week 4 | Steven + Ranga | ⏳ Pending |
| **Phase 7: Dashboard/Data Access** | Week 5 | Anna + Bri (Marketing Analytics) | ⏳ Pending |

---

## Appendix A: Technical Constraints

### GA4 API Limitations
- Maximum 9 dimensions per API call
- Custom dimensions count toward the 9-dimension limit
- Event parameters do NOT count toward the limit (but require parsing `event_params` array)

### Current Snowflake ETL Architecture
- Hardcoded for 3 regular columns + 6 custom dimensions = 9 total
- Adding 14 new event parameters requires:
  - Schema changes (9 new columns)
  - ETL parsing logic for `event_params` array
  - No API pagination needed if we use 5 custom dimensions

### BigQuery Structure
```sql
-- Event parameters stored as repeated RECORD
event_params: ARRAY<STRUCT<
  key STRING,
  value STRUCT<
    string_value STRING,
    int_value INT64,
    float_value FLOAT64,
    double_value FLOAT64
  >
>>
```

---

## Appendix B: Related Documentation

- **GTM Implementation**: `user-context/GTM_VARIABLES_REFERENCE.md`
- **GTM Code**: `user-context/ecid-capture.js`
- **Full PRD**: `docs/ECID_Cross_Domain_Tracking_PRD.md`
- **Quick Start**: `docs/EMAIL_TRACKING_QUICK_START.md`

---

## Contacts

- **GTM Implementation**: Steven Muñoz
- **Snowflake ETL**: Ranga Kiran Kishore
- **Marketing Analytics**: Anna, Bri, Aaron
- **Product/Engineering**: Mike B
- **Marketing Leadership**: David Osconazzi
