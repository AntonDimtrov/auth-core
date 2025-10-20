import { register } from "./auth.js";
import { validateField } from "./validation.js";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("registerBtn").addEventListener("click", (e) => {
    e.preventDefault();
    register();
  });

  ["rEmail", "rFirst", "rLast", "rPass"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("blur", () => validateField(el));
  });
});
