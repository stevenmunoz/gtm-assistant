/**
 * CJS - ECID Capture
 *
 * Purpose: Capture Experience Cloud ID (ECID) from cross-domain traffic
 * Used for: Stitching user journeys between One Ryder (www.ryder.com) and Phoenix (rentals.ryder.com)
 *
 * GTM Variable Type: Custom JavaScript
 * GTM Variable Name: CJS - ECID Capture
 *
 * Flow:
 * 1. Check current URL for ecid parameter
 * 2. If not found, check document.referrer for ecid parameter
 * 3. Store ecid in sessionStorage for persistence across pages
 * 4. Return ECID value with 'ecid_' prefix to ensure STRING storage in GA4/BigQuery
 *
 * Format: ecid_25388727614949790491303971192145180621
 * The 'ecid_' prefix prevents scientific notation (34+ digit numbers exceed MAX_SAFE_INTEGER)
 * To remove prefix in BigQuery: REPLACE(ecid, 'ecid_', '')
 *
 * Integration:
 * - Used by: Google Tag Event Setting variable
 * - Passed as 'ecid' parameter to all GA4 events
 *
 * Related Documentation: docs/ECID_Cross_Domain_Tracking_PRD.md
 */

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
    // Prefix with 'ecid_' to force string treatment in GA4/BigQuery
    // Prevents scientific notation (34+ digits exceed MAX_SAFE_INTEGER)
    return 'ecid_' + String(ecid);
  }

  // If no ecid found, try to retrieve from sessionStorage
  var storedEcid = sessionStorage.getItem('gtm_ecid');
  return storedEcid ? 'ecid_' + String(storedEcid) : undefined;
}
