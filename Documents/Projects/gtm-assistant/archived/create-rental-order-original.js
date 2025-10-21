<script>
// Configuration Objects
var EVENT_CONFIG = {
    CREATE_RENTAL_ORDER: {
        name: 'create_rental_order_activity',
        steps: {
            SELECT_LOCATION: 'rental_order_select_location_page',
            REVIEW_ORDER: 'rental_order_review_order_page',
            ADDITIONAL_DETAILS: 'rental_order_additional_details_page',
            CONFIRMATION: 'rental_order_confirmation_page'
        },
        elements: {
            REVIEW_ORDER: 'rental_order_review_order_button',
            SUBMIT_ORDER: 'rental_order_submit_order_button',
            VIEW_RATES: 'rental_order_view_rates_button',
            SIGN_IN: 'rental_order_sign_in_button',
            EXPEDITE: 'rental_order_expedite_toggle',
            CREATE_ACCOUNT: 'rental_order_create_account_button'
        }
    }
};

var SELECTORS = {
    FORMS: {
        SELECT_LOCATION: '#select-location',
        ORDER_REVIEW: '#order-review'
    },
    ELEMENTS: {
        COMMENTS: '[data-testid="rental_order_leave_comments"]',
        PICKUP_DATE: '[data-testid="rental_order_pickup_date_time"] .text-xl',
        DROPOFF_DATE: '[data-testid="rental_order_dropoff_date_time"] .text-xl',
        VIEW_RATES: '[data-testid="rental_order_view_rates_button"]',
        EXPEDITE_TOGGLE: '[data-testid="rental_order_expedite_toggle"]',
        RENTAL_ORDER_ID: '[data-testid="rental_order_id"]',
        SIGN_IN: '[data-testid="rental_order_sign_in_button"]'
    },
    PROSPECT: {
        FIRST_NAME: '[data-testid="rental_order_first_name_input"]',
        LAST_NAME: '[data-testid="rental_order_last_name_input"]',
        EMAIL: '[data-testid="rental_order_email_input"]',
        PHONE: '[data-testid="rental_order_phone_number_input"]',
        COMPANY_NAME: '[data-testid="rental_order_company_name_input"]',
        COMPANY_ADDRESS: '[data-testid="rental_order_company_address_input"]',
        DOT_NUMBER: '[data-testid="rental_order_dot_number_input"]',
        ROLE: '[data-testid="rental_order_role_input"]',
        INDUSTRY: '[data-testid="rental_order_industry_dropdown"]',
        EQUIPMENT: '[data-testid="rental_order_primary_equipment_type_input"]',
        YEARS: '[data-testid="rental_order_years_in_business_dropdown"]',
        EMPLOYEES: '[data-testid="rental_order_number_of_employees_dropdown"]',
        TRANSPORTATION: '[data-testid="rental_order_primary_transportation_source_input"]'
    }
};

// Global state variables
var confirmationEventSent = false;
var quantityInputValue = 'none';
var fromDate = 'none';
var untilDate = 'none';
var formEntries = {};
var storedLocationText = 'none';
var userType = window.oktaUid ? 'authenticated' : 'not-authenticated';

// Utility Functions
var DOMUtils = {
    getElementValue: function(selector) {
        var element = document.querySelector(selector);
        return element ? element.value : 'none';
    },
    getElementText: function(selector) {
        var element = document.querySelector(selector);
        return element ? element.innerText : 'none';
    },
    getDropdownText: function(selector) {
        var element = document.querySelector(selector);
        return element ? element.querySelector('span').innerText : 'none';
    },
    getFormData: function(form) {
        var formData = new FormData(form);
        var entries = {};
        formData.forEach(function(value, key) {
            entries[key] = value;
        });
        return entries;
    }
};

var DataLayerUtils = {
    push: function(data) {
        dataLayer.push(Object.assign({
            'event': EVENT_CONFIG.CREATE_RENTAL_ORDER.name,
            'user_type': userType,
            'user_id': window.oktaUid
        }, data));
    }
};

