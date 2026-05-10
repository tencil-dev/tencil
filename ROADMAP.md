# Tencil Roadmap

**Status:** Living document — updated as milestones complete  
**Last Updated:** April 2026  
**Current Phase:** M2 — The Standard  
**Previous Phase:** M1 (UI Bridge) — ✅ Complete

---

## Milestones (Delivery Gates, Not Time-Boxes)

Each milestone is a **complete, shippable increment**. No work starts on M2 until M1 is fully done and validated.

---

## M1 — UI Bridge ✅ Complete

**Gate:** Penpot → Pencil.dev translation works end-to-end via CLI. ✅ Shipped.

**Deliverables:**
- [x] `@tencil/core` — `TencilNodeBase`, `TencilLink`, `TencilDocument`, link integrity validation — 15 tests ✅
- [x] `@tencil/schema-ui` — all UI types (`TencilFrame`, `TencilText`, `TencilRectangle`, `TencilEllipse`) — 8 tests ✅
- [x] `@tencil/adapters` — 5 adapters (penpot-in, penpot-file-in, penpot-out, pencil-in, pencil-out), 73 tests ✅
- [x] ~~`plugin-penpot`~~ — **Deferred / replaced**: native ZIP adapters (`penpot-file-in` reads `.penpot` directly, `penpot-out` writes importable `.penpot` ZIP) — no browser plugin needed for M1
- [x] `@tencil/pencil-bridge` — implemented as `pencil-in` + `pencil-out` adapters via Pencil MCP ✅
- [x] `tencil-cli` — 6 commands (`start`, `export`, `import`, `validate`, `push`, `link`) — 29 tests ✅
- [x] `@tencil/mcp-server` — 7 tools (exceeds M1 target of 3): `read_tencil`, `write_tencil`, `summarize_tencil`, `invoke_adapter`, `pull_from_pencil`, `create_link`, `list_links` — 10 tests ✅
- [x] File format: `.tencil` — UTF-8 JSON, versioned schema (`"tencil": "1.0"`), validated ✅
- [x] Protocol groundwork: schema versioned, public docs written (`docs/` directory) ✅

**Final test count:** 135 tests across 9 packages, all passing.

**Validation completed:**
1. `tencil export design.penpot --output result.tencil` → parses native .penpot ZIP ✅
2. `tencil push --to penpot result.tencil --out output.penpot` → importable in Penpot via File → Import ✅
3. From Claude chat: Tencil MCP `invoke_adapter` → Pencil MCP `batch_design` ✅

---

## M2 — The Standard

**Gate:** `.tencil` is a real file format. Tencil is a protocol, not just a CLI.

**Deliverables:**
- [ ] Freeze `@tencil/core` + `@tencil/schema-ui` at v1.0 — no breaking changes after
- [ ] `.tencil` file extension (UTF-8 JSON, required `"tencil": "1.0"` + `"domain"` field)
- [ ] Domain MIME subtypes registered in docs (`application/vnd.tencil.ui+json`)
- [ ] VS Code extension: `.tencil` → JSON grammar, file icon, syntax highlighting
- [ ] `tencil migrate design.tencil.json` → `design.tencil`
- [ ] `tencil view` → JSON tree browser in browser (minimal, proves command works)
- [ ] Figma bridge: Figma Web API read → `TencilDocument` → Penpot/Pencil write
- [ ] `docs/` roadmap files written (all 10 milestone docs)
- [ ] README badges: "Made with Tencil" shield + `.tencil` file badge

---

## M3 — EE Domain

**Gate:** KiCad files live in Tencil. First multi-domain `.tencil` file exists.

**Deliverables:**
- [ ] `@tencil/schema-ee` — `TencilSymbol`, `TencilNet`, `TencilPin`, `TencilBoard`, `TencilTrace`
- [ ] KiCad adapter: KiCad JSON export → `TencilDocument` (EE domain)
- [ ] `tencil generate --target firmware` — generates TypeScript/C pin config from `links[]`
- [ ] First real `links[]` between UI and EE nodes
- [ ] `.tencilrc` domain routing fully exercised for `ee` domain
- [ ] `docs/m3-ee.md` updated with implementation notes

---

## M4 — Viewer

**Gate:** Open a multi-domain `.tencil` and see all domains side by side.

**Deliverables:**
- [ ] `packages/viewer/` — React app, split-pane (one panel per domain in file)
- [ ] UI panel: Canvas 2D renderer (`TencilFrame`, `TencilText`, etc.)
- [ ] EE panel: KiCanvas embed
- [ ] Inspector panel: node properties + links
- [ ] Drag-to-link gesture in Viewer (link management write operation)
- [ ] Validation warnings in Inspector
- [ ] `tencil view design.tencil` fully working

---

## M5 — 3D Domain

**Gate:** Blender/glTF files live in Tencil. Physical products fully representable.

**Deliverables:**
- [ ] `@tencil/schema-3d` — `TencilMesh`, `TencilMaterial`, `TencilScene`, etc.
- [ ] Blender/glTF adapter
- [ ] Three.js panel added to Viewer
- [ ] `located-at`, `encloses`, `mounts-on` link types now have geometry
- [ ] `docs/m5-3d.md` updated

---

## M6 — Studio v1 (Link Editor)

**Gate:** First paid product ships. Cross-domain links created visually.

