# Implementation Notes — Step 1: Monorepo Scaffold & Core

**Date:** April 12, 2026  
**Status:** ✅ Complete  
**Milestone:** M1 Alpha  

---

## What Was Built

### 1. **Monorepo Foundation**

Root-level configuration for npm workspaces:

```
tencil-dev/
├── package.json              (workspace config)
├── tsconfig.json             (base TypeScript config)
├── packages/
│   ├── core/                 (@tencil/core)
│   ├── schema-ui/            (@tencil/schema-ui)
│   ├── adapters/
│   │   ├── penpot-in/
│   │   └── pencil-out/
│   ├── cli/                  (tencil-cli)
│   └── mcp-server/           (@tencil/mcp-server)
```

**Key Files:**
- `package.json` — Root workspace, defines build/test/dev scripts
- `tsconfig.json` — Shared TypeScript configuration (noEmit: true for type-checking only)
- Each package has its own `tsconfig.json` (noEmit: false for building)

### 2. **`@tencil/core` Package — Foundation**

**Status:** ✅ Complete and tested

Provides:
- **Types** (`src/types.ts`)
  - `TencilDocument` — Universal container
  - `TencilNodeBase` — All nodes extend this
  - `TencilLink` — Cross-domain relationships
  - `TencilDomain` — "ui" | "ee" | "3d" | "med" | "multi"
  - `TencilLinkType` — 9 relationship types (controls, displays, located-at, etc.)

- **Validation** (`src/validate.ts`)
  - `parseTencilDocument(json)` — Parse & validate with Zod
  - `validateTencilDocument(doc)` — Validate typed documents
  - Detailed error reporting with field paths

- **Tests** (`tests/core.test.ts`)
  - 9 test cases, all passing ✅
  - Validates all link types
  - Rejects invalid domains, missing IDs, invalid structures
  - Tests optional fields

### 3. **`@tencil/schema-ui` Package**

**Status:** ✅ Complete (stub types only)

Provides:
- `TencilFrame` — Layout container with flex properties
- `TencilText` — Typography element
- `TencilRectangle` — Shape
- `TencilEllipse` — Shape
- `TencilPath` — Vector (deferred to M2)

All extend `TencilNodeBase` with domain-specific properties.

### 4. **Adapter Packages (Stubs)**

**Status:** ✅ Structure in place, implementation deferred

- **`@tencil/adapter-penpot-in`** — Placeholder for Penpot → Tencil
- **`@tencil/adapter-pencil-out`** — Placeholder for Tencil → Pencil

Each has:
- Package config with proper dependencies
- TypeScript build setup
- Placeholder function that throws "Not yet implemented"

### 5. **CLI Package (Stub)**

**Status:** ✅ Structure in place, implementation deferred

- Executable binary at `packages/cli/src/cli.ts`
- Help command implemented (`tencil --help`)
- Placeholder for all M1 commands
- Proper npm bin configuration

### 6. **MCP Server Package (Stub)**

**Status:** ✅ Structure in place, implementation deferred

- `readTencil()` — Placeholder
- `writeTencil()` — Placeholder
- `invokeAdapter()` — Placeholder

---

## Build System

### Tech Stack

| Tool | Purpose | Config |
|------|---------|--------|
| **npm** | Workspace management | `package.json` workspaces array |
| **TypeScript** | Type checking and compilation | `tsconfig.json` per package |
| **tsup** | Bundle and minify | `src/*.ts` → `dist/` |
| **Vitest** | Unit testing | `tests/*.test.ts` |
| **Zod** | Runtime validation | Used in `@tencil/core` |

### Build Commands

```bash
npm run build          # Build all packages (tsup)
npm run test           # Run tests for all packages (vitest)
npm run dev            # Watch mode for development
npm run type-check     # Just type-check without building
```

### Build Output

- `packages/*/dist/` — Compiled JavaScript (ESM)
- `packages/*/dist/*.d.ts` — TypeScript definitions
- All packages have `main` and `types` exports configured

---

## Design Decisions

### 1. **npm Workspaces vs pnpm**

**Decision:** npm workspaces  
**Why:** Better availability in typical Node environments. pnpm not required.  
**File References:** `file:../core` instead of `workspace:*`

### 2. **File Dependencies vs npm Registry**

**Decision:** Local file dependencies now, npm registry later  
**Why:** Faster iteration during development. No need to publish test versions.  
**When to Change:** Once packages stabilize (M2).

### 3. **tsup as Bundler**

**Decision:** tsup (not webpack/esbuild directly)  
**Why:** Zero-config, handles TypeScript + declarations + ESM/CJS automatically.

