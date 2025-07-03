document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const paymentForms = document.querySelectorAll('.payment-form');
    const agreeCheckbox = document.getElementById('agree-checkbox');
    const startButton = document.getElementById('start-btn');
    const redirectNote = document.querySelector('.redirect-note');
    
    let selectedMethod = 'card';
    let currentPlan = 'basic';

    // Initialize
    loadSavedData();
    loadPlanInfo();
    addBackButton();
    setupEventListeners();
    updatePlanDisplay();
    checkFormValidity();

    function addBackButton() {
        const backBtn = document.querySelector('.back-btn');
        backBtn.addEventListener('click', function() {
            saveFormData();
            window.location.href = '/subscription';
        });
    }

    function setupEventListeners() {
        // Tab switching
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                switchPaymentMethod(this.dataset.method);
            });
        });

        // Form inputs
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', function() {
                formatInput(this);
                checkFormValidity();
            });
        });

        // Checkbox
        agreeCheckbox.addEventListener('change', checkFormValidity);

        // Plan change
        document.querySelector('.change-plan').addEventListener('click', showPlanModal);

        // Start button
        startButton.addEventListener('click', handleStartMembership);
    }

    function switchPaymentMethod(method) {
        // Clear all other payment method forms before switching
        clearOtherPaymentMethods(method);
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        paymentForms.forEach(form => form.classList.remove('active'));
        
        document.querySelector(`[data-method="${method}"]`).classList.add('active');
        document.querySelector(`.${method}-form`).classList.add('active');
        
        selectedMethod = method;
        updateRedirectNote();
        checkFormValidity();
        
        // Save the form data with the new selected method
        saveFormData();
    }

    function clearOtherPaymentMethods(currentMethod) {
        // Clear card form if not selected
        if (currentMethod !== 'card') {
            document.getElementById('card-number').value = '';
            document.getElementById('card-expiry').value = '';
            document.getElementById('card-cvv').value = '';
            document.getElementById('card-name').value = '';
        }
        
        // Clear digital wallet form if not selected
        if (currentMethod !== 'digital') {
            document.getElementById('digital-phone').value = '';
            document.getElementById('digital-country').value = '+63';
        }
        
        // Clear mobile payment form if not selected
        if (currentMethod !== 'mobile') {
            document.getElementById('mobile-phone').value = '';
            document.getElementById('mobile-country').value = '+63';
        }
    }

    function formatInput(input) {
        const id = input.id;
        let value = input.value;

        if (id === 'card-number') {
            value = value.replace(/\s/g, '').replace(/[^0-9]/g, '');
            input.value = value.match(/.{1,4}/g)?.join(' ') || value;
        } else if (id === 'card-expiry') {
            value = value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            input.value = value;
        } else if (id === 'card-cvv') {
            input.value = value.replace(/[^0-9]/g, '').substring(0, 4);
        } else if (id === 'card-name') {
            input.value = value.replace(/[^a-zA-Z\s]/g, '');
        } else if (id === 'digital-phone' || id === 'mobile-phone') {
            input.value = value.replace(/[^0-9]/g, '').substring(0, 10);
        }
    }

    function checkFormValidity() {
        const isChecked = agreeCheckbox.checked;
        let allFieldsValid = false;

        if (selectedMethod === 'card') {
            const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
            const cardExpiry = document.getElementById('card-expiry').value;
            const cardCvv = document.getElementById('card-cvv').value;
            const cardName = document.getElementById('card-name').value.trim();
            
            allFieldsValid = cardNumber.length >= 13 && 
                           cardExpiry.length === 5 && 
                           cardCvv.length >= 3 && 
                           cardName.length >= 2;
        } else if (selectedMethod === 'digital') {
            const phoneInput = document.getElementById('digital-phone').value;
            allFieldsValid = phoneInput.length === 10;
        } else if (selectedMethod === 'mobile') {
            const phoneInput = document.getElementById('mobile-phone').value;
            allFieldsValid = phoneInput.length === 10;
        }

        startButton.disabled = !(isChecked && allFieldsValid);
    }

    function updateRedirectNote() {
        if (selectedMethod === 'digital') {
            redirectNote.textContent = "You'll be redirected to your selected digital wallet.";
            redirectNote.classList.add('show');
        } else if (selectedMethod === 'mobile') {
            redirectNote.textContent = "You'll be redirected to your mobile carrier for billing.";
            redirectNote.classList.add('show');
        } else if (selectedMethod === 'card') {
            redirectNote.textContent = "Your card will be processed securely.";
            redirectNote.classList.add('show');
        } else {
            redirectNote.classList.remove('show');
        }
    }

    function loadPlanInfo() {
        const savedPlan = localStorage.getItem('selectedPlan');
        currentPlan = savedPlan || 'basic';
    }

    function updatePlanDisplay() {
        const planInfo = {
            basic: { price: '₱199/month', name: 'Basic Plan' },
            standard: { price: '₱399/month', name: 'Standard Plan' },
            premium: { price: '₱549/month', name: 'Premium Plan' }
        };

        const planDetails = document.querySelector('.plan-details');
        const plan = planInfo[currentPlan];
        planDetails.innerHTML = `<strong>${plan.price}</strong><div class="plan-name">${plan.name}</div>`;
    }

    function showPlanModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Choose Your Plan</h3>
                <div class="plan-options">
                    <div class="plan-option ${currentPlan === 'basic' ? 'selected' : ''}" data-plan="basic">
                        <h4>Basic</h4><p>₱199/month</p><small>720p • 1 screen</small>
                    </div>
                    <div class="plan-option ${currentPlan === 'standard' ? 'selected' : ''}" data-plan="standard">
                        <h4>Standard</h4><p>₱399/month</p><small>1080p • 2 screens</small>
                    </div>
                    <div class="plan-option ${currentPlan === 'premium' ? 'selected' : ''}" data-plan="premium">
                        <h4>Premium</h4><p>₱549/month</p><small>4K+HDR • 4 screens</small>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn cancel-btn">Cancel</button>
                    <button class="modal-btn confirm-btn">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        let tempPlan = currentPlan;
        
        modal.querySelectorAll('.plan-option').forEach(option => {
            option.addEventListener('click', function() {
                modal.querySelectorAll('.plan-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                tempPlan = this.dataset.plan;
            });
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            currentPlan = tempPlan;
            localStorage.setItem('selectedPlan', currentPlan);
            updatePlanDisplay();
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    function saveFormData() {
        const formData = {
            selectedMethod: selectedMethod,
            agreeChecked: agreeCheckbox.checked
        };

        // Only save data for the currently selected payment method
        if (selectedMethod === 'card') {
            formData.cardNumber = document.getElementById('card-number').value;
            formData.cardExpiry = document.getElementById('card-expiry').value;
            formData.cardCvv = document.getElementById('card-cvv').value;
            formData.cardName = document.getElementById('card-name').value;
        } else if (selectedMethod === 'digital') {
            formData.digitalPhone = document.getElementById('digital-phone').value;
            formData.digitalCountry = document.getElementById('digital-country').value;
        } else if (selectedMethod === 'mobile') {
            formData.mobilePhone = document.getElementById('mobile-phone').value;
            formData.mobileCountry = document.getElementById('mobile-country').value;
        }

        localStorage.setItem('paymentFormData', JSON.stringify(formData));
    }

    function loadSavedData() {
        const savedData = localStorage.getItem('paymentFormData');
        if (!savedData) return;

        try {
            const formData = JSON.parse(savedData);
            
            // Load the selected method first
            if (formData.selectedMethod) {
                selectedMethod = formData.selectedMethod;
                switchPaymentMethod(selectedMethod);
            }
            
            // Only load data for the selected payment method
            if (selectedMethod === 'card' && formData.cardNumber !== undefined) {
                document.getElementById('card-number').value = formData.cardNumber || '';
                document.getElementById('card-expiry').value = formData.cardExpiry || '';
                document.getElementById('card-cvv').value = formData.cardCvv || '';
                document.getElementById('card-name').value = formData.cardName || '';
            } else if (selectedMethod === 'digital' && formData.digitalPhone !== undefined) {
                document.getElementById('digital-phone').value = formData.digitalPhone || '';
                document.getElementById('digital-country').value = formData.digitalCountry || '+63';
            } else if (selectedMethod === 'mobile' && formData.mobilePhone !== undefined) {
                document.getElementById('mobile-phone').value = formData.mobilePhone || '';
                document.getElementById('mobile-country').value = formData.mobileCountry || '+63';
            }
            
            // Load checkbox state
            if (formData.agreeChecked) {
                agreeCheckbox.checked = formData.agreeChecked;
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    function handleStartMembership() {
        if (startButton.disabled) return;
        
        startButton.textContent = 'Processing...';
        startButton.disabled = true;
        
        setTimeout(() => {
            localStorage.removeItem('paymentFormData');
            window.location.href = '/mainpage';
        }, 2000);
    }

    // Auto-save on input changes - only for currently selected method
    document.querySelectorAll('.form-input, .country-select').forEach(input => {
        input.addEventListener('input', function() {
            // Only save if this input belongs to the currently selected method
            const inputId = this.id;
            const shouldSave = 
                (selectedMethod === 'card' && ['card-number', 'card-expiry', 'card-cvv', 'card-name'].includes(inputId)) ||
                (selectedMethod === 'digital' && ['digital-phone', 'digital-country'].includes(inputId)) ||
                (selectedMethod === 'mobile' && ['mobile-phone', 'mobile-country'].includes(inputId));
            
            if (shouldSave) {
                saveFormData();
            }
        });
        
        input.addEventListener('change', function() {
            // Only save if this input belongs to the currently selected method
            const inputId = this.id;
            const shouldSave = 
                (selectedMethod === 'card' && ['card-number', 'card-expiry', 'card-cvv', 'card-name'].includes(inputId)) ||
                (selectedMethod === 'digital' && ['digital-phone', 'digital-country'].includes(inputId)) ||
                (selectedMethod === 'mobile' && ['mobile-phone', 'mobile-country'].includes(inputId));
            
            if (shouldSave) {
                saveFormData();
            }
        });
    });
});