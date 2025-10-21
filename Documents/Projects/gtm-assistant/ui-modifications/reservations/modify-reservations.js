<script>
// Configuration Objects
var EVENT_CONFIG = {
    MODIFY_RESERVATION: {
        name: 'reservation_modify_activity',
        elements: {
            MODIFY: 'res_details_modify_reservation_button',
            CANCEL: 'res_details_cancel_reservation_button',
            APPLY_CHANGES: 'res_modify_apply_changes_button',
            CONFIRM_CHANGES: 'res_modify_request_details_confirm_changes_button',
            CALL_SUPPORT: 'res_details_call_support_button',
            COOP_MODIFY: 'res_details_coop_modify_modal_open_in_coop_button',
            VIEW_CHANGE_REQUEST: 'res_details_view_change_request_button'
        },
        steps: {
            MODIFY: 'res_modify_res_details_screen',
            CANCEL: 'res_cancel_res_details_screen',
            APPLY_CHANGES: 'res_modify_apply_changes_screen',
            CONFIRM_CHANGES: 'res_modify_confirm_changes_screen',
            CALL_SUPPORT: 'res_modify_result_details_screen',
            COOP_MODIFY: 'res_modify_coop_modify_screen',
            VIEW_CHANGE_REQUEST: 'res_modify_details_screen'
        }
    }
};

var SELECTORS = {
    ELEMENTS: {
        RESERVATION_NUMBER: '[data-testid="res_details_reservation_number"]',
        RYDER_FLAG: '[data-testid="res_details_ryder_reservation_flag"]',
        COOP_FLAG: '[data-testid="coop_reservation_flag"]',
        CONFIRMATION_ID: '[data-testid="res_details_ryder_confirmation_id"]',
        CURRENT_VEHICLE_TYPE: '[data-testid="res_modify_vehicle_type"]',
        CURRENT_PICKUP_DATE: '[data-testid="res_modify_pickup_date"]',
        CURRENT_DROPOFF_DATE: '[data-testid="res_modify_dropoff_date"]',
        CURRENT_LOCATION: '[data-testid="res_modify_location"]',
        NEW_VEHICLE_TYPE: '[data-testid="res_modify_search_vehicle_selector"]',
        NEW_PICKUP_DATE: '[data-testid="rental_order_from_date_selector"]',
        NEW_DROPOFF_DATE: '[data-testid="rental_order_to_date_selector"]',
        NEW_LOCATION: '[data-testid="res_modify_search_location_selector"]',
        TIME_SELECTOR: '[data-testid="res_modify_time_selector"]'
    }
};

// Utility Functions
var DOMUtils = {
    getElementValue: function(selector) {
        var element = document.querySelector(selector);
        return element ? element.value || element.textContent.trim() : 'none';
    },
    getNumberOnly: function(selector) {
        var element = document.querySelector(selector);
        if (!element) return 'none';
        var text = element.textContent.trim();
        // Extract only the numbers from the text
        var matches = text.match(/\d+/);
        return matches ? matches[0] : 'none';
    },
    elementExists: function(selector) {
        return !!document.querySelector(selector);
    },
    getSelectValue: function(selector) {
        var element = document.querySelector(selector);
        return element ? element.value || 'none' : 'none';
    },
    getFormattedDate: function(selector) {
        var element = document.querySelector(selector);
        if (!element) return 'none';
        var text = element.textContent.trim();
        // Extract the date pattern "MM/DD/YYYY at HH:MM am/pm TZ"
        var matches = text.match(/\d{2}\/\d{2}\/\d{4} at \d{2}:\d{2} [ap]m [A-Z]{3}/);
        return matches ? matches[0] : 'none';
    },
    getNewFormattedDate: function(selector) {
        var dateElement = document.querySelector('[data-testid="rental_order_from_date_selector"]');
        if (!dateElement) return 'none';
        
        // Get the date range text
        var dateText = dateElement.value || dateElement.textContent.trim();
        
        // Get the selected time and clean it up
        var timeElement = document.querySelector(SELECTORS.ELEMENTS.TIME_SELECTOR);
        var timeValue = timeElement ? timeElement.value || timeElement.textContent.trim() : '10:00 am';
        
        // Extract just the time portion (HH:MM am/pm)
        var timeMatch = timeValue.match(/\d{2}:\d{2}\s*[ap]m/i);
        var cleanTime = timeMatch ? timeMatch[0] : '10:00 am';
        
        // Extract dates from the range (e.g., "05/02/2025 - 05/15/2025")
        var dates = dateText.split(' - ');
        
        // Return the appropriate date based on which selector we're using
        var date = selector === SELECTORS.ELEMENTS.NEW_PICKUP_DATE ? dates[0] : dates[1];
        
        // Combine date with cleaned time and timezone
        return date ? date + ' at ' + cleanTime + ' CDT' : 'none';
    },
    hasPONumberField: function() {
        // Check if there's a label or text containing "P.O. Number" in the modal
        var modalTexts = document.evaluate(
            "//text()[contains(., 'P.O. Number')]",
            document,
            null,
            XPathResult.ANY_TYPE,
            null
        );
        return modalTexts.iterateNext() !== null;
    },
    getPONumbers: function() {
        if (!this.hasPONumberField()) {
            return {
                current: 'none',
                new: 'none'
            };
        }

        // Get the old and new P.O. Numbers from the modal
        // The structure shows: "— > 456" format where:
        // "—" means current is empty/none
        // "456" is the new value
        var poNumbers = document.querySelectorAll('.flex.flex-col.gap-3 span');
        var currentPO = 'none';
        var newPO = 'none';

        poNumbers.forEach(function(span) {
            var text = span.textContent.trim();
            if (text === '—') {
                currentPO = 'none';
            } else if (text.match(/^\d+$/)) {  // If it's just numbers
                newPO = text;
            }
        });

        return {
            current: currentPO,
            new: newPO
        };
    },
    hasLocationField: function() {
        var modalTexts = document.evaluate(
            "//text()[contains(., 'Location')]",
            document,
            null,
            XPathResult.ANY_TYPE,
            null
        );
        return modalTexts.iterateNext() !== null;
    },
    getLocations: function() {
        if (!this.hasLocationField()) {
            return {
                current: 'none',
                new: 'none'
            };
        }

        // Get the old and new Locations from the modal
        var locationSpans = document.querySelectorAll('.flex.flex-col.gap-3 span');
        var currentLocation = 'none';
        var newLocation = 'none';

        locationSpans.forEach(function(span) {
            var text = span.textContent.trim();
            if (text === '—') {
                currentLocation = 'none';
            } else if (text.includes(',')) {  // Location typically includes a comma for city, state
                newLocation = text;
            }
        });

        return {
            current: currentLocation,
            new: newLocation
        };
    }
};

