// Global Data
const data = {
  userList: [
    { id: 1, fullName: 'Ramon Fuentes', email: 'ramon@example.com', address: 'Matina St', phone: '09171234567', status: 'Active', subscription: 'Standard' },
    { id: 2, fullName: 'David Axl Andoy', email: 'david@example.com', address: 'Samal St', phone: '09172345678', status: 'Active', subscription: 'Basic' },
    { id: 3, fullName: 'Vincent Jade Datiles', email: 'vincent@example.com', address: 'Boulevard St', phone: '09173456789', status: 'Suspended', subscription: 'Free' }
  ]
};

let movieList = [];
let episodes = [];
let selectedGenres = [];
let currentEditingIndex = null;
let currentEditingEpisodeIndex = null;
let uploadedPosters = [];

// Genre options
const genreOptions = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary", 
  "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Musical", "Mystery", 
  "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western"
];

// Initialize app
window.onload = () => {
  showSection('dashboard');
  updateDashboard();
  renderGenreButtons();
  renderContentTable();
  renderUserTable();
  renderSubscriptionTable();
  setupEventListeners();
};

// Setup event listeners
function setupEventListeners() {
  const posterFiles = document.getElementById('posterFiles');
  const thumbnailFile = document.getElementById('thumbnailFile');
  const episodeThumbnail = document.getElementById('episodeThumbnail');
  const contentType = document.getElementById('contentType');
  
  if (posterFiles) posterFiles.addEventListener('change', function() { handlePosterFiles(this); });
  if (thumbnailFile) thumbnailFile.addEventListener('change', function() { handleThumbnailFile(this); });
  if (episodeThumbnail) episodeThumbnail.addEventListener('change', function() { handleEpisodeThumbnailFile(this); });
  if (contentType) contentType.addEventListener('change', toggleEpisodeSection);
}

// Navigation
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
  document.getElementById(sectionId)?.classList.remove('hidden');
  
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`[onclick="showSection('${sectionId}')"]`)?.classList.add('active');
}

// Dashboard Updates
function updateDashboard() {
  const totalMovies = movieList.filter(item => item.type === 'Movie').length;
  const totalSeries = movieList.filter(item => item.type === 'Series').length;
  const totalEpisodes = movieList.reduce((sum, item) => sum + (item.episodes?.length || 0), 0);
  
  const elements = {
    userCount: data.userList.length,
    subCount: data.userList.filter(u => u.subscription !== 'Free').length,
    movieCount: totalMovies,
    seriesCount: totalSeries,
    episodeCount: totalEpisodes
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
  
  updateActivityList();
}

function updateActivityList() {
  const activityList = document.querySelector('.activity-list');
  if (activityList) {
    activityList.innerHTML = `
      <div class="activity-item">Total active users: ${data.userList.filter(u => u.status === 'Active').length}</div>
      <div class="activity-item">Content uploaded: ${movieList.length} items</div>
      <div class="activity-item">Premium subscribers: ${data.userList.filter(u => ['Standard', 'Premium'].includes(u.subscription)).length}</div>
    `;
  }
}

// Genre Management
function renderGenreButtons() {
  const container = document.getElementById('genreButtons');
  if (!container) return;
  
  container.innerHTML = genreOptions.map(genre => 
    `<button type="button" class="genre-btn ${selectedGenres.includes(genre) ? 'active' : ''}" 
     onclick="toggleGenre('${genre}')">${genre}</button>`
  ).join('');
  
  document.getElementById('selectedGenres').value = selectedGenres.join(',');
}

function toggleGenre(genre) {
  const index = selectedGenres.indexOf(genre);
  if (index > -1) {
    selectedGenres.splice(index, 1);
  } else {
    selectedGenres.push(genre);
  }
  renderGenreButtons();
}

// Content Type Toggle - Fixed
function toggleEpisodeSection() {
  const contentType = document.getElementById('contentType').value;
  const episodeSection = document.getElementById('episodeSection');
  const movieVideoSection = document.getElementById('movieVideoSection');
  const movieVideoFile = document.getElementById('movieVideoFile');
  
  if (contentType === 'Series') {
    episodeSection?.classList.remove('hidden');
    movieVideoSection?.classList.add('hidden');
    if (movieVideoFile) movieVideoFile.required = false;
  } else {
    episodeSection?.classList.add('hidden');
    movieVideoSection?.classList.remove('hidden');
    if (movieVideoFile) movieVideoFile.required = true;
    episodes = [];
    renderEpisodeList();
  }
}

// Content Modal Management
function openContentModal(index = null) {
  currentEditingIndex = index;
  const modal = document.getElementById('contentModal');
  const form = document.getElementById('contentForm');
  const title = document.getElementById('contentModalTitle');
  
  resetContentForm();
  
  if (index !== null && movieList[index]) {
    populateContentForm(movieList[index], title);
  } else {
    title.textContent = 'Add Content';
  }
  
  renderGenreButtons();
  renderEpisodeList();
  toggleEpisodeSection();
  modal.classList.remove('hidden');
}

function resetContentForm() {
  document.getElementById('contentForm').reset();
  selectedGenres = [];
  episodes = [];
  uploadedPosters = [];
  document.getElementById('contentId').value = currentEditingIndex !== null ? currentEditingIndex : '';
  document.getElementById('posterPreviews').innerHTML = '';
  document.getElementById('thumbnailPreview').innerHTML = '';
}

function populateContentForm(content, title) {
  title.textContent = 'Edit Content';
  
  const fields = {
    contentType: content.type,
    contentTitle: content.title,
    contentDescription: content.description,
    contentStudio: content.studio,
    contentRelease: content.release,
    contentRating: content.rating
  };
  
  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.value = value;
  });
  
  selectedGenres = [...(content.genres || [])];
  episodes = [...(content.episodes || [])];
  uploadedPosters = [...(content.posters || [])];
  
  renderPosterPreviews();
  
  if (content.thumbnail) {
    document.getElementById('thumbnailPreview').innerHTML = `<img src="${content.thumbnail}" alt="Thumbnail">`;
  }
}

