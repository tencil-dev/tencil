/**
 * tencil import [file] [--output <file>]
 *
 * Converts a .tencil file to Pencil.dev batch_design operations.
 * Defaults to ./project.tencil if no file is specified.
 * Output defaults to operations.pencil.json.
 */

import fs from "fs";
import path from "path";
import { parseTencilDocument } from "@tencil/core";
import { tencilToPencil } from "@tencil/adapter-pencil-out";
import { logger } from "../logger.js";

export async function importCommand(
  inputFile: string | undefined,
  opts: { output?: string }
): Promise<void> {
  const inputPath = inputFile
    ? path.resolve(process.cwd(), inputFile)
    : path.resolve(process.cwd(), "project.tencil");

  const outputPath = opts.output
    ? path.resolve(process.cwd(), opts.output)
    : path.resolve(process.cwd(), "operations.pencil.json");

  logger.header(
    "Bridge: Tencil → Pencil.dev",
    "Importing design"
  );
  logger.field("Input", inputPath);
  logger.field("Output", outputPath);
  logger.br();

  // Check input exists
  if (!fs.existsSync(inputPath)) {
    logger.error(`File not found: ${inputPath}`);
    logger.info("Tip: Run 'tencil export <design.json>' first.");
    throw new Error(`File not found: ${inputPath}`);
  }

  // Read file
  logger.step("Reading .tencil file...");
  let raw: string;
  try {
    raw = fs.readFileSync(inputPath, "utf-8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Could not read file: ${msg}`);
    throw new Error(`Could not read file: ${msg}`);
  }

  // Parse JSON
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    logger.error("File is not valid JSON.");
    throw new Error("File is not valid JSON.");
  }

  // Validate
  logger.step("Validating Tencil document...");
  const validation = parseTencilDocument(json);
  if (!validation.success) {
    logger.error("Invalid Tencil document:");
    for (const e of validation.errors) {
      logger.error(`  ${e.field}: ${e.message}`);
    }
    throw new Error(`Invalid .tencil document: ${validation.errors.map((e) => e.message).join(", ")}`);
  }
  const tencilDoc = validation.data;
  logger.success(`Valid — ${tencilDoc.nodes.length} nodes, ${tencilDoc.links?.length ?? 0} links`);

  // Convert to Pencil operations
  logger.step("Generating Pencil.dev operations...");
  let operations: string[];
  try {
    const result = tencilToPencil(tencilDoc);
    operations = result.operations;

    const { summary, details } = result.report;
    if (summary.translated > 0) {
      logger.success(`${summary.translated} node${summary.translated === 1 ? "" : "s"} translated`);
    }
    if (summary.approximated > 0) {
      logger.warn(`${summary.approximated} node${summary.approximated === 1 ? "" : "s"} approximated`);
      for (const d of details.filter((d) => d.operation === "approximated")) {
        logger.info(`  "${d.nodeName}" — ${d.reason ?? "capability downgrade"}${d.suggestion ? ` (${d.suggestion})` : ""}`);
      }
    }
    if (summary.skipped > 0) {
      logger.warn(`${summary.skipped} node${summary.skipped === 1 ? "" : "s"} skipped`);
      for (const d of details.filter((d) => d.operation === "skipped")) {
        logger.info(`  "${d.nodeName}" — ${d.reason ?? "unsupported node type"}${d.suggestion ? ` (${d.suggestion})` : ""}`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Conversion failed: ${msg}`);
    throw new Error(`Conversion failed: ${msg}`);
  }

  // Write output
  logger.step("Writing operations file...");
  const output = {
    source: path.basename(inputPath),
    generated: new Date().toISOString(),
    operationCount: operations.length,
    operations,
  };

  try {
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Could not write file: ${msg}`);
    throw new Error(`Could not write file: ${msg}`);
  }
  logger.success(`Wrote ${outputPath} (${operations.length} operations)`);

  logger.footer(`Done. Pass operations to Pencil MCP batch_design tool.`);
}
