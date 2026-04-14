# MCP Server Setup

The Tencil MCP server lets AI editors (Claude Desktop, Claude Code, Windsurf, Cursor) read and write `.tencil` files and run adapters directly — no CLI needed.

---

## How it works

The server runs as a local process that speaks the [Model Context Protocol](https://modelcontextprotocol.io) over stdio. Your AI editor starts it automatically when needed and calls its tools in conversation.

**Available tools:**

| Tool | What it does |
|------|-------------|
| `read_tencil` | Read and parse a `.tencil` file from disk |
| `write_tencil` | Write a validated TencilDocument to disk |
| `invoke_adapter` | Run `penpot-in` or `pencil-out` adapter |

---

## Claude Desktop

Open or create `%APPDATA%\Claude\claude_desktop_config.json` and add the `tencil` entry:

```json
{
  "mcpServers": {
    "tencil": {
      "command": "node",
      "args": ["/absolute/path/to/tencil-dev/packages/mcp-server/dist/server.js"],
      "type": "stdio"
    }
  }
}
```

Replace the path with your actual path. On Windows use forward slashes or escaped backslashes.

Restart Claude Desktop. You should see `tencil` in the tools list (hammer icon).

**Alternatively**, if you installed `@tencil/mcp-server` globally:

```json
{
  "mcpServers": {
    "tencil": {
      "command": "tencil-mcp",
      "type": "stdio"
    }
  }
}
```

---

## Claude Code (VS Code extension)

Run this once in your terminal:

```bash
claude mcp add tencil node /absolute/path/to/tencil-dev/packages/mcp-server/dist/server.js
```

Or if installed globally:

```bash
claude mcp add tencil tencil-mcp
```

Verify it connected:

```bash
claude mcp list
# tencil: node ... - ✓ Connected
```

The server will be available in all new Claude Code conversations.

---

## Windsurf

Open Windsurf settings and find the MCP Servers section, or edit the config file directly.

**Via config file** — open `%APPDATA%\Windsurf\User\settings.json` (or the Windsurf equivalent) and add:

```json
{
  "mcp.servers": {
    "tencil": {
      "command": "node",
      "args": ["/absolute/path/to/tencil-dev/packages/mcp-server/dist/server.js"],
      "transport": "stdio"
    }
  }
}
```

Or if installed globally:

```json
{
  "mcp.servers": {
    "tencil": {
      "command": "tencil-mcp",
      "transport": "stdio"
    }
  }
}
```

Reload the window after saving.

---

## Cursor

Open Cursor Settings → Features → MCP Servers → Add Server.

Or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "tencil": {
      "command": "node",
      "args": ["/absolute/path/to/tencil-dev/packages/mcp-server/dist/server.js"]
    }
  }
}
```

---

## Install globally (recommended)

Installing `@tencil/mcp-server` globally means you can use `tencil-mcp` as the command instead of a full path — simpler config that works everywhere:

```bash
npm install -g @tencil/mcp-server
```

Then in any config use:

```json
{
  "command": "tencil-mcp"
}
```

---

## Using Tencil tools in conversation

Once connected, you can talk to your AI editor naturally:

```
Read my project.tencil at /path/to/project.tencil and tell me what nodes are in it.
```

```
Convert this Penpot JSON to a TencilDocument and save it as dashboard.tencil:
{ "name": "Dashboard", "objects": [...] }
```

```
Use the pencil-out adapter on my project.tencil and give me the Pencil.dev operations.
```

---

## MCP tool reference

### read_tencil

Read and validate a `.tencil` file from disk.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | string | Yes | Absolute or relative path to the `.tencil` file |

**Returns:** The parsed and validated `TencilDocument` object.

**Example prompt:**
> "Read the file at /Users/me/project/project.tencil"

---

### write_tencil

Write a `TencilDocument` to disk. Validates before writing.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | string | Yes | Output path for the `.tencil` file |
| `document` | object | Yes | A valid `TencilDocument` object |

**Returns:** `{ success: true, filePath, nodes, links }`

**Example prompt:**
> "Write this TencilDocument to /Users/me/project/output.tencil: { ... }"

---

### invoke_adapter

Run a named adapter to convert between formats.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `adapter` | `"penpot-in"` \| `"pencil-out"` | Yes | Which adapter to run |
| `input` | object | Yes | Input data (format depends on adapter) |
| `options` | object | No | Options: `{ id?: string, name?: string }` |

**For `penpot-in`:**
- Input: Penpot export JSON `{ name, objects: [...] }`
- Returns: `TencilDocument`

**For `pencil-out`:**
- Input: A valid `TencilDocument`
- Returns: `{ operations: string[], count: number }`

**Example prompt:**
> "Use the penpot-in adapter to convert this Penpot JSON: { ... } — use id: 'my-design'"

---

## Troubleshooting

**Server not connecting**

Check the path is correct and the dist file exists:
```bash
node /path/to/packages/mcp-server/dist/server.js
# Should hang waiting for stdin input — that means it's working
# Press Ctrl+C to exit
```

**Tools not appearing in session**

MCP servers are loaded at session start. Restart your editor or start a new conversation after adding the config.

**"Unknown adapter" error**

Only `penpot-in` and `pencil-out` are valid adapter names. Check spelling.
