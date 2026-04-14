# CLI Reference

Install:

```bash
npm install -g tencil-cli
```

---

## tencil create

Creates a new Tencil project directory.

```bash
tencil create <name>
```

**Arguments**

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | Yes | Project name. Used as the directory name and document ID. |

**What it creates**

```
<name>/
├── project.tencil   ← empty TencilDocument with domain "ui"
└── .tencilrc        ← project configuration
```

**Example**

```bash
tencil create sensor-dashboard
cd sensor-dashboard
```

**Errors**

- Fails if the directory already exists
- Fails if name is empty or whitespace

---

## tencil export

Converts a Penpot JSON export to `.tencil` format.

```bash
tencil export <input.json> [--output <file>]
```

**Arguments**

| Argument | Required | Description |
|----------|----------|-------------|
| `input.json` | Yes | Path to the Penpot export JSON file |

**Options**

| Option | Default | Description |
|--------|---------|-------------|
| `--output, -o <file>` | `project.tencil` | Output path for the `.tencil` file |

**Examples**

```bash
# Default output (project.tencil)
tencil export design.json

# Custom output path
tencil export design.json --output dashboard.tencil
tencil export design.json -o dashboard.tencil
```

**What it does**

1. Reads and parses the Penpot JSON
2. Converts all shapes/frames/text/rectangles/ellipses to Tencil nodes
3. Validates the resulting TencilDocument against the schema
4. Writes the `.tencil` file

**Errors**

- Fails if input file does not exist
- Fails if input file is not valid JSON
- Fails if the converted document fails schema validation

---

## tencil import

Converts a `.tencil` file to Pencil.dev `batch_design` operations.

```bash
tencil import [file] [--output <file>]
```

**Arguments**

| Argument | Required | Description |
|----------|----------|-------------|
| `file` | No | Path to `.tencil` file. Defaults to `./project.tencil` |

**Options**

| Option | Default | Description |
|--------|---------|-------------|
| `--output, -o <file>` | `operations.pencil.json` | Output path for the operations JSON |

**Examples**

```bash
# Default input and output
tencil import

# Custom input
tencil import dashboard.tencil

# Custom input and output
tencil import dashboard.tencil --output ops.json
tencil import dashboard.tencil -o ops.json
```

**Output format**

```json
{
  "source": "project.tencil",
  "generated": "2026-04-13T10:00:00.000Z",
  "operationCount": 5,
  "operations": [
    "frame_1=I(document, {type:\"frame\", x:0, y:0, width:400, height:300})",
    "text_1=I(frame_1, {type:\"text\", content:\"Hello World\"})"
  ]
}
```

**Errors**

- Fails if input file does not exist
- Fails if input file is not valid JSON
- Fails if document fails schema validation

---

## tencil validate

Validates a `.tencil` file against the Tencil schema.

```bash
tencil validate [file]
```

**Arguments**

| Argument | Required | Description |
|----------|----------|-------------|
| `file` | No | Path to `.tencil` file. Defaults to `./project.tencil` |

**Examples**

```bash
# Validate default file
tencil validate

# Validate a specific file
tencil validate dashboard.tencil
tencil validate path/to/custom.tencil
```

**Output on success**

```
  Tencil  Validating .tencil file

  File: /path/to/project.tencil

  ○ Validating against Tencil schema...
  ✓ Valid Tencil document

  Protocol: 1.0
  Domain:   ui
  ID:       my-dashboard
  Name:     My Dashboard
  Nodes:    12
  Links:    0

  Validation passed.
```

**Output on failure**

```
  ✗ Validation failed — 2 error(s)

  ✗   tencil: Invalid literal value, expected "1.0"
  ✗   id: Required
```

**Errors**

- Fails if file does not exist
- Fails if file is not valid JSON
- Fails if document does not match schema

---

## Global options

```bash
tencil --version    # Show version number
tencil --help       # Show help
tencil -v           # Short form
tencil -h           # Short form
```

---

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (file not found, validation failed, conversion error) |
