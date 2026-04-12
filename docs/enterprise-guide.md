# Tencil Enterprise Guide

**Status:** Strategic reference for high-value B2B sales  
**Last Updated:** Post-business model planning  
**Purpose:** Define the Enterprise tier, customer personas, and realistic implementation path

---

## Overview

Tencil Enterprise is not just "Cloud with more features." It is a **service business wrapped in software** targeting regulated industries (medical, aerospace, defense) with specific compliance needs.

**Core insight:** Enterprise customers pay for **risk mitigation and documentation**, not features. They need paper trails, signatures, and someone to blame if things go wrong.

---

## The Customer Personas

### Persona 1: The Compliance Officer (Medical Device)

**Profile:**
- **Name:** Sarah, Director of Quality at 200-person medtech startup
- **Context:** FDA audit in 6 months, traceability matrix is 400 Excel sheets
- **Last audit:** Took 3 weeks to prepare, found gaps, delayed launch

**Pain:**
- Manual traceability between UI screens and hardware specs
- No audit trail for design decisions
- Scattered tools = scattered documentation

**Fear:**
- FDA 483 observation = $50K fine + 6-month delay
- Competitor beats them to market
- Personal liability if device harms patient

**Budget:** Significant annual budget for compliance tooling  
**Buying trigger:** FDA pre-submission meeting scheduled  
**Decision maker:** VP of Regulatory + CEO (for $50K+ purchases)

### Persona 2: The Engineering VP (Aerospace)

**Profile:**
- **Name:** Mike, VP Engineering at satellite component supplier
- **Context:** DO-178C requires every code change traceable to requirements
- **Current state:** 6 different tools, traceability is manual

**Pain:**
- Engineers spend 20% of time on documentation, not design
- Last minute scramble before certification audits
- Can't prove "we thought of that" to regulators

**Fear:**
- Failed audit = can't ship = significant contract loss
- Career damage if program fails
- Government blacklisting

**Budget:** Enterprise budget for qualified/certified tooling  
**Buying trigger:** New program start, RFP for toolchain  
**Decision maker:** CTO + Program Manager + Contracts (for defense)

### Persona 3: The IT Security Director (Defense)

**Profile:**
- **Name:** Chen, CISO at defense contractor
- **Context:** Cloud tools banned, air-gapped networks only
- **Current state:** Engineers email files home to work (security violation)

**Pain:**
- No modern design tools work without internet
- Productivity loss from offline workflows
- Can't hire young engineers (expect modern tools)

**Fear:**
- Data spillage = security clearance revoked
- Can't bid on classified contracts
- Audit finding = contract termination

**Budget:** Enterprise budget for on-premise, compliant solutions  
**Buying trigger:** CMMC audit failure or new classified contract  
**Decision maker:** CISO + Security Officer + Contracts

---

## What Enterprise Actually Includes

### 1. Validated Adapters (The "Qualified" Promise)

**The Problem:**
Medical device software (IEC 62304) and aerospace (DO-178C) require "qualified tools." If your design tool has a bug that causes device failure, you're liable.

**What Enterprise Provides:**

| Aspect | Cloud | Enterprise |
|--------|-------|------------|
| Adapter testing | Community tested | Pre-validated on 1,000+ real projects |
| Bug response | Best effort | 24-hour fix + significant bounty |
| Insurance | None | Errors & Omissions coverage |
| Documentation | README | Full validation report |

**The Validation Document Package:**
```
VALIDATION-REPORT-KICAD-ADAPTER-v2.3.1.pdf (50 pages)
├── Executive Summary
│   └── "Adapter correctly transforms 99.97% of KiCad 7.0 symbols"
├── Test Suite (1,247 test cases)
│   ├── Unit tests: 500
│   ├── Integration tests: 600
│   └── Edge cases: 147
├── Coverage Analysis
│   └── 100% of public KiCad symbol library
├── Known Limitations
│   └── 3 edge cases documented with workarounds
├── Traceability Matrix
│   └── Each test linked to IEC 62304 requirement
└── Independent Auditor Sign-off
    └── TÜV SÜD certification stamp
```

