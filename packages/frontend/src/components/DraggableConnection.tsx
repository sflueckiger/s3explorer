import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, GripVertical } from "lucide-react";
import { getColorHex } from "@/components/ColorPicker";
import type { Connection } from "@/types";

interface DraggableConnectionProps {
  connection: Connection;
  configPath: string;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DraggableConnection({
  connection,
  configPath,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}: DraggableConnectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: connection.id,
    data: {
      type: "connection",
      connection,
      configPath,
      sourceGroupPath: configPath,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group/conn flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer
        hover:bg-accent transition-colors ml-4
        ${isActive ? "bg-accent" : ""}
        ${isDragging ? "opacity-50 shadow-lg z-50" : ""}
      `}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-1 -ml-1 mr-1 opacity-0 group-hover/conn:opacity-50 hover:!opacity-100 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {/* Connection info */}
      <button
        className="flex-1 text-left truncate flex items-start gap-2"
        onClick={onSelect}
      >
        {connection.color && (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: getColorHex(connection.color) }}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{connection.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {connection.bucket}
          </div>
        </div>
      </button>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(props) => (
            <Button
              {...props}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover/conn:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          )}
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
