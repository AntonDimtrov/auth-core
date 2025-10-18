import test from "node:test";
import assert from "node:assert/strict";
import { query, getClient } from "../../src/db/index.js";

test("query returns expected result", async () => {
  const res = await query("SELECT 1 AS num");
  assert.equal(res.rows[0].num, 1);
});

test("getClient returns and releases connection", async () => {
  const client = await getClient();
  const res = await client.query("SELECT 2 AS val");
  assert.equal(res.rows[0].val, 2);
  client.release();
});
