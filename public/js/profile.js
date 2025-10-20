// profile.js
import { val, show, hide } from "./dom-utils.js";
import { showToast } from "./toast.js";

export async function initProfile(token) {
  await loadProfile(token);

  document.getElementById("editBtn").addEventListener("click", showEditForm);
  document.getElementById("saveBtn").addEventListener("click", saveProfile);
  document.getElementById("cancelBtn").addEventListener("click", hideEditForm);
  document.getElementById("logoutBtn").addEventListener("click", logout);
}

async function loadProfile(token) {
  const res = await fetch(`/api/session?token=${token}`);
  const data = await res.json();

  if (!res.ok) {
    showToast(data.error || "Unable to load profile", "error");
    return;
  }

  const u = data.user;
  document.getElementById("pEmail").textContent = u.email;
  document.getElementById("pFirst").textContent = u.first_name;
  document.getElementById("pLast").textContent = u.last_name;
}

function showEditForm() {
  show("profileEdit");
  hide("profileView");
}

function hideEditForm() {
  show("profileView");
  hide("profileEdit");
}

async function saveProfile() {
  const token = localStorage.getItem("token");
  const firstName = val("newFirst");
  const lastName = val("newLast");
  const password = val("newPass");

  if (!firstName && !lastName && !password) {
    showToast("No fields to update", "error");
    return;
  }

  try {
    const res = await fetch("/api/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, firstName, lastName, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Update failed", "error");
      return;
    }

    showToast("Profile updated successfully!", "success");
    document.getElementById("pFirst").textContent = data.user.first_name;
    document.getElementById("pLast").textContent = data.user.last_name;
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
