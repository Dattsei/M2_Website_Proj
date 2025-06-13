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
  const input = document.getElementById("posterImage");
  input.value = "";
  document.getElementById("posterPreview").classList.add("hidden");
  document.querySelector("#posterPreview img").src = "";
}

function clearForm() {
  if (confirm("Are you sure you want to clear all inputs?")) {
    document.getElementById("movieForm").reset();
    clearPoster();
    document.getElementById("genreButtons").innerHTML = "";
    document.getElementById("selectedGenres").classList.add("hidden");
    document.getElementById("selectedGenres").textContent = "";
  }
}



// Show default section on load
window.onload = () => {
  showSection('dashboard');
};

// Function to show selected section and hide others
function showSection(id) {
  const sections = document.querySelectorAll('main > div');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  const active = document.getElementById(id);
  if (active) active.style.display = 'block';

  const dropdown = document.getElementById('mobile-nav');
  if (dropdown) dropdown.value = id;
}

// Movie management
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
  document.getElementById("modalTitle").textContent = movie ? "Edit Movie" : "Upload New Movie";

  if (movie) {
    document.getElementById("movieTitle").value = movie.title;
    document.getElementById("movieDesc").value = movie.description;
    document.getElementById("movieRating").value = movie.rating;
    document.getElementById("videoLink").value = movie.video;
    document.getElementById("releaseDate").value = movie.release;
    movie.genres.forEach(g => genreSet.add(g));
    document.getElementById("genreList").value = movie.genres.join(", ");
    updateSelectedGenres();

    if (movie.poster) {
      posterBase64 = movie.poster;
      const preview = document.getElementById("posterPreview");
      preview.querySelector("img").src = posterBase64;
      preview.classList.remove("hidden");
    }
  }

  renderGenreButtons();
}

function toggleUploadModal(state) {
  const modal = document.getElementById("uploadModal");
  modal.style.display = state ? "flex" : "none";
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

function clearPoster() {
  posterBase64 = "";
  document.getElementById("posterImage").value = "";
  document.getElementById("posterPreview").classList.add("hidden");
}

function clearForm() {
  if (confirm("Are you sure you want to clear all inputs?")) {
    document.getElementById("movieForm").reset();
    genreSet.clear();
    posterBase64 = "";
    document.getElementById("posterPreview").classList.add("hidden");
    renderGenreButtons();
    updateSelectedGenres();
  }
}




document.getElementById("posterImage").addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      posterBase64 = e.target.result;
      const preview = document.getElementById("posterPreview");
      preview.querySelector("img").src = posterBase64;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

function submitMovie(event) {
  event.preventDefault();

  const movie = {
    title: document.getElementById("movieTitle").value,
    description: document.getElementById("movieDesc").value,
    rating: document.getElementById("movieRating").value,
    genres: [...genreSet],
    video: document.getElementById("videoLink").value,
    release: document.getElementById("releaseDate").value,
    poster: posterBase64,
  };

  const id = document.getElementById("movieId").value;
  if (id !== "") movieList[id] = movie;
  else movieList.push(movie);

  refreshTable();
  toggleUploadModal(false);
}

function refreshTable() {
  const tbody = document.getElementById("contentTable");
  tbody.innerHTML = "";
  movieList.forEach((movie, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${movie.title}</td>
      <td>${movie.genres.join(', ')}</td>
      <td>${movie.release}</td>
      <td>
        <button class="btn-link" onclick='openMovieModal(${JSON.stringify(movie)}, ${index})'>Edit</button>
        <button class="btn-link btn-delete" onclick='deleteMovie(${index})'>Delete</button>
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

function showSection(id) {
  document.querySelectorAll('main > div').forEach(section => section.style.display = 'none');
  const target = document.getElementById(id);
  if (target) target.style.display = 'block';
  const dropdown = document.getElementById('mobile-nav');
  if (dropdown) dropdown.value = id;
}

const data = {
  users: 0,
  subscriptions: 878,
  content: [],
  userList: [
    {
      fullName: 'Ramon Fuentes',
      email: 'ramon@example.com',
      address: '123 Main St',
      phone: '09171234567',
      status: 'Active',
      subscribed: true
    },
    {
      fullName: 'David Axl Andoy',
      email: 'david@example.com',
      address: '456 Elm St',
      phone: '09172345678',
      status: 'Active',
      subscribed: true
    },
    {
      fullName: 'Vincent Jade Datiles',
      email: 'vincent@example.com',
      address: '789 Oak St',
      phone: '09173456789',
      status: 'Suspended',
      subscribed: false
    }
  ]
};

function toggleUserModal(state) {
  const modal = document.getElementById('userModal');
  modal.classList.toggle('user-modal-hidden', !state);
}

function editUser(index) {
  const user = data.userList[index];
  document.getElementById('editUserIndex').value = index;
  document.getElementById('editUserEmail').value = user.email;
  document.getElementById('editUserName').value = user.fullName;
  document.getElementById('editUserAddress').value = user.address;
  document.getElementById('editUserPhone').value = user.phone;
  document.getElementById('editUserStatus').value = user.status;
  document.getElementById('editUserSubscribed').value = user.subscribed ? 'true' : 'false';

  toggleUserModal(true);
}

function deleteUser(index) {
  const confirmDelete = confirm(`Delete user: ${data.userList[index].fullName}?`);
  if (confirmDelete) {
    data.userList.splice(index, 1);
    renderUserTable();
  }
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
    subscribed: document.getElementById('editUserSubscribed').value === 'true'
  };
  renderUserTable();
  document.getElementById('userCount').textContent = data.userList.length;
  toggleUserModal(false);
}

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
          <button class="btn-link btn-delete" onclick="deleteUser(${index})">Delete</button>
        </td>`;
      table.appendChild(row);
    });
  }

  document.getElementById('userCount').textContent = data.userList.length;
}
renderUserTable();

document.getElementById('userCount').textContent = data.userList.length;
document.getElementById('subCount').textContent = data.subscriptions;

function renderContentTable() {
  const table = document.getElementById('contentTable');
  table.innerHTML = '';

  if (data.content.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'No movies/series in here.';
    cell.style.textAlign = 'center';
    cell.style.padding = '1rem';
    row.appendChild(cell);
    table.appendChild(row);
  } else {
    data.content.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.title}</td>
        <td>${item.genre}</td>
        <td>${item.maturity}</td>
        <td>
          <button class="btn-link" onclick="editItem(${index})">Edit</button>
          <button class="btn-link btn-delete" onclick="deleteItem(${index})">Delete</button>
        </td>`;
      table.appendChild(row);
    });
  }

  document.getElementById('contentCount').textContent = data.content.length;
}

