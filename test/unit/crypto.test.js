import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../../src/services/crypto.js";

test("hashPassword and verifyPassword work", async () => {
  const password = "Abc123!!";
  const { hash, salt } = await hashPassword(password);

  assert.ok(hash.length > 0);
  assert.ok(salt.length > 0);

  const ok = await verifyPassword(password, hash, salt);
  assert.ok(ok);

  const bad = await verifyPassword("wrong", hash, salt);
  assert.ok(!bad);
});
