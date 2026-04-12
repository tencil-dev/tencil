# Tencil Use Cases

**Status:** Vision document  
**Purpose:** Illustrate cross-domain workflows that Tencil enables

---

## Core Workflows

Cross-domain design translation creates workflows that don't exist today:

| Direction | Use Case |
|-----------|----------|
| **EE → Blender** | PCB schematic → 3D enclosure generation. Agent: "Given this Arduino circuit with motor driver, generate a ventilated housing with mounting bosses at PCB hole locations." |
| **Blender → EE** | Product housing (Blender) → Tencil → KiCad keeps-out zones. Agent: "The battery compartment is 2mm from where the PCB sits. Add copper keepout region." |
| **UI → Blender** | App interface (Penpot) → 3D device render showing the physical product with that UI on its screen. Marketing asset generation. |
| **All three** | Smart thermostat: Schematic (KiCad) + App UI (Penpot) + Wall-mounted housing (Blender) → single Tencil file → agent validates: "Does the display cutout in the housing match the UI safe area? Does the PCB fit the mounting posts?" |

---

## Advanced Use Cases

### 1. Hardware-in-the-Loop Design Reviews
Product manager opens .tencil file in Pencil, sees both PCB 3D render and mobile app UI side-by-side. "The physical button placement doesn't align with the onboarding flow." One file, two domains, human judgment.

### 2. Compliance Documentation Automation
Medical device: Schematics (EE) + User interface (UI) + Risk analysis (Med). Tencil becomes the single source for regulatory submissions. Agent generates: "Given this insulin pump schematic and this dosage screen, enumerate all single-failure modes that could cause overdose."

### 3. Cross-Domain Diffing
Version control for hardware startups. PR contains: schematic changes + corresponding UI changes. Tencil diff shows: "You moved the temperature sensor to I2C bus 1, but the calibration UI still references the old ADC pin."

### 4. Manufacturing Bridge
EE schematic → Tencil → Factory test UI. The same component metadata (footprint, tolerance, supplier) flows to both the PCB fab house and the technician's tablet interface for manual QA checks.

### 5. Simulation Coupling
Thermal simulation (EE) results feed into UI animation: "Device overheating" state in the app matches actual calculated junction temperatures. Design review validates that warning thresholds in UI code match the physics.

### 6. Accessibility Validation
Agent reads both the circuit (power LED exists) and the UI design (color-blind unfriendly indicator). Flags: "Physical device has status LED, but app UI relies only on red/green colors with no iconography—fails WCAG, contradicts hardware capability."

### 7. Supply Chain UI Generation
BOM from KiCad → Tencil → Penpot frames showing "Out of stock" badges on component symbols. Designers see availability constraints while arranging layouts.

### 8. Test Fixture Design
App UI mockup → Tencil → Test jig schematic. Agent: "This screen has 6 touch targets. Generate pogo pin layout for bed-of-nails tester that probes each target's electrical connectivity."

---

## The Real Unlock

When Tencil spans domains, agents can reason across domains. Not just "convert A to B" but "given A and B, detect inconsistencies, suggest improvements, generate C."

**Example prompt that becomes possible:**

> "I have a medical device schematic (EE) and a patient-facing dashboard (UI). The device sends SpO2 data. Validate that the dashboard's 'low oxygen' alert threshold matches the hardware's sensor accuracy and FDA guidelines for class II devices."

This requires understanding both the electrical precision (EE domain) and the UI warning levels (UI domain) simultaneously. Tencil doesn't just bridge the tools—it bridges the context.

---

## The Future Industrial Design Stack

```
┌─────────────────────────────────────────┐
│         Claude / Cursor (brain)         │
│  "Design a wearable ECG monitor"          │
                  │
┌─────────────────▼───────────────────────┐
│         Tencil MCP Server              │
│  route to domain: ee, ui, 3d           │
└─────────┬──────────┬──────────┬─────────┘
          │          │          │
    ┌─────▼───┐ ┌────▼────┐ ┌──▼────┐
    │  KiCad  │ │ Penpot  │ │Blender│
    │  (EE)   │ │  (UI)   │ │ (3D)  │
    └─────────┘ └─────────┘ └───────┘
```

Tencil isn't the brain. It's the **infrastructure that makes the brain useful across tools that weren't designed to talk to each other.**