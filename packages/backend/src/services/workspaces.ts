import { homedir } from "node:os";
import { join } from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { expandPath } from "./config";

const WORKSPACES_FILE = join(homedir(), ".s3explore", "workspaces.json");

export interface Workspace {
  name: string;
  path: string;
}

interface WorkspacesData {
  workspaces: Workspace[];
}

async function ensureDir(): Promise<void> {
  const dir = join(homedir(), ".s3explore");
  await mkdir(dir, { recursive: true });
}

async function readWorkspacesFile(): Promise<WorkspacesData> {
  try {
    const content = await readFile(WORKSPACES_FILE, "utf8");
    const data = JSON.parse(content);
    if (data && Array.isArray(data.workspaces)) {
      return data;
    }
    return { workspaces: [] };
  } catch {
    return { workspaces: [] };
  }
}

async function writeWorkspacesFile(data: WorkspacesData): Promise<void> {
  await ensureDir();
  await writeFile(WORKSPACES_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function getWorkspaces(): Promise<Workspace[]> {
  const data = await readWorkspacesFile();
  return data.workspaces;
}

export async function addWorkspace(name: string, path: string): Promise<Workspace[]> {
  const expandedPath = expandPath(path);
  const data = await readWorkspacesFile();

  // Check if path already exists
  const existing = data.workspaces.find(w => w.path === expandedPath);
  if (existing) {
    // Update name if different
    existing.name = name;
  } else {
    data.workspaces.push({ name, path: expandedPath });
  }

  await writeWorkspacesFile(data);
  return data.workspaces;
}

export async function removeWorkspace(path: string): Promise<Workspace[]> {
  const expandedPath = expandPath(path);
  const data = await readWorkspacesFile();
  data.workspaces = data.workspaces.filter(w => w.path !== expandedPath);
  await writeWorkspacesFile(data);
  return data.workspaces;
}

export async function updateWorkspaceName(path: string, name: string): Promise<Workspace[]> {
  const expandedPath = expandPath(path);
  const data = await readWorkspacesFile();
  const workspace = data.workspaces.find(w => w.path === expandedPath);
  if (workspace) {
    workspace.name = name;
    await writeWorkspacesFile(data);
  }
  return data.workspaces;
}

export async function reorderWorkspaces(paths: string[]): Promise<Workspace[]> {
  const data = await readWorkspacesFile();
  const expandedPaths = paths.map(p => expandPath(p));

  // Reorder based on provided paths array
  const reordered: Workspace[] = [];
  for (const path of expandedPaths) {
    const workspace = data.workspaces.find(w => w.path === path);
    if (workspace) {
      reordered.push(workspace);
    }
  }

  // Add any workspaces not in the reorder list at the end
  for (const workspace of data.workspaces) {
    if (!expandedPaths.includes(workspace.path)) {
      reordered.push(workspace);
    }
  }

  data.workspaces = reordered;
  await writeWorkspacesFile(data);
  return data.workspaces;
}
