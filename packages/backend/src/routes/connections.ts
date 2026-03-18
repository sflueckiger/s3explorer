import { Elysia, t } from "elysia";
import { S3Client } from "bun";
import {
  getConnections,
  getConnection,
  getSessionInfo,
  updateConfig,
  isUnlocked,
  removeS3Client,
  getUnlockedPaths,
} from "../services/session";
import { writeConfig, generateConnectionId, type Connection, getDefaultConfigPath, expandPath } from "../services/config";
import { CreateConnectionSchema, UpdateConnectionSchema } from "../types";

const DEFAULT_PATH = getDefaultConfigPath();

// Helper to validate S3 credentials by listing bucket
async function validateS3Connection(connection: Omit<Connection, "id">): Promise<{ valid: boolean; error?: string }> {
  try {
    const client = new S3Client({
      accessKeyId: connection.accessKeyId,
      secretAccessKey: connection.secretAccessKey,
      bucket: connection.bucket,
      endpoint: connection.endpoint,
      region: connection.region || "us-east-1",
      sessionToken: connection.sessionToken,
    });

    // Try to list bucket root to validate credentials
    await client.list({ maxKeys: 1 });
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Failed to connect to S3",
    };
  }
}

export const connectionRoutes = new Elysia({ prefix: "/connections" })
  .onError(({ error }) => {
    if (error instanceof Error && error.message === "NOT_UNLOCKED") {
      return {
        success: false,
        error: "NOT_UNLOCKED",
        message: "Must unlock before accessing connections",
      };
    }
    throw error;
  })
  // GET all connections - optionally filtered by configPath
  .get("/", ({ query }) => {
    const configPath = query.configPath;

    // If specific configPath, return only that file's connections
    if (configPath) {
      if (!isUnlocked(configPath)) {
        return {
          success: false,
          error: "NOT_UNLOCKED",
          message: "Config file is not unlocked",
          configPath: expandPath(configPath),
        };
      }
      const connections = getConnections(configPath);
      return {
        success: true,
        configPath: expandPath(configPath),
        connections: connections.map((c) => ({
          id: c.id,
          name: c.name,
          bucket: c.bucket,
          endpoint: c.endpoint,
          region: c.region,
        })),
      };
    }

    // Return all connections from all unlocked files
    const allConnections: Array<{
      id: string;
      name: string;
      bucket: string;
      endpoint?: string;
      region?: string;
      configPath: string;
    }> = [];

    for (const path of getUnlockedPaths()) {
      const connections = getConnections(path);
      for (const c of connections) {
        allConnections.push({
          id: c.id,
          name: c.name,
          bucket: c.bucket,
          endpoint: c.endpoint,
          region: c.region,
          configPath: path,
        });
      }
    }

    return {
      success: true,
      connections: allConnections,
    };
  })
  .get("/:id", ({ params, query }) => {
    const configPath = query.configPath;
    const connection = getConnection(params.id, configPath);
    if (!connection) {
      return {
        success: false,
        error: "NOT_FOUND",
        message: "Connection not found",
      };
    }
    // Return full connection including secrets for editing
    return {
      success: true,
      connection,
    };
  })
  .post(
    "/",
    async ({ body }) => {
      const configPath = body.configPath || DEFAULT_PATH;
      const session = getSessionInfo(configPath);
      if (!session) {
        return {
          success: false,
          error: "NOT_UNLOCKED",
          message: "Config file must be unlocked before adding connections",
          configPath: expandPath(configPath),
        };
      }

      // Validate connection
      const validation = await validateS3Connection(body);
      if (!validation.valid) {
        return {
          success: false,
          error: "VALIDATION_FAILED",
          message: validation.error,
        };
      }

      const connections = getConnections(configPath);
      const newConnection: Connection = {
        id: generateConnectionId(),
        name: body.name,
        bucket: body.bucket,
        endpoint: body.endpoint,
        region: body.region,
        accessKeyId: body.accessKeyId,
        secretAccessKey: body.secretAccessKey,
        sessionToken: body.sessionToken,
      };

      const newConfig = { connections: [...connections, newConnection] };
      await writeConfig(newConfig, session.password, session.configPath);
      updateConfig(newConfig, configPath);

      return {
        success: true,
        connection: {
          id: newConnection.id,
          name: newConnection.name,
          bucket: newConnection.bucket,
          endpoint: newConnection.endpoint,
          region: newConnection.region,
          configPath: session.configPath,
        },
      };
    },
    {
      body: t.Intersect([
        CreateConnectionSchema,
        t.Object({
          configPath: t.Optional(t.String()),
        }),
      ]),
    }
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const configPath = body.configPath || DEFAULT_PATH;
      const session = getSessionInfo(configPath);
      if (!session) {
        return {
          success: false,
          error: "NOT_UNLOCKED",
          message: "Config file must be unlocked before updating connections",
          configPath: expandPath(configPath),
        };
      }

      const connections = getConnections(configPath);
      const index = connections.findIndex((c) => c.id === params.id);
      if (index === -1) {
        return {
          success: false,
          error: "NOT_FOUND",
          message: "Connection not found in specified config file",
        };
      }

      const updatedConnection = { ...connections[index], ...body };
      delete (updatedConnection as any).configPath; // Remove configPath from connection object

      // Validate updated connection
      const validation = await validateS3Connection(updatedConnection);
      if (!validation.valid) {
        return {
          success: false,
          error: "VALIDATION_FAILED",
          message: validation.error,
        };
      }

      const newConnections = [...connections];
      newConnections[index] = updatedConnection;
      const newConfig = { connections: newConnections };

      await writeConfig(newConfig, session.password, session.configPath);
      updateConfig(newConfig, configPath);
      removeS3Client(params.id, configPath);

      return {
        success: true,
        connection: {
          id: updatedConnection.id,
          name: updatedConnection.name,
          bucket: updatedConnection.bucket,
          endpoint: updatedConnection.endpoint,
          region: updatedConnection.region,
          configPath: session.configPath,
        },
      };
    },
    {
      body: t.Intersect([
        UpdateConnectionSchema,
        t.Object({
          configPath: t.Optional(t.String()),
        }),
      ]),
    }
  )
  .delete("/:id", async ({ params, query }) => {
    const configPath = query.configPath || DEFAULT_PATH;
    const session = getSessionInfo(configPath);
    if (!session) {
      return {
        success: false,
        error: "NOT_UNLOCKED",
        message: "Config file must be unlocked before deleting connections",
        configPath: expandPath(configPath),
      };
    }

    const connections = getConnections(configPath);
    const index = connections.findIndex((c) => c.id === params.id);
    if (index === -1) {
      return {
        success: false,
        error: "NOT_FOUND",
        message: "Connection not found in specified config file",
      };
    }

    const newConnections = connections.filter((c) => c.id !== params.id);
    const newConfig = { connections: newConnections };

    await writeConfig(newConfig, session.password, session.configPath);
    updateConfig(newConfig, configPath);
    removeS3Client(params.id, configPath);

    return {
      success: true,
      message: "Connection deleted",
    };
  });
