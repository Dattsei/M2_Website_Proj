// Show default section on load
window.onload = () => {
  showSection('dashboard');
  updateCounts();
  renderUserTable();
  renderSubscriptionTable();
  refreshTable();
};

function showSection(id) {
  // Hide all sections
  const sections = document.querySelectorAll('main > div.section');
  sections.forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show the selected section
  const activeSection = document.getElementById(id);
  if (activeSection) {
    activeSection.classList.remove('hidden');
  }

  // Update mobile dropdown
  const dropdown = document.getElementById('mobile-nav');
  if (dropdown) {
    dropdown.value = id;
  }

  // Update desktop navigation active state
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to current nav link
  const activeLink = document.querySelector(`.nav-links a[onclick*="${id}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

function updateCounts() {
  document.getElementById('userCount').textContent = data.userList.length;
  document.getElementById('subCount').textContent = subscriptionList.filter(sub => sub.plan !== 'Explorer (Free)').length;
  document.getElementById('contentCount').textContent = movieList.length;
}

function toggleUploadModal(state) {
  document.getElementById("uploadModal").classList.toggle("hidden", !state);
}

function clearPoster() {
  posterBase64 = "";
  document.getElementById("posterImage").value = "";
  document.getElementById("posterPreview").classList.add("hidden");
  document.querySelector("#posterPreview img").src = "";
}

function clearForm() {
  if (confirm("Are you sure you want to clear all inputs?")) {
    document.getElementById("movieForm").reset();
    genreSet.clear();
    posterBase64 = "";
    document.getElementById("posterPreview").classList.add("hidden");
    document.getElementById("genreButtons").innerHTML = "";
    document.getElementById("selectedGenres").classList.add("hidden");
    document.getElementById("selectedGenres").textContent = "";
    document.getElementById("genreList").value = '';
    resetEpisodes();
    renderGenreButtons();
    toggleEpisodeButton();
  }
}

const genreSet = new Set();
const genreOptions = ["Action", "Drama", "Sci-Fi", "Romance", "Comedy", "Horror", "Thriller", "Fantasy", "Adventure", "Mystery", "Documentary", "Animation", "Family"];
let movieList = [];
let posterBase64 = "";

function openMovieModal(movie = null, index = null) {
  toggleUploadModal(true);
  document.getElementById("movieForm").reset();
  genreSet.clear();
  posterBase64 = "";
  document.getElementById("posterPreview").classList.add("hidden");
  document.getElementById("movieId").value = index !== null ? index : "";
  document.getElementById("modalTitle").textContent = movie ? "Edit Movie/Series" : "Upload Movie/Series";

  if (movie) {
    document.getElementById("movieTitle").value = movie.title;
    document.getElementById("movieDesc").value = movie.description;
    document.getElementById("movieRating").value = movie.rating;
    document.getElementById("videoLink").value = movie.video || "";
    document.getElementById("trailerLink").value = movie.trailer || "";
    document.getElementById("releaseDate").value = movie.release;
    document.getElementById("studio").value = movie.studio;
    document.getElementById("contentType").value = movie.type;
    
    if (movie.genres && Array.isArray(movie.genres)) {
      movie.genres.forEach(g => genreSet.add(g));
    }
    
    document.getElementById("genreList").value = Array.from(genreSet).join(", ");
    updateSelectedGenres();

    if (movie.poster) {
      posterBase64 = movie.poster;
      const preview = document.getElementById("posterPreview");
      preview.querySelector("img").src = posterBase64;
      preview.classList.remove("hidden");
    }

    episodes = movie.episodes || [];
    renderEpisodeList();
  }
  
  toggleEpisodeButton();
  renderGenreButtons();
}

function renderGenreButtons() {
  const container = document.getElementById("genreButtons");
  container.innerHTML = "";
  genreOptions.forEach(genre => {
    const selected = genreSet.has(genre);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = (selected ? "✓ " : "+ ") + genre;
    btn.className = selected ? "btn-genre-selected" : "btn-genre";
    btn.onclick = () => toggleGenre(genre);
    container.appendChild(btn);
  });
  updateSelectedGenres();
}

function toggleGenre(genre) {
  if (genreSet.has(genre)) genreSet.delete(genre);
  else genreSet.add(genre);
  renderGenreButtons();
}

function updateSelectedGenres() {
  const selected = [...genreSet];
  const text = document.getElementById("selectedGenres");
  if (selected.length) {
    text.textContent = "Selected: " + selected.join(", ");
    text.classList.remove("hidden");
  } else {
    text.textContent = "";
    text.classList.add("hidden");
  }
  document.getElementById("genreList").value = selected.join(", ");
}

document.getElementById("posterImage")?.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      posterBase64 = e.target.result;
      const preview = document.getElementById("posterPreview");
      preview.querySelector("img").src = posterBase64;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
});

// JavaScript to support episode modal management
let episodes = [];
let editingEpisode = null;
let episodePosterBase64 = "";

function toggleEpisodeButton() {
  const isSeries = document.getElementById("contentType").value === "Series";
  const episodeBtn = document.getElementById("episodeManagerBtn");
  const movieVideoField = document.getElementById("movieVideoField");
  
  if (episodeBtn) {
    episodeBtn.classList.toggle("hidden", !isSeries);
  }
  if (movieVideoField) {
    movieVideoField.style.display = isSeries ? 'none' : 'block';
  }
  
  if (!isSeries) resetEpisodes();
}

function resetEpisodes() {
  episodes = [];
  const episodeList = document.getElementById("episodeListPreview");
  if (episodeList) {
    episodeList.innerHTML = '';
  }
}

function openEpisodeManager(index = null) {
  editingEpisode = index;
  document.getElementById("episodeForm").reset();
  episodePosterBase64 = "";
  document.getElementById("episodePosterPreview").classList.add("hidden");
  document.getElementById("episodePosterPreview").querySelector("img").src = "";

  if (index !== null && episodes[index]) {
    const ep = episodes[index];
    document.getElementById("editingEpisodeIndex").value = index;
    document.getElementById("episodeTitleInput").value = ep.title;
    document.getElementById("episodeDescInput").value = ep.description;
    document.getElementById("episodeVideoInput").value = ep.video;
    document.getElementById("episodeReleaseInput").value = ep.release;
    
    if (ep.poster) {
      episodePosterBase64 = ep.poster;
      document.getElementById("episodePosterPreview").classList.remove("hidden");
      document.getElementById("episodePosterPreview").querySelector("img").src = ep.poster;
    }
  } else {
    document.getElementById("editingEpisodeIndex").value = "";
  }

  document.getElementById("episodeModal").classList.remove("hidden");
}

function closeEpisodeModal() {
  document.getElementById("episodeModal").classList.add("hidden");
}

function clearEpisodePoster() {
  episodePosterBase64 = "";
  document.getElementById("episodePosterInput").value = "";
  document.getElementById("episodePosterPreview").classList.add("hidden");
}

document.getElementById("episodePosterInput")?.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      episodePosterBase64 = e.target.result;
      const preview = document.getElementById("episodePosterPreview");
      preview.querySelector("img").src = episodePosterBase64;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
});

function saveEpisode(event) {
  event.preventDefault();
  const episode = {
    title: document.getElementById("episodeTitleInput").value.trim(),
    description: document.getElementById("episodeDescInput").value.trim(),
    video: document.getElementById("episodeVideoInput").value.trim(),
    release: document.getElementById("episodeReleaseInput").value,
    poster: episodePosterBase64
  };

  const index = document.getElementById("editingEpisodeIndex").value;
  if (index !== "") {
    episodes[parseInt(index)] = episode;
  } else {
    episodes.push(episode);
  }

  renderEpisodeList();
  closeEpisodeModal();
}

function renderEpisodeList() {
  const list = document.getElementById("episodeListPreview");
  if (!list) return;
  
  list.innerHTML = "";

  episodes.forEach((ep, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>Episode ${index + 1}</strong>: ${ep.title}
      <button type="button" onclick="openEpisodeManager(${index})">Edit</button>
      <button type="button" onclick="deleteEpisode(${index})">Delete</button>
      <button type="button" onclick="previewEpisode(${index})">Preview</button>`;
    list.appendChild(li);
  });
}