**Deliverables:**
- [ ] `studio.tencil.dev` — React web app, deployed on Vercel or Cloudflare Pages
- [ ] Split-pane UI (reuses Viewer code: Canvas 2D + KiCanvas + Three.js)
- [ ] Drag-to-link between panels (full gesture implementation)
- [ ] Link form editor in Inspector (editable)
- [ ] `controls`, `displays`, `triggers`, `powered-by` link types implemented
- [ ] Per-link-type validation (`LinkValidation.check`)
- [ ] Simulation: graph traversal on `links[]` + CSS animation on `link.state`
- [ ] What-if analysis: `Array.filter()` on link graph from selected node
- [ ] Topology graph view of all cross-domain links
- [ ] `tencil studio --bridge` — localhost HTTP bridge for local file access
- [ ] AI-assisted link suggestions (Claude suggests, user confirms)
- [ ] Auth: Clerk JWT

**Why M6:** Studio with three domains (UI + EE + 3D) allows the defining demo: link a UI button → GPIO pin → physical button on 3D model. Two domains don't have this moment. Three panels do.

---

## M7 — Studio v2 (Generate & Document)

**Gate:** From a linked `.tencil` file, generate real artifacts.

**Deliverables:**
- [ ] `tencil generate --target docs` — Markdown user manual from link data
- [ ] `tencil generate --target tests` — manufacturing test procedures from links
- [ ] `tencil generate --target bom` — bill of materials impact analysis
- [ ] Supply chain impact analysis (graph traversal from changed node)
- [ ] Template engine: Markdown with `{{domain.nodeId.property}}` replacement

---

## M8 — Medical Domain

**Gate:** FHIR/HL7 bridge. Tencil enters healthcare.

**Deliverables:**
- [ ] `@tencil/schema-med` — `TencilPatientRecord`, `TencilDiagnostic`, etc.
- [ ] OpenMRS / EHRbase adapter
- [ ] DICOM viewer panel in Viewer/Studio
- [ ] FHIR data stream → UI field mapping
- [ ] Medical-specific link types (`reads-from`, `prescribes`, `monitors`)
- [ ] `docs/m8-medical.md` updated

---

## M9 — Studio v3 (Multi-user)

**Gate:** Two engineers edit links simultaneously.

**Deliverables:**
- [ ] Yjs CRDT on `links[]` array (append-only design already compatible)
- [ ] Real-time sync via WebSocket
- [ ] Presence indicators (who is editing what link)
- [ ] Conflict resolution for concurrent link edits
- [ ] `docs/m9-studio-v3.md` updated

---

## M10 — The Protocol (Completion Gate)

**Gate:** Tencil is a community standard, not just a product.

**Deliverables:**
- [ ] IANA MIME type registration (`application/vnd.tencil.*+json`)
- [ ] Public schema registry — versioned, community-readable
- [ ] `@tencil/sdk` — published package for building custom adapters
- [ ] Community adapter contributions open (Fusion 360, Altium, Epic FHIR, etc.)
- [ ] `docs/m10-protocol.md` updated with final state

**Note:** Protocol work starts at M2 (open schema, versioning, public docs) and matures with each milestone. M10 is the ceremony — IANA, SDK, community — not the beginning of the work.

---

## Timeline (Estimated)

| Milestone | Target | Duration |
|-----------|--------|----------|
| **M1** — UI Bridge | ✅ Complete (Apr 2026) | 135 tests, 9 packages |
| **M2** — The Standard | Q4 2026 | 1 month |
| **M3** — EE Domain | Q1 2027 | 2 months |
| **M4** — Viewer | Q2 2027 | 1 month |
| **M5** — 3D Domain | Q2 2027 | 1 month |
| **M6** — Studio v1 | Q3 2027 | 2 months |
| **M7** — Studio v2 | Q4 2027 | 1 month |
| **M8** — Medical | Q1 2028 | 2 months |
| **M9** — Studio v3 | Q2 2028 | 1 month |
| **M10** — Protocol | Q3 2028 | Ongoing |

**Note:** Milestones are **completion gates**, not deadlines. Each milestone ships when done, not when the calendar says so.

---

## Business Model Timeline

| Phase | Revenue Stream | Target |
|-------|----------------|--------|
| M1-M2 | $0 (open source) | Build community |
| M3-M4 | Cloud beta ($10/user) | Early adopters |
| M5-M6 | Cloud GA + Studio | Product-market fit |
| M7-M8 | Enterprise pilots | Regulated industries |
| M9-M10 | Enterprise scale | Sustainable revenue |

See [docs/business-model.md](./docs/business-model.md) for detailed revenue projections.

---

## Key Dependencies

| External | Milestone | Risk |
|----------|-----------|------|
| Penpot plugin API stability | ~~M1~~ N/A | Replaced by native ZIP adapters |
| Pencil MCP availability | M1 | Low — already works |
| KiCad JSON export quality | M3 | Medium — test early |
| Blender glTF exporter | M5 | Low — standard format |
| Clerk Enterprise SSO | M8 | Low — they have it |
| Yjs stability | M9 | Low — battle-tested |

---

## Contingencies

**If M1 takes longer:**
- Cut scope: Ship with board + rectangle + text only (no ellipses, paths)
- Keep M2 date fixed, extend M1

**If KiCad JSON is bad:**
- Fallback: Parse KiCad XML directly
- Adds 2 weeks to M3

**If Studio isn't sticky:**
- Pivot: Viewer + CLI is the product, Studio becomes Cloud-only feature
- Doesn't block M1-M5

---

## How to Read This Roadmap

- **Green checkmarks (✓):** Done, validated, shipped
- **Empty boxes ([ ]):** Not started
- **In-progress:** Being worked on now

**Status updates:** This file is updated when milestones complete, not on a schedule.

---

## Contributing to the Roadmap

Milestones M1-M4 are **locked** (founder-led). 
Milestones M5+ are **open for discussion**:
- Open an issue with `roadmap` label
- Suggest scope changes with justification
- Vote on existing proposals with 👍 reactions
