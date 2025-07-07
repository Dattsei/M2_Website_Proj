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
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        poster: "assets/images/dark-knight.jpg",
        videoFile: "assets/videos/darkknight.mp4", // Ensure this path is correct
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
        poster: "assets/images/breaking-bad.jpg",
        videoFile: "assets/videos/breaking-bad.mp4", // Ensure this path is correct

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
                episode: 1,
                videoFile: "assets/videos/breaking-bad-s1e1.mp4" // Add video file for episodes too
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
                episode: 2,
                videoFile: "assets/videos/breaking-bad-s1e2.mp4" // Add video file for episodes
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
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given Romanshe inverse task of planting an idea into the mind of a C.E.O.",
        poster: "assets/images/inception.jpg",
        videoFile: "assets/videos/inception.mp4" // Ensure this path is correct
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
        poster: "assets/images/stranger-things.jpg",
        videoFile: "assets/videos/stranger-things.mp4", // Add a main video file for the series if applicable
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
                episode: 1,
                videoFile: "assets/videos/stranger-things-s1e1.mp4" // Add video file for episodes
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
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        poster: "assets/images/pulp-fiction.jpg",
        videoFile: "assets/videos/pulp-fiction.mp4" // Ensure this path is correct
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
        poster: "assets/images/the-office.jpg",
        videoFile: "assets/videos/the-office.mp4", // Add a main video file for the series if applicable
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
                episode: 1,
                videoFile: "assets/videos/the-office-s1e1.mp4" // Add video file for episodes
            }
        ]
    },
];

// --- Favorites Management ---

function getCurrentProfile() {
    return JSON.parse(localStorage.getItem("currentProfile"));
}

function getFavoritesForCurrentProfile() {
    const profile = getCurrentProfile();
    if (!profile) return [];
    return JSON.parse(localStorage.getItem(`favorites_${profile.name}`)) || [];
}

function saveFavoritesForCurrentProfile(favoritesToSave) {
    const profile = getCurrentProfile();
    if (!profile) {
        alert('Please select a profile to like content.');
        return;
    }
    localStorage.setItem(`favorites_${profile.name}`, JSON.stringify(favoritesToSave));
}

// --- Navigation Functions ---

function toggleMobileMenu() {
    const navContent = document.getElementById('navContent');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    navContent.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
}

// --- Search and Filter/Sort Logic ---

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
            break;
    }
    return filtered;
}

function displayContent(contentToDisplay) {
    const contentGrid = document.getElementById('contentGrid');
    const resultsInfo = document.getElementById('resultsInfo');
    contentGrid.innerHTML = '';

    const itemsToDisplay = contentToDisplay.length > 0 ? contentToDisplay : contentData;
    
    resultsInfo.textContent = `Showing ${itemsToDisplay.length} results`;

    itemsToDisplay.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('content-card');
        card.innerHTML = `
            <div class="card-image">
                <img src="${item.poster || 'assets/images/default-poster.png'}" 
                     alt="${item.title}" 
                     onerror="this.src='assets/images/default-poster.png'">
                <i class="fas fa-play-circle play-icon"></i>
            </div>
            <div class="card-content">
                <h3>${item.title}</h3>
                <span class="card-type">${item.type}</span>
                <div class="card-info">
                    <span>${item.genre}</span>
                    <span><i class="fas fa-star"></i> ${item.rating}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => openModal(item.id));
        contentGrid.appendChild(card);
    });
}
// --- Modal Functions ---

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
const likeBtn = document.getElementById('likeBtn');
const likeText = document.getElementById('likeText');

// New video elements
const videoPlayerContainer = document.querySelector('.video-player-container');
const modalVideoPlayer = document.getElementById('modalVideoPlayer');
const watchNowBtn = document.querySelector('.watch-now-btn'); // Get the button reference
const watchNowText = document.getElementById('watchNowText'); // Get the text span reference

let currentModalContentId = null;

function openModal(id) {
    const content = contentData.find(item => item.id === id);
    if (!content) {
        console.error('Content not found for ID:', id);
        return;
    }

    currentModalContentId = id;

    modalTitle.textContent = content.title;
    modalType.textContent = content.type.toUpperCase();
    modalDescription.textContent = content.description;
    modalGenre.textContent = content.genre.charAt(0).toUpperCase() + content.genre.slice(1);
    modalStudio.textContent = content.studio;
    modalReleaseDate.textContent = content.releaseDate;

    if (content.type === 'series' && content.status) {
        modalStatus.textContent = content.status.charAt(0).toUpperCase() + content.status.slice(1);
        modalStatusRow.style.display = 'flex';
    } else {
        modalStatusRow.style.display = 'none';
    }

    modalViews.textContent = content.viewsFormatted || content.views.toLocaleString();
    modalPopularity.textContent = `${content.popularity}%`;
    modalRating.textContent = content.rating;
    modalParentalGuidance.textContent = content.parentalGuidance;

    const modalHeader = document.querySelector('.modal-header');
    modalHeader.innerHTML = `
        <img src="${content.poster || 'assets/images/default-poster.png'}" alt="${content.title} Poster" class="modal-poster" onerror="this.src='assets/images/default-poster.png'" />
        <button class="modal-close" onclick="closeModal()">×</button>
    `;

    // Hide video player and reset button text when opening a new modal
    videoPlayerContainer.style.display = 'none';
    modalVideoPlayer.pause();
    modalVideoPlayer.removeAttribute('src'); // Clear video source
    watchNowText.textContent = 'Watch Now';
    watchNowBtn.innerHTML = '<i class="fas fa-play"></i> <span id="watchNowText">Watch Now</span>';


    if (content.type === 'series' && content.episodes && content.episodes.length > 0) {
        episodesSection.style.display = 'block';
        episodesList.innerHTML = '';
        content.episodes.forEach(episode => {
            const episodeCard = document.createElement('div');
            episodeCard.classList.add('episode-card');
            episodeCard.innerHTML = `
                <div class="episode-content">
                    <div class="episode-video">
                        <i class="fas fa-play-circle"></i>
                        <div class="episode-duration">${episode.duration || ''}</div>
                    </div>
                    <div class="episode-details">
                        <h4 class="episode-title">S${episode.season}E${episode.episode}: ${episode.title}</h4>
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
            // Add click listener for episode video
            episodeCard.querySelector('.episode-video').addEventListener('click', () => playEpisode(episode.id, content.id));
            episodesList.appendChild(episodeCard);
        });
    } else {
        episodesSection.style.display = 'none';
    }

    updateLikeButtonState(currentModalContentId);

    contentModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    contentModal.style.display = 'none';
    document.body.style.overflow = '';
    currentModalContentId = null;

    // Stop and clear video when closing modal
    modalVideoPlayer.pause();
    modalVideoPlayer.removeAttribute('src');
    modalVideoPlayer.load(); // Explicitly load to reset state in some browsers
    videoPlayerContainer.style.display = 'none'; // Hide the video player
    watchNowText.textContent = 'Watch Now'; // Reset watch button text
    watchNowBtn.innerHTML = '<i class="fas fa-play"></i> <span id="watchNowText">Watch Now</span>'; // Reset watch button icon
}

