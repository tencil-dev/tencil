/**
 * @tencil/adapter-pencil-out
 *
 * Converts Tencil documents to Pencil.dev designs via the Pencil MCP batch_design language.
 *
 * Usage:
 * ```typescript
 * import { tencilToPencil } from "@tencil/adapter-pencil-out";
 * import { parseTencilDocument } from "@tencil/core";
 *
 * const tencilDoc = parseTencilDocument(json);
 * const pencilOps = tencilToPencil(tencilDoc);
 * // Returns array of batch_design operation strings, e.g.:
 * // [
 * //   "frame=I(document, {type:\"frame\", x:0, y:0, width:400, height:600})",
 * //   "text=I(frame, {type:\"text\", content:\"Hello\", ...})",
 * //   ...
 * // ]
 * ```
 */

import type { TencilDocument, TencilNodeBase } from "@tencil/core";
import type {
  TencilFrame,
  TencilText,
  TencilRectangle,
  TencilEllipse,
} from "@tencil/schema-ui";
import type {
  BatchDesignOperation,
  TencilToPencilOptions,
  TencilToPencilResult,
  TranslationReportDetail,
} from "./types.js";

/**
 * Convert TencilDocument to Pencil.dev batch_design operations.
 * Returns an array of operation strings suitable for the Pencil MCP `batch_design` tool.
 *
 * The operations follow the Pencil.dev MCP syntax:
 * - I(parent, props) — Insert a new node
 * - U(path, props) — Update properties
 * - R(path, props) — Replace a node
 * - C(id, parent, props) — Copy a node
 * - M(id, parent) — Move a node
 * - D(id) — Delete a node
 *
 * @param tencilDoc - Validated TencilDocument
 * @param options - Conversion options
 * @returns Array of operation strings
 */
export function tencilToPencil(
  tencilDoc: TencilDocument,
  _options?: TencilToPencilOptions
): TencilToPencilResult {
  const operations: BatchDesignOperation[] = [];
  const details: TranslationReportDetail[] = [];
  const nodeMap = new Map<string, string>(); // Tencil node ID → Pencil variable name
  const usedNames = new Map<string, number>(); // base name → count, for deduplication

  for (const node of tencilDoc.nodes) {
    const result = convertNodeToOperation(node, nodeMap, usedNames);
    if (result.operation) {
      operations.push(result.operation);
    }
    details.push(result.detail);
  }

  const translated = details.filter((d) => d.operation === "translated").length;
  const approximated = details.filter((d) => d.operation === "approximated").length;
  const skipped = details.filter((d) => d.operation === "skipped").length;

  return {
    operations,
    report: {
      success: skipped < details.length,
      summary: {
        totalNodes: details.length,
        translated,
        approximated,
        skipped,
      },
      details,
    },
  };
}

/**
 * Convert a single Tencil node to a Pencil MCP operation.
 * Returns the operation string, a variable binding, and a report detail entry.
 */
function convertNodeToOperation(
  node: TencilNodeBase,
  nodeMap: Map<string, string>,
  usedNames: Map<string, number>
): { operation: BatchDesignOperation | null; detail: TranslationReportDetail } {
  const nodeName = node.name || node.id;

  // Generate a safe, globally-unique variable name.
  const baseName = generateVarName(node);
  let counter = usedNames.get(baseName) ?? 0;
  let varName = counter === 0 ? baseName : `${baseName}_${counter}`;
  while (usedNames.has(varName)) {
    counter += 1;
    varName = `${baseName}_${counter}`;
  }
  usedNames.set(baseName, counter + 1);
  usedNames.set(varName, 1);

  // Resolve parent: use the mapped variable name if parentId exists, else document root
  const parent = node.parentId && nodeMap.has(node.parentId)
    ? nodeMap.get(node.parentId)!
    : "document";
  const props = buildNodeProperties(node);
  const propsStr = objectToString(props);
  const operation = `${varName}=I(${parent}, ${propsStr})`;

  nodeMap.set(node.id, varName);

  // Detect capability downgrades (e.g., grid → flex)
  let translationOperation: "translated" | "approximated" | "skipped" = "translated";
  let reason: string | undefined;
  let suggestion: string | undefined;

  if (node.type === "frame") {
    const frame = node as TencilFrame;
    if (frame.layout === "grid") {
      translationOperation = "approximated";
      reason = "Grid layout not supported in Pencil — exported as flex";
      suggestion = "Use flex layout in Penpot for lossless export, or accept layout approximation";
    }
  }

  return {
    operation,
    detail: {
      nodeId: node.id,
      nodeName,
      operation: translationOperation,
      reason,
      suggestion,
    },
  };
}

