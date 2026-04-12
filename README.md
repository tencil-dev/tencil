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

## License

Apache 2.0 — See [LICENSE](./LICENSE)

Tencil core will always be free and open source. Paid services (Cloud, Enterprise) fund continued development.

---

**Built by:** Theodore Esakome ([@esakome](https://github.com/esakome))  
**Status:** Pre-alpha, active development  
**Contact:** Open an issue or discussion
