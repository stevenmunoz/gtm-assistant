<script>
// Store form data globally
var storedFormData = (function() {
    // Try to get data from localStorage first
    var savedData = localStorage.getItem('registrationFormData');
    if (savedData) {
        return JSON.parse(savedData);
    }
    // Default values if no data in localStorage
    return {
        first_name: 'none',
        last_name: 'none',
        phone_number: 'none',
        work_email: 'none'
    };
})();

// Flag to prevent duplicate events
var eventFired = false;

// Utility function to get form field value
function getFormFieldValue(dataTestId) {
    var element = document.querySelector('[data-testid="' + dataTestId + '"]');
    return element ? element.value : 'none';
}

// Utility function to get all form fields
function getFormFields() {
    var fields = {
        first_name: getFormFieldValue('rental_application_first_name_input'),
        last_name: getFormFieldValue('rental_application_last_name_input'),
        phone_number: getFormFieldValue('rental_application_phone_number_input'),
        work_email: getFormFieldValue('rental_application_work_email_input')
    };
    
    // Save to localStorage whenever we get form fields
    localStorage.setItem('registrationFormData', JSON.stringify(fields));
    
    return fields;
}

// Function to push data to dataLayer for registration events
function pushToDataLayer(elementClick, step) {
    // Prevent duplicate events for the same step
    if (eventFired && step === 'submit_registration_form') {
        return;
    }
    
    // Get user_id from window.oktaUid
    var userId = window.oktaUid || 'not_available';
    
    var data = {
        'event': 'renter_registration_activity',
        'element_click': elementClick,
        'step': step,
        'user_id': userId,
        'first_name': storedFormData.first_name,
        'last_name': storedFormData.last_name,
        'phone_number': storedFormData.phone_number,
        'work_email': storedFormData.work_email
    };

    dataLayer.push(data);
    
    // Set flag to prevent duplicate registration events
    if (step === 'submit_registration_form') {
        eventFired = true;
    }
}

// Function to check if current page is registration page
function isRegistrationPage() {
    return window.location.pathname.indexOf('/register') !== -1;
}

// Function to attach all event listeners
function attachEventListeners() {
    // Only attach listeners if we're on a registration page
    if (!isRegistrationPage()) {
        return;
    }
    
    // Single click listener for both buttons
    document.addEventListener('click', function(event) {
        var continueButton = event.target.closest('[data-testid="rental_application_continue_button"]');
        var resendButton = event.target.closest('[data-testid="rental_application_resend_link_button"]');
        
        if (continueButton) {
            // Update stored form data with current values
            storedFormData = getFormFields();
            
            // Push registration event
            pushToDataLayer(
                'rental_application_continue_button',
                'submit_registration_form'
            );
        }
        
        if (resendButton) {
            // Push resend verification event
            pushToDataLayer(
                'rental_application_resend_link_button',
                'resend_verification'
            );
        }
    });
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
