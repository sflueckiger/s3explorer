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

interface UnlockFileDialogProps {
  open: boolean;
  configPath: string | null;
  onOpenChange: (open: boolean) => void;
  onUnlock: (password: string, configPath: string) => Promise<{ success: boolean; error?: string }>;
}

export function UnlockFileDialog({
  open,
  configPath,
  onOpenChange,
  onUnlock,
}: UnlockFileDialogProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setPassword("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configPath) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onUnlock(password, configPath);
      if (result.success) {
        resetForm();
        onOpenChange(false);
      } else {
        setError(result.error || "Failed to unlock");
      }
    } catch (err) {
      setError("Failed to unlock");
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
            <DialogTitle>Unlock Credential File</DialogTitle>
            <DialogDescription>
              Enter the password to unlock this credential file.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="text-sm font-mono bg-muted p-2 rounded break-all">
              {configPath}
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
            <Button type="submit" disabled={loading || !password}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Unlock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
