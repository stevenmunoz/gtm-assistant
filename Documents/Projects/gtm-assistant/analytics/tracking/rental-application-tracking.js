<script>
// Store form data globally
var storedFormData = (function() {
    // Try to get data from localStorage first
    var savedData = localStorage.getItem('rentalApplicationFormData');
    if (savedData) {
        return JSON.parse(savedData);
    }
    // Default values if no data in localStorage
    return {
        first_name: 'none',
        last_name: 'none',
        phone_number: 'none',
        work_email: 'none'
    };
})();

// Store company data globally
var storedCompanyData = {
    company_name: 'none',
    physical_address: 'none',
    physical_apt_suite: 'none',
    physical_checkbox: 'none',
    billing_address: 'none',
    billing_apt_suite: 'none'
};

// Flag to track if personal info form was submitted
var personalInfoSubmitted = false;

// Utility function to get form field value
function getFormFieldValue(dataTestId) {
    var element = document.querySelector('[data-testid="' + dataTestId + '"]');
    return element ? element.value : 'none';
}

// Utility function to get checkbox value
function getCheckboxValue(dataTestId) {
    var element = document.querySelector('[data-testid="' + dataTestId + '"]');
    return element ? element.checked : false;
}

// Utility function to get all form fields
function getFormFields() {
    var fields = {
        first_name: getFormFieldValue('rental_application_first_name_input'),
        last_name: getFormFieldValue('rental_application_last_name_input'),
        phone_number: getFormFieldValue('rental_application_phone_number_input'),
        work_email: getFormFieldValue('rental_application_work_email_input')
    };
    
    // Save to localStorage whenever we get form fields
    localStorage.setItem('rentalApplicationFormData', JSON.stringify(fields));
    
    return fields;
}

// Utility function to get all company fields
function getCompanyFields() {
    return {
        company_name: getFormFieldValue('rental_application_company_name_input'),
        physical_address: getFormFieldValue('rental_application_company_address_input'),
        physical_apt_suite: getFormFieldValue('rental_application_company_apt_suite_input'),
        physical_checkbox: getCheckboxValue('rental_application_same_as_above_checkbox'),
        billing_address: getFormFieldValue('rental_application_billing_address_input'),
        billing_apt_suite: getFormFieldValue('rental_application_billing_apt_suite_input')
    };
}

// Utility function to get selected equipment
function getSelectedEquipment() {
    var equipmentSection = document.querySelector('[data-testid="rental_application_equipment_selection"]');
    if (!equipmentSection) return '';
    
    var checkedBoxes = equipmentSection.querySelectorAll('input[type="checkbox"]:checked');
    var selectedEquipment = Array.from(checkedBoxes).map(function(checkbox) {
        return checkbox.value;
    });
    
    return selectedEquipment.join(',');
}

// Add new utility function to get selected operating area
function getSelectedOperatingArea() {
    var areaSection = document.querySelector('[data-testid="rental_application_operating_area_selection"]');
    if (!areaSection) return '';
    
    var selectedRadio = areaSection.querySelector('input[type="radio"]:checked');
    return selectedRadio ? selectedRadio.value : '';
}

// Add new utility function to get selected units per year
function getSelectedUnitsPerYear() {
    var unitsSection = document.querySelector('[data-testid="rental_application_units_per_year"]');
    if (!unitsSection) return '';
    
    var selectedInput = unitsSection.querySelector('input[type="checkbox"]:checked, input[type="radio"]:checked');
    return selectedInput ? selectedInput.value : '';
}

// Add new utility function to get selected rental duration
function getSelectedRentalDuration() {
    var durationSection = document.querySelector('[data-testid="rental_application_rental_duration"]');
    if (!durationSection) return '';
    
    var checkedBoxes = durationSection.querySelectorAll('input[type="checkbox"]:checked');
    var selectedDurations = Array.from(checkedBoxes).map(function(checkbox) {
        return checkbox.value;
    });
    
    return selectedDurations.join(',');
}

// Add new utility function to get selected insurance
function getSelectedInsurance() {
    var insuranceSection = document.querySelector('[data-testid="rental_application_insurance_selection"]');
    if (!insuranceSection) return '';
    
    var selectedRadio = insuranceSection.querySelector('input[type="radio"]:checked');
    return selectedRadio ? selectedRadio.value : '';
}

// Add new utility function to get selected payment method
function getSelectedPaymentMethod() {
    var paymentSection = document.querySelector('[data-testid="rental_application_payment_method"]');
    if (!paymentSection) return '';
    
    var selectedRadio = paymentSection.querySelector('input[type="radio"]:checked');
    return selectedRadio ? selectedRadio.value : '';
}

