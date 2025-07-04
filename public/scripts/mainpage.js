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
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption."
  },
  {
    id: 6,
    title: "The Office",
    type: "series",
    genre: "comedy",
    rating: 8.9,
    year: 2005,
    studio: "NBC",
    parentalGuidance: "TV-14",
    releaseDate: "2005-03-24",
    status: "completed",
    popularity: 89,
    views: 6200000,
    viewsFormatted: "6.2M",
    description: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
    episodes: [
      {
        id: 1,
        title: "Pilot",
        description: "A documentary crew arrives at the Scranton branch of the Dunder Mifflin Paper Company.",
        releaseDate: "2005-03-24",
        popularity: 85,
        rating: 7.5,
        views: 800000,
        viewsFormatted: "800K",
        duration: "22 min",
        season: 1,
        episode: 1
      }
    ]
  }
];

let filteredData = [...contentData];
let currentGenreFilter = 'all';
let currentSearchTerm = '';

document.addEventListener("DOMContentLoaded", () => {
  renderContent('moviesGrid', 'movie');
  renderContent('trendingGrid', 'all', 'popularity');
  renderContent('tvshowsGrid', 'series');

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') performSearch(this.value);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(anchor.getAttribute('href').substring(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
});

function renderContent(gridId, type, sortBy = 'none') {
  const grid = document.getElementById(gridId);
  grid.innerHTML = '';

  let data = filteredData.filter(item => type === 'all' || item.type === type);
  if (sortBy !== 'none') {
    data.sort((a, b) => {
      switch (sortBy) {
        case 'popularity': return b.popularity - a.popularity;
        case 'views': return b.views - a.views;
        case 'rating': return b.rating - a.rating;
        case 'year': return b.year - a.year;
        default: return 0;
      }
    });
  }

  data.forEach(item => {
    const card = createContentCard(item);
    grid.appendChild(card);
  });
}

function createContentCard(item) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.dataset.itemId = item.id; // Add data attribute for reference
  card.addEventListener('click', () => openModal(item)); // Use addEventListener for better event handling
  const displayType = item.type === 'series' ? 'SERIES' : item.type.toUpperCase();
  card.innerHTML = `
    <div class="movie-poster">
      <i class="fas fa-${item.type === 'movie' ? 'film' : 'tv'}"></i>
    </div>
    <div class="movie-info">
      <h3 class="movie-title">${item.title}</h3>
      <div class="movie-type">${displayType}</div>
      <div class="movie-info-content">
        <span class="movie-genre">${item.genre.toUpperCase()}</span>
        <span>${item.year}</span>
      </div>
      <div class="movie-rating">
        <span class="rating-stars"><i class="fas fa-star star"></i></span>
        <span>${item.rating}/10</span>
      </div>
    </div>
  `;
  return card;
}

function toggleSearch() {
  const searchOverlay = document.getElementById('searchOverlay');
  searchOverlay.style.display = (searchOverlay.style.display === 'flex') ? 'none' : 'flex';
}

