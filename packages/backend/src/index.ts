import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./routes/auth";
import { connectionRoutes } from "./routes/connections";
import { browseRoutes } from "./routes/browse";
import { fileRoutes, downloadRoutes, fileMetaRoutes } from "./routes/files";

const app = new Elysia()
  .use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }))
  .get("/health", () => ({ status: "ok", timestamp: Date.now() }))
  .use(authRoutes)
  .use(connectionRoutes)
  .use(browseRoutes)
  .use(fileRoutes)
  .use(downloadRoutes)
  .use(fileMetaRoutes)
  .listen(3333);

console.log(`🦊 Backend running at http://localhost:${app.server?.port}`);

export type App = typeof app;
