import test from "node:test";
import assert from "node:assert/strict";
import { query } from "../../src/db/index.js";
import { registerUser, loginUser } from "../../src/services/users.js";
import { updateUserProfile } from "../../src/services/profile.js";

async function resetDb() {
  await query("DELETE FROM sessions");
  await query("DELETE FROM users");
}

test("POST /api/update changes user's name and password", async () => {
  await resetDb();

  const plainPassword = "Abc123!!";

  const user = await registerUser({
    email: "profile@example.com",
    firstName: "Old",
    lastName: "Name",
    password: plainPassword,
  });

  const { session_id } = await loginUser({
    email: user.email,
    password: plainPassword,
  });
  assert.ok(session_id, "Should return a valid session_id");

  const updated = await updateUserProfile(session_id, {
    firstName: "New",
    lastName: "Name",
    password: "Newpass123!!",
  });

  assert.equal(updated.first_name, "New");
  assert.equal(updated.last_name, "Name");

  const check = await query(
    "SELECT first_name, last_name FROM users WHERE id = $1",
    [user.id]
  );
  assert.deepEqual(check.rows[0], { first_name: "New", last_name: "Name" });
});

test("POST /api/update rejects invalid session", async () => {
  await resetDb();

  await assert.rejects(
    updateUserProfile("invalid_session", { firstName: "X" }),
    /Invalid or expired session/
  );
});

test("POST /api/update rejects invalid name or password", async () => {
  await resetDb();

  const { session_id } = await loginUser({
    email: "badupdate@example.com",
    password: "Abc123!!",
  });

  await assert.rejects(
    updateUserProfile(session_id, { firstName: "x" }),
    /Invalid name/
  );

  await assert.rejects(
    updateUserProfile(session_id, { password: "123" }),
    /Invalid password/
  );
});

test("POST /api/update rejects when no valid fields given", async () => {
  await resetDb();

  const plainPassword = "Abc123!!";

  const user = await registerUser({
    email: "emptyupdate@example.com",
    firstName: "Good",
    lastName: "User",
    password: plainPassword,
  });

  const { session_id } = await loginUser({
    email: user.email,
    password: plainPassword,
  });

  await assert.rejects(
    updateUserProfile(session_id, {}),
    /No valid fields to update/
  );
});
