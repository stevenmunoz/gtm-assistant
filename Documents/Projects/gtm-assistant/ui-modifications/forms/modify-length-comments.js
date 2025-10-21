<script>
function setMaxLength() {
    try {
        var textarea = document.querySelector('[data-testid="rental_order_leave_comments"]');
        if (textarea) {
            textarea.setAttribute('maxlength', '50');
        }
    } catch (e) {
        // Silent fail
    }
}

// Create observer instance
var observer = new MutationObserver(function(mutations) {
    setMaxLength();
});

// Start observing
if (document.body) {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Initial check
setMaxLength();

// Backup checks on page load
document.addEventListener('DOMContentLoaded', setMaxLength);
window.addEventListener('load', setMaxLength);
</script>
