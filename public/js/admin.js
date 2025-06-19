// Show default section on load
window.onload = () => {
  showSection('dashboard');
};

function showSection(id) {
  const sections = document.querySelectorAll('main > div');
  sections.forEach(section => section.classList.add('hidden'));
  const active = document.getElementById(id);
  if (active) active.classList.remove('hidden');

  const dropdown = document.getElementById('mobile-nav');
  if (dropdown) dropdown.value = id;
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
    document.getElementById("videoLink").value = movie.video;
    document.getElementById("releaseDate").value = movie.release;
    document.getElementById("studio").value = movie.studio;
    document.getElementById("contentType").value = movie.type;
    movie.genres.forEach(g => genreSet.add(g));
    document.getElementById("genreList").value = movie.genres.join(", ");
    updateSelectedGenres();

    if (movie.poster) {
      posterBase64 = movie.poster;
      const preview = document.getElementById("posterPreview");
      preview.querySelector("img").src = posterBase64;
      preview.classList.remove("hidden");
    }

    episodes = movie.episodes || [];
    renderEpisodeList();
    toggleEpisodeSection();
  }

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
    text.style.display = "block";
  } else {
    text.textContent = "";
    text.style.display = "none";
  }
  document.getElementById("genreList").value = selected.join(", ");
}

