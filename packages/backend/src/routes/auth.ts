import { Elysia, t } from "elysia";
import {
  configExists,
  readConfig,
  writeConfig,
  createEmptyConfig,
  getDefaultConfigPath,
  expandPath,
} from "../services/config";
import {
  unlockConfig,
  lockConfig,
  clearAllSessions,
  getSessionInfo,
  getUnlockedPaths,
  isUnlocked,
} from "../services/session";

const DEFAULT_PATH = getDefaultConfigPath();

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/unlock",
    async ({ body }) => {
      const configPath = body.configPath || DEFAULT_PATH;
      const expandedPath = expandPath(configPath);

      const exists = await configExists(configPath);
      if (!exists) {
        return {
          success: false,
          error: "CONFIG_NOT_FOUND",
          message: "Config file not found. Use /auth/setup for first-time setup.",
          isFirstRun: true,
          configPath: expandedPath,
        };
      }

      try {
        const config = await readConfig(body.password, configPath);
        unlockConfig(configPath, config, body.password);
        return {
          success: true,
          configPath: expandedPath,
          connectionCount: config.connections.length,
        };
      } catch (error) {
        return {
          success: false,
          error: "DECRYPT_FAILED",
          message: "Invalid password or corrupted config file",
          configPath: expandedPath,
        };
      }
    },
    {
      body: t.Object({
        password: t.String({ minLength: 1 }),
        configPath: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/setup",
    async ({ body }) => {
      const configPath = body.configPath || DEFAULT_PATH;
      const expandedPath = expandPath(configPath);

      const exists = await configExists(configPath);
      if (exists) {
        return {
          success: false,
          error: "CONFIG_EXISTS",
          message: "Config file already exists. Use /auth/unlock instead.",
          configPath: expandedPath,
        };
      }

      if (body.password.length < 8) {
        return {
          success: false,
          error: "PASSWORD_TOO_SHORT",
          message: "Password must be at least 8 characters",
        };
      }

      try {
        const config = createEmptyConfig();
        await writeConfig(config, body.password, configPath);
        unlockConfig(configPath, config, body.password);
        return {
          success: true,
          configPath: expandedPath,
          message: "Config created successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: "SETUP_FAILED",
          message: error instanceof Error ? error.message : "Failed to create config",
        };
      }
    },
    {
      body: t.Object({
        password: t.String({ minLength: 8 }),
        configPath: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/change-password",
    async ({ body }) => {
      const configPath = body.configPath || DEFAULT_PATH;
      const session = getSessionInfo(configPath);
      if (!session) {
        return {
          success: false,
          error: "NOT_UNLOCKED",
          message: "Must be unlocked to change password",
          configPath: expandPath(configPath),
        };
      }

      // Verify current password by attempting to read config
      try {
        await readConfig(body.currentPassword, session.configPath);
      } catch {
        return {
          success: false,
          error: "INVALID_PASSWORD",
          message: "Current password is incorrect",
        };
      }

      if (body.newPassword.length < 8) {
        return {
          success: false,
          error: "PASSWORD_TOO_SHORT",
          message: "New password must be at least 8 characters",
        };
      }

      try {
        // Read with old password, write with new password
        const config = await readConfig(body.currentPassword, session.configPath);
        await writeConfig(config, body.newPassword, session.configPath);
        // Update session with new password
        unlockConfig(session.configPath, config, body.newPassword);
        return {
          success: true,
          message: "Password changed successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: "CHANGE_FAILED",
          message: error instanceof Error ? error.message : "Failed to change password",
        };
      }
    },
    {
      body: t.Object({
        currentPassword: t.String({ minLength: 1 }),
        newPassword: t.String({ minLength: 8 }),
        configPath: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/lock",
    ({ body }) => {
      const configPath = body?.configPath;
      if (configPath) {
        lockConfig(configPath);
      } else {
        clearAllSessions();
      }
      return { success: true };
    },
    {
      body: t.Optional(
        t.Object({
          configPath: t.Optional(t.String()),
        })
      ),
    }
  )
  .get("/status", async ({ query }) => {
    const unlockedPaths = getUnlockedPaths();

    // If specific config path requested
    if (query.configPath) {
      const expandedPath = expandPath(query.configPath);
      const unlocked = isUnlocked(query.configPath);
      const exists = await configExists(query.configPath);
      return {
        configPath: expandedPath,
        unlocked,
        exists,
        isFirstRun: !exists,
      };
    }

    // Return status for all known states
    const defaultExists = await configExists();

    // Build array of config statuses
    const configs: Array<{
      configPath: string;
      unlocked: boolean;
      connectionCount?: number;
    }> = [];

    for (const path of unlockedPaths) {
      const session = getSessionInfo(path);
      if (session) {
        const config = await readConfig(session.password, path);
        configs.push({
          configPath: path,
          unlocked: true,
          connectionCount: config.connections.length,
        });
      }
    }

    return {
      defaultConfigPath: DEFAULT_PATH,
      isFirstRun: !defaultExists && configs.length === 0,
      configs,
    };
  })
  .get(
    "/file-status",
    async ({ query }) => {
      const configPath = query.configPath || DEFAULT_PATH;
      const expandedPath = expandPath(configPath);
      const exists = await configExists(configPath);
      const unlocked = isUnlocked(configPath);

      return {
        configPath: expandedPath,
        exists,
        unlocked,
        isFirstRun: !exists,
      };
    }
  );
