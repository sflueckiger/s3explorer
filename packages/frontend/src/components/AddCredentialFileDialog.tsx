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
  onAdd: (path: string) => Promise<{ exists: boolean; unlocked: boolean; configPath: string }>;
  onUnlock: (path: string) => void;
  onSetup: (path: string) => void;
}

export function AddCredentialFileDialog({
  open,
  onOpenChange,
  onAdd,
  onUnlock,
  onSetup,
}: AddCredentialFileDialogProps) {
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setPath("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!path.trim()) {
      setError("Path is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const status = await onAdd(path.trim());
      resetForm();
      onOpenChange(false);

      // Use the expanded path from the backend response
      const expandedPath = status.configPath;

      if (status.exists && !status.unlocked) {
        // File exists but locked - prompt unlock
        onUnlock(expandedPath);
      } else if (!status.exists) {
        // File doesn't exist - prompt setup
        onSetup(expandedPath);
      }
      // If already unlocked, just close
    } catch (err) {
      setError("Failed to add credential file");
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
            <DialogTitle>Add Credential File</DialogTitle>
            <DialogDescription>
              Enter the path to a credential file. If it doesn't exist, you'll
              be prompted to create it.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="path">File Path</Label>
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="~/.s3explore/config.enc"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Use ~ for home directory. Example: ~/.s3explore/personal.enc
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
