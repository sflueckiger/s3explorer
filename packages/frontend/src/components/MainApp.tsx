import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import { ConnectionSidebar } from "./ConnectionSidebar";
import { BucketTabs } from "./BucketTabs";
import { toast } from "sonner";
import type { ConfigFile, Connection } from "@/types";

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
  setFileConnections: (configPath: string, connections: Connection[]) => void;
  addKnownPath: (path: string, name?: string) => Promise<void>;
  removeKnownPath: (path: string) => Promise<void>;
  renameGroup: (newName: string, configPath: string) => Promise<{ success: boolean; error?: string }>;
}

export function MainApp({
  configFiles,
  onLockAll,
  onLockFile,
  onUnlockFile,
  onSetupFile,
  onCheckFileStatus,
  setFileConnections,
  addKnownPath,
  removeKnownPath,
  renameGroup,
}: MainAppProps) {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createWorkspaceRequested, setCreateWorkspaceRequested] = useState(false);

  // Fetch connections for a specific file
  const fetchConnectionsForFile = useCallback(async (file: ConfigFile) => {
    if (!file.isUnlocked) return;

    try {
      const { data } = await (api.connections as any).get({
        query: { configPath: file.path },
      });
      if (data && data.success) {
        const connections: Connection[] = ((data as any).connections || []).map((c: any) => ({
          ...c,
          configPath: file.path,
        }));
        setFileConnections(file.path, connections);
      }
    } catch (error) {
      console.error(`Failed to fetch connections for ${file.path}:`, error);
    }
  }, [setFileConnections]);

  // Memoize the unlocked paths key to avoid re-fetching when connections change
  const unlockedPathsKey = useMemo(
    () => configFiles.filter((f) => f.isUnlocked).map((f) => f.path).join(","),
    [configFiles]
  );

  // Fetch connections when unlocked files change
  useEffect(() => {
    const unlockedFiles = configFiles.filter((f) => f.isUnlocked);
    if (unlockedFiles.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(unlockedFiles.map(fetchConnectionsForFile))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedPathsKey]);

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
          query: { configPath },
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

  // Handle connection moved between groups
  const handleConnectionMoved = useCallback(
    (sourceConfigPath: string, targetConfigPath: string) => {
      // Refetch both source and target to get updated connection lists
      handleConnectionAdded(sourceConfigPath);
      handleConnectionAdded(targetConfigPath);
    },
    [handleConnectionAdded]
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

  // Handle remove workspace - close tabs first
  const handleRemoveKnownPath = useCallback(
    async (path: string) => {
      // Close tabs for connections from this file
      const file = configFiles.find((f) => f.path === path);
      if (file) {
        for (const conn of file.connections) {
          handleCloseTab(conn.id);
        }
      }
      await removeKnownPath(path);
    },
    [configFiles, handleCloseTab, removeKnownPath]
  );

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
        openAddFileDialog={createWorkspaceRequested}
        onSelectConnection={handleOpenConnection}
        onConnectionAdded={handleConnectionAdded}
        onConnectionUpdated={handleConnectionAdded}
        onConnectionDeleted={handleConnectionDeleted}
        onConnectionMoved={handleConnectionMoved}
        onLockAll={onLockAll}
        onLockFile={handleLockFile}
        onUnlockFile={onUnlockFile}
        onSetupFile={onSetupFile}
        onCheckFileStatus={onCheckFileStatus}
        onAddKnownPath={addKnownPath}
        onRemoveKnownPath={handleRemoveKnownPath}
        onRenameGroup={renameGroup}
        onAddFileDialogChange={setCreateWorkspaceRequested}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-auto">
        <BucketTabs
          tabs={openTabs}
          activeTabId={activeTabId}
          hasWorkspaces={configFiles.length > 0}
          onSelectTab={setActiveTabId}
          onCloseTab={handleCloseTab}
          onCreateWorkspace={() => setCreateWorkspaceRequested(true)}
        />
      </div>
    </div>
  );
}
