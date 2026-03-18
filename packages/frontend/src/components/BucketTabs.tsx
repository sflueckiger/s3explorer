import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X, Plus } from "lucide-react";
import { ColumnBrowser } from "./ColumnBrowser";

interface Connection {
  id: string;
  name: string;
  bucket: string;
  endpoint?: string;
  region?: string;
}

interface OpenTab {
  connectionId: string;
  connection: Connection;
}

interface BucketTabsProps {
  tabs: OpenTab[];
  activeTabId: string | null;
  hasWorkspaces: boolean;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCreateWorkspace: () => void;
}

export function BucketTabs({
  tabs,
  activeTabId,
  hasWorkspaces,
  onSelectTab,
  onCloseTab,
  onCreateWorkspace,
}: BucketTabsProps) {
  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          {hasWorkspaces ? (
            <p className="text-muted-foreground">
              Select a connection from the sidebar to start browsing
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                No workspaces yet. Create one to get started.
              </p>
              <Button variant="outline" onClick={onCreateWorkspace}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first workspace
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <Tabs
      value={activeTabId || undefined}
      onValueChange={onSelectTab}
      className="flex-1 flex flex-col"
    >
      <div className="border-b bg-muted/30">
        <ScrollArea className="w-full">
          <div className="flex items-center">
            <TabsList className="h-10 bg-transparent p-0 gap-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.connectionId}
                  value={tab.connectionId}
                  className="relative h-10 rounded-none border-r data-[state=active]:bg-background data-[state=active]:shadow-none px-4 gap-2"
                >
                  <span className="truncate max-w-[120px]">{tab.connection.name}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onCloseTab(tab.connectionId);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        e.preventDefault();
                        onCloseTab(tab.connectionId);
                      }
                    }}
                    className="ml-1 rounded-sm opacity-70 hover:opacity-100 hover:bg-muted p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Render all tabs unconditionally to preserve state, use CSS to show/hide */}
      <div className="flex-1 relative">
        {tabs.map((tab) => (
          <div
            key={tab.connectionId}
            className={`absolute inset-0 ${tab.connectionId === activeTabId ? '' : 'hidden'}`}
          >
            <ColumnBrowser connectionId={tab.connectionId} connection={tab.connection} />
          </div>
        ))}
      </div>
    </Tabs>
  );
}
