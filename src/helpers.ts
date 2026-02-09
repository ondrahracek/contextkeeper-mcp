/**
 * ContextKeeper CLI Helpers
 * 
 * Provides type-safe wrappers around the ContextKeeper CLI commands.
 * All functions communicate with the `ck` binary via child_process.execFileSync.
 * 
 * @packageDocumentation
 */

import { execFileSync, ExecSyncOptions } from "child_process";

// Type definitions for ContextKeeper CLI output
// =============================================

/**
 * Represents a context item returned by `ck list --json`
 */
export interface ContextItem {
  /** 6-character ID prefix for display */
  id: string;
  /** Full UUID of the item */
  fullId: string;
  /** Main content/description of the item */
  content: string;
  /** Associated project name (empty string if none) */
  project: string;
  /** Array of tags associated with this item */
  tags: string[];
  /** RFC3339 timestamp or null if not completed */
  completedAt: string | null;
  /** RFC3339 timestamp of when item was created */
  createdAt: string;
}

/**
 * Status summary returned by `ck status --json`
 */
export interface StatusOutput {
  /** Total number of items */
  totalItems: number;
  /** Number of completed items */
  completedItems: number;
  /** Number of active (non-completed) items */
  activeItems: number;
  /** List of unique project names */
  projects: string[];
  /** List of unique tags used */
  tags: string[];
}

/**
 * Result of adding or completing an item
 */
export interface ActionResult {
  /** ID of the affected item */
  id: string;
  /** Status of the action */
  status: "completed" | "added";
}

/**
 * Error thrown when the CK CLI fails
 */
export class CkCliError extends Error {
  constructor(
    message: string,
    public readonly command: string[],
    public readonly stderr?: string
  ) {
    super(message);
    this.name = "CkCliError";
  }
}

// Private helper functions
// ========================

/**
 * Execute a ContextKeeper CLI command and return the JSON output
 * 
 * @param args - Command arguments (without --json flag)
 * @returns Parsed JSON response from the CLI
 * @throws CkCliError if the command fails
 */
function runCkCommand<T>(args: string[]): T {
  const options: ExecSyncOptions = {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer
  };

  try {
    const output = execFileSync("ck", [...args, "--json"], {
      ...options,
      encoding: "utf8",
    });
    return JSON.parse(output) as T;
  } catch (error) {
    const stderr = error instanceof Error && "stderr" in error 
      ? (error as any).stderr as string | undefined 
      : undefined;
    throw new CkCliError(
      `ContextKeeper CLI failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      args,
      stderr
    );
  }
}

// Public helper functions
// =======================

/**
 * List context items from ContextKeeper
 * 
 * @param path - Path to the context directory (optional)
 * @param showCompleted - Whether to include completed items (optional)
 * @returns Array of context items
 */
export function listContextItems(
  path?: string,
  showCompleted?: boolean
): ContextItem[] {
  const args = ["list"];
  if (path) args.push("--path", path);
  if (showCompleted) args.push("--completed");
  return runCkCommand<ContextItem[]>(args);
}

/**
 * Add a new context item
 * 
 * @param content - The content/description of the item
 * @param path - Path to the context directory (optional)
 * @param project - Project name to associate (optional)
 * @param tags - Tags to associate (optional)
 * @returns Result containing the new item's ID
 */
export function addContextItem(
  content: string,
  path?: string,
  project?: string,
  tags?: string[]
): ActionResult {
  const args = ["add", content];
  if (path) args.push("--path", path);
  if (project) args.push("--project", project);
  if (tags && tags.length > 0) args.push("--tags", tags.join(","));
  return runCkCommand<ActionResult>(args);
}

/**
 * Mark a context item as completed
 * 
 * @param id - Item ID (full UUID or 6-char prefix)
 * @param path - Path to the context directory (optional)
 * @returns Result containing the completed item's ID
 */
export function completeContextItem(id: string, path?: string): ActionResult {
  const args = ["done", id];
  if (path) args.push("--path", path);
  return runCkCommand<ActionResult>(args);
}

/**
 * Get status summary of the context
 * 
 * @param path - Path to the context directory (optional)
 * @returns Status summary object
 */
export function getContextStatus(path?: string): StatusOutput {
  const args = ["status"];
  if (path) args.push("--path", path);
  return runCkCommand<StatusOutput>(args);
}

/**
 * Helper object exporting all ContextKeeper CLI functions
 */
export const helpers = {
  listContextItems,
  addContextItem,
  completeContextItem,
  getContextStatus,
};
