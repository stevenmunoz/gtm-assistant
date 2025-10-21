# GTM Assistant Scripts

This repository contains Google Tag Manager (GTM) scripts and related resources for tracking and UI modifications.

## Project Structure

```
gtm-assistant/
├── analytics/              # Analytics and tracking scripts
├── ui-modifications/       # UI modification scripts
├── user-context/          # User context and identity scripts
├── pages/                 # Page-specific scripts
├── utilities/             # Utility functions and helpers
├── archived/              # Archived/deprecated scripts
├── testing/               # Test scripts and files
├── templates/             # HTML templates
├── data/                  # Data files and configurations
└── docs/                  # Documentation
```

## Directory Details

### analytics/
Analytics and tracking event scripts organized by category.

#### analytics/tracking/
Core tracking scripts for user interactions and events.
- `rental-order-tracking.js` - Main rental order tracking script (formerly create-rental-order.js)
- `rental-application-tracking.js` - Rental application form tracking
- `registration-tracking.js` - User registration tracking
- `lp-events.js` - Landing page event tracking
- `okta-activate-tracking.js` - Okta activation tracking

#### analytics/rental-agreements/
Scripts for tracking rental agreement interactions.
- `consumer-rental-application.js` - Consumer rental agreement tracking
- `ops-rental-application.js` - Operations rental agreement tracking

#### analytics/products/
Product-related tracking scripts.
- `rental-products.js` - Rental product tracking

### ui-modifications/
Scripts that modify the user interface.

#### ui-modifications/navigation/
Navigation-related UI modifications.
- `header-nav-menus.js` - Header navigation menu modifications

#### ui-modifications/forms/
Form-related UI modifications.
- `modify-length-comments.js` - Modifies comment field length constraints

#### ui-modifications/buttons/
Button-related UI modifications.
- `hide-reserve-button.js` - Hides reserve vehicle button

#### ui-modifications/banners/
Banner and notification modifications.
- `abandoned-order-banner.js` - Abandoned order banner tracking
- `service-disruption-notice.js` - Service disruption notice

#### ui-modifications/reservations/
Reservation-related UI modifications.
- `modify-reservations.js` - Reservation modification scripts
- `repeat-rental.js` - Repeat rental functionality
- `repeat-reservation.js` - Repeat reservation functionality

### user-context/
User identity and context management scripts.
- `gtm-medallia-user-context.js` - Medallia user context integration
- `ecid-capture.js` - Experience Cloud ID capture

### pages/
Page-specific scripts.
- `organizations.js` - Organization page scripts
- `home-fix-changes.js` - Home page fixes and changes

### utilities/
Utility functions and helpers.
- `jwt.js` - JWT token decoding utility

### archived/
Archived versions of scripts no longer in active use.
- `create-rental-order-original.js` - Original version
- `create-rental-order-debug.js` - Debug version
- `create-rental-order-clean.js` - Cleaned version
- `create-rental-order-apply-intention.js` - Apply intention version
- `create-rental-order-billing-accounts.js` - Billing accounts version
- `create-rental-order-billing-accounts-error.js` - Billing error handling
- `create-rental-order-msa-pricing-error.js` - MSA pricing error handling

### testing/
Test scripts and test-related files.
- `snowflake-test.js` - Snowflake integration test
- `test-medallia-script.html` - Medallia script test page

### templates/
HTML templates and email templates.
- `html-sendgrid-emails.html` - SendGrid email templates
- `image-logo.html` - Logo image template
- `unsubscribe.html` - Unsubscribe page template
- `freepour-charts.html` - Freepour charts visualization

### data/
Data files and configuration.
- `errors.json` - Error message configurations

### docs/
Project documentation.
- `GTM_Implementation_Guide.md` - GTM implementation guide
- `GTM_Medallia_User_Context_PRD.md` - Medallia user context PRD
- `HttpOnly_Cookie_Issue_Solution.md` - Cookie issue documentation

## Usage

### For Production
Use scripts from:
- `analytics/` - For tracking implementations
- `ui-modifications/` - For UI changes
- `user-context/` - For user identity management

### For Development
- `testing/` - Test scripts before production deployment
- `utilities/` - Helper functions that can be imported

### Reference Only
- `archived/` - Historical versions for reference
- `docs/` - Implementation guides and PRDs

## Notes

- The main rental order tracking script has been renamed from `create-rental-order.js` to `rental-order-tracking.js` for clarity
- Old versions of scripts are preserved in the `archived/` folder
- All tracking scripts follow GTM event naming conventions
- UI modification scripts use data-testid attributes for targeting elements

## Contributing

When adding new scripts:
1. Place them in the appropriate category folder
2. Use descriptive filenames
3. Add comments explaining the script's purpose
4. Update this README if creating new categories