/**
 * Build the properties object for a node suitable for Pencil MCP.
 */
function buildNodeProperties(node: TencilNodeBase): Record<string, unknown> {
  const props: Record<string, unknown> = {
    type: node.type,
  };

  // Geometry
  if (node.x !== undefined) props.x = node.x;
  if (node.y !== undefined) props.y = node.y;
  if (node.width !== undefined) props.width = node.width;
  if (node.height !== undefined) props.height = node.height;
  if (node.rotation !== undefined && node.rotation !== 0) props.rotation = node.rotation;

  // Type-specific properties
  if (node.type === "frame") {
    const frame = node as TencilFrame;
    // Grid layouts are approximated as flex (Pencil doesn't support grid)
    if (frame.layout === "grid") {
      props.layout = "flex";  // Downgrade to flex
    } else if (frame.layout) {
      props.layout = frame.layout;
    }
    if (frame.flexDirection) props.flexDirection = frame.flexDirection;
    if (frame.gap !== undefined) props.gap = frame.gap;
    // Map alignment properties
    if (frame.justifyContent) props.justifyContent = frame.justifyContent;
    if (frame.alignItems) props.alignItems = frame.alignItems;
    if (frame.padding !== undefined) props.padding = frame.padding;
    if (frame.fillColor) props.fillColor = frame.fillColor;
    if (frame.strokeColor) props.strokeColor = frame.strokeColor;
    if (frame.strokeThickness !== undefined) props.strokeThickness = frame.strokeThickness;
    if (frame.cornerRadius !== undefined) props.cornerRadius = frame.cornerRadius;
  } else if (node.type === "text") {
    const text = node as TencilText;
    if (text.content) props.content = text.content;
    if (text.fontFamily) props.fontFamily = text.fontFamily;
    if (text.fontSize !== undefined) props.fontSize = text.fontSize;
    if (text.fontWeight !== undefined) props.fontWeight = text.fontWeight;
    if (text.lineHeight !== undefined) props.lineHeight = text.lineHeight;
    if (text.textAlign) props.textAlign = text.textAlign;
    if (text.textColor) props.textColor = text.textColor;
  } else if (node.type === "rectangle") {
    const rect = node as TencilRectangle;
    if (rect.fillColor) props.fillColor = rect.fillColor;
    if (rect.strokeColor) props.strokeColor = rect.strokeColor;
    if (rect.strokeThickness !== undefined) props.strokeThickness = rect.strokeThickness;
    if (rect.cornerRadius !== undefined) props.cornerRadius = rect.cornerRadius;
    if (rect.opacity !== undefined) props.opacity = rect.opacity;
  } else if (node.type === "ellipse") {
    const ellipse = node as TencilEllipse;
    if (ellipse.fillColor) props.fillColor = ellipse.fillColor;
    if (ellipse.strokeColor) props.strokeColor = ellipse.strokeColor;
    if (ellipse.strokeThickness !== undefined) props.strokeThickness = ellipse.strokeThickness;
    if (ellipse.opacity !== undefined) props.opacity = ellipse.opacity;
  }

  return props;
}

/**
 * Generate a safe JavaScript variable name from a node ID or name.
 * Examples: "frame-1" → "frame_1", "Button Text" → "button_text"
 * Names that look like raw UUIDs fall back to "node_<type>".
 */
function generateVarName(node: TencilNodeBase): string {
  const source = node.name || node.id;
  // Strip leading/trailing spaces, lowercase, replace non-alphanumeric with _
  let name = source
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);

  // If the result starts with a digit, prepend the node type
  if (/^[0-9]/.test(name)) {
    name = (node.type || "node") + "_" + name;
  }

  // If empty or looks like a raw UUID (all hex + underscores, length > 20), use type-based name
  if (!name || /^[0-9a-f_]{20,}$/.test(name)) {
    name = node.type || "node";
  }

  return name;
}

/**
 * Convert an object to a string representation suitable for batch_design syntax.
 * Example: {x: 0, y: 10, fillColor: "#ffffff"} → "{x:0, y:10, fillColor:\"#ffffff\"}"
 */
function objectToString(obj: Record<string, unknown>): string {
  const pairs = Object.entries(obj).map(([key, value]) => {
    const valStr = valueToString(value);
    return `${key}:${valStr}`;
  });
  return `{${pairs.join(", ")}}`;
}

/**
 * Convert a JavaScript value to a string representation for batch_design.
 */
function valueToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "string") {
    // Escape quotes
    const escaped = value.replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const items = value.map(valueToString).join(", ");
    return `[${items}]`;
  }
  if (typeof value === "object") {
    return objectToString(value as Record<string, unknown>);
  }
  return String(value);
}

export default tencilToPencil;
