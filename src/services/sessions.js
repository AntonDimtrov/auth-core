import { query } from "../db/index.js";
import crypto from "crypto";

export async function createSession(userId) {
  const id = crypto.randomBytes(32).toString("hex");
  const result = await query(
    `INSERT INTO sessions (id, user_id, created_at, expires_at)
     VALUES ($1, $2, NOW(), NOW() + interval '7 days')
     RETURNING id, user_id, created_at, expires_at`,
    [id, userId]
  );
  return result.rows[0];
}

export async function deleteSession(sessionId) {
  const result = await query("DELETE FROM sessions WHERE id = $1", [sessionId]);
  return result.rowCount > 0;
}

export async function getSession(sessionId) {
  const result = await query(
    `SELECT s.id, s.user_id, s.created_at, s.expires_at,
            u.email, u.first_name, u.last_name
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.expires_at > NOW()`,
    [sessionId]
  );
  return result.rows[0] || null;
}
