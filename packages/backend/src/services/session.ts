import { S3Client } from "bun";
import type { Config, Connection } from "./config";
import { expandPath, getDefaultConfigPath } from "./config";

// Session entry for a single credential file
export interface SessionEntry {
  config: Config;
  password: string;
  s3Clients: Map<string, S3Client>;
}

// Multi-file session state: Map<expandedConfigPath, SessionEntry>
const sessions = new Map<string, SessionEntry>();

// Default config path for backwards compatibility
const DEFAULT_PATH = getDefaultConfigPath();

function normalizePath(path?: string): string {
  return expandPath(path || DEFAULT_PATH);
}

export function isUnlocked(configPath?: string): boolean {
  if (configPath === undefined) {
    // Check if any file is unlocked (backwards compat)
    return sessions.size > 0;
  }
  return sessions.has(normalizePath(configPath));
}

export function getUnlockedPaths(): string[] {
  return Array.from(sessions.keys());
}

export function getConfig(configPath?: string): Config {
  const path = normalizePath(configPath);
  const session = sessions.get(path);
  if (!session) {
    throw new Error("NOT_UNLOCKED");
  }
  return session.config;
}

export function getConnections(configPath?: string): Connection[] {
  return getConfig(configPath).connections;
}

export function getConnection(id: string, configPath?: string): Connection | undefined {
  // If configPath provided, search only that file
  if (configPath) {
    return getConfig(configPath).connections.find((c) => c.id === id);
  }
  // Otherwise search all unlocked files
  for (const session of sessions.values()) {
    const conn = session.config.connections.find((c) => c.id === id);
    if (conn) return conn;
  }
  return undefined;
}

export function getConnectionWithPath(id: string): { connection: Connection; configPath: string } | undefined {
  for (const [path, session] of sessions.entries()) {
    const conn = session.config.connections.find((c) => c.id === id);
    if (conn) return { connection: conn, configPath: path };
  }
  return undefined;
}

export function unlockConfig(configPath: string, config: Config, password: string): void {
  const path = normalizePath(configPath);
  sessions.set(path, {
    config,
    password,
    s3Clients: new Map(),
  });
}

export function lockConfig(configPath: string): void {
  const path = normalizePath(configPath);
  sessions.delete(path);
}

export function clearAllSessions(): void {
  sessions.clear();
}

export function getSessionInfo(configPath?: string): { configPath: string; password: string } | null {
  const path = normalizePath(configPath);
  const session = sessions.get(path);
  if (!session) {
    return null;
  }
  return { configPath: path, password: session.password };
}

export function updateConfig(config: Config, configPath?: string): void {
  const path = normalizePath(configPath);
  const session = sessions.get(path);
  if (!session) {
    throw new Error("NOT_UNLOCKED");
  }
  session.config = config;
  session.s3Clients.clear();
}

export function getS3Client(connectionId: string, configPath?: string): S3Client {
  // Find the connection and its session
  let session: SessionEntry | undefined;
  let connection: Connection | undefined;

  if (configPath) {
    const path = normalizePath(configPath);
    session = sessions.get(path);
    if (session) {
      connection = session.config.connections.find((c) => c.id === connectionId);
    }
  } else {
    // Search all sessions
    for (const [, s] of sessions.entries()) {
      const conn = s.config.connections.find((c) => c.id === connectionId);
      if (conn) {
        session = s;
        connection = conn;
        break;
      }
    }
  }

  if (!session || !connection) {
    throw new Error(`Connection not found: ${connectionId}`);
  }

  const existing = session.s3Clients.get(connectionId);
  if (existing) {
    return existing;
  }

  const client = new S3Client({
    accessKeyId: connection.accessKeyId,
    secretAccessKey: connection.secretAccessKey,
    bucket: connection.bucket,
    endpoint: connection.endpoint,
    region: connection.region || "us-east-1",
    sessionToken: connection.sessionToken,
  });

  session.s3Clients.set(connectionId, client);
  return client;
}

export function removeS3Client(connectionId: string, configPath?: string): void {
  if (configPath) {
    const session = sessions.get(normalizePath(configPath));
    if (session) {
      session.s3Clients.delete(connectionId);
    }
  } else {
    // Remove from all sessions
    for (const session of sessions.values()) {
      session.s3Clients.delete(connectionId);
    }
  }
}

// Legacy compatibility: setSession and clearSession for single-file mode
export function setSession(config: Config, configPath: string, password: string): void {
  unlockConfig(configPath, config, password);
}

export function clearSession(): void {
  clearAllSessions();
}