function closeContentModal() {
  document.getElementById('contentModal').classList.add('hidden');
}

function clearContentForm() {
  if (confirm('Clear all form data?')) {
    resetContentForm();
    renderGenreButtons();
    renderEpisodeList();
    toggleEpisodeSection();
  }
}

// Poster Management
function handlePosterFiles(input) {
  const files = Array.from(input.files);
  if (uploadedPosters.length + files.length > 5) {
    showNotification('Maximum 5 poster images allowed', 'error');
    return;
  }
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedPosters.push(e.target.result);
      renderPosterPreviews();
    };
    reader.readAsDataURL(file);
  });
  
  input.value = '';
}

function renderPosterPreviews() {
  const container = document.getElementById('posterPreviews');
  container.innerHTML = uploadedPosters.map((poster, index) => 
    `<div class="image-preview">
      <img src="${poster}" alt="Poster ${index + 1}">
      <button type="button" class="remove-btn" onclick="removePoster(${index})">×</button>
    </div>`
  ).join('');
}

function removePoster(index) {
  uploadedPosters.splice(index, 1);
  renderPosterPreviews();
}

function handleThumbnailFile(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('thumbnailPreview').innerHTML = `<img src="${e.target.result}" alt="Thumbnail">`;
    };
    reader.readAsDataURL(file);
  }
}

// Save Content
function saveContent(event) {
  event.preventDefault();
  
  const thumbnailFile = document.getElementById('thumbnailFile').files[0];
  const content = createContentObject();
  
  if (thumbnailFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      content.thumbnail = e.target.result;
      saveContentData(content);
    };
    reader.readAsDataURL(thumbnailFile);
  } else if (currentEditingIndex !== null && movieList[currentEditingIndex]?.thumbnail) {
    content.thumbnail = movieList[currentEditingIndex].thumbnail;
    saveContentData(content);
  } else {
    saveContentData(content);
  }
}

function createContentObject() {
  const trailerFile = document.getElementById('trailerFile').files[0];
  const movieVideoFile = document.getElementById('movieVideoFile')?.files[0];
  
  return {
    type: document.getElementById('contentType').value,
    title: document.getElementById('contentTitle').value,
    description: document.getElementById('contentDescription').value,
    studio: document.getElementById('contentStudio').value,
    release: document.getElementById('contentRelease').value,
    rating: document.getElementById('contentRating').value,
    genres: [...selectedGenres],
    posters: [...uploadedPosters],
    thumbnail: null,
    trailer: trailerFile?.name || null,
    video: movieVideoFile?.name || null,
    episodes: [...episodes]
  };
}

