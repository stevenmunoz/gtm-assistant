<script>
// Configuration for language selector tracking
var LANGUAGE_SELECTOR_CONFIG = {
    EVENT_NAME: 'language_selector_activity',
    ELEMENT_CLICK: 'language_selector_button'
};

// Store the previous language to detect changes
var previousLanguage = null;

// Utility function to extract selected language from the button
function getSelectedLanguage() {
    // Look for the sr-only span that contains "Selected language: en - US"
    var buttons = document.querySelectorAll('button[aria-haspopup="dialog"]');

    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        var srOnlySpan = button.querySelector('.sr-only');

        if (srOnlySpan) {
            var text = srOnlySpan.textContent || srOnlySpan.innerText;
            // Extract language code from "Selected language: en - US"
            if (text.indexOf('Selected language:') !== -1) {
                var language = text.replace('Selected language:', '').trim();
                return language || 'unknown';
            }
        }
    }

    return 'unknown';
}

// Initialize previous language on page load
function initializePreviousLanguage() {
    previousLanguage = getSelectedLanguage();
}

// Handler for when language changes
function handleLanguageChange(newLanguage) {
    var eventData = {
        'event': LANGUAGE_SELECTOR_CONFIG.EVENT_NAME,
        'okta_id': window.oktaUid || '',
        'selected_language': newLanguage,
        'element_click': LANGUAGE_SELECTOR_CONFIG.ELEMENT_CLICK
    };

    if (window.dataLayer) {
        window.dataLayer.push(eventData);
    }
}

// Use MutationObserver to detect language changes
function observeLanguageSelector() {
    var observer = new MutationObserver(function(mutations) {
        var currentLanguage = getSelectedLanguage();

        // If language changed and we have a valid previous language, fire the event
        if (currentLanguage !== 'unknown' && previousLanguage !== null && currentLanguage !== previousLanguage) {
            handleLanguageChange(currentLanguage);
            previousLanguage = currentLanguage;
        }
    });

    // Find the language selector button and observe it for changes
    var buttons = document.querySelectorAll('button[aria-haspopup="dialog"]');

    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        var srOnlySpan = button.querySelector('.sr-only');

        if (srOnlySpan) {
            var text = srOnlySpan.textContent || srOnlySpan.innerText;
            if (text.indexOf('Selected language:') !== -1) {
                // Observe the button for text changes
                observer.observe(button, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }
        }
    }
}

// Initialize tracking
function initializeLanguageSelectorTracking() {
    initializePreviousLanguage();
    observeLanguageSelector();
}

// Run when DOM is ready
if (document.readyState === 'complete') {
    initializeLanguageSelectorTracking();
} else {
    document.addEventListener('DOMContentLoaded', initializeLanguageSelectorTracking);
    document.addEventListener('load', initializeLanguageSelectorTracking);
}
</script>
