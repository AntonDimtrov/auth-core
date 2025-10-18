import test from "node:test";
import assert from "node:assert/strict";
import http from "http";
import { createServer } from "../../src/server.js";
import { query } from "../../src/db/index.js";

async function request(server, path, method, body) {
  return new Promise((resolve) => {
    const listener = server.listen(0, () => {
      const { port } = listener.address();
      const data = JSON.stringify(body);
      const req = http.request(
        {
          hostname: "localhost",
          port,
          path,
          method,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
          },
        },
        (res) => {
          let result = "";
          res.on("data", (chunk) => (result += chunk));
          res.on("end", () => {
            server.close();
            resolve({ status: res.statusCode, body: JSON.parse(result) });
          });
        }
      );
      req.write(data);
      req.end();
    });
  });
}

test("POST /api/register creates new user", async () => {
  await query("DELETE FROM users");
  const server = createServer();

  const res = await request(server, "/api/register", "POST", {
    email: "apitest1@example.com",
    firstName: "Api",
    lastName: "User",
    password: "Abc123!!",
  });

  assert.equal(res.status, 201);
  assert.ok(res.body.user.id);
  assert.equal(res.body.user.email, "apitest1@example.com");
});

test("POST /api/register returns 400 on invalid input", async () => {
  const server = createServer();

  const res = await request(server, "/api/register", "POST", {
    email: "bad",
    firstName: "Bad",
    lastName: "User",
    password: "123",
  });

  assert.equal(res.status, 400);
});