function saveContentData(content) {
  if (currentEditingIndex !== null) {
    movieList[currentEditingIndex] = content;
  } else {
    movieList.push(content);
  }
  
  renderContentTable();
  updateDashboard();
  closeContentModal();
  showNotification('Content saved successfully!');
}

function renderContentTable() {
  const tbody = document.getElementById('contentTable');
  if (!tbody) return;
  
  if (movieList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #666;">No content available</td></tr>';
    return;
  }
  
  tbody.innerHTML = movieList.map((content, index) => 
    `<tr>
      <td>${content.title}</td>
      <td><span class="badge">${content.type}</span></td>
      <td>${content.release}</td>
      <td>
        <button onclick="previewContent(${index})" class="btn-secondary btn-sm">Preview</button>
        <button onclick="openContentModal(${index})" class="btn-secondary btn-sm">Edit</button>
        <button onclick="deleteContent(${index})" class="btn-danger btn-sm">Delete</button>
      </td>
    </tr>`
  ).join('');
}

function deleteContent(index) {
  if (confirm('Delete this content?')) {
    movieList.splice(index, 1);
    renderContentTable();
    updateDashboard();
    showNotification('Content deleted successfully!');
  }
}

// Enhanced Content Preview
function previewContent(index) {
  const content = movieList[index];
  if (!content) return;
  
  const modal = document.getElementById('previewModal');
  const title = document.getElementById('previewModalTitle');
  const previewContent = document.getElementById('previewContent');
  
  title.textContent = `Preview: ${content.title}`;
  
  const thumbnailHtml = content.thumbnail ? 
    `<img src="${content.thumbnail}" alt="${content.title}" class="preview-thumbnail" onclick="openFullscreenImage('${content.thumbnail}')">` : 
    '<div class="no-thumbnail">No Thumbnail</div>';
  
  const episodesHtml = content.type === 'Series' && content.episodes?.length > 0 ? 
    `<div class="preview-section">
      <h4>Episodes (${content.episodes.length})</h4>
      <div class="episode-grid">
        ${content.episodes.map((ep, i) => `
          <div class="episode-card">
            <div class="episode-header">
              <span class="episode-number">Episode ${i + 1}</span>
              <span class="episode-date">${ep.release}</span>
            </div>
            <h5>${ep.title}</h5>
            <p>${ep.description}</p>
          </div>`).join('')}
      </div>
    </div>` : '';
  
  previewContent.innerHTML = `
    <div class="preview-layout">
      <div class="preview-media">
        ${thumbnailHtml}
      </div>
      
      <div class="preview-details">
        <div class="content-header">
          <h3>${content.title}</h3>
          <span class="content-type">Content Type: ${content.type}</span>
          <div class="content-genres">
            ${content.genres?.map(genre => `<span class="genre-tag">${genre}</span>`).join('') || ''}
          </div>
        </div>
        
        <div class="content-meta">
          <div class="meta-item">
            <strong>Studio:</strong> ${content.studio}
          </div>
          <div class="meta-item">
            <strong>Release:</strong> ${content.release}
          </div>
          <div class="meta-item">
            <strong>Rating:</strong> ${content.rating}
          </div>
        </div>
        
        <div class="content-description">
          <p>${content.description}</p>
        </div>
      </div>
    </div>
    
    ${content.posters?.length > 0 ? `
      <div class="preview-section">
        <h4>Posters (${content.posters.length})</h4>
        <div class="poster-grid">
          ${content.posters.map(poster => `
            <img src="${poster}" alt="Poster" class="poster-thumb" 
                 onclick="openFullscreenImage('${poster}')">`).join('')}
        </div>
      </div>` : ''}
    
    ${episodesHtml}
  `;
  
  modal.classList.remove('hidden');
}

// Add this function for fullscreen images
function openFullscreenImage(src) {
  const overlay = document.createElement('div');
  overlay.className = 'fullscreen-overlay';
  overlay.onclick = () => document.body.removeChild(overlay);
  
  const img = document.createElement('img');
  img.src = src;
  img.className = 'fullscreen-image';
  
  overlay.appendChild(img);
  document.body.appendChild(overlay);
}

function closePreviewModal() {
  document.getElementById('previewModal').classList.add('hidden');
}

