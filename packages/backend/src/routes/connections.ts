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
  getConfig,
} from "../services/session";
import { writeConfig, generateConnectionId, type Connection, getDefaultConfigPath, expandPath } from "../services/config";
import { CreateConnectionSchema, UpdateConnectionSchema, ReorderConnectionsSchema, MoveConnectionSchema } from "../types";

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
          color: c.color,
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
      color?: string;
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
          color: c.color,
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
        color: body.color,
      };

      const currentConfig = getConfig(configPath);
      const newConfig = { ...currentConfig, connections: [...connections, newConnection] };
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
          color: newConnection.color,
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
      const currentConfig = getConfig(configPath);
      const newConfig = { ...currentConfig, connections: newConnections };

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
          color: updatedConnection.color,
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
    const currentConfig = getConfig(configPath);
    const newConfig = { ...currentConfig, connections: newConnections };

    await writeConfig(newConfig, session.password, session.configPath);
    updateConfig(newConfig, configPath);
    removeS3Client(params.id, configPath);

    return {
      success: true,
      message: "Connection deleted",
    };
  })
  // PUT /connections/reorder - Reorder connections within a group
  .put(
    "/reorder",
    async ({ body }) => {
      const { configPath, connectionIds } = body;
      const session = getSessionInfo(configPath);
      if (!session) {
        return {
          success: false,
          error: "NOT_UNLOCKED",
          message: "Config file must be unlocked before reordering connections",
          configPath: expandPath(configPath),
        };
      }

      const connections = getConnections(configPath);

      // Validate all IDs exist in this config
      const existingIds = new Set(connections.map((c) => c.id));
      const missingIds = connectionIds.filter((id) => !existingIds.has(id));
      if (missingIds.length > 0) {
        return {
          success: false,
          error: "INVALID_IDS",
          message: `Connection IDs not found: ${missingIds.join(", ")}`,
        };
      }

      // Validate no extra IDs were provided
      if (connectionIds.length !== connections.length) {
        return {
          success: false,
          error: "INVALID_IDS",
          message: "Connection IDs count does not match existing connections",
        };
      }

      // Reorder connections according to provided order
      const connectionMap = new Map(connections.map((c) => [c.id, c]));
      const reorderedConnections = connectionIds.map((id) => connectionMap.get(id)!);

      const currentConfig = getConfig(configPath);
      const newConfig = { ...currentConfig, connections: reorderedConnections };

      await writeConfig(newConfig, session.password, session.configPath);
      updateConfig(newConfig, configPath);

      return {
        success: true,
        message: "Connections reordered",
      };
    },
    {
      body: ReorderConnectionsSchema,
    }
  )
  // POST /connections/move - Move connection between groups
  .post(
    "/move",
    async ({ body }) => {
      const { connectionId, sourceConfigPath, targetConfigPath, targetIndex } = body;

      // Validate source is unlocked
      const sourceSession = getSessionInfo(sourceConfigPath);
      if (!sourceSession) {
        return {
          success: false,
          error: "SOURCE_NOT_UNLOCKED",
          message: "Source config file must be unlocked",
          configPath: expandPath(sourceConfigPath),
        };
      }

      // Validate target is unlocked
      const targetSession = getSessionInfo(targetConfigPath);
      if (!targetSession) {
        return {
          success: false,
          error: "TARGET_NOT_UNLOCKED",
          message: "Target config file must be unlocked",
          configPath: expandPath(targetConfigPath),
        };
      }

      // Find the connection in source
      const sourceConnections = getConnections(sourceConfigPath);
      const connectionIndex = sourceConnections.findIndex((c) => c.id === connectionId);
      if (connectionIndex === -1) {
        return {
          success: false,
          error: "NOT_FOUND",
          message: "Connection not found in source config file",
        };
      }

      const connection = sourceConnections[connectionIndex];

      // Remove from source
      const newSourceConnections = sourceConnections.filter((c) => c.id !== connectionId);
      const sourceConfig = getConfig(sourceConfigPath);
      const newSourceConfig = { ...sourceConfig, connections: newSourceConnections };

      // Add to target
      const targetConnections = getConnections(targetConfigPath);
      const insertIndex = targetIndex !== undefined ? Math.min(targetIndex, targetConnections.length) : targetConnections.length;
      const newTargetConnections = [...targetConnections];
      newTargetConnections.splice(insertIndex, 0, connection);
      const targetConfig = getConfig(targetConfigPath);
      const newTargetConfig = { ...targetConfig, connections: newTargetConnections };

      // Write both atomically (as atomic as we can - write both before updating state)
      await writeConfig(newSourceConfig, sourceSession.password, sourceSession.configPath);
      await writeConfig(newTargetConfig, targetSession.password, targetSession.configPath);

      // Update in-memory state
      updateConfig(newSourceConfig, sourceConfigPath);
      updateConfig(newTargetConfig, targetConfigPath);

      // Move S3 client cache if exists
      removeS3Client(connectionId, sourceConfigPath);

      return {
        success: true,
        message: "Connection moved",
        connection: {
          id: connection.id,
          name: connection.name,
          bucket: connection.bucket,
          endpoint: connection.endpoint,
          region: connection.region,
          color: connection.color,
          configPath: targetSession.configPath,
        },
      };
    },
    {
      body: MoveConnectionSchema,
    }
  );
