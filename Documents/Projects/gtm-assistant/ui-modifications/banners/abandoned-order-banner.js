<script>
// Configuration for abandoned order banner tracking
var ABANDONED_ORDER_CONFIG = {
    EVENT_NAME: 'resume_incomplete_order_activity',
    ELEMENTS: {
        RESUME_BUTTON: 'resume_order_banner_cta_button'
    }
};

// Utility function to get element value safely
function getElementValue(selector) {
    var element = document.querySelector('[data-testid="' + selector + '"]');
    if (!element) {
        return '';
    }
    var value = element.textContent ? element.textContent.trim() : element.value || '';
    return value;
}

// Function to find the Resume Order button using data-testid
function getResumeOrderButton() {
    return document.querySelector('[data-testid="' + ABANDONED_ORDER_CONFIG.ELEMENTS.RESUME_BUTTON + '"]');
}

// Function to handle resume button click
function handleResumeButtonClick() {
    var eventData = {
        'event': ABANDONED_ORDER_CONFIG.EVENT_NAME,
        'element_click': 'resume_order_banner_cta_button',
        'okta_id': window.oktaUid || ''
    };
    window.dataLayer.push(eventData);
}

// Function to attach event listeners
function attachEventListeners() {
    var resumeButton = getResumeOrderButton();
    if (resumeButton) {
        resumeButton.addEventListener('click', handleResumeButtonClick);
    }
}

// Initialize listeners when DOM is ready
if (document.readyState === 'complete') {
    attachEventListeners();
} else {
    document.addEventListener('DOMContentLoaded', attachEventListeners);
    document.addEventListener('load', attachEventListeners);
}
</script>
