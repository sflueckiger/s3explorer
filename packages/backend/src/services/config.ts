import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { encrypt, decrypt, isEncryptedData } from "./encryption";

const DEFAULT_CONFIG_PATH = "~/.s3explore/config.enc";

export interface Connection {
  id: string;
  name: string;
  bucket: string;
  endpoint?: string;
  region?: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export interface Config {
  connections: Connection[];
}

export function expandPath(path: string): string {
  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }
  if (path === "~") {
    return homedir();
  }
  return path;
}

export function getDefaultConfigPath(): string {
  return expandPath(DEFAULT_CONFIG_PATH);
}

export async function configExists(path: string = DEFAULT_CONFIG_PATH): Promise<boolean> {
  const expandedPath = expandPath(path);
  try {
    await access(expandedPath);
    return true;
  } catch {
    return false;
  }
}

export async function readConfig(password: string, path: string = DEFAULT_CONFIG_PATH): Promise<Config> {
  const expandedPath = expandPath(path);
  const content = await readFile(expandedPath, "utf8");
  const data = JSON.parse(content);

  if (!isEncryptedData(data)) {
    throw new Error("Invalid config file format");
  }

  const decrypted = await decrypt(data, password);
  const config = JSON.parse(decrypted);

  // Validate config structure
  if (!config || !Array.isArray(config.connections)) {
    throw new Error("Invalid config structure");
  }

  return config as Config;
}

export async function writeConfig(
  config: Config,
  password: string,
  path: string = DEFAULT_CONFIG_PATH
): Promise<void> {
  const expandedPath = expandPath(path);

  // Ensure directory exists
  const dir = dirname(expandedPath);
  await mkdir(dir, { recursive: true });

  // Encrypt and write
  const plaintext = JSON.stringify(config);
  const encrypted = await encrypt(plaintext, password);
  await writeFile(expandedPath, JSON.stringify(encrypted, null, 2), "utf8");
}

export function createEmptyConfig(): Config {
  return { connections: [] };
}

export function generateConnectionId(): string {
  return crypto.randomUUID();
}