function deleteEpisode(index) {
  if (confirm("Are you sure you want to delete this episode?")) {
    episodes.splice(index, 1);
    renderEpisodeList();
  }
}

function previewEpisode(index) {
  if (!episodes[index]) return;
  
  const ep = episodes[index];
  document.getElementById('episodeTitlePreview').textContent = ep.title;
  document.getElementById('episodePosterPreview').src = ep.poster || '';
  document.getElementById('episodeNumberPreview').textContent = index + 1;
  document.getElementById('episodeTitleText').textContent = ep.title;
  document.getElementById('episodeDescText').textContent = ep.description;
  document.getElementById('episodeVideoPreview').textContent = ep.video;
  document.getElementById('episodeReleasePreview').textContent = ep.release;
  document.getElementById('episodePreviewModal').classList.remove('hidden');
}

function closeEpisodePreview() {
  document.getElementById('episodePreviewModal').classList.add('hidden');
}

function submitMovie(event) {
  event.preventDefault();

  const type = document.getElementById("contentType").value;
  const genres = document.getElementById("genreList").value;
  
  const movie = {
    type: type,
    title: document.getElementById("movieTitle").value.trim(),
    description: document.getElementById("movieDesc").value.trim(),
    studio: document.getElementById("studio").value.trim(),
    genres: genres ? genres.split(", ").filter(g => g.trim()) : [],
    rating: document.getElementById("movieRating").value,
    trailer: document.getElementById("trailerLink").value.trim(),
    video: type === 'Movie' ? document.getElementById("videoLink").value.trim() : "",
    release: document.getElementById("releaseDate").value,
    poster: posterBase64,
    episodes: type === 'Series' ? [...episodes] : []
  };

  const id = document.getElementById("movieId").value;
  if (id !== "") {
    movieList[parseInt(id)] = movie;
  } else {
    movieList.push(movie);
  }

  refreshTable();
  updateCounts();
  toggleUploadModal(false);
}

