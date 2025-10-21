<script>
// Configuration for service disruption notice
var SERVICE_DISRUPTION_CONFIG = {
    SELECTORS: {
        PAGE_NOT_FOUND: 'h1, h2, h3, .error-title, .not-found-title, [data-testid*="not-found"], [data-testid*="error"]',
        ERROR_MESSAGES: '.error-message, .not-found-message, [class*="error"], [class*="not-found"], p',
        PAGE_TITLE: 'title'
    },
    TEXT: {
        NEW_TITLE: 'Hang Tight - We\'re Fixing Things',
        NEW_MESSAGE: 'Our team is working urgently to restore full service. Thank you for your patience.',
        SPECIFIC_REPLACEMENT: 'Our team is working urgently to restore full service. Thank you for your patience.'
    }
};

// Polyfill for Element.matches for ES5 compatibility
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

// Utility function to find and replace text content
function findAndReplaceText(selector, newText, context) {
    var scope = context || document;
    var elements = scope.querySelectorAll(selector);
    var replacedCount = 0;
    
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var currentText = element.textContent || element.innerText || '';
        
        // Check if element contains page not found related text
        if (isPageNotFoundText(currentText)) {
            element.textContent = newText;
            replacedCount++;
        }
    }
    
    return replacedCount;
}

// Function to check if text contains page not found related content
function isPageNotFoundText(text) {
    if (!text) return false;
    
    var lowerText = text.toLowerCase();
    var notFoundPatterns = [
        'page not found',
        '404',
        'not found',
        'error 404',
        'page cannot be found',
        'page does not exist',
        'page unavailable',
        'the page you requested no longer exists'
    ];
    
    for (var i = 0; i < notFoundPatterns.length; i++) {
        if (lowerText.indexOf(notFoundPatterns[i]) !== -1) {
            return true;
        }
    }
    
    return false;
}

// Function to specifically replace the exact error message
function replaceSpecificErrorMessage() {
    var paragraphs = document.querySelectorAll('p');
    var replacedCount = 0;
    
    for (var i = 0; i < paragraphs.length; i++) {
        var paragraph = paragraphs[i];
        var currentText = paragraph.textContent || paragraph.innerText || '';
        
        if (currentText.indexOf('The page you requested no longer exists.') !== -1) {
            // Only replace the specific text, preserving the paragraph structure
            paragraph.innerHTML = paragraph.innerHTML.replace(
                'The page you requested no longer exists.',
                SERVICE_DISRUPTION_CONFIG.TEXT.SPECIFIC_REPLACEMENT
            );
            replacedCount++;
        }
    }
    
    return replacedCount;
}

// Function to update the main heading (h1) to show the new title
function updateMainHeading() {
    var headings = document.querySelectorAll('h1');
    var replacedCount = 0;
    
    for (var i = 0; i < headings.length; i++) {
        var heading = headings[i];
        var currentText = heading.textContent || heading.innerText || '';
        
        if (currentText.indexOf('Page Not Found') !== -1) {
            heading.textContent = SERVICE_DISRUPTION_CONFIG.TEXT.NEW_TITLE;
            replacedCount++;
        }
    }
    
    return replacedCount;
}

// Function to replace homepage link text and remove link functionality
function replaceHomepageLink() {
    var links = document.querySelectorAll('a[href*="ryder.com"]');
    var replacedCount = 0;
    
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var parent = link.parentNode;
        var currentText = parent.textContent || parent.innerText || '';
        
        // Check if this is the "Please visit our Homepage instead." text
        if (currentText.indexOf('Please visit our Homepage instead.') !== -1) {
            // Replace the entire text content but preserve the parent structure
            parent.innerHTML = parent.innerHTML.replace(
                /Please visit our <a[^>]*>Homepage<\/a> instead\./g,
                'Please reach out to your local rental branch to manage rentals and reservations.'
            );
            replacedCount++;
        }
    }
    
    return replacedCount;
}

// Function to update page title
function updatePageTitle() {
    var titleElement = document.querySelector(SERVICE_DISRUPTION_CONFIG.SELECTORS.PAGE_TITLE);
    if (titleElement && isPageNotFoundText(titleElement.textContent)) {
        titleElement.textContent = SERVICE_DISRUPTION_CONFIG.TEXT.NEW_TITLE;
        return true;
    }
    return false;
}

// Main function to apply service disruption notice
function applyServiceDisruptionNotice() {
    var totalChanges = 0;
    
    // Update page title if needed
    if (updatePageTitle()) {
        totalChanges++;
    }
    
    // Update the main heading (h1) specifically
    var headingChanges = updateMainHeading();
    totalChanges += headingChanges;
    
    // Update other headings and titles
    var otherHeadingChanges = findAndReplaceText(
        SERVICE_DISRUPTION_CONFIG.SELECTORS.PAGE_NOT_FOUND, 
        SERVICE_DISRUPTION_CONFIG.TEXT.NEW_TITLE
    );
    totalChanges += otherHeadingChanges;
    
    // Update error messages
    var messageChanges = findAndReplaceText(
        SERVICE_DISRUPTION_CONFIG.SELECTORS.ERROR_MESSAGES, 
        SERVICE_DISRUPTION_CONFIG.TEXT.NEW_MESSAGE
    );
    totalChanges += messageChanges;
    
    // Specifically replace the exact error message
    var specificChanges = replaceSpecificErrorMessage();
    totalChanges += specificChanges;
    
    // Replace homepage link text and remove link functionality
    var linkChanges = replaceHomepageLink();
    totalChanges += linkChanges;
    
    // Log changes for debugging
    if (window.console && window.console.log) {
        window.console.log('Service disruption notice applied to ' + totalChanges + ' elements');
    }
    
    return totalChanges;
}

// Function to handle dynamic content changes
function handleDynamicContentChanges() {
    var observer = new MutationObserver(function(mutations) {
        var hasChanges = false;
        
        for (var i = 0; i < mutations.length; i++) {
            var mutation = mutations[i];
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                hasChanges = true;
                break;
            }
        }
        
        if (hasChanges) {
            // Small delay to ensure DOM is updated
            setTimeout(function() {
                applyServiceDisruptionNotice();
            }, 100);
        }
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

// Initialize service disruption notice
function initializeServiceDisruptionNotice() {
    // Apply immediately
    applyServiceDisruptionNotice();
    
    // Set up observer for dynamic content
    if (window.MutationObserver) {
        handleDynamicContentChanges();
    }
    
    // Also check periodically for any missed elements
    setInterval(function() {
        applyServiceDisruptionNotice();
    }, 5000); // Check every 5 seconds
}

// Initialize when DOM is ready
if (document.readyState === 'complete') {
    initializeServiceDisruptionNotice();
} else {
    document.addEventListener('DOMContentLoaded', initializeServiceDisruptionNotice);
    document.addEventListener('load', initializeServiceDisruptionNotice);
}
</script>
