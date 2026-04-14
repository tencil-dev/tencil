/**
 * tencil start [name]
 *
 * Interactively creates a new Tencil project with domain and adapter selection.
 * If name is provided, skips the project name prompt.
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { logger } from "../logger.js";
import { PROTOCOL_VERSION } from "@tencil/core";

interface DomainOption {
  domain: "ui" | "electronics" | "medical";
  label: string;
  adapters: {
    in: string;
    out: string;
  };
}

const domains: DomainOption[] = [
  {
    domain: "ui",
    label: "UI/UX Design (Penpot, Pencil)",
    adapters: { in: "penpot", out: "pencil" },
  },
  {
    domain: "electronics",
    label: "Electronics (KiCad)",
    adapters: { in: "kicad", out: "kicad" },
  },
  {
    domain: "medical",
    label: "Medical (FHIR)",
    adapters: { in: "fhir", out: "fhir" },
  },
];

interface TargetOption {
  target: "pencil" | "penpot" | "tencil";
  label: string;
}

const targets: TargetOption[] = [
  { target: "pencil", label: "Pencil.dev (for AI-assisted implementation)" },
  { target: "penpot", label: "Penpot (for design iteration)" },
  { target: "tencil", label: "Tencil file only (for version control)" },
];

function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function promptSelection(
  message: string,
  options: string[],
  defaultIndex: number = 0
): Promise<number> {
  const rl = createReadlineInterface();
  return new Promise((resolve) => {
    console.log(`\n  ${message}`);
    options.forEach((opt, i) => {
      const marker = i === defaultIndex ? ">" : " ";
      console.log(`  ${marker} ${opt}`);
    });

    rl.question("\n  Enter option number (or press Enter for default): ", (answer) => {
      rl.close();
      const num = parseInt(answer, 10);
      const idx = isNaN(num) ? defaultIndex : Math.max(0, Math.min(num, options.length - 1));
      resolve(idx);
    });
  });
}

async function promptText(
  message: string,
  defaultValue: string = ""
): Promise<string> {
  const rl = createReadlineInterface();
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${message} (${defaultValue}) ` : `${message} `;
    rl.question(`  ${prompt}`, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

export async function startCommand(providedName?: string): Promise<void> {
  // Use TTY detection to handle tests and non-interactive environments
  const isTTY = process.stdin.isTTY;

  let projectName: string;

  if (providedName !== undefined) {
    // If name is explicitly provided, use it (even if empty - let validation catch it)
    projectName = providedName.trim();
  } else if (isTTY) {
    // Interactive prompt only in TTY
    projectName = await promptText("Project name:", "my-tencil-project");
  } else {
    // Non-TTY: use default
    projectName = "my-tencil-project";
  }

  if (!projectName || projectName.trim() === "") {
    logger.error("Project name is required.");
    throw new Error("Project name is required.");
  }

  const projectDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectDir)) {
    logger.error(`Directory "${projectName}" already exists.`);
    throw new Error(`Directory "${projectName}" already exists.`);
  }

  logger.header(
    "Bridge: Penpot → Pencil.dev",
    `Initializing new Tencil project`
  );

  // Domain selection
  const domainIndex = isTTY
    ? await promptSelection(
        "What domain are you working in?",
        domains.map((d) => d.label),
        0
      )
    : 0; // Default to UI/UX Design

  const selectedDomain = domains[domainIndex];

  // Target selection
  const targetIndex = isTTY
    ? await promptSelection(
        "Default export target?",
        targets.map((t) => t.label),
        0
      )
    : 0; // Default to Pencil.dev

  const selectedTarget = targets[targetIndex];

  // Create project directory
  logger.step(`Creating ${projectName}/`);
  fs.mkdirSync(projectDir, { recursive: true });
  logger.success(`Created ${projectName}/`);

  // Create project.tencil
  const projectTencil = {
    tencil: PROTOCOL_VERSION,
    domain: selectedDomain.domain,
    id: projectName,
    name: projectName,
    nodes: [],
    links: [],
  };

  const tencilPath = path.join(projectDir, "project.tencil");
  fs.writeFileSync(tencilPath, JSON.stringify(projectTencil, null, 2), "utf-8");
  logger.success(`Created ${projectName}/project.tencil`);

  // Create .tencilrc with selected adapters
  const tencilRc = {
    version: "1.0",
    project: projectName,
    domain: selectedDomain.domain,
    defaultTarget: selectedTarget.target,
    adapters: { in: selectedDomain.adapters.in, out: selectedDomain.adapters.out },
  };

  const rcPath = path.join(projectDir, ".tencilrc");
  fs.writeFileSync(rcPath, JSON.stringify(tencilRc, null, 2), "utf-8");
  logger.success(`Created ${projectName}/.tencilrc`);

  logger.footer(
    `Done! Run: cd ${projectName} && tencil export --help`
  );
}
