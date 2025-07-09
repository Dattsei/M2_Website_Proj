document.addEventListener('DOMContentLoaded', () => {
    // ======================
    // UI HELPER FUNCTIONS (unchanged)
    // ======================
    const showError = (input, message) => {
      input.classList.add('invalid');
      const errorDiv = input.parentElement.querySelector('.input-error');
      errorDiv.innerHTML = `<i class='fas fa-exclamation-circle'></i> ${message}`;
    };
  
    const clearError = (input) => {
      input.classList.remove('invalid');
      input.parentElement.querySelector('.input-error').innerHTML = '';
    };
  
    const showWarning = (id, message, isSuccess = false) => {
      const box = document.getElementById(id);
      if (box) {
        box.innerHTML = message;
        box.classList.add('active', isSuccess ? 'success' : 'error');
        setTimeout(() => box.classList.remove('active'), 5000);
      }
    };
  
    // ======================
    // FORM FIELD HANDLING (unchanged)
    // ======================
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
      input.setAttribute('placeholder', ' ');
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
        clearError(input);
      });
      input.addEventListener('blur', () => {
        if (!input.value) input.parentElement.classList.remove('focused');
      });
    });
  
    // ======================
    // VALIDATION HELPERS (unchanged)
    // ======================
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
  
    // ======================
    // LOGIN FORM HANDLING (updated to /api/login)
    // ======================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email');
        const password = document.getElementById('password');
  
        // Client-side validation
        if (!validateEmail(email.value)) {
          showError(email, 'Invalid email');
          return;
        }
        if (!validatePassword(password.value)) {
          showError(password, 'Password must be 8+ chars with uppercase, lowercase, and number');
          return;
        }
  
        try {
          // Updated endpoint: /api/login (matches your backend)
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: email.value, 
              password: password.value 
            })
          });
  
          const data = await response.json();
          if (data.success) {
            showWarning('registerWarning', '✅ Registration successful! Redirecting...', true);
            // FIX: Redirect to subscription page
            setTimeout(() => window.location.href = '/subscription', 1500);
          } else {
            showWarning('loginWarning', data.message || 'Login failed');
          }
        } catch (error) {
          showWarning('loginWarning', 'Network error. Check console.');
          console.error('Login error:', error);
        }
      });
    }
  
    // ======================
    // REGISTER FORM HANDLING (updated to /api/register)
    // ======================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
  
        // Client-side validation
        if (name.value.trim().length < 2) {
          showError(name, 'Name must be at least 2 characters');
          return;
        }
        if (!validateEmail(email.value)) {
          showError(email, 'Invalid email');
          return;
        }
        if (!validatePassword(password.value)) {
          showError(password, 'Password must be 8+ chars with uppercase, lowercase, and number');
          return;
        }
        if (password.value !== confirmPassword.value) {
          showError(confirmPassword, 'Passwords do not match');
          return;
        }
  
        try {
          // Updated endpoint: /api/register (matches your backend)
          const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.value.trim(),
              email: email.value.trim(),
              password: password.value,
              confirmPassword: confirmPassword.value // Include confirmPassword for backend validation
            })
          });
  
          const data = await response.json();
          if (data.success) {
            showWarning('registerWarning', '✅ Registration successful! Redirecting...', true);
            setTimeout(() => window.location.href = '/login', 1500);
          } else {
            showWarning('registerWarning', data.message || 'Registration failed');
            if (data.message.includes('Email already in use')) {
              showError(email, 'Email already registered');
            }
          }
        } catch (error) {
          showWarning('registerWarning', 'Network error. Check console.');
          console.error('Registration error:', error);
        }
      });
    }
  });