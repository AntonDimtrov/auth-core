import test from "node:test";
import assert from "node:assert/strict";
import { query } from "../../../src/db/index.js";
import { registerUser } from "../../../src/services/users.js";

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
