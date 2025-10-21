<script>
// Configuration for product list tracking
var PRODUCT_LIST_CONFIG = {
    EVENTS: {
        PRODUCT_RESERVE: 'product_list_activity',
        FILTER_APPLY: 'product_list_activity'
    },
    ELEMENTS: {
        RESERVE_BUTTON: 'product_list_card_reserve_button',
        VEHICLE_TYPE: 'product_list_card_vehicle_name',
        CATEGORY: 'product_list_card_category_pill',
        CDL_REQUIRED: 'product_list_card_cdl_pill',
        ATTRIBUTES: 'product_list_card_attributes',
        LOAD_CAPACITY: 'product_list_card_load_capacity',
        FILTER_BUTTON: 'product_list_filter_button',
        FILTER_APPLY_BUTTON: 'product_list_filter_apply_button',
        FILTER_CATEGORY_LIST: 'product_list_filter_category_checkbox_list'
    }
};

// Polyfill for Element.closest for ES5 compatibility
if (!Element.prototype.closest) {
    Element.prototype.closest = function(selector) {
        var el = this;
        while (el && el.nodeType === 1) {
            if (el.matches(selector)) {
                return el;
            }
            el = el.parentNode;
        }
        return null;
    };
}

// Utility function to get element value by data-testid within a context
function getElementValueByTestId(testId, context) {
    var scope = context || document;
    var el = scope.querySelector('[data-testid="' + testId + '"]');
    if (!el) {
        return '';
    }
    return el.textContent ? el.textContent.trim() : (el.value || '');
}

// Utility function to get comma-separated checked filter values
function getCheckedFilterValues(testId) {
    var checkboxes = document.querySelectorAll('[data-testid="' + testId + '"] input[type="checkbox"]:checked');
    var values = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].value) {
            values.push(checkboxes[i].value);
        }
    }
    return values.join(',');
}

// Handler for reserve button click
function handleReserveButtonClick(event) {
    var button = event.currentTarget || event.target;
    // Find the closest article (product card container)
    var card = button.closest('article');
    var eventData = {
        'event': PRODUCT_LIST_CONFIG.EVENTS.PRODUCT_RESERVE,
        'okta_id': window.oktaUid || '',
        'vehicle_type': getElementValueByTestId(PRODUCT_LIST_CONFIG.ELEMENTS.VEHICLE_TYPE, card),
        'category': getElementValueByTestId(PRODUCT_LIST_CONFIG.ELEMENTS.CATEGORY, card),
        'cdl_required': getElementValueByTestId(PRODUCT_LIST_CONFIG.ELEMENTS.CDL_REQUIRED, card),
        'attributes': getElementValueByTestId(PRODUCT_LIST_CONFIG.ELEMENTS.ATTRIBUTES, card),
        'load_capacity': getElementValueByTestId(PRODUCT_LIST_CONFIG.ELEMENTS.LOAD_CAPACITY, card),
        'element_click': 'product_card_reserve_button'
    };
    if (window.dataLayer) {
        window.dataLayer.push(eventData);
    }
}

// Handler for filter apply button click
function handleFilterApplyClick(event) {
    var eventData = {
        'event': PRODUCT_LIST_CONFIG.EVENTS.FILTER_APPLY,
        'okta_id': window.oktaUid || '',
        'selected_filters': getCheckedFilterValues(PRODUCT_LIST_CONFIG.ELEMENTS.FILTER_CATEGORY_LIST),
        'element_click': 'vehicle_filters_apply_button'
    };
    if (window.dataLayer) {
        window.dataLayer.push(eventData);
    }
}

// Accessibility: handle keydown for Enter/Space
function handleKeyDown(event, clickHandler) {
    if (event.keyCode === 13 || event.keyCode === 32) { // Enter or Space
        clickHandler(event);
    }
}

// Attach event listeners to reserve buttons
function attachReserveButtonListeners() {
    var buttons = document.querySelectorAll('[data-testid="' + PRODUCT_LIST_CONFIG.ELEMENTS.RESERVE_BUTTON + '"]');
    for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        btn.setAttribute('tabindex', '0');
        btn.setAttribute('aria-label', 'Reserve product');
        btn.addEventListener('click', handleReserveButtonClick);
        btn.addEventListener('keydown', function(e) { handleKeyDown(e, handleReserveButtonClick); });
    }
}

// Attach event listener to filter apply button (dynamic)
function attachFilterApplyButtonListenerDynamic() {
    var observer = new MutationObserver(function(mutations, obs) {
        var btn = document.querySelector('[data-testid="' + PRODUCT_LIST_CONFIG.ELEMENTS.FILTER_APPLY_BUTTON + '"]');
        if (btn) {
            if (!btn.hasAttribute('data-gtm-listener')) {
                btn.setAttribute('tabindex', '0');
                btn.setAttribute('aria-label', 'Apply filters');
                btn.addEventListener('click', function(e) {
                    handleFilterApplyClick(e);
                });
                btn.addEventListener('keydown', function(e) { handleKeyDown(e, handleFilterApplyClick); });
                btn.setAttribute('data-gtm-listener', 'true');
            }
            obs.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Attach event listener to filter open button to trigger observer
function attachFilterOpenButtonListener() {
    var filterBtn = document.querySelector('[data-testid="' + PRODUCT_LIST_CONFIG.ELEMENTS.FILTER_BUTTON + '"]');
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            attachFilterApplyButtonListenerDynamic();
        });
    }
}

// Initialize listeners when DOM is ready
function initializeProductListTracking() {
    attachReserveButtonListeners();
    attachFilterOpenButtonListener();
}

if (document.readyState === 'complete') {
    initializeProductListTracking();
} else {
    document.addEventListener('DOMContentLoaded', initializeProductListTracking);
    document.addEventListener('load', initializeProductListTracking);
}
</script>
