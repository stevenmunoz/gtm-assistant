<script>
// Configuration for account settings and organizations tracking
var ORGANIZATIONS_CONFIG = {
    EVENTS: {
        ACCOUNT_SETTINGS_TAB: 'account_settings_activity',
        ACCOUNT_SETUP: 'account_settings_activity'
    },
    ELEMENTS: {
        // Tab elements
        PROFILE_TAB: 'account_settings_profile_tab',
        ORGANIZATIONS_TAB: 'account_settings_organizations_tab',
        
        // Profile form elements
        MANAGE_OKTA_BUTTON: 'account_settings_manage_in_okta_button',
        FIRST_NAME_INPUT: 'account_settings_first_name_input',
        LAST_NAME_INPUT: 'account_settings_last_name_input',
        EMAIL_INPUT: 'account_settings_email_input',
        
        // Organization elements
        ORG_VIEW_LINK: 'organization_view_link',
        ORG_COMPANY_NAME: 'organization_company_name',
        ORG_ADDRESS: 'organization_address',
        ORG_ROLE: 'organization_role'
    }
};

// Prevent rapid-fire duplicate events
var lastOrgEventTime = 0;

// Utility function to get element value safely
function getElementValue(selector) {
    var element = document.querySelector('[data-testid="' + selector + '"]');
    if (!element) {
        return '';
    }
    var value = element.textContent ? element.textContent.trim() : element.value || '';
    return value;
}

// Utility function to get element by data-testid
function getElementByTestId(selector) {
    return document.querySelector('[data-testid="' + selector + '"]');
}

