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
let currentTypeFilter = 'all';
let currentGenreFilter = 'all';
let currentSearchTerm = '';
let currentSortBy = 'none';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  renderContent();
});

function renderContent() {
  const grid = document.getElementById('contentGrid');
  const resultsInfo = document.getElementById('resultsInfo');
  
  grid.innerHTML = '';
  
  filteredData.forEach(item => {
    const card = createContentCard(item);
    grid.appendChild(card);
  });
  
  resultsInfo.textContent = `Showing ${filteredData.length} results`;
}

function createContentCard(item) {
  const card = document.createElement('div');
  card.className = 'content-card';
  card.onclick = () => openModal(item);
  
  card.innerHTML = `
    <div class="card-image">
      <i class="fas fa-${item.type === 'movie' ? 'film' : 'tv'}"></i>
    </div>
    <div class="card-content">
      <h3 class="card-title">${item.title}</h3>
      <div class="card-type">${item.type.toUpperCase()}</div>
      <div class="card-info">
        <span class="card-genre">${item.genre.toUpperCase()}</span>
        <span>${item.year}</span>
      </div>
      <div class="card-rating">
        <i class="fas fa-star star"></i>
        <span>${item.rating}</span>
      </div>
    </div>
  `;
  
  return card;
}

function openModal(item) {
  const modal = document.getElementById('contentModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalType = document.getElementById('modalType');
  const modalDescription = document.getElementById('modalDescription');
  const episodesSection = document.getElementById('episodesSection');
  const episodesList = document.getElementById('episodesList');
  
  // basic info
  modalTitle.textContent = item.title;
  modalType.textContent = item.type.toUpperCase();
  modalDescription.textContent = item.description;
  
  // info values
  document.getElementById('modalGenre').textContent = item.genre.charAt(0).toUpperCase() + item.genre.slice(1);
  document.getElementById('modalStudio').textContent = item.studio;
  document.getElementById('modalReleaseDate').textContent = item.releaseDate;
  document.getElementById('modalViews').textContent = item.viewsFormatted;
  document.getElementById('modalPopularity').textContent = `${item.popularity}%`;
  document.getElementById('modalRating').textContent = `${item.rating}/10`;
  document.getElementById('modalParentalGuidance').textContent = item.parentalGuidance;
  
  // series status
  const statusRow = document.getElementById('modalStatusRow');
  if (item.type === 'series' && item.status) {
    statusRow.style.display = 'flex';
    document.getElementById('modalStatus').textContent = item.status.charAt(0).toUpperCase() + item.status.slice(1);
  } else {
    statusRow.style.display = 'none';
  }
  
  resetUserActions();
  
  // episodes for series
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
  
  modal.style.display = 'block';
}

function resetUserActions() {
  // reset watchlist button
  const watchlistBtn = document.getElementById('watchlistBtn');
  const watchlistText = document.getElementById('watchlistText');
  watchlistBtn.classList.remove('active');
  watchlistText.textContent = 'Add to Watchlist';
  
  // reset like button
  const likeBtn = document.getElementById('likeBtn');
  const likeText = document.getElementById('likeText');
  likeBtn.classList.remove('active');
  likeText.textContent = 'Like';
  
  // reset star rating
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.classList.remove('active');
  });
}

function watchNow() {

  alert('No Player Yet');

}

function toggleWatchlist() {
  const btn = document.getElementById('watchlistBtn');
  const text = document.getElementById('watchlistText');
  
  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    text.textContent = 'Add to Watchlist';

  } else {
    btn.classList.add('active');
    text.textContent = 'Remove from Watchlist';

  }
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

function setRating(rating) {
  const stars = document.querySelectorAll('.star-btn');
  
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
  

  console.log(`User rated: ${rating} stars`);
}

function closeModal() {
  document.getElementById('contentModal').style.display = 'none';
}

function filterByType(type) {
  currentTypeFilter = type;
  
  // update active button
  document.querySelectorAll('[data-type]').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-type="${type}"]`).classList.add('active');
  
  applyFilters();
}

function filterByGenre() {
  currentGenreFilter = document.getElementById('genreFilter').value;
  applyFilters();
}

function sortBy() {
  currentSortBy = document.getElementById('sortFilter').value;
  applyFilters();
}

function handleSearch() {
  currentSearchTerm = document.getElementById('searchInput').value.toLowerCase();
  applyFilters();
}

function applyFilters() {
  // filter the data
  filteredData = contentData.filter(item => {
    const matchesType = currentTypeFilter === 'all' || item.type === currentTypeFilter;
    const matchesGenre = currentGenreFilter === 'all' || item.genre === currentGenreFilter;
    const matchesSearch = currentSearchTerm === '' || 
                        item.title.toLowerCase().includes(currentSearchTerm) ||
                        item.genre.toLowerCase().includes(currentSearchTerm) ||
                        item.description.toLowerCase().includes(currentSearchTerm);
    
    return matchesType && matchesGenre && matchesSearch;
  });
  
  // sort the data
  if (currentSortBy !== 'none') {
    filteredData.sort((a, b) => {
      switch (currentSortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'views':
          return b.views - a.views;
        case 'rating':
          return b.rating - a.rating;
        case 'year':
          return b.year - a.year;
        default:
          return 0;
      }
    });
  }
  
  renderContent();
}

function toggleMobileMenu() {
  const navContent = document.getElementById('navContent');
  navContent.classList.toggle('active');
}

// close mobile menu when clicking outside
document.addEventListener('click', function(event) {
  const navContent = document.getElementById('navContent');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navContainer = document.querySelector('.nav-container');
  
  if (!navContainer.contains(event.target)) {
    navContent.classList.remove('active');
  }
});

// close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('contentModal');
  if (event.target === modal) {
    closeModal();
  }
}

// close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});