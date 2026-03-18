// Connection with its source config file
export interface Connection {
  id: string;
  name: string;
  bucket: string;
  endpoint?: string;
  region?: string;
  configPath: string;
}

// Config file state
export interface ConfigFile {
  path: string;
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
}

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
