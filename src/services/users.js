import { query } from "../db/index.js";
import { hashPassword, verifyPassword } from "./crypto.js";
import { validateEmail, validateName, validatePassword } from "./validation.js";

export async function registerUser({ email, firstName, lastName, password }) {
  if (
    !validateEmail(email) ||
    !validateName(firstName) ||
    !validateName(lastName) ||
    !validatePassword(password)
  ) {
    throw new Error("Invalid input");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await query("SELECT id FROM users WHERE email = $1", [
    normalizedEmail,
  ]);
  if (existing.rows.length > 0) {
    throw new Error("Email already registered");
  }

  const { hash, salt } = await hashPassword(password);

  const result = await query(
    `INSERT INTO users (email, first_name, last_name, password_hash, password_salt)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name, last_name, created_at`,
    [normalizedEmail, firstName.trim(), lastName.trim(), hash, salt]
  );

  return result.rows[0];
}

export async function authenticateUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await query("SELECT * FROM users WHERE email = $1", [
    normalizedEmail,
  ]);
  if (result.rows.length === 0) return null;

  const user = result.rows[0];
  const ok = await verifyPassword(
    password,
    user.password_hash,
    user.password_salt
  );
  if (!ok) return null;

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  };
}
