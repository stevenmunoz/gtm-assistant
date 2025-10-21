<script>
//custom events for landing page
document.addEventListener('click', function(event) {
    var element = event.target;
    var dataTestId = element.getAttribute('data-testid');
    var buttonText = element.textContent.trim();
    
    // Handle buttons based on text content
    if (buttonText === 'Start Booking') {
        dataLayer.push({
            'event': 'landing_page_activity_gtm',
            'dataTestId': dataTestId,
            'element': element.tagName,
            'element_click': 'start_booking_button'
        });
    } else if (buttonText === 'Reserve Today') {
        dataLayer.push({
            'event': 'landing_page_activity_gtm',
            'dataTestId': dataTestId,
            'element': element.tagName,
            'element_click': 'reserve_today_button'
        });
    }
    
    // Handle buttons based on data-testid
    if (dataTestId === 'log_in_button') {
        dataLayer.push({
            'event': 'landing_page_activity_gtm',
            'dataTestId': dataTestId,
            'element': element.tagName,
            'element_click': 'log_in_button'
        });
    } else if (dataTestId === 'lp_get_started_cta') {
        dataLayer.push({
            'event': 'landing_page_activity_gtm',
            'dataTestId': dataTestId,
            'element': element.tagName,
            'element_click': 'get_started_button'
        });
    }
});
</script>