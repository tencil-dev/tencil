# SDK Reference

Use Tencil packages directly in your TypeScript or JavaScript project.

---

## @tencil/core

The foundation package. Provides types, validation, and constants.

```bash
npm install @tencil/core
```

### parseTencilDocument

Parses and validates a raw JSON value as a TencilDocument.

```typescript
import { parseTencilDocument } from "@tencil/core";

const result = parseTencilDocument(json);

if (result.success) {
  // result.data is a typed TencilDocument
  console.log(result.data.id);
  console.log(result.data.nodes.length);
} else {
  // result.errors is TencilValidationError[]
  for (const err of result.errors) {
    console.error(`${err.field}: ${err.message}`);
  }
}
```

**Signature:**
```typescript
function parseTencilDocument(json: unknown): TencilValidationResult

type TencilValidationResult =
  | { success: true; data: TencilDocument }
  | { success: false; errors: TencilValidationError[] }
```

### validateTencilDocument

Validates an already-typed TencilDocument object.

```typescript
import { validateTencilDocument } from "@tencil/core";

const result = validateTencilDocument(doc);
// Same return type as parseTencilDocument
```

### Types

```typescript
import type {
  TencilDocument,
  TencilNodeBase,
  TencilLink,
  TencilLinkType,
  TencilDomain,
  TencilValidationError,
  TencilValidationResult,
} from "@tencil/core";
```

**TencilDocument**
```typescript
interface TencilDocument {
  tencil: "1.0";
  domain: TencilDomain;
  id: string;
  name?: string;
  description?: string;
  nodes: TencilNodeBase[];
  links?: TencilLink[];
  metadata?: Record<string, unknown>;
}
```

**TencilNodeBase**
```typescript
interface TencilNodeBase {
  id: string;
  type: string;
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  metadata?: Record<string, unknown>;
}
```

**TencilLink**
```typescript
interface TencilLink {
  id: string;
  source: { domain: TencilDomain; nodeId: string };
  target: { domain: TencilDomain; nodeId: string };
  type: TencilLinkType;
  metadata?: Record<string, unknown>;
}
```

**TencilDomain**
```typescript
type TencilDomain = "ui" | "ee" | "3d" | "med" | "multi";
```

**TencilLinkType**
```typescript
type TencilLinkType =
  | "controls"
  | "displays"
  | "located-at"
  | "encloses"
  | "mounts-on"
  | "powered-by"
  | "triggers"
  | "reads-from"
  | "prescribes";
```

### Constants

```typescript
import { PROTOCOL_VERSION, TENCIL_VERSION } from "@tencil/core";

PROTOCOL_VERSION  // "1.0"  — the .tencil format version
TENCIL_VERSION    // "0.1.0" — the npm package version
```

### Zod schemas (advanced)

If you need to compose Tencil schemas with your own Zod schemas:

```typescript
import { TencilDocumentSchema, TencilNodeSchema, TencilLinkSchema } from "@tencil/core";
```

---

## @tencil/schema-ui

UI domain node types. Extends `TencilNodeBase` with design-specific fields.

```bash
npm install @tencil/schema-ui
```

```typescript
import type {
  TencilFrame,
  TencilText,
  TencilRectangle,
  TencilEllipse,
  TencilPath,
  TencilUINode,
} from "@tencil/schema-ui";
```

**TencilUINode** is a union of all UI node types:
```typescript
type TencilUINode =
  | TencilFrame
  | TencilText
  | TencilRectangle
  | TencilEllipse
  | TencilPath;
```

---

## @tencil/adapter-penpot-in

Converts Penpot export JSON to TencilDocument.

```bash
npm install @tencil/adapter-penpot-in
```

### penpotToTencil

```typescript
import { penpotToTencil } from "@tencil/adapter-penpot-in";

const penpotJson = JSON.parse(fs.readFileSync("design.json", "utf-8"));

const doc = penpotToTencil(penpotJson, {
  id: "my-design",      // optional — defaults to penpot file id or timestamp
  name: "My Design",    // optional — defaults to penpot file name
});

// doc is a valid TencilDocument
console.log(doc.nodes.length);
```

