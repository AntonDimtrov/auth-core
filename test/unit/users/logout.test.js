import test from "node:test";
import assert from "node:assert/strict";
import { query } from "../../../src/db/index.js";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../../../src/services/users.js";

async function resetDb() {
  await query("DELETE FROM sessions");
  await query("DELETE FROM users");
}

test("logoutUser: deletes an existing session", async () => {
  await resetDb();

  const email = "logout@example.com";
  const password = "Abc123!!";

  await registerUser({
    email,
    firstName: "Out",
    lastName: "User",
    password,
  });

  const user = await loginUser({ email, password });
  const before = await query("SELECT COUNT(*) FROM sessions");
  assert.equal(before.rows[0].count, "1", "session should exist before logout");

  const result = await logoutUser(user.session_id);
  assert.equal(result.message, "Logged out successfully");

  const after = await query("SELECT COUNT(*) FROM sessions");
  assert.equal(
    after.rows[0].count,
    "0",
    "session should be deleted after logout"
  );
});

test("logoutUser: rejects missing or invalid session_id", async () => {
  await resetDb();

  await assert.rejects(logoutUser("nonexistent"), /Session not found/);
  await assert.rejects(logoutUser(), /Missing session ID/);
});
