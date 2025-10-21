<script>
// Configuration Objects
var EVENT_CONFIG = {
    RENTAL_APPLICATION: {
        name: 'create_rental_application_activity',
        elements: {
            VIEW: 'view_applications_button',
            ALL_TAB: 'all_applications_tab',
            RECEIVED_TAB: 'received_applications_tab',
            APPROVED_TAB: 'approved_applications_tab',
            REJECTED_TAB: 'rejected_applications_tab',
            APPROVE_BUTTON: 'renter_application_approve_button',
            REJECT_BUTTON: 'renter_application_reject_button',
            APPROVE_SUBMIT_BUTTON: 'renter_application_approve_submit_button',
            CANCEL_APPROVAL_BUTTON: 'renter_application_cancel_approval_button',
            REJECT_SUBMIT_BUTTON: 'renter_application_reject_submit_button',
            CANCEL_REJECT_BUTTON: 'renter_application_cancel_reject_button'
        },
        selectors: {
            EQUIPMENT: '[data-testid="renter_application_equipment_type"]',
            AREA: '[data-testid="renter_application_area_of_operation"]',
            UNITS: '[data-testid="renter_application_units_amount"]',
            DURATION: '[data-testid="renter_application_rental_duration"]',
            COVERAGE: '[data-testid="renter_application_insurance_coverage"]',
            PAYMENT_METHOD: '[data-testid="renter_application_payment_method"]',
            REJECTION_COMMENT: 'textarea[name="rejectionComments"]',
            CUSTOMER_ID: 'input[name="customerId"]'
        }
    }
};

