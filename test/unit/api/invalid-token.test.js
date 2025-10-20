import test from "node:test";
import assert from "node:assert/strict";
import { request } from "../../helpers/request.js";
import { createServer } from "../../../src/server.js";

test("GET /api/session returns 400 for invalid or expired token", async () => {
  const server = createServer();
  const res = await request(server, "/api/session?token=invalidtoken", "GET");

  assert.equal(res.status, 400);
  assert.match(res.body.error, /Invalid|expired/);
});