function calculateLeadTime(requestedPickupDate) {
    var currentDate = new Date();
    var requestedDate = new Date(requestedPickupDate);
    var timeDifference = requestedDate - currentDate;
    var leadTimeInHours = Math.floor(timeDifference / (1000 * 60 * 60));
    return leadTimeInHours > 0 ? leadTimeInHours : 0;
}

function calculateRentalDuration(pickupDate, dropoffDate) {
    var pickupDateTime = new Date(pickupDate);
    var dropoffDateTime = new Date(dropoffDate);
    var timeDifference = dropoffDateTime - pickupDateTime;
    var rentalDurationInHours = Math.floor(timeDifference / (1000 * 60 * 60));
    return rentalDurationInHours > 0 ? rentalDurationInHours : 0;
}

function getProspectData() {
    if (userType === 'authenticated') {
        return {};
    }

    var prospectData = {
        first_name: DOMUtils.getElementValue(SELECTORS.PROSPECT.FIRST_NAME),
        last_name: DOMUtils.getElementValue(SELECTORS.PROSPECT.LAST_NAME),
        user_email: DOMUtils.getElementValue(SELECTORS.PROSPECT.EMAIL),
        phone_number: DOMUtils.getElementValue(SELECTORS.PROSPECT.PHONE),
        company_name: DOMUtils.getElementValue(SELECTORS.PROSPECT.COMPANY_NAME),
        company_address: DOMUtils.getElementValue(SELECTORS.PROSPECT.COMPANY_ADDRESS),
        dot_number: DOMUtils.getElementValue(SELECTORS.PROSPECT.DOT_NUMBER),
        role: DOMUtils.getElementValue(SELECTORS.PROSPECT.ROLE),
        industry: DOMUtils.getDropdownText(SELECTORS.PROSPECT.INDUSTRY),
        years_in_business: DOMUtils.getDropdownText(SELECTORS.PROSPECT.YEARS),
        number_of_employees: DOMUtils.getDropdownText(SELECTORS.PROSPECT.EMPLOYEES),
        primary_equipment_type: DOMUtils.getElementValue(SELECTORS.PROSPECT.EQUIPMENT),
        primary_transportation_source: DOMUtils.getElementValue(SELECTORS.PROSPECT.TRANSPORTATION)
    };

    localStorage.setItem('prospectData', JSON.stringify(prospectData));
    return prospectData;
}

function handleSelectLocationSubmit(form) {
    var formData = DOMUtils.getFormData(form);
    quantityInputValue = formData.units;
    fromDate = formData.pickupDate;
    untilDate = formData.dropOffDate;

    if (formData["location-text"] && formData["location-text"] !== storedLocationText) {
        storedLocationText = formData["location-text"];
    }

    DataLayerUtils.push({
        'element_click': EVENT_CONFIG.CREATE_RENTAL_ORDER.elements.REVIEW_ORDER,
        'step': EVENT_CONFIG.CREATE_RENTAL_ORDER.steps.SELECT_LOCATION,
        'location_input': storedLocationText,
        'vehicle_type_input': formData.product,
        'po_number_input': formData.poNumber,
        'from_date_picker': formData.pickupDate,
        'until_date_picker': formData.dropOffDate,
        'quantity_input': formData.units,
        'location_selected': formData.line2 + ', ' + formData.city + ', ' + formData.state + ' ' + formData.postalCode
    });
}

function handleOrderReviewSubmit() {
    var step = EVENT_CONFIG.CREATE_RENTAL_ORDER.steps.ADDITIONAL_DETAILS;
    var prospectData = getProspectData();
    
    // If there's no prospect data or user is authenticated, use review order step
    if (Object.keys(prospectData).length === 0 || userType === 'authenticated') {
        step = EVENT_CONFIG.CREATE_RENTAL_ORDER.steps.REVIEW_ORDER;
    }

    var comments = DOMUtils.getElementValue(SELECTORS.ELEMENTS.COMMENTS);
    var pickupDateFromDOM = DOMUtils.getElementText(SELECTORS.ELEMENTS.PICKUP_DATE);
    var dropoffDateFromDOM = DOMUtils.getElementText(SELECTORS.ELEMENTS.DROPOFF_DATE);

    DataLayerUtils.push({
        'element_click': EVENT_CONFIG.CREATE_RENTAL_ORDER.elements.SUBMIT_ORDER,
        'step': step,
        'comments': comments,
        'lead_time_hours': calculateLeadTime(fromDate),
        'rental_duration_hours': calculateRentalDuration(pickupDateFromDOM, dropoffDateFromDOM),
        'prospect_data': prospectData
    });

    watchForRentalOrderConfirmation();
}

