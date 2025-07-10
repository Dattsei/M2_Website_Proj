let selectedPlan = null;
let currentPlan = null;
let currentSubscription = null;
let selectedProfiles = [];
let newPaymentMethod = null;
let lastActivity = Date.now();

// Add body class for modal open state
document.body.classList.remove('modal-open');

// Session timeout handling
['click', 'keypress', 'mousemove'].forEach(event => {
  document.addEventListener(event, () => lastActivity = Date.now());
});

setInterval(() => {
  if (Date.now() - lastActivity > 30 * 60 * 1000) {
    alert('Your session has expired. Please log in again.');
    window.location.href = '/login';
  }
}, 60000);

// Modal helper functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'block';
  document.body.classList.add('modal-open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'none';
  document.body.classList.remove('modal-open');
}

// Loader functions
function showLoader() {
  document.getElementById('loader').classList.remove('hidden');
}

function hideLoader() {
  document.getElementById('loader').classList.add('hidden');
}

// Show error message
function showError(message) {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  showLoader();
  
  // Display loading state
  document.getElementById('loading-indicator').style.display = 'block';
  document.getElementById('account-content').style.display = 'none';
  
  try {
    await loadAccountData();
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to load account data');
  } finally {
    hideLoader();
    document.getElementById('loading-indicator').style.display = 'none';
    document.getElementById('account-content').style.display = 'block';
  }

  // Close modals when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
    });
  });

  // Close modals using close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal').classList.add('hidden');
      document.body.classList.remove('modal-open');
    });
  });

  // Add phone number validation
  const phoneInput = document.getElementById('phoneNumber');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, ''); // Remove non-digits
    });
  }
});

async function loadAccountData() {
  try {
    showLoader();
    const response = await fetch('/api/account');
    
    if (!response.ok) {
      throw new Error('Failed to fetch account data');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to load account data');
    }

    // Update account information
    document.getElementById('nameDisplay').textContent = data.name;
    document.getElementById('emailDisplay').textContent = data.email;
    
    // UPDATE SUBSCRIPTION INFO
    if (data.plan && data.plan !== 'None') {
      document.getElementById('planDisplay').textContent = data.plan;
      currentPlan = data.plan;
      
      // Expiration date
      if (data.expiration) {
        const expirationDate = new Date(data.expiration);
        if (!isNaN(expirationDate)) {
          document.getElementById('expirationDisplay').textContent = expirationDate.toLocaleDateString();
        }
      }
      
      // In loadAccountData function:
      const paymentMethodMap = {
        card: 'Credit/Debit Card',
        digital: 'Digital Wallet',
        mobile: 'Mobile Payment'
      };
      document.getElementById('paymentDisplay').textContent = 
        paymentMethodMap[data.paymentMethod] || data.paymentMethod;
    } else {
      document.getElementById('planDisplay').textContent = 'No active subscription';
      document.getElementById('paymentDisplay').textContent = 'None';
      document.getElementById('expirationDisplay').textContent = 'None';
    }
    
    // Render profiles
    renderProfiles(data.profiles);
  } catch (error) {
    console.error('Error loading account data:', error);
    showError(`Failed to load account data: ${error.message}`);
  } finally {
    hideLoader();
  }
}

