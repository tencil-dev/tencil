/**
 * tencil push --to <target> [--out <file>] [input.tencil]
 *
 * Converts a .tencil document to a target format and writes it to disk.
 *
 * Supported targets:
 *   --to penpot   → .penpot ZIP file importable via Penpot File → Import
 *
 * Examples:
 *   tencil push --to penpot
 *   tencil push --to penpot project.tencil --out output.penpot
 */

import fs from "fs";
import path from "path";
import { parseTencilDocument } from "@tencil/core";
import { tencilToPenpotFile } from "@tencil/adapter-penpot-out";
import { logger } from "../logger.js";

export async function pushCommand(
  inputFile: string | undefined,
  opts: { to: string; out?: string }
): Promise<void> {
  const target = opts.to;
  const resolvedInput = inputFile
    ? path.resolve(process.cwd(), inputFile)
    : path.resolve(process.cwd(), "project.tencil");

  logger.header(
    "Bridge: Tencil → Penpot",
    `Exporting to ${target}`
  );
  logger.field("Input", resolvedInput);

  // ─── Read .tencil file ────────────────────────────────────────────────────

  if (!fs.existsSync(resolvedInput)) {
    logger.error(`Input file not found: ${resolvedInput}`);
    throw new Error(`Input file not found: ${resolvedInput}`);
  }

  logger.step("Reading .tencil file...");
  let raw: string;
  try {
    raw = fs.readFileSync(resolvedInput, "utf-8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Could not read file: ${msg}`);
    throw new Error(`Could not read file: ${msg}`);
  }

  let rawDoc: unknown;
  try {
    rawDoc = JSON.parse(raw);
  } catch {
    logger.error("Input file is not valid JSON.");
    throw new Error("Input file is not valid JSON.");
  }

  const validation = parseTencilDocument(rawDoc);
  if (!validation.success) {
    logger.error("Invalid .tencil file:");
    for (const e of validation.errors) {
      logger.error(`  ${e.field}: ${e.message}`);
    }
    throw new Error(`Invalid .tencil file: ${validation.errors.map((e) => e.message).join(", ")}`);
  }

  const doc = validation.data;
  logger.success(`Loaded — ${doc.nodes.length} nodes`);

  // ─── Route to target ──────────────────────────────────────────────────────

  if (target === "penpot") {
    const defaultOut = path.basename(resolvedInput, ".tencil") + ".penpot";
    const outputPath = opts.out
      ? path.resolve(process.cwd(), opts.out)
      : path.resolve(process.cwd(), defaultOut);

    logger.field("Output", outputPath);
    logger.br();

    logger.step("Converting .tencil → .penpot ZIP...");
    let buf: Buffer;
    try {
      buf = await tencilToPenpotFile(doc, {
        fileName: doc.name ?? path.basename(outputPath, ".penpot"),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Conversion failed: ${msg}`);
      throw new Error(`Conversion failed: ${msg}`);
    }
    logger.success(`Generated ${buf.length} byte .penpot ZIP`);

    logger.step("Writing .penpot file...");
    try {
      fs.writeFileSync(outputPath, buf);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Could not write file: ${msg}`);
      throw new Error(`Could not write file: ${msg}`);
    }
    logger.success(`Wrote ${outputPath}`);

    logger.footer(`Done. Import into Penpot via: File → Import → ${path.basename(outputPath)}`);
    return;
  }

  logger.error(`Unknown target: ${target}. Supported: penpot`);
  throw new Error(`Unknown target: ${target}`);
}
