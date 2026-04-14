# Getting Started with Tencil

Tencil converts designs between tools. Today it bridges Penpot and Pencil.dev. Future milestones add KiCad, Blender, and medical systems.

---

## What you need

- Node.js 18 or later
- A Penpot account (for the design source)
- Pencil.dev (for the design destination)

---

## Install the CLI

```bash
npm install -g tencil-cli
```

Verify it works:

```bash
tencil --help
```

---

## Your first project

### 1. Create a project

```bash
tencil create my-dashboard
cd my-dashboard
```

This creates:

```
my-dashboard/
├── project.tencil   ← your design document (starts empty)
└── .tencilrc        ← project config
```

### 2. Get a Penpot export

Until the Penpot plugin is ready, you need to use the Penpot API to export your file as JSON. See [penpot-api.md](./penpot-api.md) for the steps.

Once you have the JSON file, save it as `design.json` inside your project folder.

### 3. Convert Penpot → Tencil

```bash
tencil export design.json
```

This reads `design.json` and writes `project.tencil`.

### 4. Validate the result

```bash
tencil validate
```

You should see your node count and a clean validation pass.

### 5. Convert Tencil → Pencil.dev

```bash
tencil import
```

This writes `operations.pencil.json` — a list of Pencil.dev `batch_design` operations.

### 6. Apply to Pencil.dev

Open Pencil.dev and use the MCP `batch_design` tool with the operations from the JSON file, or use the Tencil MCP server directly (see [mcp-setup.md](./mcp-setup.md)).

---

## What each file does

| File | Purpose |
|------|---------|
| `project.tencil` | Your design in Tencil format — the canonical source of truth |
| `.tencilrc` | Project config (adapters, domain, project name) |
| `operations.pencil.json` | Pencil.dev batch_design operations ready to apply |

---

## Next steps

- [CLI Reference](./cli-reference.md) — all commands and options
- [MCP Setup](./mcp-setup.md) — use Tencil from Claude, Windsurf, or any AI editor
- [.tencil Format](./tencil-format.md) — the file format in full detail
- [Penpot API Export](./penpot-api.md) — how to get JSON out of Penpot today
