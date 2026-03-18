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
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";

import type { Connection } from "@/types";

interface DeleteConnectionDialogProps {
  connection: Connection | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteConnectionDialog({
  connection,
  onOpenChange,
  onSuccess,
}: DeleteConnectionDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!connection) return;

    setLoading(true);
    try {
      const { data } = await (api.connections({ id: connection.id }) as any).delete({
        $query: { configPath: connection.configPath },
      });

      if (data && data.success) {
        toast.success("Connection deleted");
        onSuccess();
      } else {
        toast.error((data as any)?.message || "Failed to delete connection");
      }
    } catch (err) {
      toast.error("Failed to delete connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!connection} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Connection</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the connection{" "}
            <span className="font-medium text-foreground">{connection?.name}</span>? This will
            remove all saved credentials for this bucket.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
