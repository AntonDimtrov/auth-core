import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../../../src/server.js";
import { query } from "../../../src/db/index.js";
import { request } from "../../helpers/request.js";

test.beforeEach(async () => {
  await query("DELETE FROM sessions");
  await query("DELETE FROM users");
});

test("POST /api/register creates a new user", async () => {
  const server = createServer();
  const res = await request(server, "/api/register", "POST", {
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
    password: "Abc123!!",
  });

  assert.equal(res.status, 201);
  assert.ok(res.body.user.id);
});

test("POST /api/register returns 400 for invalid input", async () => {
  const server = createServer();
  const res = await request(server, "/api/register", "POST", {
    email: "bad",
    firstName: "Bad",
    lastName: "User",
    password: "123",
  });
  assert.equal(res.status, 400);
});
