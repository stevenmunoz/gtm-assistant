<script>
// Configuration for device type/platform tracking
var DEVICE_TRACKING_CONFIG = {
    DIMENSION_NAME: 'platform_type',
    PLATFORMS: {
        IOS: 'iOS',
        ANDROID: 'Android',
        WEB: 'Web',
        UNKNOWN: 'Unknown'
    },
    USER_AGENT_PATTERNS: {
        IOS: /iPad|iPhone|iPod/,
        ANDROID: /Android/,
        WEB: /Mozilla|Chrome|Safari|Firefox|Edge/
    }
};

// Utility function to detect device platform
function detectPlatform() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check for iOS devices
    if (DEVICE_TRACKING_CONFIG.USER_AGENT_PATTERNS.IOS.test(userAgent)) {
        return DEVICE_TRACKING_CONFIG.PLATFORMS.IOS;
    }
    
    // Check for Android devices
    if (DEVICE_TRACKING_CONFIG.USER_AGENT_PATTERNS.ANDROID.test(userAgent)) {
        return DEVICE_TRACKING_CONFIG.PLATFORMS.ANDROID;
    }
    
    // Check for web browsers
    if (DEVICE_TRACKING_CONFIG.USER_AGENT_PATTERNS.WEB.test(userAgent)) {
        return DEVICE_TRACKING_CONFIG.PLATFORMS.WEB;
    }
    
    // Fallback to unknown
    return DEVICE_TRACKING_CONFIG.PLATFORMS.UNKNOWN;
}

// Function to inject platform parameter into dataLayer
function injectPlatformToDataLayer() {
    var platform = detectPlatform();
    
    // Push to dataLayer for GTM
    if (typeof dataLayer !== 'undefined') {
        var eventData = {
            'event': 'platform_detected'
        };
        eventData[DEVICE_TRACKING_CONFIG.DIMENSION_NAME] = platform;
        dataLayer.push(eventData);
        
        // Also set as a global variable for easy access
        dataLayer.push({
            'platform_type': platform
        });
        
        return true;
    }
    
    return false;
}

// Function to log platform information for debugging
function logPlatformInfo() {
    var platform = detectPlatform();
    var injected = injectPlatformToDataLayer();
    
    return {
        platform: platform,
        injected: injected
    };
}

// Function to initialize platform tracking
function initializePlatformTracking() {
    // Apply tracking immediately if DOM is ready
    if (document.readyState === 'complete') {
        logPlatformInfo();
    } else {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', logPlatformInfo);
        document.addEventListener('load', logPlatformInfo);
    }
}

// Main function to apply all platform tracking
function applyPlatformTracking() {
    var trackingApplied = {
        platformDetected: detectPlatform(),
        dataLayerInjected: injectPlatformToDataLayer(),
        infoLogged: logPlatformInfo()
    };
    
    return trackingApplied;
}

// Initialize platform tracking
initializePlatformTracking();
</script>
