# The Case for Tencil

## The Problem

Design tools don't talk to each other. Figma, Penpot, KiCad, Blender — each speaks its own language. This creates friction at every handoff:

- **Designers** work in Figma; engineers need KiCad schematics
- **Hardware teams** build 3D models; software teams need UI specs
- **Medical devices** require FDA traceability; no tool provides cross-domain compliance
- **AI agents** hallucinate when bridging domains; they need structured ground truth

Current solutions: manual export/import (error-prone), custom scripts (brittle), or hiring integration engineers ($150K+/year).

---

## The Solution

**Tencil is a universal design protocol** — a canonical format that lets disconnected tools interoperate while preserving semantic meaning across domains.

### What Tencil Actually Does

1. **Canonical Format** — `.tencil` files store design data in a tool-agnostic, versioned JSON schema
2. **Adapter Pipeline** — Pure functions convert: `Tool A → Tencil → Tool B` (and back)
3. **Cross-Domain Links** — Relate UI buttons to PCB pins to 3D buttons with typed relationships (`controls`, `displays`, `powered-by`)
4. **Ground Truth for AI** — Structured data that AI assistants can query, validate, and reason about

---

## Why AI Doesn't Make Tencil Obsolete

| Direct AI Connection | Tencil |
|---------------------|--------|
| **Ephemeral session** — operates tool right now | **Persistent artifact** — lives forever, versioned, auditable |
| **Single tool** — AI talks to Blender OR KiCad | **Cross-domain linking** — UI → PCB → 3D connected in one file |
| **No structure** — ad-hoc operations | **Ground truth** — structured data AI can query and validate |
| **No compliance** — "AI did something" | **Auditability** — who changed what, when, with e-signatures |
| **Tool-specific** — re-implement for each tool | **Universal** — learn once, works with any adapter |

**The key insight:** AI needs Tencil *more*, not less. When Claude connects to Blender, it can manipulate meshes but cannot:
- See how that 3D button relates to the Figma UI design
- Know which PCB pin controls the LED in the 3D model  
- Generate a compliance report linking all three domains
- Hand off to someone using a different tool (SketchUp, Rhino)

**Tencil isn't a replacement for AI-tool connections — it's the structured layer that makes AI cross-domain reasoning possible.**

---

## The Moat: Network Effects + Compliance

### 1. Cross-Domain Link Semantics
Tencil defines relationship types that carry meaning:

```json
{
  "type": "controls",
  "source": "ui:button-id",
  "target": "ee:gpio-pin-4"
}
```

This means: *"When this UI button is pressed, signal flows to this PCB pin."*

No direct AI connection provides this semantic graph.

### 2. Network Effects
Every new adapter (KiCad, Figma, Altium, SolidWorks) makes Tencil more valuable. Direct AI connections are one-off integrations without compounding value.

### 3. Compliance as Moat
Medical device companies (FDA 21 CFR Part 11) and aerospace (DO-178C) **cannot** rely on ephemeral AI sessions. They need:
- Versioned files
- Audit trails
- Electronic signatures
- Traceability matrices

Tencil provides this; direct AI connections don't.

---

## Use Cases

### Hardware Startup (Smart Thermostat)
**Without Tencil:** Designer in Figma → engineer manually recreates in KiCad → 3D team guesses button placement → misalignment costs 2 weeks rework.

**With Tencil:** Designer exports `.tencil` → engineer imports to KiCad (pins auto-linked) → 3D team imports (button placement validated against PCB) → single source of truth.

### Medical Device (FDA Submission)
**Without Tencil:** 3 months creating traceability matrix manually. Every UI threshold linked to sensor spec, every alarm linked to risk analysis — done in Excel, error-prone.

**With Tencil:** Links defined in Tencil Studio → `tencil generate --target docs` produces FDA-ready traceability report automatically.

### AI Agent Training
**Without Tencil:** Agent trains in isolated Blender sessions; no context of the full product.

**With Tencil:** Agent queries `.tencil` file → understands "this 3D button controls that UI screen via that PCB relay" → makes decisions with full product context.

---

## Business Model

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | CLI, schema, core adapters (Apache 2.0) |
| **Cloud** | $10-50/user | Real-time sync, team workspaces, backup |
| **Studio** | $5-15/user | Cross-domain link editing, simulation, auto-docs |
| **Enterprise** | $5K-50K/year | On-premise, compliance, SLA, custom adapters |

**Open Core Philosophy:** Core tools free forever. Paid services are genuinely additive (not "open source washing").

---

## Competitive Positioning

| Competitor | Their Model | Our Differentiation |
|------------|-------------|---------------------|
| **Figma** | Closed SaaS | Open protocol, multi-domain (not just UI) |
| **Altium 365** | Closed, $5K+/seat | Open core, affordable, cross-tool |
| **Git-based workflows** | DIY, manual | Automated, purpose-built, validated |
| **AI tool connections** | Ephemeral, single-tool | Persistent, cross-domain, auditable |

---

## The Bottom Line

**Tencil is worth building because:**

1. Cross-domain hardware products (smart devices, medical instruments, IoT) will exist
2. Those products need documentation, compliance, and handoff between teams
3. AI needs structured ground truth to reason across domains, not just operate within them
4. Compliance requirements (FDA, ISO, DO-178C) aren't disappearing in the AI era

**The question isn't:** *"Will AI make file formats obsolete?"*

**The question is:** *"Will the need for cross-domain, auditable, structured design data disappear?"*

Medical device companies, aerospace engineers, and hardware startups say: **no.**

---

## Next Steps

- **M1 Complete:** Penpot ↔ Pencil.dev pipeline working (135 tests passing)
- **M2 In Progress:** Freeze schema v1.0, register MIME types, Figma bridge
- **M3 Planned:** KiCad integration (first multi-domain `.tencil`)
- **M6 Planned:** Studio v1 launch (first paid product)

See `ROADMAP.md` for full milestone details.
