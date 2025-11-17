<script>
// Reservation Login Modal - Copy Modification Script
// Purpose: Modifies copy in the login modal that appears when users try to reserve a vehicle
// Changes:
// 1. Modal header: "Finish signing in to complete your reservation" → "Access your account to complete your reservation"
// 2. Button text: "Log In" → "Access Your Ryder Account"
// 3. Removes: "You must be logged in to reserve a vehicle." paragraph
// 4. Removes: "Existing customer? Contact your rental account manager to get online access." paragraph

// Configuration
var MODAL_HEADER_OLD_TEXT = 'Finish signing in to complete your reservation';
var MODAL_HEADER_NEW_TEXT = 'Access your account to complete your reservation';
var BUTTON_OLD_TEXT = 'Log In';
var BUTTON_NEW_TEXT = 'Access Your Ryder Account';
var REMOVE_PARAGRAPH_TEXT = 'You must be logged in to reserve a vehicle.';
var REMOVE_PARAGRAPH_TEXT_2 = 'Existing customer? Contact your rental account manager to get online access.';

// State tracking
var modificationComplete = false;
var observerTimeout = null;

// Function to find element by text content
function findElementByText(tagNames, text) {
    for (var i = 0; i < tagNames.length; i++) {
        var elements = document.getElementsByTagName(tagNames[i]);
        for (var j = 0; j < elements.length; j++) {
            if (elements[j].textContent.trim() === text) {
                return elements[j];
            }
        }
    }
    return null;
}

// Function to check if element is inside a modal structure
function isInModal(element) {
    var parent = element.parentElement;
    var depth = 0;
    var maxDepth = 10;

    while (parent && depth < maxDepth) {
        var classes = parent.className || '';
        var role = parent.getAttribute('role');

        // Common modal indicators
        if (classes.indexOf('modal') !== -1 ||
            classes.indexOf('dialog') !== -1 ||
            classes.indexOf('overlay') !== -1 ||
            role === 'dialog' ||
            role === 'alertdialog') {
            return true;
        }

        parent = parent.parentElement;
        depth++;
    }

    return false;
}

// Function to check if the reservation modal is currently visible
function isReservationModalVisible() {
    // Check if the modal header exists in the DOM
    var modalHeader = findElementByText(['h1', 'h2', 'h3', 'div'], MODAL_HEADER_OLD_TEXT);
    return modalHeader !== null;
}

// Function to find the login button using multiple strategies
function findLoginButton() {
    // Search both button and anchor (a) tags since the "button" might be a styled link
    var buttons = document.getElementsByTagName('button');
    var links = document.getElementsByTagName('a');
    var allClickableElements = [];

    // Combine buttons and links into one array
    for (var x = 0; x < buttons.length; x++) {
        allClickableElements.push(buttons[x]);
    }
    for (var y = 0; y < links.length; y++) {
        allClickableElements.push(links[y]);
    }

    // Strategy 1: Find element with exact text "Log In" in modal
    for (var i = 0; i < allClickableElements.length; i++) {
        var elem = allClickableElements[i];
        var elemText = elem.innerText ? elem.innerText.trim() : elem.textContent.trim();
        if (elemText === BUTTON_OLD_TEXT && isInModal(elem)) {
            return elem;
        }
    }

    // Strategy 2: Find element that contains "Log In" text in modal
    for (var k = 0; k < allClickableElements.length; k++) {
        var elem3 = allClickableElements[k];
        var elemText3 = elem3.innerText ? elem3.innerText.trim() : elem3.textContent.trim();
        if (elemText3.indexOf(BUTTON_OLD_TEXT) !== -1 && isInModal(elem3)) {
            return elem3;
        }
    }

    // Strategy 3: Find link with href="/login" in modal
    for (var m = 0; m < links.length; m++) {
        if (!isInModal(links[m])) continue;
        var href = links[m].getAttribute('href') || '';
        if (href === '/login' || href.indexOf('/login') !== -1) {
            return links[m];
        }
    }

    // Strategy 4: Fallback - Find "Log In" button only if reservation modal is visible
    // This prevents changing the header login button while still catching the modal button
    if (isReservationModalVisible()) {
        for (var j = 0; j < allClickableElements.length; j++) {
            var elem2 = allClickableElements[j];
            var elemText2 = elem2.innerText ? elem2.innerText.trim() : elem2.textContent.trim();
            if (elemText2 === BUTTON_OLD_TEXT) {
                return elem2;
            }
        }
    }

    return null;
}

