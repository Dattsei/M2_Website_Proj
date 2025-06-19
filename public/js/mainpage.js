// Sample Movies
const sampleMovies = [
  { title: "Red Dawn", genre: "Action", rating: 4 },
  { title: "Laugh Out Loud", genre: "Comedy", rating: 3 },
  { title: "Starlight", genre: "Drama", rating: 5 },
  { title: "Orbit", genre: "Sci-Fi", rating: 4 },
  { title: "Scarehouse", genre: "Horror", rating: 2 },
  { title: "Love Bytes", genre: "Romance", rating: 5 },
  { title: "Thrill Point", genre: "Thriller", rating: 3 },
  { title: "Cartoonia", genre: "Animation", rating: 4 },
];

// Toggle search overlay
function toggleSearch() {
  const searchOverlay = document.getElementById('searchOverlay');
  searchOverlay.style.display = (searchOverlay.style.display === 'flex') ? 'none' : 'flex';
}

// Toggle profile menu (placeholder)
function toggleProfile() {
  alert('Profile menu toggle placeholder.');
}

// Load and render movies
function loadMovies(gridId, genre = 'all') {
  const grid = document.getElementById(gridId);
  grid.innerHTML = '';

  const filtered = genre === 'all'
    ? sampleMovies
    : sampleMovies.filter(m => m.genre.toLowerCase() === genre.toLowerCase());

  filtered.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => openMovieDetail(movie);
    card.innerHTML = `
      <div class="movie-poster">${movie.title.charAt(0)}</div>
      <div class="movie-info">
        <div class="movie-title">${movie.title}</div>
        <div class="movie-genre">${movie.genre}</div>
        <div class="movie-rating">
          <span class="rating-stars">${'★'.repeat(movie.rating)}${'☆'.repeat(5 - movie.rating)}</span>
          <span>${movie.rating}/5</span>
        </div>
        <button class="icon-btn" onclick='event.stopPropagation(); addToFavorites(${JSON.stringify(movie)})'>♥</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Add to favorites
function addToFavorites(movie) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.some(fav => fav.title === movie.title)) {
    favorites.push(movie);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert(`${movie.title} added to favorites!`);
  } else {
    alert(`${movie.title} is already in your favorites.`);
  }
}

// Filter by genre
function filterContent(genre) {
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.category-btn[onclick="filterContent('${genre}')"]`).classList.add('active');

  loadMovies('moviesGrid', genre);
  loadMovies('trendingGrid', genre);
  loadMovies('tvshowsGrid', genre);
}

// Search
function performSearch(query) {
  const results = sampleMovies.filter(movie =>
    movie.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  ['moviesGrid', 'trendingGrid', 'tvshowsGrid'].forEach(id => {
    const grid = document.getElementById(id);
    grid.innerHTML = '';
  });

  const resultGrid = document.getElementById('moviesGrid');
  if (results.length === 0) {
    resultGrid.innerHTML = '<p style="color: gray;">No results found.</p>';
    return;
  }

  results.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => openMovieDetail(movie);
    card.innerHTML = `
      <div class="movie-poster">${movie.title.charAt(0)}</div>
      <div class="movie-info">
        <div class="movie-title">${movie.title}</div>
        <div class="movie-genre">${movie.genre}</div>
        <div class="movie-rating">
          <span class="rating-stars">${'★'.repeat(movie.rating)}${'☆'.repeat(5 - movie.rating)}</span>
          <span>${movie.rating}/5</span>
        </div>
        <button class="icon-btn" onclick='event.stopPropagation(); addToFavorites(${JSON.stringify(movie)})'>♥</button>
      </div>
    `;
    resultGrid.appendChild(card);
  });

  document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
}

// Learn more modal
function openLearnMore() {
  let modal = document.getElementById("learnMoreModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "learnMoreModal";
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="closeLearnMore()">&times;</button>
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

// Movie detail modal
function openMovieDetail(movie) {
  document.getElementById('modalMovieTitle').textContent = movie.title;
  document.getElementById('modalMovieGenre').textContent = movie.genre;
  document.getElementById('modalMovieRating').textContent = `${movie.rating}/5 (${ '★'.repeat(movie.rating)}${'☆'.repeat(5 - movie.rating) })`;
  document.getElementById('movieDetailModal').style.display = 'flex';
}

function closeMovieDetail() {
  document.getElementById('movieDetailModal').style.display = 'none';
}

// Startup
document.addEventListener("DOMContentLoaded", () => {
  loadMovies('moviesGrid');
  loadMovies('trendingGrid');
  loadMovies('tvshowsGrid');

  // Start watching scroll
  const startBtn = document.getElementById('startWatchingBtn');
  if (startBtn) {
    startBtn.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
      loadMovies('moviesGrid', 'all');
    });
  }

  // Smooth nav scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(anchor.getAttribute('href').substring(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Search enter key
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') performSearch(this.value);
    });
  }
});
