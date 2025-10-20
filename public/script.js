function show(id) {
  document.getElementById(id).style.display = "block";
}

function hide(id) {
  document.getElementById(id).style.display = "none";
}

function val(id) {
  return document.getElementById(id).value.trim();
}

function markInvalid(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("invalid");
}

function resetValidation(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("invalid", "valid");
  });
}

function clearForm(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.endsWith("/") || path.endsWith("/index.html")) {
    document.getElementById("goLogin").addEventListener("click", (e) => {
      e.preventDefault();
      show("loginForm");
      hide("registerForm");
    });

    document.getElementById("goRegister").addEventListener("click", (e) => {
      e.preventDefault();
      show("registerForm");
      hide("loginForm");
    });

    document.getElementById("registerBtn").addEventListener("click", register);
    document.getElementById("loginBtn").addEventListener("click", login);

    const fields = ["rEmail", "rFirst", "rLast", "rPass"];
    fields.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("blur", () => validateField(el));
    });
  }

  if (path.endsWith("/profile.html")) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location = "/";
      return;
    }

    initProfile(token);
    const fields = ["newFirst", "newLast", "newPass"];
    fields.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("blur", () => validateField(el));
    });
  }
});

async function register() {
  resetValidation(["rEmail", "rFirst", "rLast", "rPass"]);

  const email = val("rEmail");
  const firstName = val("rFirst");
  const lastName = val("rLast");
  const password = val("rPass");

  if (!validateCaptcha()) {
    alert("Wrong CAPTCHA!");
    generateCaptcha();
    return;
  }

  let valid = true;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    markInvalid("rEmail");
    valid = false;
  }
  if (firstName.length < 2) {
    markInvalid("rFirst");
    valid = false;
  }
  if (lastName.length < 2) {
    markInvalid("rLast");
    valid = false;
  }
  if (password.length < 8) {
    markInvalid("rPass");
    valid = false;
  }

  if (!valid) {
    alert("Please fix highlighted fields");
    return;
  }

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, firstName, lastName, password }),
  });

  const data = await res.json();
  generateCaptcha();

  if (res.status === 201) {
    alert("Registered successfully!");
    clearForm(["rEmail", "rFirst", "rLast", "rPass", "captchaInput"]);
  } else {
    alert(data.error || "Registration failed");
  }
}

async function login() {
  const email = val("lEmail");
  const password = val("lPass");

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.user.session_id);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location = "/profile.html";
  } else {
    alert(data.error || "Login failed");
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

async function initProfile(token) {
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
    alert(data.error || "Unable to load profile");
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
  const body = {
    token,
    firstName: val("newFirst"),
    lastName: val("newLast"),
    password: val("newPass"),
  };

  const res = await fetch("/api/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  const msg = document.getElementById("message");

  if (res.ok) {
    msg.textContent = "Profile updated successfully!";
    msg.className = "success";
    hideEditForm();
    document.getElementById("pFirst").textContent = data.user.first_name;
    document.getElementById("pLast").textContent = data.user.last_name;
  } else {
    msg.textContent = data.error || "Update failed";
    msg.className = "error";
  }
}

function validateField(el) {
  const id = el.id;
  const value = el.value.trim();
  let valid = true;
  let message = "";

  if (id === "rEmail") {
    valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
    if (!valid) message = "Enter a valid email address.";
  }

  if (
    id === "rFirst" ||
    id === "rLast" ||
    id === "newFirst" ||
    id === "newLast"
  ) {
    valid = value.length >= 2;
    if (!valid) message = "Name must be at least 2 characters.";
  }

  if (id === "rPass" || id === "newPass") {
    const checks = [
      /[a-z]/.test(value),
      /[A-Z]/.test(value),
      /[0-9]/.test(value),
      /[^A-Za-z0-9]/.test(value),
    ];
    valid = value.length >= 8 && value.length <= 64 && checks.every(Boolean);

    if (!valid) {
      message =
        "Password must be 8–64 chars, include upper, lower, number & symbol.";
    }
  }

  el.classList.remove("invalid", "valid");
  const msgEl = document.getElementById(`${id}Msg`);
  if (msgEl) msgEl.textContent = "";

  if (value !== "" && !valid) {
    el.classList.add("invalid");
    if (msgEl) msgEl.textContent = message;
  }
}
