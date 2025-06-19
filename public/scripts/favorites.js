document.addEventListener("DOMContentLoaded", () => {
  renderFavorites();
});

function renderFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const grid = document.getElementById("favoritesGrid");
  grid.innerHTML = '';

  if (favorites.length === 0) {
    grid.innerHTML = "<p>No favorites added yet.</p>";
  } else {
    favorites.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.onclick = () => openMovieDetail(movie);  // ✅ This enables modal on click
      card.innerHTML = `
        <div class="movie-poster">${movie.title.charAt(0)}</div>
        <div class="movie-info">
          <div class="movie-title">${movie.title}</div>
          <div class="movie-genre">${movie.genre}</div>
          <div class="movie-rating">
            <span class="rating-stars">${'★'.repeat(movie.rating)}${'☆'.repeat(5 - movie.rating)}</span>
            <span>${movie.rating}/5</span>
          </div>
          <button class="icon-btn" onclick="event.stopPropagation(); removeFavorite('${movie.title}')">×</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }
}


function removeFavorite(title) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(movie => movie.title !== title);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}
