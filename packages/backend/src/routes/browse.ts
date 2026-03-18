import { Elysia, t } from "elysia";
import { getS3Client, getConnection, isUnlocked } from "../services/session";

// Middleware to check if unlocked
const requireUnlocked = new Elysia().derive(() => {
  if (!isUnlocked()) {
    throw new Error("NOT_UNLOCKED");
  }
  return {};
});

interface S3Object {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  etag?: string;
}

interface S3Folder {
  prefix: string;
  name: string;
}

interface BrowseResult {
  folders: S3Folder[];
  files: S3Object[];
  isTruncated: boolean;
  nextContinuationToken?: string;
  prefix: string;
}

export const browseRoutes = new Elysia({ prefix: "/browse" })
  .use(requireUnlocked)
  .onError(({ error }) => {
    if (error instanceof Error && error.message === "NOT_UNLOCKED") {
      return {
        success: false,
        error: "NOT_UNLOCKED",
        message: "Must unlock before browsing",
      };
    }
    throw error;
  })
  .get(
    "/:connId",
    async ({ params, query }) => {
      const connection = getConnection(params.connId);
      if (!connection) {
        return {
          success: false,
          error: "NOT_FOUND",
          message: "Connection not found",
        };
      }

      try {
        const client = getS3Client(params.connId);
        const prefix = query.prefix || "";
        const delimiter = "/";

        const result = await client.list({
          prefix,
          delimiter,
          maxKeys: query.maxKeys ? parseInt(query.maxKeys, 10) : 1000,
          startAfter: query.startAfter,
        });

        // Process folders (common prefixes)
        const folders: S3Folder[] = (result.commonPrefixes || []).map((cp) => {
          const prefixStr = typeof cp === "string" ? cp : cp.prefix || "";
          // Remove the current prefix and trailing slash to get folder name
          const name = prefixStr.slice(prefix.length).replace(/\/$/, "");
          return {
            prefix: prefixStr,
            name,
          };
        });

        // Process files
        const files: S3Object[] = (result.contents || [])
          .filter((obj) => {
            // Filter out the prefix itself (S3 sometimes includes it)
            const key = obj.key || "";
            return key !== prefix && !key.endsWith("/");
          })
          .map((obj) => {
            const key = obj.key || "";
            // Get just the filename (last part of the key)
            const name = key.split("/").pop() || key;
            const lastMod: unknown = obj.lastModified;
            // Handle lastModified - could be Date, string, number, or undefined
            let lastModifiedStr: string;
            if (lastMod && typeof lastMod === "object" && lastMod instanceof Date) {
              lastModifiedStr = lastMod.toISOString();
            } else if (typeof lastMod === "string") {
              lastModifiedStr = lastMod;
            } else if (typeof lastMod === "number") {
              lastModifiedStr = new Date(lastMod).toISOString();
            } else {
              lastModifiedStr = new Date().toISOString();
            }
            return {
              key,
              name,
              size: obj.size || 0,
              lastModified: lastModifiedStr,
              etag: obj.eTag,
            };
          });

        return {
          success: true,
          data: {
            folders,
            files,
            isTruncated: result.isTruncated || false,
            nextContinuationToken: result.isTruncated
              ? files.length > 0
                ? files[files.length - 1].key
                : undefined
              : undefined,
            prefix,
          } as BrowseResult,
        };
      } catch (error) {
        return {
          success: false,
          error: "BROWSE_FAILED",
          message: error instanceof Error ? error.message : "Failed to browse bucket",
        };
      }
    },
    {
      query: t.Object({
        prefix: t.Optional(t.String()),
        maxKeys: t.Optional(t.String()),
        startAfter: t.Optional(t.String()),
      }),
    }
  );
