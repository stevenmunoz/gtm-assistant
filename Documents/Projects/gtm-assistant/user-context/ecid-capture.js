<script>
/**
 * CJS - ECID & Email Campaign Capture
 *
 * Purpose: Capture Experience Cloud ID (ECID) and Email Campaign parameters from cross-domain traffic
 * Used for:
 *   1. Stitching user journeys between One Ryder (www.ryder.com) and Phoenix (rentals.ryder.com)
 *   2. Tracking Rental Onboarding email campaign performance
 *
 * GTM Variable Type: Custom JavaScript
 * GTM Variable Name: CJS - ECID Capture
 *
 * Captured Parameters:
 *   - ecid: Experience Cloud ID (from One Ryder cross-domain links)
 *   - sfid: Salesforce ID (from email campaigns)
 *   - CTA: Call-to-Action identifier (from email CTAs)
 *   - utm_campaign: Campaign name (from email marketing)
 *   - utm_medium: Medium (email)
 *   - utm_source: Source (Eloqua)
 *   - elqTrackId: Eloqua Track ID
 *   - elq: Eloqua identifier
 *   - elqaid: Eloqua Asset ID
 *   - elqat: Eloqua Asset Type
 *   - elqCampaignId: Eloqua Campaign ID
 *   - elqcst: Eloqua Custom Segment Type
 *   - elqcsid: Eloqua Custom Segment ID
 *   - elqak: Eloqua Access Key
 *
 * Flow:
 * 1. Check current URL for all parameters
 * 2. If not found, check document.referrer for parameters
 * 3. Store all captured parameters in sessionStorage for persistence
 * 4. Return ECID value (backward compatible with existing implementation)
 *
 * Integration:
 * - Used by: Google Tag Event Setting variable
 * - Passed as 'ecid' parameter to all GA4 events
 * - Email parameters available via separate GTM variables
 *
 * Related Documentation: docs/ECID_Cross_Domain_Tracking_PRD.md
 */

function() {
  // Define all parameters to capture
  var paramsToCapture = [
    'ecid',           // ECID from One Ryder
    'sfid',           // Salesforce ID from emails
    'CTA',            // Call-to-Action identifier
    'utm_campaign',   // UTM campaign name
    'utm_medium',     // UTM medium
    'utm_source',     // UTM source
    'elqTrackId',     // Eloqua Track ID
    'elq',            // Eloqua identifier
    'elqaid',         // Eloqua Asset ID
    'elqat',          // Eloqua Asset Type
    'elqCampaignId',  // Eloqua Campaign ID
    'elqcst',         // Eloqua Custom Segment Type
    'elqcsid',        // Eloqua Custom Segment ID
    'elqak'           // Eloqua Access Key
  ];

  // Get the current URL parameters
  var urlParams = new URLSearchParams(window.location.search);
  var capturedParams = {};
  var hasNewParams = false;

  // Capture parameters from current URL
  paramsToCapture.forEach(function(param) {
    var value = urlParams.get(param);
    if (value) {
      capturedParams[param] = value;
      hasNewParams = true;
    }
  });

  // If no parameters in current URL, check document.referrer
  if (!hasNewParams && document.referrer) {
    try {
      var referrerUrl = new URL(document.referrer);
      var referrerParams = new URLSearchParams(referrerUrl.search);

      paramsToCapture.forEach(function(param) {
        var value = referrerParams.get(param);
        if (value) {
          capturedParams[param] = value;
          hasNewParams = true;
        }
      });
    } catch (e) {
      // Handle invalid referrer URL
      capturedParams = {};
    }
  }

  // Store all captured parameters in sessionStorage for persistence
  if (hasNewParams) {
    paramsToCapture.forEach(function(param) {
      if (capturedParams[param]) {
        sessionStorage.setItem('gtm_' + param, capturedParams[param]);
      }
    });
  }

  // Retrieve ECID (from either new capture or sessionStorage)
  var ecid = capturedParams.ecid || sessionStorage.getItem('gtm_ecid');

  // Return ECID value (backward compatible)
  return ecid ? String(ecid) : undefined;
}
</script>