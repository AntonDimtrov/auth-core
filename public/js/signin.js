import { login } from "./auth.js";
import { validateField } from "./validation.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    login();
  });

  ["lEmail", "lPass"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("blur", () => validateField(el));
  });
});
