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
You're asking about file icons in VS Code — the little icons next to file names in the explorer (like the JSON bracket icon, the Markdown M icon, etc.).

Those come from VS Code icon themes (like Material Icon Theme or vscode-icons). For a custom .tencil extension to get its own icon, you'd need to:

Contribute it via a VS Code extension — your extension's package.json would declare a fileIcons contribution pointing .tencil files to a custom icon SVG.
OR submit a PR to a popular icon theme (like Material Icon Theme) adding .tencil to their file associations.
Since you already have a packages/mcp-server in this repo, I'd guess a VS Code extension is either planned or already in the works. Do you have one? If so, I can wire up the file icon contribution. If not, I can scaffold the extension with the icon support included.

What's your current setup — is there a VS Code extension package here?

That's the operating system shell icon — on Windows it comes from the application registered to open that file type in the registry.

Right now .tencil has no registered app, so Windows shows the generic "unknown file" icon.

To give it a proper icon on Windows, you'd need to:

Register the file association in the registry — map .tencil → your app, and point to an .ico file
Have an .ico file — Windows shell icons must be .ico format (can contain multiple sizes: 16, 32, 48, 256px)
The registration happens when your app installs — via an installer (NSIS, WiX, Squirrel, etc.) or a small registry script
Since there's no app yet to open .tencil files, you have two practical options right now:

Option A — Quick dev setup — a .reg file that associates .tencil with an icon, runnable manually during development

Option B — Proper installer — baked into a future app installer (Electron, Tauri, etc.)

The .tencil format doesn't have a logo because:

The core schema has no logo field — TencilDocument only has tencil, domain, id, name, description, nodes, links, and metadata.
The .pen file has no logo node — the MCP export didn't surface any image/logo node from testifyah.pen (only frames, rectangles, text, ellipses).
How to add a logo
You have two options:

Option A — Add it to the metadata field (lightweight, no standard support yet)
Just a URL or base64 string stored in metadata:


{"tencil": "1.0",
  "domain": "ui",
  "id": "testifyah",
  "name": "Testifyah",
  "metadata": {
    "logo": "https://...",   // or "data:image/png;base64,..."
    ...
  }
}
Pros: zero schema changes, works now. Cons: tooling won't know what to do with it.

Option B — Extend the TencilDocument schema (proper solution)
Add a logo field to packages/core/src/types.ts:


export interface TencilDocument {  ...
  /** Optional logo: a URL or data URI */
  logo?: string;
  ...
}
Then set it when exporting. This is the right move if logo is a first-class concept in tencil.
