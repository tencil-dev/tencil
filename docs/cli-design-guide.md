# Tencil CLI & TUI Design Guide

**Purpose:** The command-line interface is the primary user surface for Phase 1 and Phase 2. This guide ensures every interaction feels intentional, friendly, and functional.

**Status:** Reference for implementation. Follow this when building `packages/cli/`.

---

## Design Principles

1. **Clarity over speed** — A slow clear message beats a fast cryptic one
2. **Progressive disclosure** — Default output is minimal; `--verbose` reveals details
3. **Actionable failures** — Every error suggests 1-2 next steps
4. **Cross-platform consistency** — Same experience in Windows Terminal, iTerm2, GNOME Terminal
5. **Respectful of context** — Works in CI (no TTY) and interactive shells

---

## Visual System

### Color Palette (via `picocolors`)

| Token | Color | Usage | Example |
|-------|-------|-------|---------|
| `brand` | Cyan (`#00FFFF`) | Headers, key commands, brand moments | `T E N C I L` header |
| `success` | Green (`#00FF00`) | Completion, confirmation | `✓ done` |
| `warning` | Yellow (`#FFFF00`) | Attention needed, non-blocking issues | `⚠️ 3 items skipped` |
| `error` | Red (`#FF0000`) | Blockers, failures | `✗ Connection failed` |
| `info` | Blue (`#0000FF`) | Hints, tips, secondary info | `ℹ️ Tip: Use --watch` |
| `muted` | Gray/Dim | File paths, timestamps, secondary text | `./design.pen` |
| `accent` | White/Bold | Emphasis within muted text | File names, counts |

**Rules:**
- Never use color as the only signal (always pair with icon or text)
- Respect `NO_COLOR=1` environment variable
- Respect `TERM=dumb` (no escape codes)
- Use `FORCE_COLOR=1` to override auto-detection if needed

### Typography

```
T E N C I L     ← Spaced uppercase for brand
Bridge: ...     ← Sentence case for descriptions
[1/3]           ← Bracketed step counters
✓               ← Single-char status icons (not emoji)
```

**Avoid:**
- Emoji (Windows Terminal support varies)
- Box-drawing characters in critical paths (legacy terminal issues)
- Lowercase brand name in headers

### Spacing

```
Empty line before every command output
Header with visual separator
Empty line
Content (indented 2 spaces)
Empty line
Footer or next section
```

---

## Component Patterns

### 1. Command Header

Every command starts with context:

```typescript
function printHeader(bridge: string, operation: string) {
  console.log(); // Empty line
  console.log(pc.cyan('  T E N C I L  ') + pc.dim('─'.repeat(50)));
  console.log(pc.dim(`  ${bridge}`));
  console.log(pc.dim(`  ${operation}`));
  console.log();
}

// Usage
printHeader('Bridge: Penpot → Pencil.dev', 'Exporting design');
```

**Output:**
```

  T E N C I L  ─────────────────────────────────────────────────────
  Bridge: Penpot → Pencil.dev
  Exporting design

```

### 2. Progress Steps

Fixed-width columns for alignment:

```typescript
function printStep(current: number, total: number, label: string, status: 'pending' | 'active' | 'done' | 'error') {
  const stepNum = `[${current}/${total}]`.padEnd(6);
  const labelCol = label.padEnd(40);
  
  const icons = {
    pending: pc.dim('○'),
    active: pc.cyan('⠋'), // Spinner frame
    done: pc.green('✓'),
    error: pc.red('✗')
  };
  
  console.log(`  ${pc.dim(stepNum)} ${labelCol} ${icons[status]}`);
}
```

**Output:**
```
  [1/3]  Reading frames from Penpot...           ✓
  [2/3]  Converting to Tencil format...          ⠋
  [3/3]  Writing to Pencil...                    ○
```

### 3. Animated Spinner (for long operations)

Use `ora` or `cli-spinners`:

```typescript
import ora from 'ora';

const spinner = ora({
  text: 'Connecting to Penpot...',
  spinner: 'dots',
  color: 'cyan'
}).start();

// ... async work ...

spinner.succeed('Connected (12 items found)');
// or
spinner.fail('Connection timeout');
```

**Rules:**
- Spinners only in interactive TTY mode
- In CI (`process.env.CI` or non-TTY), use static progress steps
- Always end with success/failure message

### 4. File Path Display

```typescript
function printPath(label: string, path: string, isDir = false) {
  const icon = isDir ? '📁' : '📄'; // Or use simple text
  const fullPath = resolve(path);
  console.log(`  ${pc.dim(label.padEnd(12))} ${pc.cyan(fullPath)}`);
}

// Output:
//   Source:      C:\Users\Teoes\design.pen
//   Output:      C:\Users\Teoes\design.tencil
```

