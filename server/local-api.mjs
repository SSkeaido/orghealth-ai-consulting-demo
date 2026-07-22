import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import handler from "../api/analyze.mjs";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const port = Number(process.env.LOCAL_API_PORT || 8787);

createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  if (request.url !== "/api/analyze") {
    response.statusCode = 404;
    response.end(JSON.stringify({ error: "not_found" }));
    return;
  }

  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 20_000) {
      response.statusCode = 413;
      response.end(JSON.stringify({ error: "payload_too_large" }));
      request.destroy();
      return;
    }
  }

  try {
    request.body = raw ? JSON.parse(raw) : {};
  } catch {
    response.statusCode = 400;
    response.end(JSON.stringify({ error: "invalid_json" }));
    return;
  }

  response.status = (code) => {
    response.statusCode = code;
    return response;
  };
  response.json = (value) => response.end(JSON.stringify(value));
  await handler(request, response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Local semantic API: http://127.0.0.1:${port}/api/analyze`);
});