**Signature:**
```typescript
function penpotToTencil(
  penpotData: unknown,
  options?: { id?: string; name?: string }
): TencilDocument
```

**Supported Penpot node types:**

| Penpot type | Tencil type |
|-------------|-------------|
| `"frame"`, `"board"` | `"frame"` |
| `"text"` | `"text"` |
| `"rect"`, `"rectangle"` | `"rectangle"` |
| `"ellipse"`, `"circle"` | `"ellipse"` |
| anything else | `"rectangle"` (fallback) |

---

## @tencil/adapter-pencil-out

Converts TencilDocument to Pencil.dev `batch_design` operations.

```bash
npm install @tencil/adapter-pencil-out
```

### tencilToPencil

```typescript
import { tencilToPencil } from "@tencil/adapter-pencil-out";

const operations = tencilToPencil(doc);

// operations is string[] — each is a Pencil batch_design operation
console.log(operations);
// [
//   'frame_1=I(document, {type:"frame", x:0, y:0, width:400, ...})',
//   'text_1=I(frame_1, {type:"text", content:"Hello"})',
//   ...
// ]
```

**Signature:**
```typescript
function tencilToPencil(
  tencilDoc: TencilDocument,
  options?: TencilToPencilOptions
): BatchDesignOperation[]

type BatchDesignOperation = string;
```

The operations follow Pencil.dev's `batch_design` syntax:
- `varName=I(parent, { ...props })` — insert a node
- Variable names are generated from node IDs (lowercased, special chars → `_`)

---

## @tencil/mcp-server

Programmatic API for the MCP server functions. Useful if you want to integrate Tencil into your own tools without running the server.

```bash
npm install @tencil/mcp-server
```

```typescript
import { readTencil, writeTencil, invokeAdapter } from "@tencil/mcp-server";

// Read a .tencil file
const doc = await readTencil("./project.tencil");

// Write a .tencil file
await writeTencil("./output.tencil", doc);

// Run the penpot-in adapter
const tencilDoc = await invokeAdapter("penpot-in", penpotJson, {
  id: "my-project",
  name: "My Project",
});

// Run the pencil-out adapter
const result = await invokeAdapter("pencil-out", tencilDoc);
// result.operations — string[]
// result.count — number
```

**Signatures:**
```typescript
function readTencil(filePath: string): Promise<TencilDocument>
function writeTencil(filePath: string, document: TencilDocument): Promise<void>
function invokeAdapter(
  adapter: "penpot-in" | "pencil-out",
  input: unknown,
  options?: { id?: string; name?: string }
): Promise<unknown>
```

To start the MCP server (stdio transport):

```typescript
import { startServer } from "@tencil/mcp-server";
startServer();
```

---

## tencil-cli (programmatic)

You can import the CLI commands directly — useful for scripting or testing.

```bash
npm install tencil-cli
```

```typescript
import {
  createCommand,
  exportCommand,
  importCommand,
  validateCommand,
} from "tencil-cli";

// All commands are async and throw on error (no process.exit)
await createCommand("my-project");
await exportCommand("design.json", { output: "project.tencil" });
await importCommand("project.tencil", { output: "ops.json" });
await validateCommand("project.tencil");
```

---

## KolaNode integration

KolaNode v1.5 will use `@tencil/core` to read `project.tencil` files and populate the cross-reference sidebar.

```typescript
import { parseTencilDocument } from "@tencil/core";
import fs from "fs";

const raw = JSON.parse(fs.readFileSync("project.tencil", "utf-8"));
const result = parseTencilDocument(raw);

if (result.success) {
  const links = result.data.links ?? [];
  // Populate the sidebar with cross-domain relationships
  for (const link of links) {
    addSidebarEntry(link.source.nodeId, link.target.nodeId, link.type);
  }
}
```

The `@tencil/core` package is the only Tencil dependency KolaNode needs.
