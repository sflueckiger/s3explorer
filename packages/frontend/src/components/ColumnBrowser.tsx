import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { Folder, File, FileText, FileImage, FileVideo, Loader2, AlertCircle, MoreHorizontal } from "lucide-react";
import { PreviewPanel } from "./PreviewPanel";
import { cn } from "@/lib/utils";

interface Connection {
  id: string;
  name: string;
  bucket: string;
}

interface S3Object {
  key: string;
  name: string;
  size: number;
  lastModified: string;
}

interface S3Folder {
  prefix: string;
  name: string;
}

interface BrowseData {
  folders: S3Folder[];
  files: S3Object[];
  isTruncated: boolean;
  nextContinuationToken?: string;
  prefix: string;
}

interface Column {
  prefix: string;
  data: BrowseData | null;
  loading: boolean;
  error: string | null;
  selectedItem: string | null; // key or prefix
}

interface ColumnBrowserProps {
  connectionId: string;
  connection: Connection;
}

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
const TEXT_EXTENSIONS = ["txt", "json", "md", "yaml", "yml", "xml", "csv", "log"];
const VIDEO_EXTENSIONS = ["mp4", "webm"];

function getExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function getFileIcon(name: string) {
  const ext = getExtension(name);
  if (IMAGE_EXTENSIONS.includes(ext)) {
    return <FileImage className="h-4 w-4 text-blue-500" />;
  }
  if (VIDEO_EXTENSIONS.includes(ext)) {
    return <FileVideo className="h-4 w-4 text-purple-500" />;
  }
  if (TEXT_EXTENSIONS.includes(ext)) {
    return <FileText className="h-4 w-4 text-amber-500" />;
  }
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const COMPACTION_THRESHOLD = 4;

interface CompactIndicatorProps {
  hiddenCount: number;
  isExpanded: boolean;
  onClick: () => void;
}

function CompactIndicator({ hiddenCount, isExpanded, onClick }: CompactIndicatorProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-12 h-full border-r flex flex-col items-center justify-center flex-shrink-0",
        "bg-muted/50 hover:bg-muted transition-colors cursor-pointer",
        isExpanded && "bg-muted"
      )}
      title={`${hiddenCount} hidden column${hiddenCount > 1 ? "s" : ""} - click to ${isExpanded ? "collapse" : "expand"}`}
    >
      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground mt-1">{hiddenCount}</span>
    </button>
  );
}

function useColumnCompaction<T>(columns: T[]) {
  return useMemo(() => {
    const shouldCompact = columns.length > COMPACTION_THRESHOLD;

    if (!shouldCompact) {
      return {
        shouldCompact: false,
        visibleColumns: columns,
        hiddenColumns: [] as T[],
        firstColumn: columns[0] as T | undefined,
        lastTwoColumns: columns.slice(-2),
        hiddenCount: 0,
      };
    }

    const firstColumn = columns[0];
    const hiddenColumns = columns.slice(1, -2);
    const lastTwoColumns = columns.slice(-2);

    return {
      shouldCompact: true,
      visibleColumns: [firstColumn, ...lastTwoColumns],
      hiddenColumns,
      firstColumn,
      lastTwoColumns,
      hiddenCount: hiddenColumns.length,
    };
  }, [columns]);
}

