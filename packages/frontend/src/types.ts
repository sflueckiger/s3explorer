// Connection with its source config file
export interface Connection {
  id: string;
  name: string;
  bucket: string;
  endpoint?: string;
  region?: string;
  color?: string;
  configPath: string;
}

// Config file state (Workspace)
export interface ConfigFile {
  path: string;
  name?: string;
  isUnlocked: boolean;
  exists: boolean;
  connections: Connection[];
  error?: string;
}

// Status response from backend
export interface ConfigStatus {
  configPath: string;
  unlocked: boolean;
  exists?: boolean;
  isFirstRun?: boolean;
  connectionCount?: number;
  name?: string;
}

// Color palette for connections
export interface ColorOption {
  key: string;
  hex: string;
  name: string;
}

export const COLOR_PALETTE: ColorOption[] = [
  { key: "powder-blush", hex: "#ffac92", name: "Powder Blush" },
  { key: "cotton-rose", hex: "#e8b5b6", name: "Cotton Rose" },
  { key: "peach-glow", hex: "#ffcd9e", name: "Peach Glow" },
  { key: "thistle", hex: "#d3c1e7", name: "Thistle" },
  { key: "pink-orchid", hex: "#e7c0eb", name: "Pink Orchid" },
  { key: "frozen-water", hex: "#d2fffa", name: "Frozen Water" },
  { key: "lemon-chiffon", hex: "#fff9be", name: "Lemon Chiffon" },
  { key: "tea-green", hex: "#c4ffdf", name: "Tea Green" },
  { key: "lavender", hex: "#d3d3e0", name: "Lavender" },
  { key: "light-cyan", hex: "#caf6fc", name: "Light Cyan" },
];

export interface MultiStatusResponse {
  defaultConfigPath: string;
  isFirstRun: boolean;
  configs: ConfigStatus[];
}

export interface FileStatusResponse {
  configPath: string;
  exists: boolean;
  unlocked: boolean;
  isFirstRun: boolean;
}