// Episode Management
function openEpisodeModal(index = null) {
  currentEditingEpisodeIndex = index;
  const modal = document.getElementById('episodeModal');
  const form = document.getElementById('episodeForm');
  
  form.reset();
  document.getElementById('editingEpisodeIndex').value = index !== null ? index : '';
  document.getElementById('episodeThumbnailPreview').innerHTML = '';
  
  if (index !== null && episodes[index]) {
    const episode = episodes[index];
    document.getElementById('episodeTitle').value = episode.title;
    document.getElementById('episodeRelease').value = episode.release;
    document.getElementById('episodeDescription').value = episode.description;
    
    if (episode.thumbnail) {
      document.getElementById('episodeThumbnailPreview').innerHTML = `<img src="${episode.thumbnail}" alt="Episode Thumbnail">`;
    }
  }
  
  modal.classList.remove('hidden');
}

function closeEpisodeModal() {
  document.getElementById('episodeModal').classList.add('hidden');
}

function saveEpisode(event) {
  event.preventDefault();
  
  const thumbnailFile = document.getElementById('episodeThumbnail').files[0];
  const videoFile = document.getElementById('episodeVideo').files[0];
  
  const episode = {
    title: document.getElementById('episodeTitle').value,
    release: document.getElementById('episodeRelease').value,
    description: document.getElementById('episodeDescription').value,
    thumbnail: null,
    video: videoFile?.name || null
  };
  
  if (thumbnailFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      episode.thumbnail = e.target.result;
      saveEpisodeData(episode);
    };
    reader.readAsDataURL(thumbnailFile);
  } else if (currentEditingEpisodeIndex !== null && episodes[currentEditingEpisodeIndex]?.thumbnail) {
    episode.thumbnail = episodes[currentEditingEpisodeIndex].thumbnail;
    saveEpisodeData(episode);
  } else {
    saveEpisodeData(episode);
  }
}

function saveEpisodeData(episode) {
  if (currentEditingEpisodeIndex !== null) {
    episodes[currentEditingEpisodeIndex] = episode;
  } else {
    episodes.push(episode);
  }
  
  renderEpisodeList();
  closeEpisodeModal();
  showNotification('Episode saved successfully!');
}

function renderEpisodeList() {
  const container = document.getElementById('episodeList');
  if (!container) return;
  
  if (episodes.length === 0) {
    container.innerHTML = '<p class="empty-state">No episodes added</p>';
    return;
  }
  
  container.innerHTML = episodes.map((episode, index) => 
    `<div class="episode-item">
      <div class="episode-info">
        <div class="episode-title">Episode ${index + 1}: ${episode.title}</div>
        <div class="episode-meta">${episode.release} • ${episode.description.substring(0, 50)}...</div>
      </div>
      <div class="episode-actions">
        <button onclick="openEpisodeModal(${index})" class="btn-secondary btn-sm">Edit</button>
        <button onclick="deleteEpisode(${index})" class="btn-danger btn-sm">Delete</button>
      </div>
    </div>`
  ).join('');
}

function deleteEpisode(index) {
  if (confirm('Delete this episode?')) {
    episodes.splice(index, 1);
    renderEpisodeList();
    showNotification('Episode deleted successfully!');
  }
}

function handleEpisodeThumbnailFile(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('episodeThumbnailPreview').innerHTML = `<img src="${e.target.result}" alt="Episode Thumbnail">`;
    };
    reader.readAsDataURL(file);
  }
}

// User Management
function openUserModal(index = null) {
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  const title = document.getElementById('userModalTitle');
  
  form.reset();
  document.getElementById('userId').value = index !== null ? index : '';
  
  if (index !== null && data.userList[index]) {
    const user = data.userList[index];
    title.textContent = 'Edit User';
    
    const fields = {
      userName: user.fullName,
      userEmail: user.email,
      userPhone: user.phone,
      userAddress: user.address,
      userStatus: user.status,
      userSubscription: user.subscription
    };
    
    Object.entries(fields).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.value = value;
    });
  } else {
    title.textContent = 'Add User';
  }
  
  modal.classList.remove('hidden');
}

function closeUserModal() {
  document.getElementById('userModal').classList.add('hidden');
}

function saveUser(event) {
  event.preventDefault();
  
  const user = {
    fullName: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    phone: document.getElementById('userPhone').value,
    address: document.getElementById('userAddress').value,
    status: document.getElementById('userStatus').value,
    subscription: document.getElementById('userSubscription').value
  };
  
  const index = document.getElementById('userId').value;
  
  if (index !== '') {
    data.userList[parseInt(index)] = { ...data.userList[parseInt(index)], ...user };
  } else {
    user.id = Date.now();
    data.userList.push(user);
  }
  
  renderUserTable();
  renderSubscriptionTable();
  updateDashboard();
  closeUserModal();
  showNotification('User saved successfully!');
}

