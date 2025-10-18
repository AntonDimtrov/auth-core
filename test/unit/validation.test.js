import test from "node:test";
import assert from "node:assert/strict";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../../src/services/validation.js";

test("validateEmail works", () => {
  assert.ok(validateEmail("user@example.com"));
  assert.ok(!validateEmail("bademail"));
  assert.ok(!validateEmail("user@"));
  assert.ok(!validateEmail(""));
});

test("validateName works", () => {
  assert.ok(validateName("Anton Dimitrov"));
  assert.ok(validateName("Telebid"));
  assert.ok(!validateName(""));
  assert.ok(!validateName("A"));
  assert.ok(!validateName("User123"));
});

test("validatePassword works", () => {
  assert.ok(validatePassword("Abcdef12!"));
  assert.ok(!validatePassword("short"));
  assert.ok(!validatePassword("abcdefghi"));
  assert.ok(!validatePassword("AAAAAAAA"));
});

test("validation returns false for non-string inputs", () => {
  assert.equal(validateEmail(123), false);
  assert.equal(validateName(null), false);
  assert.equal(validatePassword(undefined), false);
});
