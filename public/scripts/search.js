// Sample content data (your existing data from search.js)
const contentData = [
    {
        id: 1,
        title: "The Dark Knight",
        type: "movie",
        genre: "action",
        rating: 9.0,
        year: 2008,
        studio: "Warner Bros",
        parentalGuidance: "PG-13",
        releaseDate: "2008-07-18",
        popularity: 98,
        views: 2500000,
        viewsFormatted: "2.5M",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
    },
    {
        id: 2,
        title: "Breaking Bad",
        type: "series",
        genre: "drama",
        rating: 9.5,
        year: 2008,
        studio: "AMC",
        parentalGuidance: "TV-MA",
        releaseDate: "2008-01-20",
        status: "completed",
        popularity: 96,
        views: 5200000,
        viewsFormatted: "5.2M",
        description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
        episodes: [
            {
                id: 1,
                title: "Pilot",
                description: "Walter White, a struggling high school chemistry teacher, is diagnosed with lung cancer.",
                releaseDate: "2008-01-20",
                popularity: 92,
                rating: 8.2,
                views: 1400000,
                viewsFormatted: "1.4M",
                duration: "58 min",
                season: 1,
                episode: 1
            },
            {
                id: 2,
                title: "Cat's in the Bag...",
                description: "Walt and Jesse attempt to tie up loose ends.",
                releaseDate: "2008-01-27",
                popularity: 89,
                rating: 8.1,
                views: 1200000,
                viewsFormatted: "1.2M",
                duration: "48 min",
                season: 1,
                episode: 2
            }
        ]
    },
    {
        id: 3,
        title: "Inception",
        type: "movie",
        genre: "sci-fi",
        rating: 8.8,
        year: 2010,
        studio: "Warner Bros",
        parentalGuidance: "PG-13",
        releaseDate: "2010-07-16",
        popularity: 94,
        views: 3100000,
        viewsFormatted: "3.1M",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
    },
    {
        id: 4,
        title: "Stranger Things",
        type: "series",
        genre: "sci-fi",
        rating: 8.7,
        year: 2016,
        studio: "Netflix",
        parentalGuidance: "TV-14",
        releaseDate: "2016-07-15",
        status: "ongoing",
        popularity: 91,
        views: 4800000,
        viewsFormatted: "4.8M",
        description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
        episodes: [
            {
                id: 1,
                title: "The Vanishing of Will Byers",
                description: "On his way home from a friend's house, young Will sees something terrifying.",
                releaseDate: "2016-07-15",
                popularity: 88,
                rating: 8.7,
                views: 2100000,
                viewsFormatted: "2.1M",
                duration: "47 min",
                season: 1,
                episode: 1
            }
        ]
    },
    {
        id: 5,
        title: "Pulp Fiction",
        type: "movie",
        genre: "thriller",
        rating: 8.9,
        year: 1994,
        studio: "Miramax",
        parentalGuidance: "R",
        releaseDate: "1994-10-14",
        popularity: 93,
        views: 2800000,
        viewsFormatted: "2.8M",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
    },
    {
        id: 6,
        title: "The Office",
        type: "series",
        genre: "comedy",
        rating: 9.0,
        year: 2005,
        studio: "NBC",
        parentalGuidance: "TV-14",
        releaseDate: "2005-03-24",
        status: "completed",
        popularity: 90,
        views: 6000000,
        viewsFormatted: "6.0M",
        description: "A mockumentary on the everyday lives of a group of office employees in the Scranton, Pennsylvania, branch of the fictional Dunder Mifflin Paper Company.",
        episodes: [
            {
                id: 1,
                title: "Pilot",
                description: "A documentary crew comes to Dunder Mifflin to observe the daily lives of the employees.",
                releaseDate: "2005-03-24",
                popularity: 85,
                rating: 7.5,
                views: 1800000,
                viewsFormatted: "1.8M",
                duration: "23 min",
                season: 1,
                episode: 1
            }
        ]
    },
    {
        id: 7,
        title: "Parasite",
        type: "movie",
        genre: "thriller",
        rating: 8.6,
        year: 2019,
        studio: "CJ Entertainment",
        parentalGuidance: "R",
        releaseDate: "2019-05-30",
        popularity: 97,
        views: 1900000,
        viewsFormatted: "1.9M",
        description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim family."
    },
    {
        id: 8,
        title: "Band of Brothers",
        type: "series",
        genre: "drama",
        rating: 9.4,
        year: 2001,
        studio: "HBO",
        parentalGuidance: "TV-MA",
        releaseDate: "2001-09-09",
        status: "completed",
        popularity: 95,
        views: 3500000,
        viewsFormatted: "3.5M",
        description: "The story of Easy Company, 506th Regiment of the 101st Airborne Division from 1942 to 1945, from their basic training to the end of World War II.",
        episodes: [
            {
                id: 1,
                title: "Currahee",
                description: "The men of Easy Company begin their arduous training.",
                releaseDate: "2001-09-09",
                popularity: 90,
                rating: 9.0,
                views: 1100000,
                viewsFormatted: "1.1M",
                duration: "74 min",
                season: 1,
                episode: 1
            }
        ]
    },
    {
        id: 9,
        title: "Spider-Man: Into the Spider-Verse",
        type: "movie",
        genre: "animation",
        rating: 8.4,
        year: 2018,
        studio: "Sony Pictures",
        parentalGuidance: "PG",
        releaseDate: "2018-12-14",
        popularity: 92,
        views: 2700000,
        viewsFormatted: "2.7M",
        description: "Teen Miles Morales becomes Spider-Man of his reality and crosses paths with five counterparts from other dimensions to stop a threat to all realities."
    },
    {
        id: 10,
        title: "Our Planet",
        type: "series",
        genre: "documentary",
        rating: 9.3,
        year: 2019,
        studio: "Netflix",
        parentalGuidance: "TV-G",
        releaseDate: "2019-04-05",
        status: "completed",
        popularity: 88,
        views: 4000000,
        viewsFormatted: "4.0M",
        description: "Documentary series focusing on the breadth of the diversity of habitats around the world, from the remote Arctic wilderness and mysterious deep oceans to the vast landscapes of Africa and the diverse jungles of South America.",
        episodes: [
            {
                id: 1,
                title: "One Planet",
                description: "Experience our planet's natural beauty and examine how climate change impacts all living creatures.",
                releaseDate: "2019-04-05",
                popularity: 87,
                rating: 9.2,
                views: 1500000,
                viewsFormatted: "1.5M",
                duration: "50 min",
                season: 1,
                episode: 1
            }
        ]
    },
    {
        id: 11,
        title: "The Matrix",
        type: "movie",
        genre: "sci-fi",
        rating: 8.7,
        year: 1999,
        studio: "Warner Bros",
        parentalGuidance: "R",
        releaseDate: "1999-03-31",
        popularity: 90,
        views: 2900000,
        viewsFormatted: "2.9M",
        description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers."
    },
    {
        id: 12,
        title: "Friends",
        type: "series",
        genre: "comedy",
        rating: 8.9,
        year: 1994,
        studio: "NBC",
        parentalGuidance: "TV-PG",
        releaseDate: "1994-09-22",
        status: "completed",
        popularity: 85,
        views: 7000000,
        viewsFormatted: "7.0M",
        description: "Follows the personal and professional lives of six twenty-somethings living in Manhattan.",
        episodes: [
            {
                id: 1,
                title: "The One Where Monica Gets a Roommate",
                description: "Monica and the gang introduce Rachel to the 'real world' after she leaves her fiancé at the altar.",
                releaseDate: "1994-09-22",
                popularity: 80,
                rating: 8.5,
                views: 2000000,
                viewsFormatted: "2.0M",
                duration: "22 min",
                season: 1,
                episode: 1
            }
        ]
    }
];