// Utility Functions
var DOMUtils = {
    // Clean text by removing prefixes
    cleanText: function(text) {
        return text
            .replace('Customer name ', '')
            .replace('Company name ', '')
            .replace('Company name: ', '')
            .replace('Customer application status ', '')
            .replace('Order status: ', '');
    },
    
    // Find text in an element - checking both sr-only and aria-hidden spans
    findTextInElement: function(element, defaultValue) {
        if (!element) return defaultValue || 'none';
        
        // Try to get text from sr-only span first (desktop view)
        var srSpan = element.querySelector('.sr-only');
        if (srSpan && srSpan.textContent.trim()) {
            return this.cleanText(srSpan.textContent.trim());
        }
        
        // Try to get text from aria-hidden span (mobile view)
        var ariaSpan = element.querySelector('span[aria-hidden="true"]');
        if (ariaSpan && ariaSpan.textContent.trim()) {
            return this.cleanText(ariaSpan.textContent.trim());
        }
        
        // If still no text found, try to get any text content
        var text = element.textContent.trim();
        return text ? this.cleanText(text) : defaultValue || 'none';
    },
    
    // Get details from standard table row (desktop view)
    getDetailsFromTableRow: function(row) {
        if (!row) return { name: 'none', company: 'none', status: 'none' };
        
        return {
            name: this.findTextInElement(row.children[0]),
            company: this.findTextInElement(row.children[1]),
            status: this.findTextInElement(row.children[2])
        };
    },
    
    // Get details from flex container (mobile view)
    getDetailsFromFlexContainer: function(container) {
        if (!container) return { name: 'none', company: 'none', status: 'none' };
        
        // Name is typically in a bold font
        var nameElement = container.querySelector('.font-bold, .font-semibold');
        
        // Find company element - a div with text-primary-light or text containing "Gomez"
        var companyElement = container.querySelector('.text-primary-light, .text-sm.font-semibold');
        
        // Status - try multiple approaches for mobile view
        var statusElement = null;
        
        // First look for bg-support classes for status
        statusElement = container.querySelector('.bg-support-alert-light, .bg-support-success-light');
        
        // If not found, look for a span with aria-hidden="true" containing Approved/Rejected
        if (!statusElement || !statusElement.textContent.trim()) {
            var statusSpans = container.querySelectorAll('span[aria-hidden="true"]');
            for (var i = 0; i < statusSpans.length; i++) {
                var text = statusSpans[i].textContent.trim();
                if (text === 'Approved' || text === 'Rejected') {
                    statusElement = statusSpans[i];
                    break;
                }
            }
        }
        
        return {
            name: this.findTextInElement(nameElement, 'none'),
            company: this.findTextInElement(companyElement, 'none'),
            status: this.findTextInElement(statusElement, 'none')
        };
    },
    
    // Main function to get application details
    getApplicationDetails: function(element) {
        // Check if we have a table row or a flex container
        var row = element.closest('tr');
        if (row) {
            return this.getDetailsFromTableRow(row);
        }
        
        // If no row found, look for a flex container (mobile view)
        var flexContainer = element.closest('.flex');
        if (flexContainer) {
            // For mobile view, we need to go up a few levels to find all data
            var parent = flexContainer;
            for (var i = 0; i < 3; i++) {
                if (parent && parent.parentElement) {
                    parent = parent.parentElement;
                }
            }
            return this.getDetailsFromFlexContainer(parent || flexContainer);
        }
        
        return { name: 'none', company: 'none', status: 'none' };
    },
    
    // Get application form details for approve/reject actions
    getApplicationFormDetails: function() {
        var selectors = EVENT_CONFIG.RENTAL_APPLICATION.selectors;
        return {
            equipment_selection: this.getElementValue(selectors.EQUIPMENT),
            area_selection: this.getElementValue(selectors.AREA),
            units_selection: this.getElementValue(selectors.UNITS),
            avg_duration_selection: this.getElementValue(selectors.DURATION),
            coverage_selection: this.getElementValue(selectors.COVERAGE),
            payment_method_selection: this.getElementValue(selectors.PAYMENT_METHOD)
        };
    },
    
    // Get value from form element
    getElementValue: function(selector) {
        var element = document.querySelector(selector);
        if (!element) return 'none';
        
        // Try to get value first (for inputs, selects)
        if (element.value) return element.value.trim();
        
        // Then try text content (for divs, spans)
        return element.textContent.trim() || 'none';
    },
    
    // Get rejection comment from the textarea
    getRejectionComment: function() {
        var selector = EVENT_CONFIG.RENTAL_APPLICATION.selectors.REJECTION_COMMENT;
        var commentElement = document.querySelector(selector);
        return commentElement ? commentElement.value.trim() : 'none';
    },
    
    // Get customer ID from the approval modal
    getCustomerId: function() {
        var selector = EVENT_CONFIG.RENTAL_APPLICATION.selectors.CUSTOMER_ID;
        var customerIdElement = document.querySelector(selector);
        return customerIdElement ? customerIdElement.value.trim() : 'none';
    },
    
    // Debug function - log all buttons for troubleshooting
    logAllButtons: function() {
        console.log('---- Logging all buttons ----');
        var buttons = document.querySelectorAll('button');
        buttons.forEach(function(button, index) {
            console.log('Button ' + index + ':');
            console.log('Text: ' + button.textContent.trim());
            console.log('Type: ' + button.getAttribute('type'));
            console.log('Value: ' + button.getAttribute('value'));
            console.log('Name: ' + button.getAttribute('name'));
            console.log('Aria-label: ' + button.getAttribute('aria-label'));
            console.log('Classes: ' + button.getAttribute('class'));
            console.log('-------------------');
        });
    }
};

var DataLayerUtils = {
    push: function(data) {
        console.log('Pushing to dataLayer:', data);
        
        // Get user_id from window.oktaUid
        var userId = (typeof window.oktaUid === 'string' && window.oktaUid) ? window.oktaUid : 'not_available';
        
        dataLayer.push(Object.assign({
            'event': EVENT_CONFIG.RENTAL_APPLICATION.name,
            'user_id': userId
        }, data));
    }
};

