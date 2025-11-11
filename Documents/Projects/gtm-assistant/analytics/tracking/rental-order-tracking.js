<script>
// Flag to ensure rental order confirmation is only sent once
var confirmationEventSent = false;

// Variable to store quantity input, fromDate (requestedPickupDate), and untilDate (dropoffDate) from the data layer
var quantityInputValue = 'none';
var fromDate = 'none';
var untilDate = 'none';
var formEntries = {};

// Variable to store the location text across submissions
var storedLocationText = 'none';
var vehicleTypeInput = 'none';

// Determine user type based on OKTA ID
var userType = window.oktaUid ? 'authenticated' : 'not-authenticated';

// Function to calculate lead time in hours
function calculateLeadTime(requestedPickupDate) {
    var currentDate = new Date();
    var requestedDate = new Date(requestedPickupDate);

    // Calculate the difference in time (milliseconds) and convert to hours
    var timeDifference = requestedDate - currentDate;
    var leadTimeInHours = Math.floor(timeDifference / (1000 * 60 * 60));

    return leadTimeInHours > 0 ? leadTimeInHours : 0;  // Return 0 if lead time is negative
}

// Function to calculate the rental duration in hours
function calculateRentalDuration(pickupDate, dropoffDate) {
    var pickupDateTime = new Date(pickupDate);
    var dropoffDateTime = new Date(dropoffDate);

    // Calculate the difference in time (milliseconds) and convert to hours
    var timeDifference = dropoffDateTime - pickupDateTime;
    var rentalDurationInHours = Math.floor(timeDifference / (1000 * 60 * 60));

    return rentalDurationInHours > 0 ? rentalDurationInHours : 0;  // Return 0 if duration is negative
}

// Function to print all form controls
function logFormControls(form) {
    var formData = new FormData(form);
    formEntries = {}; // Clear previous formEntries

    formData.forEach(function(value, key) {
        formEntries[key] = value;
        //console.log(key + ":" + value);
    });

    // Update storedLocationText only if the new value is not empty and is different from the stored value
    if (formEntries["location-text"] && formEntries["location-text"] !== storedLocationText) {
        storedLocationText = formEntries["location-text"];
    }
}