function previewMovie(movie) {
  document.getElementById("previewName").textContent = movie.title;
  document.getElementById("previewPoster").src = movie.poster || '';
  document.getElementById("previewDesc").textContent = movie.description;
  document.getElementById("previewStudio").textContent = movie.studio;
  document.getElementById("previewGenres").textContent = Array.isArray(movie.genres) ? movie.genres.join(', ') : '';
  document.getElementById("previewRating").textContent = movie.rating;
  document.getElementById("previewRelease").textContent = movie.release;

  const episodesContainer = document.getElementById("previewEpisodesContainer");
  const episodesList = document.getElementById("previewEpisodesList");
  episodesList.innerHTML = '';

  if (movie.type === 'Series' && movie.episodes && movie.episodes.length > 0) {
    episodesContainer.classList.remove("hidden");
    movie.episodes.forEach((ep, i) => {
      const li = document.createElement('li');
      li.innerHTML = `Episode ${i + 1}: ${ep.title} <button onclick="previewStaticEpisode(${i}, '${movie.title}')">View</button>`;
      episodesList.appendChild(li);
    });
  } else {
    episodesContainer.classList.add("hidden");
  }

  document.getElementById("contentPreviewModal").classList.remove("hidden");
}

function previewStaticEpisode(episodeIndex, movieTitle) {
  // Find the movie by title to get the episode
  const movie = movieList.find(m => m.title === movieTitle);
  if (!movie || !movie.episodes || !movie.episodes[episodeIndex]) return;
  
  const ep = movie.episodes[episodeIndex];
  document.getElementById('episodeTitlePreview').textContent = ep.title;
  document.getElementById('episodePosterPreview').src = ep.poster || '';
  document.getElementById('episodeNumberPreview').textContent = episodeIndex + 1;
  document.getElementById('episodeTitleText').textContent = ep.title;
  document.getElementById('episodeDescText').textContent = ep.description;
  document.getElementById('episodeVideoPreview').textContent = ep.video;
  document.getElementById('episodeReleasePreview').textContent = ep.release;
  document.getElementById('episodePreviewModal').classList.remove('hidden');
}

