import { Check } from "lucide-react";
import { COLOR_PALETTE } from "@/types";

interface ColorPickerProps {
  value?: string;
  onChange: (color: string | undefined) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* No color option */}
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={`
          w-7 h-7 rounded-full border-2 flex items-center justify-center
          transition-all hover:scale-110
          ${!value ? "border-primary" : "border-muted-foreground/30"}
        `}
        title="No color"
      >
        {!value && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>

      {/* Color options */}
      {COLOR_PALETTE.map((color) => (
        <button
          key={color.key}
          type="button"
          onClick={() => onChange(color.key)}
          className={`
            w-7 h-7 rounded-full flex items-center justify-center
            transition-all hover:scale-110
            ${value === color.key ? "ring-2 ring-offset-2 ring-primary" : ""}
          `}
          style={{ backgroundColor: color.hex }}
          title={color.name}
        >
          {value === color.key && (
            <Check className="h-3.5 w-3.5 text-gray-700" />
          )}
        </button>
      ))}
    </div>
  );
}

// Helper to get hex color from key
export function getColorHex(colorKey?: string): string | undefined {
  if (!colorKey) return undefined;
  const color = COLOR_PALETTE.find((c) => c.key === colorKey);
  return color?.hex;
}
