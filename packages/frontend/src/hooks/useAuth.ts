import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { ConfigFile, Connection } from "@/types";

interface AuthState {
  configFiles: ConfigFile[];
  defaultConfigPath: string;
  isFirstRun: boolean;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    configFiles: [],
    defaultConfigPath: "",
    isFirstRun: false,
    loading: true,
    error: null,
  });

  // Fetch workspaces and their status
  const checkStatus = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));

      // Fetch workspaces from server
      const { data: workspacesData } = await (api.workspaces as any).get();
      const workspaces = workspacesData?.workspaces || [];

      // Also fetch auth status for default path info
      const { data: authData } = await (api.auth.status as any).get();

      setState((s) => {
        // Build config files from workspaces
        const newConfigFiles: ConfigFile[] = workspaces.map((w: any) => {
          const existing = s.configFiles.find((f) => f.path === w.path);
          return {
            path: w.path,
            name: w.name,
            isUnlocked: w.unlocked,
            exists: w.exists,
            connections: existing?.connections || [],
          };
        });

        return {
          configFiles: newConfigFiles,
          defaultConfigPath: authData?.defaultConfigPath || "",
          isFirstRun: workspaces.length === 0,
          loading: false,
          error: null,
        };
      });
    } catch (error) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Failed to check status",
      }));
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Check status of a specific file
  const checkFileStatus = useCallback(async (configPath: string) => {
    try {
      const { data } = await (api.auth as any)["file-status"].get({
        query: { configPath },
      });
      return data as {
        configPath: string;
        exists: boolean;
        unlocked: boolean;
        isFirstRun: boolean;
      };
    } catch {
      return null;
    }
  }, []);

  // Unlock a specific config file
  const unlockFile = useCallback(
    async (password: string, configPath?: string) => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const { data } = await (api.auth.unlock as any).post({
          password,
          configPath,
        });

        if (data && data.success) {
          const expandedPath = (data as any).configPath;

          // Update local state
          setState((s) => {
            const existingFile = s.configFiles.find((f) => f.path === expandedPath);
            if (existingFile) {
              return {
                ...s,
                configFiles: s.configFiles.map((f) =>
                  f.path === expandedPath ? { ...f, isUnlocked: true } : f
                ),
                isFirstRun: false,
                loading: false,
                error: null,
              };
            } else {
              // File was unlocked but not in workspaces list - shouldn't happen normally
              return {
                ...s,
                configFiles: [
                  ...s.configFiles,
                  { path: expandedPath, isUnlocked: true, exists: true, connections: [] },
                ],
                isFirstRun: false,
                loading: false,
                error: null,
              };
            }
          });
          return { success: true, configPath: expandedPath };
        } else {
          const errorMsg = (data as any)?.message || "Failed to unlock";
          setState((s) => ({ ...s, loading: false, error: errorMsg }));
          return { success: false, error: errorMsg };
        }
      } catch (error) {
        const errorMsg = "Failed to unlock";
        setState((s) => ({ ...s, loading: false, error: errorMsg }));
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  // Setup a new config file
  const setupFile = useCallback(async (password: string, configPath?: string, name?: string) => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const { data } = await (api.auth.setup as any).post({
        password,
        configPath,
        name,
      });

      if (data && data.success) {
        const expandedPath = (data as any).configPath;
        const groupName = (data as any).name || name;

        // Add to workspaces on the server
        await (api.workspaces as any).post({
          name: groupName || "Workspace",
          path: expandedPath,
        });

        setState((s) => {
          const newFile: ConfigFile = {
            path: expandedPath,
            name: groupName,
            isUnlocked: true,
            exists: true,
            connections: [],
          };

          // Filter out any duplicate entries
          const filteredFiles = s.configFiles.filter((f) => f.path !== expandedPath);

          return {
            ...s,
            configFiles: [...filteredFiles, newFile],
            isFirstRun: false,
            loading: false,
            error: null,
          };
        });
        return { success: true, configPath: expandedPath };
      } else {
        const errorMsg = (data as any)?.message || "Failed to setup";
        setState((s) => ({ ...s, loading: false, error: errorMsg }));
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = "Failed to setup";
      setState((s) => ({ ...s, loading: false, error: errorMsg }));
      return { success: false, error: errorMsg };
    }
  }, []);

  // Lock a specific config file
  const lockFile = useCallback(async (configPath: string) => {
    try {
      await (api.auth.lock as any).post({ configPath });
      setState((s) => ({
        ...s,
        configFiles: s.configFiles.map((f) =>
          f.path === configPath ? { ...f, isUnlocked: false, connections: [] } : f
        ),
      }));
    } catch (error) {
      console.error("Failed to lock:", error);
    }
  }, []);

  // Lock all files
  const lockAll = useCallback(async () => {
    try {
      await (api.auth.lock as any).post({});
      setState((s) => ({
        ...s,
        configFiles: s.configFiles.map((f) => ({
          ...f,
          isUnlocked: false,
          connections: [],
        })),
      }));
    } catch (error) {
      console.error("Failed to lock:", error);
    }
  }, []);

  // Change password for a specific file
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string, configPath?: string) => {
      try {
        const { data } = await (api.auth["change-password"] as any).post({
          currentPassword,
          newPassword,
          configPath,
        });

        if (data && data.success) {
          return { success: true };
        } else {
          return {
            success: false,
            error: (data as any)?.message || "Failed to change password",
          };
        }
      } catch (error) {
        return { success: false, error: "Failed to change password" };
      }
    },
    []
  );

  // Update connections for a config file
  const setFileConnections = useCallback(
    (configPath: string, connections: Connection[]) => {
      setState((s) => ({
        ...s,
        configFiles: s.configFiles.map((f) =>
          f.path === configPath ? { ...f, connections } : f
        ),
      }));
    },
    []
  );

  // Add a workspace (server-side storage)
  const addKnownPath = useCallback(async (path: string, name?: string) => {
    try {
      const { data } = await (api.workspaces as any).post({
        name: name || "Workspace",
        path,
      });

      if (data?.success) {
        const addedPath = data.addedPath;
        setState((s) => {
          if (s.configFiles.some((f) => f.path === addedPath)) return s;
          return {
            ...s,
            configFiles: [
              ...s.configFiles,
              { path: addedPath, name: name || "Workspace", isUnlocked: false, exists: true, connections: [] },
            ],
            isFirstRun: false,
          };
        });
      }
    } catch (error) {
      console.error("Failed to add workspace:", error);
    }
  }, []);

  // Remove a workspace (server-side storage)
  const removeKnownPath = useCallback(async (path: string) => {
    try {
      await (api.workspaces as any)[encodeURIComponent(path)].delete();
      setState((s) => ({
        ...s,
        configFiles: s.configFiles.filter((f) => f.path !== path),
      }));
    } catch (error) {
      console.error("Failed to remove workspace:", error);
    }
  }, []);

  // Rename a workspace (updates both encrypted config and workspaces.json)
  const renameGroup = useCallback(
    async (newName: string, configPath: string) => {
      try {
        // Update the encrypted config (if unlocked)
        const { data } = await (api.auth.rename as any).post({
          name: newName,
          configPath,
        });

        // Also update the workspaces.json
        await (api.workspaces as any)[encodeURIComponent(configPath)].name.put({
          name: newName,
        });

        if (data && data.success) {
          setState((s) => ({
            ...s,
            configFiles: s.configFiles.map((f) =>
              f.path === configPath ? { ...f, name: newName } : f
            ),
          }));
          return { success: true };
        } else {
          return {
            success: false,
            error: (data as any)?.message || "Failed to rename",
          };
        }
      } catch (error) {
        return { success: false, error: "Failed to rename" };
      }
    },
    []
  );

  // Computed properties
  const hasUnlockedFiles = state.configFiles.some((f) => f.isUnlocked);
  const unlockedFiles = state.configFiles.filter((f) => f.isUnlocked);

  return {
    ...state,
    hasUnlockedFiles,
    unlockedFiles,
    checkStatus,
    checkFileStatus,
    unlockFile,
    setupFile,
    lockFile,
    lockAll,
    changePassword,
    setFileConnections,
    addKnownPath,
    removeKnownPath,
    renameGroup,
    // Legacy compatibility
    unlocked: hasUnlockedFiles,
    unlock: unlockFile,
    setup: setupFile,
    lock: lockAll,
    refresh: checkStatus,
  };
}
