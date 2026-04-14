**No mistake—keep `tencil-dev` for personal.** But for the project, create an **organization** account.

Here's the distinction:

| Account Type | Handle | Use For |
|-------------|--------|---------|
| **Personal** | `tencil-dev` | Your profile, forks, personal repos |
| **Organization** | `tencil` or `tencildev` | The Tencil project repos |

**Why an org account:**
- Multiple admins (you + future maintainers)
- Repos live at `github.com/tencil/tencil-cli` not `github.com/tencil-dev/tencil-cli`
- Cleaner separation between "you as a person" and "the project"
- Looks more legitimate to contributors

**Options for the org name:**
- `github.com/tencil` — Cleanest, if available
- `github.com/tencildev` — Matches your personal handle style
- `github.com/tencil-protocol` — Explicit, but longer

**Check now:** https://github.com/organizations/plan

**If `tencil` is taken:**
Go with `tencildev` org to match your personal brand.

**Next step:** Create the org → Transfer this repo to it → Update remote URL locally. Want me to walk through the transfer steps?

**Use `tencil.dev` as the brand, `tencildev` for usernames that don't allow dots.**

Here's the split:

| Context | Format | Example |
|---------|--------|---------|
| **Domain** | `tencil.dev` | Website, docs, email |
| **GitHub** | `tencildev` | github.com/tencildev |
| **Twitter/X** | `@tencildev` | Handle |
| **YouTube** | `Tencil` or `TencilDev` | Channel name |
| **Email/contact** | `tencil.dev` | hello@tencil.dev |
| **CLI command** | `tencil` | `tencil export` |

**Rationale:**

1. **`.dev` is expected** — Developers instantly know this is a devtool (like github.dev, vscode.dev, vercel.dev)

2. **Handles are dot-restricted** — Most platforms ban dots in usernames anyway, so `tencildev` is the practical fallback

3. **SEO clarity** — "tencil.dev" in prose reads as a domain; "tencildev" in code/handles reads as an identifier

4. **Reserve both** — Grab `tencil.com` if cheap, but lead with `.dev` (redirects to `.dev`)

**Check availability now:**
- tencil.dev domain (likely available, obscure word)
- github.com/tencildev
- twitter.com/tencildev
- youtube.com/@tencildev

Want me to suggest alternatives if any are taken?





Based on the business model's Phase 1 (next 6 months), here's the social strategy discussion:

## Platforms to Open

### Must-Have (Immediate)

| Platform | Purpose | Content Focus |
|----------|---------|-------------|
| **GitHub** | Primary home | Repo, releases, issues, discussions |
| **Twitter/X** | Tech community reach | Adapter demos, CLI tips, Penpot/Pencil ecosystem engagement |
| **Hacker News** | Launch visibility | "Show HN" when CLI ships, technical deep-dives |
| **YouTube** | Visual demos | Screen recordings of Penpot→Pencil workflow |

### Secondary (3-6 months)

| Platform | Purpose | When to Activate |
|----------|---------|------------------|
| **Figma Community** | UI designer reach | When Figma adapter ships (M2) |
| **KiCad Forum** | EE engineer reach | When KiCad adapter ships (M3) |
| **Reddit** (r/hardware, r/opensource) | Niche communities | Post meaningful demos, not promo |
| **LinkedIn** | Enterprise pipeline | Case studies, compliance angle |

### Skip For Now

- **TikTok/Instagram** — Wrong audience for devtools
- **Discord** — Wait until community is larger (maintain focus)
- **Mastodon** — Unless Penpot/Pencil community is there

---

## Positioning: What to Say

### The Core Message

**"Tencil is the universal translation layer between design tools."**

### Three Positioning Angles (rotate based on audience)

| Audience | Angle | Example Hook |
|----------|-------|--------------|
| **UI Designers** (Penpot/Figma) | "Your designs can talk to hardware" | "Export your dashboard UI → see it linked to the PCB that drives it" |
| **Hardware Engineers** (KiCad) | "Stop copy-pasting between tools" | "KiCad schematic + Blender enclosure + firmware, all connected" |
| **AI Tooling** | "Give AI agents multi-domain context" | "An AI that knows your button controls GPIO pin 4" |

### Key Differentiators to Lead With

1. **Open protocol** — Not locked into one vendor (vs. Figma's closed ecosystem)
2. **Multi-domain** — UI + Electronics + 3D (vs. single-domain tools)
3. **AI-native** — MCP server for agent reasoning (unique positioning)

### Tone Guidelines

- Technical but accessible
- Show, don't tell (demos > manifestos)
- Ecosystem-friendly (credit Penpot, Pencil, KiCanvas)
- No "disrupting" or "revolutionary" language

---

## Immediate Action Items (This Week)

1. **Secure handles** — `@tencil` or `@tencilprotocol` on Twitter, GitHub org
2. **Draft first posts** — CLI announcement thread, "what is .tencil" explainer
3. **Create demo video** — 60 seconds of Penpot → CLI → Pencil workflow
4. **Identify amplifiers** — Who in Penpot/Pencil/AI tooling community will share?

**Question for you:** Do you want to start with GitHub + Twitter only (minimum viable), or open all Phase 1 platforms simultaneously? Also, what's your personal preference for content creation—written threads, videos, or both?