### 5. Results Summary

```typescript
function printSummary(stats: { read: number; converted: number; warnings: number }) {
  console.log();
  console.log(`  ${pc.green('✓')} Export complete`);
  console.log();
  console.log(`    ${pc.bold(String(stats.read))} items read from Penpot`);
  console.log(`    ${pc.bold(String(stats.converted))} items converted`);
  
  if (stats.warnings > 0) {
    console.log(`    ${pc.yellow(String(stats.warnings))} items skipped (see below)`);
  }
  
  console.log();
  console.log(`  ${pc.dim('Next: Open in Pencil →')} ${pc.cyan('tencil open design.pen')}`);
}
```

### 6. Warning List

```typescript
function printWarnings(items: Array<{ name: string; reason: string; workaround?: string }>) {
  console.log();
  console.log(`  ${pc.yellow('⚠')}  ${items.length} item${items.length === 1 ? '' : 's'} not exported:`);
  console.log();
  
  for (const item of items) {
    console.log(`    ${pc.dim('•')} "${pc.yellow(item.name)}" — ${item.reason}`);
    if (item.workaround) {
      console.log(`      ${pc.dim('→')} ${item.workaround}`);
    }
  }
  
  console.log();
  console.log(`  ${pc.dim('To skip warnings:')} ${pc.cyan('tencil export --ignore-unsupported')}`);
}
```

**Output:**
```

  ⚠  2 items not exported:

    • "Arrow" — Path shapes not yet supported
      → Convert to rectangle in Penpot, or use --ignore-unsupported
    • "Complex Icon" — Nested groups beyond depth limit
      → Flatten layers before export

  To skip warnings: tencil export --ignore-unsupported

```

### 7. Error Message

```typescript
function printError(error: TencilError) {
  console.log();
  console.log(`  ${pc.red('✗')} ${pc.bold(error.title)}`);
  console.log();
  console.log(`  ${error.message}`);
  
  if (error.suggestions?.length) {
    console.log();
    console.log(`  ${pc.dim('Try:')}`);
    for (const suggestion of error.suggestions) {
      console.log(`    ${pc.dim('•')} ${suggestion}`);
    }
  }
  
  if (error.docsUrl) {
    console.log();
    console.log(`  ${pc.dim('Docs:')} ${pc.cyan(error.docsUrl)}`);
  }
  
  console.log();
  console.log(`  ${pc.dim('Need help?')} ${pc.cyan('https://github.com/teoes/tencil/issues')}`);
}
```

**Output:**
```

  ✗ Connection failed

  Could not reach Penpot at https://design.penpot.app
  Timeout after 30 seconds.

  Try:
    • Check your internet connection
    • Verify Penpot is not in maintenance mode
    • Use --timeout 60 for slower connections

  Docs: https://tencil.dev/docs/connection-issues

  Need help? https://github.com/teoes/tencil/issues

```

---

## Command Structure

### Global Options

```
--help, -h           Show help for any command
--version, -V        Show version
--verbose, -v        Show detailed progress
--quiet, -q          Minimal output (errors only)
--no-color           Disable colors
--format <json|pretty>  Output format (default: pretty)
```

### Primary Commands

#### `tencil export`

```bash
# Interactive mode (recommended for first-time users)
tencil export

# Explicit paths
tencil export --from penpot --to pencil --out design.pen

# From clipboard (Penpot plugin "Copy JSON" button)
tencil export --clipboard --to pencil --out design.pen

# From file
tencil export --in design.tencil.json --to pencil --out design.pen

# With options
tencil export --from penpot --to pencil \
  --out design.pen \
  --ignore-unsupported \
  --timeout 60
```

**Output (success):**
```

  T E N C I L  ─────────────────────────────────────────────────────
  Bridge: Penpot → Pencil.dev
  Exporting design

  [1/3]  Reading frames from Penpot...           ✓ 12 items
  [2/3]  Converting to Tencil format...          ✓
  [3/3]  Writing to Pencil...                      ✓

  ✓ Export complete

    12 items read from Penpot
    12 items converted

  Next: Open in Pencil → tencil open design.pen

```

#### `tencil import`

```bash
# Reverse: Pencil to Penpot
tencil import --from pencil --in design.pen --to penpot
```

**Output:**
```

  T E N C I L  ─────────────────────────────────────────────────────
  Bridge: Pencil.dev → Penpot
  Importing design

  [1/3]  Reading Pencil file...                  ✓
  [2/3]  Converting to Penpot format...          ✓
  [3/3]  Opening in Penpot...                    ✓

  ✓ Import ready

    Source:      ./design.pen
    Penpot URL:  https://design.penpot.app/#/workspace/...

```

#### `tencil sync`

