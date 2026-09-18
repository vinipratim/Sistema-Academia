const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const PROFESSOR_PASSWORD = process.env.PROFESSOR_PASSWORD || "admin123";
const SESSION_TOKEN = crypto.randomBytes(32).toString("hex");
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const STATE_FILE = path.join(DATA_DIR, "app-state.json");
const PUBLIC_FILES = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/styles.css", "styles.css"],
  ["/app.js", "app.js"],
]);
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

fs.mkdirSync(DATA_DIR, { recursive: true });

const server = http.createServer(async (request, response) => {
  try {
    if (request.url === "/api/login" && request.method === "POST") {
      const body = await readBody(request);
      const credentials = JSON.parse(body || "{}");

      if (credentials.password === PROFESSOR_PASSWORD) {
        return sendJson(response, { token: SESSION_TOKEN });
      }

      return sendJson(response, { error: "Senha invalida" }, 401);
    }

    if (request.url === "/api/state" && request.method === "GET") {
      if (!isAuthenticated(request)) return sendJson(response, { error: "Nao autenticado" }, 401);
      return sendJson(response, readState());
    }

    if (request.url === "/api/state" && request.method === "PUT") {
      if (!isAuthenticated(request)) return sendJson(response, { error: "Nao autenticado" }, 401);
      const body = await readBody(request);
      const state = JSON.parse(body || "{}");
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
      return sendJson(response, { ok: true });
    }

    if (request.method === "GET" && PUBLIC_FILES.has(request.url)) {
      return sendFile(response, PUBLIC_FILES.get(request.url));
    }

    sendJson(response, { error: "Not found" }, 404);
  } catch (error) {
    sendJson(response, { error: error.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`Sistema Academia em http://localhost:${PORT}`);
  console.log("Senha do professor: use PROFESSOR_PASSWORD para alterar.");
});

function isAuthenticated(request) {
  const authorization = request.headers.authorization || "";
  return authorization === `Bearer ${SESSION_TOKEN}`;
}

function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        request.destroy();
        reject(new Error("Payload muito grande"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendFile(response, filename) {
  const filePath = path.join(ROOT, filename);
  const extension = path.extname(filename);

  response.writeHead(200, { "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
}

function sendJson(response, data, status = 200) {
  response.writeHead(status, { "Content-Type": CONTENT_TYPES[".json"] });
  response.end(JSON.stringify(data));
}
