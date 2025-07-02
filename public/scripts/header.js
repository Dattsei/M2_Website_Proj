// Header functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeHeader();
    
    // Initialize profile
    const profile = getCurrentProfile();
    if (profile) {
        updateNavbarProfile(profile);
    }
});

function initializeHeader() {
    // Initialize all header functionality
    setupScrollEffect();
    setupMobileMenu();
    setupSearch();
    setupProfileMenu();
    setupLogoHover();
    setupActiveNavLinks();
    setupNavigation();
}

// ========== PROFILE FUNCTIONALITY ==========
function getProfiles() {
    return JSON.parse(localStorage.getItem("profiles")) || [];
}

function getCurrentProfile() {
    return JSON.parse(localStorage.getItem("currentProfile"));
}

function setCurrentProfile(profile) {
    localStorage.setItem("currentProfile", JSON.stringify(profile));
    updateNavbarProfile(profile);
}

function updateNavbarProfile(profile) {
    const avatarEl = document.querySelector(".profile-avatar");
    if (avatarEl && profile) {
        avatarEl.src = profile.avatar;
        avatarEl.alt = profile.name;
    }
}

function toggleProfileMenu() {
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
}

function openChangeProfileModal() {
    const modal = document.getElementById("changeProfileModal");
    if (!modal) {
        // Create modal if it doesn't exist
        createChangeProfileModal();
        return;
    }
    
    modal.style.display = "flex";
    
    // Populate profiles
    const list = document.getElementById("changeProfileList");
    const profiles = getProfiles();
    list.innerHTML = "";
    
    profiles.forEach(profile => {
        const div = document.createElement("div");
        div.className = "profile-card";
        div.innerHTML = `
            <img src="${profile.avatar}" alt="${profile.name}" />
            <p>${profile.name}</p>
        `;
        div.onclick = () => {
            setCurrentProfile(profile);
            closeChangeProfileModal();
        };
        list.appendChild(div);
    });
}

