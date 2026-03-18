import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database, Settings, LogOut, FilePlus, Plus } from "lucide-react";
import { AddConnectionDialog } from "./AddConnectionDialog";
import { EditConnectionDialog } from "./EditConnectionDialog";
import { DeleteConnectionDialog } from "./DeleteConnectionDialog";
import { AddCredentialFileDialog } from "./AddCredentialFileDialog";
import { UnlockFileDialog } from "./UnlockFileDialog";
import { SetupFileDialog } from "./SetupFileDialog";
import { RenameGroupDialog } from "./RenameGroupDialog";
import { MoveConnectionDialog } from "./MoveConnectionDialog";
import { CredentialFileGroup } from "./CredentialFileGroup";
import { getColorHex } from "./ColorPicker";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ConfigFile, Connection } from "@/types";

interface ConnectionSidebarProps {
  configFiles: ConfigFile[];
  activeConnectionId: string | null;
  openAddFileDialog?: boolean;
  onSelectConnection: (connection: Connection) => void;
  onConnectionAdded: (configPath: string) => void;
  onConnectionUpdated: (configPath: string) => void;
  onConnectionDeleted: (connectionId: string, configPath: string) => void;
  onConnectionMoved: (sourceConfigPath: string, targetConfigPath: string) => void;
  onLockAll: () => void;
  onLockFile: (configPath: string) => void;
  onUnlockFile: (password: string, configPath: string) => Promise<{ success: boolean; error?: string }>;
  onSetupFile: (password: string, configPath: string) => Promise<{ success: boolean; error?: string }>;
  onCheckFileStatus: (configPath: string) => Promise<{ exists: boolean; unlocked: boolean } | null>;
  onAddKnownPath: (path: string, name?: string) => Promise<void>;
  onRemoveKnownPath: (path: string) => Promise<void>;
  onRenameGroup: (newName: string, configPath: string) => Promise<{ success: boolean; error?: string }>;
  onAddFileDialogChange?: (open: boolean) => void;
}

interface PendingMove {
  connection: Connection;
  sourceConfigPath: string;
  targetConfigPath: string;
  targetIndex?: number;
}

