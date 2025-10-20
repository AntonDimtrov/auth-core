import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../../../src/server.js";
import { request } from "../../helpers/request.js";

test("GET /api/session returns user for valid token", async () => {
  const reg = createServer();
  await request(reg, "/api/register", "POST", {
    email: "session@example.com",
    firstName: "Sess",
    lastName: "User",
    password: "Abc123!!",
  });

  const loginServer = createServer();
  const login = await request(loginServer, "/api/login", "POST", {
    email: "session@example.com",
    password: "Abc123!!",
  });
  const token = login.body.user.session_id;

  const server = createServer();
  const res = await request(server, `/api/session?token=${token}`, "GET");
  assert.equal(res.status, 200);
  assert.equal(res.body.user.email, "session@example.com");
});

test("GET /api/session returns 400 for missing token", async () => {
  const server = createServer();
  const res = await request(server, "/api/session", "GET");
  assert.equal(res.status, 400);
  assert.match(res.body.error, /Missing token/);
});

test("GET /api/session returns 400 for invalid token", async () => {
  const server = createServer();
  const res = await request(server, "/api/session?token=badtoken", "GET");
  assert.equal(res.status, 400);
});
