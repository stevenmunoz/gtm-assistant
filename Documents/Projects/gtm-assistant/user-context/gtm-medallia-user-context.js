<script>
(function() {
    'use strict';
    
    function extractMedalliaUserData() {
        // Always show script execution for debugging
        if (typeof console !== 'undefined' && console.log) {
            console.log('GTM Medallia: Script started executing');
        }
        
        try {
            // Extract user-consumer cookie
            var cookies = document.cookie.split(';');
            var userConsumerToken = null;
            
            // Debug: Show all cookies and search for user-consumer specifically
            if (typeof console !== 'undefined' && console.log) {
                console.log('GTM Medallia: All cookies found:', document.cookie);
                console.log('GTM Medallia: Current domain:', window.location.hostname);
                console.log('GTM Medallia: Current protocol:', window.location.protocol);
                
                // Check if user-consumer is in the cookie string at all
                var cookieString = document.cookie;
                var hasUserConsumer = cookieString.indexOf('user-consumer') !== -1;
                console.log('GTM Medallia: user-consumer found in document.cookie?', hasUserConsumer);
                
                if (hasUserConsumer) {
                    var startIndex = cookieString.indexOf('user-consumer');
                    var snippet = cookieString.substring(startIndex, startIndex + 100);
                    console.log('GTM Medallia: user-consumer cookie snippet:', snippet);
                } else {
                    console.log('GTM Medallia: ISSUE IDENTIFIED - user-consumer cookie is NOT accessible to JavaScript');
                    console.log('GTM Medallia: This suggests the cookie has HttpOnly flag set');
                    console.log('GTM Medallia: JavaScript cannot access HttpOnly cookies for security reasons');
                    console.log('GTM Medallia: SOLUTION: Remove HttpOnly flag from user-consumer cookie on server side');
                }
            }
            
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                var equalIndex = cookie.indexOf('=');
                
                if (equalIndex === -1) continue; // Skip malformed cookies
                
                var name = cookie.substring(0, equalIndex).trim();
                var value = cookie.substring(equalIndex + 1);
                
                // Debug: Show each cookie being processed
                if (typeof console !== 'undefined' && console.log) {
                    console.log('GTM Medallia: Processing cookie:', name, '(length: ' + value.length + ')');
                }
                
                if (name === 'user-consumer') {
                    userConsumerToken = decodeURIComponent(value);
                    if (typeof console !== 'undefined' && console.log) {
                        console.log('GTM Medallia: Found user-consumer cookie:', userConsumerToken ? 'Token exists (length: ' + userConsumerToken.length + ')' : 'Token is empty');
                        console.log('GTM Medallia: Raw cookie value preview:', value.substring(0, 50) + '...');
                    }
                    break;
                }
            }
            
            // Handle anonymous users (no cookie or empty cookie)
            if (!userConsumerToken || userConsumerToken.trim() === '') {
                if (typeof console !== 'undefined' && console.log) {
                    console.log('GTM Medallia: No user-consumer token found - anonymous user');
                }
                return; // Silent graceful degradation
            }
            
            // Validate JWT structure (should have 3 parts separated by dots)
            var tokenParts = userConsumerToken.split('.');
            if (typeof console !== 'undefined' && console.log) {
                console.log('GTM Medallia: JWT token parts found:', tokenParts.length);
            }
            
            if (tokenParts.length !== 3) {
                // Malformed JWT token
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('GTM Medallia: Malformed JWT token structure - expected 3 parts, got:', tokenParts.length);
                    console.warn('GTM Medallia: Token parts:', tokenParts);
                }
                return;
            }
            
            // Decode the payload (second part of JWT)
            var payload;
            try {
                var base64Payload = tokenParts[1];
                if (typeof console !== 'undefined' && console.log) {
                    console.log('GTM Medallia: Base64 payload length:', base64Payload.length);
                }
                
                // Add padding if necessary for proper base64 decoding
                var paddingLength = (4 - base64Payload.length % 4) % 4;
                var padding = '';
                for (var j = 0; j < paddingLength; j++) {
                    padding += '=';
                }
                var paddedPayload = base64Payload + padding;
                
                if (typeof console !== 'undefined' && console.log) {
                    console.log('GTM Medallia: Attempting to decode base64 payload');
                }
                
                var decodedPayload = atob(paddedPayload);
                payload = JSON.parse(decodedPayload);
                
                if (typeof console !== 'undefined' && console.log) {
                    console.log('GTM Medallia: Successfully decoded JWT payload:', payload);
                }
            } catch (decodeError) {
                // Base64 decoding or JSON parsing failed
                if (typeof console !== 'undefined' && console.error) {
                    console.error('GTM Medallia: Failed to decode JWT payload:', decodeError);
                    console.error('GTM Medallia: Base64 payload was:', base64Payload);
                }
                return;
            }
            
            // Extract required user fields
            var userData = {};
            var requiredFields = ['firstName', 'lastName', 'email', 'oktaUid'];
            
            if (typeof console !== 'undefined' && console.log) {
                console.log('GTM Medallia: Extracting user fields from payload');
            }
            
            for (var k = 0; k < requiredFields.length; k++) {
                var field = requiredFields[k];
                if (payload.hasOwnProperty(field) && payload[field] !== null && payload[field] !== undefined) {
                    userData[field] = payload[field];
                    if (typeof console !== 'undefined' && console.log) {
                        console.log('GTM Medallia: Found field', field + ':', payload[field]);
                    }
                } else {
                    if (typeof console !== 'undefined' && console.log) {
                        console.log('GTM Medallia: Missing or null field:', field);
                    }
                }
            }
            
            if (typeof console !== 'undefined' && console.log) {
                console.log('GTM Medallia: Final userData object:', userData);
                console.log('GTM Medallia: userData has', Object.keys(userData).length, 'fields');
            }
            
            // Only create window object if we have at least one field
            if (Object.keys(userData).length > 0) {
                window.medalliaUserData = userData;
                
                // Push to GTM dataLayer
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'medalliaUserDataReady',
                    'medalliaUserData': userData
                });
                
                // Always log success
                if (typeof console !== 'undefined' && console.log) {
                    console.log('GTM Medallia: SUCCESS - User data extracted and set on window.medalliaUserData:', userData);
                    console.log('GTM Medallia: SUCCESS - Data pushed to dataLayer with event: medalliaUserDataReady');
                    console.log('GTM Medallia: Test with: window.medalliaUserData');
                }
            } else {
                if (typeof console !== 'undefined' && console.log) {
                    console.log('GTM Medallia: No valid user fields found - window object not created');
                }
            }
            
        } catch (error) {
            // Always show critical errors for debugging
            if (typeof console !== 'undefined' && console.error) {
                console.error('GTM Medallia: CRITICAL ERROR during user data extraction:', error);
                console.error('GTM Medallia: Error stack:', error.stack);
            }
        }
    }
    
    // Execute the function
    extractMedalliaUserData();
    
})();
</script>