function renderProfiles(profiles) {
  const container = document.getElementById("profileList");
  container.innerHTML = '';
  
  profiles.forEach(profile => {
    const div = document.createElement("div");
    div.className = "profile-item";
    div.innerHTML = `
      <img src="${profile.avatar}" class="profile-avatar" 
           onclick="updateProfileAvatar('${profile._id}')">
      <span>${profile.name}</span>
      <div>
        <button onclick="editProfile('${profile.id}')">Edit</button>
        <button onclick="deleteProfile('${profile.id}')">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
  
  // Add "Create Profile" button
  const addDiv = document.createElement("div");
  addDiv.className = "profile-item";
  addDiv.innerHTML = `
    <button class="link-btn" onclick="createProfile()">
      <i class="fas fa-plus"></i> Add Profile
    </button>
  `;
  container.appendChild(addDiv);
}

// Name editing
async function editName() {
  const newName = prompt("Enter new name:", document.getElementById('nameDisplay').textContent);
  if (!newName) return;

  showLoader();
  try {
    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });

    if (response.ok) {
      document.getElementById('nameDisplay').textContent = newName;
    }
  } catch (error) {
    console.error('Name update error:', error);
    alert('Failed to update name: ' + error.message);
  } finally {
    hideLoader();
  }
}

// Email editing (requires password)
async function editEmail() {
  const newEmail = prompt("Enter new email:", document.getElementById('emailDisplay').textContent);
  if (!newEmail) return;

  const currentPassword = prompt("Please enter your password to verify:");
  if (!currentPassword) return;

  try {
    // Verify password
    const verifyRes = await fetch('/api/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: currentPassword })
    });
    
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      alert("Incorrect password");
      return;
    }
    
    // Update email
    const updateRes = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail })
    });
    
    if (updateRes.ok) {
      document.getElementById('emailDisplay').textContent = newEmail;
      alert('Email updated successfully!');
    }
  } catch (error) {
    console.error('Email update error:', error);
    alert(`Error: ${error.message || 'Failed to update email'}`);
  }
}

// Password editing
function editPassword() {
  openModal('passwordModal');
}

function closePasswordModal() {
  closeModal('passwordModal');
}

async function savePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmNewPassword").value;

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match.");
    return;
  }

  // Password strength validation
  if (newPassword.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  if (!/[A-Z]/.test(newPassword)) {
    alert("Password must contain at least one uppercase letter.");
    return;
  }

  if (!/[0-9]/.test(newPassword)) {
    alert("Password must contain at least one number.");
    return;
  }

  if (newPassword.includes(' ')) {
    alert("Password cannot contain spaces");
    return;
  }

  if (newPassword === oldPassword) {
    alert("New password must be different from current password");
    return;
  }

  showLoader();
  try {
    const response = await fetch('/api/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password update failed');
    }

    const data = await response.json();
    if (data.success) {
      alert("Password updated successfully!");
      closePasswordModal();
    } else {
      alert(data.message || "Failed to update password.");
    }
  } catch (error) {
    console.error('Error updating password:', error);
    alert(`Error: ${error.message || "An error occurred while updating the password."}`);
  } finally {
    hideLoader();
  }
}

// Plan editing
function editPlan() {
  // Get current plan to pre-select
  selectedPlan = currentPlan || 'Basic';
  document.querySelectorAll('.plan-card').forEach(card => {
    card.classList.remove('selected');
    if (card.dataset.plan === selectedPlan) {
      card.classList.add('selected');
    }
  });
  openModal('planModal');
}

// ADDED HELPER FUNCTION TO CLOSE PLAN MODAL
function closePlanModal() {
  closeModal('planModal');
}

function selectPlan(plan) {
  selectedPlan = plan;
  document.querySelectorAll('.plan-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelector(`.plan-card[data-plan="${plan}"]`).classList.add('selected');
}

async function saveSelectedPlan() {
  if (!selectedPlan) {
    alert("Please select a plan.");
    return;
  }

  // Prevent changing to the same plan
  if (currentPlan === selectedPlan) {
    alert("You're already on this plan.");
    return;
  }

  // Only allow changes when subscription is expired
  if (currentSubscription) {
    const expirationDate = new Date(currentSubscription.expirationDate);
    const today = new Date();
    
    if (expirationDate > today) {
      alert(`You can only change plans after your current subscription expires in ${Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24))} days.`);
      return;
    }
  }

  showLoader();
  try {
    // Get plan details
    const planRes = await fetch(`/api/plans/${selectedPlan}`);
    if (!planRes.ok) {
      const error = await planRes.json();
      throw new Error(error.message || 'Failed to fetch plan details');
    }
    
    const planData = await planRes.json();
    const maxProfiles = planData.plan.maxProfiles || 1;

    // Get user profiles
    const userRes = await fetch('/api/user');
    if (!userRes.ok) {
      const error = await userRes.json();
      throw new Error(error.message || 'Failed to fetch user data');
    }
    
    const userData = await userRes.json();
    const currentProfiles = userData.profiles || [];
    
    // Check if downgrading and have more profiles than allowed
    if (selectedPlan !== currentPlan && currentProfiles.length > maxProfiles) {
      showProfileSelection(currentProfiles, maxProfiles);
      return;
    }

    // If not downgrading or within limits, update plan directly
    await updateSubscriptionPlan(selectedPlan);
  } catch (error) {
    console.error('Error changing plan:', error);
    alert(`Error: ${error.message || "An error occurred while changing the plan."}`);
  } finally {
    hideLoader();
  }
}

async function showProfileSelection(profiles, maxAllowed) {
  const container = document.getElementById("profileSelectionList");
  container.innerHTML = '';
  
  profiles.forEach((profile, index) => {
    const div = document.createElement("div");
    div.className = "profile-selection-item";
    div.innerHTML = `
      <input type="checkbox" id="profile-${index}" ${index < maxAllowed ? 'checked' : ''} 
             ${index < maxAllowed ? 'disabled' : ''} onchange="toggleProfileSelection(${index}, ${maxAllowed})">
      <label for="profile-${index}">
        <img src="${profile.avatar}" class="profile-avatar-small">
        <span>${profile.name}</span>
      </label>
    `;
    container.appendChild(div);
    
    if (index < maxAllowed) {
      selectedProfiles.push(profile._id);
    }
  });
  
  document.getElementById("maxProfilesAllowed").textContent = maxAllowed;
  openModal('profileReductionModal');
}

function toggleProfileSelection(index, maxAllowed) {
  const checkbox = document.getElementById(`profile-${index}`);
  if (!checkbox) return;
  
  const isChecked = checkbox.checked;
  
  if (isChecked) {
    if (selectedProfiles.length >= maxAllowed) {
      alert(`You can only keep ${maxAllowed} profiles`);
      checkbox.checked = false;
      return;
    }
    // Add profile ID to selected (simplified for demo)
    selectedProfiles.push(`profile-${index}`);
  } else {
    const idx = selectedProfiles.indexOf(`profile-${index}`);
    if (idx !== -1) {
      selectedProfiles.splice(idx, 1);
    }
  }
}

function closeProfileReductionModal() {
  closeModal('profileReductionModal');
  selectedProfiles = [];
}

async function confirmProfileSelection() {
  showLoader();
  try {
    // Delete unselected profiles
    const userRes = await fetch('/api/user');
    if (!userRes.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const userData = await userRes.json();
    const profilesToDelete = userData.profiles
      .filter((_, index) => !selectedProfiles.includes(`profile-${index}`))
      .map(profile => profile._id);
    
    for (const profileId of profilesToDelete) {
      const deleteRes = await fetch('/api/profiles', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ profileId })
      });
      
      if (!deleteRes.ok) {
        throw new Error('Failed to delete profile');
      }
    }
    
    // Update the plan
    await updateSubscriptionPlan(selectedPlan);
    closeProfileReductionModal();
  } catch (error) {
    console.error('Error confirming profile selection:', error);
    alert(`Error: ${error.message || 'An error occurred while updating profiles'}`);
  } finally {
    hideLoader();
  }
}

async function updateSubscriptionPlan(plan) {
  showLoader();
  try {
    // Get current subscription
    const subRes = await fetch('/api/user/subscription');
    if (!subRes.ok) throw new Error('Failed to fetch subscription');
    const subData = await subRes.json();
    
    if (!subData.subscription) {
      throw new Error('No active subscription found');
    }
    
    // Create a plan change request
    const response = await fetch('/api/subscription/change-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        plan,
        // Include existing payment details
        paymentMethod: subData.subscription.paymentMethod,
        paymentDetails: subData.subscription.paymentDetails
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update plan');
    }

    const data = await response.json();
    if (data.success) {
      document.getElementById('planDisplay').textContent = plan;
      currentPlan = plan;
      alert('Plan updated successfully!');
      closePlanModal();
    } else {
      alert(data.message || "Failed to update plan.");
    }
  } catch (error) {
    console.error('Error updating plan:', error);
    alert(`Error: ${error.message || "An error occurred while updating the plan."}`);
  } finally {
    hideLoader();
  }
}

// Payment editing
function editPayment() {
  // Initialize payment form
  document.getElementById('paymentMethod').value = 'card';
  togglePaymentDetails();
  openModal('paymentModal');
}

function closePaymentModal() {
  closeModal('paymentModal');
}

function togglePaymentDetails() {
  const method = document.getElementById('paymentMethod').value;
  document.getElementById('cardDetails').style.display = 
    method === 'card' ? 'block' : 'none';
  document.getElementById('mobileDetails').style.display = 
    method === 'mobile' ? 'block' : 'none';
}

async function savePaymentMethod() {
  const password = document.getElementById('paymentPassword').value;
  const method = document.getElementById('paymentMethod').value;
  
  if (!password) {
    alert('Please enter your password');
    return;
  }
  
  showLoader();
  try {
    // Verify password
    const verifyRes = await fetch('/api/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (!verifyRes.ok) {
      const error = await verifyRes.json();
      throw new Error(error.message || 'Verification failed');
    }
    
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      alert("Incorrect password");
      return;
    }
    
    // Prepare payment details
    let paymentDetails = {};
    if (method === 'card') {
      paymentDetails = {
        cardHolder: document.getElementById('cardHolder').value,
        cardNumber: document.getElementById('cardNumber').value,
        expiry: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value
      };
      
      // Card validation
      if (!/^\d{13,16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
        alert("Invalid card number");
        return;
      }
      
      if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
        alert("Invalid CVV");
        return;
      }
    } else if (method === 'mobile') {
      paymentDetails = {
        countryCode: document.getElementById('countryCode').value,
        phoneNumber: document.getElementById('phoneNumber').value
      };
      
      // Phone validation
      if (!/^\d{10,15}$/.test(paymentDetails.phoneNumber)) {
        alert("Invalid phone number");
        return;
      }
    }

    // Fetch current subscription
    const subRes = await fetch('/api/user/subscription');
    if (!subRes.ok) {
      throw new Error('Failed to fetch subscription');
    }
    
    const subData = await subRes.json();
    if (!subData.subscription) {
      alert('No active subscription found');
      return;
    }
    
    // Update payment method using subscription endpoint
    const response = await fetch('/api/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: subData.subscription.plan,
        paymentMethod: method,
        paymentDetails
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update payment method');
    }
    
    const data = await response.json();
    if (data.success) {
      document.getElementById('paymentDisplay').textContent = method;
      alert('Payment method updated successfully!');
      closePaymentModal();
    } else {
      alert(data.message || "Failed to update payment method.");
    }
  } catch (error) {
    console.error('Error updating payment method:', error);
    alert(`Error: ${error.message || "An error occurred while updating the payment method."}`);
  } finally {
    hideLoader();
  }
}

// Create new profile
async function createProfile() {
  const profileName = prompt("Enter profile name:");
  if (!profileName) return;

  showLoader();
  try {
    const response = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profileName })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create profile');
    }
    
    await loadAccountData(); // Refresh profiles
    alert('Profile created successfully!');
  } catch (error) {
    console.error('Error creating profile:', error);
    alert(`Error: ${error.message || 'Failed to create profile'}`);
  } finally {
    hideLoader();
  }
}

// Edit existing profile
async function editProfile(profileId) {
  const newName = prompt("Enter new profile name:");
  if (!newName) return;

  showLoader();
  try {
    const response = await fetch('/api/profiles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, name: newName })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    
    await loadAccountData(); // Refresh profiles
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert(`Error: ${error.message || 'Failed to update profile'}`);
  } finally {
    hideLoader();
  }
}

// Delete profile - UPDATED TO MATCH ENDPOINT
async function deleteProfile(profileId) {
  console.log('Deleting profile with ID:', profileId);
  if (!confirm('Delete this profile? This action cannot be undone.')) return;
  
  showLoader();
  try {
    // Updated to use URL parameter instead of request body
    const response = await fetch(`/api/profiles/${profileId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete profile');
    }

    await loadAccountData(); // Refresh profiles
  } catch (error) {
    console.error('Delete profile error:', error);
    alert(`Error: ${error.message || 'Failed to delete profile'}`);
  } finally {
    hideLoader();
  }
}

