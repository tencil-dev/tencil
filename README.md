# Tencil

**Universal design translation between disconnected tools.**

Tencil is an open-source bridge between design tools. Export from Penpot, import to Pencil.dev (and eventually KiCad, Blender, medical systems). One format, infinite connections.

## Status

**Phase 1 (Complete):** Penpot ↔ Pencil.dev pipeline — 135 tests passing ✅
- [x] Schema design (8/8 schema-ui type tests)
- [x] Business model & architecture
- [x] Monorepo scaffold & core types (15/15 tests — includes link validation)
- [x] Penpot adapters (13+12 tests for HTTP + native ZIP)
- [x] Pencil adapters (20+16 tests for in + out)
- [x] CLI tool — `tencil start` (interactive), `export`, `import`, `validate`, `link` (29/29 tests)
- [x] MCP server — `read_tencil`, `write_tencil`, `invoke_adapter`, `create_link`, `list_links` (10/10 tests)
- [ ] Penpot plugin (future)

See [ROADMAP.md](./ROADMAP.md) for details.

## Quick Start

```bash
npm install
npm run build       # Build all packages
npm run test        # Run 135 tests across all packages ✅
npm run type-check  # TypeScript type validation ✅
npm run dev         # Watch mode for development
```

The monorepo contains 9 packages:

| Package | Tests | Purpose |
|---------|-------|---------|
| `@tencil/core` | 15/15 ✅ | Base types, validation, link integrity |
| `@tencil/schema-ui` | 8/8 ✅ | UI domain types (Frame, Text, Rectangle, Ellipse) |
| `@tencil/adapter-penpot-in` | 13/13 ✅ | Penpot HTTP API → Tencil |
| `@tencil/adapter-penpot-file-in` | 12/12 ✅ | Penpot ZIP file → Tencil |
| `@tencil/adapter-penpot-out` | 12/12 ✅ | Tencil → Penpot ZIP file |
| `@tencil/adapter-pencil-in` | 20/20 ✅ | Pencil.dev MCP → Tencil |
| `@tencil/adapter-pencil-out` | 16/16 ✅ | Tencil → Pencil.dev MCP |
| `tencil-cli` | 29/29 ✅ | CLI: start/export/import/validate/link |
| `@tencil/mcp-server` | 10/10 ✅ | AI agent integration tools |

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
- **For AI agents:** Reason across multiple design domains

## Architecture

- **Schema:** Canonical `.tencil` format (design once, export anywhere)
- **Adapters:** Pure functions (Penpot→Tencil, Tencil→Pencil, etc.)
- **CLI:** Local tool for file conversion
- **Cloud:** Real-time sync and collaboration
- **Studio:** Cross-domain relationship editor
- **MCP Server:** Integration with AI assistants (Claude, etc.)

See [docs/cloud-architecture.md](./docs/cloud-architecture.md) and [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md).

## Contributing

Tencil is early-stage. We're looking for:

- TypeScript developers (adapters, CLI, MCP server)
- Design tool experts (Penpot, Figma, KiCad)
- Technical writers (docs, tutorials)
- Hardware engineers (KiCad/EE domain expertise)

See [docs/GOVERNANCE.md](./docs/GOVERNANCE.md) for project principles.

## License

Apache 2.0 — See [LICENSE](./LICENSE)

Tencil core will always be free and open source. Paid services (Cloud, Enterprise) fund continued development.

---

**Status:** M1 Complete, M2 In Progress  
**Current Phase:** The Standard — freezing schema v1.0, registering MIME types  
**Contact:** Open an issue or see [docs/GOVERNANCE.md](./docs/GOVERNANCE.md)
