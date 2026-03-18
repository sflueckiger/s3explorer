import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, FolderOpen, AlertCircle, Eye, EyeOff } from "lucide-react";

interface UnlockScreenProps {
  isFirstRun: boolean;
  defaultConfigPath: string;
  onUnlock: (password: string, configPath?: string) => Promise<{ success: boolean; error?: string }>;
  onSetup: (password: string, configPath?: string) => Promise<{ success: boolean; error?: string }>;
}

export function UnlockScreen({ isFirstRun, defaultConfigPath, onUnlock, onSetup }: UnlockScreenProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [configPath, setConfigPath] = useState(defaultConfigPath);
  const [showConfigPath, setShowConfigPath] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isFirstRun) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setLoading(true);
    const customPath = showConfigPath && configPath !== defaultConfigPath ? configPath : undefined;

    const result = isFirstRun
      ? await onSetup(password, customPath)
      : await onUnlock(password, customPath);

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Operation failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isFirstRun ? "Welcome to S3 Explorer" : "Unlock S3 Explorer"}
          </CardTitle>
          <CardDescription>
            {isFirstRun
              ? "Set up your master password to encrypt your S3 credentials"
              : "Enter your master password to access your connections"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                {isFirstRun ? "Master Password" : "Password"}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isFirstRun ? "Create a strong password" : "Enter your password"}
                  autoFocus
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
              {isFirstRun && (
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters. This password encrypts all your S3 credentials.
                </p>
              )}
            </div>

            {isFirstRun && (
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
            )}

            <div className="space-y-2">
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfigPath(!showConfigPath)}
              >
                <FolderOpen className="h-4 w-4" />
                {showConfigPath ? "Hide config path" : "Use custom config path"}
              </button>

              {showConfigPath && (
                <Input
                  id="configPath"
                  value={configPath}
                  onChange={(e) => setConfigPath(e.target.value)}
                  placeholder={defaultConfigPath}
                  disabled={loading}
                />
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !password}>
              {loading ? "Loading..." : isFirstRun ? "Create & Unlock" : "Unlock"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
