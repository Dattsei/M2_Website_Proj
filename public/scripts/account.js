function editPassword() {
  const modal = document.getElementById("passwordModal");
  modal.style.display = "flex"; // <== this ensures it's centered
}


  function closePasswordModal() {
    document.getElementById("passwordModal").style.display = "none";
  }

  function savePassword() {
    const newPass = document.getElementById("newPassword").value;
    if (newPass.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    localStorage.setItem("userPassword", newPass);
    alert("Password updated!");
    closePasswordModal();
  }

  function editPlan() {
    document.getElementById("planModal").style.display = "flex";
  }

  function closePlanModal() {
    document.getElementById("planModal").style.display = "none";
  }

  function savePlan() {
    const plan = document.getElementById("planSelect").value;
    localStorage.setItem("userPlan", plan);
    document.getElementById("planDisplay").innerText = plan;
    alert("Plan updated to " + plan);
    closePlanModal();
  }

  // Load profiles from localStorage and plan
  window.onload = () => {
    const profiles = JSON.parse(localStorage.getItem("profiles")) || [];
    const container = document.getElementById("profileList");

    profiles.forEach((profile) => {
      const div = document.createElement("div");
      div.className = "profile-item";
      div.innerHTML = `
        <img src="${profile.avatar}" class="profile-avatar">
        <span>${profile.name}</span>
      `;
      container.appendChild(div);
    });

    const currentPlan = localStorage.getItem("userPlan") || "Premium";
    document.getElementById("planDisplay").innerText = currentPlan;
  }
  let selectedPlan = localStorage.getItem("userPlan") || "Premium";

function selectPlan(plan) {
  selectedPlan = plan;
  document.querySelectorAll(".plan-card").forEach(card => {
    card.classList.remove("selected");
  });
  const selectedCard = [...document.querySelectorAll(".plan-card")].find(card =>
    card.querySelector("h3").innerText === plan
  );
  if (selectedCard) selectedCard.classList.add("selected");
}

function saveSelectedPlan() {
  localStorage.setItem("userPlan", selectedPlan);
  document.getElementById("planDisplay").innerText = selectedPlan;
  alert("Plan updated to " + selectedPlan);
  closePlanModal();
}
