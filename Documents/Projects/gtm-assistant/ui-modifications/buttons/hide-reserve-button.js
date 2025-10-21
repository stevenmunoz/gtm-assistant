<script>
  (function() {
      // Inject CSS rule immediately
      document.write('<style>[data-testid="reserve_vehicle_button"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }</style>');

      // Create observer before DOM starts loading
      var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
              // Check added nodes
              mutation.addedNodes.forEach(function(node) {
                  // Check if the node itself is our target
                  if (node.getAttribute && node.getAttribute('data-testid') === 'reserve_vehicle_button') {
                      node.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
                      node.setAttribute('aria-hidden', 'true');
                  }
                  
                  // Also check children of added nodes
                  if (node.querySelectorAll) {
                      var buttons = node.querySelectorAll('[data-testid="reserve_vehicle_button"]');
                      buttons.forEach(function(button) {
                          button.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
                          button.setAttribute('aria-hidden', 'true');
                      });
                  }
              });
          });
      });

      // Start observing immediately, before DOM is ready
      observer.observe(document.documentElement || document.body || document, { 
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-testid']
      });
  })();
</script>