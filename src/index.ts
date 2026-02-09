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
      },
      required: ["content"],
    },
  },
  {
    name: "complete_context_item",
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
    name: "context_status",
    description: "Get a quick summary of the context: total items, completed vs active counts, projects, and tags.",
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
        const result = helpers.addContextItem(content, path, project, tags);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
      case "complete_context_item": {
        const id = args?.id as string;
        const path = typeof args?.path === "string" ? args.path : undefined;
        const result = helpers.completeContextItem(id, path);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
      case "context_status": {
        const path = typeof args?.path === "string" ? args.path : undefined;
        const status = helpers.getContextStatus(path);
        return {
          content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
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
export { server };

// Run if this is the main module
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