window.addEventListener('click', (event) => {
    if (event.target === contentModal) {
        closeModal();
    }
});

function toggleLike() {
    if (currentModalContentId === null) return;

    const contentId = currentModalContentId;
    const contentToLike = contentData.find(item => item.id === contentId);

    let favorites = getFavoritesForCurrentProfile();

    const index = favorites.findIndex(item => item.id === contentId);

    if (index > -1) {
        favorites.splice(index, 1);
        console.log(`Removed content ID ${contentId} from favorites.`);
    } else {
        favorites.push(contentToLike);
        console.log(`Added content ID ${contentId} to favorites.`);
    }
    saveFavoritesForCurrentProfile(favorites);
    updateLikeButtonState(contentId);
}

function updateLikeButtonState(contentId) {
    const favorites = getFavoritesForCurrentProfile();
    if (favorites.some(item => item.id === contentId)) {
        likeBtn.classList.add('active');
        likeText.textContent = 'Liked';
    } else {
        likeBtn.classList.remove('active');
        likeText.textContent = 'Like';
    }
}

function watchNow() {
    if (currentModalContentId === null) return;

    const content = contentData.find(item => item.id === currentModalContentId);

    if (videoPlayerContainer.style.display === 'block') {
        // If video is currently showing, hide it
        videoPlayerContainer.style.display = 'none';
        modalVideoPlayer.pause();
        modalVideoPlayer.removeAttribute('src'); // Clear video source
        watchNowText.textContent = 'Watch Now';
        watchNowBtn.innerHTML = '<i class="fas fa-play"></i> <span id="watchNowText">Watch Now</span>'; // Restore play icon
    } else {
        // If video is hidden, show it and play
        if (content && content.videoFile) {
            modalVideoPlayer.src = content.videoFile;
            videoPlayerContainer.style.display = 'block';
            modalVideoPlayer.load(); // Ensure the video source is loaded
            modalVideoPlayer.play().catch(error => {
                console.error("Autoplay failed:", error);
                // Handle autoplay restrictions (e.g., show a play button overlay)
                alert("Autoplay prevented. Please click play on the video player.");
            });
            watchNowText.textContent = 'Hide Video';
            watchNowBtn.innerHTML = '<i class="fas fa-stop"></i> <span id="watchNowText">Hide Video</span>'; // Change icon to stop
        } else {
            alert('Video not available for this content.');
            videoPlayerContainer.style.display = 'none';
        }
    }
}

// Function to play a specific episode
function playEpisode(episodeId, seriesId) {
    const series = contentData.find(item => item.id === seriesId && item.type === 'series');
    if (!series || !series.episodes) {
        console.error('Series or episodes not found.');
        return;
    }

    const episode = series.episodes.find(ep => ep.id === episodeId);
    if (episode && episode.videoFile) {
        // Hide modal header (poster) and show video player
        document.querySelector('.modal-header').style.display = 'none';
        videoPlayerContainer.style.display = 'block';
        modalVideoPlayer.src = episode.videoFile;
        modalVideoPlayer.load();
        modalVideoPlayer.play().catch(error => {
            console.error("Autoplay failed for episode:", error);
            alert("Autoplay prevented for episode. Please click play on the video player.");
        });

        // Update the "Watch Now" button to "Hide Video" and current content to this episode's series
        currentModalContentId = seriesId; // Keep the modal context to the series
        watchNowText.textContent = 'Hide Video';
        watchNowBtn.innerHTML = '<i class="fas fa-stop"></i> <span id="watchNowText">Hide Video</span>';
    } else {
        alert('Episode video not available.');
    }
}


// --- Initial Load ---

document.addEventListener('DOMContentLoaded', () => {
    displayContent(filterAndSortContent(contentData));
});