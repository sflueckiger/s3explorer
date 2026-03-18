import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { ConfigFile, Connection } from "@/types";

interface AuthState {
  // Multi-file state
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

  // Fetch status for all config files
  const checkStatus = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const { data } = await (api.auth.status as any).get();

      if (data) {
        const configs = (data as any).configs || [];
        const configFiles: ConfigFile[] = configs.map((c: any) => ({
          path: c.configPath,
          isUnlocked: c.unlocked,
          exists: true,
          connections: [],
        }));

        setState({
          configFiles,
          defaultConfigPath: (data as any).defaultConfigPath || "",
          isFirstRun: (data as any).isFirstRun || false,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Failed to check auth status",
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
          // Add or update the config file in state
          // Also remove any duplicate entries with unexpanded paths (e.g., ~/...)
          setState((s) => {
            const newFile: ConfigFile = {
              path: expandedPath,
              isUnlocked: true,
              exists: true,
              connections: [],
            };

            // Filter out any entries that match this path (exact or tilde version)
            const filteredFiles = s.configFiles.filter((f) => {
              if (f.path === expandedPath) return false;
              // Check if it's the same path with tilde
              if (f.path.startsWith("~") && expandedPath.endsWith(f.path.slice(1))) return false;
              if (expandedPath.startsWith("~") && f.path.endsWith(expandedPath.slice(1))) return false;
              return true;
            });

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
  const setupFile = useCallback(async (password: string, configPath?: string) => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const { data } = await (api.auth.setup as any).post({
        password,
        configPath,
      });

      if (data && data.success) {
        const expandedPath = (data as any).configPath;
        setState((s) => {
          const newFile = {
            path: expandedPath,
            isUnlocked: true,
            exists: true,
            connections: [],
          };

          // Filter out any entries that match this path (exact or tilde version)
          const filteredFiles = s.configFiles.filter((f) => {
            if (f.path === expandedPath) return false;
            // Check if it's the same path with tilde
            if (f.path.startsWith("~") && expandedPath.endsWith(f.path.slice(1))) return false;
            if (expandedPath.startsWith("~") && f.path.endsWith(expandedPath.slice(1))) return false;
            return true;
          });

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

  // Add a known path (without unlocking)
  const addKnownPath = useCallback((path: string) => {
    setState((s) => {
      if (s.configFiles.some((f) => f.path === path)) return s;
      return {
        ...s,
        configFiles: [
          ...s.configFiles,
          { path, isUnlocked: false, exists: true, connections: [] },
        ],
      };
    });
  }, []);

  // Remove a known path
  const removeKnownPath = useCallback((path: string) => {
    setState((s) => ({
      ...s,
      configFiles: s.configFiles.filter((f) => f.path !== path),
    }));
  }, []);

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
    // Legacy compatibility
    unlocked: hasUnlockedFiles,
    unlock: unlockFile,
    setup: setupFile,
    lock: lockAll,
    refresh: checkStatus,
  };
}
