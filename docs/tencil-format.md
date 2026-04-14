# The .tencil File Format

A `.tencil` file is a JSON document that describes a design in a tool-neutral way. It's the source of truth that adapters read from and write to.

---

## Root structure

```json
{
  "tencil": "1.0",
  "domain": "ui",
  "id": "my-dashboard",
  "name": "My Dashboard",
  "nodes": [],
  "links": []
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tencil` | `"1.0"` | Yes | Protocol version. Must be exactly `"1.0"` |
| `domain` | string | Yes | Design domain. See domains below |
| `id` | string | Yes | Unique document identifier. Non-empty string |
| `name` | string | No | Human-readable project name |
| `description` | string | No | Optional description |
| `nodes` | array | No | All design nodes. Defaults to `[]` |
| `links` | array | No | Cross-domain relationships. Defaults to `[]` |
| `metadata` | object | No | Arbitrary metadata (author, dates, etc.) |

---

## Domains

The `domain` field declares what kind of design this document contains.

| Value | Meaning |
|-------|---------|
| `"ui"` | User interface / product design |
| `"ee"` | Electronics / schematic (PCB, KiCad) |
| `"3d"` | Mechanical / 3D CAD (Blender, FreeCAD) |
| `"med"` | Medical / healthcare data |
| `"multi"` | Multi-domain document with cross-domain links |

---

## Nodes

Each node in `nodes[]` represents a design element. All nodes share a base set of fields.

### Base node fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier within this document |
| `type` | string | Yes | Node type (e.g. `"frame"`, `"text"`, `"rectangle"`) |
| `name` | string | No | Display name |
| `x` | number | No | X position |
| `y` | number | No | Y position |
| `width` | number | No | Width |
| `height` | number | No | Height |
| `rotation` | number | No | Rotation in degrees |
| `metadata` | object | No | Arbitrary node-level metadata |

### UI node types

These types are defined by `@tencil/schema-ui` for the `"ui"` domain.

#### frame

A container element. Can have flex layout.

```json
{
  "id": "container-1",
  "type": "frame",
  "name": "Card",
  "x": 0, "y": 0, "width": 400, "height": 300,
  "layout": "flex",
  "flexDirection": "column",
  "gap": 16,
  "padding": 24,
  "fillColor": "#ffffff",
  "strokeColor": "#e2e8f0",
  "strokeThickness": 1,
  "cornerRadius": 8
}
```

| Field | Type | Description |
|-------|------|-------------|
| `layout` | `"flex"` \| `"none"` | Layout mode |
| `flexDirection` | `"row"` \| `"column"` | Flex direction |
| `gap` | number | Gap between children |
| `padding` | number \| `{top, right, bottom, left}` | Inner padding |
| `fillColor` | string | Hex fill color e.g. `"#ffffff"` |
| `strokeColor` | string | Hex stroke color |
| `strokeThickness` | number | Stroke width in px |
| `cornerRadius` | number \| [number, number, number, number] | Corner radius |

#### text

A text element.

