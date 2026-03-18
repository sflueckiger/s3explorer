import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onAddTab: () => void;
}

export function BucketTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
}: BucketTabsProps) {
  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Select a connection from the sidebar to start browsing
          </p>
          <Button variant="outline" onClick={onAddTab}>
            <Plus className="h-4 w-4 mr-2" />
            Open Connection
          </Button>
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
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-3 rounded-none border-r"
              onClick={onAddTab}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.connectionId}
          value={tab.connectionId}
          className="flex-1 m-0 data-[state=inactive]:hidden"
        >
          <ColumnBrowser connectionId={tab.connectionId} connection={tab.connection} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
