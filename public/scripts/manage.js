let currentEditingProfileId = null;

function getProfiles() {
  return JSON.parse(localStorage.getItem("profiles")) || [];
}

function saveProfiles(profiles) {
  localStorage.setItem("profiles", JSON.stringify(profiles));
}

function renderProfiles() {
  const grid = document.getElementById("profileGrid");
  const profiles = getProfiles();
  grid.innerHTML = "";

  profiles.forEach(profile => {
    const card = document.createElement("div");
    card.className = "profile-card";
    card.innerHTML = `
      <img src="${profile.avatar}" class="profile-avatar" alt="${profile.name}">
      <div class="profile-name">${profile.name}</div>
      <button class="edit-btn" onclick="editProfile(${profile.id})">Edit</button>
      <button class="edit-btn delete-btn" onclick="deleteProfile(${profile.id})">Delete</button>
    `;
    grid.appendChild(card);
  });

  if (profiles.length < 5) {
    const addCard = document.createElement("div");
    addCard.className = "profile-card add-profile";
    addCard.onclick = addNewProfile;
    addCard.innerHTML = `<i class="fas fa-plus"></i><p>Add Profile</p>`;
    grid.appendChild(addCard);
  }
}

async function addNewProfile() {
  // FIX: Get current plan limits from backend
  const response = await fetch('/api/user/plan');
  const planData = await response.json();
  const maxProfiles = planData.maxProfiles || 1;
  
  const profiles = getProfiles();
  
  // FIX: Enforce plan-based profile limits
  if (profiles.length >= maxProfiles) {
    alert(`You've reached the maximum ${maxProfiles} profiles for your plan`);
    return;
  }
  
  const newId = Date.now();
  
  // FIX: Use random avatar from available options
  const avatarNumber = Math.floor(Math.random() * 4) + 1;
  const avatarPath = `assets/images/avatar${avatarNumber}.jpg`;
  
  profiles.push({
    id: newId,
    name: "New User",
    avatar: avatarPath
  });
  
  saveProfiles(profiles);
  renderProfiles();
}

function deleteProfile(profileId) {
  let profiles = getProfiles();
  if (profiles.length <= 1) {
    alert("At least one profile is required.");
    return;
  }
  profiles = profiles.filter(p => p.id !== profileId);
  saveProfiles(profiles);
  renderProfiles();
}

function editProfile(profileId) {
  const profile = getProfiles().find(p => p.id === profileId);
  if (!profile) return;
  currentEditingProfileId = profileId;
  document.getElementById("profileName").value = profile.name;
  document.getElementById("currentAvatar").src = profile.avatar;
  document.getElementById("editProfileModal").style.display = "flex";
}

function closeEditProfile() {
  document.getElementById("editProfileModal").style.display = "none";
}

function saveProfile() {
  const profiles = getProfiles();
  const idx = profiles.findIndex(p => p.id === currentEditingProfileId);
  if (idx !== -1) {
    profiles[idx].name = document.getElementById("profileName").value.trim() || "Unnamed";
    profiles[idx].avatar = document.getElementById("currentAvatar").src;
    saveProfiles(profiles);
    renderProfiles();
    closeEditProfile();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("profiles")) {
    saveProfiles([
      { id: 1, name: "User 1", avatar: "https://placehold.co/120x120" }
    ]);
  }
  renderProfiles();
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
