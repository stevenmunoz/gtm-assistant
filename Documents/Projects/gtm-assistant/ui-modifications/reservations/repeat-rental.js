<script>
// Configuration for repeat rental tracking
var REPEAT_RENTAL_CONFIG = {
    EVENT_NAME: 'repeat_agreement_activity',
    ELEMENTS: {
        CHECK_AVAILABILITY: 'repeat_modal_check_availability_button',
        START_NEW: 'repeat_modal_start_new_reservation_link',
        AGREEMENT_NUMBER: 'rental_agreements_id_display',
        RESERVATION_NUMBER: 'rental_agreements_reservation_id',
        PROVIDER: 'rental_agreements_fleet_tag',
        VEHICLE_TYPE_INPUT: 'repeat_modal_vehicle_type',
        CURRENT_LOCATION: 'res_details_repeat_reservation_location_sharer',
        DATE_RANGE: 'repeat_modal_date_range_input_start',
        DATE_RANGE_END: 'repeat_modal_date_range_input_end',
        UNITS_SELECTION: 'repeat_modal_units_input'
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

// Utility function to parse specific field values
function parseFieldValue(field, value) {
    switch (field) {
        case 'agreement_id':
            var match = value.match(/\d+/);
            var result = match ? match[0] : '';
            return result;
        case 'reservation_id':
            var match2 = value.match(/\d+/);
            var result2 = match2 ? match2[0] : '';
            return result2;
        case 'provider':
            var match3 = value.match(/^[^T]+/);
            var result3 = match3 ? match3[0].trim() : '';
            return result3;
        default:
            return value;
    }
}

// Utility function to get date range values
function getDateRangeValues() {
    var range = getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.DATE_RANGE);
    var filter_pickup_date_from = '';
    var filter_pickup_date_to = '';
    if (range && range.indexOf(' - ') !== -1) {
        var parts = range.split(' - ');
        filter_pickup_date_from = parts[0] ? parts[0].trim() : '';
        filter_pickup_date_to = parts[1] ? parts[1].trim() : '';
    }
    return {
        filter_pickup_date_from: filter_pickup_date_from,
        filter_pickup_date_to: filter_pickup_date_to
    };
}

// Function to find the Repeat Agreement button using data-testid
function getRepeatAgreementButton() {
    return document.querySelector('[data-testid="rental_details_repeat_button"]');
}

// Function to handle repeat button click
function handleRepeatButtonClick() {
    var eventData = {
        'event': REPEAT_RENTAL_CONFIG.EVENT_NAME,
        'element_click': 'repeat_agreement_cta_button',
        'okta_id': window.oktaUid || '',
        'agreement_id': parseFieldValue('agreement_id', getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.AGREEMENT_NUMBER)),
        'reservation_id': parseFieldValue('reservation_id', getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.RESERVATION_NUMBER)),
        'provider': parseFieldValue('provider', getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.PROVIDER))
    };
    window.dataLayer.push(eventData);
}

// Function to handle check availability click
function handleCheckAvailabilityClick(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    var dateRange = getDateRangeValues();
    var eventData = {
        'event': REPEAT_RENTAL_CONFIG.EVENT_NAME,
        'element_click': 'repeat_modal_check_availability_button',
        'okta_id': window.oktaUid || '',
        'agreement_id': parseFieldValue('agreement_id', getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.AGREEMENT_NUMBER)),
        'reservation_id': parseFieldValue('reservation_id', getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.RESERVATION_NUMBER)),
        'provider': parseFieldValue('provider', getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.PROVIDER)),
        'vehicle_type_input': getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.VEHICLE_TYPE_INPUT),
        'current_location': getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.CURRENT_LOCATION),
        'filter_pickup_date_from': dateRange.filter_pickup_date_from,
        'filter_pickup_date_to': dateRange.filter_pickup_date_to,
        'units_selection': getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.UNITS_SELECTION)
    };
    window.dataLayer.push(eventData);
}

// Function to handle start new reservation click
function handleStartNewClick() {
    var dateRange = getDateRangeValues();
    var eventData = {
        'event': REPEAT_RENTAL_CONFIG.EVENT_NAME,
        'element_click': 'repeat_modal_start_new_reservation_link',
        'okta_id': window.oktaUid || '',
        'agreement_id': parseFieldValue('agreement_id', getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.AGREEMENT_NUMBER)),
        'reservation_id': parseFieldValue('reservation_id', getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.RESERVATION_NUMBER)),
        'provider': parseFieldValue('provider', getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.PROVIDER)),
        'vehicle_type_input': getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.VEHICLE_TYPE_INPUT),
        'current_location': getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.CURRENT_LOCATION),
        'filter_pickup_date_from': dateRange.filter_pickup_date_from,
        'filter_pickup_date_to': dateRange.filter_pickup_date_to,
        'units_selection': getElementValue(REPEAT_RENTAL_CONFIG.ELEMENTS.UNITS_SELECTION)
    };
    window.dataLayer.push(eventData);
}

// Function to attach event listeners to modal elements
function attachModalEventListeners() {
    var checkAvailability = document.querySelector('[data-testid="' + REPEAT_RENTAL_CONFIG.ELEMENTS.CHECK_AVAILABILITY + '"]');
    var startNew = document.querySelector('[data-testid="' + REPEAT_RENTAL_CONFIG.ELEMENTS.START_NEW + '"]');
    if (checkAvailability) {
        checkAvailability.addEventListener('click', handleCheckAvailabilityClick);
    }
    if (startNew) {
        startNew.addEventListener('click', handleStartNewClick);
    }
}

// Function to attach event listeners
function attachEventListeners() {
    var repeatButton = getRepeatAgreementButton();
    if (repeatButton) {
        repeatButton.addEventListener('click', handleRepeatButtonClick);
    }
    // Set up MutationObserver to watch for modal
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            var checkAvailability = document.querySelector('[data-testid="' + REPEAT_RENTAL_CONFIG.ELEMENTS.CHECK_AVAILABILITY + '"]');
            if (checkAvailability) {
                attachModalEventListeners();
                observer.disconnect();
            }
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Initialize listeners when DOM is ready
if (document.readyState === 'complete') {
    attachEventListeners();
} else {
    document.addEventListener('DOMContentLoaded', attachEventListeners);
    document.addEventListener('load', attachEventListeners);
}
</script>
