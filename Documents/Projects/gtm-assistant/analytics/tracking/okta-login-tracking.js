<script>
// Flags to prevent duplicate events
var accountNotFoundEventSent = false;
var activationPendingEventSent = false;
var loginFormSubmitted = false;
var loginSuccessEventSent = false;

// Utility function to store user email in localStorage
function storeUserEmail() {
    var emailInput = document.querySelector('[data-testid="login_access_account_email_input"]');
    if (emailInput && emailInput.value) {
        try {
            localStorage.setItem('ryder_login_email', emailInput.value);
        } catch (e) {
            // LocalStorage not available
        }
    }
}

// Utility function to get user email
function getUserEmail() {
    var emailInput = document.querySelector('[data-testid="login_access_account_email_input"]');

    // If email input exists, store it and return its value
    if (emailInput && emailInput.value) {
        storeUserEmail();
        return emailInput.value;
    }

    // Otherwise, try to get from localStorage
    try {
        var storedEmail = localStorage.getItem('ryder_login_email');
        if (storedEmail) {
            return storedEmail;
        }
    } catch (e) {
        // LocalStorage not available
    }

    return 'none';
}

// Function to check for "Account not found" message
function checkAccountNotFound() {
    if (accountNotFoundEventSent) return;

    var bodyText = document.body.innerText || document.body.textContent;
    if (bodyText.indexOf('Account not found') !== -1) {
        pushToDataLayer('login_access_account_next_button', 'new_user');
        accountNotFoundEventSent = true;
    }
}

// Function to check for "Verify your email address" message
function checkActivationPending() {
    if (activationPendingEventSent) return;

    var bodyText = document.body.innerText || document.body.textContent;
    if (bodyText.indexOf('Verify your email address') !== -1) {
        pushToDataLayer('login_access_account_next_button', 'activation_pending');
        activationPendingEventSent = true;
    }
}

// Function to check if we're on the login page
function isLoginPage() {
    return window.location.pathname === '/login';
}

// Function to check if login error exists
function hasLoginError() {
    var bodyText = document.body.innerText || document.body.textContent;
    return bodyText.indexOf('Unable to sign in') !== -1;
}

// Function to handle successful login
function handleLoginSuccess() {
    if (loginSuccessEventSent || !loginFormSubmitted) return;

    if (!hasLoginError()) {
        pushToDataLayer('login_verify_password_button', 'existing_user');
        loginSuccessEventSent = true;

        // Clear stored email after successful login
        try {
            localStorage.removeItem('ryder_login_email');
        } catch (e) {
            // LocalStorage not available
        }
    }
}

// Utility function to push to dataLayer
function pushToDataLayer(elementClick, userType) {
    var eventData = {
        'event': 'okta_login_activity',
        'element_click': elementClick,
        'user_email': getUserEmail()
    };

    // Add user_type if provided
    if (userType) {
        eventData.user_type = userType;
    }

    dataLayer.push(eventData);
}

// Function to attach all event listeners
function attachEventListeners() {
    // Check for messages on page load
    checkAccountNotFound();
    checkActivationPending();

    // Store email on page load if available
    storeUserEmail();

    // Monitor email input field and store value when it changes
    var emailInput = document.querySelector('[data-testid="login_access_account_email_input"]');
    if (emailInput) {
        emailInput.addEventListener('blur', storeUserEmail);
        emailInput.addEventListener('input', storeUserEmail);
    }

    // Set up MutationObserver to watch for messages
    var observer = new MutationObserver(function(mutations) {
        checkAccountNotFound();
        checkActivationPending();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Login form submission tracking (only on /login page)
    if (isLoginPage()) {
        // Listen for form submission with action="/login"
        document.addEventListener('submit', function(event) {
            var form = event.target;

            // Store email before form submission
            storeUserEmail();

            if (form.tagName === 'FORM' && form.action && form.action.indexOf('/login') !== -1) {
                loginFormSubmitted = true;
            }
        }, true);

        // Listen for page navigation (successful login)
        window.addEventListener('beforeunload', function() {
            handleLoginSuccess();
        });
    }

    // Store email on any form submission (for multi-step forms)
    document.addEventListener('submit', function(event) {
        storeUserEmail();
    }, true);

    // Verify account form submission
    document.addEventListener('submit', function(event) {
        if (event.target.id === 'verifyAccount') {
            pushToDataLayer('okta_login_send_link_button');
        }
    }, true);

    // Contact support button clicks
    document.addEventListener('click', function(event) {
        var element = event.target.closest('[data-testid="okta_login_contact_support_button"]');
        if (element) {
            event.stopPropagation(); // Prevent event from bubbling up
            pushToDataLayer('okta_login_contact_support_button');
        }
    }, true);

    // Login link clicks
    document.addEventListener('click', function(event) {
        var element = event.target.closest('[data-testid="okta_login_existing_login_button"]');
        if (element) {
            event.stopPropagation(); // Prevent event from bubbling up
            pushToDataLayer('okta_login_login_button');
        }
    }, true);

    // Resend verification link button clicks
    document.addEventListener('click', function(event) {
        var element = event.target;
        // Check if button contains "Resend verification link" text
        if (element.tagName === 'BUTTON' &&
            element.type === 'submit' &&
            (element.innerText || element.textContent).indexOf('Resend verification link') !== -1) {
            pushToDataLayer('login_resend_verification_link_button');
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