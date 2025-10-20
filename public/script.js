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
  }

  if (path.endsWith("/profile.html")) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location = "/";
      return;
    }
    document.getElementById("logoutBtn").addEventListener("click", logout);
  }
});

function show(id) {
  document.getElementById(id).style.display = "block";
}
function hide(id) {
  document.getElementById(id).style.display = "none";
}

async function register() {
  if (!validateCaptcha()) {
    alert("Wrong CAPTCHA!");
    generateCaptcha();
    return;
  }
  const email = val("rEmail");
  const firstName = val("rFirst");
  const lastName = val("rLast");
  const password = val("rPass");

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, firstName, lastName, password }),
  });
  const data = await res.json();
  alert(res.status === 201 ? "Registered!" : data.error || "Failed");
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

function val(id) {
  return document.getElementById(id).value.trim();
}

document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;

  if (path.endsWith("/profile.html")) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location = "/";
      return;
    }

    await loadProfile(token);

    document.getElementById("editBtn").addEventListener("click", showEditForm);
    document.getElementById("saveBtn").addEventListener("click", saveProfile);
    document
      .getElementById("cancelBtn")
      .addEventListener("click", hideEditForm);
    document.getElementById("logoutBtn").addEventListener("click", logout);
  }
});

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
  document.getElementById("profileView").style.display = "none";
  document.getElementById("profileEdit").style.display = "block";
}

function hideEditForm() {
  document.getElementById("profileEdit").style.display = "none";
  document.getElementById("profileView").style.display = "block";
}

async function saveProfile() {
  const token = localStorage.getItem("token");
  const body = {
    token,
    firstName: document.getElementById("newFirst").value,
    lastName: document.getElementById("newLast").value,
    password: document.getElementById("newPass").value,
  };

  const res = await fetch("/api/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  const msg = document.getElementById("message");
  if (res.ok) {
    msg.className = "success";
    hideEditForm();
    document.getElementById("pFirst").textContent = data.user.first_name;
    document.getElementById("pLast").textContent = data.user.last_name;
  } else {
    msg.textContent = data.error || "Update failed";
    msg.className = "error";
  }
}
