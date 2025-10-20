import test from "node:test";
import assert from "node:assert/strict";
import { query } from "../../../src/db/index.js";
import {
  registerUser,
  loginUser,
  getUserBySession,
} from "../../../src/services/users.js";

async function resetDb() {
  await query("DELETE FROM sessions");
  await query("DELETE FROM users");
}

test("getUserBySession: returns user for valid session", async () => {
  await resetDb();

  const email = "session@example.com";
  const password = "Abc123!!";

  await registerUser({
    email,
    firstName: "Sess",
    lastName: "Ion",
    password,
  });

  const user = await loginUser({ email, password });
  const sessionUser = await getUserBySession(user.session_id);

  assert.ok(sessionUser, "should return user for valid session");
  assert.equal(sessionUser.email, email);
});

test("getUserBySession: returns null for invalid or expired session", async () => {
  await resetDb();

  const result = await getUserBySession("invalidtoken");
  assert.equal(result, null);
});