export function ConnectionSidebar({
  configFiles,
  activeConnectionId,
  openAddFileDialog,
  onSelectConnection,
  onConnectionAdded,
  onConnectionUpdated,
  onConnectionDeleted,
  onConnectionMoved,
  onLockAll,
  onLockFile,
  onUnlockFile,
  onSetupFile,
  onCheckFileStatus,
  onAddKnownPath,
  onRemoveKnownPath,
  onRenameGroup,
  onAddFileDialogChange,
}: ConnectionSidebarProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogConfigPath, setAddDialogConfigPath] = useState<string | null>(null);
  const [editConnection, setEditConnection] = useState<Connection | null>(null);
  const [deleteConnection, setDeleteConnection] = useState<Connection | null>(null);
  const [addFileDialogOpen, setAddFileDialogOpen] = useState(false);
  const [unlockDialogPath, setUnlockDialogPath] = useState<string | null>(null);
  const [setupDialog, setSetupDialog] = useState<{ path: string; name: string } | null>(null);
  const [renameDialogPath, setRenameDialogPath] = useState<string | null>(null);

  // Drag and drop state
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync with external dialog open request
  useEffect(() => {
    if (openAddFileDialog) {
      setAddFileDialogOpen(true);
    }
  }, [openAddFileDialog]);

  const handleAddFileDialogChange = (open: boolean) => {
    setAddFileDialogOpen(open);
    onAddFileDialogChange?.(open);
  };

  const handleAddConnection = (configPath: string) => {
    setAddDialogConfigPath(configPath);
    setAddDialogOpen(true);
  };

  const handleAddFile = async (path: string, name?: string) => {
    const status = await onCheckFileStatus(path);
    if (status) {
      // Use the expanded path from the backend response
      const expandedPath = (status as any).configPath || path;
      await onAddKnownPath(expandedPath, name);
      return { ...status, configPath: expandedPath };
    }
    return { exists: false, unlocked: false, configPath: path };
  };

  // Get connections for a specific group
  const getConnectionsForGroup = useCallback(
    (configPath: string): Connection[] => {
      const file = configFiles.find((f) => f.path === configPath);
      return file?.connections || [];
    },
    [configFiles]
  );

  // Handle reorder within same group
  const handleReorder = useCallback(
    async (configPath: string, connectionIds: string[]) => {
      try {
        const { data } = await (api.connections.reorder as any).put({
          configPath,
          connectionIds,
        });
        if (data && data.success) {
          onConnectionUpdated(configPath);
        } else {
          toast.error("Failed to reorder connections");
        }
      } catch {
        toast.error("Failed to reorder connections");
      }
    },
    [onConnectionUpdated]
  );

  // Handle move between groups
  const handleMove = useCallback(async () => {
    if (!pendingMove) return { success: false, error: "No pending move" };

    try {
      const { data } = await (api.connections.move as any).post({
        connectionId: pendingMove.connection.id,
        sourceConfigPath: pendingMove.sourceConfigPath,
        targetConfigPath: pendingMove.targetConfigPath,
        targetIndex: pendingMove.targetIndex,
      });

      if (data && data.success) {
        onConnectionMoved(pendingMove.sourceConfigPath, pendingMove.targetConfigPath);
        toast.success("Connection moved successfully");
        return { success: true };
      } else {
        return { success: false, error: (data as any)?.message || "Failed to move connection" };
      }
    } catch {
      return { success: false, error: "Failed to move connection" };
    }
  }, [pendingMove, onConnectionMoved]);

  // DnD event handlers
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === "connection") {
      setActiveConnection(data.connection);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback is handled by useDroppable in CredentialFileGroup
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveConnection(null);

    if (!over || !active) return;

    const activeData = active.data.current;
    if (!activeData || activeData.type !== "connection") return;

    const overData = over.data.current;
    if (!overData) return;

    const sourceConfigPath = activeData.sourceGroupPath || activeData.configPath;
    let targetConfigPath: string;
    let targetIndex: number | undefined;

    if (overData.type === "group") {
      targetConfigPath = overData.configPath;
      // Dropped on group header - add to end
      targetIndex = undefined;
    } else if (overData.type === "connection") {
      targetConfigPath = overData.configPath;
      // Find the index of the connection being dropped on
      const targetConnections = getConnectionsForGroup(targetConfigPath);
      const overIndex = targetConnections.findIndex((c) => c.id === over.id);
      targetIndex = overIndex >= 0 ? overIndex : undefined;
    } else {
      return;
    }

    if (sourceConfigPath === targetConfigPath) {
      // Same group - reorder
      const connections = getConnectionsForGroup(sourceConfigPath);
      const oldIndex = connections.findIndex((c) => c.id === active.id);
      const newIndex = targetIndex ?? connections.length - 1;

      if (oldIndex !== newIndex && oldIndex >= 0) {
        const newOrder = [...connections];
        const [removed] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, removed);
        await handleReorder(sourceConfigPath, newOrder.map((c) => c.id));
      }
    } else {
      // Different group - initiate move with confirmation
      setPendingMove({
        connection: activeData.connection,
        sourceConfigPath,
        targetConfigPath,
        targetIndex,
      });
    }
  };

  const handleDragCancel = () => {
    setActiveConnection(null);
  };

  // Get source and target groups for move dialog
  const sourceGroup = pendingMove
    ? configFiles.find((f) => f.path === pendingMove.sourceConfigPath) || null
    : null;
  const targetGroup = pendingMove
    ? configFiles.find((f) => f.path === pendingMove.targetConfigPath) || null
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="w-64 h-full border-r bg-card flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b">
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            S3 Explorer
          </h1>
        </div>

        {/* min-h-0 allows flex item to shrink below content size for scrolling */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-2">
            {configFiles.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="text-sm text-muted-foreground mb-4">
                  No workspaces yet
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleAddFileDialogChange(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Workspace
                </Button>
              </div>
            ) : (
              configFiles.map((configFile, index) => (
                <CredentialFileGroup
                  key={configFile.path}
                  configFile={configFile}
                  isFirst={index === 0}
                  activeConnectionId={activeConnectionId}
                  onSelectConnection={onSelectConnection}
                  onAddConnection={handleAddConnection}
                  onEditConnection={setEditConnection}
                  onDeleteConnection={setDeleteConnection}
                  onUnlock={setUnlockDialogPath}
                  onLock={onLockFile}
                  onRemove={onRemoveKnownPath}
                  onRename={setRenameDialogPath}
                />
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-2 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(props) => (
                <Button {...props} variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              )}
            />
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleAddFileDialogChange(true)}>
                <FilePlus className="h-4 w-4 mr-2" />
                Add Workspace
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLockAll}>
                <LogOut className="h-4 w-4 mr-2" />
                Lock All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Drag overlay - floating preview */}
        <DragOverlay>
          {activeConnection ? (
            <div className="bg-card border rounded-md shadow-lg px-3 py-2 opacity-95 flex items-start gap-2">
              {activeConnection.color && (
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: getColorHex(activeConnection.color) }}
                />
              )}
              <div>
                <div className="text-sm font-medium">{activeConnection.name}</div>
                <div className="text-xs text-muted-foreground">{activeConnection.bucket}</div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>

      <AddConnectionDialog
        open={addDialogOpen}
        configPath={addDialogConfigPath}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => {
          setAddDialogOpen(false);
          if (addDialogConfigPath) {
            onConnectionAdded(addDialogConfigPath);
          }
        }}
      />

      <EditConnectionDialog
        connection={editConnection}
        onOpenChange={(open) => !open && setEditConnection(null)}
        onSuccess={() => {
          if (editConnection) {
            onConnectionUpdated(editConnection.configPath);
          }
          setEditConnection(null);
        }}
      />

      <DeleteConnectionDialog
        connection={deleteConnection}
        onOpenChange={(open) => !open && setDeleteConnection(null)}
        onSuccess={() => {
          if (deleteConnection) {
            onConnectionDeleted(deleteConnection.id, deleteConnection.configPath);
          }
          setDeleteConnection(null);
        }}
      />

      <AddCredentialFileDialog
        open={addFileDialogOpen}
        onOpenChange={handleAddFileDialogChange}
        onAdd={handleAddFile}
        onUnlock={setUnlockDialogPath}
        onSetup={(path, name) => setSetupDialog({ path, name })}
      />

      <UnlockFileDialog
        open={!!unlockDialogPath}
        configPath={unlockDialogPath}
        onOpenChange={(open) => !open && setUnlockDialogPath(null)}
        onUnlock={onUnlockFile}
      />

      <SetupFileDialog
        open={!!setupDialog}
        configPath={setupDialog?.path || null}
        workspaceName={setupDialog?.name || ""}
        onOpenChange={(open) => !open && setSetupDialog(null)}
        onSetup={onSetupFile}
      />

      <RenameGroupDialog
        open={!!renameDialogPath}
        configPath={renameDialogPath}
        currentName={configFiles.find((f) => f.path === renameDialogPath)?.name || ""}
        onOpenChange={(open) => !open && setRenameDialogPath(null)}
        onRename={onRenameGroup}
      />

      <MoveConnectionDialog
        open={!!pendingMove}
        connection={pendingMove?.connection || null}
        sourceGroup={sourceGroup}
        targetGroup={targetGroup}
        onOpenChange={(open) => !open && setPendingMove(null)}
        onUnlockTarget={onUnlockFile}
        onMove={handleMove}
      />
    </DndContext>
  );
}
