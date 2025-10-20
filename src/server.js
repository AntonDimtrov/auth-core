import http from "http";
import dotenv from "dotenv";
import { registerUser, loginUser, logoutUser } from "./services/users.js";
import { updateUserProfile } from "./services/profile.js";
import { getSession } from "./services/sessions.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "../public");

function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url.startsWith("/api/session")) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get("token");

        if (!token) {
          sendJSON(res, 400, { error: "Missing token" });
          return;
        }

        try {
          const session = await getSession(token);
          if (!session) {
            sendJSON(res, 400, { error: "Invalid or expired session" });
            return;
          }

          sendJSON(res, 200, {
            user: {
              id: session.user_id,
              email: session.email,
              first_name: session.first_name,
              last_name: session.last_name,
            },
          });
        } catch (err) {
          sendJSON(res, 400, { error: err.message });
        }
        return;
      }

      if (req.method === "POST" && req.url === "/api/register") {
        const data = await parseJSON(req);
        const user = await registerUser(data);
        sendJSON(res, 201, { user });
        return;
      }

      if (req.method === "POST" && req.url === "/api/login") {
        const data = await parseJSON(req);
        const user = await loginUser(data);
        sendJSON(res, 200, { user });
        return;
      }

      if (req.method === "POST" && req.url === "/api/logout") {
        const data = await parseJSON(req);
        const result = await logoutUser(data.token);
        sendJSON(res, 200, result);
        return;
      }

      if (req.method === "POST" && req.url === "/api/login") {
        const data = await parseJSON(req);
        const result = await loginUser(data.email, data.password);
        sendJSON(res, 200, result);
        return;
      }

      if (req.method === "POST" && req.url === "/api/update") {
        const data = await parseJSON(req);
        const updated = await updateUserProfile(data.token, data);
        sendJSON(res, 200, { user: updated });
        return;
      }

      if (req.method === "GET") {
        const filePath =
          req.url === "/"
            ? path.join(publicPath, "index.html")
            : path.join(publicPath, req.url);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const contentTypes = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "text/javascript",
          };
          const contentType = contentTypes[ext] || "text/plain";

          res.writeHead(200, { "Content-Type": contentType });
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }

      sendJSON(res, 404, { error: "Not found" });
    } catch (err) {
      console.error(err);
      sendJSON(res, 400, { error: err.message || "Bad request" });
    }
  });
}

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 8080;
  const server = createServer();
  server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}
