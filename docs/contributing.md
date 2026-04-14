# Contributing to Tencil

Tencil is early-stage and actively looking for contributors. This page covers how to set up the repo, run tests, and add new code.

---

## Prerequisites

- Node.js 18+
- npm 9+
- Git

---

## Setup

```bash
git clone https://github.com/tencil-dev/tencil-dev.git
cd tencil-dev
npm install
npm run build
npm test
```

All 58 tests should pass.

---

## Monorepo structure

```
tencil-dev/
├── packages/
│   ├── core/                    @tencil/core
│   │   ├── src/
│   │   │   ├── types.ts         All core TypeScript types
│   │   │   ├── validate.ts      Zod schemas + parseTencilDocument()
│   │   │   └── index.ts         Public exports
│   │   └── tests/
│   ├── schema-ui/               @tencil/schema-ui
│   │   └── src/types.ts         UI domain node types
│   ├── adapters/
│   │   ├── penpot-in/           @tencil/adapter-penpot-in
│   │   │   ├── src/
│   │   │   │   ├── index.ts     penpotToTencil()
│   │   │   │   └── types.ts     Penpot JSON types
│   │   │   └── tests/
│   │   └── pencil-out/          @tencil/adapter-pencil-out
│   │       ├── src/
│   │       │   ├── index.ts     tencilToPencil()
│   │       │   └── types.ts
│   │       └── tests/
│   ├── cli/                     tencil-cli
│   │   ├── src/
│   │   │   ├── cli.ts           Entry point + routing
│   │   │   ├── logger.ts        CLI output helpers
│   │   │   ├── index.ts         Programmatic exports
│   │   │   └── commands/
│   │   │       ├── create.ts
│   │   │       ├── export.ts
│   │   │       ├── import.ts
│   │   │       └── validate.ts
│   │   └── tests/
│   └── mcp-server/              @tencil/mcp-server
│       ├── src/
│       │   ├── index.ts         Tool handlers + startServer()
│       │   └── server.ts        Binary entry point
│       └── tests/
├── docs/
├── package.json                 npm workspaces root
└── tsconfig.json                Base TypeScript config (IDE only)
```

---

## Development workflow

### Build all packages

```bash
npm run build
```

This runs `tsup` in each package. Packages with dependencies must be built in order — `core` first, then `schema-ui`, then adapters, then `cli` and `mcp-server`. The workspace build script handles the order automatically.

### Build a single package

```bash
cd packages/core
npm run build
```

### Watch mode

```bash
cd packages/core
npm run dev
```

### Run all tests

```bash
npm test
```

### Run tests for a single package

```bash
cd packages/cli
npm test
```

### Test counts

| Package | Tests |
|---------|-------|
| `@tencil/core` | 9 |
| `@tencil/adapter-penpot-in` | 12 |
| `@tencil/adapter-pencil-out` | 11 |
| `tencil-cli` | 16 |
| `@tencil/mcp-server` | 10 |
| **Total** | **58** |

---

## Adding a new adapter

Adapters live in `packages/adapters/`. To add a new one (e.g. Figma):

1. Create `packages/adapters/figma-in/`
2. Add `package.json` with name `@tencil/adapter-figma-in`
3. Add it to the root `package.json` workspaces
4. Implement the converter function:

```typescript
// packages/adapters/figma-in/src/index.ts
import type { TencilDocument } from "@tencil/core";

export function figmaToTencil(
  figmaData: unknown,
  options?: { id?: string; name?: string }
): TencilDocument {
  // ...
}
```

5. Write tests in `packages/adapters/figma-in/tests/`
6. Register it in the MCP server's `invoke_adapter` handler (`packages/mcp-server/src/index.ts`)

---

## Adding a new CLI command

1. Create `packages/cli/src/commands/mycommand.ts`
2. Export an async function that throws on error (do not call `process.exit()`):

```typescript
export async function myCommand(arg: string, opts: { flag?: boolean }): Promise<void> {
  logger.header("My command");
  // ...
  if (error) {
    logger.error("Something went wrong");
    throw new Error("Something went wrong");
  }
  logger.footer("Done.");
}
```

3. Register it in `packages/cli/src/cli.ts`
4. Export it from `packages/cli/src/index.ts`
5. Write tests in `packages/cli/tests/cli.test.ts`

**Important:** Commands must throw errors, not call `process.exit()`. The CLI entry point handles exits. This makes commands testable.

---

## Adding a new domain schema

Domain schemas live in `packages/schema-*/`. To add `@tencil/schema-ee` (electronics):

1. Create `packages/schema-ee/`
2. Define node types extending `TencilNodeBase`:

```typescript
import type { TencilNodeBase } from "@tencil/core";

export interface TencilSchematic extends TencilNodeBase {
  type: "schematic";
  components?: TencilComponent[];
  nets?: TencilNet[];
}
```

3. Export from `packages/schema-ee/src/index.ts`

---

## Code style

- TypeScript strict mode — no `any` unless justified
- ESM modules — all imports use `.js` extensions
- No default exports — named exports only
- No `process.exit()` in library code — throw errors instead
- Tests use Vitest and run with `--pool forks` for commands that use `process.chdir()`

---

## Publishing

All packages publish to npm under the `@tencil` scope (or `tencil-cli` for the CLI).

```bash
# Build first
npm run build

# Publish in dependency order
cd packages/core && npm publish --access public
cd ../schema-ui && npm publish --access public
cd ../adapters/penpot-in && npm publish --access public
cd ../adapters/pencil-out && npm publish --access public
cd ../cli && npm publish --access public
cd ../mcp-server && npm publish --access public
```

Before publishing, update `file:` dependencies to real version numbers if they haven't been updated already.

---

## What to work on

The [ROADMAP.md](../ROADMAP.md) has the full milestone plan. High-priority near-term contributions:

| Area | What's needed |
|------|---------------|
| Penpot plugin | JavaScript plugin that reads `penpot.selection` and exports `.tencil` |
| Figma adapter | `@tencil/adapter-figma-in` — Figma REST API → TencilDocument |
| `@tencil/schema-ee` | Electronics domain types (components, nets, pins) |
| KiCad adapter | KiCad schematic JSON → TencilDocument |
| Better penpot-in | Support groups, images, components, multiple fills |
