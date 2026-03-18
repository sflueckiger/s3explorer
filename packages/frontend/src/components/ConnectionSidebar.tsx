import { useState } from "react";
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
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { AddCredentialFileDialog } from "./AddCredentialFileDialog";
import { UnlockFileDialog } from "./UnlockFileDialog";
import { SetupFileDialog } from "./SetupFileDialog";
import { CredentialFileGroup } from "./CredentialFileGroup";
import type { ConfigFile, Connection } from "@/types";

interface ConnectionSidebarProps {
  configFiles: ConfigFile[];
  activeConnectionId: string | null;
  onSelectConnection: (connection: Connection) => void;
  onConnectionAdded: (configPath: string) => void;
  onConnectionUpdated: (configPath: string) => void;
  onConnectionDeleted: (connectionId: string, configPath: string) => void;
  onLockAll: () => void;
  onLockFile: (configPath: string) => void;
  onUnlockFile: (password: string, configPath: string) => Promise<{ success: boolean; error?: string }>;
  onSetupFile: (password: string, configPath: string) => Promise<{ success: boolean; error?: string }>;
  onCheckFileStatus: (configPath: string) => Promise<{ exists: boolean; unlocked: boolean } | null>;
  onAddKnownPath: (path: string) => void;
  onRemoveKnownPath: (path: string) => void;
  onChangePassword: (current: string, newPwd: string, configPath?: string) => Promise<{ success: boolean; error?: string }>;
}

export function ConnectionSidebar({
  configFiles,
  activeConnectionId,
  onSelectConnection,
  onConnectionAdded,
  onConnectionUpdated,
  onConnectionDeleted,
  onLockAll,
  onLockFile,
  onUnlockFile,
  onSetupFile,
  onCheckFileStatus,
  onAddKnownPath,
  onRemoveKnownPath,
  onChangePassword,
}: ConnectionSidebarProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogConfigPath, setAddDialogConfigPath] = useState<string | null>(null);
  const [editConnection, setEditConnection] = useState<Connection | null>(null);
  const [deleteConnection, setDeleteConnection] = useState<Connection | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [addFileDialogOpen, setAddFileDialogOpen] = useState(false);
  const [unlockDialogPath, setUnlockDialogPath] = useState<string | null>(null);
  const [setupDialogPath, setSetupDialogPath] = useState<string | null>(null);

  const handleAddConnection = (configPath: string) => {
    setAddDialogConfigPath(configPath);
    setAddDialogOpen(true);
  };

  const handleAddFile = async (path: string) => {
    const status = await onCheckFileStatus(path);
    if (status) {
      // Use the expanded path from the backend response
      const expandedPath = (status as any).configPath || path;
      onAddKnownPath(expandedPath);
      return { ...status, configPath: expandedPath };
    }
    return { exists: false, unlocked: false, configPath: path };
  };

  return (
    <div className="w-64 h-full border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <h1 className="font-semibold text-lg flex items-center gap-2">
          <Database className="h-5 w-5" />
          S3 Explorer
        </h1>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {configFiles.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="text-sm text-muted-foreground mb-4">
                No credential files. Add one to get started.
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setAddFileDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Credential File
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
            <DropdownMenuItem onClick={() => setAddFileDialogOpen(true)}>
              <FilePlus className="h-4 w-4 mr-2" />
              Add Credential File
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLockAll}>
              <LogOut className="h-4 w-4 mr-2" />
              Lock All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        onChangePassword={onChangePassword}
      />

      <AddCredentialFileDialog
        open={addFileDialogOpen}
        onOpenChange={setAddFileDialogOpen}
        onAdd={handleAddFile}
        onUnlock={setUnlockDialogPath}
        onSetup={setSetupDialogPath}
      />

      <UnlockFileDialog
        open={!!unlockDialogPath}
        configPath={unlockDialogPath}
        onOpenChange={(open) => !open && setUnlockDialogPath(null)}
        onUnlock={onUnlockFile}
      />

      <SetupFileDialog
        open={!!setupDialogPath}
        configPath={setupDialogPath}
        onOpenChange={(open) => !open && setSetupDialogPath(null)}
        onSetup={onSetupFile}
      />
    </div>
  );
}
