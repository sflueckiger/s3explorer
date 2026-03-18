import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lock, Plus, MoreVertical, Pencil, Trash2, Unlock } from "lucide-react";
import type { ConfigFile, Connection } from "@/types";

interface CredentialFileGroupProps {
  configFile: ConfigFile;
  isFirst: boolean;
  activeConnectionId: string | null;
  onSelectConnection: (connection: Connection) => void;
  onAddConnection: (configPath: string) => void;
  onEditConnection: (connection: Connection) => void;
  onDeleteConnection: (connection: Connection) => void;
  onUnlock: (configPath: string) => void;
  onLock: (configPath: string) => void;
  onRemove: (configPath: string) => void;
}

function truncatePath(path: string, maxLength: number = 30): string {
  if (path.length <= maxLength) return path;
  // Keep the last part of the path
  const parts = path.split("/");
  let result = parts[parts.length - 1];
  for (let i = parts.length - 2; i >= 0; i--) {
    const next = parts[i] + "/" + result;
    if (next.length > maxLength - 3) {
      return "..." + result;
    }
    result = next;
  }
  return result;
}

export function CredentialFileGroup({
  configFile,
  isFirst,
  activeConnectionId,
  onSelectConnection,
  onAddConnection,
  onEditConnection,
  onDeleteConnection,
  onUnlock,
  onLock,
  onRemove,
}: CredentialFileGroupProps) {
  const { path, isUnlocked, connections } = configFile;

  return (
    <div className={!isFirst ? "border-t pt-2 mt-2" : ""}>
      {/* File header */}
      <div className="flex items-center justify-between px-2 py-1 group">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!isUnlocked && (
            <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
          <span
            className="text-xs text-muted-foreground italic truncate"
            title={path}
          >
            {truncatePath(path)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isUnlocked && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onAddConnection(path)}
              title="Add connection"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(props) => (
                <Button
                  {...props}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              )}
            />
            <DropdownMenuContent align="end">
              {isUnlocked ? (
                <DropdownMenuItem onClick={() => onLock(path)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Lock
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onUnlock(path)}>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onRemove(path)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Connections list or locked state */}
      {isUnlocked ? (
        <div className="space-y-1 mt-1">
          {connections.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-2 px-4">
              No connections yet
            </div>
          ) : (
            connections.map((conn) => (
              <div
                key={conn.id}
                className={`
                  group/conn flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer
                  hover:bg-accent transition-colors ml-4
                  ${activeConnectionId === conn.id ? "bg-accent" : ""}
                `}
              >
                <button
                  className="flex-1 text-left truncate"
                  onClick={() => onSelectConnection(conn)}
                >
                  <div className="text-sm font-medium truncate">{conn.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {conn.bucket}
                  </div>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={(props) => (
                      <Button
                        {...props}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover/conn:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditConnection(conn)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDeleteConnection(conn)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-3 ml-4">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onUnlock(path)}
          >
            <Unlock className="h-3 w-3 mr-1" />
            Unlock
          </Button>
        </div>
      )}
    </div>
  );
}
