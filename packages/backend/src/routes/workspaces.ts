import { Elysia, t } from "elysia";
import {
  getWorkspaces,
  addWorkspace,
  removeWorkspace,
  updateWorkspaceName,
  reorderWorkspaces,
} from "../services/workspaces";
import { configExists, expandPath } from "../services/config";
import { isUnlocked } from "../services/session";

export const workspacesRoutes = new Elysia({ prefix: "/workspaces" })
  .get("/", async () => {
    const workspaces = await getWorkspaces();

    // Enrich with status info
    const enriched = await Promise.all(
      workspaces.map(async (w) => {
        const exists = await configExists(w.path);
        const unlocked = isUnlocked(w.path);
        return {
          ...w,
          exists,
          unlocked,
        };
      })
    );

    return { success: true, workspaces: enriched };
  })
  .post(
    "/",
    async ({ body }) => {
      const expandedPath = expandPath(body.path);
      const workspaces = await addWorkspace(body.name, body.path);
      return { success: true, workspaces, addedPath: expandedPath };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        path: t.String({ minLength: 1 }),
      }),
    }
  )
  .delete(
    "/:path",
    async ({ params }) => {
      const path = decodeURIComponent(params.path);
      const workspaces = await removeWorkspace(path);
      return { success: true, workspaces };
    },
    {
      params: t.Object({
        path: t.String(),
      }),
    }
  )
  .put(
    "/:path/name",
    async ({ params, body }) => {
      const path = decodeURIComponent(params.path);
      const workspaces = await updateWorkspaceName(path, body.name);
      return { success: true, workspaces };
    },
    {
      params: t.Object({
        path: t.String(),
      }),
      body: t.Object({
        name: t.String({ minLength: 1 }),
      }),
    }
  )
  .put(
    "/reorder",
    async ({ body }) => {
      const workspaces = await reorderWorkspaces(body.paths);
      return { success: true, workspaces };
    },
    {
      body: t.Object({
        paths: t.Array(t.String()),
      }),
    }
  );
