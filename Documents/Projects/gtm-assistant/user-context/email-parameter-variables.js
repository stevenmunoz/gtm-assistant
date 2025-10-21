<script>
/**
 * Email Campaign Parameter GTM Variables
 *
 * These Custom JavaScript variables retrieve email campaign parameters
 * captured and stored by the CJS - ECID Capture variable.
 *
 * Usage: Create separate GTM Custom JavaScript variables for each parameter needed
 * Then add them to your Google Tag Event Setting variable
 *
 * Related: user-context/ecid-capture.js
 */

// ============================================
// CJS - Email SFID
// Captures Salesforce ID from email campaigns
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var sfid = urlParams.get('sfid') || sessionStorage.getItem('gtm_sfid');
  return sfid ? String(sfid) : undefined;
}

// ============================================
// CJS - Email CTA
// Captures Call-to-Action identifier from email links
// Examples: "Hero-Image-RentAgain", "Hero-Button-AccessPlatform"
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var cta = urlParams.get('CTA') || sessionStorage.getItem('gtm_CTA');
  return cta ? String(cta) : undefined;
}

// ============================================
// CJS - Email Campaign
// Captures UTM campaign name from email
// Examples: "2025_RTL_RentalOnboardingEmail3_PortToDoor-MP"
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var campaign = urlParams.get('utm_campaign') || sessionStorage.getItem('gtm_utm_campaign');
  return campaign ? String(campaign) : undefined;
}

// ============================================
// CJS - Email Medium
// Captures UTM medium from email (typically "email")
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var medium = urlParams.get('utm_medium') || sessionStorage.getItem('gtm_utm_medium');
  return medium ? String(medium) : undefined;
}

// ============================================
// CJS - Email Source
// Captures UTM source from email (typically "Eloqua")
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var source = urlParams.get('utm_source') || sessionStorage.getItem('gtm_utm_source');
  return source ? String(source) : undefined;
}

// ============================================
// CJS - Email Term
// Captures UTM term from email (for paid search keywords)
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var term = urlParams.get('utm_term') || sessionStorage.getItem('gtm_utm_term');
  return term ? String(term) : undefined;
}

// ============================================
// CJS - Email Content
// Captures UTM content from email (for A/B testing or content differentiation)
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var content = urlParams.get('utm_content') || sessionStorage.getItem('gtm_utm_content');
  return content ? String(content) : undefined;
}

// ============================================
// CJS - Email Device
// Captures UTM device from email (device type tracking)
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var device = urlParams.get('utm_device') || sessionStorage.getItem('gtm_utm_device');
  return device ? String(device) : undefined;
}

// ============================================
// CJS - Eloqua Track ID
// Captures Eloqua tracking identifier
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var trackId = urlParams.get('elqTrackId') || sessionStorage.getItem('gtm_elqTrackId');
  return trackId ? String(trackId) : undefined;
}

// ============================================
// CJS - Eloqua ID
// Captures main Eloqua identifier
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var elqId = urlParams.get('elq') || sessionStorage.getItem('gtm_elq');
  return elqId ? String(elqId) : undefined;
}

// ============================================
// CJS - Eloqua Asset ID
// Captures Eloqua Asset ID
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var assetId = urlParams.get('elqaid') || sessionStorage.getItem('gtm_elqaid');
  return assetId ? String(assetId) : undefined;
}

// ============================================
// CJS - Eloqua Asset Type
// Captures Eloqua Asset Type
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var assetType = urlParams.get('elqat') || sessionStorage.getItem('gtm_elqat');
  return assetType ? String(assetType) : undefined;
}

// ============================================
// CJS - Eloqua Campaign ID
// Captures Eloqua Campaign ID
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var campaignId = urlParams.get('elqCampaignId') || sessionStorage.getItem('gtm_elqCampaignId');
  return campaignId ? String(campaignId) : undefined;
}

// ============================================
// CJS - Eloqua Custom Segment Type
// Captures Eloqua Custom Segment Type
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var segmentType = urlParams.get('elqcst') || sessionStorage.getItem('gtm_elqcst');
  return segmentType ? String(segmentType) : undefined;
}

// ============================================
// CJS - Eloqua Custom Segment ID
// Captures Eloqua Custom Segment ID
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var segmentId = urlParams.get('elqcsid') || sessionStorage.getItem('gtm_elqcsid');
  return segmentId ? String(segmentId) : undefined;
}

// ============================================
// CJS - Eloqua Access Key
// Captures Eloqua Access Key
// ============================================
function() {
  var urlParams = new URLSearchParams(window.location.search);
  var accessKey = urlParams.get('elqak') || sessionStorage.getItem('gtm_elqak');
  return accessKey ? String(accessKey) : undefined;
}

// ============================================
// CJS - All Email Parameters (JSON)
// Returns all email parameters as a JSON string
// Useful for debugging or passing entire object to custom dimensions
// ============================================
function() {
  var params = {
    sfid: sessionStorage.getItem('gtm_sfid'),
    cta: sessionStorage.getItem('gtm_CTA'),
    utm_campaign: sessionStorage.getItem('gtm_utm_campaign'),
    utm_medium: sessionStorage.getItem('gtm_utm_medium'),
    utm_source: sessionStorage.getItem('gtm_utm_source'),
    utm_term: sessionStorage.getItem('gtm_utm_term'),
    utm_content: sessionStorage.getItem('gtm_utm_content'),
    utm_device: sessionStorage.getItem('gtm_utm_device'),
    elqTrackId: sessionStorage.getItem('gtm_elqTrackId'),
    elq: sessionStorage.getItem('gtm_elq'),
    elqaid: sessionStorage.getItem('gtm_elqaid'),
    elqat: sessionStorage.getItem('gtm_elqat'),
    elqCampaignId: sessionStorage.getItem('gtm_elqCampaignId'),
    elqcst: sessionStorage.getItem('gtm_elqcst'),
    elqcsid: sessionStorage.getItem('gtm_elqcsid'),
    elqak: sessionStorage.getItem('gtm_elqak')
  };

  // Remove null/undefined values
  Object.keys(params).forEach(function(key) {
    if (!params[key]) {
      delete params[key];
    }
  });

  return Object.keys(params).length > 0 ? JSON.stringify(params) : undefined;
}
</script>
