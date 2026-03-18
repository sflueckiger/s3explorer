import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { UnlockScreen } from "@/components/UnlockScreen";
import { MainApp } from "@/components/MainApp";

function App() {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show unlock screen if no files are unlocked and it's first run
  if (!auth.hasUnlockedFiles && auth.isFirstRun) {
    return (
      <>
        <UnlockScreen
          isFirstRun={auth.isFirstRun}
          defaultConfigPath={auth.defaultConfigPath}
          onUnlock={auth.unlock}
          onSetup={auth.setup}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <MainApp
        configFiles={auth.configFiles}
        onLockAll={auth.lockAll}
        onLockFile={auth.lockFile}
        onUnlockFile={auth.unlockFile}
        onSetupFile={auth.setupFile}
        onCheckFileStatus={auth.checkFileStatus}
        onChangePassword={auth.changePassword}
        setFileConnections={auth.setFileConnections}
        addKnownPath={auth.addKnownPath}
        removeKnownPath={auth.removeKnownPath}
      />
      <Toaster />
    </>
  );
}

export default App;
