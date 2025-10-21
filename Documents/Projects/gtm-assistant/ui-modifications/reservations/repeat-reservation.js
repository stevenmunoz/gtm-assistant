<script>
// Configuration for repeat reservation tracking
var REPEAT_RESERVATION_CONFIG = {
    EVENT_NAME: 'reservation_repeat_activity',
    ELEMENTS: {
        REPEAT_BUTTON: 'res_details_repeat_button',
        CHECK_AVAILABILITY: 'repeat_modal_check_availability_button',
        START_NEW: 'repeat_modal_start_new_reservation_link',
        RESERVATION_NUMBER: 'res_details_reservation_number',
        RYDER_FLAG: 'res_details_ryder_reservation_flag',
        RENTAL_ORDER: 'res_details_rental_order_id',
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
    switch(field) {
        case 'reservation_id':
            // Extract only the number from "Reservation 465470"
            var match = value.match(/\d+/);
            var result = match ? match[0] : '';
            return result;
        
        case 'provider':
            // Extract only "Ryder Fleet" from "Ryder FleetThis is a Ryder reservation"
            var match = value.match(/^[^T]+/);
            var result = match ? match[0].trim() : '';
            return result;
        
        case 'rental_order_number':
            // Extract only the number after # from "Rental order ID #653"
            var match = value.match(/#(\d+)/);
            var result = match ? match[1] : '';
            return result;
        
        default:
            return value;
    }
}

// Utility function to get date range values
function getDateRangeValues() {
    var range = getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.DATE_RANGE);
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

// Function to handle repeat button click
function handleRepeatButtonClick() {
    var eventData = {
        'event': REPEAT_RESERVATION_CONFIG.EVENT_NAME,
        'element_click': REPEAT_RESERVATION_CONFIG.ELEMENTS.REPEAT_BUTTON,
        'okta_id': window.oktaUid || '',
        'reservation_id': parseFieldValue('reservation_id', getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.RESERVATION_NUMBER)),
        'provider': parseFieldValue('provider', getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.RYDER_FLAG)),
        'rental_order_number': parseFieldValue('rental_order_number', getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.RENTAL_ORDER))
    };
    
    window.dataLayer.push(eventData);
}

// Function to handle check availability click
function handleCheckAvailabilityClick(event) {
    // Prevent default form submission if it's a button inside a form
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    
    var dateRange = getDateRangeValues();
    var eventData = {
        'event': REPEAT_RESERVATION_CONFIG.EVENT_NAME,
        'element_click': REPEAT_RESERVATION_CONFIG.ELEMENTS.CHECK_AVAILABILITY,
        'okta_id': window.oktaUid || '',
        'reservation_id': parseFieldValue('reservation_id', getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.RESERVATION_NUMBER)),
        'provider': parseFieldValue('provider', getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.RYDER_FLAG)),
        'rental_order_number': parseFieldValue('rental_order_number', getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.RENTAL_ORDER)),
        'vehicle_type_input': getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.VEHICLE_TYPE_INPUT),
        'current_location': getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.CURRENT_LOCATION),
        'filter_pickup_date_from': dateRange.filter_pickup_date_from,
        'filter_pickup_date_to': dateRange.filter_pickup_date_to,
        'units_selection': getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.UNITS_SELECTION)
    };
    
    window.dataLayer.push(eventData);
}

// Function to handle start new reservation click
function handleStartNewClick() {
    var dateRange = getDateRangeValues();
    var eventData = {
        'event': REPEAT_RESERVATION_CONFIG.EVENT_NAME,
        'element_click': REPEAT_RESERVATION_CONFIG.ELEMENTS.START_NEW,
        'okta_id': window.oktaUid || '',
        'reservation_id': parseFieldValue('reservation_id', getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.RESERVATION_NUMBER)),
        'provider': parseFieldValue('provider', getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.RYDER_FLAG)),
        'rental_order_number': parseFieldValue('rental_order_number', getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.RENTAL_ORDER)),
        'vehicle_type_input': getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.VEHICLE_TYPE_INPUT),
        'current_location': getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.CURRENT_LOCATION),
        'filter_pickup_date_from': dateRange.filter_pickup_date_from,
        'filter_pickup_date_to': dateRange.filter_pickup_date_to,
        'units_selection': getElementValue(REPEAT_RESERVATION_CONFIG.ELEMENTS.UNITS_SELECTION)
    };
    
    window.dataLayer.push(eventData);
}

// Function to attach event listeners to modal elements
function attachModalEventListeners() {
    var checkAvailability = document.querySelector('[data-testid="' + REPEAT_RESERVATION_CONFIG.ELEMENTS.CHECK_AVAILABILITY + '"]');
    var startNew = document.querySelector('[data-testid="' + REPEAT_RESERVATION_CONFIG.ELEMENTS.START_NEW + '"]');
    
    if (checkAvailability) {
        checkAvailability.addEventListener('click', handleCheckAvailabilityClick);
    }
    
    if (startNew) {
        startNew.addEventListener('click', handleStartNewClick);
    }
}

// Function to attach event listeners
function attachEventListeners() {
    var repeatButton = document.querySelector('[data-testid="' + REPEAT_RESERVATION_CONFIG.ELEMENTS.REPEAT_BUTTON + '"]');
    
    if (repeatButton) {
        repeatButton.addEventListener('click', handleRepeatButtonClick);
    }
    
    // Set up MutationObserver to watch for modal
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // Check if any of the added nodes is our modal button
                var checkAvailability = document.querySelector('[data-testid="' + REPEAT_RESERVATION_CONFIG.ELEMENTS.CHECK_AVAILABILITY + '"]');
                if (checkAvailability) {
                    attachModalEventListeners();
                    // Disconnect observer after finding the modal
                    observer.disconnect();
                }
            }
        });
    });
    
    // Start observing the document body for added nodes
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
