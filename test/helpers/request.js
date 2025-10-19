import http from "http";

async function request(server, path, method = "POST", body = {}) {
  return new Promise((resolve, reject) => {
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
            listener.close();
            try {
              const parsed = JSON.parse(result);
              resolve({ status: res.statusCode, body: parsed });
            } catch {
              resolve({ status: res.statusCode, body: result });
            }
          });
        }
      );

      req.on("error", reject);
      req.write(data);
      req.end();
    });
  });
}

export { request };
