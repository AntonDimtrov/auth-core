import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../../../src/server.js";
import { request } from "../../helpers/request.js";

test("GET /nonexistent returns 404", async () => {
  const server = createServer();
  const res = await request(server, "/nonexistent", "GET");
  assert.equal(res.status, 404);
});
