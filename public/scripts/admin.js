// Global Data - Now loaded from database
const data = {
  userList: [] // Populated from API
};

let movieList = []; // Populated from API
let episodes = [];
let selectedGenres = [];
let currentEditingId = null; // Using MongoDB _id instead of index
let currentEditingEpisodeIndex = null;

// Genre options (unchanged)
const genreOptions = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary", 
  "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Musical", "Mystery", 
  "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western"
];

// Initialize app - Now async
window.onload = async () => {
  console.log('Admin panel initializing...');
  showSection('dashboard');
  await loadInitialData(); // Load from database
  renderGenreButtons();
  setupEventListeners();
};

// Setup event listeners
function setupEventListeners() {
  // Add any additional event listeners here
  console.log('Event listeners setup complete');
}

// Load data from backend
async function loadInitialData() {
  console.log('Loading initial data...');
  try {
    // Updated API endpoints to match your backend structure
    const [statsRes, usersRes, contentRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/users'),
      fetch('/api/admin/content')
    ]);
    
    console.log('API responses received:', { 
      stats: statsRes.status, 
      users: usersRes.status, 
      content: contentRes.status 
    });
    
    // Handle stats
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      console.log('Stats data:', statsData);
      if (statsData.success) {
        updateDashboard(statsData.stats);
      }
    } else {
      console.error('Stats API failed:', statsRes.status);
    }
    
    // Handle users
    if (usersRes.ok) {
      const usersData = await usersRes.json();
      console.log('Users data:', usersData);
      if (usersData.success) {
        data.userList = usersData.users;
        renderUserTable();
      }
    } else {
      console.error('Users API failed:', usersRes.status);
    }
    
    // Handle content
    if (contentRes.ok) {
      const contentData = await contentRes.json();
      console.log('Content data:', contentData);
      if (contentData.success) {
        movieList = contentData.content;
        renderContentTable();
      }
    } else {
      console.error('Content API failed:', contentRes.status);
    }
    
    // Render subscription table
    renderSubscriptionTable();
    
  } catch (error) {
    console.error('Failed to load data:', error);
    showNotification('Failed to load data. Check console for details.', 'error');
  }
}

// File upload to R2
async function uploadFile(file, type, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    // Progress tracking
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        if (onProgress) onProgress(percent);
        console.log(`${type} upload: ${percent}%`);
      }
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.statusText));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.open('POST', '/api/upload', true);
    xhr.send(formData);
  });

  async function uploadLargeFile(file, type, onProgress) {
    const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB chunks
    const fileId = uuidv4();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const chunk = file.slice(
        chunkIndex * CHUNK_SIZE,
        Math.min((chunkIndex + 1) * CHUNK_SIZE, file.size)
      );
      
      const formData = new FormData();
      formData.append('file', chunk, file.name);
      formData.append('type', type);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', totalChunks);
      formData.append('fileId', fileId);
      
      await fetch('/api/upload/chunked', {
        method: 'POST',
        body: formData
      });
      
      const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      if (onProgress) onProgress(percent);
    }
    
    return {
      url: `${process.env.R2_PUBLIC_URL}/videos/${fileId}-${file.name}`
    };
  }
}
// Content Management (Updated for DB)
async function openContentModal(id = null) {
  console.log('Opening content modal for ID:', id);
  currentEditingId = id;
  const modal = document.getElementById('contentModal');
  const title = document.getElementById('contentModalTitle');
  
  resetContentForm();
  
  if (id) {
    const content = movieList.find(item => item._id === id);
    if (content) {
      title.textContent = 'Edit Content';
      populateContentForm(content);
      
      // Convert R2 URLs to previews
      if (content.thumbnailUrl) {
        document.getElementById('thumbnailPreview').innerHTML = 
          `<img src="${content.thumbnailUrl}" alt="Thumbnail" style="max-width: 200px;">`;
      }
      if (content.posterUrls?.length) {
        uploadedPosters = content.posterUrls;
        renderPosterPreviews();
      }
    }
  } else {
    title.textContent = 'Add Content';
  }
  
  renderGenreButtons();
  renderEpisodeList();
  toggleEpisodeSection();
  modal.classList.remove('hidden');
}

// Populate form with content data
function populateContentForm(content) {
  document.getElementById('contentId').value = content._id || '';
  document.getElementById('contentType').value = content.type || 'Movie';
  document.getElementById('contentTitle').value = content.title || '';
  document.getElementById('contentDescription').value = content.description || '';
  document.getElementById('contentStudio').value = content.studio || '';
  document.getElementById('contentRelease').value = content.releaseDate || '';
  document.getElementById('contentRating').value = content.rating || 'G';
  
  selectedGenres = content.genres || [];
  episodes = content.episodes || [];
}

