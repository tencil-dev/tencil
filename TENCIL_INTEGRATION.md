# KolaNode × Tencil — Integration Strategy

**Version:** 1.0
**Date:** April 2026
**Status:** Planning — no implementation started

---

## 1. What These Two Projects Are

### KolaNode
A federated, African-sovereign Git platform for integrated product engineers. It hosts code, PCB schematics, and 3D CAD models together in one workspace. Engineers in Lagos, Nairobi, or Cairo push to their own sovereign node instead of GitHub's servers in Virginia.

### Tencil
A universal design translation protocol. It bridges design tools (Penpot, KiCad, Blender, SolidWorks) that were never built to talk to each other. Its core asset is the `.tencil` file format — a typed JSON container for design data with a `links[]` array that defines cross-domain relationships (e.g. "this UI button controls this PCB GPIO pin").

---

## 2. The Relationship — Why They Connect

These are not competing projects. They solve adjacent problems at different layers of the same stack:

| Layer | What it answers | Who answers it |
|---|---|---|
| **Storage & versioning** | Where does engineering work live and how is it shared? | **KolaNode** |
| **Translation & linking** | How do tools that can't talk to each other exchange data? | **Tencil** |

They are complementary by design:

```
[ KiCad ]       ──tencil adapter──► [ .tencil file ] ──► stored in KolaNode (Board panel)
[ SolidWorks ]  ──tencil adapter──► [ .tencil file ] ──► stored in KolaNode (Enclosure panel)
[ Firmware ]    ─────────────────────────────────────► stored in KolaNode (Code panel)

KolaNode's cross-reference sidebar reads Tencil's links[] to show:
"This C code controls PWM on PCB trace P3"
```

KolaNode is where the work **lives**. Tencil is the language that explains how the **parts relate**.

---

## 3. The Specific Overlap

KolaNode's Project Canvas needs a cross-reference system — a way for the Code panel to show "this firmware file controls this PCB pin" and for the Enclosure panel to show "this housing fits around this board." That is exactly what Tencil's `links[]` array is designed to express.

| KolaNode (planned feature) | Tencil (already designed) |
|---|---|
| `kolanode.yaml` cross-reference config | `links[]` in `.tencil` format |
| "Code panel knows which PCB pin it controls" | `controls` link type: source → GPIO pin |
| "PCB knows its housing constraints" | `encloses` / `located-at` link types |
| Board panel renders KiCad files | `@tencil/schema-ee` + KiCad adapter |
| Enclosure panel renders STEP/STL files | `@tencil/schema-3d` + Blender/STEP adapter |

Rather than build a custom `kolanode.yaml` cross-reference format and then later have to migrate to Tencil, the decision is to:

- **Ship v1 with `kolanode.yaml`** (simple, no external dependency, works immediately)
- **Add `project.tencil` support in v1.5** when Tencil M1 ships (Q3 2026)
- When both files exist, `project.tencil` takes precedence for cross-references

This avoids inventing a third hybrid format and means both projects grow together naturally.

---

## 4. What Is NOT Being Done

The following was considered and rejected:

**Rejected: A hybrid unified manifest YAML with inline `tencil_links:` block**
```yaml
# DO NOT DO THIS — invents a third format neither project owns
project: drone-controller
tencil_links:
  - id: "arm-button"
    source: { domain: "ui", nodeId: "arm-btn" }
    target: { domain: "ee", nodeId: "gpio-arm" }
```
This creates a format that is neither pure KolaNode nor pure Tencil. Instead, KolaNode reads a real `.tencil` file directly. No hybrid.

---

## 5. The Integration Phases

### Phase 1 — KolaNode v1 (Q2–Q3 2026): Independent
KolaNode ships with its own `kolanode.yaml` for cross-references. No Tencil dependency. Tencil is not required.

```yaml
# kolanode.yaml — v1 cross-reference (simple, hand-written)
project: solar-tracker-v2
links:
  - source: firmware/main.c
    target: schematics/power.kicad_pcb
    note: "PWM control on trace P3"
  - source: schematics/pcb.kicad
    target: enclosure/body.step
    note: "PCB fits in bay A, 2W heat source"
```

### Phase 2 — KolaNode v1.5 (Q3–Q4 2026): Tencil manifest support
Tencil M1 ships the `.tencil` format as a stable JSON spec. KolaNode adds support for reading it.

- KolaNode checks for `project.tencil` at repo root on project load
- If found, reads `links[]` array to populate the cross-reference sidebar
- `kolanode.yaml` still works as a fallback — no migration forced on existing projects
- The Tencil Bridge plugin (see section 7) handles conversion from KiCad → `.tencil`

### Phase 3 — KolaNode v2 + Tencil M3 (Q1 2027): Full EE integration
Tencil M3 ships KiCad adapter support. KolaNode and Tencil share infrastructure.

- `@kolanode/kicad-parser` is published as an open-source package and consumed by Tencil M3
- `kola mcp enable tencil` works: KolaNode nodes become AI-accessible workspaces
- AI consistency checker goes live (see section 6)

### Phase 4 — KolaNode as Tencil Cloud backend (Q3 2027+)
- Tencil Studio users can save `.tencil` projects directly to their KolaNode lobe
- KolaNode becomes the sovereign African home for the Tencil ecosystem
- Engineers using Tencil who want African data residency use KolaNode as their cloud

