import { val, show, hide } from "./dom-utils.js";
import { validateField } from "./validation.js";
import { showToast } from "./toast.js";

let currentUser = null;
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location = "/";
    return;
  }

  await loadProfile(token);
  setupListeners(token);
});

async function loadProfile(token) {
  try {
    const res = await fetch(`/api/session?token=${token}`);
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Unable to load profile", "error");
      return;
    }

    currentUser = data.user;
    document.getElementById("pEmail").textContent = currentUser.email;
    document.getElementById("pFirst").textContent = currentUser.first_name;
    document.getElementById("pLast").textContent = currentUser.last_name;
  } catch {
    showToast("Network error while loading profile", "error");
  }
}

function setupListeners() {
  document
    .getElementById("editInfoBtn")
    ?.addEventListener("click", showEditInfo);
  document
    .getElementById("changePassBtn")
    ?.addEventListener("click", showChangePass);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);

  document.getElementById("saveInfoBtn")?.addEventListener("click", saveInfo);
  document
    .getElementById("cancelInfoBtn")
    ?.addEventListener("click", backToView);

  document
    .getElementById("savePassBtn")
    ?.addEventListener("click", savePassword);
  document
    .getElementById("cancelPassBtn")
    ?.addEventListener("click", backToView);

  ["newFirst", "newLast", "newPass"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("blur", () => validateField(el));
  });
}

function showEditInfo() {
  if (currentUser) {
    document.getElementById("newFirst").value = currentUser.first_name || "";
    document.getElementById("newLast").value = currentUser.last_name || "";
  }

  show("editInfo");
  hide("profileView");
  hide("changePass");
}

function showChangePass() {
  document.getElementById("newPass").value = "";
  show("changePass");
  hide("profileView");
  hide("editInfo");
}

function backToView() {
  show("profileView");
  hide("editInfo");
  hide("changePass");
}

async function saveInfo() {
  const token = localStorage.getItem("token");
  const firstName = val("newFirst");
  const lastName = val("newLast");

  if (!firstName && !lastName) {
    showToast("Please enter at least one field to update", "error");
    return;
  }

  try {
    const res = await fetch("/api/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, firstName, lastName }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Update failed", "error");
      return;
    }

    showToast("Information updated successfully!", "success");

    currentUser.first_name = data.user.first_name;
    currentUser.last_name = data.user.last_name;

    document.getElementById("pFirst").textContent = currentUser.first_name;
    document.getElementById("pLast").textContent = currentUser.last_name;
    backToView();
  } catch {
    showToast("Something went wrong", "error");
  }
}

async function savePassword() {
  const token = localStorage.getItem("token");
  const password = val("newPass");

  if (!password) {
    showToast("Please enter a new password", "error");
    return;
  }

  try {
    const res = await fetch("/api/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Password update failed", "error");
      return;
    }

    showToast("Password changed successfully!", "success");
    backToView();
  } catch {
    showToast("Something went wrong", "error");
  }
}

async function logout() {
  const token = localStorage.getItem("token");
  await fetch("/api/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location = "/";
}
