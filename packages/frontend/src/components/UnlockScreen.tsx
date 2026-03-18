import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, FolderOpen, AlertCircle, Eye, EyeOff, Plus, ArrowLeft } from "lucide-react";

interface UnlockScreenProps {
  isFirstRun: boolean;
  defaultConfigPath: string;
  onUnlock: (password: string, configPath?: string) => Promise<{ success: boolean; error?: string }>;
  onSetup: (password: string, configPath?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  onAddWorkspace: (path: string, name: string) => Promise<void>;
}

type Mode = "choose" | "create" | "open";

export function UnlockScreen({ isFirstRun, defaultConfigPath, onUnlock, onSetup, onAddWorkspace }: UnlockScreenProps) {
  const [mode, setMode] = useState<Mode>(isFirstRun ? "choose" : "open");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [configPath, setConfigPath] = useState(defaultConfigPath);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setPassword("");
    setConfirmPassword("");
    setWorkspaceName("");
    setConfigPath(defaultConfigPath);
    setError(null);
  };

  const handleBack = () => {
    resetForm();
    setMode("choose");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!workspaceName.trim()) {
      setError("Workspace name is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    // First set up the encrypted config
    const result = await onSetup(password, configPath, workspaceName.trim());

    if (result.success) {
      // Add to workspaces list
      await onAddWorkspace(configPath, workspaceName.trim());
    }

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Failed to create workspace");
    }
  };

  const handleOpenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!configPath.trim()) {
      setError("File path is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    // Add to workspaces list first
    const name = workspaceName.trim() || "Workspace";
    await onAddWorkspace(configPath.trim(), name);

    // Then try to unlock
    const result = await onUnlock(password, configPath.trim());

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Failed to unlock");
    }
  };

  // Choose mode - first run only
  if (mode === "choose") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to S3 Explorer</CardTitle>
            <CardDescription>
              Browse and manage your S3 buckets with encrypted credential storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => setMode("create")}
            >
              <Plus className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Create new workspace</div>
                <div className="text-xs text-primary-foreground/70 font-normal">
                  Set up a new encrypted credentials file
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => setMode("open")}
            >
              <FolderOpen className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Open existing workspace</div>
                <div className="text-xs text-muted-foreground font-normal">
                  I already have a workspace file
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create mode
  if (mode === "create") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create New Workspace</CardTitle>
            <CardDescription>
              Set up a master password to encrypt your S3 credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspaceName">Workspace Name</Label>
                <Input
                  id="workspaceName"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g., Personal, Work"
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Master Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters. This password encrypts all your S3 credentials.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="configPath">File Location</Label>
                <Input
                  id="configPath"
                  value={configPath}
                  onChange={(e) => setConfigPath(e.target.value)}
                  placeholder={defaultConfigPath}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Where to store your encrypted credentials file
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading || !password || !workspaceName}>
                  {loading ? "Creating..." : "Create Workspace"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Open mode (also used for non-first-run unlock)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isFirstRun ? "Open Existing Workspace" : "Unlock S3 Explorer"}
          </CardTitle>
          <CardDescription>
            {isFirstRun
              ? "Enter the path to your existing workspace file"
              : "Enter your master password to access your connections"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOpenSubmit} className="space-y-4">
            {isFirstRun && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g., Personal, Work"
                    autoFocus
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    A display name for this workspace
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="configPath">File Path</Label>
                  <Input
                    id="configPath"
                    value={configPath}
                    onChange={(e) => setConfigPath(e.target.value)}
                    placeholder="~/.s3explore/config.enc"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Path to your existing encrypted credentials file
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoFocus={!isFirstRun}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              {isFirstRun && (
                <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <Button type="submit" className={isFirstRun ? "flex-1" : "w-full"} disabled={loading || !password}>
                {loading ? "Unlocking..." : "Unlock"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
