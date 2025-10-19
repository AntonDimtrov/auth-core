import { query } from "../db/index.js";
import { getSession } from "./sessions.js";
import { validateName, validatePassword } from "./validation.js";
import { hashPassword } from "./crypto.js";

export async function updateUserProfile(token, updates) {
  const session = await getSession(token);
  if (!session) throw new Error("Invalid or expired session");

  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.firstName) {
    if (!validateName(updates.firstName)) throw new Error("Invalid name");
    fields.push(`first_name = $${idx++}`);
    values.push(updates.firstName.trim());
  }

  if (updates.lastName) {
    if (!validateName(updates.lastName)) throw new Error("Invalid name");
    fields.push(`last_name = $${idx++}`);
    values.push(updates.lastName.trim());
  }

  if (updates.password) {
    if (!validatePassword(updates.password))
      throw new Error("Invalid password");
    const { hash, salt } = await hashPassword(updates.password);
    fields.push(`password_hash = $${idx++}`, `password_salt = $${idx++}`);
    values.push(hash, salt);
  }

  if (fields.length === 0) throw new Error("No valid fields to update");

  values.push(session.user_id);
  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = $${
    values.length
  } RETURNING id, email, first_name, last_name, created_at`;

  const result = await query(sql, values);
  return result.rows[0];
}
