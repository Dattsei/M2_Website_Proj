// Data Management - Using localStorage to match your existing code
function getProfiles() {
  return JSON.parse(localStorage.getItem("profiles")) || [
    { id: 1, name: "siargao", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face" },
    { id: 2, name: "cloud 9", avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c107?w=120&h=120&fit=crop&crop=face" },
    { id: 3, name: "New User", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face" },
    { id: 4, name: "New User", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face" },
    { id: 5, name: "New User", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face" }
  ];
}

function saveProfiles(profiles) {
  localStorage.setItem("profiles", JSON.stringify(profiles));
}

function getAvailableAvatars() {
  return JSON.parse(localStorage.getItem("availableAvatars")) || [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b332c107?w=120&h=120&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&fit=crop&crop=face"
  ];
}

function saveAvailableAvatars(avatars) {
  localStorage.setItem("availableAvatars", JSON.stringify(avatars));
}

// Global variables
let currentEditingProfile = null;

// Profile Management Functions
function renderProfiles() {
  const grid = document.getElementById('profileGrid');
  const profiles = getProfiles();
  grid.innerHTML = '';

  profiles.forEach(profile => {
    const profileCard = document.createElement('div');
    profileCard.className = 'profile-card';
    profileCard.innerHTML = `
      <img src="${profile.avatar}" alt="${profile.name}" class="profile-avatar">
      <div class="profile-name">${profile.name}</div>
      <button class="edit-btn" onclick="editProfile(${profile.id})">
        <i class="fas fa-pencil-alt"></i> Edit
      </button>
      <button class="edit-btn delete-btn" onclick="deleteProfile(${profile.id})">
        <i class="fas fa-trash"></i> Delete
      </button>
    `;
    grid.appendChild(profileCard);
  });

  // Add "Add Profile" card if less than 5 profiles
  if (profiles.length < 5) {
    const addCard = document.createElement('div');
    addCard.className = 'profile-card add-profile';
    addCard.onclick = addNewProfile;
    addCard.innerHTML = `
      <i class="fas fa-plus"></i>
      <p>Add Profile</p>
    `;
    grid.appendChild(addCard);
  }
}

function addNewProfile() {
  const profiles = getProfiles();
  
  if (profiles.length >= 5) {
    alert('Maximum of 5 profiles allowed');
    return;
  }

  const availableAvatars = getAvailableAvatars();
  const newId = profiles.length > 0 ? Math.max(...profiles.map(p => p.id)) + 1 : 1;
  
  profiles.push({
    id: newId,
    name: 'New User',
    avatar: availableAvatars[Math.floor(Math.random() * availableAvatars.length)]
  });
  
  saveProfiles(profiles);
  renderProfiles();
}

function editProfile(profileId) {
  const profiles = getProfiles();
  const profile = profiles.find(p => p.id === profileId);
  if (!profile) return;

  currentEditingProfile = profile;
  document.getElementById('profileName').value = profile.name;
  document.getElementById('currentAvatar').src = profile.avatar;
  document.getElementById('modalTitle').textContent = `Edit ${profile.name}`;
  document.getElementById('editProfileModal').style.display = 'flex';
}

function closeEditProfile() {
  document.getElementById('editProfileModal').style.display = 'none';
  currentEditingProfile = null;
}

function saveProfile() {
  if (!currentEditingProfile) return;
  
  const newName = document.getElementById('profileName').value.trim();
  if (!newName) {
    alert('Profile name cannot be empty');
    return;
  }

  const profiles = getProfiles();
  const profileIndex = profiles.findIndex(p => p.id === currentEditingProfile.id);
  
  if (profileIndex !== -1) {
    profiles[profileIndex].name = newName;
    profiles[profileIndex].avatar = currentEditingProfile.avatar;
    saveProfiles(profiles);
    renderProfiles();
    closeEditProfile();
  }
}

function deleteProfile(profileId) {
  const profiles = getProfiles();
  
  if (profiles.length <= 1) {
    alert('Cannot delete the last profile');
    return;
  }

  const profile = profiles.find(p => p.id === profileId);
  if (confirm(`Are you sure you want to delete "${profile.name}"?`)) {
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    saveProfiles(updatedProfiles);
    renderProfiles();
  }
}

// Avatar Management Functions
function openAvatarSelection() {
  renderAvatars();
  document.getElementById('avatarModal').style.display = 'flex';
}

function closeAvatarSelection() {
  document.getElementById('avatarModal').style.display = 'none';
}

function renderAvatars() {
  const grid = document.getElementById('avatarGrid');
  const availableAvatars = getAvailableAvatars();
  grid.innerHTML = '';

  availableAvatars.forEach((avatarUrl, index) => {
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar-option';
    avatarDiv.innerHTML = `
      <img src="${avatarUrl}" alt="Avatar ${index + 1}" onclick="selectAvatar('${avatarUrl.replace(/'/g, "\\'")}')">
      <button class="avatar-delete" onclick="deleteAvatar(${index})">
        <i class="fas fa-times"></i>
      </button>
    `;
    grid.appendChild(avatarDiv);
  });

  // Add "Add Avatar" button
  const addDiv = document.createElement('div');
  addDiv.className = 'add-avatar-btn';
  addDiv.onclick = () => document.getElementById('addAvatarModal').style.display = 'flex';
  addDiv.innerHTML = '<i class="fas fa-plus"></i>';
  grid.appendChild(addDiv);
}

function selectAvatar(avatarUrl) {
  if (currentEditingProfile) {
    currentEditingProfile.avatar = avatarUrl;
    document.getElementById('currentAvatar').src = avatarUrl;
    closeAvatarSelection();
  }
}

function deleteAvatar(index) {
  const availableAvatars = getAvailableAvatars();
  
  if (availableAvatars.length <= 3) {
    alert('Cannot delete avatar - minimum 3 avatars required');
    return;
  }

  if (confirm('Are you sure you want to delete this avatar?')) {
    availableAvatars.splice(index, 1);
    saveAvailableAvatars(availableAvatars);
    renderAvatars();
  }
}

function addNewAvatar() {
  document.getElementById('addAvatarModal').style.display = 'flex';
}

function closeAddAvatar() {
  document.getElementById('addAvatarModal').style.display = 'none';
  document.getElementById('avatarUrl').value = '';
}

function saveNewAvatar() {
  const url = document.getElementById('avatarUrl').value.trim();
  if (!url) {
    alert('Please enter a valid image URL');
    return;
  }

  // Test if the image loads
  const img = new Image();
  img.onload = function() {
    const availableAvatars = getAvailableAvatars();
    availableAvatars.push(url);
    saveAvailableAvatars(availableAvatars);
    closeAddAvatar();
    renderAvatars();
  };
  img.onerror = function() {
    alert('Invalid image URL. Please check the link and try again.');
  };
  img.src = url;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  renderProfiles();
});