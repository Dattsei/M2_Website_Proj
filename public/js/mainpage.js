// Toggle search overlay
function toggleSearch() {
    const searchOverlay = document.getElementById('searchOverlay');
    if (searchOverlay.style.display === 'flex') {
        searchOverlay.style.display = 'none';
    } else {
        searchOverlay.style.display = 'flex';
    }
}

// Toggle profile menu (placeholder functionality)
function toggleProfile() {
    alert('Profile menu toggle placeholder.');
}

// Dummy data for movies/TV shows
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

// Load dummy data into a given grid
function loadMovies(gridId, genre = 'all') {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';

    const filtered = genre === 'all' ? sampleMovies : sampleMovies.filter(m => m.genre.toLowerCase() === genre.toLowerCase());

    filtered.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        card.innerHTML = `
            <div class="movie-poster">${movie.title.charAt(0)}</div>
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-genre">${movie.genre}</div>
                <div class="movie-rating">
                    <span class="rating-stars">${'★'.repeat(movie.rating)}${'☆'.repeat(5 - movie.rating)}</span>
                    <span>${movie.rating}/5</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter content by category
function filterContent(genre) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.category-btn[onclick="filterContent('${genre}')"]`).classList.add('active');

    loadMovies('moviesGrid', genre);
    loadMovies('trendingGrid', genre);
    loadMovies('tvshowsGrid', genre);
}

// Perform search (basic demo)
function performSearch(query) {
    console.log("Searching for:", query);
    // For a real app, search logic would be implemented here.
}

// Load initial data on page load
document.addEventListener("DOMContentLoaded", () => {
    loadMovies('moviesGrid');
    loadMovies('trendingGrid');
    loadMovies('tvshowsGrid');
});


// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

