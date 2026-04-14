/**
 * tencil export <input> [--output <file>]
 *
 * Converts a design file to .tencil format.
 * Supports:
 *   - .penpot  → native Penpot ZIP export (via @tencil/adapter-penpot-file-in)
 *   - .json    → Penpot HTTP API JSON export (via @tencil/adapter-penpot-in)
 *
 * Output defaults to <input-basename>.tencil in the current directory.
 */

import fs from "fs";
import path from "path";
import { parseTencilDocument } from "@tencil/core";
import { penpotToTencil } from "@tencil/adapter-penpot-in";
import { penpotFileToTencil } from "@tencil/adapter-penpot-file-in";
import { logger } from "../logger.js";

export async function exportCommand(
  inputFile: string,
  opts: { output?: string }
): Promise<void> {
  const inputPath = path.resolve(process.cwd(), inputFile);
  const ext = path.extname(inputFile).toLowerCase();

  const defaultBasename = path.basename(inputFile, ext) + ".tencil";
  const outputPath = opts.output
    ? path.resolve(process.cwd(), opts.output)
    : path.resolve(process.cwd(), defaultBasename);

  logger.header(
    "Bridge: Penpot → Tencil",
    "Exporting design to Tencil format"
  );
  logger.field("Input", inputPath);
  logger.field("Output", outputPath);
  logger.br();

  if (!fs.existsSync(inputPath)) {
    logger.error(`Input file not found: ${inputPath}`);
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const projectName = path.basename(outputPath, ".tencil");
  let tencilDoc;

  // ─── .penpot file (native ZIP export) ──────────────────────────────────────
  if (ext === ".penpot") {
    logger.step("Reading .penpot file...");
    let buf: Buffer;
    try {
      buf = fs.readFileSync(inputPath);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Could not read file: ${msg}`);
      throw new Error(`Could not read file: ${msg}`);
    }
    logger.success(".penpot file loaded");

    logger.step("Converting .penpot → Tencil...");
    try {
      tencilDoc = await penpotFileToTencil(buf, { id: projectName, name: projectName });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Conversion failed: ${msg}`);
      throw new Error(`Conversion failed: ${msg}`);
    }

  // ─── .json file (Penpot HTTP API export) ───────────────────────────────────
  } else {
    logger.step("Reading Penpot JSON export...");
    let raw: string;
    try {
      raw = fs.readFileSync(inputPath, "utf-8");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Could not read file: ${msg}`);
      throw new Error(`Could not read file: ${msg}`);
    }

    let penpotData: unknown;
    try {
      penpotData = JSON.parse(raw);
    } catch {
      logger.error("Input file is not valid JSON.");
      throw new Error("Input file is not valid JSON.");
    }
    logger.success("Penpot JSON export loaded");

    logger.step("Converting to Tencil format...");
    try {
      tencilDoc = penpotToTencil(penpotData, { id: projectName });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Conversion failed: ${msg}`);
      throw new Error(`Conversion failed: ${msg}`);
    }
  }

  logger.step("Validating Tencil document...");
  const validation = parseTencilDocument(tencilDoc);
  if (!validation.success) {
    logger.error("Generated document failed validation:");
    for (const e of validation.errors) {
      logger.error(`  ${e.field}: ${e.message}`);
    }
    throw new Error(`Document validation failed: ${validation.errors.map((e) => e.message).join(", ")}`);
  }
  logger.success(`Tencil document valid — ${tencilDoc.nodes.length} nodes`);

  logger.step("Writing .tencil file...");
  try {
    fs.writeFileSync(outputPath, JSON.stringify(tencilDoc, null, 2), "utf-8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Could not write file: ${msg}`);
    throw new Error(`Could not write file: ${msg}`);
  }
  logger.success(`Wrote ${outputPath}`);

  logger.footer(`Done. Run: tencil import to send to Pencil.dev`);
}
