/**
 * @tencil/adapter-pencil-in
 *
 * Converts Pencil.dev nodes (from the Pencil MCP batch_get response)
 * to a TencilDocument. This is a pure function — no MCP calls, no I/O.
 *
 * Usage (in the Tencil MCP pull_from_pencil tool):
 * ```typescript
 * import { pencilNodesToTencil } from "@tencil/adapter-pencil-in";
 *
 * // nodes = result from Pencil MCP batch_get("*")
 * const doc = pencilNodesToTencil(nodes, { id: "my-design", name: "My Design" });
 * ```
 */

import type { TencilDocument, TencilNodeBase } from "@tencil/core";
import type { PencilNode, PencilToTencilOptions } from "./types.js";

// ─── Node conversion ──────────────────────────────────────────────────────────

/**
 * Map a Pencil node type to the canonical Tencil type.
 * Pencil and Tencil use the same type names for the four core shape types.
 */
function mapType(pencilType: string): TencilNodeBase["type"] {
  switch (pencilType) {
    case "frame":     return "frame";
    case "rectangle": return "rectangle";
    case "ellipse":   return "ellipse";
    case "text":      return "text";
    // groups are treated as frames in Tencil for M1
    case "group":     return "frame";
    default:          return "rectangle"; // fallback — renders as a box
  }
}

/**
 * Convert a single PencilNode to a TencilNodeBase.
 */
function convertNode(node: PencilNode): TencilNodeBase {
  const type = mapType(node.type);

  // Build base fields shared by all types
  const base: Record<string, unknown> = {
    id: node.id,
    type,
    name: node.name ?? node.id,
  };

  if (node.x !== undefined)        base.x = node.x;
  if (node.y !== undefined)        base.y = node.y;
  if (node.width !== undefined)    base.width = node.width;
  if (node.height !== undefined)   base.height = node.height;
  if (node.rotation !== undefined && node.rotation !== 0) base.rotation = node.rotation;

  // ─── Frame ─────────────────────────────────────────────────────────────────
  if (type === "frame") {
    if (node.fillColor)                base.fillColor = node.fillColor;
    if (node.strokeColor)              base.strokeColor = node.strokeColor;
    if (node.strokeThickness !== undefined) base.strokeThickness = node.strokeThickness;
    if (node.cornerRadius !== undefined)    base.cornerRadius = node.cornerRadius;
    if (node.layout)                   base.layout = node.layout;
    if (node.flexDirection)            base.flexDirection = node.flexDirection;
    if (node.gap !== undefined)        base.gap = node.gap;
    if (node.padding !== undefined)    base.padding = node.padding;
  }

  // ─── Rectangle ─────────────────────────────────────────────────────────────
  if (type === "rectangle") {
    if (node.fillColor)                base.fillColor = node.fillColor;
    if (node.strokeColor)              base.strokeColor = node.strokeColor;
    if (node.strokeThickness !== undefined) base.strokeThickness = node.strokeThickness;
    if (node.cornerRadius !== undefined)    base.cornerRadius = node.cornerRadius;
    if (node.opacity !== undefined)    base.opacity = node.opacity;
  }

  // ─── Ellipse ───────────────────────────────────────────────────────────────
  if (type === "ellipse") {
    if (node.fillColor)                base.fillColor = node.fillColor;
    if (node.strokeColor)              base.strokeColor = node.strokeColor;
    if (node.strokeThickness !== undefined) base.strokeThickness = node.strokeThickness;
    if (node.opacity !== undefined)    base.opacity = node.opacity;
  }

  // ─── Text ──────────────────────────────────────────────────────────────────
  if (type === "text") {
    if (node.content !== undefined)    base.content = node.content;
    if (node.fontFamily)               base.fontFamily = node.fontFamily;
    if (node.fontSize !== undefined)   base.fontSize = node.fontSize;
    if (node.fontWeight !== undefined) base.fontWeight = node.fontWeight;
    if (node.lineHeight !== undefined) base.lineHeight = node.lineHeight;
    if (node.textAlign)                base.textAlign = node.textAlign;
    if (node.textColor)                base.textColor = node.textColor;
  }

  return base as unknown as TencilNodeBase;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert an array of Pencil MCP nodes to a TencilDocument.
 *
 * @param nodes   - Nodes from Pencil MCP `batch_get("*")` response
 * @param options - Optional overrides for document id and name
 * @returns A valid TencilDocument
 */
export function pencilNodesToTencil(
  nodes: PencilNode[],
  options?: PencilToTencilOptions
): TencilDocument {
  const docId = options?.id ?? crypto.randomUUID();
  const docName = options?.name;

  // Filter out any node types that are purely structural / non-visual
  // (e.g., "document" root container that Pencil.dev may include)
  const filtered = nodes.filter((n) => n.type !== "document" && n.type !== "page");

  const tencilNodes = filtered.map(convertNode);

  const doc: TencilDocument = {
    tencil: "1.0",
    domain: "ui",
    id: docId,
    nodes: tencilNodes,
    metadata: {
      source: "pencil",
    },
  };

  if (docName !== undefined) {
    doc.name = docName;
  }

  return doc;
}

export default pencilNodesToTencil;
