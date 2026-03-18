import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, Image, File, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface S3Object {
  key: string;
  name: string;
  size: number;
  lastModified: string;
}

interface PreviewPanelProps {
  connectionId: string;
  file: S3Object | null;
}

interface FileMetadata {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  contentType: string;
  isPreviewable: boolean;
  previewType: "image" | "text" | null;
}

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
const TEXT_EXTENSIONS = ["txt", "json", "md", "yaml", "yml", "xml", "csv", "log"];

function getExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
}

const PREVIEW_LINES = 5;

function getFileUrl(connectionId: string, key: string): string {
  return import.meta.env.DEV
    ? `http://localhost:3333/file/${connectionId}/${key}`
    : `/file/${connectionId}/${key}`;
}

export function PreviewPanel({ connectionId, file }: PreviewPanelProps) {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textExpanded, setTextExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!file) {
      setMetadata(null);
      setTextContent(null);
      setError(null);
      setTextExpanded(false);
      setImageError(false);
      return;
    }

    // Reset states when file changes
    setTextExpanded(false);
    setImageError(false);

    const loadMetadata = async () => {
      setLoading(true);
      setError(null);
      setTextContent(null);

      try {
        // Fetch metadata
        const { data } = await (api as any)["file-meta"][connectionId][file.key].get();

        if (data && data.success) {
          const meta = (data as any).metadata as FileMetadata;
          setMetadata(meta);

          // If it's a text file, load the content
          if (meta.previewType === "text") {
            try {
              const response = await fetch(getFileUrl(connectionId, file.key));
              if (response.ok) {
                const text = await response.text();
                setTextContent(text);
              }
            } catch {
              // Text content loading failed silently
            }
          }
        } else {
          setError((data as any)?.message || "Failed to load metadata");
        }
      } catch (e) {
        setError("Failed to load file details");
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [connectionId, file]);

  const handleDownload = () => {
    if (!file) return;
    const downloadUrl = import.meta.env.DEV
      ? `http://localhost:3333/download/${connectionId}/${file.key}`
      : `/download/${connectionId}/${file.key}`;
    window.open(downloadUrl, "_blank");
  };

  if (!file) {
    return (
      <div className="w-80 border-l bg-muted/20 flex items-center justify-center">
        <div className="text-center text-muted-foreground p-4">
          <File className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a file to preview</p>
        </div>
      </div>
    );
  }

  const ext = getExtension(file.name);
  const isImage = IMAGE_EXTENSIONS.includes(ext);
  const isText = TEXT_EXTENSIONS.includes(ext);

  return (
    <div className="w-80 border-l bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
            {isImage ? (
              <Image className="h-5 w-5 text-blue-500" />
            ) : isText ? (
              <FileText className="h-5 w-5 text-amber-500" />
            ) : (
              <File className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate" title={file.name}>
              {file.name}
            </h3>
            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-center px-4">
            <div className="text-destructive">
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {isImage && !imageError && (
              <div className="-mx-4 mb-4">
                <img
                  src={getFileUrl(connectionId, file.key)}
                  alt={file.name}
                  className="w-full object-contain max-h-72"
                  onError={() => setImageError(true)}
                />
              </div>
            )}

            {isImage && imageError && (
              <div className="mb-4 py-8 text-center text-muted-foreground text-sm">
                Preview not available
              </div>
            )}

            {!isImage && !isText && (
              <div className="mb-4 py-8 text-center text-muted-foreground text-sm">
                Preview not available
              </div>
            )}

            {isText && textContent !== null && (
              <TextPreview
                content={textContent}
                isJson={ext === "json"}
                expanded={textExpanded}
                onToggle={() => setTextExpanded(!textExpanded)}
              />
            )}

            {/* Metadata */}
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground">Full Path</div>
                <div className="font-mono text-xs break-all">{file.key}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Size</div>
                <div>{formatFileSize(file.size)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Last Modified</div>
                <div>{formatDate(file.lastModified)}</div>
              </div>
              {metadata?.contentType && (
                <div>
                  <div className="text-muted-foreground">Content Type</div>
                  <div>{metadata.contentType}</div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <div className="mt-4 pt-4 border-t">
              <Button className="w-full" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function formatJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

interface TextPreviewProps {
  content: string;
  isJson: boolean;
  expanded: boolean;
  onToggle: () => void;
}

function TextPreview({ content, isJson, expanded, onToggle }: TextPreviewProps) {
  const formattedContent = isJson ? formatJson(content) : content;
  const lines = formattedContent.split("\n");
  const hasMore = lines.length > PREVIEW_LINES;
  const displayContent = expanded ? formattedContent : lines.slice(0, PREVIEW_LINES).join("\n");

  return (
    <div className="mb-4">
      <pre className={`text-xs bg-muted p-3 rounded overflow-x-auto ${expanded ? 'max-h-64 overflow-y-auto' : ''}`}>
        <code>{displayContent}</code>
      </pre>
      {hasMore && (
        <button
          onClick={onToggle}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? "Show less" : `Show more (${lines.length - PREVIEW_LINES} more lines)`}
        </button>
      )}
    </div>
  );
}