// Function to get closest organization row data for view button clicks
function getOrganizationRowData(clickedElement) {
    // Try multiple strategies to find the row containing organization data
    var row = null;
    
    // Strategy 1: Look for a parent that contains all organization data elements
    var currentElement = clickedElement;
    while (currentElement && currentElement !== document.body) {
        var nameInParent = currentElement.querySelector('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_COMPANY_NAME + '"]');
        var addressInParent = currentElement.querySelector('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_ADDRESS + '"]');
        var roleInParent = currentElement.querySelector('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_ROLE + '"]');
        
        if (nameInParent || addressInParent || roleInParent) {
            row = currentElement;
            break;
        }
        currentElement = currentElement.parentElement;
    }
    
    // Strategy 2: Fallback to traditional selectors
    if (!row) {
        row = clickedElement.closest('[data-testid*="organization"]') || 
              clickedElement.closest('tr') || 
              clickedElement.closest('.organization-row') ||
              clickedElement.closest('li') ||
              clickedElement.closest('[class*="row"]');
    }
    
    // Strategy 3: Use document-wide search as last resort
    if (!row) {
        row = document.body;
    }
    
    if (!row) {
        return {
            organization_name: '',
            organization_address: '',
            organization_role: ''
        };
    }
    
    var nameElement = row.querySelector('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_COMPANY_NAME + '"]');
    var addressElement = row.querySelector('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_ADDRESS + '"]');
    var roleElement = row.querySelector('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_ROLE + '"]');
    
    // If using document body as fallback and no elements found, try document-wide search
    if (row === document.body && (!nameElement || !addressElement || !roleElement)) {
        nameElement = nameElement || document.querySelector('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_COMPANY_NAME + '"]');
        addressElement = addressElement || document.querySelector('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_ADDRESS + '"]');
        roleElement = roleElement || document.querySelector('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_ROLE + '"]');
    }
    
    // If specific elements not found, try alternative approaches
    if (!nameElement || !addressElement || !roleElement) {
        // Method 1: Look for specific selectors
        var potentialName = row.querySelector('h1, h2, h3, h4, h5, h6, .company-name, .org-name, [class*="name"], strong, b') || 
                           row.querySelector('td:first-child, div:first-child');
        var potentialAddress = row.querySelector('.address, [class*="address"], [class*="location"]');
        var potentialRole = row.querySelector('.role, [class*="role"], [class*="position"]');
        
        // Method 2: Try to parse from table cells if it's a table row
        if (row.tagName === 'TR') {
            var cells = row.querySelectorAll('td, th');
            if (cells.length >= 3) {
                nameElement = nameElement || cells[0];
                addressElement = addressElement || cells[1];
                roleElement = roleElement || cells[2];
            }
        }
        
        // Method 3: Look for any text content in divs/spans
        if (!nameElement && !addressElement && !roleElement) {
            var allDivs = row.querySelectorAll('div, span, p');
            for (var m = 0; m < Math.min(allDivs.length, 10); m++) {
                var text = allDivs[m].textContent.trim();
                if (text && text.length > 2) {
                    if (!nameElement) nameElement = allDivs[m];
                    else if (!addressElement) addressElement = allDivs[m];
                    else if (!roleElement) roleElement = allDivs[m];
                }
            }
        }
        
        // Update elements based on alternative methods
        nameElement = nameElement || potentialName;
        addressElement = addressElement || potentialAddress;
        roleElement = roleElement || potentialRole;
    }
    
    return {
        organization_name: nameElement ? (nameElement.textContent || '').trim() : '',
        organization_address: addressElement ? (addressElement.textContent || '').trim() : '',
        organization_role: roleElement ? (roleElement.textContent || '').trim() : ''
    };
}

// Function to handle profile tab click
function handleProfileTabClick() {
    var eventData = {
        'event': ORGANIZATIONS_CONFIG.EVENTS.ACCOUNT_SETTINGS_TAB,
        'element_click': 'account_settings_profile_tab',
        'okta_id': window.oktaUid || ''
    };
    window.dataLayer.push(eventData);
    
    // After tab click, wait for content to load and re-attach profile listeners
    setTimeout(function() {
        attachProfileFormEventListeners();
    }, 500);
}

// Function to handle organizations tab click
function handleOrganizationsTabClick() {
    var eventData = {
        'event': ORGANIZATIONS_CONFIG.EVENTS.ACCOUNT_SETTINGS_TAB,
        'element_click': 'account_settings_organizations_tab',
        'okta_id': window.oktaUid || ''
    };
    window.dataLayer.push(eventData);
    
    // After tab click, wait for content to load and re-attach organization listeners
    setTimeout(function() {
        attachOrganizationEventListeners();
    }, 500);
}

// Function to handle Manage in Okta button click
function handleManageOktaClick(event) {
    var eventData = {
        'event': ORGANIZATIONS_CONFIG.EVENTS.ACCOUNT_SETTINGS_TAB,
        'element_click': 'manage_in_okta_button',
        'first_name': getElementValue(ORGANIZATIONS_CONFIG.ELEMENTS.FIRST_NAME_INPUT),
        'last_name': getElementValue(ORGANIZATIONS_CONFIG.ELEMENTS.LAST_NAME_INPUT),
        'email': getElementValue(ORGANIZATIONS_CONFIG.ELEMENTS.EMAIL_INPUT),
        'okta_id': window.oktaUid || ''
    };
    window.dataLayer.push(eventData);
}

// Function to handle organization view button click
function handleOrganizationViewClick(event) {
    // Prevent event from bubbling up and multiple firing
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    var clickedElement = event.target || event.srcElement;
    
    // Find the actual button element if we clicked on a child
    var buttonElement = clickedElement.closest('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_VIEW_LINK + '"]');
    if (!buttonElement) {
        buttonElement = clickedElement;
    }
    
    var orgData = getOrganizationRowData(buttonElement);
    
    // Only send event if we have meaningful organization data (not generic page content)
    if (orgData.organization_name && 
        orgData.organization_name !== 'My Organizations' && 
        orgData.organization_name.trim().length > 0) {
        
        // Throttle events to prevent duplicates (500ms minimum between events)
        var currentTime = Date.now();
        if (currentTime - lastOrgEventTime < 500) {
            return;
        }
        lastOrgEventTime = currentTime;
        
        var eventData = {
            'event': ORGANIZATIONS_CONFIG.EVENTS.ACCOUNT_SETUP,
            'element_click': 'account_settings_organization_view_button',
            'organization_name': orgData.organization_name,
            'organization_address': orgData.organization_address,
            'organization_role': orgData.organization_role,
            'okta_id': window.oktaUid || ''
        };
        
        window.dataLayer.push(eventData);
    }
}

// Function to attach event listeners to tab elements
function attachTabEventListeners() {
    var profileTab = getElementByTestId(ORGANIZATIONS_CONFIG.ELEMENTS.PROFILE_TAB);
    var organizationsTab = getElementByTestId(ORGANIZATIONS_CONFIG.ELEMENTS.ORGANIZATIONS_TAB);
    
    if (profileTab) {
        profileTab.addEventListener('click', handleProfileTabClick);
    }
    
    if (organizationsTab) {
        organizationsTab.addEventListener('click', handleOrganizationsTabClick);
    }
}

// Function to attach event listeners to profile form elements (now using event delegation)
function attachProfileFormEventListeners() {
    // Profile form elements are now handled by the global document click handler
    // This function is kept for compatibility but no longer needs to do anything
}

// Global click handler for organization view buttons and profile buttons (using event delegation)
function handleDocumentClick(event) {
    var target = event.target;
    
    // Check for Manage in Okta button
    var manageOktaButton = target.closest('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.MANAGE_OKTA_BUTTON + '"]');
    if (manageOktaButton) {
        handleManageOktaClick(event);
        return;
    }
    
    // Check if the clicked element or any parent is an organization view button
    var orgViewButton = target.closest('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_VIEW_LINK + '"]');
    
    if (orgViewButton) {
        handleOrganizationViewClick(event);
        return;
    }
    
    // Also check for alternative selectors
    var alternatives = [
        'organization_view_link',
        'organization-view-link', 
        'organizationViewLink',
        'org_view_link',
        'view_organization_button'
    ];
    
    for (var i = 0; i < alternatives.length; i++) {
        var altButton = target.closest('[data-testid="' + alternatives[i] + '"]');
        if (altButton) {
            handleOrganizationViewClick(event);
            return;
        }
    }
    
    // Check for links with organization-related URLs
    var linkElement = target.closest('a[href*="/account/organization"], a[href*="/organizations/"], a[href*="organization"]');
    if (linkElement) {
        handleOrganizationViewClick(event);
        return;
    }
    
    // Check if we're inside an organization context and clicked on a button/link with "view" text
    var orgContainer = target.closest('[data-testid*="organization"], [class*="organization"], [class*="org-"]');
    if (orgContainer) {
        var viewElement = target.closest('a, button, [role="button"]');
        if (viewElement && (viewElement.textContent || '').toLowerCase().indexOf('view') !== -1) {
            handleOrganizationViewClick(event);
            return;
        }
    }
}

// Function to attach event listeners to organization view buttons
function attachOrganizationEventListeners() {
    // Remove existing document click listener to avoid duplicates
    document.removeEventListener('click', handleDocumentClick);
    // Add event delegation for organization view buttons
    document.addEventListener('click', handleDocumentClick);
}

// Function to attach all event listeners
function attachEventListeners() {
    attachTabEventListeners();
    attachProfileFormEventListeners();
    attachOrganizationEventListeners();
}

// Function to handle dynamic content loading
function setupDynamicContentObserver() {
    var observer = new MutationObserver(function(mutations) {
        var hasNewTabContent = false;
        var hasNewOrgContent = false;
        var hasNewProfileContent = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check for new tab elements
                var profileTab = getElementByTestId(ORGANIZATIONS_CONFIG.ELEMENTS.PROFILE_TAB);
                var organizationsTab = getElementByTestId(ORGANIZATIONS_CONFIG.ELEMENTS.ORGANIZATIONS_TAB);
                var manageOktaButton = getElementByTestId(ORGANIZATIONS_CONFIG.ELEMENTS.MANAGE_OKTA_BUTTON);
                
                if (profileTab || organizationsTab) {
                    hasNewTabContent = true;
                }
                
                // Check specifically for profile form content
                if (manageOktaButton) {
                    hasNewProfileContent = true;
                }
                
                // Specifically check for organization view buttons (table content)
                var viewButtons = document.querySelectorAll('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_VIEW_LINK + '"]');
                if (viewButtons.length > 0) {
                    hasNewOrgContent = true;
                }
                
                // Also check for table-like structures that might contain org data
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    if (node.nodeType === 1) {
                        var orgElements = node.querySelectorAll ? node.querySelectorAll('[data-testid*="organization"], [data-testid*="org"]') : [];
                        if (orgElements.length > 0) {
                            hasNewOrgContent = true;
                        }
                    }
                }
            }
        });
        
        if (hasNewTabContent) {
            attachEventListeners();
        } else if (hasNewProfileContent) {
            attachProfileFormEventListeners();
        } else if (hasNewOrgContent) {
            attachOrganizationEventListeners();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    return observer;
}

// Initialize the tracking system
function initializeOrganizationsTracking() {
    // Attach initial event listeners
    attachEventListeners();
    
    // Set up observer for dynamic content
    setupDynamicContentObserver();
}

// Debug function to re-scan for organization view links (call from console)
window.rescanOrganizationLinks = function() {
    attachOrganizationEventListeners();
};

// Debug function to check current organization button state (call from console)
window.checkOrganizationButtons = function() {
    var selectors = [
        '[data-testid="organization_view_link"]',
        '[data-testid="organization-view-link"]', 
        '[data-testid="org_view_link"]',
        'a[href*="/account/organizations/"]',
        'a[data-discover="true"]'
    ];
    
    var orgTab = document.querySelector('[data-testid="account_settings_organizations_tab"]');
    var profileTab = document.querySelector('[data-testid="account_settings_profile_tab"]');
    var orgContent = document.querySelectorAll('[data-testid*="organization"], [data-testid*="org"]');
    
    return {
        orgViewLinks: document.querySelectorAll('[data-testid="organization_view_link"]').length,
        allOrgElements: orgContent.length,
        currentTab: orgTab ? 'Organizations' : (profileTab ? 'Profile' : 'Unknown')
    };
};

// Debug function to test organization view links (call from console)
window.testOrganizationViewLinks = function() {
    var viewButtons = document.querySelectorAll('[data-testid="' + ORGANIZATIONS_CONFIG.ELEMENTS.ORG_VIEW_LINK + '"]');
    
    if (viewButtons.length > 0) {
        var clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        viewButtons[0].dispatchEvent(clickEvent);
    } else {
        var allButtons = document.querySelectorAll('button, a, [role="button"]');
        for (var i = 0; i < allButtons.length; i++) {
            if ((allButtons[i].textContent || '').toLowerCase().indexOf('view') !== -1) {
                var testEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    target: allButtons[i]
                });
                handleDocumentClick(testEvent);
                break;
            }
        }
    }
};

// Debug function to show organization table structure (call from console)
window.debugOrganizationTable = function() {
    var tables = document.querySelectorAll('table, [role="table"], .table, [class*="table"]');
    var orgElements = document.querySelectorAll('[data-testid*="org"], [data-testid*="organization"]');
    
    return {
        tables: tables.length,
        orgElements: orgElements.length,
        firstTable: tables[0] || null,
        firstOrgElement: orgElements[0] || null
    };
};

// Initialize when DOM is ready
if (document.readyState === 'complete') {
    initializeOrganizationsTracking();
} else {
    document.addEventListener('DOMContentLoaded', initializeOrganizationsTracking);
    document.addEventListener('load', initializeOrganizationsTracking);
}
</script>