function attachFormSubmitListener() {
    document.addEventListener('submit', function(event) {
        var form = event.target;

        if (form.id === 'select-location') {
            handleSelectLocationSubmit(form);
        }

        if (form.id === 'order-review') {
            handleOrderReviewSubmit();
        }
    });
}

function watchForRentalOrderConfirmation() {
    var observer = new MutationObserver(function(mutations) {
        if (!confirmationEventSent) {
            var rentalOrderIdElement = document.querySelector(SELECTORS.ELEMENTS.RENTAL_ORDER_ID);
            if (rentalOrderIdElement) {
                DataLayerUtils.push({
                    'element_click': EVENT_CONFIG.CREATE_RENTAL_ORDER.elements.CONFIRMATION,
                    'step': EVENT_CONFIG.CREATE_RENTAL_ORDER.steps.CONFIRMATION,
                    'rental_order_number': rentalOrderIdElement.innerText,
                    'pending_reservations': quantityInputValue
                });
                
                confirmationEventSent = true;
                observer.disconnect();

                if (window.KAMPYLE_ONSITE_SDK) {
                    window.KAMPYLE_ONSITE_SDK.updatePageView();
                }
            }
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

function attachSignInButtonListener() {
    document.addEventListener('click', function(event) {
        var element = event.target.closest(SELECTORS.ELEMENTS.SIGN_IN);
        if (element) {
            DataLayerUtils.push({
                'element_click': EVENT_CONFIG.CREATE_RENTAL_ORDER.elements.SIGN_IN,
                'step': EVENT_CONFIG.CREATE_RENTAL_ORDER.steps.REVIEW_ORDER
            });
        }
    }, true);
}

function attachExpediteToggleListener() {
    var toggleElement = document.querySelector(SELECTORS.ELEMENTS.EXPEDITE_TOGGLE);
    if (toggleElement) {
        toggleElement.addEventListener('click', function() {
            setTimeout(function() {
                if (toggleElement.getAttribute('aria-checked') === 'true') {
                    DataLayerUtils.push({
                        'element_click': EVENT_CONFIG.CREATE_RENTAL_ORDER.elements.EXPEDITE,
                        'step': EVENT_CONFIG.CREATE_RENTAL_ORDER.steps.ADDITIONAL_DETAILS
                    });
                }
            }, 100);
        });
    }
}

function attachViewRatesButtonListener() {
    document.addEventListener('click', function(event) {
        var element = event.target.closest(SELECTORS.ELEMENTS.VIEW_RATES);
        if (element) {
            var comments = DOMUtils.getElementValue(SELECTORS.ELEMENTS.COMMENTS);
            var pickupDateFromDOM = DOMUtils.getElementText(SELECTORS.ELEMENTS.PICKUP_DATE);
            var dropoffDateFromDOM = DOMUtils.getElementText(SELECTORS.ELEMENTS.DROPOFF_DATE);

            DataLayerUtils.push({
                'element_click': EVENT_CONFIG.CREATE_RENTAL_ORDER.elements.VIEW_RATES,
                'step': EVENT_CONFIG.CREATE_RENTAL_ORDER.steps.REVIEW_ORDER,
                'comments': comments,
                'lead_time_hours': calculateLeadTime(fromDate),
                'rental_duration_hours': calculateRentalDuration(pickupDateFromDOM, dropoffDateFromDOM)
            });
        }
    }, true);
}

function initializeApp() {
    attachFormSubmitListener();
    attachSignInButtonListener();
    attachExpediteToggleListener();
    attachViewRatesButtonListener();
}

document.addEventListener('DOMContentLoaded', initializeApp);
window.addEventListener('load', initializeApp);
if (document.readyState === 'complete') {
    initializeApp();
}
</script>