function renderUserTable() {
  const tbody = document.getElementById('userTable');
  if (!tbody) return;
  
  if (data.userList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #666;">No users available</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.userList.map((user, index) => 
    `<tr>
      <td>${user.fullName}</td>
      <td>${user.email}</td>
      <td><span class="badge ${user.status.toLowerCase()}">${user.status}</span></td>
      <td><span class="badge">${user.subscription}</span></td>
      <td>
        <button onclick="previewUser(${index})" class="btn-secondary btn-sm">Preview</button>
        <button onclick="openUserModal(${index})" class="btn-secondary btn-sm">Edit</button>
        <button onclick="deleteUser(${index})" class="btn-danger btn-sm">Delete</button>
      </td>
    </tr>`
  ).join('');
}

function deleteUser(index) {
  if (confirm(`Delete ${data.userList[index].fullName}?`)) {
    data.userList.splice(index, 1);
    renderUserTable();
    renderSubscriptionTable();
    updateDashboard();
    showNotification('User deleted successfully!');
  }
}

// Enhanced User Preview
function previewUser(index) {
  const user = data.userList[index];
  if (!user) return;
  
  const modal = document.getElementById('previewModal');
  const title = document.getElementById('previewModalTitle');
  const previewContent = document.getElementById('previewContent');
  
  title.textContent = `User Profile: ${user.fullName}`;
  
  const subscriptionDetails = getSubscriptionDetails(user.subscription);
  const joinDate = new Date(user.id || Date.now()).toLocaleDateString();
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + (user.subscription === 'Premium' ? 12 : 1));
  
  previewContent.innerHTML = `
    <div class="user-profile-layout">
      <div class="user-header">
        <div class="user-avatar">
          <div class="avatar-placeholder">${user.fullName.charAt(0)}</div>
        </div>
        <div class="user-info">
          <h3>${user.fullName}</h3>
          <div class="user-badges">
            <span class="badge ${user.status.toLowerCase()}">${user.status}</span>
            <span class="badge subscription-badge">${user.subscription}</span>
          </div>
        </div>
      </div>
      
      <div class="user-details-grid">
        <div class="detail-card">
          <h4>Contact Information</h4>
          <div class="detail-item">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${user.email}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${user.phone}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Address:</span>
            <span class="detail-value">${user.address}</span>
          </div>
        </div>
        
        <div class="detail-card">
          <h4>Account Information</h4>
          <div class="detail-item">
            <span class="detail-label">User ID:</span>
            <span class="detail-value">${user.id}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Join Date:</span>
            <span class="detail-value">${joinDate}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Subscription:</span>
            <span class="detail-value">${subscriptionDetails.name}</span>
          </div>
          ${user.subscription !== 'Free' ? `
          <div class="detail-item">
            <span class="detail-label">Expires:</span>
            <span class="detail-value">${expiryDate.toLocaleDateString()}</span>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');
}

function getSubscriptionDetails(subscription) {
  const plans = {
    'Free': { name: 'Explorer (Free)', features: ['Limited content', 'Ads included'] },
    'Basic': { name: 'Viewer (Basic)', features: ['More content', 'Reduced ads'] },
    'Standard': { name: 'Binger (Standard)', features: ['Full content', 'No ads', 'HD quality'] },
    'Premium': { name: 'UltraPass (Premium)', features: ['Full content', 'No ads', '4K quality', 'Multiple devices'] }
  };
  return plans[subscription] || plans['Free'];
}

// Subscription Management
function renderSubscriptionTable() {
  const tbody = document.getElementById('subscriptionTable');
  if (!tbody) return;
  
  const activeSubscriptions = data.userList.filter(user => user.subscription && user.subscription !== 'Free');
  
  if (activeSubscriptions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #666;">No active subscriptions</td></tr>';
    return;
  }
  
  tbody.innerHTML = activeSubscriptions.map(user => {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (user.subscription === 'Premium' ? 12 : 1));
    
    return `<tr>
      <td>${user.fullName}</td>
      <td><span class="badge">${user.subscription}</span></td>
      <td><span class="badge active">Active</span></td>
      <td>${expiryDate.toLocaleDateString()}</td>
    </tr>`;
  }).join('');
}

// Notification System
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}