// Reset form
function resetContentForm() {
  document.getElementById('contentForm').reset();
  document.getElementById('contentId').value = '';
  selectedGenres = [];
  episodes = [];
  uploadedPosters = [];
  document.getElementById('thumbnailPreview').innerHTML = '';
  document.getElementById('posterPreviews').innerHTML = '';
}

// Clear form
function clearContentForm() {
  resetContentForm();
  renderGenreButtons();
  renderEpisodeList();
}

async function saveContent(event) {
  event.preventDefault();
  
  // Show progress container
  const progressContainer = document.querySelector('.upload-progress-container');
  const overallProgress = document.querySelector('#overallProgress .progress-bar');
  const overallProgressText = document.querySelector('#overallProgress .progress-text');
  const fileProgressContainer = document.getElementById('fileProgressContainer');
  
  progressContainer.classList.remove('hidden');
  fileProgressContainer.innerHTML = '';

  try {
    // Create a progress tracker
    const uploadTrackers = {};
    let totalFiles = 0;
    let completedFiles = 0;

    // Function to update overall progress
    function updateOverallProgress() {
      let totalPercent = 0;
      Object.values(uploadTrackers).forEach(tracker => {
        totalPercent += tracker.percent;
      });
      const avgPercent = Math.round(totalPercent / totalFiles);
      overallProgress.style.width = `${avgPercent}%`;
      overallProgressText.textContent = `${avgPercent}%`;
    }

    // Process all files
    const processFile = async (file, type) => {
      if (!file) return null;
      
      totalFiles++;
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add progress UI for this file
      fileProgressContainer.innerHTML += `
        <div class="file-progress" id="${fileId}">
          <div class="filename">${type}: ${file.name}</div>
          <div class="progress-bar"></div>
          <span class="progress-text">0%</span>
        </div>
      `;
      
      uploadTrackers[fileId] = { percent: 0 };
      
      // Choose upload method based on file size
      const uploadMethod = file.size > 500 * 1024 * 1024 // 500MB threshold
        ? uploadLargeFile 
        : uploadFile;
      
      return uploadMethod(file, type, (percent) => {
        // Update individual file progress
        uploadTrackers[fileId].percent = percent;
        const fileElement = document.getElementById(fileId);
        if (fileElement) {
          fileElement.querySelector('.progress-bar').style.width = `${percent}%`;
          fileElement.querySelector('.progress-text').textContent = `${percent}%`;
        }
        
        // Update overall progress
        updateOverallProgress();
      }).then((result) => {
        completedFiles++;
        if (completedFiles === totalFiles) {
          progressContainer.classList.add('hidden');
        }
        return result.url || result; // Handle both response formats
      });
    };

    // Process all uploads
    const thumbnailPromise = processFile(thumbnailFile, 'thumbnail');
    const trailerPromise = processFile(trailerFile, 'trailer');
    const movieVideoPromise = content.type === 'Movie' ? 
      processFile(movieVideoFile, 'video') : Promise.resolve(null);
    
    // Process posters
    const posterPromises = Array.from(posterFiles).map((file, i) => 
      processFile(file, `poster-${i+1}`)
    );

    // Wait for all uploads
    const [thumbnailUrl, trailerUrl, videoUrl, ...posterUrls] = await Promise.all([
      thumbnailPromise,
      trailerPromise,
      movieVideoPromise,
      ...posterPromises
    ]);

    // ... rest of your saveContent logic ...
    
  } catch (error) {
    progressContainer.classList.add('hidden');
    console.error('Save error:', error);
    showNotification('Failed to save content: ' + error.message, 'error');
  }
}
async function deleteContent(id) {
  if (confirm('Delete this content?')) {
    console.log('Deleting content:', id);
    try {
      const response = await fetch(`/api/admin/content/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Delete failed: ${errorData.message || response.statusText}`);
      }
      
      await loadInitialData();
      showNotification('Content deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Failed to delete content: ' + error.message, 'error');
    }
  }
}

// User Management (Updated for DB)
async function openUserModal(id = null) {
  console.log('Opening user modal for ID:', id);
  const modal = document.getElementById('userModal');
  const title = document.getElementById('userModalTitle');
  
  document.getElementById('userForm').reset();
  document.getElementById('userId').value = '';
  
  if (id) {
    const user = data.userList.find(u => u._id === id);
    if (user) {
      title.textContent = 'Edit User';
      document.getElementById('userId').value = user._id;
      document.getElementById('userName').value = user.name || '';
      document.getElementById('userEmail').value = user.email || '';
      document.getElementById('userPhone').value = user.phone || '';
      document.getElementById('userAddress').value = user.address || '';
      document.getElementById('userStatus').value = user.status || 'Active';
      document.getElementById('userSubscription').value = user.subscription || 'Free';
      document.getElementById('userIsAdmin').checked = user.isAdmin || false;
      // Don't populate password for security
    }
  } else {
    title.textContent = 'Add User';
  }
  
  modal.classList.remove('hidden');
}

