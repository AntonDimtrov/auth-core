import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../../../src/server.js";
import { request } from "../../helpers/request.js";

test("POST /api/logout deletes an existing session", async () => {
  const reg = createServer();
  await request(reg, "/api/register", "POST", {
    email: "logout@example.com",
    firstName: "Out",
    lastName: "User",
    password: "Abc123!!",
  });

  const loginServer = createServer();
  const login = await request(loginServer, "/api/login", "POST", {
    email: "logout@example.com",
    password: "Abc123!!",
  });

  const token = login.body.user.session_id;

  const logoutServer = createServer();
  const res = await request(logoutServer, "/api/logout", "POST", { token });

  assert.equal(res.status, 200);
});
