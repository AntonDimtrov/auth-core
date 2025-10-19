import { query } from "../db/index.js";
import { hashPassword, verifyPassword } from "./crypto.js";
import { validateEmail, validateName, validatePassword } from "./validation.js";
import { createSession, deleteSession, getSession } from "./sessions.js";

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
  if (existing.rows.length > 0) throw new Error("Email already registered");

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

export async function loginUser({ email, password }) {
  const user = await authenticateUser(email, password);
  if (!user) throw new Error("Invalid email or password");

  const session = await createSession(user.id);
  return { ...user, session_id: session.id };
}

export async function logoutUser(sessionId) {
  if (!sessionId) throw new Error("Missing session ID");
  const deleted = await deleteSession(sessionId);
  if (!deleted) throw new Error("Session not found");
  return { message: "Logged out successfully" };
}

export async function getUserBySession(sessionId) {
  const session = await getSession(sessionId);
  return session
    ? {
        id: session.user_id,
        email: session.email,
        first_name: session.first_name,
        last_name: session.last_name,
      }
    : null;
}