**Reality Check:** Full validation requires:
- Year 1-2: "Customer-validated" (testimonials, case studies)
- Year 2+: "Independent audit" (paid assessment)
- Year 3+: Full IEC certification (if market demands)

### 2. Audit Trails (Complete Chain of Custody)

**Standard Cloud:** "User X modified file Y at time Z"

**Enterprise Audit Entry:**
```json
{
  "timestamp": "2024-03-15T09:23:14.000Z",
  "user": {
    "id": "user-123",
    "email": "jane.doe@acme.com",
    "eidas_signature": "qualified-electronic-signature-cert"
  },
  "action": "link.modified",
  "resource": {
    "type": "tencil_link",
    "id": "link-456",
    "file_id": "file-789"
  },
  "changes": {
    "field": "ee_node_id",
    "previous": "GPIO_4",
    "new": "GPIO_5"
  },
  "context": {
    "session_ip": "10.0.0.15",
    "user_agent": "TencilStudio/2.1.0",
    "project_id": "proj-med-device-001"
  },
  "compliance": {
    "linked_requirement": "SRS-4.2.1",
    "linked_risk": "R-0042",
    "reviewed_by": "john.smith@acme.com",
    "approved_by": "sarah.jones@acme.com",
    "rationale": "Clinical study showed 38°C reduces false alarms by 12%"
  },
  "integrity": {
    "hash": "sha256:a1b2c3...",
    "previous_hash": "sha256:d4e5f6...",
    "chain_verified": true
  }
}
```

**Export Formats:**
- FDA 21 CFR Part 11 (XML, 21CFR11 schema)
- ISO 13485 Technical File section (PDF)
- DO-178C Software Lifecycle Data (DOORS-compatible CSV)
- EU MDR Technical Documentation (eCTD format)

**Retention:** 7 years minimum (FDA requirement), 25 years for implantable devices