// Modify pushToDataLayer to accept payment method
function pushToDataLayer(elementClick, step, isCompanyForm, equipmentSelection, operatingArea, unitsPerYear, rentalDuration, insuranceSelection, paymentMethod) {
    // Get user_id from window.oktaUid
    var userId = window.oktaUid || 'not_available';
    
    var data = {
        'event': 'create_rental_application_activity',
        'element_click': elementClick,
        'step': step,
        'user_id': userId,
        'first_name': storedFormData.first_name,
        'last_name': storedFormData.last_name,
        'phone_number': storedFormData.phone_number,
        'work_email': storedFormData.work_email
    };

    if (isCompanyForm) {
        var companyData = getCompanyFields();
        data.company_name = companyData.company_name;
        data.physical_address = companyData.physical_address;
        data.physical_apt_suite = companyData.physical_apt_suite;
        data.physical_checkbox = companyData.physical_checkbox;
        data.billing_address = companyData.billing_address;
        data.billing_apt_suite = companyData.billing_apt_suite;
    }

    if (equipmentSelection) {
        data.equipment_selection = equipmentSelection;
    }

    if (operatingArea) {
        data.area_selection = operatingArea;
    }

    if (unitsPerYear) {
        data.units_selection = unitsPerYear;
    }

    if (rentalDuration) {
        data.avg_duration_selection = rentalDuration;
    }

    if (insuranceSelection) {
        data.coverage_selection = insuranceSelection;
    }

    if (paymentMethod) {
        data.payment_method_selection = paymentMethod;
    }

    dataLayer.push(data);
}

// Add utility function to check if element is visible
function isElementVisible(element) {
    if (!element) return false;
    
    // First check if the element or any parent has the 'hidden' class
    var currentElement = element;
    while (currentElement) {
        if (currentElement.classList && currentElement.classList.contains('hidden')) {
            return false;
        }
        currentElement = currentElement.parentElement;
    }
    
    return true;
}

// Function to attach all event listeners
function attachEventListeners() {
    document.addEventListener('click', function(event) {
        var actionButton = event.target.closest('[data-testid="rental_application_continue_button"], [data-testid="rental_application_submit_button"]');
        
        if (actionButton) {
            var currentForm = actionButton.closest('form[name="OnboardingForm"]');
            var sections = currentForm.children;
            var currentSection = null;
            
            for (var i = 0; i < sections.length; i++) {
                if (sections[i].contains(actionButton)) {
                    currentSection = sections[i];
                    break;
                }
            }

            if (currentSection) {
                // Payment Method Step - Check for either payment method element or submit button
                var hasPaymentMethod = currentSection.querySelector('[data-testid="rental_application_payment_method"]');
                var hasSubmitButton = actionButton.getAttribute('data-testid') === 'rental_application_submit_button';

                if (hasPaymentMethod || hasSubmitButton) {
                    var selectedPayment = getSelectedPaymentMethod();
                    pushToDataLayer(
                        actionButton.getAttribute('data-testid'),
                        'rental_application_payment_method',
                        false,
                        null,
                        null,
                        null,
                        null,
                        null,
                        selectedPayment
                    );

                    // Add confirmation page event when submit button is clicked
                    if (hasSubmitButton) {
                        pushToDataLayer(
                            'rental_application_submit_button',
                            'rental_application_confirmation_page',
                            false
                        );
                    }
                }

                // Company Information Step
                if (currentSection.querySelector('[data-testid="rental_application_company_name_input"]')) {
                    pushToDataLayer(
                        'rental_application_continue_button',
                        'rental_application_company_information',
                        true
                    );
                }
                // Equipment Selection Step
                else if (currentSection.querySelector('[data-testid="rental_application_equipment_selection"]')) {
                    var selectedEquipment = getSelectedEquipment();
                    pushToDataLayer(
                        'rental_application_continue_button',
                        'rental_application_equipment',
                        false,
                        selectedEquipment
                    );
                }
                // Operating Area Step
                else if (currentSection.querySelector('[data-testid="rental_application_operating_area_selection"]')) {
                    var selectedArea = getSelectedOperatingArea();
                    pushToDataLayer(
                        'rental_application_continue_button',
                        'rental_application_area',
                        false,
                        null,
                        selectedArea
                    );
                }
                // Units Per Year Step
                else if (currentSection.querySelector('[data-testid="rental_application_units_per_year"]')) {
                    var selectedUnits = getSelectedUnitsPerYear();
                    pushToDataLayer(
                        'rental_application_continue_button',
                        'rental_application_units',
                        false,
                        null,
                        null,
                        selectedUnits
                    );
                }
                // Rental Duration Step
                else if (currentSection.querySelector('[data-testid="rental_application_rental_duration"]')) {
                    var selectedDuration = getSelectedRentalDuration();
                    pushToDataLayer(
                        'rental_application_continue_button',
                        'rental_application_duration',
                        false,
                        null,
                        null,
                        null,
                        selectedDuration
                    );
                }
                // Insurance Selection Step
                else if (currentSection.querySelector('[data-testid="rental_application_insurance_selection"]')) {
                    var selectedInsurance = getSelectedInsurance();
                    pushToDataLayer(
                        'rental_application_continue_button',
                        'rental_application_insurance',
                        false,
                        null,
                        null,
                        null,
                        null,
                        selectedInsurance
                    );
                }
            }
        }
    });

    document.addEventListener('submit', function(event) {
        // Create Account form submission
        if (event.target.name === 'createAccount') {
            storedFormData = getFormFields();
            pushToDataLayer(
                'rental_application_continue_button',
                'rental_application_personal_information',
                false
            );
        }
        // Resend verification form submission
        if (event.target.name === 'resendVerification') {
            pushToDataLayer(
                'rental_application_resend_link',
                'rental_application_email_verification',
                false
            );
        }
    }, true);
}

// Initialize listeners
['DOMContentLoaded', 'load'].forEach(function(eventName) {
    document.addEventListener(eventName, attachEventListeners);
});

// Also attach if document is already loaded
if (document.readyState === 'complete') {
    attachEventListeners();
}
</script> 