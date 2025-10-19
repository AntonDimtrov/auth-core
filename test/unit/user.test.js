// test/unit/users.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { query } from "../../src/db/index.js";
import {
  registerUser,
  authenticateUser,
  loginUser,
  logoutUser,
  getUserBySession,
} from "../../src/services/users.js";

async function resetDb() {
  await query("DELETE FROM sessions");
  await query("DELETE FROM users");
}

test("registerUser: creates a new user successfully", async () => {
  await resetDb();

  const user = await registerUser({
    email: "anton@example.com",
    firstName: "Anton",
    lastName: "Dimitrov",
    password: "Abc123!!",
  });

  assert.ok(user.id, "should return user with id");
  assert.equal(user.email, "anton@example.com");
  assert.equal(user.first_name, "Anton");
  assert.equal(user.last_name, "Dimitrov");

  const result = await query("SELECT * FROM users WHERE id = $1", [user.id]);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].email, "anton@example.com");
});

test("registerUser: rejects invalid input (bad email)", async () => {
  await resetDb();

  await assert.rejects(
    registerUser({
      email: "bademail",
      firstName: "Bad",
      lastName: "Mail",
      password: "Abc123!!",
    }),
    /Invalid input/
  );
});

test("registerUser: rejects invalid input (bad password)", async () => {
  await resetDb();

  await assert.rejects(
    registerUser({
      email: "ok@example.com",
      firstName: "Telebid",
      lastName: "Pro",
      password: "weak",
    }),
    /Invalid input/
  );
});

test("registerUser: prevents duplicate emails", async () => {
  await resetDb();

  await registerUser({
    email: "email@example.com",
    firstName: "Anna",
    lastName: "Smith",
    password: "Abc123!!",
  });

  await assert.rejects(
    registerUser({
      email: "email@example.com",
      firstName: "Anna",
      lastName: "Smith",
      password: "Abc123!!",
    }),
    /already registered/
  );
});

test("authenticateUser: returns user for correct credentials", async () => {
  await resetDb();

  const email = "login@example.com";
  const password = "Abc123!!";

  await registerUser({
    email,
    firstName: "Ivan",
    lastName: "Dimitrov",
    password,
  });

  const user = await authenticateUser(email, password);
  assert.ok(user, "should return user");
  assert.equal(user.email, email);
  assert.equal(user.first_name, "Ivan");
  assert.equal(user.last_name, "Dimitrov");
});

test("authenticateUser: returns null for wrong password", async () => {
  await resetDb();

  const email = "wrong@example.com";
  await registerUser({
    email,
    firstName: "Petar",
    lastName: "Bonev",
    password: "Abc123!!",
  });

  const result = await authenticateUser(email, "wrongpassword");
  assert.equal(result, null);
});

test("authenticateUser: returns null for non-existing email", async () => {
  await resetDb();

  const result = await authenticateUser("missing@example.com", "Abc123!!");
  assert.equal(result, null);
});

test("loginUser: creates a new session and returns session_id", async () => {
  await resetDb();

  const email = "anton@login.com";
  const password = "Abc123!!";

  await registerUser({
    email,
    firstName: "Anton",
    lastName: "Login",
    password,
  });

  const user = await loginUser({ email, password });

  assert.ok(user.session_id, "should return a session_id");
  const sessionCheck = await query("SELECT * FROM sessions WHERE id = $1", [
    user.session_id,
  ]);
  assert.equal(sessionCheck.rows.length, 1, "session should be stored in DB");
  assert.equal(sessionCheck.rows[0].user_id, user.id);
});

test("loginUser: rejects invalid credentials", async () => {
  await resetDb();

  await registerUser({
    email: "fail@login.com",
    firstName: "Fail",
    lastName: "Login",
    password: "Abc123!!",
  });

  await assert.rejects(
    loginUser({ email: "fail@login.com", password: "WrongPass123" }),
    /Invalid email or password/
  );
});

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