### 4. **Zod for Validation**

**Decision:** Zod over other validators  
**Why:** Matches the "strict TypeScript" philosophy. Runtime type guarantees.  
**Trade-off:** Small bundle size (~18KB gzipped), acceptable for a schema library.

### 5. **Monorepo Structure**

**Decision:** Flat `packages/*` structure  
**Why:** Simpler than nested (tools/packages, etc.). Easy to add @tencil/schema-ee, @tencil/schema-3d later.

### 6. **TypeScript Configuration**

**Decision:** Each package has its own `tsconfig.json`  
**Why:** Prevents "rootDir is not under src" errors when importing from node_modules.  
**Inheritance:** All extend `tsconfig.json` base (for consistency), but override noEmit.

---

## What's NOT Implemented (Deferred)

| Package | Status | Next Steps |
|---------|--------|-----------|
| `@tencil/adapter-penpot-in` | Stub | Parse Penpot JSON, map to Tencil nodes |
| `@tencil/adapter-pencil-out` | Stub | Convert Tencil nodes to Pencil MCP ops |
| `tencil-cli` commands | Stub | Implement `create`, `export`, `import`, `validate` |
| `@tencil/mcp-server` | Stub | Implement MCP protocol handler |
| `@tencil/schema-ee` | Not started | Q1 2027 (M3), needs KiCad parser |
| `@tencil/schema-3d` | Not started | Q2 2027 (M5) |
| Tests for adapters/CLI/MCP | Not started | Add as implementations progress |

---

## KolaNode Integration

This implementation **unblocks KolaNode v1.5**:

✅ `@tencil/core` is stable and testable  
✅ `parseTencilDocument()` works with Zod validation  
✅ Link types (controls, displays, encloses, etc.) are defined  
✅ npm package ready to be imported: `import { parseTencilDocument } from "@tencil/core"`

KolaNode can now:
1. Depend on `@tencil/core` via npm
2. Read `project.tencil` files from projects
3. Validate them with `parseTencilDocument()`
4. Populate cross-reference sidebar with `links[]` array

---

## Testing

### Current Test Coverage

- **`@tencil/core`**: 9 tests, 9 passing ✅
  - Valid single-domain documents
  - Multi-domain with links
  - Error cases (invalid domain, missing ID, etc.)
  - All 9 link types
  - Optional fields

- **Other packages**: No tests yet (stubs)

### How to Add Tests

```typescript
// packages/<name>/tests/<name>.test.ts
import { describe, it, expect } from "vitest";

describe("@tencil/<name>", () => {
  it("should do something", () => {
    expect(true).toBe(true);
  });
});
```

Run: `cd packages/<name> && npm test`

---

## Next Steps (M1 Continuation)

### Immediate (This Week)

1. **Penpot Adapter** — Implement `penpotToTencil()`
   - Parse Penpot export JSON structure
   - Map frames → TencilFrame
   - Map text → TencilText
   - Map shapes → TencilRectangle/Ellipse
   - Tests covering the happy path

2. **Pencil Adapter** — Implement `tencilToPencil()`
   - Generate Pencil.dev `batch_design` operation strings
   - Frame insertion, shape creation, text styling
   - Tests validating output format

### Short Term (Next 2 Weeks)

3. **CLI Implementation**
   - `tencil create <name>` — Generate project directory
   - `tencil export` — Call penpot adapter, write `.tencil` file
   - `tencil import` — Read `.tencil`, call pencil adapter, output
   - `tencil validate` — Use core validation

4. **End-to-End Demo**
   - Export a Penpot design
   - Run `tencil export`
   - Run `tencil import`
   - Open in Pencil.dev
   - Verify design appears correctly

### Medium Term (M1 Finish)

5. **MCP Server**
   - Implement three tools with proper MCP protocol
   - Integration with Claude Code

6. **Documentation**
   - Getting started guide
   - `.tencil` file format specification
   - Adapter architecture documentation

---

## Verification Checklist

- [x] `npm install` succeeds
- [x] `npm run build` builds all packages without errors
- [x] `npm run test` runs @tencil/core tests, all passing
- [x] TypeScript definitions generated in `dist/`
- [x] `@tencil/core` can parse valid `.tencil` documents
- [x] `@tencil/core` rejects invalid documents with helpful errors
- [x] All 9 link types are recognized
- [x] README and development guide in place
- [x] Ready for KolaNode v1.5 integration

---

## Files Changed Summary

**New files created:** 25+  
**Packages scaffolded:** 7  
**Tests written:** 9  
**Build success rate:** 100%

See git log for details: `git log --oneline`