// --- Favorites Management (UPDATED FOR PROFILE-SPECIFIC LOCAL STORAGE) ---

// Helper function to get the current profile from localStorage
function getCurrentProfile() {
    return JSON.parse(localStorage.getItem("currentProfile"));
}

// Helper function to get favorites for the current profile
function getFavoritesForCurrentProfile() {
    const profile = getCurrentProfile();
    if (!profile) return []; // Return empty array if no profile is active
    return JSON.parse(localStorage.getItem(`favorites_${profile.name}`)) || [];
}

// Helper function to save favorites for the current profile
function saveFavoritesForCurrentProfile(favoritesToSave) {
    const profile = getCurrentProfile();
    if (!profile) return;
    localStorage.setItem(`favorites_${profile.name}`, JSON.stringify(favoritesToSave));
}

// --- EXISTING FUNCTIONS (from your HTML/CSS) ---

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navContent = document.getElementById('navContent');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    navContent.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
}

// Search and Filter/Sort logic (placeholders for your existing functions)
let currentFilterType = 'all';
let currentFilterGenre = 'all';
let currentSortBy = 'none';
let currentSearchQuery = '';

function handleSearch() {
    currentSearchQuery = document.getElementById('searchInput').value.toLowerCase();
    displayContent(filterAndSortContent(contentData));
}

