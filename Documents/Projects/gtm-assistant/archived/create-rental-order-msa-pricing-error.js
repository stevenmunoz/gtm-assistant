<script>
// Configuration Objects
var MSA_ERROR_CONFIG = {
    CREATE_RENTAL_ORDER: {
        name: 'create_rental_order_activity',
        element: {
            id: 'rental_order_view_rates_error_modal',
            selector: '[data-testid="rental_order_view_rates_error_modal_message"]'
        },
        steps: {
            REVIEW_ORDER: 'rental_order_review_order_page'
        }
    }
};

// Utility Functions
var MSAErrorDOMUtils = {
    getElementText: function(selector) {
        var element = document.querySelector(selector);
        return element ? element.innerText : 'none';
    }
};

var MSAErrorDataLayerUtils = {
    push: function(data) {
        var userType = window.oktaUid ? 'authenticated' : 'not-authenticated';
        
        dataLayer.push(Object.assign({
            'event': MSA_ERROR_CONFIG.CREATE_RENTAL_ORDER.name,
            'user_type': userType,
            'okta_id': window.oktaUid || 'none'
        }, data));
    }
};

function handleMSAError() {
    var errorMessage = "We are unable to retrieve your negotiated rates at this time. However, your rates will still apply to this order."

    MSAErrorDataLayerUtils.push({
        'element_click': MSA_ERROR_CONFIG.CREATE_RENTAL_ORDER.element.id,
        'step': MSA_ERROR_CONFIG.CREATE_RENTAL_ORDER.steps.REVIEW_ORDER,
        'error_message_msa_pricing_error': errorMessage
    });
}

function watchForMSAError() {
    var errorMessageSent = false;
    
    var observer = new MutationObserver(function(mutations) {
        if (!errorMessageSent) {
            var errorElement = document.querySelector(MSA_ERROR_CONFIG.CREATE_RENTAL_ORDER.element.selector);
            if (errorElement) {
                handleMSAError();
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

function initializeMSAErrorTracking() {
    watchForMSAError();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeMSAErrorTracking);
window.addEventListener('load', initializeMSAErrorTracking);
if (document.readyState === 'complete') {
    initializeMSAErrorTracking();
}
</script>
