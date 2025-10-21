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
                'rental_duration_hours': rentalDuration  // Rental duration in hours
            }, getRyderEventProps()));

            // Watch the page for the appearance of rental_order_id element
            watchForRentalOrderConfirmation();
        }
    });
}

// Function to watch for rental_order_id and send a new event
function watchForRentalOrderConfirmation() {
    // Create an observer instance to monitor DOM changes
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if rental_order_id element appears and if the event hasn't already been sent
            if (!confirmationEventSent) {
                var rentalOrderIdElement = document.querySelector('[data-testid="rental_order_id"]');
                if (rentalOrderIdElement) {
                    var rentalOrderId = rentalOrderIdElement.innerText;

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
                    window.KAMPYLE_ONSITE_SDK.updatePageView()
                    console.log("Medallia script being called for refresh")

                    // Mark that the confirmation event has been sent
                    confirmationEventSent = true;

                    // Stop observing once the rental order is found
                    observer.disconnect();

                    // Now also attach listener for the "Create an account" button
                    attachCreateAccountButtonListener(rentalOrderId, pendingReservations);
                }
            }
        });
    });

    // Start observing the entire document for DOM changes
    observer.observe(document.body, { childList: true, subtree: true });
}

// Function to listen for the "View Rates" button click
function attachViewRatesButtonListener() {
    document.addEventListener('click', function(event) {
        var element = event.target.closest('[data-testid="rental_order_view_rates_button"]');
        if (element) {
            var comments = document.querySelector('[data-testid="rental_order_leave_comments"]') ? document.querySelector('[data-testid="rental_order_leave_comments"]').value : 'none';
            var pickupDateFromDOM = document.querySelector('[data-testid="rental_order_pickup_date_time"] .text-xl') ? document.querySelector('[data-testid="rental_order_pickup_date_time"] .text-xl').innerText : 'none';
            var dropoffDateFromDOM = document.querySelector('[data-testid="rental_order_dropoff_date_time"] .text-xl') ? document.querySelector('[data-testid="rental_order_dropoff_date_time"] .text-xl').innerText : 'none';

            dataLayer.push(Object.assign({
                'event': 'create_rental_order_activity',
                'element_click': 'rental_order_view_rates_button',
                'step': 'rental_order_review_order_page',
                'comments': comments,
                'lead_time_hours': calculateLeadTime(fromDate),
                'rental_duration_hours': calculateRentalDuration(pickupDateFromDOM, dropoffDateFromDOM),
                'user_id': window.oktaUid,
                'user_type': userType
            }, getRyderEventProps()));
        }
    }, true);
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
    attachViewRatesButtonListener();
});
  
window.addEventListener('load', function() {
    attachFormSubmitListener();
    attachViewRatesButtonListener();
});

// Also check if the document is already loaded
if (document.readyState === 'complete') {
    attachFormSubmitListener();
    attachViewRatesButtonListener();
}
</script>