document.getElementById("posterImage").addEventListener("change", function () {
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
  document.getElementById("episodeManagerBtn").classList.toggle("hidden", !isSeries);
  document.getElementById("movieVideoField").style.display = isSeries ? 'none' : 'block';
  if (!isSeries) resetEpisodes();
}

function resetEpisodes() {
  episodes = [];
  document.getElementById("episodeListPreview").innerHTML = '';
}

function openEpisodeManager(index = null) {
  editingEpisode = index;
  document.getElementById("episodeForm").reset();
  episodePosterBase64 = "";
  document.getElementById("episodePosterPreview").classList.add("hidden");
  document.getElementById("episodePosterPreview").querySelector("img").src = "";

  if (index !== null) {
    const ep = episodes[index];
    document.getElementById("editingEpisodeIndex").value = index;
    document.getElementById("episodeTitleInput").value = ep.title;
    document.getElementById("episodeDescInput").value = ep.description;
    document.getElementById("episodeVideoInput").value = ep.video;
    document.getElementById("episodeReleaseInput").value = ep.release;
    episodePosterBase64 = ep.poster;
    document.getElementById("episodePosterPreview").classList.remove("hidden");
    document.getElementById("episodePosterPreview").querySelector("img").src = ep.poster;
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

document.getElementById("episodePosterInput").addEventListener("change", function () {
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
    episodes[index] = episode;
  } else {
    episodes.push(episode);
  }

  renderEpisodePreviewList();
  closeEpisodeModal();
}

function renderEpisodePreviewList() {
  const list = document.getElementById("episodeListPreview");
  list.innerHTML = "";

  episodes.forEach((ep, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>Episode ${index + 1}</strong>: ${ep.title}
      <button onclick="openEpisodeManager(${index})">Edit</button>
      <button onclick="deleteEpisode(${index})">Delete</button>
      <button onclick="previewEpisode(${index})">Preview</button>`;
    list.appendChild(li);
  });
}

function deleteEpisode(index) {
  if (confirm("Are you sure you want to delete this episode?")) {
    episodes.splice(index, 1);
    renderEpisodePreviewList();
  }
}

function previewEpisode(index) {
  const ep = episodes[index];
  document.getElementById('episodeTitlePreview').textContent = ep.title;
  document.getElementById('episodePosterPreview').src = ep.poster;
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
  const movie = {
    type: type,
    title: document.getElementById("movieTitle").value,
    description: document.getElementById("movieDesc").value,
    studio: document.getElementById("studio").value,
    genres: document.getElementById("genreList").value.split(", "),
    rating: document.getElementById("movieRating").value,
    trailer: document.getElementById("trailerLink").value,
    video: type === 'Movie' ? document.getElementById("videoLink").value : "",
    release: document.getElementById("releaseDate").value,
    poster: posterBase64,
    episodes: type === 'Series' ? [...episodes] : []
  };

  const id = document.getElementById("movieId").value;
  if (id !== "") movieList[id] = movie;
  else movieList.push(movie);

  refreshTable();
  toggleUploadModal(false);
}

function previewMovie(movie) {
  document.getElementById("previewName").textContent = movie.title;
  document.getElementById("previewPoster").src = movie.poster;
  document.getElementById("previewDesc").textContent = movie.description;
  document.getElementById("previewStudio").textContent = movie.studio;
  document.getElementById("previewGenres").textContent = movie.genres.join(', ');
  document.getElementById("previewRating").textContent = movie.rating;
  document.getElementById("previewRelease").textContent = movie.release;

  const episodesContainer = document.getElementById("previewEpisodesContainer");
  const episodesList = document.getElementById("previewEpisodesList");
  episodesList.innerHTML = '';

  if (movie.type === 'Series' && movie.episodes.length > 0) {
    episodesContainer.classList.remove("hidden");
    movie.episodes.forEach((ep, i) => {
      const li = document.createElement('li');
      li.innerHTML = `Episode ${i + 1}: ${ep.title} <button onclick='previewStaticEpisode(${JSON.stringify(ep)})'>View</button>`;
      episodesList.appendChild(li);
    });
  } else {
    episodesContainer.classList.add("hidden");
  }

  document.getElementById("contentPreviewModal").classList.remove("hidden");
}

function previewStaticEpisode(ep) {
  document.getElementById('episodeTitlePreview').textContent = ep.title;
  document.getElementById('episodePosterPreview').src = ep.poster;
  document.getElementById('episodeNumberPreview').textContent = "-";
  document.getElementById('episodeTitleText').textContent = ep.title;
  document.getElementById('episodeDescText').textContent = ep.description;
  document.getElementById('episodeVideoPreview').textContent = ep.video;
  document.getElementById('episodeReleasePreview').textContent = ep.release;
  document.getElementById('episodePreviewModal').classList.remove('hidden');
}

function refreshTable() {
  const tbody = document.getElementById("contentTable");
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
        <button class="btn-link" onclick='openMovieModal(${JSON.stringify(movie)}, ${index})'>Edit</button>
        <button class="btn-link btn-delete" onclick='deleteMovie(${index})'>Delete</button>
        <button class="btn-link" onclick='previewMovie(${JSON.stringify(movie)})'>Preview</button>
      </td>`;
    tbody.appendChild(row);
  });
}

function deleteMovie(index) {
  if (confirm("Are you sure you want to delete this movie?")) {
    movieList.splice(index, 1);
    refreshTable();
  }
}

function previewMovie(movie) {
  document.getElementById("previewName").textContent = movie.title;
  document.getElementById("previewPoster").src = movie.poster;
  document.getElementById("previewDesc").textContent = movie.description;
  document.getElementById("previewStudio").textContent = movie.studio;
  document.getElementById("previewGenres").textContent = movie.genres.join(', ');
  document.getElementById("previewRating").textContent = movie.rating;
  document.getElementById("previewRelease").textContent = movie.release;

  const episodesContainer = document.getElementById("previewEpisodesContainer");
  const episodesList = document.getElementById("previewEpisodesList");
  episodesList.innerHTML = '';

  if (movie.type === 'Series' && movie.episodes.length > 0) {
    episodesContainer.classList.remove("hidden");
    movie.episodes.forEach((ep, i) => {
      const li = document.createElement('li');
      li.textContent = `Episode ${i + 1}: ${ep.title}`;
      episodesList.appendChild(li);
    });
  } else {
    episodesContainer.classList.add("hidden");
  }

  document.getElementById("contentPreviewModal").classList.remove("hidden");
}

function closeContentPreview() {
  document.getElementById("contentPreviewModal").classList.add("hidden");
}


// USERS
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
          <button class="btn-link" onclick="viewUserProfile(data.userList[${index}])">Preview</button>
          <button class="btn-link btn-delete" onclick="deleteUser(${index})">Delete</button>
        </td>`;
      table.appendChild(row);
    });
  }

  document.getElementById('userCount').textContent = data.userList.length;
}

function editUser(index) {
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
  const index = document.getElementById('editUserIndex').value;
  data.userList[index] = {
    email: document.getElementById('editUserEmail').value,
    fullName: document.getElementById('editUserName').value,
    address: document.getElementById('editUserAddress').value,
    phone: document.getElementById('editUserPhone').value,
    status: document.getElementById('editUserStatus').value,
    subscription: document.getElementById('editUserSubscription').value
  };
  renderUserTable();
  document.getElementById('userCount').textContent = data.userList.length;
  toggleUserModal(false);
}

function deleteUser(index) {
  if (confirm(`Delete user: ${data.userList[index].fullName}?`)) {
    data.userList.splice(index, 1);
    renderUserTable();
    document.getElementById('userCount').textContent = data.userList.length;
  }
}

function toggleUserModal(state) {
  const modal = document.getElementById('userModal');
  modal.classList.toggle('user-modal-hidden', !state);
}

function viewUserProfile(user) {
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

const subscriptionList = [
  { name: 'Ramon Fuentes', plan: 'Monthly', expires: '2025-07-19' },
  { name: 'David Axl Andoy', plan: 'Yearly', expires: '2026-01-01' },
  { name: 'Vincent Jade Datiles', plan: 'Explorer (Free)', expires: 'N/A' }
];

function renderSubscriptionTable() {
  const tbody = document.getElementById('subscriptionTable');
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

renderSubscriptionTable();
refreshTable();
renderUserTable();
