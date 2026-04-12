<<<<<<< HEAD
# Tencil

**Universal design translation between disconnected tools.**

Tencil is an open-source bridge between design tools. Export from Penpot, import to Pencil.dev (and eventually KiCad, Blender, medical systems). One format, infinite connections.

## Status

**Phase 1 (In Progress):** Building Penpot ↔ Pencil.dev bridge
- [x] Schema design
- [x] Business model & architecture
- [ ] Core adapters (in progress)
- [ ] CLI tool
- [ ] Penpot plugin

See [ROADMAP.md](./ROADMAP.md) for details.

## Quick Start

Coming soon. Subscribe to releases for updates.

## Business Model

Tencil is **open core**:

- **Free forever:** CLI, schema, adapters ([Apache 2.0](./LICENSE))
- **Paid services:** Cloud hosting, Studio editor, Enterprise compliance

See [docs/business-model.md](./docs/business-model.md) for revenue model and sustainability plan.

## Why Tencil?

Design tools don't talk to each other. Figma, Penpot, KiCad, Blender—each speaks its own language. Tencil provides a universal translator:

- **For designers:** Work in your preferred tool
- **For engineers:** Receive structured, consistent output
- **For teams:** Single source of truth across domains

## Architecture

- **Schema:** Canonical `.tencil` format (design once, export anywhere)
- **Adapters:** Pure functions (Penpot→Tencil, Tencil→Pencil, etc.)
- **CLI:** Local tool for file conversion
- **Cloud:** Real-time sync and collaboration
- **Studio:** Cross-domain relationship editor

See [docs/cloud-architecture.md](./docs/cloud-architecture.md).

## Contributing

Tencil is early-stage. We're looking for:

- TypeScript developers (adapters, CLI)
- Design tool experts (Penpot, Figma, KiCad)
- Technical writers (docs, tutorials)

See [GOVERNANCE.md](./docs/GOVERNANCE.md) for project principles.
=======
# Tencil: Universal Design Translation Protocol

A protocol for bridging design tools across UI, electronics, 3D, and medical domains. Built specifically to enable cross-domain reasoning and AI-assisted design workflows.

## Structure

This is a monorepo containing:

### Core Packages

- **`@tencil/core`** — Base types, validation, and protocol definition
  - `TencilDocument`, `TencilNodeBase`, `TencilLink` types
  - Zod-based validation with runtime type-checking
  - Link types for cross-domain relationships

- **`@tencil/schema-ui`** — UI/UX domain schema
  - `TencilFrame`, `TencilText`, `TencilRectangle`, `TencilEllipse`, `TencilPath`
  - Layout and typography properties

### Adapters

- **`@tencil/adapter-penpot-in`** — Import from Penpot designs
- **`@tencil/adapter-pencil-out`** — Export to Pencil.dev designs

### Tools

- **`tencil-cli`** — Command-line interface
  - `tencil create <name>` — Initialize new project
  - `tencil export` — Convert to `.tencil` format
  - `tencil import` — Convert from `.tencil` format
  - `tencil validate` — Validate `.tencil` files

- **`@tencil/mcp-server`** — Model Context Protocol server for AI agents
  - `read_tencil` — Read and parse documents
  - `write_tencil` — Write/modify documents
  - `invoke_adapter` — Run adapters programmatically

## Quick Start

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Watch mode for development
npm run dev
```

## Testing

Each package has its own test suite. Run all tests:

```bash
npm run test
```

Or test a specific package:

```bash
cd packages/core
npm test
```

## Development

The monorepo uses:

- **TypeScript** — Strict mode, ESM output
- **Vitest** — Testing framework
- **tsup** — Build bundler
- **Zod** — Runtime validation

### File Paths

When importing between packages, use relative paths:

```typescript
import { parseTencilDocument } from "@tencil/core";
import type { TencilFrame } from "@tencil/schema-ui";
```

## Project Status

**Version:** 0.1.0 (M1 Alpha)

This is the first implementation milestone. The `.tencil` format is **unstable** — API may change. All packages are functional but incomplete.

### M1 Deliverables (Q3 2026)

- [x] Monorepo scaffold
- [x] `@tencil/core` (types + validation)
- [x] `@tencil/schema-ui` (UI domain)
- [ ] Penpot adapter
- [ ] Pencil adapter
- [ ] CLI commands
- [ ] MCP server

### Future Roadmap

See [ROADMAP.md](./ROADMAP.md) for the complete 10-milestone plan.
>>>>>>> 15ebd2c (Initial commit: Tencil Phase 1 monorepo)

## License

Apache 2.0 — See [LICENSE](./LICENSE)
<<<<<<< HEAD

Tencil core will always be free and open source. Paid services (Cloud, Enterprise) fund continued development.

---

**Built by:** Theodore Esakome ([@esakome](https://github.com/esakome))  
**Status:** Pre-alpha, active development  
**Contact:** Open an issue or discussion
=======
>>>>>>> 15ebd2c (Initial commit: Tencil Phase 1 monorepo)
