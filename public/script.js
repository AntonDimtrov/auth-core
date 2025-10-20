import { show, hide } from "./js/dom-utils.js";
import { validateField } from "./js/validation.js";
import { register, login } from "./js/auth.js";
import { initProfile } from "./js/profile.js";

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

    ["rEmail", "rFirst", "rLast", "rPass"].forEach((id) => {
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
    ["newFirst", "newLast", "newPass"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("blur", () => validateField(el));
    });
  }
});