function filterContent(genre) {
  currentGenreFilter = genre;
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.category-btn[onclick="filterContent('${genre}')"]`).classList.add('active');
  applyFilters();
}

function performSearch(query) {
  currentSearchTerm = query.trim().toLowerCase();
  applyFilters();
  document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
  toggleSearch();
}

function applyFilters() {
  filteredData = contentData.filter(item => {
    const matchesGenre = currentGenreFilter === 'all' || item.genre.toLowerCase() === currentGenreFilter.toLowerCase();
    const matchesSearch = currentSearchTerm === '' ||
      item.title.toLowerCase().includes(currentSearchTerm) ||
      item.genre.toLowerCase().includes(currentSearchTerm) ||
      item.description.toLowerCase().includes(currentSearchTerm);
    return matchesGenre && matchesSearch;
  });

  renderContent('moviesGrid', 'movie');
  renderContent('trendingGrid', 'all', 'popularity');
  renderContent('tvshowsGrid', 'series');
}

function openModal(item) {
  const modal = document.getElementById('contentModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalType = document.getElementById('modalType');
  const modalDescription = document.getElementById('modalDescription');
  const episodesSection = document.getElementById('episodesSection');
  const episodesList = document.getElementById('episodesList');
  const typeDisplay = item.type === 'series' ? 'SERIES' : item.type.toUpperCase();

  modalTitle.textContent = item.title;
  modalType.textContent = typeDisplay;
  modalDescription.textContent = item.description;
  document.getElementById('modalGenre').textContent = item.genre.charAt(0).toUpperCase() + item.genre.slice(1);
  document.getElementById('modalStudio').textContent = item.studio;
  document.getElementById('modalReleaseDate').textContent = item.releaseDate;
  document.getElementById('modalViews').textContent = item.viewsFormatted;
  document.getElementById('modalPopularity').textContent = `${item.popularity}%`;
  document.getElementById('modalRating').textContent = `${item.rating}/10`;
  document.getElementById('modalParentalGuidance').textContent = item.parentalGuidance;

  const statusRow = document.getElementById('modalStatusRow');
  if (item.type === 'series' && item.status) {
    statusRow.style.display = 'flex';
    document.getElementById('modalStatus').textContent = item.status.charAt(0).toUpperCase() + item.status.slice(1);
  } else {
    statusRow.style.display = 'none';
  }

  if (item.type === 'series' && item.episodes) {
    episodesSection.style.display = 'block';
    episodesList.innerHTML = item.episodes.map(episode => `
      <div class="episode-card">
        <div class="episode-content">
          <div class="episode-video">
            <div class="episode-thumbnail">
              <i class="fas fa-play-circle"></i>
              <div class="episode-duration">${episode.duration}</div>
            </div>
          </div>
          <div class="episode-details">
            <div class="episode-title">S${episode.season}E${episode.episode}: ${episode.title}</div>
            <div class="episode-info">
              <span>Released: ${episode.releaseDate}</span>
              <div class="episode-stats">
                <span><i class="fas fa-star star"></i> ${episode.rating}</span>
                <span><i class="fas fa-eye"></i> ${episode.viewsFormatted}</span>
                <span><i class="fas fa-fire"></i> ${episode.popularity}%</span>
              </div>
            </div>
            <div class="episode-description">${episode.description}</div>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    episodesSection.style.display = 'none';
  }

  resetUserActions();
  modal.style.display = 'block'; // Ensure modal is shown
}

function resetUserActions() {
  const likeBtn = document.getElementById('likeBtn');
  const likeText = document.getElementById('likeText');
  likeBtn.classList.remove('active');
  likeText.textContent = 'Like';
}

function watchNow() {
  alert('No Player Yet');
}

function toggleLike() {
  const btn = document.getElementById('likeBtn');
  const text = document.getElementById('likeText');
  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    text.textContent = 'Like';
  } else {
    btn.classList.add('active');
    text.textContent = 'Liked';
  }
}

function closeModal() {
  document.getElementById('contentModal').style.display = 'none';
}

function openLearnMore() {
  let modal = document.getElementById("learnMoreModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "learnMoreModal";
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="closeLearnMore()">×</button>
        <h2>About NStream</h2>
        <p>NStream is your ultimate entertainment hub for streaming blockbuster movies, trending series, and exclusive originals—all in one platform with zero ads and unlimited access.</p>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = "flex";
}

function closeLearnMore() {
  const modal = document.getElementById("learnMoreModal");
  if (modal) modal.style.display = "none";
}

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

function openChangeProfileModal() {
  const modal = document.getElementById("changeProfileModal");
  const list = document.getElementById("changeProfileList");
  const profiles = getProfiles();

  list.innerHTML = "";

  profiles.forEach((profile, index) => {
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

  modal.style.display = "flex";
}

function closeChangeProfileModal() {
  document.getElementById("changeProfileModal").style.display = "none";
}

function updateNavbarProfile(profile) {
  const avatarEl = document.querySelector(".profile-avatar");
  if (avatarEl && profile) {
    avatarEl.src = profile.avatar;
    avatarEl.alt = profile.name;
  }
}

function openHelpCenter() {
  document.getElementById("helpCenterModal").style.display = "flex";
}

function closeHelpCenter() {
  document.getElementById("helpCenterModal").style.display = "none";
}

function toggleProfileMenu() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.classList.toggle("hidden");
}

window.onload = () => {
  const profile = getCurrentProfile();
  if (profile) {
    updateNavbarProfile(profile);
  }
};

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('contentModal');
  if (event.target === modal) {
    closeModal();
  }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});
