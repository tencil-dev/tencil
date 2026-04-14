/**
 * tencil validate [file]
 *
 * Validates a .tencil file against the core schema.
 * Defaults to ./project.tencil if no file is specified.
 */

import fs from "fs";
import path from "path";
import { parseTencilDocument, validateLinkIntegrity } from "@tencil/core";
import { logger } from "../logger.js";

export async function validateCommand(filePath?: string): Promise<void> {
  const target = filePath
    ? path.resolve(process.cwd(), filePath)
    : path.resolve(process.cwd(), "project.tencil");

  logger.header(
    "Bridge: Tencil Validation",
    "Validating Tencil document"
  );
  logger.field("File", target);
  logger.br();

  if (!fs.existsSync(target)) {
    logger.error(`File not found: ${target}`);
    logger.info("Tip: Run 'tencil create <name>' to start a new project.");
    throw new Error(`File not found: ${target}`);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(target, "utf-8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Could not read file: ${msg}`);
    throw new Error(`Could not read file: ${msg}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    logger.error("File is not valid JSON.");
    throw new Error("File is not valid JSON.");
  }

  logger.step("Validating against Tencil schema...");
  const result = parseTencilDocument(json);

  if (result.success) {
    const { data } = result;
    logger.success(`Valid Tencil document`);
    logger.br();
    logger.field("Protocol", data.tencil);
    logger.field("Domain", data.domain);
    logger.field("ID", data.id);
    if (data.name) logger.field("Name", data.name);
    logger.field("Nodes", String(data.nodes.length));
    logger.field("Links", String(data.links?.length ?? 0));

    // Validate link referential integrity
    if (data.links && data.links.length > 0) {
      logger.step("Validating link referential integrity...");
      const linkValidation = validateLinkIntegrity(data);
      if (!linkValidation.success) {
        logger.error(`Link validation failed — ${linkValidation.errors.length} error(s)`);
        logger.br();
        for (const err of linkValidation.errors) {
          logger.error(`  ${err.field}: ${err.message}`);
        }
        throw new Error(`Link validation failed: ${linkValidation.errors.map((e: { message: string }) => e.message).join(", ")}`);
      }
      logger.success("All links are valid");
    }

    logger.footer("Validation passed.");
  } else {
    logger.error(`Validation failed — ${result.errors.length} error(s)`);
    logger.br();
    for (const err of result.errors) {
      logger.error(`  ${err.field}: ${err.message}`);
    }
    throw new Error(`Validation failed: ${result.errors.map((e) => e.message).join(", ")}`);
  }
}
