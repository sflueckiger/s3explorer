import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, AlertTriangle, Loader2, Lock } from "lucide-react";
import type { Connection, ConfigFile } from "@/types";

interface MoveConnectionDialogProps {
  open: boolean;
  connection: Connection | null;
  sourceGroup: ConfigFile | null;
  targetGroup: ConfigFile | null;
  onOpenChange: (open: boolean) => void;
  onUnlockTarget: (password: string, configPath: string) => Promise<{ success: boolean; error?: string }>;
  onMove: () => Promise<{ success: boolean; error?: string }>;
}

export function MoveConnectionDialog({
  open,
  connection,
  sourceGroup,
  targetGroup,
  onOpenChange,
  onUnlockTarget,
  onMove,
}: MoveConnectionDialogProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockStep, setUnlockStep] = useState(false);

  // Determine if target needs unlocking
  const needsUnlock = targetGroup && !targetGroup.isUnlocked;

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setPassword("");
      setError(null);
      setUnlockStep(!!needsUnlock);
    }
  }, [open, needsUnlock]);

  const sourceDisplayName = sourceGroup?.name ||
    sourceGroup?.path.split("/").pop()?.replace(/\.enc$/, "") ||
    "Unknown";

  const targetDisplayName = targetGroup?.name ||
    targetGroup?.path.split("/").pop()?.replace(/\.enc$/, "") ||
    "Unknown";

  const handleUnlock = async () => {
    if (!targetGroup) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onUnlockTarget(password, targetGroup.path);
      if (result.success) {
        setUnlockStep(false);
        setPassword("");
      } else {
        setError(result.error || "Failed to unlock");
      }
    } catch {
      setError("Failed to unlock");
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await onMove();
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error || "Failed to move connection");
      }
    } catch {
      setError("Failed to move connection");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockStep) {
      await handleUnlock();
    } else {
      await handleMove();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {unlockStep ? "Unlock Target Workspace" : "Move Connection"}
            </DialogTitle>
            <DialogDescription>
              {unlockStep
                ? `Enter the password to unlock "${targetDisplayName}" before moving.`
                : `Move "${connection?.name}" to a different workspace.`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {unlockStep ? (
              <>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{targetDisplayName}</span>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoFocus
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      This will move the connection between credential files
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      The connection will be removed from <strong>{sourceDisplayName}</strong> and
                      added to <strong>{targetDisplayName}</strong>.
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Connection</span>
                    <span className="font-medium">{connection?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-medium">{sourceDisplayName}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-medium">{targetDisplayName}</span>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {unlockStep ? "Unlock" : "Move Connection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
