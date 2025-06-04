document.addEventListener('DOMContentLoaded', () => {
    // Get email from URL parameters if coming from homepage
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromHome = urlParams.get('email');
    
    if (emailFromHome) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = emailFromHome;
            emailInput.parentElement.classList.add('focused');
        }
    }

    // Handle form inputs
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
        // Add placeholder to make the label animation work
        input.setAttribute('placeholder', ' ');
        
        // Handle focus events
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });

    // Helper: show error
    function showError(input, message) {
        input.classList.add('invalid');
        const errorDiv = input.parentElement.querySelector('.input-error');
        errorDiv.innerHTML = `<i class='fas fa-exclamation-circle'></i> ${message}`;
    }
    // Helper: clear error
    function clearError(input) {
        input.classList.remove('invalid');
        const errorDiv = input.parentElement.querySelector('.input-error');
        errorDiv.innerHTML = '';
    }
    // Helper: show warning box
    function showWarning(id, message) {
        const box = document.getElementById(id);
        if (box) {
            box.innerHTML = message;
            box.classList.add('active');
        }
    }
    function clearWarning(id) {
        const box = document.getElementById(id);
        if (box) {
            box.innerHTML = '';
            box.classList.remove('active');
        }
    }

    // LOGIN FORM VALIDATION
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            clearError(email);
            clearError(password);
            clearWarning('loginWarning');

            // Email validation
            if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && !email.value.match(/^\d{10,}$/)) {
                showError(email, 'Please enter a valid email or phone number.');
                valid = false;
            }
            // Password validation
            if (password.value.length < 4 || password.value.length > 60) {
                showError(password, 'Your password must contain between 4 and 60 characters.');
                valid = false;
            }
            if (!valid) return;

            // Simulate incorrect password for demo
            showWarning('loginWarning', `Incorrect password for <b>${email.value}</b><br>You can <a href='#'>use a sign-in code</a>, <a href='#'>reset your password</a> or try again.`);
            showError(password, 'Your password must contain between 4 and 60 characters.');
        });
    }

    // REGISTER FORM VALIDATION
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            clearError(name);
            clearError(email);
            clearError(password);
            clearError(confirmPassword);
            clearWarning('registerWarning');

            // Name validation
            if (name.value.trim().length < 2) {
                showError(name, 'Name must be at least 2 characters.');
                valid = false;
            }
            // Email validation
            if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                showError(email, 'Please enter a valid email address.');
                valid = false;
            }
            // Password validation
            if (password.value.length < 4 || password.value.length > 60) {
                showError(password, 'Your password must contain between 4 and 60 characters.');
                valid = false;
            }
            // Confirm password
            if (password.value !== confirmPassword.value) {
                showError(confirmPassword, 'Passwords do not match.');
                valid = false;
            }
            if (!valid) return;

            // Simulate registration error for demo
            showWarning('registerWarning', `There was a problem creating your account. Please try again.`);
        });
    }

    // Password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', () => {
            const password = input.value;
            const isValid = password.length >= 8 && 
                          /[A-Z]/.test(password) && 
                          /[a-z]/.test(password) && 
                          /[0-9]/.test(password);

            if (!isValid) {
                input.setCustomValidity('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const email = emailInput.value;
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            if (!isValid) {
                emailInput.setCustomValidity('Please enter a valid email address');
            } else {
                emailInput.setCustomValidity('');
            }
        });
    }
}); 