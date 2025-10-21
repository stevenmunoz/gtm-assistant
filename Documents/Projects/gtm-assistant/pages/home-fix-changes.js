<script>
// Configuration for landing page updates
var LANDING_PAGE_CONFIG = {
    ELEMENTS: {
        MAIN_HEADING: 'main_heading',
        SUBHEADING: 'subheading',
        SERVICES_LIST_SELF_SERVICE: 'services_list_self_service',
        SERVICES_LIST_ADVANCED_TECHNOLOGY: 'services_list_advanced_technology',
        CONTACT_EXPERT_BUTTON: 'contact_expert_button'
    },
    CONTENT: {
        MAIN_HEADING_TEXT: 'New Platform Simplifies Truck Rental',
        SUBHEADING_TEXT: 'Experience a faster, easier way to book and manage your Ryder rentals',
        SERVICES_LIST_SELF_SERVICE_TEXT: 'Self-Service Convenience: Easily manage all your Ryder rentals anytime, anywhere'
    }
};

// Utility function to get element safely
function getElement(selector) {
    return document.querySelector('[data-testid="' + selector + '"]');
}

// Utility function to update element text content
function updateElementText(selector, newText) {
    var element = getElement(selector);
    if (element) {
        element.textContent = newText;
        return true;
    }
    return false;
}

// Utility function to hide element
function hideElement(selector) {
    var element = getElement(selector);
    if (element) {
        element.style.display = 'none';
        return true;
    }
    return false;
}

// Function to update main heading
function updateMainHeading() {
    return updateElementText(LANDING_PAGE_CONFIG.ELEMENTS.MAIN_HEADING, LANDING_PAGE_CONFIG.CONTENT.MAIN_HEADING_TEXT);
}

// Function to update subheading
function updateSubheading() {
    return updateElementText(LANDING_PAGE_CONFIG.ELEMENTS.SUBHEADING, LANDING_PAGE_CONFIG.CONTENT.SUBHEADING_TEXT);
}

// Function to update services list self service
function updateServicesListSelfService() {
    var element = getElement(LANDING_PAGE_CONFIG.ELEMENTS.SERVICES_LIST_SELF_SERVICE);
    if (element) {
        element.innerHTML = '<span class="phoenix-check p-1 text-2xl text-secondary-base" aria-hidden="true"></span>' +
            '<div class="text-lg font-normal text-neutrals-darkest lg:text-2xl">' +
            '<strong>Self-Service Convenience:</strong> Easily manage all your Ryder rentals anytime, anywhere' +
            '</div>';
        return true;
    }
    return false;
}

// Function to hide advanced technology list item
function hideAdvancedTechnologyListItem() {
    return hideElement(LANDING_PAGE_CONFIG.ELEMENTS.SERVICES_LIST_ADVANCED_TECHNOLOGY);
}

// Function to hide contact expert button
function hideContactExpertButton() {
    var elements = document.querySelectorAll('[data-testid="' + LANDING_PAGE_CONFIG.ELEMENTS.CONTACT_EXPERT_BUTTON + '"]');
    var hidden = false;
    elements.forEach(function(element) {
        if (element.textContent && element.textContent.trim() === 'Reserve Today') {
            element.style.display = 'none';
            hidden = true;
        }
    });
    return hidden;
}

// Main function to apply all landing page changes
function applyLandingPageChanges() {
    var changesApplied = {
        mainHeading: updateMainHeading(),
        subheading: updateSubheading(),
        servicesListSelfService: updateServicesListSelfService(),
        advancedTechnologyHidden: hideAdvancedTechnologyListItem(),
        contactExpertButtonHidden: hideContactExpertButton()
    };
    
    // Log changes for debugging
    console.log('Landing page changes applied:', changesApplied);
    
    return changesApplied;
}

// Function to initialize landing page updates
function initializeLandingPageUpdates() {
    // Apply changes immediately if DOM is ready
    if (document.readyState === 'complete') {
        applyLandingPageChanges();
    } else {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', applyLandingPageChanges);
        document.addEventListener('load', applyLandingPageChanges);
    }
}

// Initialize landing page updates
initializeLandingPageUpdates();
</script>