// Add this function to get favorites for the current profile
function getFavorites() {
  const profile = getCurrentProfile();
  if (!profile) return [];
  const favorites = JSON.parse(localStorage.getItem(`favorites_${profile.name}`)) || [];
  return favorites;
}

// Add this function to save favorites for the current profile
function saveFavorites(favorites) {
  const profile = getCurrentProfile();
  if (!profile) return;
  localStorage.setItem(`favorites_${profile.name}`, JSON.stringify(favorites));
}

// Modify toggleLike to handle adding/removing from favorites
function toggleLike() {
  const btn = document.getElementById('likeBtn');
  const text = document.getElementById('likeText');
  const modalTitle = document.getElementById('modalTitle').textContent;
  const content = contentData.find(item => item.title === modalTitle);
  
  if (!content) return;

  const profile = getCurrentProfile();
  if (!profile) {
    alert('Please select a profile to like content.');
    return;
  }

  let favorites = getFavorites();
  
  if (btn.classList.contains('active')) {
    // Remove from favorites
    favorites = favorites.filter(fav => fav.id !== content.id);
    btn.classList.remove('active');
    text.textContent = 'Like';
  } else {
    // Add to favorites
    favorites.push(content);
    btn.classList.add('active');
    text.textContent = 'Liked';
  }

  saveFavorites(favorites);
}

