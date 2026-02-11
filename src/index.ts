#!/usr/bin/env node
/**
 * ContextKeeper MCP Server
 * 
 * An MCP (Model Context Protocol) server that integrates ContextKeeper CLI
 * with AI assistants like Cursor, Claude Desktop, and others.
 * 
 * @packageDocumentation
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { helpers, CkCliError } from "./helpers.js";

/**
 * Server instance for ContextKeeper MCP
 */
const server = new Server(
  {
    name: "contextkeeper-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool definitions for ContextKeeper MCP server
 * 
 * Naming convention: snake_case, verb-first, aligned with ck CLI commands.
 * All tools use consistent "context_items" plural form.
 */
const TOOLS: Tool[] = [
  {
    name: "list_context_items",
    description: "List all context items from ContextKeeper. Shows ID, content, project, tags, and completion status.",
    inputSchema: {
      type: "object",
      properties: {
        path: { 
          type: "string", 
          description: "Path to the context directory (defaults to current directory)" 
        },
        showCompleted: { 
          type: "boolean", 
          description: "Include completed items in the output" 
        },
      },
    },
  },
  {
    name: "add_context_item",
    description: "Add a new context item to ContextKeeper. Use this to track tasks, ideas, or notes.",
    inputSchema: {
      type: "object",
      properties: {
        content: { 
          type: "string", 
          description: "The content/description of the context item" 
        },
        path: { 
          type: "string", 
          description: "Path to the context directory" 
        },
        project: { 
          type: "string", 
          description: "Project name to associate with this item" 
        },
        tags: { 
          type: "array", 
          items: { type: "string" }, 
          description: "Tags for categorizing the item" 
        },
        sync: { 
          type: "boolean", 
          description: "Sync to AI agent files after adding" 
        },
      },
      required: ["content"],
    },
  },
  {
    name: "mark_context_done",
    description: "Mark a context item as completed using its ID (full UUID or 6-char prefix).",
    inputSchema: {
      type: "object",
      properties: {
        id: { 
          type: "string", 
          description: "Item ID (full UUID or 6-character prefix)" 
        },
        path: { 
          type: "string", 
          description: "Path to the context directory" 
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_context_status",
    description: "Get a summary of the context: total items, completed vs active counts, projects, and tags.",
    inputSchema: {
      type: "object",
      properties: {
        path: { 
          type: "string", 
          description: "Path to the context directory" 
        },
      },
    },
  },
  {
    name: "search_context_items",
    description: "Search context items by query string and/or tags. Returns matching items with their details.",
    inputSchema: {
      type: "object",
      properties: {
        query: { 
          type: "string", 
          description: "Search query string to match against item content" 
        },
        tags: { 
          type: "array", 
          items: { type: "string" }, 
          description: "Filter items by tags" 
        },
        showCompleted: { 
          type: "boolean", 
          description: "Include completed items in the search results" 
        },
        path: { 
          type: "string", 
          description: "Path to the context directory" 
        },
      },
    },
  },
  {
    name: "remove_context_item",
    description: "Remove (archive) a context item by ID. The item is soft-deleted and can be recovered.",
    inputSchema: {
      type: "object",
      properties: {
        id: { 
          type: "string", 
          description: "Item ID (full UUID or 6-character prefix)" 
        },
        path: { 
          type: "string", 
          description: "Path to the context directory" 
        },
        sync: { 
          type: "boolean", 
          description: "Sync to AI agent files after removing" 
        },
      },
      required: ["id"],
    },
  },
  {
    name: "edit_context_item",
    description: "Edit an existing context item's content and/or tags using its ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { 
          type: "string", 
          description: "Item ID (full UUID or 6-character prefix)" 
        },
        content: { 
          type: "string", 
          description: "New content/description for the item" 
        },
        tags: { 
          type: "array", 
          items: { type: "string" }, 
          description: "New tags for the item (replaces existing tags)" 
        },
        path: { 
          type: "string", 
          description: "Path to the context directory" 
        },
        sync: { 
          type: "boolean", 
          description: "Sync to AI agent files after editing" 
        },
      },
      required: ["id"],
    },
  },
  {
    name: "sync_context_items",
    description: "Trigger a sync of context items to AI agent files. Updates the .context-keeper directory.",
    inputSchema: {
      type: "object",
      properties: {
        path: { 
          type: "string", 
          description: "Path to the context directory" 
        },
      },
    },
  },
  {
    name: "init_context",
    description: "Initialize a new ContextKeeper directory with .contextkeeper folder and items.json file.",
    inputSchema: {
      type: "object",
      properties: {
        path: { 
          type: "string", 
          description: "Path to initialize (defaults to current directory)" 
        },
      },
    },
  },
];

/**
 * Handle tool listing requests
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

/**
 * Handle tool execution requests
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_context_items": {
        const path = typeof args?.path === "string" ? args.path : undefined;
        const showCompleted = args?.showCompleted === true;
        const items = helpers.listContextItems(path, showCompleted);
        return {
          content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
        };
      }
      case "add_context_item": {
        const content = args?.content as string;
        const path = typeof args?.path === "string" ? args.path : undefined;
        const project = typeof args?.project === "string" ? args.project : undefined;
        const tags = Array.isArray(args?.tags) ? (args.tags as string[]) : undefined;
        const sync = args?.sync === true;
        const result = helpers.addContextItem(content, path, project, tags, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
      case "mark_context_done": {
        const id = args?.id as string;
        const path = typeof args?.path === "string" ? args.path : undefined;
        const result = helpers.completeContextItem(id, path);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
      case "get_context_status": {
        const path = typeof args?.path === "string" ? args.path : undefined;
        const status = helpers.getContextStatus(path);
        return {
          content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
        };
      }
      case "search_context_items": {
        const input = {
          query: typeof args?.query === "string" ? args.query : undefined,
          tags: Array.isArray(args?.tags) ? (args.tags as string[]) : undefined,
          showCompleted: args?.showCompleted === true,
          path: typeof args?.path === "string" ? args.path : undefined,
        };
        const items = helpers.searchContextItems(input);
        return {
          content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
        };
      }
      case "remove_context_item": {
        const id = args?.id as string;
        const path = typeof args?.path === "string" ? args.path : undefined;
        const sync = args?.sync === true;
        const result = helpers.removeContextItem({ id, path, sync });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
      case "edit_context_item": {
        const id = args?.id as string;
        const input = {
          id,
          content: typeof args?.content === "string" ? args.content : undefined,
          tags: Array.isArray(args?.tags) ? (args.tags as string[]) : undefined,
          path: typeof args?.path === "string" ? args.path : undefined,
          sync: args?.sync === true,
        };
        const result = helpers.editContextItem(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
      case "sync_context_items": {
        const path = typeof args?.path === "string" ? args.path : undefined;
        const result = helpers.syncContext({ path });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
      case "init_context": {
        const path = typeof args?.path === "string" ? args.path : undefined;
        const result = helpers.initContext({ path });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

/**
 * Main entry point - starts the MCP server
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ContextKeeper MCP Server running on stdio");
}

// Export for testing
export { server, TOOLS };

// Run if this is the main module
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
