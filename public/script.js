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