function refreshTable() {
  const tbody = document.getElementById("contentTable");
  if (!tbody) return;
  
  tbody.innerHTML = "";

  if (movieList.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "No movies/series in here.";
    cell.style.textAlign = "center";
    cell.style.padding = "1rem";
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  movieList.forEach((movie, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${movie.title}</td>
      <td>${movie.type}</td>
      <td>${movie.release}</td>
      <td>
        <button class="btn-link" onclick="editMovie(${index})">Edit</button>
        <button class="btn-link btn-delete" onclick="deleteMovie(${index})">Delete</button>
        <button class="btn-link" onclick="previewMovieByIndex(${index})">Preview</button>
      </td>`;
    tbody.appendChild(row);
  });
}

function editMovie(index) {
  if (movieList[index]) {
    openMovieModal(movieList[index], index);
  }
}

function previewMovieByIndex(index) {
  if (movieList[index]) {
    previewMovie(movieList[index]);
  }
}

function deleteMovie(index) {
  if (confirm("Are you sure you want to delete this movie?")) {
    movieList.splice(index, 1);
    refreshTable();
    updateCounts();
  }
}

function closeContentPreview() {
  document.getElementById("contentPreviewModal").classList.add("hidden");
}

// USERS DATA
const data = {
  users: 0,
  subscriptions: 0,
  content: [],
  userList: [
    {
      fullName: 'Ramon Fuentes',
      email: 'ramon@example.com',
      address: 'Matina St',
      phone: '09171234567',
      status: 'Active',
      subscription: 'Standard'
    },
    {
      fullName: 'David Axl Andoy',
      email: 'david@example.com',
      address: 'Samal St',
      phone: '09172345678',
      status: 'Active',
      subscription: 'Basic'
    },
    {
      fullName: 'Vincent Jade Datiles',
      email: 'vincent@example.com',
      address: 'Boulevard St',
      phone: '09173456789',
      status: 'Suspended',
      subscription: 'Free'
    }
  ]
};

function renderUserTable() {
  const table = document.getElementById('userTable');
  if (!table) return;
  
  table.innerHTML = '';

  if (data.userList.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.textContent = 'No users available.';
    cell.style.textAlign = 'center';
    cell.style.padding = '1rem';
    row.appendChild(cell);
    table.appendChild(row);
  } else {
    data.userList.forEach((user, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.fullName}</td>
        <td>${user.email}</td>
        <td>
          <button class="btn-link" onclick="editUser(${index})">Edit</button>
          <button class="btn-link" onclick="viewUserProfile(${index})">Preview</button>
          <button class="btn-link btn-delete" onclick="deleteUser(${index})">Delete</button>
        </td>`;
      table.appendChild(row);
    });
  }
}

function editUser(index) {
  if (!data.userList[index]) return;
  
  const user = data.userList[index];
  document.getElementById('editUserIndex').value = index;
  document.getElementById('editUserEmail').value = user.email;
  document.getElementById('editUserName').value = user.fullName;
  document.getElementById('editUserAddress').value = user.address;
  document.getElementById('editUserPhone').value = user.phone;
  document.getElementById('editUserStatus').value = user.status;
  document.getElementById('editUserSubscription').value = user.subscription;
  toggleUserModal(true);
}

function submitUserEdit(event) {
  event.preventDefault();
  const index = parseInt(document.getElementById('editUserIndex').value);
  
  if (data.userList[index]) {
    data.userList[index] = {
      email: document.getElementById('editUserEmail').value.trim(),
      fullName: document.getElementById('editUserName').value.trim(),
      address: document.getElementById('editUserAddress').value.trim(),
      phone: document.getElementById('editUserPhone').value.trim(),
      status: document.getElementById('editUserStatus').value,
      subscription: document.getElementById('editUserSubscription').value
    };
    
    renderUserTable();
    updateCounts();
    toggleUserModal(false);
  }
}

function deleteUser(index) {
  if (data.userList[index] && confirm(`Delete user: ${data.userList[index].fullName}?`)) {
    data.userList.splice(index, 1);
    renderUserTable();
    updateCounts();
  }
}

function toggleUserModal(state) {
  const modal = document.getElementById('userModal');
  if (modal) {
    modal.classList.toggle('user-modal-hidden', !state);
  }
}

function viewUserProfile(index) {
  if (!data.userList[index]) return;
  
  const user = data.userList[index];
  document.getElementById("userProfileEmail").textContent = user.email;
  document.getElementById("userProfileName").textContent = user.fullName;
  document.getElementById("userProfileStatus").textContent = user.status;
  document.getElementById("userProfilePhone").textContent = user.phone;
  document.getElementById("userProfileAddress").textContent = user.address;
  document.getElementById("userProfileSubscription").textContent = user.subscription || 'None';
  document.getElementById("userProfileModal").classList.remove("hidden");
}

function closeUserProfile() {
  document.getElementById("userProfileModal").classList.add("hidden");
}

// SUBSCRIPTIONS DATA
const subscriptionList = [
  { name: 'Ramon Fuentes', plan: 'Monthly', expires: '2025-07-19' },
  { name: 'David Axl Andoy', plan: 'Yearly', expires: '2026-01-01' },
  { name: 'Vincent Jade Datiles', plan: 'Explorer (Free)', expires: 'N/A' }
];

function renderSubscriptionTable() {
  const tbody = document.getElementById('subscriptionTable');
  if (!tbody) return;
  
  tbody.innerHTML = '';

  subscriptionList.forEach(sub => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sub.name}</td>
      <td>${sub.plan}</td>
      <td>${sub.expires}</td>
    `;
    tbody.appendChild(row);
  });
}