import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { ConnectionSidebar } from "./ConnectionSidebar";
import { BucketTabs } from "./BucketTabs";
import { toast } from "sonner";
import type { ConfigFile, Connection } from "@/types";
import { useKnownPaths } from "@/hooks/useKnownPaths";

interface OpenTab {
  connectionId: string;
  connection: Connection;
}

interface MainAppProps {
  configFiles: ConfigFile[];
  onLockAll: () => void;
  onLockFile: (configPath: string) => void;
  onUnlockFile: (password: string, configPath: string) => Promise<{ success: boolean; error?: string; configPath?: string }>;
  onSetupFile: (password: string, configPath: string) => Promise<{ success: boolean; error?: string; configPath?: string }>;
  onCheckFileStatus: (configPath: string) => Promise<{ exists: boolean; unlocked: boolean } | null>;
  onChangePassword: (current: string, newPwd: string, configPath?: string) => Promise<{ success: boolean; error?: string }>;
  setFileConnections: (configPath: string, connections: Connection[]) => void;
  addKnownPath: (path: string) => void;
  removeKnownPath: (path: string) => void;
}

export function MainApp({
  configFiles,
  onLockAll,
  onLockFile,
  onUnlockFile,
  onSetupFile,
  onCheckFileStatus,
  onChangePassword,
  setFileConnections,
  addKnownPath,
  removeKnownPath,
}: MainAppProps) {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { knownPaths, addKnownPath: addToStorage, removeKnownPath: removeFromStorage } = useKnownPaths();

  // Fetch connections for all unlocked files
  const fetchConnections = useCallback(async () => {
    setLoading(true);
    try {
      for (const file of configFiles) {
        if (file.isUnlocked) {
          const { data } = await (api.connections as any).get({
            $query: { configPath: file.path },
          });
          if (data && data.success) {
            const connections: Connection[] = ((data as any).connections || []).map((c: any) => ({
              ...c,
              configPath: file.path,
            }));
            setFileConnections(file.path, connections);
          }
        }
      }
    } catch (error) {
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, [configFiles, setFileConnections]);

  // Sync known paths from localStorage after initial load
  useEffect(() => {
    // Wait until initial loading is complete
    if (loading) return;

    for (const path of knownPaths) {
      // Check if path already exists (comparing endings to handle ~/... vs /Users/...)
      const matchingFile = configFiles.find((f) =>
        f.path === path ||
        f.path.endsWith(path.replace(/^~/, '')) ||
        path.endsWith(f.path.replace(/^\/Users\/[^/]+/, ''))
      );

      if (matchingFile) {
        // If the path in localStorage differs from the actual path, update localStorage
        if (matchingFile.path !== path) {
          removeFromStorage(path);
          addToStorage(matchingFile.path);
        }
      } else {
        // Path doesn't exist in configFiles yet, add it
        addKnownPath(path);
      }
    }
  }, [loading]); // Run after loading completes

  // Fetch connections when config files change
  useEffect(() => {
    fetchConnections();
  }, [configFiles.filter((f) => f.isUnlocked).map((f) => f.path).join(",")]);

  const handleOpenConnection = useCallback(
    (connection: Connection) => {
      const existing = openTabs.find((t) => t.connectionId === connection.id);
      if (existing) {
        setActiveTabId(connection.id);
        return;
      }

      setOpenTabs((tabs) => [...tabs, { connectionId: connection.id, connection }]);
      setActiveTabId(connection.id);
    },
    [openTabs]
  );

  const handleCloseTab = useCallback(
    (connectionId: string) => {
      setOpenTabs((tabs) => tabs.filter((t) => t.connectionId !== connectionId));
      if (activeTabId === connectionId) {
        const remaining = openTabs.filter((t) => t.connectionId !== connectionId);
        setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].connectionId : null);
      }
    },
    [activeTabId, openTabs]
  );

  const handleConnectionAdded = useCallback(
    async (configPath: string) => {
      // Refetch connections for this file
      try {
        const { data } = await (api.connections as any).get({
          $query: { configPath },
        });
        if (data && data.success) {
          const connections: Connection[] = ((data as any).connections || []).map((c: any) => ({
            ...c,
            configPath,
          }));
          setFileConnections(configPath, connections);
        }
      } catch (error) {
        toast.error("Failed to refresh connections");
      }
    },
    [setFileConnections]
  );

  const handleConnectionDeleted = useCallback(
    (connectionId: string, configPath: string) => {
      handleCloseTab(connectionId);
      handleConnectionAdded(configPath);
    },
    [handleCloseTab, handleConnectionAdded]
  );

  // Handle unlock file - also update localStorage with expanded path
  const handleUnlockFile = useCallback(
    async (password: string, configPath: string) => {
      const result = await onUnlockFile(password, configPath);
      if (result.success && result.configPath) {
        // Remove old path from localStorage, add expanded path
        removeFromStorage(configPath);
        addToStorage(result.configPath);
      }
      return result;
    },
    [onUnlockFile, removeFromStorage, addToStorage]
  );

  // Handle setup file - also update localStorage with expanded path
  const handleSetupFile = useCallback(
    async (password: string, configPath: string) => {
      const result = await onSetupFile(password, configPath);
      if (result.success && result.configPath) {
        // Remove old path from localStorage, add expanded path
        removeFromStorage(configPath);
        addToStorage(result.configPath);
      }
      return result;
    },
    [onSetupFile, removeFromStorage, addToStorage]
  );

  // Handle lock file - close all tabs for that file
  const handleLockFile = useCallback(
    (configPath: string) => {
      // Find all connections from this file and close their tabs
      const file = configFiles.find((f) => f.path === configPath);
      if (file) {
        for (const conn of file.connections) {
          handleCloseTab(conn.id);
        }
      }
      onLockFile(configPath);
    },
    [configFiles, handleCloseTab, onLockFile]
  );

  // Persist to localStorage when adding/removing
  const handleAddKnownPath = useCallback(
    (path: string) => {
      addKnownPath(path);
      addToStorage(path);
    },
    [addKnownPath, addToStorage]
  );

  const handleRemoveKnownPath = useCallback(
    (path: string) => {
      // Close tabs for connections from this file
      const file = configFiles.find((f) => f.path === path);
      if (file) {
        for (const conn of file.connections) {
          handleCloseTab(conn.id);
        }
      }
      removeKnownPath(path);
      removeFromStorage(path);
    },
    [configFiles, handleCloseTab, removeKnownPath, removeFromStorage]
  );

  // Get all connections from all config files
  const allConnections = configFiles.flatMap((f) => f.connections);

  if (loading && configFiles.some((f) => f.isUnlocked && f.connections.length === 0)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading connections...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <ConnectionSidebar
        configFiles={configFiles}
        activeConnectionId={activeTabId}
        onSelectConnection={handleOpenConnection}
        onConnectionAdded={handleConnectionAdded}
        onConnectionUpdated={handleConnectionAdded}
        onConnectionDeleted={handleConnectionDeleted}
        onLockAll={onLockAll}
        onLockFile={handleLockFile}
        onUnlockFile={handleUnlockFile}
        onSetupFile={handleSetupFile}
        onCheckFileStatus={onCheckFileStatus}
        onAddKnownPath={handleAddKnownPath}
        onRemoveKnownPath={handleRemoveKnownPath}
        onChangePassword={onChangePassword}
      />
      <div className="flex-1 flex flex-col">
        <BucketTabs
          tabs={openTabs}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
          onCloseTab={handleCloseTab}
          onAddTab={() => {
            if (allConnections.length === 0) {
              toast.info("Add a connection first");
            } else {
              toast.info("Select a connection from the sidebar");
            }
          }}
        />
      </div>
    </div>
  );
}
