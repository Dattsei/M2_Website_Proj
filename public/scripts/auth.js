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

    // LOGIN FORM VALIDATION AND SUBMISSION
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
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

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email.value,
                        password: password.value
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Redirect to profile or dashboard after successful login
                    window.location.href = '/mainpage';
                } else {
                    showWarning('loginWarning', data.message || 'Login failed');
                    showError(password, 'Invalid email or password');
                }
            } catch (error) {
                showWarning('loginWarning', 'Network error - please try again');
                console.error('Login error:', error);
            }
        });
    }

    // REGISTER FORM VALIDATION AND SUBMISSION
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
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
            if (password.value.length < 8) {
                showError(password, 'Your password must be at least 8 characters.');
                valid = false;
            }
            // Confirm password
            if (password.value !== confirmPassword.value) {
                showError(confirmPassword, 'Passwords do not match.');
                valid = false;
            }
            if (!valid) return;

            try {
                const response = await fetch('/api/register', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    name: name.value.trim(),
                    email: email.value.trim(),
                    password: password.value,
                    confirmPassword: confirmPassword.value
                  })
                });
            
                const data = await response.json();
            
                if (data.success) {
                  showWarning('registerWarning', '✅ Registration successful! Redirecting...');
                  setTimeout(() => {
                    window.location.href = '/mainpage';
                  }, 1500);
                } else {
                  showWarning('registerWarning', data.message || 'Registration failed');
                  if (data.message.includes('Email already in use')) {
                    showError(email, 'Email already registered');
                  }
                }
              } catch (error) {
                showWarning('registerWarning', 'Network error. Please try again.');
                console.error('Registration error:', error);
              }
            });
    }


    // Real-time Password Validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', () => {
            const password = input.value;
            const isValid = password.length >= 8 && 
                          /[A-Z]/.test(password) && 
                          /[a-z]/.test(password) && 
                          /[0-9]/.test(password);

            if (!isValid && password.length > 0) {
                input.setCustomValidity('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Real-time Email Validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const email = emailInput.value;
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            if (!isValid && email.length > 0) {
                emailInput.setCustomValidity('Please enter a valid email address');
            } else {
                emailInput.setCustomValidity('');
            }
        });
    }
});
// Header scroll effect
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Email validation
const emailInput = document.querySelector('input[type="email"]');
const ctaButton = document.querySelector('.cta-button');

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

ctaButton.addEventListener('click', () => {
    const email = emailInput.value;
    
    if (!validateEmail(email)) {
        emailInput.style.borderColor = '#e50914';
        return;
    }
    
    // Here you would typically send the email to your backend
    console.log('Valid email:', email);
    // Redirect to signup page or show success message
});

emailInput.addEventListener('input', () => {
    emailInput.style.borderColor = '#8c8c8c';
});

// Profile menu toggle
const profileMenu = document.querySelector('.profile-menu');
let isProfileMenuOpen = false;

profileMenu.addEventListener('click', () => {
    // Here you would typically toggle a dropdown menu
    console.log('Profile menu clicked');
});

// Search functionality
const searchBtn = document.querySelector('.search-btn');
let isSearchOpen = false;

searchBtn.addEventListener('click', () => {
    // Here you would typically toggle a search input
    console.log('Search clicked');
});

// Notifications
const notificationsBtn = document.querySelector('.notifications-btn');
let isNotificationsOpen = false;

notificationsBtn.addEventListener('click', () => {
    // Here you would typically toggle a notifications panel
    console.log('Notifications clicked');
});

// Feature cards navigation to login page - ADD THIS NEW CODE
document.addEventListener('DOMContentLoaded', () => {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        // Add cursor pointer style to indicate clickability
        card.style.cursor = 'pointer';
        
        // Add hover effect for better UX
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
        
        // Add click event to redirect to login page
        card.addEventListener('click', () => {
            window.location.href = '/login';
        });
    });
});