```bash
# Watch mode
tencil sync --penpot-json export.tencil.json --pencil design.pen

# With debounce
tencil sync --watch --delay 500 ./designs/
```

**Output:**
```

  T E N C I L  S Y N C  ───────────────────────────────────────────
  
  Watching: ./designs/dashboard.pen
  
  Last sync: 14:32:05                    Status: ✓ Active
  
  Changes detected (14:32:10):
  ✓ Frame "Header"        → Updated in Penpot
  ✓ Text "Welcome"        → Updated in Penpot
  ⚠ New layer "Button"   → Unsupported (skipped)
  
  Press [Q] to quit  [?] for help

```

#### `tencil init`

```bash
tencil init
```

**Interactive flow:**
```

  T E N C I L  ─────────────────────────────────────────────────────
  Initializing new Tencil project

  ? What domain are you working in?
  > UI/UX Design (Penpot, Pencil, Figma)
    Electronics (KiCad)
    Medical (FHIR)
    Other

  ? Project name: (my-tencil-project) 
  
  ? Default export target:
  > Pencil.dev (for AI-assisted implementation)
    Penpot (for design iteration)
    Tencil file only (for version control)

  ✓ Created .tencilrc
  ✓ Project initialized

  Next: tencil export --from penpot

```

#### `tencil validate`

```bash
tencil validate design.tencil.json
```

**Output:**
```

  T E N C I L  ─────────────────────────────────────────────────────
  Validating: design.tencil.json

  ✓ Valid Tencil document

    Schema version: 1.0
    Domain:         ui
    Nodes:          47
    Links:          12 (cross-domain)

```

#### `tencil view` (Phase 1.5+)

```bash
tencil view design.tencil
```

**Output:**
```

  T E N C I L  ─────────────────────────────────────────────────────
  Opening viewer for: design.tencil

  ✓ Viewer started at http://localhost:3928

    Press Ctrl+C to stop

```

---

## Interactive Mode (`-i`, `--interactive`)

When no arguments provided or `-i` flag, use `prompts` library:

```typescript
import prompts from 'prompts';

async function interactiveExport() {
  const response = await prompts([
    {
      type: 'select',
      name: 'source',
      message: 'Export from:',
      choices: [
        { title: 'Penpot (current selection)', value: 'penpot' },
        { title: 'Penpot (current page)', value: 'penpot-page' },
        { title: 'Tencil file', value: 'tencil' },
        { title: 'Clipboard', value: 'clipboard' }
      ]
    },
    {
      type: 'select',
      name: 'target',
      message: 'Export to:',
      choices: [
        { title: 'Pencil.dev (.pen)', value: 'pencil' },
        { title: 'Tencil JSON (.tencil.json)', value: 'tencil-json' }
      ]
    },
    {
      type: 'text',
      name: 'output',
      message: 'Output file:',
      initial: 'design.pen'
    }
  ]);
  
  return response;
}
```

**Rules:**
- Always provide sensible defaults
- Allow Ctrl+C to exit gracefully
- Validate paths exist before confirming

---

## Error Handling

### Error Types

| Code | Meaning | User Action |
|------|---------|-------------|
| `E_NETWORK` | Can't reach service | Check connection, retry |
| `E_AUTH` | Authentication failed | Check tokens, re-login |
| `E_INVALID_INPUT` | File/format error | Check input file |
| `E_UNSUPPORTED` | Feature not implemented | Check docs, use workaround |
| `E_CONVERSION` | Data loss during convert | Review warnings |
| `E_FILE_SYSTEM` | Read/write error | Check permissions, paths |

### Error Structure

```typescript
interface TencilError {
  code: string;
  title: string;
  message: string;
  suggestions?: string[];
  docsUrl?: string;
  originalError?: Error;
}
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Network error |
| 4 | Authentication error |
| 10 | Conversion warnings (with --strict) |

---

## Accessibility

### Color Blindness

- Never use red/green as the only success/failure signal
- Always pair with ✓/✗ icons or "done"/"failed" text
- Test with common simulators (deuteranopia, protanopia)

### Screen Readers

```typescript
// Use stderr for spinners, stdout for results
// This ensures screen readers get clean output

const spinner = ora({
  text: 'Loading...',
  stream: process.stderr // Spinner on stderr
}).start();

// Result on stdout
console.log('Export complete');
```

### Terminal Width

```typescript
const columns = process.stdout.columns || 80;

