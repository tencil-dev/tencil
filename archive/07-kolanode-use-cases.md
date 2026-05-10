# Use Cases: KolaNode × Tencil Fully Built

> These scenarios describe what becomes possible when both KolaNode and Tencil are fully built. They are not all available today. Use the timeline table below to understand when each scenario is realistic. For the integration architecture and phased roadmap, see [TENCIL_INTEGRATION.md](TENCIL_INTEGRATION.md).

---

## When Does Each Scenario Become Real?

| Label | What's required | Timeframe |
|---|---|---|
| **v1** | KolaNode MVP + `kolanode.yaml` cross-references | Q2–Q3 2026 |
| **v1.5** | `project.tencil` support + Tencil M1 stable format | Q3–Q4 2026 |
| **v2** | AI consistency checker + Tencil M3 KiCad adapter + `kola mcp enable tencil` | Q1 2027 |
| **Horizon** | Tencil Studio + Generate feature + KolaBox air-gap hardware | Q3 2027+ |

| Use Case | Earliest realistic availability |
|---|---|
| 1. Kenyan Medical Device | v1.5 (basic linking) → Horizon (compliance automation) |
| 2. Nigerian Solar Controller | v2 (cross-domain simulation + AI check) |
| 3. Ghanaian Agricultural IoT | v1.5 (basic) → v2 (supply chain diff) |
| 4. South African Defense Contractor | Horizon (requires KolaBox air-gap hardware, 2027+) |
| 5. Pan-African University Network | v1 (federation) → v2 (cross-institutional validation) |
| 6. Ethiopian Vaccine Drone | Horizon (requires Tencil Generate + compliance output, 2027+) |
| 7. Moroccan Automotive Sensor | v2 (OEM `.tencil` handoff) |

---

When African data sovereignty meets cross-domain design translation, entirely new workflows become possible. Here are practical scenarios:

---

### 1. The Kenyan Medical Device Startup

**Scenario**: Nairobi-based team building a wearable ECG monitor for African markets.

**The Workflow**:
```
1. Electrical engineer designs circuit in KiCad
   └─ Schematic includes ESP32, ECG frontend, battery management
   
2. UX designer creates patient app in Penpot
   └─ Includes "irregular heartbeat" alerts, battery warnings
   
3. Industrial designer models wristband enclosure in Blender
   └─ Must fit PCB dimensions, allow skin contact for sensors
   
4. Tencil links all three:
   • PCB sensor pin ↔ UI alert threshold
   • Battery circuit ↔ UI "charge by" indicator  
   • Enclosure cutout ↔ UI screen safe area
   
5. Everything pushed to KolaNode:
   └─ Hosted at cardiosense.kolanode.africa
   └─ Data never leaves East African servers
```

**The Unlock**:
- **AI Compliance Check**: "Given this ECG circuit accuracy and this UI's 'abnormal rhythm' threshold, validate against WHO cardiovascular guidelines for Kenya's population"
- **Sovereign IP**: Patient data algorithms stay in Africa (critical for health data sovereignty)
- **Manufacturing Handoff**: Linked Tencil file goes to Shenzhen fab house with full context—fabricator sees not just gerbers, but *which UI alerts depend on which sensors*

---

### 2. The Nigerian Solar Microgrid Controller

**Scenario**: Lagos company building smart controllers for off-grid solar installations across West Africa.

**The Workflow**:
```
1. Hardware: KiCad schematic (MPPT controller, GSM module, power regulation)
2. Software: Penpot dashboards for technicians and end-users  
3. Mechanical: Blender enclosure (weatherproof, tamper-resistant, cooling fins)
4. Links:
   • PCB temperature sensor ↔ Dashboard "overheating" alert
   • GSM signal strength UI ↔ PCB antenna placement
   • Cooling fin geometry ↔ PCB heat-generating components
```

**The Unlock**:
- **Cross-Domain Simulation**: "If ambient temperature hits 45°C (Nigeria typical), will the enclosure cooling + PCB thermal design keep the GSM module within spec? Show me the UI warning that should appear."
- **Rural Deployment**: Field technicians open `controller-v2.tencil` on tablets, see live links between physical DIP switches and UI configuration screens
- **Sovereign Grid Data**: Critical infrastructure designs hosted on African servers, not vulnerable to foreign platform shutdowns or export controls

---

### 3. The Ghanaian Agricultural IoT Network

**Scenario**: Accra agtech startup building soil moisture sensors for cocoa farms.

**The Workflow**:
```
1. Soil sensor node: KiCad (moisture probe, LoRaWAN radio, battery)
2. Farmer mobile app: Penpot (low-bandwidth, local language UI)
3. 3D printed housing: Blender (rainproof, stake-mountable, $2 BOM)
4. Tencil Studio links:
   • Probe calibration curve ↔ "Irrigate now" recommendation UI
   • Battery voltage divider ↔ "Replace battery" alert timing
   • Housing drain holes ↔ PCB waterproofing keepout zones
```

**The Unlock**:
- **Manufacturing Test Fixtures**: App UI mockup → auto-generated test jig schematic. "This screen has 4 touch buttons. Generate pogo pin layout for factory tester."
- **Supply Chain Resilience**: When a chip goes out of stock, Tencil cross-domain diff shows exactly which UI screens and 3D mounting features are affected
- **Farmer-Designed Hardware**: Cooperative extension officers use Tencil Studio (web-based, runs on Chromebooks) to adapt designs for local conditions—sovereign hosting means farmers own their data

