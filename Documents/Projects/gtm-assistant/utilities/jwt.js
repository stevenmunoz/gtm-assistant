<script>
function decodeAndPrintJWT() {
    // Get token from okta-token-storage-consumer
    var tokenStorage = localStorage.getItem('okta-token-storage-consumer');
    var jwtToken;
    
    try {
        var tokenData = JSON.parse(tokenStorage);
        jwtToken = tokenData.accessToken.accessToken;
    } catch (e) {
        console.log('Error getting token from storage:', e);
        return;
    }
    
    if (!jwtToken) {
        console.log('No token found in storage');
        return;
    }
    
    var parts = jwtToken.split(".");
    if (parts.length !== 3) {
        console.log('Invalid token format');
        return;
    }
    
    try {
        var payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
        var decoded = JSON.parse(decodeURIComponent(escape(payload)));
        var email = decoded.Email || 'none';
        
        // Push to dataLayer with obscured variable name
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'x_phnx_usr': email
        });
        
        return email;
    } catch (e) {
        console.log('Error decoding token:', e);
        return 'none';
    }
}

decodeAndPrintJWT();
</script>