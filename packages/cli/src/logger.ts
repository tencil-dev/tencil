/**
 * CLI logger — consistent output styling for Tencil CLI.
 * Uses picocolors for color output (no heavy dependencies).
 */

import pc from "picocolors";

export const logger = {
  /** Step success — ✓ green */
  success(msg: string) {
    console.log(`  ${pc.green("✓")} ${msg}`);
  },

  /** Step in progress — ○ dim */
  step(msg: string) {
    console.log(`  ${pc.dim("○")} ${msg}`);
  },

  /** Warning — ! yellow */
  warn(msg: string) {
    console.log(`  ${pc.yellow("!")} ${pc.yellow(msg)}`);
  },

  /** Error — ✗ red */
  error(msg: string) {
    console.error(`  ${pc.red("✗")} ${pc.red(msg)}`);
  },

  /** Info — plain dim */
  info(msg: string) {
    console.log(`  ${pc.dim(msg)}`);
  },

  /** Section header — matches cli-design-guide.md */
  header(bridge: string, operation?: string) {
    console.log();
    console.log(`  ${pc.cyan("T E N C I L")}  ${pc.dim("─".repeat(50))}`);
    console.log(`  ${pc.dim(bridge)}`);
    if (operation) {
      console.log(`  ${pc.dim(operation)}`);
    }
    console.log();
  },

  /** Section footer */
  footer(msg: string) {
    console.log();
    console.log(`  ${pc.dim(msg)}`);
    console.log();
  },

  /** Bold label + value pair */
  field(label: string, value: string) {
    console.log(`  ${pc.bold(label)}: ${value}`);
  },

  /** Empty line */
  br() {
    console.log();
  },
};
