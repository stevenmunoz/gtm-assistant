<script>
// Configuration for rental agreements tracking
var RENTAL_AGREEMENTS_CONFIG = {
    EVENT_NAME: 'rental_agreements_activity',
    ELEMENTS: {
        ALL_TAB: 'all_rentals_tab',
        OPEN_TAB: 'open_rentals_tab',
        CLOSED_TAB: 'closed_rentals_tab'
    }
};

// Function to handle tab clicks
function handleTabClick(event) {
    // Get the clicked element
    var clickedElement = event.target;
    
    // Find the closest element with data-testid
    var tabElement = clickedElement.closest('[data-testid]');
    if (!tabElement) return;
    
    // Get the data-testid value
    var dataTestId = tabElement.getAttribute('data-testid');
    
    // Check if the clicked element is one of our tracked tabs
    if (dataTestId === RENTAL_AGREEMENTS_CONFIG.ELEMENTS.ALL_TAB ||
        dataTestId === RENTAL_AGREEMENTS_CONFIG.ELEMENTS.OPEN_TAB ||
        dataTestId === RENTAL_AGREEMENTS_CONFIG.ELEMENTS.CLOSED_TAB) {
        
        // Get user_id from window.oktaUid
        var userId = window.oktaUid || 'not_available';
        
        // Push event to dataLayer
        dataLayer.push({
            'event': RENTAL_AGREEMENTS_CONFIG.EVENT_NAME,
            'element_click': dataTestId,
            'user_id': userId
        });
    }
}

// Function to attach event listeners
function attachEventListeners() {
    document.addEventListener('click', handleTabClick);
    console.log('Rental agreements event listeners attached');
}

// Initialize listeners when DOM is ready
if (document.readyState === 'complete') {
    attachEventListeners();
} else {
    document.addEventListener('DOMContentLoaded', attachEventListeners);
    document.addEventListener('load', attachEventListeners);
}
</script>