function filterByType(type) {
    currentFilterType = type;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.filter-btn[data-type="${type}"]`).classList.add('active');
    displayContent(filterAndSortContent(contentData));
}

function filterByGenre() {
    currentFilterGenre = document.getElementById('genreFilter').value;
    displayContent(filterAndSortContent(contentData));
}

function sortBy() {
    currentSortBy = document.getElementById('sortFilter').value;
    displayContent(filterAndSortContent(contentData));
}

function filterAndSortContent(data) {
    let filtered = data.filter(item => {
        const matchesType = currentFilterType === 'all' || item.type === currentFilterType;
        const matchesGenre = currentFilterGenre === 'all' || item.genre === currentFilterGenre;
        const matchesSearch = item.title.toLowerCase().includes(currentSearchQuery) ||
                                item.description.toLowerCase().includes(currentSearchQuery);
        return matchesType && matchesGenre && matchesSearch;
    });

    switch (currentSortBy) {
        case 'popularity':
            filtered.sort((a, b) => b.popularity - a.popularity);
            break;
        case 'views':
            filtered.sort((a, b) => b.views - a.views);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'year':
            filtered.sort((a, b) => b.year - a.year);
            break;
        default:
            // No sort
            break;
    }
    return filtered;
}

function displayContent(contentToDisplay) {
    const contentGrid = document.getElementById('contentGrid');
    const resultsInfo = document.getElementById('resultsInfo');
    contentGrid.innerHTML = ''; // Clear previous content

    resultsInfo.textContent = `Showing ${contentToDisplay.length} results`;

    if (contentToDisplay.length === 0) {
        contentGrid.innerHTML = '<p class="no-results">No content found matching your criteria.</p>';
        return;
    }

    contentToDisplay.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('content-card');
        card.dataset.id = item.id; // Store ID for modal
        card.innerHTML = `
            <div class="card-image">
                <i class="fas fa-play-circle"></i>
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.title}</h3>
                <span class="card-type">${item.type}</span>
                <div class="card-info">
                    <span class="card-genre">${item.genre}</span>
                    <span class="card-rating">
                        <i class="fas fa-star" style="color: #ffd700;"></i> ${item.rating}
                    </span>
                </div>
            </div>
        `;
        // Add event listener to open modal when card is clicked
        card.addEventListener('click', () => openModal(item.id));
        contentGrid.appendChild(card);
    });
}


// --- MODAL FUNCTIONS (updated for favorites) ---

const contentModal = document.getElementById('contentModal');
const modalTitle = document.getElementById('modalTitle');
const modalType = document.getElementById('modalType');
const modalDescription = document.getElementById('modalDescription');
const modalGenre = document.getElementById('modalGenre');
const modalStudio = document.getElementById('modalStudio');
const modalReleaseDate = document.getElementById('modalReleaseDate');
const modalStatusRow = document.getElementById('modalStatusRow');
const modalStatus = document.getElementById('modalStatus');
const modalViews = document.getElementById('modalViews');
const modalPopularity = document.getElementById('modalPopularity');
const modalRating = document.getElementById('modalRating');
const modalParentalGuidance = document.getElementById('modalParentalGuidance');
const episodesSection = document.getElementById('episodesSection');
const episodesList = document.getElementById('episodesList');
const likeBtn = document.getElementById('likeBtn'); // Get the like button element
const likeText = document.getElementById('likeText'); // Get the like text element

let currentModalContentId = null; // To keep track of the content currently in the modal

function openModal(id) {
    const content = contentData.find(item => item.id === id);
    if (!content) {
        console.error('Content not found for ID:', id);
        return;
    }

    currentModalContentId = id; // Store the ID of the opened content

    // Populate modal with content details
    modalTitle.textContent = content.title;
    modalType.textContent = content.type;
    modalDescription.textContent = content.description;
    modalGenre.textContent = content.genre.charAt(0).toUpperCase() + content.genre.slice(1); // Capitalize first letter
    modalStudio.textContent = content.studio;
    modalReleaseDate.textContent = content.releaseDate; // You might want to format this date

    // Handle optional fields (like status for series)
    if (content.type === 'series' && content.status) {
        modalStatus.textContent = content.status.charAt(0).toUpperCase() + content.status.slice(1);
        modalStatusRow.style.display = 'flex'; // Show the status row
    } else {
        modalStatusRow.style.display = 'none'; // Hide if not a series or no status
    }

    modalViews.textContent = content.viewsFormatted || content.views.toLocaleString();
    modalPopularity.textContent = `${content.popularity}%`;
    modalRating.textContent = content.rating;
    modalParentalGuidance.textContent = content.parentalGuidance;

    // Handle Episodes section for series
    if (content.type === 'series' && content.episodes && content.episodes.length > 0) {
        episodesSection.style.display = 'block'; // Show the episodes section
        episodesList.innerHTML = ''; // Clear previous episodes
        content.episodes.forEach(episode => {
            const episodeCard = document.createElement('div');
            episodeCard.classList.add('episode-card');
            episodeCard.innerHTML = `
                <div class="episode-content">
                    <div class="episode-video">
                        <i class="fas fa-play-circle"></i>
                    </div>
                    <div class="episode-details">
                        <h4 class="episode-title">Episode ${episode.episode}: ${episode.title}</h4>
                        <p class="episode-description">${episode.description}</p>
                        <div class="episode-meta">
                            <span class="episode-date">${episode.releaseDate}</span>
                            <div class="episode-stats">
                                <span><i class="fas fa-eye"></i> ${episode.viewsFormatted || episode.views.toLocaleString()}</span>
                                <span><i class="fas fa-heart"></i> ${episode.popularity}%</span>
                                <span><i class="fas fa-star"></i> ${episode.rating}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            episodesList.appendChild(episodeCard);
        });
    } else {
        episodesSection.style.display = 'none'; // Hide episodes section for movies or series without episodes
    }

    // Update the like button state based on currentModalContentId
    updateLikeButtonState(currentModalContentId);

    contentModal.style.display = 'flex'; // Make the modal visible
    document.body.style.overflow = 'hidden'; // Prevent scrolling the background
}