---

### 4. The South African Defense Contractor

**Scenario**: Pretoria aerospace company building UAV subsystems with ITAR/data sovereignty requirements.

**The Workflow**:
```
1. Avionics PCB: KiCad (flight controller, encrypted comms)
2. Ground control UI: Penpot (mission planning interface)
3. Airframe integration: Blender (mounting, vibration isolation, aerodynamics)
4. Hosted on: secure.kolanode.africa (air-gapped government cloud)
5. Tencil links:
   • Flight control GPIO ↔ GCS stick mappings
   • PCB vibration sensitivity ↔ Airframe damping design
   • Encrypted telemetry rate ↔ UI real-time display latency
```

**The Unlock**:
- **Compliance Automation**: Complete traceability matrix for defense procurement. "Every UI control maps to a PCB pin, maps to a firmware function, with electronic signatures at each link"
- **No Foreign Data Exposure**: Schematics, UI designs, and mechanical files never touch US/EU servers—critical for defense industrial base
- **Audit-Ready**: Defense auditors open `.tencil` file, traverse all domain links with full history—"When did this GPIO assignment change and who authorized it?"

---

### 5. The Pan-African Open Hardware University Network

**Scenario**: Engineering schools in 6 African countries collaboratively designing educational robotics kits.

**The Workflow**:
```
1. Base design: Tencil-linked robot (KiCad PCB + Penpot control UI + Blender chassis)
2. Hosted: robotics-lab.kolanode.africa (federated across universities)
3. Each country adapts:
   • Kenya: Adds solar charging (EE modification → UI battery indicator updates via Tencil)
   • Nigeria: Ruggedized chassis for dusty conditions (Blender → KiCad keepout check)
   • Egypt: Arabic UI localization (Penpot text → KiCad silkscreen label consistency)
4. All versions remain linked to original, with attribution
```

**The Unlock**:
- **Cross-Institutional Validation**: "Cairo's modification to the motor driver—does it break Kampala's UI animations? Tencil diff across the federation says yes, current draw exceeds USB spec."
- **Sovereign Education**: African universities own their engineering curriculum IP, not locked into GitHub's US-centric platform
- **Manufacturing Locality**: Each linked design exports to local PCB fab houses (Kenya, Nigeria, Egypt) with Tencil-generated assembly instructions

---

### 6. The Ethiopian Health Logistics Drone

**Scenario**: Addis Ababa startup building cold-chain drones for vaccine delivery to rural clinics.

**The Workflow**:
```
1. Drone avionics: KiCad (flight controller, temperature sensors, GPS)
2. Clinic inventory UI: Penpot (vaccine tracking, temperature alerts, landing notifications)
3. Payload thermal design: Blender (insulated box, cooling system, drone mounting)
4. Tencil links:
   • Temperature sensor placement ↔ UI cold-chain compliance display
   • GPS accuracy spec ↔ UI "estimated arrival" confidence interval
   • Thermal battery drain ↔ Flight time calculations
```

**The Unlock**:
- **Regulatory Submission**: Tencil generates WHO prequalification documentation automatically—"Temperature sensor accuracy at altitude linked to UI alert thresholds linked to thermal modeling"
- **Sovereign Health Data**: Vaccine cold chain data (transport temperature profiles) stored on African servers, compliant with African Union data governance
- **Field Adaptation**: Local engineers use Tencil Studio to modify payload for different vaccines (mRNA vs. traditional cold chain), links ensure avionics and UI stay synchronized

---

### 7. The Moroccan Automotive Sensor

**Scenario**: Casablanca supplier building tire pressure sensors for pan-African vehicle assembly.

**The Workflow**:
```
1. Sensor PCB: KiCad (pressure transducer, RF transmitter, battery)
2. Dashboard UI: Penpot (TPMS warning light, pressure display, battery status)
3. Wheel assembly: Blender (sensor mounting, valve integration, balance)
4. Manufacturing test: Tencil-linked test fixture design
```

**The Unlock**:
- **OEM Integration**: European car manufacturer receives `.tencil` file, validates that Moroccan sensor UI warnings match their dashboard design system—cross-domain consistency check
- **Supply Chain Transparency**: Assembly plant in Morocco uses Tencil-generated work instructions—"Connect sensor wire (EE) to valve stem (3D) with torque spec (link metadata)"
- **Regulatory Arbitrage**: Design validated for EU (ECE) and African (ACS) standards simultaneously via Tencil's multi-standard compliance linking

---

### The Meta-Pattern

Each use case shares:

| Element | KolaNode Provides | Tencil Enables |
|---------|------------------|----------------|
| **Data** | Sovereign hosting, African jurisdiction | Cross-domain linking, AI-readable structure |
| **Collaboration** | Federated African nodes, local identity | Universal translation, tool interoperability |
| **AI Integration** | MCP access to sovereign repos | Structured data for agent reasoning |
| **Compliance** | Data residency, audit trails | Traceability across engineering domains |
| **Manufacturing** | Local fab house integration | Automated test fixture/work instruction generation |

**The impossible-without-both scenario**: An AI agent designing a medical device, hosted in Africa, compliant with African data laws, with full traceability from circuit to user interface—**without touching a single US-controlled server or proprietary format**.