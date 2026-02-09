# ContextKeeper MCP Server

[![npm version](https://img.shields.io/npm/v/@ondrahracek/contextkeeper-mcp)](https://www.npmjs.com/package/@ondrahracek/contextkeeper-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

MCP (Model Context Protocol) server for [ContextKeeper](https://github.com/ondrahracek/contextkeeper) - integrates your context items with AI assistants like Cursor, Claude Desktop, and others.

## What it does

This MCP server allows AI assistants to read and modify your ContextKeeper items directly through natural language. No need to manually switch between your editor and the terminal.

## Tools

| Tool | Description |
|------|-------------|
| `list_context_items` | List all context items with ID, content, project, tags, and status |
| `add_context_item` | Add a new context item |
| `complete_context_item` | Mark a context item as completed |
| `context_status` | Get a quick summary (counts, projects, tags) |

## Prerequisites

- **ContextKeeper CLI** (`ck`) installed and on your PATH
- **Node.js** 18 or later
- **npm** or **yarn**

## Installation

### Option 1: npx (No install)

```bash
npx @ondrahracek/contextkeeper-mcp
```

### Option 2: From Source

```bash
git clone https://github.com/ondrahracek/contextkeeper-mcp.git
cd contextkeeper-mcp
npm install
npm run build
```

## Configuration

### Cursor IDE

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "contextkeeper": {
      "command": "npx",
      "args": ["-y", "@ondrahracek/contextkeeper-mcp"]
    }
  }
}
```

Or if running from source:

```json
{
  "mcpServers": {
    "contextkeeper": {
      "command": "node",
      "args": ["/path/to/contextkeeper-mcp/build/index.js"]
    }
  }
}
```

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "contextkeeper": {
      "command": "npx",
      "args": ["-y", "@ondrahracek/contextkeeper-mcp"]
    }
  }
}
```

## Usage Example

In Cursor's chat, you can say:

> @contextkeeper What's my current context?

Claude will respond with your active items:

```json
[
  {
    "id": "bc2839",
    "fullId": "bc2839b5-6a8b-4b2a-9e1e-7b5c4d3e2f1a",
    "content": "change tokens - find in whatsapp with...",
    "project": "",
    "tags": ["whatsapp"],
    "completedAt": null,
    "createdAt": "2026-02-08T21:25:00Z"
  }
]
```

Or:

> @contextkeeper Add "review security middleware"

Claude will add the item and confirm.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint
```

## Architecture

```
contextkeeper-mcp/
├── src/
│   ├── index.ts       # MCP server entry point
│   ├── helpers.ts     # CLI wrapper functions
│   └── types.ts       # TypeScript type definitions
├── build/             # Compiled JavaScript output
└── package.json
```

## License

MIT - see [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please open issues or PRs on GitHub.
