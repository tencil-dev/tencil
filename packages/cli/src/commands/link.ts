/**
 * tencil link add --from <nodeId> --to <nodeId> --type <linkType>
 * tencil link list [file]
 *
 * Manage cross-domain links in a .tencil file.
 * Links describe semantic relationships between nodes (e.g., "UI button controls GPIO pin").
 */

import fs from "fs";
import path from "path";
import { parseTencilDocument, validateTencilDocument } from "@tencil/core";
import type { TencilLink, TencilLinkType } from "@tencil/core";
import { logger } from "../logger.js";

const VALID_LINK_TYPES: TencilLinkType[] = [
  "controls",
  "displays",
  "located-at",
  "encloses",
  "mounts-on",
  "powered-by",
  "triggers",
  "reads-from",
  "prescribes",
];

export async function linkCommand(
  subcommand?: string,
  filePath?: string,
  options?: {
    from?: string;
    to?: string;
    type?: string;
  }
): Promise<void> {
  if (!subcommand) {
    console.error("  ✗ Missing subcommand. Use 'tencil link add' or 'tencil link list'.");
    throw new Error("Missing subcommand");
  }

  if (subcommand === "add") {
    await handleLinkAdd(filePath, options);
  } else if (subcommand === "list") {
    await handleLinkList(filePath);
  } else {
    console.error(`  ✗ Unknown link subcommand: ${subcommand}`);
    throw new Error(`Unknown link subcommand: ${subcommand}`);
  }
}

async function handleLinkAdd(
  filePath?: string,
  options?: { from?: string; to?: string; type?: string }
): Promise<void> {
  logger.header(
    "Bridge: Cross-domain Links",
    "Adding cross-domain link"
  );

  if (!options?.from || !options?.to || !options?.type) {
    logger.error("Required flags: --from <nodeId> --to <nodeId> --type <linkType>");
    logger.info("Valid link types: " + VALID_LINK_TYPES.join(", "));
    throw new Error("Missing required flags for link add");
  }

  if (!VALID_LINK_TYPES.includes(options.type as TencilLinkType)) {
    logger.error(`Invalid link type: ${options.type}`);
    logger.info("Valid types: " + VALID_LINK_TYPES.join(", "));
    throw new Error("Invalid link type");
  }

  const target = filePath
    ? path.resolve(process.cwd(), filePath)
    : path.resolve(process.cwd(), "project.tencil");

  logger.field("File", target);
  logger.field("From", options.from);
  logger.field("To", options.to);
  logger.field("Type", options.type);
  logger.br();

  if (!fs.existsSync(target)) {
    logger.error(`File not found: ${target}`);
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

  const result = parseTencilDocument(json);
  if (!result.success) {
    logger.error("File is not a valid Tencil document.");
    for (const err of result.errors) {
      logger.error(`  ${err.field}: ${err.message}`);
    }
    throw new Error("Invalid Tencil document");
  }

  const doc = result.data;

  // Verify source and target node IDs exist
  const sourceNode = doc.nodes.find((n) => n.id === options.from);
  const targetNode = doc.nodes.find((n) => n.id === options.to);

  if (!sourceNode) {
    logger.error(`Source node not found: ${options.from}`);
    throw new Error(`Source node not found: ${options.from}`);
  }

  if (!targetNode) {
    logger.error(`Target node not found: ${options.to}`);
    throw new Error(`Target node not found: ${options.to}`);
  }

  // Create link (use timestamp for uniqueness; in production might use UUID)
  const linkId = `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newLink: TencilLink = {
    id: linkId,
    source: {
      domain: doc.domain,
      nodeId: options.from,
    },
    target: {
      domain: doc.domain,
      nodeId: options.to,
    },
    type: options.type as TencilLinkType,
  };

  // Initialize links array if not present
  if (!doc.links) {
    doc.links = [];
  }

  // Check for duplicate link
  const isDuplicate = doc.links.some(
    (l) =>
      l.source.nodeId === options.from &&
      l.target.nodeId === options.to &&
      l.type === options.type
  );

  if (isDuplicate) {
    logger.warn("A link with these properties already exists.");
    throw new Error("Duplicate link");
  }

  doc.links.push(newLink);

  // Validate updated document
  logger.step("Validating updated document...");
  const validation = validateTencilDocument(doc);
  if (!validation.success) {
    logger.error("Validation failed after adding link:");
    for (const err of validation.errors) {
      logger.error(`  ${err.field}: ${err.message}`);
    }
    throw new Error("Validation failed");
  }

  // Write back
  logger.step("Writing updated document...");
  const content = JSON.stringify(validation.data, null, 2);
  try {
    fs.writeFileSync(target, content, "utf-8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Could not write file: ${msg}`);
    throw new Error(`Could not write file: ${msg}`);
  }

  logger.success("Link added successfully");
  logger.br();
  logger.field("Link ID", linkId);
  logger.field("Total links", String(validation.data.links?.length ?? 0));
  logger.footer("Link creation complete.");
}

async function handleLinkList(filePath?: string): Promise<void> {
  logger.header(
    "Bridge: Cross-domain Links",
    "Listing cross-domain links"
  );

  const target = filePath
    ? path.resolve(process.cwd(), filePath)
    : path.resolve(process.cwd(), "project.tencil");

  logger.field("File", target);
  logger.br();

  if (!fs.existsSync(target)) {
    logger.error(`File not found: ${target}`);
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

  const result = parseTencilDocument(json);
  if (!result.success) {
    logger.error("File is not a valid Tencil document.");
    for (const err of result.errors) {
      logger.error(`  ${err.field}: ${err.message}`);
    }
    throw new Error("Invalid Tencil document");
  }

  const doc = result.data;
  const links = doc.links ?? [];

  if (links.length === 0) {
    logger.info("No links found in this document.");
    logger.footer("Link listing complete.");
    return;
  }

  logger.success(`Found ${links.length} link(s)`);
  logger.br();

  for (const link of links) {
    const sourceName = doc.nodes.find((n) => n.id === link.source.nodeId)?.name || link.source.nodeId;
    const targetName = doc.nodes.find((n) => n.id === link.target.nodeId)?.name || link.target.nodeId;

    logger.field("ID", link.id);
    logger.field("Type", link.type);
    logger.field("Source", `${sourceName} (${link.source.nodeId})`);
    logger.field("Target", `${targetName} (${link.target.nodeId})`);
    if (link.metadata) {
      logger.field("Metadata", JSON.stringify(link.metadata));
    }
    logger.br();
  }

  logger.footer("Link listing complete.");
}
