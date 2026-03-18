import { useState } from "react";
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
import { AlertCircle, Loader2 } from "lucide-react";

interface AddCredentialFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (path: string, name: string) => Promise<{ exists: boolean; unlocked: boolean; configPath: string }>;
  onUnlock: (path: string) => void;
  onSetup: (path: string, name: string) => void;
}

const DEFAULT_PATH = "~/.s3explore/config.enc";

export function AddCredentialFileDialog({
  open,
  onOpenChange,
  onAdd,
  onUnlock,
  onSetup,
}: AddCredentialFileDialogProps) {
  const [name, setName] = useState("");
  const [path, setPath] = useState(DEFAULT_PATH);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setPath(DEFAULT_PATH);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }
    if (!path.trim()) {
      setError("File path is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const workspaceName = name.trim();
      const status = await onAdd(path.trim(), workspaceName);
      resetForm();
      onOpenChange(false);

      // Use the expanded path from the backend response
      const expandedPath = status.configPath;

      if (status.exists && !status.unlocked) {
        // File exists but locked - prompt unlock
        onUnlock(expandedPath);
      } else if (!status.exists) {
        // File doesn't exist - prompt setup with name
        onSetup(expandedPath, workspaceName);
      }
      // If already unlocked, just close
    } catch (err) {
      setError("Failed to add workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Workspace</DialogTitle>
            <DialogDescription>
              Please indicate the location of your connection file for this
              workspace. If it does not exist, it will be created automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="workspaceName">Workspace Name</Label>
              <Input
                id="workspaceName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Work, Personal"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="path">File Path</Label>
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use ~ for home directory. Example: ~/.s3explore/work.enc
              </p>
            </div>

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
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
