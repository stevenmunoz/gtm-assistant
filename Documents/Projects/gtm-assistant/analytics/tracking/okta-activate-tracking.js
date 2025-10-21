<script>
// Utility function to get user email
function getUserEmail() {
    var emailInput = document.querySelector('[data-testid="okta_activate_email_input"]');
    return emailInput ? emailInput.value : 'none';
}

// Utility function to push to dataLayer
function pushToDataLayer(elementClick) {
    dataLayer.push({
        'event': 'okta_activate_activity',
        'element_click': elementClick,
        'user_email': getUserEmail()
    });
}

// Function to attach all event listeners
function attachEventListeners() {
    // Verify account form submission
    document.addEventListener('submit', function(event) {
        if (event.target.id === 'verifyAccount') {
            pushToDataLayer('okta_activate_send_link_button');
        }
    }, true);

    // Contact support button clicks
    document.addEventListener('click', function(event) {
        var element = event.target.closest('[data-testid="okta_activate_contact_support_button"]');
        if (element) {
            event.stopPropagation(); // Prevent event from bubbling up
            pushToDataLayer('okta_activate_contact_support_button');
        }
    }, true);

    // Login link clicks
    document.addEventListener('click', function(event) {
        var element = event.target.closest('[data-testid="okta_activate_existing_login_button"]');
        if (element) {
            event.stopPropagation(); // Prevent event from bubbling up
            pushToDataLayer('okta_activate_login_button');
        }
    }, true);
}

// Initialize listeners
['DOMContentLoaded', 'load'].forEach(function(event) {
    document.addEventListener(event, attachEventListeners);
});

// Also attach if document is already loaded
if (document.readyState === 'complete') {
    attachEventListeners();
}
</script> 