import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3100);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

function resolveAsset(urlPath) {
  if (urlPath === "/") {
    return path.join(rootDir, "index.html");
  }

  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  return path.join(rootDir, safePath);
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    response.writeHead(400).end("Missing URL");
    return;
  }

  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("ok");
    return;
  }

  const assetPath = resolveAsset(new URL(request.url, `http://127.0.0.1:${port}`).pathname);

  if (!existsSync(assetPath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const assetStat = await stat(assetPath);
  const extension = path.extname(assetPath);

  response.writeHead(200, {
    "content-length": assetStat.size,
    "content-type": mimeTypes[extension] || "application/octet-stream",
  });

  createReadStream(assetPath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`checkout demo listening on http://127.0.0.1:${port}`);
});
