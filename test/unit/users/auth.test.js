import test from "node:test";
import assert from "node:assert/strict";
import { query } from "../../../src/db/index.js";
import { registerUser, authenticateUser } from "../../../src/services/users.js";

async function resetDb() {
  await query("DELETE FROM sessions");
  await query("DELETE FROM users");
}

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
