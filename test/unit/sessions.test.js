import test from "node:test";
import assert from "node:assert/strict";
import { query } from "../../src/db/index.js";
import {
  createSession,
  deleteSession,
  getSession,
} from "../../src/services/sessions.js";
import { registerUser } from "../../src/services/users.js";

async function resetDb() {
  await query("DELETE FROM sessions");
  await query("DELETE FROM users");
}

test("createSession: creates a new session for a user", async () => {
  await resetDb();

  const user = await registerUser({
    email: "sess@example.com",
    firstName: "Sess",
    lastName: "User",
    password: "Abc123!!",
  });

  const session = await createSession(user.id);

  assert.ok(session.id, "session should have an id");
  assert.equal(session.user_id, user.id);

  const result = await query("SELECT * FROM sessions WHERE id = $1", [
    session.id,
  ]);
  assert.equal(result.rows.length, 1, "session should exist in DB");
});

test("deleteSession: removes an existing session", async () => {
  await resetDb();

  const user = await registerUser({
    email: "delete@example.com",
    firstName: "Del",
    lastName: "User",
    password: "Abc123!!",
  });

  const session = await createSession(user.id);

  const deleted = await deleteSession(session.id);
  assert.equal(deleted, true, "should return true for deleted session");

  const result = await query("SELECT * FROM sessions WHERE id = $1", [
    session.id,
  ]);
  assert.equal(result.rows.length, 0, "session should be gone");
});

test("deleteSession: returns false for missing session", async () => {
  await resetDb();

  const result = await deleteSession("nonexistent");
  assert.equal(result, false);
});

test("getSession: returns session and user info for valid id", async () => {
  await resetDb();

  const user = await registerUser({
    email: "info@example.com",
    firstName: "Info",
    lastName: "User",
    password: "Abc123!!",
  });

  const session = await createSession(user.id);
  const data = await getSession(session.id);

  assert.ok(data, "should return session info");
  assert.equal(data.user_id, user.id);
  assert.equal(data.email, "info@example.com");
  assert.equal(data.first_name, "Info");
});

test("getSession: returns null for invalid or expired id", async () => {
  await resetDb();

  const data = await getSession("invalid");
  assert.equal(data, null);
});