// Function to attach form submit listener
function attachFormSubmitListener() {
    document.addEventListener('submit', function(event) {
        var form = event.target;

        // Log all form controls
        logFormControls(form);

        // For form with ID 'search-location'
        if (form.id === 'search-location') {
            // Capture relevant fields from the search location page
            var vehicleTypeInput = formEntries["product"];
            var poNumberInput = formEntries["poNumber"];
            fromDate = formEntries["pickupDate"];
            untilDate = formEntries["dropOffDate"];
            var quantityInput = formEntries["units"];

            dataLayer.push(Object.assign({
                'event': 'create_rental_order_activity',
                'element_click': 'rental_order_search_location_button',
                'step': 'rental_order_select_location_page',
                'user_id': window.oktaUid,
                'user_type': userType,
                'location_input': storedLocationText,
                'vehicle_type_input': vehicleTypeInput,
                'po_number_input': poNumberInput,
                'from_date_picker': fromDate,
                'until_date_picker': untilDate,
                'quantity_input': quantityInput
            }, getRyderEventProps()));
        }

        // For form with ID 'select-location' (Next Step button clicked)
        if (form.id === 'select-location') {
            // Capture relevant fields from the select location page
            var vehicleTypeInput = formEntries["product"];
            var poNumberInput = formEntries["poNumber"];
            fromDate = formEntries["pickupDate"];
            untilDate = formEntries["dropOffDate"];
            var quantityInput = formEntries["units"];
            var locationSelected = formEntries["locationName"];
            var distance = formEntries["distance"];

            // Store quantity input for use in the confirmation step
            quantityInputValue = quantityInput;

            // Push the data to the data layer
            dataLayer.push(Object.assign({
                'event': 'create_rental_order_activity',
                'element_click': 'rental_order_review_order_button', // Updated element_click
                'step': 'rental_order_select_location_page', // Updated step name
                'user_id': window.oktaUid,
                'user_type': userType,  // New parameter
                'location_input': storedLocationText, // Use the stored location text
                'vehicle_type_input': vehicleTypeInput,
                'po_number_input': poNumberInput,
                'from_date_picker': fromDate,
                'until_date_picker': untilDate,
                'quantity_input': quantityInput,
                'location_selected': locationSelected,
                'distance': distance
            }, getRyderEventProps()));
        }

        // For form with ID 'order-review' (Submit Order)
        if (form.id === 'order-review') {
            // Determine step based on user type and the presence of additional details
            var step = 'rental_order_review_order_page';

            // Capture comments field for submit order
            var comments = document.querySelector('[data-testid="rental_order_leave_comments"]') ? document.querySelector('[data-testid="rental_order_leave_comments"]').value : 'none';

            // Capture company information fields
            var companyName = document.querySelector('[data-testid="rental_application_company_name_input"]') ? document.querySelector('[data-testid="rental_application_company_name_input"]').value : 'none';
            var dotNumber = document.querySelector('[data-testid="rental_application_dot_number_input"]') ? document.querySelector('[data-testid="rental_application_dot_number_input"]').value : 'none';
            var physicalAddress = document.querySelector('[data-testid="rental_application_company_address_input"]') ? document.querySelector('[data-testid="rental_application_company_address_input"]').value : 'none';
            var physicalAptSuite = document.querySelector('[data-testid="rental_application_company_apt_suite_input"]') ? document.querySelector('[data-testid="rental_application_company_apt_suite_input"]').value : 'none';
            var billingAddress = document.querySelector('[data-testid="rental_application_billing_address_input"]') ? document.querySelector('[data-testid="rental_application_billing_address_input"]').value : 'none';
            var billingAptSuite = document.querySelector('[data-testid="rental_application_billing_apt_suite_input"]') ? document.querySelector('[data-testid="rental_application_billing_apt_suite_input"]').value : 'none';

            // Calculate lead time in hours
            var leadTime = calculateLeadTime(fromDate);

            // Extract the "From Date" and "Until Date" using the correct data-testid attributes
            var fromDateElem = document.querySelector('[data-testid="rental_order_pickup_date_time"] .text-xl');
            var untilDateElem = document.querySelector('[data-testid="rental_order_dropoff_date_time"] .text-xl');

            // Get the innerText of these elements (date text only)
            var pickupDateFromDOM = fromDateElem ? fromDateElem.innerText : 'none';
            var dropoffDateFromDOM = untilDateElem ? untilDateElem.innerText : 'none';

            // Calculate rental duration in hours (fromDate to untilDate)
            var rentalDuration = calculateRentalDuration(pickupDateFromDOM, dropoffDateFromDOM);

            // Push the data to the data layer
            dataLayer.push(Object.assign({
                'event': 'create_rental_order_activity',
                'element_click': 'rental_order_submit_order_button',
                'step': step,  // Updated step name based on prospect data
                'user_type': userType,  // New parameter
                'comments': comments,
                'lead_time_hours': leadTime, // Lead time in hours
                'rental_duration_hours': rentalDuration,  // Rental duration in hours
                'company_name': companyName,
                'dot_number': dotNumber,
                'physical_address': physicalAddress,
                'physical_apt_suite': physicalAptSuite,
                'billing_address': billingAddress,
                'billing_apt_suite': billingAptSuite
            }, getRyderEventProps()));

            // Watch the page for the appearance of rental_order_id element
            watchForRentalOrderConfirmation();
        }
    });
}

// Function to watch for rental order confirmation page
function watchForRentalOrderConfirmation() {
    // Since order ID is now in URL, check immediately and set up URL change detection
    checkForConfirmationPage();

    // Set up listeners for URL changes (for SPA navigation)
    setupUrlChangeListeners();

    // Also keep a fallback periodic check for URL-based detection
    var checkCount = 0;
    var maxChecks = 40; // Check for up to 20 seconds (500ms * 40) to account for navigation time
    var fallbackInterval = setInterval(function() {
        checkCount++;

        if (confirmationEventSent || checkCount >= maxChecks) {
            clearInterval(fallbackInterval);
            return;
        }

        checkForConfirmationPage();
    }, 500);
}

// Function to check if we're currently on the confirmation page
function checkForConfirmationPage() {
    var currentUrl = window.location.href;
    var isConfirmationPage = currentUrl.includes('/confirmation') || currentUrl.includes('/orders/confirmation');

    if (isConfirmationPage && !confirmationEventSent) {
        var rentalOrderIdElement = findRentalOrderElement();
        if (rentalOrderIdElement) {
            sendConfirmationEvent(rentalOrderIdElement);
            return true;
        }
    }
    return false;
}

// Function to set up URL change listeners for SPA navigation
function setupUrlChangeListeners() {
    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', function() {
        setTimeout(checkForConfirmationPage, 100); // Small delay to ensure URL has updated
    });

    // Listen for pushState/replaceState (programmatic navigation)
    var originalPushState = history.pushState;
    var originalReplaceState = history.replaceState;

    history.pushState = function() {
        originalPushState.apply(history, arguments);
        setTimeout(checkForConfirmationPage, 100);
    };

    history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        setTimeout(checkForConfirmationPage, 100);
    };

    // Also listen for hash changes
    window.addEventListener('hashchange', function() {
        setTimeout(checkForConfirmationPage, 100);
    });
}

