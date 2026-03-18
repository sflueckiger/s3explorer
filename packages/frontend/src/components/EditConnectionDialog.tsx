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
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { ColorPicker } from "@/components/ColorPicker";

import type { Connection } from "@/types";

interface EditConnectionDialogProps {
  connection: Connection | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditConnectionDialog({
  connection,
  onOpenChange,
  onSuccess,
}: EditConnectionDialogProps) {
  const [name, setName] = useState("");
  const [bucket, setBucket] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [region, setRegion] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [color, setColor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connection) {
      setLoadingDetails(true);
      // Fetch full connection details including secrets
      api.connections({ id: connection.id })
        .get()
        .then(({ data }) => {
          if (data && data.success) {
            const conn = (data as any).connection;
            setName(conn.name || "");
            setBucket(conn.bucket || "");
            setEndpoint(conn.endpoint || "");
            setRegion(conn.region || "");
            setAccessKeyId(conn.accessKeyId || "");
            setSecretAccessKey(conn.secretAccessKey || "");
            setSessionToken(conn.sessionToken || "");
            setColor(conn.color || undefined);
          }
        })
        .finally(() => setLoadingDetails(false));
    }
  }, [connection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connection) return;

    setError(null);
    setLoading(true);

    try {
      const { data } = await (api.connections({ id: connection.id }) as any).put({
        name,
        bucket,
        endpoint: endpoint || undefined,
        region: region || undefined,
        accessKeyId,
        secretAccessKey,
        sessionToken: sessionToken || undefined,
        color: color || undefined,
        configPath: connection.configPath,
      });

      if (data && data.success) {
        toast.success("Connection updated successfully");
        onSuccess();
      } else {
        setError((data as any)?.message || "Failed to update connection");
      }
    } catch (err) {
      setError("Failed to update connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!connection} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Connection</DialogTitle>
            <DialogDescription>
              Update the connection details. Credentials will be validated before saving.
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Connection Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Production Assets"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-bucket">Bucket Name</Label>
                <Input
                  id="edit-bucket"
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value)}
                  placeholder="my-bucket"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-endpoint">Endpoint (optional)</Label>
                  <Input
                    id="edit-endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-region">Region (optional)</Label>
                  <Input
                    id="edit-region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="us-east-1"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-accessKeyId">Access Key ID</Label>
                <Input
                  id="edit-accessKeyId"
                  value={accessKeyId}
                  onChange={(e) => setAccessKeyId(e.target.value)}
                  placeholder="AKIA..."
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-secretAccessKey">Secret Access Key</Label>
                <Input
                  id="edit-secretAccessKey"
                  type="password"
                  value={secretAccessKey}
                  onChange={(e) => setSecretAccessKey(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-sessionToken">Session Token (optional)</Label>
                <Input
                  id="edit-sessionToken"
                  type="password"
                  value={sessionToken}
                  onChange={(e) => setSessionToken(e.target.value)}
                  placeholder="For temporary credentials"
                />
              </div>

              <div className="grid gap-2">
                <Label>Color (optional)</Label>
                <ColorPicker value={color} onChange={setColor} />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingDetails}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
