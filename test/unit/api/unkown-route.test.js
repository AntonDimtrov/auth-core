import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../../../src/server.js";
import { request } from "../../helpers/request.js";

test("POST /api/unknown returns 404", async () => {
  const server = createServer();
  const res = await request(server, "/api/unknown", "POST");
  assert.equal(res.status, 404);
});