var DataLayerUtils = {
    push: function(data) {
        dataLayer.push(Object.assign({
            'event': EVENT_CONFIG.MODIFY_RESERVATION.name,
            'okta_id': window.oktaUid || 'none'
        }, data));
    }
};

// Function to determine provider
function getProvider() {
    if (DOMUtils.elementExists(SELECTORS.ELEMENTS.RYDER_FLAG)) {
        return 'Ryder';
    } else if (DOMUtils.elementExists(SELECTORS.ELEMENTS.COOP_FLAG)) {
        return 'COOP';
    }
    return 'none';
}

// Function to handle button clicks
function handleResDetailsClicks(event) {
    // Handle modify and cancel buttons
    var button = event.target.closest('[data-testid="' + EVENT_CONFIG.MODIFY_RESERVATION.elements.MODIFY + '"], [data-testid="' + EVENT_CONFIG.MODIFY_RESERVATION.elements.CANCEL + '"]');
    if (button) {
        var elementClick = button.getAttribute('data-testid');
        var reservationId = DOMUtils.getNumberOnly(SELECTORS.ELEMENTS.RESERVATION_NUMBER);
        var provider = getProvider();
        var rentalOrderNumber = DOMUtils.getNumberOnly(SELECTORS.ELEMENTS.CONFIRMATION_ID);
        
        var step = elementClick === EVENT_CONFIG.MODIFY_RESERVATION.elements.MODIFY 
            ? EVENT_CONFIG.MODIFY_RESERVATION.steps.MODIFY 
            : EVENT_CONFIG.MODIFY_RESERVATION.steps.CANCEL;

        DataLayerUtils.push({
            'element_click': elementClick,
            'reservation_id': reservationId,
            'provider': provider,
            'rental_order_number': rentalOrderNumber,
            'step': step
        });
    }

    // Handle View Details button for change requests
    var viewDetailsButton = event.target.closest('button[aria-haspopup="dialog"]');
    if (viewDetailsButton && viewDetailsButton.textContent.trim() === 'View Details') {
        var reservationId = DOMUtils.getNumberOnly(SELECTORS.ELEMENTS.RESERVATION_NUMBER);
        var provider = getProvider();
        var rentalOrderNumber = DOMUtils.getNumberOnly(SELECTORS.ELEMENTS.CONFIRMATION_ID);

        DataLayerUtils.push({
            'element_click': EVENT_CONFIG.MODIFY_RESERVATION.elements.VIEW_CHANGE_REQUEST,
            'change_request_status': 'pending',
            'reservation_id': reservationId,
            'provider': provider,
            'rental_order_number': rentalOrderNumber,
            'step': EVENT_CONFIG.MODIFY_RESERVATION.steps.MODIFY
        });
    }

    // Handle call support link
    var supportLink = event.target.closest('a[href="tel:888-997-9337"]');
    if (supportLink) {
        var reservationId = DOMUtils.getNumberOnly(SELECTORS.ELEMENTS.RESERVATION_NUMBER);
        var provider = getProvider();
        var rentalOrderNumber = DOMUtils.getNumberOnly(SELECTORS.ELEMENTS.CONFIRMATION_ID);

        DataLayerUtils.push({
            'element_click': EVENT_CONFIG.MODIFY_RESERVATION.elements.CALL_SUPPORT,
            'step': EVENT_CONFIG.MODIFY_RESERVATION.steps.CALL_SUPPORT,
            'reservation_id': reservationId,
            'provider': provider,
            'rental_order_number': rentalOrderNumber
        });
    }

    // Handle COOP modify button
    var coopModifyButton = event.target.closest('[data-testid="' + EVENT_CONFIG.MODIFY_RESERVATION.elements.COOP_MODIFY + '"]');
    if (coopModifyButton) {
        var reservationId = DOMUtils.getNumberOnly(SELECTORS.ELEMENTS.RESERVATION_NUMBER);
        var provider = getProvider();
        var rentalOrderNumber = DOMUtils.getNumberOnly(SELECTORS.ELEMENTS.CONFIRMATION_ID);

        DataLayerUtils.push({
            'element_click': EVENT_CONFIG.MODIFY_RESERVATION.elements.COOP_MODIFY,
            'step': EVENT_CONFIG.MODIFY_RESERVATION.steps.COOP_MODIFY,
            'reservation_id': reservationId,
            'provider': provider,
            'rental_order_number': rentalOrderNumber
        });
    }
}

