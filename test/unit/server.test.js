import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../../src/server.js";
import { query } from "../../src/db/index.js";
import { request } from "../helpers/request.js";
import fs from "fs";
import path from "path";
import http from "http";

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

test("POST /api/login logs in and creates a session", async () => {
  const reg = createServer();
  await request(reg, "/api/register", "POST", {
    email: "login@example.com",
    firstName: "Log",
    lastName: "In",
    password: "Abc123!!",
  });

  const server = createServer();
  const res = await request(server, "/api/login", "POST", {
    email: "login@example.com",
    password: "Abc123!!",
  });

  assert.equal(res.status, 200);
  assert.ok(res.body.user.session_id);
});

test("POST /api/logout deletes an existing session", async () => {
  const reg = createServer();
  await request(reg, "/api/register", "POST", {
    email: "logout@example.com",
    firstName: "Out",
    lastName: "User",
    password: "Abc123!!",
  });
  const loginServer = createServer();
  const login = await request(loginServer, "/api/login", "POST", {
    email: "logout@example.com",
    password: "Abc123!!",
  });

  const token = login.body.user.session_id;

  const logoutServer = createServer();
  const res = await request(logoutServer, "/api/logout", "POST", { token });

  assert.equal(res.status, 200);
});

test("POST /api/update changes user's name and password", async () => {
  const reg = createServer();
  await request(reg, "/api/register", "POST", {
    email: "update@example.com",
    firstName: "Old",
    lastName: "Name",
    password: "Abc123!!",
  });

  const loginServer = createServer();
  const login = await request(loginServer, "/api/login", "POST", {
    email: "update@example.com",
    password: "Abc123!!",
  });
  const token = login.body.user.session_id;

  const updateServer = createServer();
  const res = await request(updateServer, "/api/update", "POST", {
    token,
    firstName: "New",
    lastName: "Name",
    password: "Newpass123!!",
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.user.first_name, "New");
  assert.equal(res.body.user.last_name, "Name");
});

test("POST /api/unknown returns 404", async () => {
  const server = createServer();
  const res = await request(server, "/api/unknown", "POST");
  assert.equal(res.status, 404);
});

test("returns 400 for invalid JSON body", async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  const resBody = await new Promise((resolve) => {
    const req = http.request(
      {
        method: "POST",
        port,
        path: "/api/register",
        headers: { "Content-Type": "application/json" },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      }
    );

    req.write("{ invalid json");
    req.end();
  });

  assert.match(resBody.error, /Invalid JSON/);
  server.close();
});

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

test("GET / serves index.html file", async () => {
  const indexPath = path.join(process.cwd(), "public", "index.html");
  fs.writeFileSync(indexPath, "<html>Hi</html>");

  const server = createServer();
  const res = await request(server, "/", "GET");

  assert.equal(res.status, 200);
  assert.match(res.body, /Hi/);

  fs.unlinkSync(indexPath);
});

test("GET /nonexistent returns 404", async () => {
  const server = createServer();
  const res = await request(server, "/nonexistent", "GET");
  assert.equal(res.status, 404);
});

test("GET /api/session returns 400 for invalid or expired token", async () => {
  const server = createServer();
  const res = await request(server, "/api/session?token=invalidtoken", "GET");

  assert.equal(res.status, 400);
  assert.match(res.body.error, /Invalid|expired/);
});