function closeModal() {
    contentModal.style.display = 'none'; // Hide the modal
    document.body.style.overflow = ''; // Restore background scrolling
    currentModalContentId = null; // Clear the current content ID
}

// Optional: Close modal when clicking outside the modal-content
window.addEventListener('click', (event) => {
    if (event.target === contentModal) {
        closeModal();
    }
});

function toggleLike() {
    if (currentModalContentId === null) return;

    const contentId = currentModalContentId;
    // Get the full content object to save, not just the ID
    const contentToLike = contentData.find(item => item.id === contentId); 

    let favorites = getFavoritesForCurrentProfile(); // Get current favorites for the profile

    const index = favorites.findIndex(item => item.id === contentId); // Use findIndex to check for the object

    if (index > -1) {
        // Item is already in favorites, so remove it
        favorites.splice(index, 1);
        console.log(`Removed content ID ${contentId} from favorites.`);
    } else {
        // Item is not in favorites, so add the full content object
        favorites.push(contentToLike);
        console.log(`Added content ID ${contentId} to favorites.`);
    }
    saveFavoritesForCurrentProfile(favorites); // Save updated favorites to localStorage
    updateLikeButtonState(contentId); // Update button text and style immediately
}

// Function to update the like button state based on content ID
function updateLikeButtonState(contentId) {
    const favorites = getFavoritesForCurrentProfile(); // Get current favorites for comparison
    if (favorites.some(item => item.id === contentId)) { // Check if any item in favorites has this ID
        likeBtn.classList.add('active');
        likeText.textContent = 'Liked';
    } else {
        likeBtn.classList.remove('active');
        likeText.textContent = 'Like';
    }
}

function watchNow() {
    // Implement watch now logic.
    // For example, redirect to a video player page or open an embedded player.
    if (currentModalContentId) {
        alert(`Watching content ID: ${currentModalContentId}`);
        // window.location.href = `watch.html?id=${currentModalContentId}`;
    }
}


// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    // This calls your display function with initial filters/sort.
    // The handleSearch, filterByType, filterByGenre, sortBy functions will then re-render based on user input.
    displayContent(filterAndSortContent(contentData));
});