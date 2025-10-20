import { markInvalid } from "./dom-utils.js";

export function validateField(el) {
  const id = el.id;
  const value = el.value.trim();
  let valid = true;
  let message = "";

  if (id === "rEmail" || id === "lEmail") {
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

  if (id === "rPass" || id === "newPass" || id === "lPass") {
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

  // reset visual state
  el.classList.remove("invalid", "valid");
  const msgEl = document.getElementById(`${id}Msg`);
  if (msgEl) msgEl.textContent = "";

  // show feedback
  if (value !== "" && !valid) {
    el.classList.add("invalid");
    if (msgEl) msgEl.textContent = message;
  } else if (value !== "" && valid) {
    el.classList.add("valid");
  }

  return valid;
}

export function validateRegisterFields({
  email,
  firstName,
  lastName,
  password,
}) {
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

  return valid;
}
