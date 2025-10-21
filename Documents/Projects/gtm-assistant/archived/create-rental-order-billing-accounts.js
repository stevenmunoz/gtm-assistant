<script>
// Configuration Objects
var BILLING_EVENT_CONFIG = {
    CREATE_RENTAL_ORDER: {
        name: 'create_rental_order_activity',
        elements: {
            SAVE_BUTTON: 'rental_order_multiple_accounts_modal_save_button'
        },
        steps: {
            REVIEW_ORDER: 'rental_order_review_order_page'
        }
    }
};

var BILLING_SELECTORS = {
    ELEMENTS: {
        SAVE_BUTTON: '[data-testid="billing_accounts_save_button"]',
        COMMENTS: '[data-testid="rental_order_leave_comments"]',
        PICKUP_DATE: '[data-testid="rental_order_pickup_date_time"] .text-xl',
        DROPOFF_DATE: '[data-testid="rental_order_dropoff_date_time"] .text-xl',
        BILLING_PROFILE_BUTTON: '#company-select-Billing\\ Company',
        BILLING_PROFILE_TEXT: '#company-select-Billing\\ Company span:not([aria-hidden="true"])'
    }
};

// Utility Functions
var BillingDOMUtils = {
    getElementValue: function(selector) {
        var element = document.querySelector(selector);
        return element ? element.value : 'none';
    },
    getElementText: function(selector) {
        var element = document.querySelector(selector);
        return element ? element.innerText : 'none';
    },
    getSelectedBillingProfile: function() {
        var selectedText = document.querySelector(BILLING_SELECTORS.ELEMENTS.BILLING_PROFILE_TEXT);
        if (selectedText && selectedText.textContent) {
            return selectedText.textContent.trim();
        }
        
        var buttonElement = document.querySelector(BILLING_SELECTORS.ELEMENTS.BILLING_PROFILE_BUTTON);
        if (buttonElement) {
            return Array.from(buttonElement.childNodes)
                .filter(function(node) {
                    return node.nodeType === 3 || (node.nodeType === 1 && !node.hasAttribute('aria-hidden'));
                })
                .map(function(node) {
                    return node.textContent;
                })
                .join('')
                .trim() || 'none';
        }
        
        return 'none';
    }
};

var BillingDataLayerUtils = {
    push: function(data) {
        var userType = window.oktaUid ? 'authenticated' : 'not-authenticated';
        
        dataLayer.push(Object.assign({
            'event': BILLING_EVENT_CONFIG.CREATE_RENTAL_ORDER.name,
            'user_type': userType,
            'okta_id': window.oktaUid || 'none'
        }, data));
    }
};

function calculateBillingLeadTime(requestedPickupDate) {
    var currentDate = new Date();
    var requestedDate = new Date(requestedPickupDate);
    var timeDifference = requestedDate - currentDate;
    var leadTimeInHours = Math.floor(timeDifference / (1000 * 60 * 60));
    return leadTimeInHours > 0 ? leadTimeInHours : 0;
}

function calculateBillingRentalDuration(pickupDate, dropoffDate) {
    var pickupDateTime = new Date(pickupDate);
    var dropoffDateTime = new Date(dropoffDate);
    var timeDifference = dropoffDateTime - pickupDateTime;
    var rentalDurationInHours = Math.floor(timeDifference / (1000 * 60 * 60));
    return rentalDurationInHours > 0 ? rentalDurationInHours : 0;
}

function handleBillingAccountsSave() {
    var comments = BillingDOMUtils.getElementValue(BILLING_SELECTORS.ELEMENTS.COMMENTS);
    var pickupDateFromDOM = BillingDOMUtils.getElementText(BILLING_SELECTORS.ELEMENTS.PICKUP_DATE);
    var dropoffDateFromDOM = BillingDOMUtils.getElementText(BILLING_SELECTORS.ELEMENTS.DROPOFF_DATE);
    var billingProfileName = BillingDOMUtils.getSelectedBillingProfile();

    console.log('Selected Billing Profile:', billingProfileName);

    BillingDataLayerUtils.push({
        'element_click': BILLING_EVENT_CONFIG.CREATE_RENTAL_ORDER.elements.SAVE_BUTTON,
        'billing_profile_name': billingProfileName,
        'step': BILLING_EVENT_CONFIG.CREATE_RENTAL_ORDER.steps.REVIEW_ORDER,
        'comments': comments,
        'lead_time_hours': calculateBillingLeadTime(pickupDateFromDOM),
        'rental_duration_hours': calculateBillingRentalDuration(pickupDateFromDOM, dropoffDateFromDOM)
    });
}

function attachBillingAccountsSaveListener() {
    document.addEventListener('click', function(event) {
        var element = event.target.closest(BILLING_SELECTORS.ELEMENTS.SAVE_BUTTON);
        if (element) {
            console.log('Billing Accounts Save Button Clicked');
            handleBillingAccountsSave();
        }
    }, true);
}

function initializeBillingAccountsTracking() {
    console.log('Initializing Billing Accounts Tracking');
    attachBillingAccountsSaveListener();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeBillingAccountsTracking);
window.addEventListener('load', initializeBillingAccountsTracking);
if (document.readyState === 'complete') {
    initializeBillingAccountsTracking();
}
</script> 