### 3. On-Premise Deployment (Air-Gapped Option)

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│  Customer Data Center (Air-gapped, No Internet)            │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Tencil          │  │ PostgreSQL      │  │ MinIO        │ │
│  │ Enterprise      │  │ (Primary +      │  │ (S3-compatible│ │
│  │ Server          │  │  Replica)       │  │  object      │ │
│  │                 │  │                 │  │  storage)    │ │
│  │ ├─ API Server   │  │ ├─ Users        │  │              │ │
│  │ ├─ Web UI       │  │ ├─ Projects     │  │ ├─ Files     │ │
│  │ ├─ Sync Workers │  │ ├─ Audit Log    │  │ ├─ Versions  │ │
│  │ └─ HSM Module   │  │ ├─ Links        │  │ └─ Backups   │ │
│  │    (signatures) │  │ ├─ 7-year       │  │              │ │
│  │                 │  │    history      │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                              │
│  LDAP / Active Directory (SSO)                              │
│  Hardware Security Module (HSM) for e-signatures            │
│  Backup to tape (weekly, offsite vault)                     │
└─────────────────────────────────────────────────────────────┘
```

**Deployment Options:**

| Option | Setup Time | Price | Best For |
|--------|-----------|-------|----------|
| **Docker Compose** | 2 hours | Included | Single server, <50 users |
| **Kubernetes** | 2 days | +$5K setup | Scale, high availability |
| **Managed by Tencil** | 1 week | +$2K/month | No IT team, need SLA |
| **Air-gapped USB** | 1 day | +$3K | Classified networks |

**What's Included:**
- Docker Compose file or Helm charts
- Installation guide (20-page PDF)
- 2-hour video call setup assistance
- Offline documentation (no internet required)
- Emergency support hotline

### 4. SLA Guarantees (Contractual Commitments)

**Standard Cloud:** "Best effort" support via GitHub issues

**Enterprise SLA:**

| Severity | Definition | Response | Resolution Target | Financial Credit |
|----------|-----------|----------|-------------------|------------------|
| **P0** | System down, no workaround | 15 minutes | 4 hours | Significant credit |
| **P1** | Major feature broken, workaround exists | 1 hour | 24 hours | Moderate credit |
| **P2** | Minor degradation | 4 hours | 72 hours | Minor credit |
| **P3** | Questions, feature requests | 1 business day | N/A | None |

**Uptime Guarantee:**
- **Standard:** 99.9% (43.8 minutes downtime/month)
- **Enterprise:** 99.99% (4.38 minutes downtime/month)
- **Premium:** 99.999% (26 seconds downtime/month) — requires HA setup

**Support Channels:**
- Dedicated Slack channel (not shared support)
- Named support engineer (knows their setup)
- Phone hotline (business hours + emergency)
- Quarterly business reviews

### 5. Custom Development

**Not everything fits the standard adapters.**

**Example Projects:**

| Customer | Need | Solution | Timeline | Price |
|----------|------|----------|----------|-------|
| Medtronic | Altium → Tencil adapter | Custom ETL pipeline | 6 weeks | Custom pricing |
| Boeing | Internal PLM integration | API bridge + bidirectional sync | 8 weeks | Custom pricing |
| Startup X | FDA validation package | Full IEC 62304 documentation | 4 weeks | Custom pricing |
| Hospital Y | HL7 FHIR → Tencil (Medical domain) | Healthcare adapter + HIPAA compliance | 6 weeks | Custom pricing |

**Process:**
1. **Discovery call** (1 hour) — Understand workflow, constraints
2. **Technical assessment** (2 weeks) — Feasibility, architecture, risks
3. **Fixed-price proposal** — Scope, timeline, payment terms
4. **50% upfront** — Non-refundable, covers initial work
5. **Development** — Weekly demos, customer feedback
6. **50% on delivery** — Final payment, 90-day warranty begins
7. **Warranty period** — Bug fixes included, enhancements billed

---

## Enterprise vs. Cloud: The Real Differences

| Aspect | Cloud ($15/user) | Enterprise (Custom pricing) |
|--------|------------------|-------------------------|
| **Infrastructure** | Our servers (Railway/R2) | Their servers (your data center) |
| **Management** | Fully managed by Tencil | Self-managed OR Tencil-managed (+fee) |
| **Compliance** | SOC 2 Type II (we have it) | FDA 21 CFR Part 11, DO-178C, CMMC (you need it) |
| **Audit trails** | 30 days | 7-25 years (regulatory requirement) |
| **Electronic signatures** | Basic email verification | eIDAS-qualified, FDA-compliant signatures |
| **Adapters** | Community + Core validated | Pre-validated + Custom development |
| **Support** | GitHub issues + community Slack | Dedicated Slack + phone + on-site visits |
| **Source code** | Closed binary | Escrow agreement (you get it if we die) |
| **Uptime SLA** | 99.9% (43 min/month downtime) | 99.99% (5 min/month downtime) |
| **Response time** | Best effort | Contractual (15 min for P0) |
| **Integration** | Webhooks | LDAP/AD, custom APIs, air-gapped |

---

## The Sales Motion

### Cloud (Self-Serve):
1. User finds Tencil via search/community
2. `npm install -g tencil` → tries free CLI
3. Hits sync limitation, signs up for Cloud
4. Credit card, immediate access
5. Time to value: 10 minutes

### Enterprise (3-6 Month Cycle):

**Month 1: Discovery**
- Initial call (compliance officer finds you)
- Technical demo (show on-premise option)
- Security questionnaire (they send 100 questions)
- Pilot proposal (free 30-day on-premise trial)

**Month 2: Pilot**
- Deploy on their test server
- Custom adapter scoping (they need Altium → Tencil)
- Feedback loop (3-5 iterations)
- Success metrics ("saved 10 hours/week on documentation")

**Month 3: Procurement**
- Formal proposal (custom pricing)
- Legal review (their lawyers redline everything)
- Security audit (they pen-test your software)
- Purchase order (finally!)

**Month 4: Deployment**
- Production installation
- Team training (2 sessions, 4 hours each)
- Go-live support (1 week on-site or remote)
- First audit export test (they verify it works)

**Month 5+: Expansion**
- Quarterly business reviews
- Usage analysis ("you're using 60% of licenses, want to add more?")
- Custom project #2 (they trust you now)
- Renewal (90% if you delivered)

### Who Sells:

| Stage | Who | When |
|-------|-----|------|
| First 5 customers | You (founder) | Year 1 |
| Sales engineer | Hire #1 | 3+ Enterprise customers |
| Account executive | Hire #2 | 10+ Enterprise customers |
| Customer success | Hire #3 | 20+ customers, churn risk |

---

## Realistic Implementation Path

### Phase 0: Bootstrap Enterprise (Year 1, You Alone)

**Don't build:** Full IEC validation, TÜV audits, 2,000 test cases

**Do build:**
- Docker Compose on-premise installer (2 days)
- Basic audit CSV export (1 day)
- Source code escrow agreement (lawyer-drafted)
- Custom adapter capability (you already know the code)
- Your personal phone number for support

**Target:** Small medical startups (5-20 people) who can't afford custom pricing but need on-premise
**Price:** Custom pricing (contact sales)
**Value prop:** "We'll run on your servers and answer the phone"

### Phase 1: First Real Enterprise (Year 1-2)

**Trigger:** Cloud customer asks "can you do on-premise?"

**Your response:** "Yes, but it's custom. Custom pricing + $10K setup + 4-week timeline."

**What you deliver:**
- Docker Compose file
- PostgreSQL audit table + CSV export
- 20-page installation README
- Custom adapter for their specific need
- Escrow agreement (GitHub archive + lawyer letter)

**What you DON'T deliver:**
- FDA validation package
- Independent auditor
- $10M insurance
- 99.999% SLA

### Phase 2: Validation Funded by Revenue (Year 2)

**After:** 3-5 Enterprise customers at custom pricing

**Revenue:** Sustainable recurring revenue from early enterprise contracts

**Investment:**
- Hire 1 contractor ($5K/month) to build test infrastructure
- Buy: Test fixtures, reference schematics (public domain medical devices)
- Build: GitHub Actions test suite with 100+ medical device examples
- Create: "Customer validation" documentation (testimonials, case studies)

**Now you can say:** "We've validated this on 50+ real medical device projects with zero FDA observations."

### Phase 3: Real Certification (Year 2-3)

**When you have:**
- 10+ Enterprise customers
- $100K+ Enterprise ARR
- Case studies with named customers (if they allow)

**Then invest:**
- Regulatory consultant: $20K to guide IEC 62304 compliance
- Independent auditor (TÜV SÜD, SGS): $15K for assessment
- Validation suite: 1,000+ test cases, traceability matrices
- Insurance: Errors & Omissions policy (custom pricing)

**Price increase:** Custom pricing (justified by certification)

---

## The Shortcut: Partner Validation

You don't need a $500K testing lab. You need:

### 1. Customer Validation (Free)
```
Testimonial: "We used Tencil to document 12 Class II medical devices.
FDA pre-submission meeting passed with zero observations.
Saved 200 hours on traceability documentation."
— Jane Doe, VP Regulatory, MedStart Inc.
```

### 2. Open Source Test Suite (Community)
```
GitHub: tencil/tencil-medical-test-suite
├── 100 KiCad schematics (public domain medical devices)
├── Expected Tencil output for each
├── GitHub Actions: Run conversion, validate schema
└── Community-maintained (free labor)

