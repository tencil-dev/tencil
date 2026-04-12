# Tencil Business Model

**Status:** Draft for planning and investor discussions  
**Last Updated:** Phase 1 planning  
**Model:** Open Core (Sustainable Openness)

---

## Philosophy

Tencil bridges the gap between disconnected design tools. We believe:

1. **Protocols must be open** — The `.tencil` format and core adapters are public goods
2. **Sustainability requires revenue** — Donations don't fund full-time development
3. **Value alignment matters** — Revenue comes from services that enhance, not restrict, the core tools

We are not "open source washing." The core remains free forever. Paid services are genuinely additive.

---

## The Open Core Model

```
┌─────────────────────────────────────────────────────────────┐
│                    FREE (Apache 2.0)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Schema    │  │   Adapters  │  │    CLI   │  │  Viewer  │   │
│  │  ( forever  │  │  (community │  │  (free)  │  │  (free)  │   │
│  │    free )   │  │   + core)   │  │          │  │(read-only│   │
│  └─────────────┘  └─────────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 PAID (Proprietary/Commercial)               │
│  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │   Tencil Cloud   │  │     Tencil Enterprise           │  │
│  │  (SaaS, $10-50)  │  │  (License + Support, $5000+)    │  │
│  │                  │  │                                 │  │
│  │  • Hosted sync   │  │  • Audit trails                 │  │
│  │  • Real-time collab  │  • SLA guarantees             │  │
│  │  • Team workspaces   │  • On-premise deployment      │  │
│  │  • Backup/restore    │  • Custom integrations        │  │
│  │  • Access control    │                                 │  │
│  └──────────────────┘  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │   Tencil Studio                                         │  │
│  │  ($5-15/user or Enterprise bundle)                      │  │
│  │                                                         │  │
│  │  • Cross-domain link editing                            │  │
│  │  • Simulation & what-if analysis                        │  │
│  │  • Auto-documentation generation                        │  │
│  │  • Real-time multi-user collaboration                   │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Viewer vs. Studio: The Distinction

| Aspect | **Viewer** (Free) | **Studio** (Paid) |
|--------|-------------------|-------------------|
| **Purpose** | Inspect existing designs | Actively design cross-domain relationships |
| **View single domain** | ✓ | ✓ |
| **View multiple domains** | ✓ | ✓ |
| **View existing links** | ✓ | ✓ |
| **Create/edit links** | ✗ | ✓ Drag UI button → PCB pin |
| **Simulate interactions** | ✗ | ✓ "What happens when I press this?" |
| **What-if analysis** | ✗ | ✓ "If I move this LED, what UI screens change?" |
| **Generate documentation** | ✗ | ✓ Auto-create manuals, test procedures |
| **Real-time collaboration** | ✗ | ✓ Two engineers editing simultaneously |
| **Export compliance reports** | ✗ | ✓ FDA-ready documentation |

**Analogy:**
- **Viewer** = GitHub file browser (read, inspect)
- **Studio** = GitHub editor + Actions + Copilot (edit, automate, collaborate)

---

## Revenue Streams

### 1. Tencil Cloud (SaaS)

**Target:** Design teams, hardware startups, agencies  
**Price:** $10-50/user/month  
**Value Proposition:**

| Feature | Free (CLI) | Cloud (Paid) |
|---------|-----------|--------------|
| Export/import | Manual, file-based | One-click, automatic |
| Sync | Manual (`tencil sync`) | Real-time, continuous |
| Collaboration | Git-based | Live multi-user |
| Backup | Self-managed | Automatic, versioned |
| History | Local files only | Full timeline, rollback |
| Sharing | Email files | Share links, permissions |
| Integrations | DIY | Slack, Notion, Linear |

**Tiers:**

| Plan | Price | Users | Includes |
|------|-------|-------|----------|
| **Starter** | Free | 1 | Basic sync, 30-day history |
| **Team** | $15/user/mo | 2-20 | Unlimited history, Slack, API |
| **Business** | $35/user/mo | 21-100 | SSO, audit logs, priority support |
| **Enterprise** | Custom | 100+ | SLA, custom contracts, training |

### 2. Tencil Enterprise (Licensed Software)

**Target:** Medical device companies, aerospace, automotive, defense  
**Price:** $5,000-$50,000/year  
**Why They Pay:**

- **Regulatory compliance** — FDA 21 CFR Part 11, ISO 13485, DO-178C
- **Audit trails** — Who changed what, when, with electronic signatures
- **On-premise deployment** — Air-gapped networks, no cloud dependency
- **Validated adapters** — Pre-certified KiCad → IEC 62304 medical software
- **SLA guarantees** — 99.99% uptime, 1-hour response time
- **Custom development** — Private adapters for proprietary EDA tools

**Deliverables:**
- Source code escrow (if we shut down, they keep it)
- Compliance documentation package
- Annual security audits
- Dedicated support engineer

### 3. Tencil Studio (Cross-Domain Design Tool)

**Target:** System architects, integration engineers, technical leads  
**Price:** $5-15/user/month (standalone) or bundled with Enterprise  
**Why They Pay:**

**The Problem:** Designing relationships across domains (UI → EE → 3D) currently requires:
- Integration meetings ($500/meeting × 2/week = $52,000/year)
- Manual documentation (40 hrs × $150/hr = $6,000/project)
- Rework when physical and digital don't align ($10,000-50,000 per error)

**The Solution:**

| Feature | Free (Viewer) | Studio (Paid) |
|---------|---------------|---------------|
| Cross-domain link editing | View only | ✓ Drag-and-drop connections |
| Simulation | ✗ | ✓ "Press button → see signal flow" |
| What-if analysis | ✗ | ✓ "Move LED → see affected UI screens" |
| Auto-documentation | ✗ | ✓ Generate user manuals, test procedures |
| Real-time collaboration | ✗ | ✓ Two engineers editing simultaneously |
| Compliance exports | ✗ | ✓ FDA-ready traceability reports |

**ROI:**
- **Without Studio:** Integration engineer salary = $120,000/year
- **With Studio:** $180/year per user (10 users = $1,800)
- **Payback:** Avoid one design error or one month of integration meetings

**Use Cases:**
1. **Hardware startup:** Validating smart thermostat — UI button placement aligns with PCB LED location aligns with 3D button cutout
2. **Medical device:** Creating traceability matrix for FDA — every UI threshold linked to sensor spec, every alarm linked to risk analysis
3. **Agency:** Client review showing complete product — schematic + app + 3D render in one view

### 4. Professional Services

**Target:** Companies adopting Tencil at scale  
**Price:** $200-300/hour or fixed-project

| Service | Description |
|---------|-------------|
| **Implementation** | Setup, migration, team training |
| **Custom adapters** | Private tool integrations |
| **Workflow design** | Optimizing design → code pipelines |
| **Compliance consulting** | FDA, CE, ISO documentation |

**Example Projects:**
- $15,000: Migrate 3 products from legacy workflow to Tencil
- $25,000: Custom adapter for proprietary medical device toolchain
- $50,000: Full FDA validation package for Tencil in Class II device workflow

### 5. Marketplace (Phase 2+)

**Target:** Third-party developers, tool vendors  
**Model:** Revenue share (70% creator / 30% Tencil)

| Offering | Example |
|----------|---------|
| **Premium adapters** | Altium → Tencil, SolidWorks → Tencil |
| **Templates** | Medical device starter kit, IoT hardware template |
| **Plugins** | Figma auto-layout, KiCad BOM integration |

---

## Customer Segments

### Primary: Hardware Startups (B2B)

**Profile:** 5-50 employees, $1M-10M funding, building IoT/medical/consumer hardware  
**Pain:** Design files scattered across Figma, KiCad, Excel. No single source of truth.  
**Budget:** $100-500/month for tools  
**Entry:** Free CLI → Team Cloud plan  
**LTV:** $1,800-6,000 over 3 years

### Secondary: Design Agencies (B2B)

**Profile:** 10-100 designers, multiple hardware clients  
**Pain:** Different clients use different tools. Constant format conversion.  
**Budget:** $500-2,000/month  
**Entry:** Team/Business Cloud  
**LTV:** $5,000-20,000 over 2 years

### Tertiary: Enterprise Medical/Aerospace (B2B)

**Profile:** Medtronic, Boston Scientific, Lockheed, Boeing  
**Pain:** Compliance documentation takes months. Audits are painful.  
**Budget:** $50,000-500,000/year  
**Entry:** Enterprise sales, pilots  
**LTV:** $150,000+ over 5 years

### Quaternary: Individual Developers/Makers (B2C)

**Profile:** Solo hardware hackers, indie makers  
**Pain:** Tool fragmentation, but low budget  
**Budget:** $0-20/month  
**Entry:** Forever-free CLI  
**Monetization:** GitHub Sponsors, swag, community goodwill (not revenue)

---

## Unit Economics (Projected)

### Tencil Cloud (Year 3)

| Metric | Value |
|--------|-------|
| ARPU (Average Revenue Per User) | $25/month |
| Gross Margin | 75% |
| CAC (Customer Acquisition Cost) | $100 |
| LTV (Lifetime Value) | $900 (3-year retention) |
| LTV:CAC Ratio | 9:1 (healthy) |

### Tencil Enterprise (Year 3)

| Metric | Value |
|--------|-------|
| Average Deal Size | $25,000/year |
| Sales Cycle | 3-6 months |
| CAC | $5,000 (sales + pilot) |
| LTV | $125,000 (5-year retention) |
| LTV:CAC Ratio | 25:1 (excellent) |

---

## Go-to-Market Strategy

### Phase 1 (Months 1-6): Foundation

- **Focus:** Build CLI, prove UI→Pencil workflow
- **Audience:** Early adopters, Penpot community, AI tooling enthusiasts
- **Channel:** GitHub, Twitter/X, Hacker News, Figma community forums
- **Revenue:** $0 (establish credibility)
- **Goal:** 1,000 GitHub stars, 100 active CLI users

### Phase 2 (Months 6-12): Product-Market Fit

- **Focus:** Launch Cloud beta, add EE adapters (KiCad)
- **Audience:** Hardware startups, individual designers
- **Channel:** Content marketing ("Bridging design and engineering"), YouTube tutorials
- **Revenue:** $2,000-5,000 MRR (Monthly Recurring Revenue)
- **Goal:** 50 paying Cloud teams, first Enterprise pilot

### Phase 3 (Year 2): Scale

- **Focus:** Add medical compliance, enterprise sales
- **Audience:** Medical device startups, mid-size hardware companies
- **Channel:** Trade shows (MD&M West, Electronica), webinars, case studies
- **Revenue:** $20,000-50,000 MRR
- **Goal:** 500 Cloud users, 5 Enterprise customers

### Phase 4 (Year 3+): Platform

- **Focus:** Marketplace, API ecosystem, strategic partnerships
- **Audience:** Tool vendors, integrators, enterprises
- **Channel:** Partner programs, developer conferences
- **Revenue:** $100,000+ MRR
- **Goal:** Default infrastructure for hardware design workflows

---

## Competitive Positioning

### Direct Competitors

| Competitor | Their Model | Our Differentiation |
|------------|-------------|---------------------|
| **Figma** | Closed SaaS, subscription | Open protocol, multi-domain (not just UI) |
| **Figma-to-Code plugins** | One-off purchases, limited | Comprehensive, extensible, open source |
| **Altium 365** | Closed, expensive ($5,000+/seat) | Open core, affordable, cross-tool |
| **Git-based workflows** | DIY, manual | Automated, purpose-built, friendly |

### Indirect Competitors

| Alternative | Weakness | Our Strength |
|-------------|----------|--------------|
| **Manual file export/import** | Error-prone, slow, no history | Automated, versioned, auditable |
| **Custom scripts** | Brittle, unmaintained | Community-maintained, documented |
| **Hiring integration engineers** | Expensive ($150K+/year) | Off-the-shelf, fraction of cost |

---

## Key Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Penpot/Pencil change APIs** | Medium | High | Community adapters reduce dependency on single maintainer |
| **Major tool builds competing feature** | Medium | Medium | Focus on multi-domain (their differentiators are single-domain) |
| **Enterprise sales cycle too long** | High | Medium | Balance with high-velocity Cloud revenue |
| **Open source forks competing** | Low | Low | Network effects (Cloud features, validated adapters) hard to replicate |
| **Regulatory changes** | Low | High | Compliance is our Enterprise moat |

---

## Financial Projections (Conservative)

### Year 1

| | Q1 | Q2 | Q3 | Q4 |
|--|----|----|----|----|
| Cloud MRR | $0 | $0 | $500 | $2,000 |
| Enterprise | $0 | $0 | $0 | $0 |
| Services | $0 | $5,000 | $10,000 | $15,000 |
| **Total Revenue** | $0 | $5,000 | $10,500 | $23,000 |

### Year 2

| | Q1 | Q2 | Q3 | Q4 |
|--|----|----|----|----|
| Cloud MRR | $3,000 | $6,000 | $10,000 | $15,000 |
| Enterprise | $0 | $25,000 | $50,000 | $75,000 |
| Services | $20,000 | $25,000 | $30,000 | $35,000 |
| **Total Revenue** | $29,000 | $79,000 | $120,000 | $215,000 |
| **ARR Run Rate** | $116K | $316K | $480K | $860K |

### Year 3

| Metric | Target |
|--------|--------|
| Cloud ARR | $500,000 |
| Enterprise ARR | $300,000 |
| Services | $200,000 |
| **Total ARR** | **$1,000,000** |
| Team Size | 3-5 FTE |
| Funding | Seed round ($500K-1M) or bootstrapped |

---

## Investment Thesis

**Why this works:**

1. **Clear path to revenue** — SaaS + Enterprise proven model (see: Vercel, Postman, Docker)
2. **Defensible moat** — Network effects as more tools adopt `.tencil` format
3. **Mission alignment** — Open core builds trust faster than closed-source competitors
4. **Market timing** — Hardware + AI convergence creates demand for design-to-code bridges

**Use of Funds (if raising):**

| Category | % | Purpose |
|----------|---|---------|
| Engineering | 60% | Core development, adapters, compliance |
| Sales/Marketing | 25% | Enterprise sales, content, community |
| Operations | 10% | Cloud infrastructure, support, legal |
| Reserve | 5% | Unexpected opportunities/crises |

---

## Exit Opportunities

**Most Likely:**
- **Acquisition by design tool** (Figma, Adobe, Autodesk) wanting multi-domain bridge
- **Acquisition by hardware platform** (Onshape, Altium) wanting open ecosystem
- **Strategic investment** from tool vendors (Penpot, KiCad) wanting alignment

**Requirements for acquisition interest:**
- 10,000+ active users
- $1M+ ARR
- `.tencil` format widely adopted
- Enterprise customer base

**IPO:** Unlikely before $50M ARR. Not a focus.

---

## Summary

| Element | Decision |
|---------|----------|
| **Core License** | Apache 2.0 (free forever) |
| **Revenue Model** | Open Core: Cloud + Studio + Enterprise |
| **Volume Revenue** | Tencil Cloud ($10-50/user/month) |
| **Cross-Domain Revenue** | Tencil Studio ($5-15/user/month) |
| **High-Value Revenue** | Tencil Enterprise ($5K-50K/year) |
| **Target Customers** | Startups (Cloud), Architects (Studio), Medical (Enterprise) |
| **Year 3 Goal** | $1M ARR, 3-5 person team, default infrastructure |

This model sustains full-time development without compromising the open source mission.

---

*Document Status: Draft for discussion. Numbers are projections, not guarantees.*
