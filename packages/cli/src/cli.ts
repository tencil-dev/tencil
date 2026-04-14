#!/usr/bin/env node

/**
 * Tencil CLI — Universal design translation protocol
 */

import { startCommand } from "./commands/start.js";
import { exportCommand } from "./commands/export.js";
import { importCommand } from "./commands/import.js";
import { validateCommand } from "./commands/validate.js";
import { pushCommand } from "./commands/push.js";
import { linkCommand } from "./commands/link.js";
import { TENCIL_VERSION } from "@tencil/core";

const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd || cmd === "--help" || cmd === "-h") {
  console.log(`
  Tencil v${TENCIL_VERSION}

  Universal design translation between disconnected tools.

  Usage:
    tencil start [name]               Create a new Tencil project (interactive)
    tencil export <input>             Convert design file to .tencil
                                        .penpot → uses native ZIP adapter
                                        .json   → uses Penpot HTTP API adapter
    tencil push --to <target>         Convert .tencil to a target format
                                        --to penpot → .penpot ZIP (importable)
    tencil import [project.tencil]    Convert .tencil to Pencil.dev operations
    tencil validate [project.tencil]  Validate a .tencil file
    tencil link add [file]            Add a cross-domain link
    tencil link list [file]           List all cross-domain links

  Options:
    --output, -o <file>   Output file path (for export / import)
    --out <file>          Output file path (for push)
    --to <target>         Push target (e.g. penpot)
    --from <nodeId>       Source node ID (for link add)
    --to <nodeId>         Target node ID (for link add)
    --type <linkType>     Link type (for link add)
    --help,   -h          Show this help

  Examples:
    tencil start
    tencil start my-dashboard
    tencil export design.penpot --output dashboard.tencil
    tencil export design.json --output dashboard.tencil
    tencil push --to penpot dashboard.tencil --out output.penpot
    tencil import dashboard.tencil --output ops.pencil.json
    tencil validate project.tencil
    tencil link add project.tencil --from btn-1 --to gpio-5 --type controls
    tencil link list project.tencil
  `);
  process.exit(0);
}

if (cmd === "--version" || cmd === "-v") {
  console.log(`tencil v${TENCIL_VERSION}`);
  process.exit(0);
}

// Parse --output / -o flag
function getFlag(flag: string, shortFlag: string): string | undefined {
  const idx = args.indexOf(flag) !== -1 ? args.indexOf(flag) : args.indexOf(shortFlag);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return undefined;
}

const outputFlag = getFlag("--output", "-o");
const outFlag = getFlag("--out", "--out");
const toFlag = getFlag("--to", "--to");

// Link-specific flags (separate parsing to avoid ambiguity with push --to)
const linkFromFlag = getFlag("--from", "--from");
const linkToFlag = getFlag("--to", "--to");  // When used with link command
const linkTypeFlag = getFlag("--type", "--type");

// Route to command
(async () => {
  try {
    switch (cmd) {
      case "start": {
        const name = args[1];
        await startCommand(name);
        break;
      }
      case "export": {
        const input = args[1];
        if (!input) {
          console.error("  ✗ Error: Input file is required.\n  Usage: tencil export <input>");
          process.exit(1);
        }
        await exportCommand(input, { output: outputFlag });
        break;
      }
      case "push": {
        if (!toFlag) {
          console.error("  ✗ Error: --to <target> is required.\n  Usage: tencil push --to penpot [input.tencil] [--out output.penpot]");
          process.exit(1);
        }
        const input = args.find((a, i) => i > 0 && !a.startsWith("-") && args[i - 1] !== "--to" && args[i - 1] !== "--out");
        await pushCommand(input, { to: toFlag, out: outFlag });
        break;
      }
      case "import": {
        const input = args[1] && !args[1].startsWith("-") ? args[1] : undefined;
        await importCommand(input, { output: outputFlag });
        break;
      }
      case "validate": {
        const file = args[1] && !args[1].startsWith("-") ? args[1] : undefined;
        await validateCommand(file);
        break;
      }
      case "link": {
        const subcommand = args[1];
        const file = args[2] && !args[2].startsWith("-") ? args[2] : undefined;
        await linkCommand(subcommand, file, { from: linkFromFlag, to: linkToFlag, type: linkTypeFlag });
        break;
      }
      default: {
        console.error(`  ✗ Unknown command: ${cmd}`);
        console.error(`  Run 'tencil --help' for available commands.`);
        process.exit(1);
      }
    }
  } catch (err) {
    console.error(`  ✗ Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
})();
