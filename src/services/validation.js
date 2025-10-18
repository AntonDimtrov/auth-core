export function validateEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(trimmed);
}

export function validateName(name) {
  if (typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  const pattern = /^[\p{L}\s'-]+$/u;
  return pattern.test(trimmed);
}

export function validatePassword(password) {
  if (typeof password !== "string") return false;
  if (password.length < 8 || password.length > 64) return false;

  const checks = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const passed = checks.filter((x) => x).length;
  return passed >= 3;
}