async function saveUser(event) {
  event.preventDefault();
  
  console.log('Saving user...');
  
  const user = {
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    phone: document.getElementById('userPhone').value,
    address: document.getElementById('userAddress').value,
    status: document.getElementById('userStatus').value,
    subscription: document.getElementById('userSubscription').value,
    isAdmin: document.getElementById('userIsAdmin').checked
  };
  
  // Only include password if it's provided
  const password = document.getElementById('userPassword').value;
  if (password) {
    user.password = password;
  }
  
  try {
    const id = document.getElementById('userId').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/admin/users/${id}` : '/api/admin/users';
    
    console.log('Saving user to database:', method, url);
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Save failed: ${errorData.message || response.statusText}`);
    }
    
    const result = await response.json();
    console.log('User saved successfully:', result);
    
    await loadInitialData();
    closeUserModal();
    showNotification('User saved successfully!');
  } catch (error) {
    console.error('Save error:', error);
    showNotification('Failed to save user: ' + error.message, 'error');
  }
}

async function deleteUser(id) {
  if (confirm('Delete this user?')) {
    console.log('Deleting user:', id);
    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Delete failed: ${errorData.message || response.statusText}`);
      }
      
      await loadInitialData();
      showNotification('User deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Failed to delete user: ' + error.message, 'error');
    }
  }
}

// Navigation (unchanged)
function showSection(sectionId) {
  console.log('Showing section:', sectionId);
  document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
  document.getElementById(sectionId)?.classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`[onclick="showSection('${sectionId}')"]`)?.classList.add('active');
}

// Dashboard (updated to accept stats parameter)
function updateDashboard(stats) {
  console.log('Updating dashboard with stats:', stats);
  
  const elements = {
    userCount: stats?.userCount || 0,
    subCount: stats?.subCount || 0,
    movieCount: stats?.movieCount || 0,
    seriesCount: stats?.seriesCount || 0,
    episodeCount: stats?.episodeCount || 0
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
  
  updateActivityList();
}

// Activity list
function updateActivityList() {
  const activityList = document.querySelector('.activity-list');
  if (activityList) {
    activityList.innerHTML = `
      <div class="activity-item">
        <span>System initialized</span>
        <span class="activity-time">Just now</span>
      </div>
      <div class="activity-item">
        <span>Data loaded from database</span>
        <span class="activity-time">Just now</span>
      </div>
    `;
  }
}

// Genre Management (unchanged)
function renderGenreButtons() {
  const container = document.getElementById('genreButtons');
  if (!container) return;
  
  container.innerHTML = genreOptions.map(genre => 
    `<button type="button" class="genre-btn ${selectedGenres.includes(genre) ? 'active' : ''}" 
     onclick="toggleGenre('${genre}')">${genre}</button>`
  ).join('');
}

function toggleGenre(genre) {
  const index = selectedGenres.indexOf(genre);
  if (index > -1) selectedGenres.splice(index, 1);
  else selectedGenres.push(genre);
  renderGenreButtons();
}

function isValidFileType(file, allowedTypes) {
  if (!file) return false;
  const fileType = file.type.split('/')[0]; // 'image' or 'video'
  return allowedTypes.includes(fileType);
}

function validateFileSize(file, maxSize) {
  if (file && file.size > maxSize) {
    throw new Error(`File ${file.name} exceeds maximum size of ${maxSize/1024/1024/1024}GB`);
  }
}

// Then in saveContent:
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
validateFileSize(movieVideoFile, MAX_FILE_SIZE);
// Content Type Toggle (unchanged)
function toggleEpisodeSection() {
  const type = document.getElementById('contentType').value;
  document.getElementById('episodeSection').classList.toggle('hidden', type !== 'Series');
  document.getElementById('movieVideoSection').classList.toggle('hidden', type === 'Series');
  if (type !== 'Series') episodes = [];
  renderEpisodeList();
}

// Preview Functions (updated for _id references)
function previewContent(id) {
  const content = movieList.find(item => item._id === id);
  if (!content) return;
  
  const modal = document.getElementById('previewModal');
  const title = document.getElementById('previewModalTitle');
  const contentDiv = document.getElementById('previewContent');
  
  title.textContent = `Preview: ${content.title}`;
  
  contentDiv.innerHTML = `
    <div class="preview-details">
      <h3>${content.title}</h3>
      <p><strong>Type:</strong> ${content.type}</p>
      <p><strong>Studio:</strong> ${content.studio}</p>
      <p><strong>Release Date:</strong> ${new Date(content.releaseDate).toLocaleDateString()}</p>
      <p><strong>Rating:</strong> ${content.rating}</p>
      <p><strong>Genres:</strong> ${content.genres?.join(', ') || 'None'}</p>
      <p><strong>Description:</strong> ${content.description}</p>
      ${content.episodes?.length ? `<p><strong>Episodes:</strong> ${content.episodes.length}</p>` : ''}
      ${content.thumbnailUrl ? `<img src="${content.thumbnailUrl}" alt="Thumbnail" style="max-width: 200px;">` : ''}
    </div>
  `;
  
  modal.classList.remove('hidden');
}

function previewUser(id) {
  const user = data.userList.find(item => item._id === id);
  if (!user) return;
  
  const modal = document.getElementById('previewModal');
  const title = document.getElementById('previewModalTitle');
  const contentDiv = document.getElementById('previewContent');
  
  title.textContent = `Preview: ${user.name || user.fullName}`;
  
  contentDiv.innerHTML = `
    <div class="preview-details">
      <h3>${user.name || user.fullName}</h3>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
      <p><strong>Address:</strong> ${user.address || 'N/A'}</p>
      <p><strong>Status:</strong> ${user.status}</p>
      <p><strong>Subscription:</strong> ${user.subscription}</p>
      <p><strong>Admin:</strong> ${user.isAdmin ? 'Yes' : 'No'}</p>
    </div>
  `;
  
  modal.classList.remove('hidden');
}

// Modal Management (unchanged)
function closeContentModal() {
  document.getElementById('contentModal').classList.add('hidden');
}

function closeUserModal() {
  document.getElementById('userModal').classList.add('hidden');
}

function closePreviewModal() {
  document.getElementById('previewModal').classList.add('hidden');
}

function closeEpisodeModal() {
  document.getElementById('episodeModal').classList.add('hidden');
}

// Notification System (unchanged)
function showNotification(message, type = 'success') {
  console.log('Notification:', message, type);
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add some basic styling
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    max-width: 300px;
    ${type === 'error' ? 'background-color: #e74c3c;' : 'background-color: #2ecc71;'}
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}

// ====== RENDER FUNCTIONS (Updated for _id) ======

function renderContentTable() {
  const tbody = document.getElementById('contentTable');
  if (!tbody) return;
  
  console.log('Rendering content table with', movieList.length, 'items');
  
  tbody.innerHTML = movieList.length ? movieList.map(content => `
    <tr>
      <td>${content.title}</td>
      <td><span class="badge">${content.type}</span></td>
      <td>${new Date(content.releaseDate).toLocaleDateString()}</td>
      <td>
        <button onclick="previewContent('${content._id}')" class="btn-secondary btn-sm">Preview</button>
        <button onclick="openContentModal('${content._id}')" class="btn-secondary btn-sm">Edit</button>
        <button onclick="deleteContent('${content._id}')" class="btn-danger btn-sm">Delete</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="4" class="empty-state">No content available</td></tr>';
}

function renderUserTable() {
  const tbody = document.getElementById('userTable');
  if (!tbody) return;
  
  console.log('Rendering user table with', data.userList.length, 'items');
  
  tbody.innerHTML = data.userList.length ? data.userList.map(user => `
    <tr>
      <td>${user.name || user.fullName}</td>
      <td>${user.email}</td>
      <td><span class="badge ${user.status.toLowerCase()}">${user.status}</span></td>
      <td><span class="badge">${user.subscription}</span></td>
      <td>
        <button onclick="previewUser('${user._id}')" class="btn-secondary btn-sm">Preview</button>
        <button onclick="openUserModal('${user._id}')" class="btn-secondary btn-sm">Edit</button>
        <button onclick="deleteUser('${user._id}')" class="btn-danger btn-sm">Delete</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="empty-state">No users available</td></tr>';
}

function renderSubscriptionTable() {
  const tbody = document.getElementById('subscriptionTable');
  if (!tbody) return;
  
  console.log('Rendering subscription table');
  
  const subscriptions = data.userList.filter(user => user.subscription !== 'Free');
  
  tbody.innerHTML = subscriptions.length ? subscriptions.map(user => `
    <tr>
      <td>${user.name || user.fullName}</td>
      <td>${user.subscription}</td>
      <td><span class="badge active">Active</span></td>
      <td>N/A</td>
    </tr>
  `).join('') : '<tr><td colspan="4" class="empty-state">No active subscriptions</td></tr>';
}

// ====== POSTER MANAGEMENT (UNCHANGED) ======
let uploadedPosters = []; // Temporary array for previews before upload

function handlePosterFiles(input) {
  const files = Array.from(input.files);
  if (uploadedPosters.length + files.length > 5) {
    showNotification('Maximum 5 posters allowed', 'error');
    return;
  }
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedPosters.push(e.target.result); // Store base64 for preview
      renderPosterPreviews();
    };
    reader.readAsDataURL(file);
  });
  input.value = ''; // Reset file input
}

function renderPosterPreviews() {
  const container = document.getElementById('posterPreviews');
  if (!container) return;
  
  container.innerHTML = uploadedPosters.map((poster, index) => `
    <div class="image-preview">
      <img src="${poster}" alt="Poster ${index + 1}" style="max-width: 100px;">
      <button type="button" class="remove-btn" onclick="removePoster(${index})">×</button>
    </div>
  `).join('');
}

function removePoster(index) {
  uploadedPosters.splice(index, 1);
  renderPosterPreviews();
}

// ====== THUMBNAIL HANDLING (UNCHANGED) ======
function handleThumbnailFile(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('thumbnailPreview').innerHTML = 
      `<img src="${e.target.result}" alt="Thumbnail" style="max-width: 200px;">`;
  };
  reader.readAsDataURL(file);
}

// ====== EPISODE MANAGEMENT (UNCHANGED) ======
function openEpisodeModal(index = null) {
  currentEditingEpisodeIndex = index;
  const form = document.getElementById('episodeForm');
  form.reset();
  
  if (index !== null && episodes[index]) {
    const ep = episodes[index];
    document.getElementById('episodeTitle').value = ep.title;
    document.getElementById('episodeRelease').value = ep.release;
    document.getElementById('episodeDescription').value = ep.description;
    
    if (ep.thumbnail) {
      document.getElementById('episodeThumbnailPreview').innerHTML = 
        `<img src="${ep.thumbnail}" alt="Episode Thumbnail" style="max-width: 200px;">`;
    }
  }
  document.getElementById('episodeModal').classList.remove('hidden');
}

function saveEpisode(event) {
  event.preventDefault();
  
  const episode = {
    title: document.getElementById('episodeTitle').value,
    release: document.getElementById('episodeRelease').value,
    description: document.getElementById('episodeDescription').value,
    thumbnail: null,
    video: document.getElementById('episodeVideo').files[0]?.name || null
  };

  const thumbnailFile = document.getElementById('episodeThumbnail').files[0];
  if (thumbnailFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      episode.thumbnail = e.target.result;
      saveEpisodeData(episode);
    };
    reader.readAsDataURL(thumbnailFile);
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
  showNotification('Episode saved!');
}

function renderEpisodeList() {
  const container = document.getElementById('episodeList');
  if (!container) return;
  
  container.innerHTML = episodes.length ? episodes.map((ep, index) => `
    <div class="episode-item">
      <div class="episode-info">
        <div class="episode-title">Episode ${index + 1}: ${ep.title}</div>
        <div class="episode-meta">${ep.release} • ${ep.description.substring(0, 50)}...</div>
      </div>
      <div class="episode-actions">
        <button onclick="openEpisodeModal(${index})" class="btn-secondary btn-sm">Edit</button>
        <button onclick="deleteEpisode(${index})" class="btn-danger btn-sm">Delete</button>
      </div>
    </div>
  `).join('') : '<p class="empty-state">No episodes added</p>';
}

function deleteEpisode(index) {
  if (confirm('Delete this episode?')) {
    episodes.splice(index, 1);
    renderEpisodeList();
    showNotification('Episode deleted!');
  }
}

function handleEpisodeThumbnailFile(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('episodeThumbnailPreview').innerHTML = 
      `<img src="${e.target.result}" alt="Episode Thumbnail" style="max-width: 200px;">`;
  };
  reader.readAsDataURL(file);
}

// More specific file type validation (optional)
function isValidFileExtension(file, allowedExtensions) {
  const extension = file.name.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
}

// Then you could use it like:
if (thumbnailFile && !isValidFileExtension(thumbnailFile, ['jpg', 'jpeg', 'png', 'webp'])) {
  throw new Error('Thumbnail must be a JPG, PNG, or WebP image');
}

function validateFileSize(file, maxSize) {
  if (file && file.size > maxSize) {
    throw new Error(`File ${file.name} exceeds maximum size of ${maxSize/1024/1024/1024}GB`);
  }
}