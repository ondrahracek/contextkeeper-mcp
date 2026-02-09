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