// Function to handle view button click
function handleViewClick(event) {
    var viewButton = event.target.closest('[data-testid="' + EVENT_CONFIG.RENTAL_APPLICATION.elements.VIEW + '"]');
    if (viewButton) {
        var details = DOMUtils.getApplicationDetails(viewButton);
        
        DataLayerUtils.push(Object.assign({
            'element_click': EVENT_CONFIG.RENTAL_APPLICATION.elements.VIEW
        }, details));
    }
}

// Function to handle tab clicks
function handleTabClick(event) {
    var tab = event.target.closest('[data-testid]');
    if (!tab) return;

    var dataTestId = tab.getAttribute('data-testid');
    var validTabs = [
        EVENT_CONFIG.RENTAL_APPLICATION.elements.ALL_TAB,
        EVENT_CONFIG.RENTAL_APPLICATION.elements.RECEIVED_TAB,
        EVENT_CONFIG.RENTAL_APPLICATION.elements.APPROVED_TAB,
        EVENT_CONFIG.RENTAL_APPLICATION.elements.REJECTED_TAB
    ];

    if (validTabs.includes(dataTestId)) {
        DataLayerUtils.push({
            'element_click': dataTestId
        });
    }
}

// Function to handle approve/reject button clicks
function handleApplicationActionButtons(event) {
    var approveButton = event.target.closest('[data-testid="' + EVENT_CONFIG.RENTAL_APPLICATION.elements.APPROVE_BUTTON + '"]');
    var rejectButton = event.target.closest('[data-testid="' + EVENT_CONFIG.RENTAL_APPLICATION.elements.REJECT_BUTTON + '"]');
    
    if (!approveButton && !rejectButton) return;
    
    var buttonType = approveButton ? 
        EVENT_CONFIG.RENTAL_APPLICATION.elements.APPROVE_BUTTON : 
        EVENT_CONFIG.RENTAL_APPLICATION.elements.REJECT_BUTTON;
    
    var formDetails = DOMUtils.getApplicationFormDetails();
    
    DataLayerUtils.push(Object.assign({
        'element_click': buttonType
    }, formDetails));
}

// Function to determine if we're in an approval or rejection modal
function isRejectModal() {
    // Check for "Reject Customer Application" heading
    var modalHeading = document.querySelector('h2');
    if (modalHeading && modalHeading.textContent.includes('Reject Customer Application')) {
        return true;
    }
    
    // Check for reject button
    var rejectButton = document.querySelector('button[value="reject"], button[name="_intent"][value="reject"]');
    if (rejectButton) {
        return true;
    }
    
    // Look for a rejection reason textarea or input
    var rejectReasonField = document.querySelector('textarea[name="rejectionComments"], textarea[placeholder*="reason"], textarea[placeholder*="Rejection"], input[placeholder*="reason"]');
    if (rejectReasonField) {
        return true;
    }
    
    // Check for "Reject & Submit" text on any button
    var rejectSubmitButton = Array.from(document.querySelectorAll('button')).find(function(button) {
        return button.textContent.trim() === 'Reject & Submit';
    });
    if (rejectSubmitButton) {
        return true;
    }
    
    return false;
}

// Function to handle modal button clicks
function handleModalButtons(event) {
    // Enable this line for debugging
    // DOMUtils.logAllButtons();
    
    var formDetails = DOMUtils.getApplicationFormDetails();
    var inRejectModal = isRejectModal();
    
    // For direct button clicks (when the button itself is clicked)
    if (event.target.tagName === 'BUTTON') {
        handleButtonElement(event.target, inRejectModal, formDetails);
        return;
    }
    
    // For clicks on children of buttons (when a span or other element inside the button is clicked)
    var parentButton = event.target.closest('button');
    if (parentButton) {
        handleButtonElement(parentButton, inRejectModal, formDetails);
        return;
    }
}

