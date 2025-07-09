document.addEventListener("DOMContentLoaded", async () => {
    await renderFavorites();
});

async function getCurrentProfile() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const data = await response.json();
        return data.profiles[data.activeProfile] || null;
    } catch (error) {
        console.error('Error getting current profile:', error);
        return null;
    }
}

async function getFavorites() {
    const profile = await getCurrentProfile();
    if (!profile) return [];
    
    try {
        const response = await fetch(`/api/favorites?profile=${profile.name}`);
        if (!response.ok) throw new Error('Failed to fetch favorites');
        return await response.json();
    } catch (error) {
        console.error('Error getting favorites:', error);
        return [];
    }
}

async function saveFavorites(favorites) {
    const profile = await getCurrentProfile();
    if (!profile) return;
    
    try {
        const response = await fetch(`/api/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profile: profile.name,
                favorites
            })
        });
        
        if (!response.ok) throw new Error('Failed to save favorites');
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
}

async function renderFavorites() {
    const grid = document.getElementById("favoritesGrid");
    grid.innerHTML = '<div class="loading">Loading favorites...</div>';
    
    try {
        const favorites = await getFavorites();

        if (favorites.length === 0) {
            grid.innerHTML = "<p>No favorites added yet.</p>";
            return;
        }

        grid.innerHTML = '';
        for (const movie of favorites) {
            const card = document.createElement("div");
            card.className = "movie-card";
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
                <button class="remove-btn" title="Remove from favorites" data-id="${movie.id}">×</button>
            `;
            
            grid.appendChild(card);
            
            // Add event listener to the remove button
            const removeBtn = card.querySelector('.remove-btn');
            removeBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await removeFavorite(movie.id);
            });
        }
    } catch (error) {
        console.error('Error rendering favorites:', error);
        grid.innerHTML = '<p class="error">Failed to load favorites. Please try again later.</p>';
    }
}

async function removeFavorite(id) {
    try {
        const favorites = await getFavorites();
        const newFavorites = favorites.filter(movie => movie.id !== id);
        await saveFavorites(newFavorites);
        await renderFavorites();
    } catch (error) {
        console.error('Error removing favorite:', error);
        alert('Failed to remove favorite. Please try again.');
    }
}

// This block ensures the profile avatar updates if you're directly on favorites.html
window.addEventListener('load', async () => {
    try {
        const profile = await getCurrentProfile();
        const avatar = document.querySelector(".profile-avatar");
        if (profile && avatar) {
            avatar.src = profile.avatar;
            avatar.alt = profile.name;
        }
    } catch (error) {
        console.error('Error loading profile avatar:', error);
    }
});