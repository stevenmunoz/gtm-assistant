<script>
// Configuration Objects
var BILLING_ERROR_EVENT_CONFIG = {
    CREATE_RENTAL_ORDER: {
        name: 'create_rental_order_activity',
        elements: {
            ERROR_MESSAGE: 'rental_order_view_rates_error_modal_message'
        },
        steps: {
            REVIEW_ORDER: 'rental_order_review_order_page'
        }
    }
};

var BILLING_ERROR_SELECTORS = {
    ELEMENTS: {
        ERROR_MESSAGE: '[data-testid="rental_order_multiple_accounts_error_modal"]'
    }
};

// Utility Functions
var BillingErrorDOMUtils = {
    getElementText: function(selector) {
        var element = document.querySelector(selector);
        return element ? element.innerText : 'none';
    }
};

var BillingErrorDataLayerUtils = {
    push: function(data) {
        var userType = window.oktaUid ? 'authenticated' : 'not-authenticated';
        
        dataLayer.push(Object.assign({
            'event': BILLING_ERROR_EVENT_CONFIG.CREATE_RENTAL_ORDER.name,
            'user_type': userType,
            'okta_id': window.oktaUid || 'none'
        }, data));
    }
};

function handleBillingError() {
    var errorMessage = BillingErrorDOMUtils.getElementText(BILLING_ERROR_SELECTORS.ELEMENTS.ERROR_MESSAGE);

    BillingErrorDataLayerUtils.push({
        'element_click': BILLING_ERROR_EVENT_CONFIG.CREATE_RENTAL_ORDER.elements.ERROR_MESSAGE,
        'step': BILLING_ERROR_EVENT_CONFIG.CREATE_RENTAL_ORDER.steps.REVIEW_ORDER,
        'error_message_multibilling_account_error': errorMessage
    });
}

function watchForBillingError() {
    var errorMessageSent = false;
    
    var observer = new MutationObserver(function(mutations) {
        if (!errorMessageSent) {
            var errorElement = document.querySelector(BILLING_ERROR_SELECTORS.ELEMENTS.ERROR_MESSAGE);
            if (errorElement) {
                handleBillingError();
                errorMessageSent = true;
                observer.disconnect();
            }
        }
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

function initializeBillingErrorTracking() {
    watchForBillingError();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeBillingErrorTracking);
window.addEventListener('load', initializeBillingErrorTracking);
if (document.readyState === 'complete') {
    initializeBillingErrorTracking();
}
</script> 