// Helper function to handle button elements
function handleButtonElement(buttonElement, inRejectModal, formDetails) {
    var buttonText = buttonElement.textContent.trim();
    var buttonValue = buttonElement.getAttribute('value');
    var buttonType = buttonElement.getAttribute('type');
    var isCancel = buttonText === 'Cancel';
    var isSubmit = buttonText === 'Approve & Submit' || buttonText === 'Reject & Submit';
    
    // Handle Cancel button
    if (isCancel || (buttonElement.getAttribute('aria-label') === 'Cancel')) {
        console.log('Cancel button clicked in ' + (inRejectModal ? 'rejection' : 'approval') + ' modal');
        
        DataLayerUtils.push(Object.assign({
            'element_click': inRejectModal ? 
                EVENT_CONFIG.RENTAL_APPLICATION.elements.CANCEL_REJECT_BUTTON : 
                EVENT_CONFIG.RENTAL_APPLICATION.elements.CANCEL_APPROVAL_BUTTON
        }, formDetails));
        return;
    }
    
    // Handle Submit buttons
    if (isSubmit || (buttonType === 'submit' && buttonValue)) {
        var isRejectSubmit = inRejectModal || buttonText === 'Reject & Submit' || buttonValue === 'reject';
        console.log((isRejectSubmit ? 'Reject' : 'Approve') + ' & Submit button clicked');
        
        var eventData = Object.assign({
            'element_click': isRejectSubmit ? 
                EVENT_CONFIG.RENTAL_APPLICATION.elements.REJECT_SUBMIT_BUTTON : 
                EVENT_CONFIG.RENTAL_APPLICATION.elements.APPROVE_SUBMIT_BUTTON
        }, formDetails);
        
        // Add rejection comment if this is a reject submission
        if (isRejectSubmit) {
            var rejectionComment = DOMUtils.getRejectionComment();
            if (rejectionComment !== 'none') {
                eventData.rejection_comment = rejectionComment;
                console.log('Captured rejection comment:', rejectionComment);
            }
        } 
        // Add customer ID if this is an approval submission
        else {
            var customerId = DOMUtils.getCustomerId();
            if (customerId !== 'none') {
                eventData.customer_id = customerId;
                console.log('Captured customer ID:', customerId);
            }
        }
        
        DataLayerUtils.push(eventData);
        return;
    }
}

// Improved function to handle business unit filter Apply button using data-testid only
function handleBusinessUnitFilterApply(event) {
    // Use only data-testid for detection
    var applyButton = event.target.closest('[data-testid="renter_application_bu_filter_apply_button"]');
    if (!applyButton) return;

    // Traverse up to find the filter section
    var filterSection = applyButton.closest('[data-testid="renter_application_bu_filter_section"]');
    if (!filterSection) {
        // Try to find the filter section in the modal if not a direct parent
        var modal = applyButton.closest('[role="dialog"], [role="presentation"], .modal, .Dialog');
        if (modal) {
            filterSection = modal.querySelector('[data-testid="renter_application_bu_filter_section"]');
        }
    }
    if (!filterSection) {
        console.log('[BU Filter] No filter section found for Apply button.');
        return;
    }

    // Get all checked checkboxes inside the filter section
    var checkedInputs = filterSection.querySelectorAll('input[type="checkbox"]:checked');
    var businessUnits = Array.from(checkedInputs).map(function(input) {
        return input.value;
    });

    // Push the event to the data layer with business_units as comma-separated string (no user_id)
    dataLayer.push({
        event: 'create_rental_application_activity',
        element_click: 'renter_application_bu_filter_apply_button',
        business_units: businessUnits.join(',')
    });
}

// Function to attach event listeners
function attachEventListeners() {
    document.addEventListener('click', handleViewClick);
    document.addEventListener('click', handleTabClick);
    document.addEventListener('click', handleApplicationActionButtons);
    document.addEventListener('click', handleModalButtons);
    document.addEventListener('click', handleBusinessUnitFilterApply);
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
