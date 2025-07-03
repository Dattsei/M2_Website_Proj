document.addEventListener("DOMContentLoaded", () => {
    renderFavorites();
});

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

function renderFavorites() {
    const grid = document.getElementById("favoritesGrid");
    const favorites = getFavorites();
    grid.innerHTML = '';

    if (favorites.length === 0) {
        grid.innerHTML = "<p>No favorites added yet.</p>";
        return;
    }

    favorites.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";
        // Assuming openMovieDetail is defined globally (e.g., in mainpage.js) or will be.
        // For now, it will log to console if openMovieDetail is not defined.
        card.onclick = () => {
            console.log("Opening movie detail for:", movie.title);
            // If openMovieDetail is a global function, uncomment the line below.
            // openMovieDetail(movie);
        };

        card.innerHTML = `
          <div class="movie-poster">
            ${movie.title.charAt(0)}
          </div>
          <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-genre">${movie.genre}</div>
            <div class="movie-rating">
              <span class="rating-stars">
                ${'★'.repeat(movie.rating)}${'☆'.repeat(5 - movie.rating)}
              </span>
              <span>${movie.rating}/5</span>
            </div>
          </div>
          <button class="remove-btn" title="Remove from favorites"
            onclick="event.stopPropagation(); removeFavorite(${movie.id})">×</button>
        `;
        grid.appendChild(card);
    });
}

// Make removeFavorite a global function so it can be called from onclick in HTML
window.removeFavorite = function(id) {
    let favorites = getFavorites().filter(movie => movie.id !== id);
    saveFavorites(favorites);
    renderFavorites(); // Re-render the list after removing
};

// This block ensures the profile avatar updates if you're directly on favorites.html
// Consider if this logic should reside in mainpage.js for global header updates.
window.onload = () => {
    const profile = JSON.parse(localStorage.getItem("currentProfile"));
    const avatar = document.querySelector(".profile-avatar");
    if (profile && avatar) {
        avatar.src = profile.avatar;
        avatar.alt = profile.name;
    }
};