// Update openModal to set like button state based on favorites
function openModal(item) {
  const modal = document.getElementById('contentModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalType = document.getElementById('modalType');
  const modalDescription = document.getElementById('modalDescription');
  const episodesSection = document.getElementById('episodesSection');
  const episodesList = document.getElementById('episodesList');
  const likeBtn = document.getElementById('likeBtn');
  const likeText = document.getElementById('likeText');
  const typeDisplay = item.type === 'series' ? 'SERIES' : item.type.toUpperCase();

  modalTitle.textContent = item.title;
  modalType.textContent = typeDisplay;
  modalDescription.textContent = item.description;
  document.getElementById('modalGenre').textContent = item.genre.charAt(0).toUpperCase() + item.genre.slice(1);
  document.getElementById('modalStudio').textContent = item.studio;
  document.getElementById('modalReleaseDate').textContent = item.releaseDate;
  document.getElementById('modalViews').textContent = item.viewsFormatted;
  document.getElementById('modalPopularity').textContent = `${item.popularity}%`;
  document.getElementById('modalRating').textContent = `${item.rating}/10`;
  document.getElementById('modalParentalGuidance').textContent = item.parentalGuidance;

  const statusRow = document.getElementById('modalStatusRow');
  if (item.type === 'series' && item.status) {
    statusRow.style.display = 'flex';
    document.getElementById('modalStatus').textContent = item.status.charAt(0).toUpperCase() + item.status.slice(1);
  } else {
    statusRow.style.display = 'none';
  }

  if (item.type === 'series' && item.episodes) {
    episodesSection.style.display = 'block';
    episodesList.innerHTML = item.episodes.map(episode => `
      <div class="episode-card">
        <div class="episode-content">
          <div class="episode-video">
            <div class="episode-thumbnail">
              <i class="fas fa-play-circle"></i>
              <div class="episode-duration">${episode.duration}</div>
            </div>
          </div>
          <div class="episode-details">
            <div class="episode-title">S${episode.season}E${episode.episode}: ${episode.title}</div>
            <div class="episode-info">
              <span>Released: ${episode.releaseDate}</span>
              <div class="episode-stats">
                <span><i class="fas fa-star star"></i> ${episode.rating}</span>
                <span><i class="fas fa-eye"></i> ${episode.viewsFormatted}</span>
                <span><i class="fas fa-fire"></i> ${episode.popularity}%</span>
              </div>
            </div>
            <div class="episode-description">${episode.description}</div>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    episodesSection.style.display = 'none';
  }

  // Check if item is in favorites and set button state
  const favorites = getFavorites();
  const isFavorited = favorites.some(fav => fav.id === item.id);
  if (isFavorited) {
    likeBtn.classList.add('active');
    likeText.textContent = 'Liked';
  } else {
    likeBtn.classList.remove('active');
    likeText.textContent = 'Like';
  }

  modal.style.display = 'block';
}

function getCurrentProfile() {
  return JSON.parse(localStorage.getItem("currentProfile"));
}

function getFavorites() {
  const profile = getCurrentProfile();
  if (!profile) return [];
  return JSON.parse(localStorage.getItem(`favorites_${profile.name}`)) || [];
}

function saveFavorites(favorites) {
  const profile = getCurrentProfile();
  if (!profile) return;
  localStorage.setItem(`favorites_${profile.name}`, JSON.stringify(favorites));
}

function toggleFavorite(movie) {
  const favorites = getFavorites();
  const index = favorites.findIndex(fav => fav.id === movie.id);

  if (index !== -1) {
    // Already in favorites – remove
    favorites.splice(index, 1);
  } else {
    // Add to favorites
    favorites.push(movie);
  }

  saveFavorites(favorites);
  updateLikeButton(movie.id); // Optional: visual feedback
}

function updateLikeButton(movieId) {
  const button = document.querySelector(`.like-btn[data-id="${movieId}"]`);
  if (!button) return;

  const favorites = getFavorites();
  const isFavorite = favorites.some(m => m.id === movieId);
  button.classList.toggle("liked", isFavorite);
}
document.addEventListener("DOMContentLoaded", () => {
  const profile = getCurrentProfile();
  if (!profile) {
    alert("Please select a profile to view favorites.");
    return;
  }

  const favorites = getFavorites();
  const grid = document.getElementById("favoritesGrid");

  if (!favorites.length) {
    grid.innerHTML = "<p style='text-align: center;'>No favorites added yet.</p>";
    return;
  }

  favorites.forEach(item => {
    const card = createContentCard(item);
    grid.appendChild(card);
  });
});

function getCurrentProfile() {
  return JSON.parse(localStorage.getItem("currentProfile"));
}

function getFavorites() {
  const profile = getCurrentProfile();
  if (!profile) return [];
  return JSON.parse(localStorage.getItem(`favorites_${profile.name}`)) || [];
}

function createContentCard(item) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.dataset.itemId = item.id;
  card.addEventListener("click", () => openModal(item));

  const displayType = item.type === "series" ? "SERIES" : item.type.toUpperCase();

  card.innerHTML = `
    <div class="movie-poster">
      <i class="fas fa-${item.type === "movie" ? "film" : "tv"}"></i>
    </div>
    <div class="movie-info">
      <h3 class="movie-title">${item.title}</h3>
      <div class="movie-type">${displayType}</div>
      <div class="movie-info-content">
        <span class="movie-genre">${item.genre.toUpperCase()}</span>
        <span>${item.year}</span>
      </div>
      <div class="movie-rating">
        <span class="rating-stars"><i class="fas fa-star star"></i></span>
        <span>${item.rating}/10</span>
      </div>
    </div>
  `;

  return card;
}

// ... (your existing JavaScript code) ...

function openInfoModal() {
  const infoModal = document.getElementById('infoModal');
  if (infoModal) {
    infoModal.style.display = 'flex'; // Use 'flex' to activate the centering from .modal
  }
}

function closeInfoModal() {
  const infoModal = document.getElementById('infoModal');
  if (infoModal) {
    infoModal.style.display = 'none';
  }
}

// ... (rest of your existing JavaScript code) ...