---

## 6. The AI Consistency Checker (`kola mcp enable tencil`)

This is the most powerful outcome of the integration. KolaNode nodes expose the Tencil MCP server, allowing an AI agent to reason across Code + Board + Enclosure simultaneously.

```bash
$ kola mcp enable tencil

$ kola ai analyze --project drone-controller
Analyzing cross-domain consistency...

✓ UI button "arm"     → PCB GPIO 4              (linked)
✗ Display cutout      120mm → UI safe area 100mm (MISMATCH)
✓ Battery compartment → PCB battery connector   (aligned)
✓ Firmware PWM        → PCB trace P3            (linked)

1 issue found. Run `kola ai fix` to see suggestions.
```

This detects that a 3D housing cutout doesn't match the UI design **before manufacturing**. No other Git platform does this. It is a direct competitive advantage specific to the KolaNode + Tencil combination.

Full implementation deferred to v2 — `kola mcp enable tencil` is stubbed in v1.5 CLI.

---

## 7. The Tencil Bridge Plugin

A KolaNode plugin (not a core feature) that handles conversion between KiCad projects and `.tencil` format. Lives in the KolaNode plugin ecosystem when the marketplace launches (v2).

```json
{
  "id": "org.kolanode.tencil-bridge",
  "name": "Tencil Bridge",
  "type": "connector",
  "version": "1.0.0",
  "triggers": {
    "onFileOpen": ["*.tencil"],
    "onCommand": "kola-tencil-convert"
  },
  "actions": {
    "export-to-tencil": "Convert KiCad project to .tencil format",
    "import-from-tencil": "Import .tencil links into kolanode.yaml",
    "view-cross-domain": "Show Code ↔ Board ↔ Enclosure relationships"
  }
}
```

This is a plugin, not a core dependency. KolaNode works without it. Engineers who want full Tencil cross-domain linking install it.

---

## 8. The Shared KiCad Parser Library

Both projects need to parse KiCad files:
- **KolaNode** — to render schematics in the Board panel (KiCanvas)
- **Tencil M3** — to run the KiCad adapter (`kicad-to-tencil-ee`)

Rather than each project writing its own parser, KolaNode extracts its parser as a standalone open-source package when building the Board panel viewer.

**Package:** `@kolanode/kicad-parser`

```typescript
// Shared by KolaNode Board panel AND Tencil M3 adapter
export function parseKiCadSchematic(file: Uint8Array): KiCadProject;
export function extractSymbols(project: KiCadProject): Symbol[];
export function extractNets(project: KiCadProject): Net[];
export function generateTencilEE(project: KiCadProject): TencilDocument;
```

**Why this matters:**
- Tencil M3 can use `@kolanode/kicad-parser` directly instead of building from scratch
- One well-maintained parser instead of two diverging implementations
- KolaNode contributes meaningfully to the open-source EE toolchain
- Positions KolaNode as infrastructure, not just a hosting service

---

## 9. Roadmap Alignment Table

| Quarter | KolaNode | Tencil | Shared |
|---|---|---|---|
| Q2–Q3 2026 | v1 MVP: Project Canvas, Board viewer, `kolanode.yaml` | M1: `.tencil` format stable, Penpot ↔ Pencil | — |
| Q4 2026 | v1.5: Read `project.tencil`, Tencil Bridge plugin stub | M2: Figma bridge, `.tencil` v1.0 locked | `.tencil` as KolaNode manifest |
| Q1 2027 | v2: `kola mcp enable tencil`, AI consistency checker | M3: KiCad adapter ships | `@kolanode/kicad-parser` published |
| Q3 2027 | KolaNode as Tencil Cloud backend option | M6: Studio v1 | Tencil Studio → save to KolaNode lobe |
| Q4 2027 | Auto-docs from KolaNode repos via Tencil links | M7: Generate feature | Joint "Generate" workflow |

---

## 10. What Stays Separate

These two projects remain independent. The integration is additive, not merged:

- **Separate codebases** — KolaNode is Forgejo-based Go + React. Tencil is TypeScript packages.
- **Separate naming conventions** — `NAMING.md` files are kept per-project. Tencil terminology does not appear in KolaNode's UI.
- **Separate roadmaps** — KolaNode has a hardware track (KolaBox) that Tencil has no involvement in. Tencil has a medical domain (M8) that KolaNode has no involvement in.
- **No hard dependency** — KolaNode v1 ships and works without Tencil existing. Tencil M1–M2 ships and works without KolaNode existing.

The connection is a **protocol bridge**, not a merger.

---

## 11. The Strategic Vision

> Tencil translates between tools. KolaNode hosts the translation. Together, African engineers can design across UI, electronics, and mechanics — with AI reasoning across all three — while keeping their intellectual property on the continent.

If GitHub is a library, KolaNode is a workshop. If the workshop has a universal translator built in (Tencil), an engineer in Lagos can open a `.tencil` project, see their firmware linked to their PCB linked to their housing, ask an AI agent to check for mismatches, and fix them — all without leaving African infrastructure.

That is the horizon this integration is building toward.
