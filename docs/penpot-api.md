# Getting a Penpot Export

Until the Tencil Penpot plugin is released, you need to use the Penpot API to get your design data as JSON. This page explains how.

---

## Why the export button doesn't work

The export options in Penpot's UI (SVG, PNG, PDF, etc.) are for rendering — they produce images, not structured data. The Tencil adapter needs the raw design data: node IDs, positions, fills, layout — the internal representation Penpot uses.

That data is available via the Penpot API.

---

## Option 1: Penpot API (works now)

### Get your credentials

1. Log in to your Penpot instance (penpot.app or self-hosted)
2. Go to your profile → Access tokens → Create new token
3. Save the token

### Get your file ID

Open your design file in Penpot. The URL looks like:

```
https://design.penpot.app/#/workspace/your-team-id/your-file-id
```

Copy the file ID from the URL.

### Export the file

```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  "https://design.penpot.app/api/rpc/command/get-file?id=YOUR_FILE_ID" \
  -o design.json
```

For self-hosted:

```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  "https://your-penpot-instance/api/rpc/command/get-file?id=YOUR_FILE_ID" \
  -o design.json
```

### Use it with Tencil

```bash
tencil export design.json --output project.tencil
```

---

## Option 2: Export a single page

To export a specific page rather than the whole file, get the page ID from the URL when you're on that page, then:

```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  "https://design.penpot.app/api/rpc/command/get-file?id=YOUR_FILE_ID&components-v2=true" \
  -o design.json
```

The adapter automatically reads `objects` from the top-level page structure.

---

## What the adapter reads

The `penpotToTencil()` adapter reads these fields from each shape/object:

| Penpot field | Tencil field | Notes |
|---|---|---|
| `id` | `id` | Passed through |
| `name` | `name` | Passed through |
| `type` | `type` | `"frame"` → frame, `"rect"` → rectangle, `"text"` → text, `"ellipse"` → ellipse |
| `x`, `y` | `x`, `y` | Position |
| `width`, `height` | `width`, `height` | Dimensions |
| `rotation` | `rotation` | Degrees |
| `fills[0]` | `fillColor` | First fill only, converted to hex |
| `strokes[0]` | `strokeColor`, `strokeThickness` | First stroke only |
| `rx` | `cornerRadius` | Corner radius |
| `layout`, `flex-direction`, `gap` | `layout`, `flexDirection`, `gap` | Flex frames |
| `content` | `content` | Text content |
| `font-family`, `font-size`, `font-weight` | `fontFamily`, `fontSize`, `fontWeight` | Typography |
| `color` | `textColor` | Text color |
| `shapes` | (children, flattened) | Children processed recursively |

**Note:** Tencil flattens the node tree. All shapes become top-level nodes in `nodes[]`. Parent-child relationships are not preserved in this version.

---

## What gets ignored

- Groups (children are extracted and flattened)
- Images
- Components/symbols
- Multiple fills (only the first is used)
- Multiple strokes (only the first is used)
- Blend modes
- Shadows and blur effects
- Boolean path operations

These will be supported in future adapter versions.

---

## Coming soon: Penpot plugin

The Tencil Penpot plugin will let you select specific elements in Penpot and export them directly to `.tencil` without using the API. This is on the M1 roadmap.

When the plugin is ready, the workflow becomes:

1. Open your design in Penpot
2. Select the frames you want
3. Click "Export to Tencil" in the plugin panel
4. The `.tencil` file downloads automatically
