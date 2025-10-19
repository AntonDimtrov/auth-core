import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
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

test("hashPassword rejects when scrypt throws", async () => {
  const original = crypto.scrypt;
  crypto.scrypt = (_pw, _salt, _len, cb) => cb(new Error("scrypt fail"));

  await assert.rejects(hashPassword("x"), /scrypt fail/);

  crypto.scrypt = original;
});

test("verifyPassword rejects when scrypt throws", async () => {
  const original = crypto.scrypt;
  crypto.scrypt = (_pw, _salt, _len, cb) => cb(new Error("oops"));

  await assert.rejects(verifyPassword("x", "someHash", "someSalt"), /oops/);

  crypto.scrypt = original;
});
