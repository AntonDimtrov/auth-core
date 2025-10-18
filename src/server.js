import http from "http";
import dotenv from "dotenv";
import { registerUser } from "./services/users.js";

dotenv.config();

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
      if (req.method === "POST" && req.url === "/api/register") {
        const data = await parseJSON(req);
        const user = await registerUser(data);
        sendJSON(res, 201, { user });
        return;
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
