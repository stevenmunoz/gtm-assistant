<script>
// Organization Request Page - Phone Number Update Script
// Purpose: Replaces incorrect phone number 1-800-555-1234 with correct number 1-800-947-9337
// on the "Request Access to an Existing Organization" page help text

var OLD_PHONE = '1-800-555-1234';
var NEW_PHONE = '1-800-947-9337';
var phoneUpdated = false;

function updatePhoneNumber() {
    if (phoneUpdated) return true;

    var spans = document.getElementsByTagName('span');
    for (var i = 0; i < spans.length; i++) {
        if (spans[i].innerHTML.indexOf(OLD_PHONE) !== -1) {
            spans[i].innerHTML = spans[i].innerHTML.replace(OLD_PHONE, NEW_PHONE);
            phoneUpdated = true;
            return true;
        }
    }
    return false;
}

// Polling for initial page load
function initPolling() {
    var attempts = 0;
    var maxAttempts = 50;
    var interval = setInterval(function() {
        attempts++;
        if (updatePhoneNumber() || attempts >= maxAttempts) {
            clearInterval(interval);
        }
    }, 100);
}

// MutationObserver for dynamic content (React re-renders)
function initObserver() {
    if (typeof MutationObserver === 'undefined') return;

    var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0) {
                phoneUpdated = false;
                updatePhoneNumber();
                break;
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(function() {
        observer.disconnect();
    }, 30000);
}

function init() {
    updatePhoneNumber();
    initPolling();
    initObserver();
}

if (document.readyState === 'complete') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init);
}
</script>
