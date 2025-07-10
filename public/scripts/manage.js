let currentEditingProfileId = null;

async function getProfiles() {
  try {
    const response = await fetch('/api/user');
    const data = await response.json();
    if (data.success) {
      return data.profiles;
    }
    return [];
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
}

async function renderProfiles() {
  const grid = document.getElementById("profileGrid");
  const profiles = await getProfiles();
  grid.innerHTML = "";

  profiles.forEach(profile => {
    const card = document.createElement("div");
    card.className = "profile-card";
    card.innerHTML = `
      <img src="${profile.avatar}" class="profile-avatar" alt="${profile.name}">
      <div class="profile-name">${profile.name}</div>
      <button class="edit-btn" onclick="editProfile('${profile._id}')">Edit</button>
      <button class="edit-btn delete-btn" onclick="deleteProfile('${profile._id}')">Delete</button>
    `;
    grid.appendChild(card);
  });

  // Get plan limits
  const planResponse = await fetch('/api/user/plan');
  const planData = await planResponse.json();
  const maxProfiles = planData.maxProfiles || 1;

  if (profiles.length < maxProfiles) {
    const addCard = document.createElement("div");
    addCard.className = "profile-card add-profile";
    addCard.onclick = addNewProfile;
    addCard.innerHTML = `<i class="fas fa-plus"></i><p>Add Profile</p>`;
    grid.appendChild(addCard);
  }
}

async function addNewProfile() {
  try {
    const planResponse = await fetch('/api/user/plan');
    const planData = await planResponse.json();
    const maxProfiles = planData.maxProfiles || 1;

    const profiles = await getProfiles();
    if (profiles.length >= maxProfiles) {
      alert(`You've reached the maximum ${maxProfiles} profiles for your plan`);
      return;
    }

    // Generate avatar
    const avatarNumber = Math.floor(Math.random() * 4) + 1;
    const avatarPath = `assets/images/avatar${avatarNumber}.jpg`;

    // Create profile
    const response = await fetch('/api/profiles', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: "New User",
        avatar: avatarPath
      })
    });

    const data = await response.json();
    if (data.success) {
      renderProfiles();
    } else {
      alert('Failed to create profile: ' + data.message);
    }
  } catch (error) {
    console.error('Error adding profile:', error);
    alert('An error occurred while adding the profile');
  }
}

async function deleteProfile(profileId) {
  try {
    const response = await fetch(`/api/profiles/${profileId}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    if (data.success) {
      renderProfiles();
    } else {
      alert('Failed to delete profile: ' + data.message);
    }
  } catch (error) {
    console.error('Error deleting profile:', error);
    alert('An error occurred while deleting the profile');
  }
}

async function editProfile(profileId) {
  const profiles = await getProfiles();
  const profile = profiles.find(p => p._id === profileId);
  if (!profile) return;
  
  currentEditingProfileId = profileId;
  document.getElementById("profileName").value = profile.name;
  document.getElementById("currentAvatar").src = profile.avatar;
  document.getElementById("editProfileModal").style.display = "flex";
}

function closeEditProfile() {
  document.getElementById("editProfileModal").style.display = "none";
}

async function saveProfile() {
  const name = document.getElementById("profileName").value.trim() || "Unnamed";
  const avatar = document.getElementById("currentAvatar").src;

  try {
    const response = await fetch('/api/profiles', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        profileId: currentEditingProfileId,
        name,
        avatar
      })
    });

    const data = await response.json();
    if (data.success) {
      renderProfiles();
      closeEditProfile();
    } else {
      alert('Failed to update profile: ' + data.message);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('An error occurred while updating the profile');
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderProfiles();
});

const avatarList = [
  "assets/images/avatar1.jpg",
  "assets/images/avatar2.jpg",
  "assets/images/avatar3.jpg",
  "assets/images/avatar4.jpg"
];

function openAvatarSelection() {
  const grid = document.getElementById("avatarGrid");
  grid.innerHTML = "";
  avatarList.forEach(avatar => {
    const img = document.createElement("img");
    img.src = avatar;
    img.className = "selectable-avatar";
    img.onclick = () => selectAvatar(avatar);
    grid.appendChild(img);
  });
  document.getElementById("avatarModal").style.display = "flex";
}

function selectAvatar(avatarUrl) {
  document.getElementById("currentAvatar").src = avatarUrl;
  closeAvatarSelection();
}

function closeAvatarSelection() {
  document.getElementById("avatarModal").style.display = "none";
}