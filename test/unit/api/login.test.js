import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../../../src/server.js";
import { request } from "../../helpers/request.js";

test("POST /api/login logs in and creates a session", async () => {
  const reg = createServer();
  await request(reg, "/api/register", "POST", {
    email: "login@example.com",
    firstName: "Log",
    lastName: "In",
    password: "Abc123!!",
  });

  const server = createServer();
  const res = await request(server, "/api/login", "POST", {
    email: "login@example.com",
    password: "Abc123!!",
  });

  assert.equal(res.status, 200);
  assert.ok(res.body.user.session_id);
});