// Wrap or truncate based on available width
// Never assume 80+ columns (mobile terminals, split panes)
```

---

## Implementation Checklist

### Phase 1 (MVP)

- [ ] `printHeader()` utility with brand styling
- [ ] Step progress with `[1/3]` format
- [ ] Basic error messages with suggestions
- [ ] `--help` for all commands
- [ ] `--version` flag
- [ ] `--no-color` support
- [ ] Non-TTY detection (CI mode)
- [ ] File path formatting (absolute, resolved)

### Phase 1.5 (Polish)

- [ ] Interactive mode (`-i`) with `prompts`
- [ ] Animated spinners with `ora`
- [ ] Warning summaries with workarounds
- [ ] Verbose mode (`-v`) with debug info
- [ ] Quiet mode (`-q`) for scripting
- [ ] JSON output format (`--format json`)

### Phase 2 (Advanced)

- [ ] `sync` watch mode with live display
- [ ] Progress bars for large files
- [ ] Confirmation prompts for destructive ops
- [ ] Config file editing via CLI
- [ ] Update notifier (new version available)

---

## Code Snippets

### Logger Module

```typescript
// packages/cli/src/logger.ts
import pc from 'picocolors';

export const logger = {
  header: (bridge: string, operation: string) => {
    console.log();
    console.log(pc.cyan('  T E N C I L  ') + pc.dim('─'.repeat(50)));
    console.log(pc.dim(`  ${bridge}`));
    console.log(pc.dim(`  ${operation}`));
    console.log();
  },
  
  step: (current: number, total: number, label: string) => {
    const stepNum = `[${current}/${total}]`.padEnd(6);
    const labelCol = label.padEnd(40);
    console.log(`  ${pc.dim(stepNum)} ${labelCol} ${pc.cyan('⠋')}`);
  },
  
  stepComplete: (current: number, total: number, label: string, detail?: string) => {
    const stepNum = `[${current}/${total}]`.padEnd(6);
    const labelCol = label.padEnd(40);
    const detailStr = detail ? ` ${pc.dim(detail)}` : '';
    console.log(`  ${pc.dim(stepNum)} ${labelCol} ${pc.green('✓')}${detailStr}`);
  },
  
  success: (message: string) => {
    console.log(`\n  ${pc.green('✓')} ${message}\n`);
  },
  
  warning: (message: string) => {
    console.log(`\n  ${pc.yellow('⚠')} ${message}\n`);
  },
  
  error: (message: string) => {
    console.log(`\n  ${pc.red('✗')} ${message}\n`);
  },
  
  muted: (message: string) => {
    console.log(pc.dim(message));
  },
  
  path: (label: string, filepath: string) => {
    console.log(`  ${pc.dim(label.padEnd(12))} ${pc.cyan(filepath)}`);
  },
  
  tip: (command: string) => {
    console.log(`  ${pc.dim('Tip:')} ${pc.cyan(command)}`);
  }
};
```

### Error Handler

```typescript
// packages/cli/src/errors.ts
export class TencilCLIError extends Error {
  constructor(
    public code: string,
    message: string,
    public suggestions?: string[],
    public docsUrl?: string
  ) {
    super(message);
    this.name = 'TencilCLIError';
  }
  
  print() {
    logger.error(this.message);
    
    if (this.suggestions?.length) {
      console.log(`  ${pc.dim('Try:')}`);
      for (const suggestion of this.suggestions) {
        console.log(`    ${pc.dim('•')} ${suggestion}`);
      }
    }
    
    if (this.docsUrl) {
      console.log(`\n  ${pc.dim('Docs:')} ${pc.cyan(this.docsUrl)}`);
    }
  }
}
```

### Main Entry

```typescript
// packages/cli/src/index.ts
import { program } from 'commander';
import { logger } from './logger.js';
import { exportCommand } from './commands/export.js';

program
  .name('tencil')
  .description('Universal design tool bridge')
  .version('1.0.0')
  .option('--no-color', 'disable colored output')
  .option('-v, --verbose', 'verbose output')
  .option('-q, --quiet', 'quiet mode (errors only)');

program.addCommand(exportCommand);

// Global error handler
program.exitOverride();

try {
  await program.parseAsync();
} catch (error) {
  if (error instanceof TencilCLIError) {
    error.print();
    process.exit(1);
  }
  throw error;
}
```

---

## Testing CLI Output

```typescript
// packages/cli/tests/logger.test.ts
import { describe, it, expect, vi } from 'vitest';
import { logger } from '../src/logger.js';

describe('logger', () => {
  it('prints header with brand styling', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    logger.header('Bridge: Test', 'Operation');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('T E N C I L')
    );
    
    consoleSpy.mockRestore();
  });
});
```

---

## Resources

- **picocolors**: https://github.com/alexeyraspopov/picocolors
- **commander**: https://github.com/tj/commander.js
- **ora**: https://github.com/sindresorhus/ora
- **prompts**: https://github.com/terkelg/prompts
- **cli-spinners**: https://github.com/sindresorhus/cli-spinners

---

**Last updated:** Phase 1 planning
**Next review:** After first CLI implementation