// Helper function to extract rental order ID from URL or DOM elements
function findRentalOrderElement() {
    // First, try to extract order ID from URL path
    var orderIdFromUrl = extractOrderIdFromUrl();
    if (orderIdFromUrl) {
        // Create a virtual element to return the order ID
        return {
            innerText: orderIdFromUrl,
            trim: function() { return orderIdFromUrl; }
        };
    }

    // Fallback to DOM element search (legacy support)
    var selectors = [
        '[data-testid="rental_order_id"]',
        '[data-testid="rental-order-id"]',
        '[data-testid*="rental_order"]',
        '[data-testid*="rental-order"]',
        '[data-testid*="order_id"]',
        '[data-testid*="order-id"]',
        '.rental-order-id',
        '#rental-order-id',
        '[class*="rental-order"]',
        '[id*="rental-order"]',
        '[class*="order-id"]',
        '[id*="order-id"]'
    ];

    for (var i = 0; i < selectors.length; i++) {
        var element = document.querySelector(selectors[i]);
        if (element && element.innerText && element.innerText.trim()) {
            return element;
        }
    }

    return null;
}

// Helper function to extract order ID from URL patterns
function extractOrderIdFromUrl() {
    var pathname = window.location.pathname;

    // Pattern 1: /orders/confirmation/12345
    var confirmationMatch = pathname.match(/\/orders\/confirmation\/(\d+)/);
    if (confirmationMatch) {
        return confirmationMatch[1];
    }

    // Pattern 2: /confirmation/12345
    var confirmationMatch2 = pathname.match(/\/confirmation\/(\d+)/);
    if (confirmationMatch2) {
        return confirmationMatch2[1];
    }

    // Pattern 3: URL parameters like ?orderId=12345 or ?order_id=12345
    var urlParams = new URLSearchParams(window.location.search);
    var orderIdParam = urlParams.get('orderId') || urlParams.get('order_id') || urlParams.get('orderID');
    if (orderIdParam) {
        return orderIdParam;
    }

    // Pattern 4: Hash-based routing like #/orders/12345
    var hash = window.location.hash;
    if (hash) {
        var hashMatch = hash.match(/\/orders\/(\d+)/);
        if (hashMatch) {
            return hashMatch[1];
        }
    }

    // Pattern 5: Any number at the end of the path (fallback)
    var endNumberMatch = pathname.match(/\/(\d+)\/?$/);
    if (endNumberMatch && endNumberMatch[1].length >= 4) { // At least 4 digits
        return endNumberMatch[1];
    }

    return null;
}

// Helper function to send confirmation event
function sendConfirmationEvent(rentalOrderIdElement) {
    if (confirmationEventSent) return;

    var rentalOrderId = rentalOrderIdElement.innerText.trim();

    // Use the previously stored quantity input value from the data layer
    var pendingReservations = quantityInputValue;

    // Push the event to the data layer when rental_order_id appears
    dataLayer.push(Object.assign({
        'event': 'create_rental_order_activity',
        'element_click': 'rental_order_confirmation_page',
        'step': 'rental_order_confirmation_page',
        'user_type': userType,  // New parameter
        'rental_order_number': rentalOrderId,
        'pending_reservations': pendingReservations
    }, getRyderEventProps()));

    dataLayer.push(Object.assign({
        'event': 'order_confirmation',
        'rental_order_number': rentalOrderId
    }, getRyderEventProps()));

    //Refresh Medallia survey to solve client-side routing issues
    if (window.KAMPYLE_ONSITE_SDK && window.KAMPYLE_ONSITE_SDK.updatePageView) {
        window.KAMPYLE_ONSITE_SDK.updatePageView();
    }

    // Mark that the confirmation event has been sent
    confirmationEventSent = true;

    // Now also attach listener for the "Create an account" button
    if (typeof attachCreateAccountButtonListener === 'function') {
        attachCreateAccountButtonListener(rentalOrderId, pendingReservations);
    }
}

// Utility function to merge window.ryder properties (truncated to 40 chars) and add experiments string of full names
function getRyderEventProps() {
    var ryder = window.ryder || {};
    var properties = Object.getOwnPropertyNames(ryder);
    var eventProps = {};
    properties.forEach(function(key) {
        var truncatedKey = key.length > 40 ? key.substring(0, 40) : key;
        eventProps[truncatedKey] = ryder[key];
    });
    eventProps.experiments = properties.length ? properties.join(',') : '';
    return eventProps;
}

// Attach the event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    attachFormSubmitListener();
});

window.addEventListener('load', function() {
    attachFormSubmitListener();
});

// Also check if the document is already loaded
if (document.readyState === 'complete') {
    attachFormSubmitListener();
}
</script>