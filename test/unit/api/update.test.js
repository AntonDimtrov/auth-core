import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../../../src/server.js";
import { request } from "../../helpers/request.js";

test("POST /api/update changes user's name and password", async () => {
  const reg = createServer();
  await request(reg, "/api/register", "POST", {
    email: "update@example.com",
    firstName: "Old",
    lastName: "Name",
    password: "Abc123!!",
  });

  const loginServer = createServer();
  const login = await request(loginServer, "/api/login", "POST", {
    email: "update@example.com",
    password: "Abc123!!",
  });
  const token = login.body.user.session_id;

  const updateServer = createServer();
  const res = await request(updateServer, "/api/update", "POST", {
    token,
    firstName: "New",
    lastName: "Name",
    password: "Newpass123!!",
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.user.first_name, "New");
  assert.equal(res.body.user.last_name, "Name");
});