// Cancel subscription
async function cancelSubscription() {
  if (!confirm('Are you sure? You will lose access at the end of your billing period.')) return;
  
  showLoader();
  try {
    const response = await fetch('/api/subscription', {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }
    
    const data = await response.json();
    if (data.success) {
      alert('Subscription cancelled successfully. You can access content until your expiration date.');
      await loadAccountData();
    } else {
      alert(data.message || 'Failed to cancel subscription');
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    alert(`Error: ${error.message || 'Failed to cancel subscription'}`);
  } finally {
    hideLoader();
  }
}

async function fetchAccountData() {
  try {
    const [userRes, subscriptionRes] = await Promise.all([
      fetch('/api/user'),
      fetch('/api/user/subscription') // Fixed endpoint
    ]);

    // Check for JSON responses
    if (!userRes.headers.get('content-type').includes('application/json') || 
        !subscriptionRes.headers.get('content-type').includes('application/json')) {
      throw new Error('Server returned HTML instead of JSON');
    }

    const userData = await userRes.json();
    const subData = await subscriptionRes.json();

    // Update DOM with data...
  } catch (error) {
    console.error('Error loading account data:', error);
    // Show user-friendly error
  }
}

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    
    const contentType = res.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Expected JSON, got ${contentType}. Response: ${text.slice(0, 100)}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}