Not "FDA-validated" but "community-validated with 100+ real devices."
```

### 3. Regulatory Consultant (Not Auditor) — $5K
- 2-hour consultation
- Review your current docs
- Tell you exactly what's missing for IEC 62304
- You fix it incrementally over 6 months
- Way cheaper than $20K full audit

### 4. Insurance as Validation Proxy — Custom pricing
- Obtain appropriate E&O coverage for enterprise liability
- Underwriter reviews your code, processes, documentation
- Their assessment = external validation
- You get insurance + credibility

---

## What You Actually Build (Minimum Viable Enterprise)

### Week 1: On-Premise Installer
```bash
# Single-command deployment script
curl -fsSL https://tencil.dev/install-enterprise.sh | bash

# Creates:
# - Docker Compose with PostgreSQL + MinIO + Tencil API
# - Environment configuration
# - SSL certificate (Let's Encrypt or self-signed)
# - Initial admin user
```

### Week 2: Audit Trail Export
```typescript
// CLI command for compliance teams
tencil audit export \
  --project my-medical-device \
  --format fda \
  --start-date 2024-01-01 \
  --end-date 2024-12-31 \
  --output audit-package.zip

// Generates:
// - audit-log.csv (all changes with signatures)
// - file-versions/ (all historical .tencil files)
// - link-history/ (cross-domain relationship changes)
// - compliance-report.pdf (summary for FDA)
```

### Week 3: Source Escrow
```markdown
# ESCROW AGREEMENT

