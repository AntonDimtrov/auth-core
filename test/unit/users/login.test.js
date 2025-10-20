import test from "node:test";
import assert from "node:assert/strict";
import { query } from "../../../src/db/index.js";
import { registerUser, loginUser } from "../../../src/services/users.js";

async function resetDb() {
  await query("DELETE FROM sessions");
  await query("DELETE FROM users");
}

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
