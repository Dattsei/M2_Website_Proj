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