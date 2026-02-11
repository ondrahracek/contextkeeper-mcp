/**
 * Type definitions for ContextKeeper MCP Server
 * 
 * These types define the data structures used for communicating
 * with the ContextKeeper CLI via JSON output.
 * 
 * @packageDocumentation
 */

/**
 * Represents a context item returned by `ck list --json`
 */
export interface ContextItem {
  /** 6-character ID prefix for display purposes */
  id: string;
  /** Full UUID of the context item */
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
  /** Total number of items (active + completed) */
  totalItems: number;
  /** Number of completed items */
  completedItems: number;
  /** Number of active (non-completed) items */
  activeItems: number;
  /** List of unique project names used */
  projects: string[];
  /** List of unique tags used across all items */
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
 * Result of removing an item
 */
export interface RemoveResult {
  /** ID of the removed item */
  id: string;
  /** Status of the action */
  status: "removed";
}

/**
 * Result of editing an item
 */
export interface EditResult {
  /** ID of the edited item */
  id: string;
  /** Status of the action */
  status: "updated";
}

/**
 * Result of syncing context
 */
export interface SyncResult {
  /** Whether the sync was successful */
  success: boolean;
  /** Number of files synced */
  syncedFiles: number;
}

/**
 * Input parameters for searching context items
 */
export interface SearchContextInput {
  /** Search query string */
  query?: string;
  /** Filter by tags */
  tags?: string[];
  /** Include completed items */
  showCompleted?: boolean;
  /** Path to the context directory */
  path?: string;
}

/**
 * Input parameters for removing a context item
 */
export interface RemoveContextInput {
  /** Item ID (full UUID or 6-character prefix) */
  id: string;
  /** Path to the context directory */
  path?: string;
  /** Sync to AI agent files after operation */
  sync?: boolean;
}

/**
 * Input parameters for editing a context item
 */
export interface EditContextInput {
  /** Item ID (full UUID or 6-character prefix) */
  id: string;
  /** New content/description */
  content?: string;
  /** New tags for the item */
  tags?: string[];
  /** Path to the context directory */
  path?: string;
  /** Sync to AI agent files after operation */
  sync?: boolean;
}

/**
 * Input parameters for syncing context
 */
export interface SyncContextInput {
  /** Path to the context directory */
  path?: string;
}