function editItem(index) {
  alert(`Edit content: ${data.content[index].title}`);
}

function deleteItem(index) {
  const confirmDelete = confirm(`Delete content: ${data.content[index].title}?`);
  if (confirmDelete) {
    data.content.splice(index, 1);
    renderContentTable();
  }
}

function renderUserTable() {
  const table = document.getElementById('userTable');
  table.innerHTML = '';

  data.userList.forEach((user, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.fullName}</td>
      <td>${user.email}</td>
      <td>
        <button class="btn-link" onclick="editUser(${index})">Edit</button>
        <button class="btn-link btn-delete" onclick="deleteUser(${index})">Delete</button>
      </td>`;
    table.appendChild(row);
  });
}

function editUser(index) {
  const user = data.userList[index];
  alert(`Full Name: ${user.fullName}\nEmail: ${user.email}\nAddress: ${user.address}\nPhone: ${user.phone}\nStatus: ${user.status}\nSubscribed: ${user.subscribed ? 'Yes' : 'No'}`);
}

function deleteUser(index) {
  const confirmDelete = confirm(`Delete user: ${data.userList[index].fullName}?`);
  if (confirmDelete) {
    data.userList.splice(index, 1);
    renderUserTable();
    document.getElementById('userCount').textContent = data.userList.length; // 🔁 update count
  }
}


// Initial render
renderContentTable();
renderUserTable();


function renderContentTable() {
  const table = document.getElementById('contentTable');
  table.innerHTML = '';

  if (data.content.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'No movies/series in here.';
    cell.style.textAlign = 'center';
    cell.style.padding = '1rem';
    row.appendChild(cell);
    table.appendChild(row);
  } else {
    data.content.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.title}</td>
        <td>${item.genre}</td>
        <td>${item.maturity}</td>
        <td>
          <button class="btn-link" onclick="editItem(${index})">Edit</button>
          <button class="btn-link btn-delete" onclick="deleteItem(${index})">Delete</button>
        </td>`;
      table.appendChild(row);
    });
  }

  document.getElementById('contentCount').textContent = data.content.length;
}

renderContentTable();

function editItem(index) {
  alert(`Edit content: ${data.content[index].title}`);
}

function deleteItem(index) {
  const confirmDelete = confirm(`Delete content: ${data.content[index].title}?`);
  if (confirmDelete) {
    data.content.splice(index, 1);
    renderContentTable(); 
  }
}