export function ColumnBrowser({ connectionId, connection }: ColumnBrowserProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedFile, setSelectedFile] = useState<S3Object | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

  const compaction = useColumnCompaction(columns);

  const loadColumn = useCallback(
    async (prefix: string, columnIndex: number) => {
      // Update column to loading state
      setColumns((prev) => {
        const newColumns = prev.slice(0, columnIndex + 1);
        if (newColumns[columnIndex]) {
          newColumns[columnIndex] = { ...newColumns[columnIndex], loading: true, error: null };
        } else {
          newColumns[columnIndex] = {
            prefix,
            data: null,
            loading: true,
            error: null,
            selectedItem: null,
          };
        }
        return newColumns;
      });

      try {
        const { data } = await api.browse({ connId: connectionId }).get({
          query: { prefix },
        });

        if (data && data.success) {
          setColumns((prev) => {
            const newColumns = [...prev];
            newColumns[columnIndex] = {
              prefix,
              data: (data as any).data,
              loading: false,
              error: null,
              selectedItem: null,
            };
            return newColumns;
          });
        } else {
          throw new Error((data as any)?.message || "Failed to load");
        }
      } catch (error) {
        setColumns((prev) => {
          const newColumns = [...prev];
          newColumns[columnIndex] = {
            prefix,
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : "Failed to load",
            selectedItem: null,
          };
          return newColumns;
        });
      }
    },
    [connectionId]
  );

  // Load root on mount
  useEffect(() => {
    loadColumn("", 0);
  }, [loadColumn]);

  // Scroll to end when columns change to keep last column visible
  useEffect(() => {
    if (scrollRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
      });
    }
  }, [columns.length]);

  // Collapse expanded view on outside click
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (expandedRef.current && !expandedRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  // Collapse expanded view when columns change (navigation occurred)
  useEffect(() => {
    setIsExpanded(false);
  }, [columns.length]);

  const handleSelectFolder = useCallback(
    (columnIndex: number, folder: S3Folder) => {
      // Update selection in current column
      setColumns((prev) => {
        const newColumns = prev.slice(0, columnIndex + 1);
        newColumns[columnIndex] = {
          ...newColumns[columnIndex],
          selectedItem: folder.prefix,
        };
        return newColumns;
      });
      setSelectedFile(null);

      // Load next column
      loadColumn(folder.prefix, columnIndex + 1);
    },
    [loadColumn]
  );

  const handleSelectFile = useCallback((columnIndex: number, file: S3Object) => {
    // Update selection in current column and remove columns after
    setColumns((prev) => {
      const newColumns = prev.slice(0, columnIndex + 1);
      newColumns[columnIndex] = {
        ...newColumns[columnIndex],
        selectedItem: file.key,
      };
      return newColumns;
    });
    setSelectedFile(file);
  }, []);

  const handleBreadcrumbClick = useCallback(
    (index: number) => {
      if (index === 0) {
        // Root
        setColumns((prev) => [{ ...prev[0], selectedItem: null }]);
        setSelectedFile(null);
      } else {
        setColumns((prev) => {
          const newColumns = prev.slice(0, index + 1);
          newColumns[index] = { ...newColumns[index], selectedItem: null };
          return newColumns;
        });
        setSelectedFile(null);
      }
    },
    []
  );

  // Build breadcrumb path
  const breadcrumbs = [connection.bucket];
  columns.forEach((col) => {
    if (col.selectedItem && col.selectedItem.endsWith("/")) {
      const parts = col.selectedItem.split("/").filter(Boolean);
      if (parts.length > 0) {
        breadcrumbs.push(parts[parts.length - 1]);
      }
    }
  });

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-muted/30 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && <span className="mx-1 text-muted-foreground">/</span>}
            <button
              className="hover:text-primary hover:underline"
              onClick={() => handleBreadcrumbClick(i)}
            >
              {crumb}
            </button>
          </span>
        ))}
      </div>

      {/* Column browser + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columns - scrollable area */}
        <div className="flex-1 overflow-x-auto" ref={scrollRef}>
          <div className="flex h-full">
            {compaction.shouldCompact ? (
              <>
                {/* First column (root) */}
                {compaction.firstColumn && renderColumn(compaction.firstColumn, 0)}

                {/* Compact indicator for hidden columns */}
                <CompactIndicator
                  hiddenCount={compaction.hiddenCount}
                  isExpanded={isExpanded}
                  onClick={() => setIsExpanded(!isExpanded)}
                />

                {/* Expanded overlay for hidden columns */}
                {isExpanded && (
                  <div
                    ref={expandedRef}
                    className="flex h-full bg-background shadow-lg border-r"
                  >
                    {compaction.hiddenColumns.map((column, idx) => {
                      const originalIndex = idx + 1;
                      return renderColumn(column, originalIndex);
                    })}
                  </div>
                )}

                {/* Last two columns */}
                {compaction.lastTwoColumns.map((column, idx) => {
                  const originalIndex = columns.length - 2 + idx;
                  return renderColumn(column, originalIndex);
                })}
              </>
            ) : (
              columns.map((column, columnIndex) => renderColumn(column, columnIndex))
            )}
          </div>
        </div>

        {/* Preview Panel - fixed right, outside scroll area */}
        <PreviewPanel
          connectionId={connectionId}
          file={selectedFile}
        />
      </div>
    </div>
  );

  function renderColumn(column: Column, columnIndex: number) {
    // Don't render empty columns (no data, not loading, no error)
    if (!column.loading && !column.error && !column.data) {
      return null;
    }

    return (
      <div
        key={column.prefix + columnIndex}
        className="w-64 h-full border-r flex flex-col flex-shrink-0"
      >
        {column.loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : column.error ? (
          <div className="flex-1 flex items-center justify-center p-4 text-center">
            <div className="text-destructive">
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">{column.error}</p>
            </div>
          </div>
        ) : column.data ? (
          <ScrollArea className="flex-1">
            <div className="p-1">
              {/* Folders */}
              {column.data.folders.map((folder) => (
                <button
                  key={folder.prefix}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-accent",
                    column.selectedItem === folder.prefix && "bg-accent"
                  )}
                  onClick={() => handleSelectFolder(columnIndex, folder)}
                >
                  <Folder className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span className="truncate text-sm">{folder.name}</span>
                </button>
              ))}
              {/* Files */}
              {column.data.files.map((file) => (
                <button
                  key={file.key}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-accent group",
                    column.selectedItem === file.key && "bg-accent"
                  )}
                  onClick={() => handleSelectFile(columnIndex, file)}
                >
                  <div className="flex-shrink-0">{getFileIcon(file.name)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </button>
              ))}
              {column.data.folders.length === 0 && column.data.files.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Empty folder
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </div>
    );
  }
}
