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