```json
{
  "id": "title-1",
  "type": "text",
  "name": "Title",
  "x": 20, "y": 20,
  "content": "Hello World",
  "fontFamily": "Inter",
  "fontSize": 24,
  "fontWeight": 600,
  "lineHeight": 1.4,
  "textAlign": "left",
  "textColor": "#1a1a1a"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `content` | string | The text content (required for text nodes) |
| `fontFamily` | string | Font family name |
| `fontSize` | number | Font size in px |
| `fontWeight` | number | 400 = regular, 600 = semibold, 700 = bold |
| `lineHeight` | number \| string | Line height multiplier or absolute value |
| `textAlign` | `"left"` \| `"center"` \| `"right"` \| `"justify"` | Text alignment |
| `textColor` | string | Hex text color |

#### rectangle

A rectangular shape.

```json
{
  "id": "btn-bg",
  "type": "rectangle",
  "x": 20, "y": 100, "width": 120, "height": 40,
  "fillColor": "#3b82f6",
  "strokeColor": "#2563eb",
  "strokeThickness": 1,
  "cornerRadius": 6,
  "opacity": 1
}
```

| Field | Type | Description |
|-------|------|-------------|
| `fillColor` | string | Hex fill color |
| `strokeColor` | string | Hex stroke color |
| `strokeThickness` | number | Stroke width in px |
| `cornerRadius` | number \| [number, number, number, number] | Corner radius |
| `opacity` | number | Opacity 0–1 |

#### ellipse

A circular or oval shape.

```json
{
  "id": "avatar",
  "type": "ellipse",
  "x": 20, "y": 20, "width": 48, "height": 48,
  "fillColor": "#e2e8f0",
  "opacity": 1
}
```

| Field | Type | Description |
|-------|------|-------------|
| `fillColor` | string | Hex fill color |
| `strokeColor` | string | Hex stroke color |
| `strokeThickness` | number | Stroke width |
| `opacity` | number | Opacity 0–1 |

#### path

A vector path using SVG path data.

```json
{
  "id": "icon-1",
  "type": "path",
  "x": 0, "y": 0,
  "pathData": "M 0 0 L 24 0 L 24 24 L 0 24 Z",
  "fillColor": "#374151",
  "strokeColor": "#111827",
  "strokeThickness": 1.5
}
```

| Field | Type | Description |
|-------|------|-------------|
| `pathData` | string | SVG path data string |
| `fillColor` | string | Hex fill color |
| `strokeColor` | string | Hex stroke color |
| `strokeThickness` | number | Stroke width |

---

## Links

Links connect nodes across domains. They're how Tencil models cross-domain relationships — a UI button that controls a GPIO pin, a sensor that drives a display, a housing that contains a PCB.

```json
{
  "id": "link-1",
  "source": {
    "domain": "ui",
    "nodeId": "btn-power"
  },
  "target": {
    "domain": "ee",
    "nodeId": "gpio-pin-12"
  },
  "type": "controls",
  "metadata": {
    "label": "Power button → GPIO 12"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique link identifier |
| `source.domain` | string | Yes | Domain of the source node |
| `source.nodeId` | string | Yes | ID of the source node |
| `target.domain` | string | Yes | Domain of the target node |
| `target.nodeId` | string | Yes | ID of the target node |
| `type` | string | Yes | Relationship type |
| `metadata` | object | No | Arbitrary link metadata |

### Link types

| Type | Meaning | Example |
|------|---------|---------|
| `"controls"` | UI element controls a hardware signal | Button → GPIO pin |
| `"displays"` | UI element shows data from a source | Label → sensor reading |
| `"located-at"` | Element is physically located at a position | 3D part → PCB coordinate |
| `"encloses"` | One element contains another spatially | 3D housing → PCB |
| `"mounts-on"` | Element mounts onto another | PCB → 3D standoff |
| `"powered-by"` | Element receives power from a source | Component → power rail |
| `"triggers"` | An event triggers a UI change | Sensor alert → notification |
| `"reads-from"` | UI element reads from a data source | Field → medical device |
| `"prescribes"` | Medical action relates to patient record | Action → record |

---

## Full example

```json
{
  "tencil": "1.0",
  "domain": "ui",
  "id": "sensor-dashboard",
  "name": "Sensor Dashboard",
  "nodes": [
    {
      "id": "frame-main",
      "type": "frame",
      "name": "Dashboard",
      "x": 0, "y": 0, "width": 800, "height": 600,
      "layout": "flex",
      "flexDirection": "column",
      "gap": 24,
      "padding": 32,
      "fillColor": "#f8fafc"
    },
    {
      "id": "title",
      "type": "text",
      "name": "Title",
      "x": 32, "y": 32,
      "content": "Sensor Dashboard",
      "fontSize": 28,
      "fontWeight": 700,
      "textColor": "#0f172a"
    },
    {
      "id": "btn-power",
      "type": "rectangle",
      "name": "Power Button",
      "x": 32, "y": 100, "width": 120, "height": 44,
      "fillColor": "#3b82f6",
      "cornerRadius": 6
    }
  ],
  "links": [
    {
      "id": "link-power-gpio",
      "source": { "domain": "ui", "nodeId": "btn-power" },
      "target": { "domain": "ee", "nodeId": "gpio-12" },
      "type": "controls"
    }
  ]
}
```

---

## Validation

Tencil validates documents using Zod. To validate programmatically:

```typescript
import { parseTencilDocument } from "@tencil/core";

const result = parseTencilDocument(json);

if (result.success) {
  console.log(result.data.nodes.length, "nodes");
} else {
  for (const err of result.errors) {
    console.error(err.field, err.message);
  }
}
```

Or use the CLI:

```bash
tencil validate project.tencil
```
