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
  // Video
  mp4: "video/mp4",
  webm: "video/webm",
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

// Reverse mapping: content type to extension (for files without extensions)
const EXTENSION_FROM_CONTENT_TYPE: Record<string, string> = {
  // Images
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  // Video
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-msvideo": "avi",
  "video/x-matroska": "mkv",
  // Audio
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/flac": "flac",
  "audio/aac": "aac",
  // Text
  "text/plain": "txt",
  "application/json": "json",
  "text/markdown": "md",
  "text/yaml": "yaml",
  "application/xml": "xml",
  "text/xml": "xml",
  "text/csv": "csv",
  // Documents
  "application/pdf": "pdf",
  "text/html": "html",
  "text/css": "css",
  "application/javascript": "js",
  "text/javascript": "js",
  // Archives
  "application/zip": "zip",
  "application/gzip": "gz",
  "application/x-tar": "tar",
  "application/x-7z-compressed": "7z",
  "application/x-rar-compressed": "rar",
};

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
const TEXT_EXTENSIONS = ["txt", "json", "md", "yaml", "yml", "xml", "csv", "log"];
const VIDEO_EXTENSIONS = ["mp4", "webm"];

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
  // Preview endpoint - with size limits and range support for video
  .get(
    "/:connId/*",
    async ({ params, set, request }) => {
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
        // Use actual content type from S3, fall back to extension-based
        const contentType = stat.type || getContentType(path);

        // Determine file type from extension or content-type
        const isImage = IMAGE_EXTENSIONS.includes(ext) || contentType.startsWith("image/");
        const isText = TEXT_EXTENSIONS.includes(ext) || contentType.startsWith("text/") || contentType === "application/json";
        const isVideo = VIDEO_EXTENSIONS.includes(ext) || contentType.startsWith("video/");

        // Check size limits for preview (not for video - it streams)
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

        // Handle Range requests for video streaming
        const rangeHeader = request.headers.get("Range");
        if (isVideo && rangeHeader) {
          // Get presigned URL and proxy the range request
          const presignedUrl = file.presign({ expiresIn: 3600 });
          const s3Response = await fetch(presignedUrl, {
            headers: { Range: rangeHeader },
          });

          // Forward the S3 response with proper headers
          return new Response(s3Response.body, {
            status: s3Response.status,
            headers: {
              "Content-Type": contentType,
              "Content-Length": s3Response.headers.get("Content-Length") || "",
              "Content-Range": s3Response.headers.get("Content-Range") || "",
              "Accept-Ranges": "bytes",
            },
          });
        }

        // For video without Range, still indicate Range support
        if (isVideo) {
          return new Response(file.stream(), {
            headers: {
              "Content-Type": contentType,
              "Content-Length": String(stat.size),
              "Accept-Ranges": "bytes",
              "Cache-Control": "private, max-age=300",
            },
          });
        }

        // Stream the file (non-video)
        return new Response(file.stream(), {
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(stat.size),
            "Cache-Control": "private, max-age=300",
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
        let filename = getFilename(path);
        // Use actual content type from S3, fall back to extension-based
        const contentType = stat.type || getContentType(path);

        // If filename has no extension, add one based on content type
        const ext = getExtension(filename);
        if (!ext && contentType && EXTENSION_FROM_CONTENT_TYPE[contentType]) {
          filename = `${filename}.${EXTENSION_FROM_CONTENT_TYPE[contentType]}`;
        }

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
        const contentType = stat.type || getContentType(path);

        // Determine preview type from extension first, then fall back to content-type
        const getPreviewType = (): "image" | "text" | "video" | null => {
          if (IMAGE_EXTENSIONS.includes(ext)) return "image";
          if (TEXT_EXTENSIONS.includes(ext)) return "text";
          if (VIDEO_EXTENSIONS.includes(ext)) return "video";
          // Fall back to content-type detection for files without extensions
          if (contentType.startsWith("image/")) return "image";
          if (contentType.startsWith("text/") || contentType === "application/json") return "text";
          if (contentType.startsWith("video/")) return "video";
          return null;
        };

        const previewType = getPreviewType();

        return {
          success: true,
          metadata: {
            key: path,
            name: getFilename(path),
            size: stat.size,
            lastModified: stat.lastModified,
            contentType,
            etag: stat.etag,
            isPreviewable: previewType !== null,
            previewType,
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