function closeChangeProfileModal() {
    const modal = document.getElementById("changeProfileModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function createChangeProfileModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "changeProfileModal";
    modal.style.display = "none";
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeChangeProfileModal()">&times;</button>
            <h2>Switch Profile</h2>
            <div id="changeProfileList" class="profile-list">
                <!-- Profiles will be populated here -->
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add CSS styles if not already present
    if (!document.querySelector('#changeProfileModalStyles')) {
        const style = document.createElement('style');
        style.id = 'changeProfileModalStyles';
        style.textContent = `
            .profile-list {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                margin-top: 1rem;
            }
            .profile-card {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 1rem;
                border: 2px solid transparent;
                border-radius: 8px;
                cursor: pointer;
                transition: border-color 0.2s;
                min-width: 100px;
            }
            .profile-card:hover {
                border-color: #e50914;
            }
            .profile-card img {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
                margin-bottom: 0.5rem;
            }
            .profile-card p {
                margin: 0;
                text-align: center;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    openChangeProfileModal();
}

// ========== MOBILE MENU FIXES ==========
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close mobile menu when clicking on nav links
        const navLinkItems = navLinks.querySelectorAll('.nav-link');
        navLinkItems.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

// ========== PROFILE MENU SETUP ==========
function setupProfileMenu() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleProfileMenu();
        });
        
        // Close profile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });
        
        // Add event listeners to specific menu items by ID
        const manageProfilesOption = document.getElementById('manageProfilesOption');
        const switchProfileOption = document.getElementById('switchProfileOption');
        const accountOption = document.getElementById('accountOption');
        const helpCenterOption = document.getElementById('helpCenterOption');
        const signOutOption = document.getElementById('signOutOption');
        
        if (manageProfilesOption) {
            manageProfilesOption.addEventListener('click', function(e) {
                e.stopPropagation();
                location.href = 'manage-profiles.html';
                profileDropdown.classList.add('hidden');
            });
        }
        
        if (switchProfileOption) {
            switchProfileOption.addEventListener('click', function(e) {
                e.stopPropagation();
                openChangeProfileModal();
                profileDropdown.classList.add('hidden');
            });
        }
        
        if (accountOption) {
            accountOption.addEventListener('click', function(e) {
                e.stopPropagation();
                location.href = 'account.html';
                profileDropdown.classList.add('hidden');
            });
        }
        
        if (helpCenterOption) {
            helpCenterOption.addEventListener('click', function(e) {
                e.stopPropagation();
                openHelpCenter();
                profileDropdown.classList.add('hidden');
            });
        }
        
        if (signOutOption) {
            signOutOption.addEventListener('click', function(e) {
                e.stopPropagation();
                logoutUser();
                profileDropdown.classList.add('hidden');
            });
        }
    }
}

// ========== NAVIGATION SETUP ==========
function setupNavigation() {
    // Setup navigation links for different pages
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const filter = link.getAttribute('data-filter');
        
        if (filter === 'movie') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToSearch({ type: 'movie' });
            });
        }
        else if (filter === 'series') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToSearch({ type: 'series' });
            });
        }
        else if (filter === 'trending') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToSearch({ type: 'all', sort: 'popularity' });
            });
        }
    });
}

function navigateToSearch(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    window.location.href = `search.html${queryString ? '?' + queryString : ''}`;
}

// Logo hover effect between two images
function setupLogoHover() {
    const logoImg = document.getElementById('logoImg');
    const originalSrc = 'assets/images/nstreamlogo.png';
    const hoverSrc = 'assets/images/nstreamlogo2.png';
    
    if (logoImg) {
        logoImg.addEventListener('mouseenter', function() {
            this.src = hoverSrc;
        });
        
        logoImg.addEventListener('mouseleave', function() {
            this.src = originalSrc;
        });
    }
}

// Header scroll effect
function setupScrollEffect() {
    const header = document.getElementById('header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
}

// Search functionality
function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (searchBtn && searchOverlay) {
        // Open search overlay
        searchBtn.addEventListener('click', function() {
            openSearch();
        });
        
        // Close search overlay
        if (searchClose) {
            searchClose.addEventListener('click', function() {
                closeSearch();
            });
        }
        
        // Close on overlay click
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                closeSearch();
            }
        });
        
        // Search input functionality
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                const query = this.value.trim();
                
                if (query.length > 2) {
                    searchTimeout = setTimeout(() => {
                        performSearch(query);
                    }, 300);
                } else {
                    clearSearchResults();
                }
            });
            
            // Handle enter key
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = this.value.trim();
                    if (query) {
                        // Navigate to search page with query
                        navigateToSearch({ search: query });
                        closeSearch();
                    }
                }
            });
        }
    }
}

function openSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    
    if (searchOverlay) {
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on search input after animation
        setTimeout(() => {
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    }
}

function closeSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    
    if (searchOverlay) {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        if (searchInput) {
            searchInput.value = '';
        }
        clearSearchResults();
    }
}

// Enhanced search function with actual content data
function performSearch(query) {
    const searchResults = document.getElementById('searchResults');
    
    if (!searchResults) return;
    
    // Show loading state
    searchResults.innerHTML = '<div style="padding: 2rem; text-align: center; color: rgba(255,255,255,0.6);">Searching...</div>';
    
    // Use actual search results from the content data
    setTimeout(() => {
        const results = searchContentData(query);
        displaySearchResults(results);
    }, 300);
}

function searchContentData(query) {
    // Basic content data for search - you can expand this
    const contentData = [
        { id: 1, title: 'The Dark Knight', type: 'Movie', year: '2008', poster: 'assets/images/placeholder-poster.jpg' },
        { id: 2, title: 'Breaking Bad', type: 'Series', year: '2008-2013', poster: 'assets/images/placeholder-poster.jpg' },
        { id: 3, title: 'Inception', type: 'Movie', year: '2010', poster: 'assets/images/placeholder-poster.jpg' },
        { id: 4, title: 'Stranger Things', type: 'Series', year: '2016-2022', poster: 'assets/images/placeholder-poster.jpg' },
        { id: 5, title: 'Pulp Fiction', type: 'Movie', year: '1994', poster: 'assets/images/placeholder-poster.jpg' },
        { id: 6, title: 'The Office', type: 'Series', year: '2005-2013', poster: 'assets/images/placeholder-poster.jpg' }
    ];
    
    return contentData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div style="padding: 2rem; text-align: center; color: rgba(255,255,255,0.6);">No results found</div>';
        return;
    }
    
    const resultsHTML = results.map(item => `
        <div class="search-result-item" onclick="selectSearchResult(${item.id}, '${item.type}')">
            <img src="${item.poster}" alt="${item.title}" onerror="this.style.display='none'">
            <div class="search-result-info">
                <h4>${item.title}</h4>
                <p>${item.type} • ${item.year}</p>
            </div>
        </div>
    `).join('');
    
    searchResults.innerHTML = resultsHTML;
}

function clearSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.innerHTML = '';
    }
}

function selectSearchResult(id, type) {
    // Navigate to search page with the selected item
    navigateToSearch({ search: document.getElementById('searchInput').value });
    closeSearch();
}

// Active navigation links
function setupActiveNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Handle hash-based navigation
        if (href && href.includes('#')) {
            const hash = href.split('#')[1];
            if (currentHash === '#' + hash || (currentHash === '' && hash === 'home')) {
                link.classList.add('active');
            }
        }
        // Handle regular page navigation
        else if (href === currentPath) {
            link.classList.add('active');
        }
    });
    
    // Update active link on hash change
    window.addEventListener('hashchange', function() {
        updateActiveNavLink();
    });
}

function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentHash = window.location.hash;
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href && href.includes('#')) {
            const hash = href.split('#')[1];
            if (currentHash === '#' + hash || (currentHash === '' && hash === 'home')) {
                link.classList.add('active');
            }
        }
    });
}

// Help Center functionality
function openHelpCenter() {
    const modal = document.getElementById("helpCenterModal");
    if (modal) {
        modal.style.display = "flex";
    } else {
        // Create help center modal if it doesn't exist
        createHelpCenterModal();
    }
}

function closeHelpCenter() {
    const modal = document.getElementById("helpCenterModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function createHelpCenterModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "helpCenterModal";
    modal.style.display = "none";
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeHelpCenter()">&times;</button>
            <h2>Help Center</h2>
            <div class="help-content">
                <p>Welcome to NStream Help Center!</p>
                <h3>Contact Support</h3>
                <p>Email: support@nstream.com</p>
                <p>Phone: 1-800-NSTREAM</p>
                <h3>Common Issues</h3>
                <ul>
                    <li>Playback problems</li>
                    <li>Account management</li>
                    <li>Billing questions</li>
                    <li>Technical support</li>
                </ul>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = "flex";
}

function logoutUser() {
    if (confirm('Are you sure you want to sign out?')) {
        fetch('/api/logout', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.clear(); // Clear all stored data
                window.location.href = '/login';
            } else {
                console.error('Logout failed:', data.message);
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            // Fallback - clear storage and redirect to login anyway
            localStorage.clear();
            window.location.href = '/login';
        });
    }
}

// Legacy functions for backward compatibility
function toggleSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    if (searchOverlay) {
        if (searchOverlay.classList.contains('active')) {
            closeSearch();
        } else {
            openSearch();
        }
    }
}