If Tencil Inc. ceases operations:

1. **Source Code**
   - All repositories become public on GitHub (core already open source)
   - Enterprise customers receive: complete source + deployment docs
   - 30-day transition support via email

2. **Data Export**
   - Customers can export all data in standard formats
   - No lock-in, no hostage data

3. **Continued Operation**
   - Customers can self-host indefinitely
   - Community can fork and maintain

Signed: [Tencil Inc. CEO] [Customer]
Date: [Date]
```

### Week 4: Custom Adapter Template
```typescript
// SDK for customer-specific adapters
export function createCustomAdapter(config: AdapterConfig) {
  return {
    import: async (sourceFile: Buffer) => {
      // Customer-specific parsing logic
      return convertToTencil(sourceFile, config.mappings);
    },
    export: async (tencilDoc: TencilDocument) => {
      // Customer-specific generation logic
      return convertFromTencil(tencilDoc, config.mappings);
    },
    validate: (doc: TencilDocument) => {
      // Customer-specific validation rules
      return runCustomValidations(doc, config.rules);
    }
  };
}
```

**Total investment:** 4 weeks of development time.  
**First Enterprise price:** Custom pricing (contact sales).  
**You now have:** An "Enterprise" tier that solves real problems.

---

## The Paradox of Enterprise

**Enterprise is less profitable than it looks:**
- Revenue: Significant annual contract, higher touch support costs (dedicated engineer, custom dev, on-site visits)
- **Margin: 40%** (vs. 85% for Cloud)

**But Enterprise provides:**
- **Case studies** ("Medtronic uses Tencil")
- **Referrals** (defense contractors talk to each other)
- **R&D funding** (custom projects become standard features)
- **Market credibility** ("if Boeing trusts them...")

**Strategy:** Use Enterprise to fund the validation that benefits Cloud users.

---

## Key Decisions Summary

| Decision | Recommendation |
|----------|----------------|
| **Start with validation?** | No. Start with on-premise + audit logs. |
| **First Enterprise price** | Custom pricing (contact sales) (small medtech startups) |
| **When to raise prices** | After 3+ customers, with testimonials |
| **When to get certified** | Year 2+, when revenue funds it |
| **Sales motion** | You sell first 5, then hire sales engineer |
| **Custom dev** | Yes, 50% upfront, 50% on delivery |

---

## Resources

**Regulatory Consultants:**
- FDA: RAPS (Regulatory Affairs Professionals Society) directory
- EU MDR: notified bodies list (TÜV SÜD, SGS, BSI)
- DO-178C: aviation consultants (DERs - Designated Engineering Representatives)

**Insurance:**
- Tech E&O: Hiscox, Coalition, or broker like Founder Shield
- Typical cost: $25K/year for $10M coverage (at $100K revenue)

**Source Escrow:**
- IronMountain (traditional, expensive)
- GitHub Archive Program (free, limited)
- Lawyer-drafted agreement + GitHub repo (cheap, effective)

---

## The Honest Truth

You don't need:
- A testing lab
- 2,000 test runs
- Independent auditors
- FDA certification
- $10M insurance (initially)

You need:
- A medical startup willing to pay $8K for on-premise
- Basic audit logging (PostgreSQL table)
- Willingness to sign an escrow agreement
- Your commitment to answer the phone at 2 AM if their audit is tomorrow

**Build Cloud first.** When someone asks for Enterprise, say yes, charge appropriately, and learn what they actually need. The validation comes from customer money, not your savings.

---

*Document Status: Strategic guide for founder-led Enterprise sales*  
*Next review: After first Enterprise customer inquiry*