// Main function to modify modal elements
function modifyModalElements() {
    if (modificationComplete) {
        return true;
    }

    var headerModified = false;
    var buttonModified = false;
    var paragraphModified = false;
    var paragraph2Modified = false;

    // 1. Find modal header by exact text match
    var modalHeader = findElementByText(['h1', 'h2', 'h3', 'div'], MODAL_HEADER_OLD_TEXT);
    if (modalHeader && modalHeader.textContent.trim() === MODAL_HEADER_OLD_TEXT) {
        modalHeader.textContent = MODAL_HEADER_NEW_TEXT;
        headerModified = true;
    }

    // 2. Find and modify the "Log In" button (only in modal)
    var loginButton = findLoginButton();
    if (loginButton && loginButton.textContent.trim() === BUTTON_OLD_TEXT) {
        loginButton.textContent = BUTTON_NEW_TEXT;
        buttonModified = true;
    }

    // 3. Find and remove the paragraph with "You must be logged in..."
    var paragraphToRemove = findElementByText(['p'], REMOVE_PARAGRAPH_TEXT);
    if (paragraphToRemove && paragraphToRemove.textContent.trim() === REMOVE_PARAGRAPH_TEXT) {
        // Actually remove the element from DOM instead of just hiding it
        if (paragraphToRemove.parentNode) {
            paragraphToRemove.parentNode.removeChild(paragraphToRemove);
            paragraphModified = true;
        } else {
            // Fallback: hide it if removal fails
            paragraphToRemove.style.display = 'none';
            paragraphToRemove.setAttribute('aria-hidden', 'true');
            paragraphModified = true;
        }
    }

    // 4. Find and remove the paragraph with "Existing customer?..."
    var paragraphToRemove2 = findElementByText(['p'], REMOVE_PARAGRAPH_TEXT_2);
    if (paragraphToRemove2 && paragraphToRemove2.textContent.trim() === REMOVE_PARAGRAPH_TEXT_2) {
        // Actually remove the element from DOM instead of just hiding it
        if (paragraphToRemove2.parentNode) {
            paragraphToRemove2.parentNode.removeChild(paragraphToRemove2);
            paragraph2Modified = true;
        } else {
            // Fallback: hide it if removal fails
            paragraphToRemove2.style.display = 'none';
            paragraphToRemove2.setAttribute('aria-hidden', 'true');
            paragraph2Modified = true;
        }
    }

    // Only mark as complete if ALL FOUR modifications were made
    if (headerModified && buttonModified && paragraphModified && paragraph2Modified) {
        modificationComplete = true;
        return true;
    }

    // Return true if any modification was made (for polling to continue trying)
    return headerModified || buttonModified || paragraphModified || paragraph2Modified;
}

// Initialize polling mechanism for initial page load
function initPolling() {
    var attemptCount = 0;
    var maxAttempts = 50; // Stop after 5 seconds (50 * 100ms)
    var checkInterval = 100; // ms between checks

    var pollingInterval = setInterval(function() {
        attemptCount++;

        if (modifyModalElements() || attemptCount >= maxAttempts) {
            clearInterval(pollingInterval);
        }
    }, checkInterval);
}

// Initialize MutationObserver for dynamically loaded modals
function initObserver() {
    // Only use MutationObserver if supported
    if (typeof MutationObserver === 'undefined') {
        return;
    }

    var observer = new MutationObserver(function(mutations) {
        // Reset modification flag when new content is added
        var hasAddedNodes = false;
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0) {
                hasAddedNodes = true;
                break;
            }
        }

        if (hasAddedNodes) {
            // Allow re-modification in case modal is shown again
            modificationComplete = false;
            modifyModalElements();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Stop observer after timeout to prevent performance issues
    observerTimeout = setTimeout(function() {
        observer.disconnect();
    }, 10000); // 10 seconds
}

// Initialize the script
function init() {
    // Try immediate modification in case modal is already visible
    modifyModalElements();

    // Set up polling for initial load
    initPolling();

    // Set up observer for dynamic content
    initObserver();
}

// Attach the initialization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    init();
});

window.addEventListener('load', function() {
    init();
});

// Also check if the document is already loaded
if (document.readyState === 'complete') {
    init();
}
</script>