// Function to handle Apply Changes button
function handleApplyChangesClick(event) {
    var applyButton = event.target;
    if (applyButton && 
        applyButton.tagName.toLowerCase() === 'button' && 
        applyButton.textContent.trim() === 'Apply Changes') {
        
        DataLayerUtils.push({
            'element_click': EVENT_CONFIG.MODIFY_RESERVATION.elements.APPLY_CHANGES,
            'step': EVENT_CONFIG.MODIFY_RESERVATION.steps.APPLY_CHANGES,
            'current_vehicle_type': DOMUtils.getElementValue(SELECTORS.ELEMENTS.CURRENT_VEHICLE_TYPE),
            'current_pickup_date': DOMUtils.getFormattedDate(SELECTORS.ELEMENTS.CURRENT_PICKUP_DATE),
            'current_dropoff_date': DOMUtils.getFormattedDate(SELECTORS.ELEMENTS.CURRENT_DROPOFF_DATE),
            'current_location': DOMUtils.getElementValue(SELECTORS.ELEMENTS.CURRENT_LOCATION),
            'new_vehicle_type': DOMUtils.getSelectValue(SELECTORS.ELEMENTS.NEW_VEHICLE_TYPE),
            'new_pickup_date': DOMUtils.getNewFormattedDate(SELECTORS.ELEMENTS.NEW_PICKUP_DATE),
            'new_dropoff_date': DOMUtils.getNewFormattedDate(SELECTORS.ELEMENTS.NEW_DROPOFF_DATE),
            'new_location': DOMUtils.getSelectValue(SELECTORS.ELEMENTS.NEW_LOCATION)
        });
    }
}

// Function to handle Confirm Changes button
function handleConfirmChangesClick(event) {
    var confirmButton = event.target;
    if (confirmButton && 
        confirmButton.tagName.toLowerCase() === 'button' && 
        confirmButton.textContent.trim() === 'Confirm Changes') {
        
        var poNumbers = DOMUtils.getPONumbers();
        var locations = DOMUtils.getLocations();
        
        DataLayerUtils.push({
            'element_click': EVENT_CONFIG.MODIFY_RESERVATION.elements.CONFIRM_CHANGES,
            'step': EVENT_CONFIG.MODIFY_RESERVATION.steps.CONFIRM_CHANGES,
            'current_po_number': poNumbers.current,
            'new_po_number': poNumbers.new,
            'current_selected_location': locations.current,
            'new_selected_location': locations.new
        });
    }
}

// Function to attach event listeners
function attachEventListeners() {
    document.addEventListener('click', handleResDetailsClicks);
    document.addEventListener('click', handleApplyChangesClick);
    document.addEventListener('click', handleConfirmChangesClick);
}

// Initialize listeners
['DOMContentLoaded', 'load'].forEach(function(eventName) {
    document.addEventListener(eventName, attachEventListeners);
});

// Also attach if document is already loaded
if (document.readyState === 'complete') {
    attachEventListeners();
}
</script>
