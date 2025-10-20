// auth.js
import { val, markInvalid, resetValidation, clearForm } from "./dom-utils.js";
import { showToast } from "./toast.js";
import { validateRegisterFields } from "./validation.js";

export async function register() {
  resetValidation(["rEmail", "rFirst", "rLast", "rPass"]);

  const email = val("rEmail");
  const firstName = val("rFirst");
  const lastName = val("rLast");
  const password = val("rPass");

  if (!window.validateCaptcha || !window.validateCaptcha()) {
    showToast("Wrong CAPTCHA!", "error");
    if (window.generateCaptcha) window.generateCaptcha();
    return;
  }

  const valid = validateRegisterFields({
    email,
    firstName,
    lastName,
    password,
  });
  if (!valid) {
    showToast("Please fix highlighted fields", "error");
    return;
  }

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, firstName, lastName, password }),
  });

  const data = await res.json();
  if (window.generateCaptcha) window.generateCaptcha();

  if (res.status === 201) {
    showToast("Registration successful! You can now log in.");
    clearForm(["rEmail", "rFirst", "rLast", "rPass", "captchaInput"]);
  } else {
    showToast(data.error || "Registration failed", "error");
  }
}

export async function login() {
  const email = val("lEmail");
  const password = val("lPass");

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (res.ok) {
    showToast("Login successful!", "success");
    localStorage.setItem("token", data.user.session_id);
    localStorage.setItem("user", JSON.stringify(data.user));

    setTimeout(() => {
      window.location = "/profile.html";
    }, 100);
  } else {
    showToast(data.error || "Login failed", "error");
  }
}
