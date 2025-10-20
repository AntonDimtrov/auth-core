import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../../../src/server.js";
import http from "http";

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
