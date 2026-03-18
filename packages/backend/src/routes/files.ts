import { Elysia } from "elysia";
import { getS3Client, getConnection, isUnlocked } from "../services/session";

// Middleware to check if unlocked
const requireUnlocked = new Elysia().derive(() => {
  if (!isUnlocked()) {
    throw new Error("NOT_UNLOCKED");
  }
  return {};
});

// Content type mapping
const CONTENT_TYPES: Record<string, string> = {
  // Images
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  // Text
  txt: "text/plain",
  json: "application/json",
  md: "text/markdown",
  yaml: "text/yaml",
  yml: "text/yaml",
  xml: "application/xml",
  csv: "text/csv",
  log: "text/plain",
  // Other
  pdf: "application/pdf",
  html: "text/html",
  css: "text/css",
  js: "application/javascript",
};

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
const TEXT_EXTENSIONS = ["txt", "json", "md", "yaml", "yml", "xml", "csv", "log"];

const MAX_IMAGE_PREVIEW_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_PREVIEW_SIZE = 1 * 1024 * 1024; // 1MB

function getExtension(path: string): string {
  const parts = path.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function getContentType(path: string): string {
  const ext = getExtension(path);
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

function getFilename(path: string): string {
  return path.split("/").pop() || path;
}

export const fileRoutes = new Elysia({ prefix: "/file" })
  .use(requireUnlocked)
  .onError(({ error }) => {
    if (error instanceof Error && error.message === "NOT_UNLOCKED") {
      return new Response(JSON.stringify({ error: "NOT_UNLOCKED" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw error;
  })
  // Preview endpoint - with size limits
  .get(
    "/:connId/*",
    async ({ params, set }) => {
      const connection = getConnection(params.connId);
      if (!connection) {
        set.status = 404;
        return { error: "Connection not found" };
      }

      const path = params["*"];
      if (!path) {
        set.status = 400;
        return { error: "Path required" };
      }

      try {
        const client = getS3Client(params.connId);
        const file = client.file(path);

        // Check if file exists and get size
        const stat = await file.stat();
        const ext = getExtension(path);
        const isImage = IMAGE_EXTENSIONS.includes(ext);
        const isText = TEXT_EXTENSIONS.includes(ext);

        // Check size limits for preview
        if (isImage && stat.size > MAX_IMAGE_PREVIEW_SIZE) {
          set.status = 413;
          return {
            error: "FILE_TOO_LARGE",
            message: "Image exceeds 10MB preview limit",
            size: stat.size,
          };
        }

        if (isText && stat.size > MAX_TEXT_PREVIEW_SIZE) {
          set.status = 413;
          return {
            error: "FILE_TOO_LARGE",
            message: "Text file exceeds 1MB preview limit",
            size: stat.size,
          };
        }

        // Stream the file
        const stream = file.stream();
        const contentType = getContentType(path);

        set.headers["Content-Type"] = contentType;
        set.headers["Content-Length"] = String(stat.size);
        set.headers["Cache-Control"] = "private, max-age=300";

        return new Response(stream, {
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(stat.size),
          },
        });
      } catch (error) {
        set.status = 500;
        return {
          error: "FETCH_FAILED",
          message: error instanceof Error ? error.message : "Failed to fetch file",
        };
      }
    }
  );

// Download endpoint - separate for Content-Disposition
export const downloadRoutes = new Elysia({ prefix: "/download" })
  .use(requireUnlocked)
  .onError(({ error }) => {
    if (error instanceof Error && error.message === "NOT_UNLOCKED") {
      return new Response(JSON.stringify({ error: "NOT_UNLOCKED" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw error;
  })
  .get(
    "/:connId/*",
    async ({ params, set }) => {
      const connection = getConnection(params.connId);
      if (!connection) {
        set.status = 404;
        return { error: "Connection not found" };
      }

      const path = params["*"];
      if (!path) {
        set.status = 400;
        return { error: "Path required" };
      }

      try {
        const client = getS3Client(params.connId);
        const file = client.file(path);

        // Check if file exists
        const exists = await file.exists();
        if (!exists) {
          set.status = 404;
          return { error: "File not found" };
        }

        const stat = await file.stat();
        const filename = getFilename(path);
        const contentType = getContentType(path);

        // Stream the file with download headers
        const stream = file.stream();

        return new Response(stream, {
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(stat.size),
            "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          },
        });
      } catch (error) {
        set.status = 500;
        return {
          error: "DOWNLOAD_FAILED",
          message: error instanceof Error ? error.message : "Failed to download file",
        };
      }
    }
  );

// File metadata endpoint
export const fileMetaRoutes = new Elysia({ prefix: "/file-meta" })
  .use(requireUnlocked)
  .onError(({ error }) => {
    if (error instanceof Error && error.message === "NOT_UNLOCKED") {
      return {
        success: false,
        error: "NOT_UNLOCKED",
        message: "Must unlock before accessing files",
      };
    }
    throw error;
  })
  .get(
    "/:connId/*",
    async ({ params }) => {
      const connection = getConnection(params.connId);
      if (!connection) {
        return {
          success: false,
          error: "NOT_FOUND",
          message: "Connection not found",
        };
      }

      const path = params["*"];
      if (!path) {
        return {
          success: false,
          error: "BAD_REQUEST",
          message: "Path required",
        };
      }

      try {
        const client = getS3Client(params.connId);
        const file = client.file(path);

        const stat = await file.stat();
        const ext = getExtension(path);

        return {
          success: true,
          metadata: {
            key: path,
            name: getFilename(path),
            size: stat.size,
            lastModified: stat.lastModified,
            contentType: stat.type || getContentType(path),
            etag: stat.etag,
            isPreviewable:
              IMAGE_EXTENSIONS.includes(ext) || TEXT_EXTENSIONS.includes(ext),
            previewType: IMAGE_EXTENSIONS.includes(ext)
              ? "image"
              : TEXT_EXTENSIONS.includes(ext)
              ? "text"
              : null,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: "FETCH_FAILED",
          message: error instanceof Error ? error.message : "Failed to get file metadata",
        };
      }
    }
  );
