<script>

// Function to attach event listeners
function attachEventListeners() {

  document.addEventListener('click', function(event) {
    var element = event.target;
    var dataTestId = element.getAttribute('data-testid') || (element.closest('a') && element.closest('a').getAttribute('data-testid'));

    if (dataTestId === 'user_account_settings' || 
        dataTestId === 'user_account_logout' || 
        dataTestId === 'user_account_help_button' || 
        dataTestId === 'nav_reservations' || 
        dataTestId === 'nav_orders' || 
        dataTestId === 'nav_privacy_policy' || 
        dataTestId === 'nav_terms_of_use' || 
        dataTestId === 'nav_view_vehicles' ||
        (element.tagName.toLowerCase() === 'a' && element.href && element.href.indexOf('/rentals') !== -1 && element.textContent.trim() === 'Rental Agreements')
      ) {

      var elementClick;
      var eventCategory;
      var reservationId = null;

      switch(dataTestId) {
        case 'user_account_settings':
          elementClick = 'user_menu_account_settings';
          eventCategory = 'user_menu_activity';
          break;
        case 'user_account_logout':
          elementClick = 'user_menu_logout';
          eventCategory = 'user_menu_activity';
          break;
        case 'user_account_help_button':
          elementClick = 'user_menu_call_help';
          eventCategory = 'user_menu_activity';
          break;
        case 'nav_reservations':
          elementClick = 'main_menu_reservations_link';
          eventCategory = 'main_menu_activity';
          break;
        case 'nav_orders':
          elementClick = 'main_menu_orders_link';
          eventCategory = 'main_menu_activity';
          break;
        case 'nav_privacy_policy':
          elementClick = 'main_menu_nav_privacy_policy';
          eventCategory = 'main_menu_activity';
          break;
        case 'nav_terms_of_use':
          elementClick = 'main_menu_nav_terms_of_use';
          eventCategory = 'main_menu_activity';
          break;
        case 'nav_view_vehicles':
          elementClick = 'main_menu_nav_vehicles';
          eventCategory = 'main_menu_activity';
          break;
        default:
          // Handle Rental Agreements link without data-testid
          if (element.tagName.toLowerCase() === 'a' && element.href && element.href.indexOf('/rentals') !== -1 && element.textContent.trim() === 'Rental Agreements') {
            elementClick = 'main_menu_rental_agreements_link';
            eventCategory = 'main_menu_activity';
          } else {
            elementClick = null;
          }
          break;
      }

      if (elementClick) {
        var dataLayerObject = {
          'event': eventCategory,
          'dataTestId': dataTestId,
          'element': element.tagName,
          'element_click': elementClick
        };

        dataLayer.push(dataLayerObject);
      }
    }
  }, true); // Adding the event listener in the capture phase
}

// Use both DOMContentLoaded and window load events
document.addEventListener('DOMContentLoaded', function() {
  attachEventListeners();
});

window.addEventListener('load', function() {
  attachEventListeners();
});

// Also check if the document is already loaded
if (document.readyState === 'complete') {
  attachEventListeners();
}
</script>