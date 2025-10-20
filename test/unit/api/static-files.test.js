import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../../../src/server.js";
import fs from "fs";
import path from "path";
import { request } from "../../helpers/request.js";

test("GET / serves index.html file", async () => {
  const indexPath = path.join(process.cwd(), "public", "index.html");
  fs.writeFileSync(indexPath, "<html>Hi</html>");

  const server = createServer();
  const res = await request(server, "/", "GET");

  assert.equal(res.status, 200);
  assert.match(res.body, /Hi/);

  fs.unlinkSync(indexPath);
});
