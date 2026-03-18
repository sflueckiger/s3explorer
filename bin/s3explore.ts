#!/usr/bin/env bun

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "../packages/backend/src/routes/auth";
import { connectionRoutes } from "../packages/backend/src/routes/connections";
import { browseRoutes } from "../packages/backend/src/routes/browse";
import { fileRoutes, downloadRoutes, fileMetaRoutes } from "../packages/backend/src/routes/files";
import { workspacesRoutes } from "../packages/backend/src/routes/workspaces";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = resolve(__dirname, "../packages/frontend/dist");

async function findAvailablePort(startPort: number): Promise<number> {
  const maxAttempts = 100;

  for (let port = startPort; port < startPort + maxAttempts; port++) {
    try {
      const server = Bun.serve({
        port,
        fetch: () => new Response("test"),
      });
      server.stop();
      return port;
    } catch {
      // Port in use, try next
    }
  }

  throw new Error(`Could not find available port between ${startPort} and ${startPort + maxAttempts}`);
}

async function openBrowser(url: string) {
  const { platform } = process;
  const command = platform === "darwin"
    ? ["open", url]
    : platform === "win32"
    ? ["cmd", "/c", "start", url]
    : ["xdg-open", url];

  try {
    Bun.spawn(command, { stdout: "ignore", stderr: "ignore" });
  } catch {
    // Silently fail if browser can't be opened
  }
}

async function main() {
  const defaultPort = 3333;
  const port = await findAvailablePort(defaultPort);

  const app = new Elysia()
    .use(cors({
      origin: true,
      credentials: true,
    }))
    .get("/health", () => ({ status: "ok", timestamp: Date.now() }))
    .use(authRoutes)
    .use(workspacesRoutes)
    .use(connectionRoutes)
    .use(browseRoutes)
    .use(fileRoutes)
    .use(downloadRoutes)
    .use(fileMetaRoutes)
    // Serve static assets
    .get("/assets/*", async ({ params }) => {
      const filePath = resolve(distPath, "assets", params["*"]);
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return file;
      }
      return new Response("Not found", { status: 404 });
    })
    .get("/vite.svg", async () => {
      const file = Bun.file(resolve(distPath, "vite.svg"));
      if (await file.exists()) return file;
      return new Response("", { status: 404 });
    })
    // SPA fallback - serve index.html for all other routes
    .get("*", () => Bun.file(resolve(distPath, "index.html")))
    .listen(port);

  const url = `http://localhost:${port}`;

  console.log(`
  ╭─────────────────────────────────────╮
  │                                     │
  │   S3 Explorer is running!           │
  │                                     │
  │   ${url.padEnd(28)}   │
  │                                     │
  ╰─────────────────────────────────────╯
  `);

  // Auto-open browser
  await openBrowser(url);
}

main().catch((error) => {
  console.error("Failed to start S3 Explorer:", error);
  process.exit(1);
});
