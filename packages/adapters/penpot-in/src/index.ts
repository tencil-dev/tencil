/**
 * @tencil/adapter-penpot-in
 *
 * Converts Penpot design exports to Tencil format.
 *
 * Usage:
 * ```typescript
 * import { penpotToTencil } from "@tencil/adapter-penpot-in";
 *
 * const penpotExport = JSON.parse(fs.readFileSync("design.json"));
 * const tencilDoc = penpotToTencil(penpotExport, { id: "my-design" });
 * ```
 */

import type { TencilDocument, TencilNodeBase } from "@tencil/core";
import type {
  TencilFrame,
  TencilText,
  TencilRectangle,
  TencilEllipse,
} from "@tencil/schema-ui";
import type { PenpotNode, PenpotExport } from "./types.js";

interface BaseNodeProps {
  id: string;
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

/**
 * Convert Penpot export JSON to TencilDocument.
 * Handles: frames, text, rectangles, ellipses, fill colors, flex layouts.
 *
 * @param penpotData - Penpot export JSON (frames, shapes, etc.)
 * @param options - Document metadata (id, name)
 * @returns Valid TencilDocument ready for validation
 */
export function penpotToTencil(
  penpotData: unknown,
  options?: { id?: string; name?: string }
): TencilDocument {
  // Extract Penpot export
  const penpot = penpotData as PenpotExport;

  // Generate document ID
  const docId = options?.id || penpot.id || `penpot-${Date.now()}`;
  const docName = options?.name || penpot.name || "Penpot Design";

  // Collect all nodes (convert Penpot shapes to Tencil nodes)
  const nodes: TencilNodeBase[] = [];
  const allShapes = penpot.objects || penpot.shapes || [];

  for (const shape of allShapes) {
    convertPenpotNodeToTencil(shape, nodes);
  }

  // Build and return TencilDocument
  return {
    tencil: "1.0",
    domain: "ui",
    id: docId,
    name: docName,
    nodes,
  };
}

/**
 * Recursively convert a Penpot node and its children to Tencil format.
 * Appends to the nodes array. Passes parentId to preserve hierarchy.
 */
function convertPenpotNodeToTencil(
  penpotNode: PenpotNode,
  nodes: TencilNodeBase[],
  parentId?: string
): void {
  // Skip if node has no ID
  if (!penpotNode.id) return;

  const tencilNode = penpotNodeToTencilNode(penpotNode, parentId);
  if (tencilNode) {
    nodes.push(tencilNode);
  }

  // Recursively process children, passing this node's ID as their parent
  if (penpotNode.shapes && Array.isArray(penpotNode.shapes)) {
    for (const child of penpotNode.shapes) {
      convertPenpotNodeToTencil(child, nodes, penpotNode.id);
    }
  }
}

/**
 * Convert a single Penpot node to a Tencil node based on its type.
 */
function penpotNodeToTencilNode(penpotNode: PenpotNode, parentId?: string): TencilNodeBase | null {
  const nodeType = penpotNode.type?.toLowerCase() || "";

  // Base properties (common to all nodes)
  const baseProps = {
    id: penpotNode.id,
    name: penpotNode.name,
    x: penpotNode.x,
    y: penpotNode.y,
    width: penpotNode.width,
    height: penpotNode.height,
    rotation: penpotNode.rotation,
    ...(parentId ? { parentId } : {}),
  };

  // Convert based on type
  if (nodeType === "frame" || nodeType === "board") {
    return convertPenpotFrame(penpotNode, baseProps);
  } else if (nodeType === "text") {
    return convertPenpotText(penpotNode, baseProps);
  } else if (nodeType === "rect" || nodeType === "rectangle") {
    return convertPenpotRectangle(penpotNode, baseProps);
  } else if (nodeType === "ellipse" || nodeType === "circle") {
    return convertPenpotEllipse(penpotNode, baseProps);
  }

  // Default: treat as rectangle
  return convertPenpotRectangle(penpotNode, baseProps);
}

/**
 * Convert a Penpot frame to TencilFrame.
 * Handles flex layout with alignment properties.
 */
function convertPenpotFrame(
  penpotNode: PenpotNode,
  baseProps: BaseNodeProps
): TencilFrame {
  const frame: TencilFrame = {
    ...baseProps,
    type: "frame",
  };

  // Flex layout (grid support is for future-proofing; Penpot JSON API doesn't export grid yet)
  if (penpotNode.layout === "flex") {
    frame.layout = "flex";
    frame.flexDirection = (penpotNode["flex-direction"] || "row") as "row" | "column";
    frame.gap = penpotNode.gap;

    // Map alignment properties from Penpot's justify-content / align-content
    if (penpotNode["justify-content"]) {
      const jc = penpotNode["justify-content"];
      // Map Penpot values to Tencil values
      if (jc === "flex-start") frame.justifyContent = "start";
      else if (jc === "flex-end") frame.justifyContent = "end";
      else if (jc === "center") frame.justifyContent = "center";
      else if (jc === "space-between") frame.justifyContent = "space-between";
      else if (jc === "space-around") frame.justifyContent = "space-around";
    }

    if (penpotNode["align-content"]) {
      const ac = penpotNode["align-content"];
      // Map Penpot align-content to align-items (common usage)
      if (ac === "flex-start") frame.alignItems = "start";
      else if (ac === "flex-end") frame.alignItems = "end";
      else if (ac === "center") frame.alignItems = "center";
      else if (ac === "stretch") frame.alignItems = "stretch";
    }
  }

  // Colors
  if (penpotNode.fills && penpotNode.fills.length > 0) {
    frame.fillColor = colorToHex(penpotNode.fills[0]);
  }

  if (penpotNode.strokes && penpotNode.strokes.length > 0) {
    frame.strokeColor = colorToHex(penpotNode.strokes[0].color);
    frame.strokeThickness = penpotNode.strokes[0].width;
  }

  // Corner radius
  if (penpotNode.rx) {
    frame.cornerRadius = penpotNode.rx;
  }

  return frame;
}

/**
 * Convert a Penpot text node to TencilText.
 */
function convertPenpotText(
  penpotNode: PenpotNode,
  baseProps: BaseNodeProps
): TencilText {
  const text: TencilText = {
    ...baseProps,
    type: "text",
    content: penpotNode.content || "",
  };

  text.fontFamily = penpotNode["font-family"];
  text.fontSize = penpotNode["font-size"];

  // Font weight: handle both number and string
  const fontWeight = penpotNode["font-weight"];
  if (typeof fontWeight === "string") {
    const parsed = parseInt(fontWeight, 10);
    text.fontWeight = isNaN(parsed) ? undefined : parsed;
  } else if (typeof fontWeight === "number") {
    text.fontWeight = fontWeight;
  }

  text.lineHeight = penpotNode["line-height"];
  text.textAlign = (penpotNode["text-align"] || "left") as
    | "left"
    | "center"
    | "right"
    | "justify";

  // Text color
  if (penpotNode.color) {
    text.textColor = colorToHex(penpotNode.color);
  }

  return text;
}

/**
 * Convert a Penpot rectangle to TencilRectangle.
 */
function convertPenpotRectangle(
  penpotNode: PenpotNode,
  baseProps: BaseNodeProps
): TencilRectangle {
  const rect: TencilRectangle = {
    ...baseProps,
    type: "rectangle",
  };

  if (penpotNode.fills && penpotNode.fills.length > 0) {
    rect.fillColor = colorToHex(penpotNode.fills[0]);
  }

  if (penpotNode.strokes && penpotNode.strokes.length > 0) {
    rect.strokeColor = colorToHex(penpotNode.strokes[0].color);
    rect.strokeThickness = penpotNode.strokes[0].width;
  }

  if (penpotNode.rx) {
    rect.cornerRadius = penpotNode.rx;
  }

  if (penpotNode.opacity !== undefined) {
    rect.opacity = penpotNode.opacity;
  }

  return rect;
}

/**
 * Convert a Penpot ellipse to TencilEllipse.
 */
function convertPenpotEllipse(
  penpotNode: PenpotNode,
  baseProps: BaseNodeProps
): TencilEllipse {
  const ellipse: TencilEllipse = {
    ...baseProps,
    type: "ellipse",
  };

  if (penpotNode.fills && penpotNode.fills.length > 0) {
    ellipse.fillColor = colorToHex(penpotNode.fills[0]);
  }

  if (penpotNode.strokes && penpotNode.strokes.length > 0) {
    ellipse.strokeColor = colorToHex(penpotNode.strokes[0].color);
    ellipse.strokeThickness = penpotNode.strokes[0].width;
  }

  if (penpotNode.opacity !== undefined) {
    ellipse.opacity = penpotNode.opacity;
  }

  return ellipse;
}

/**
 * Convert Penpot's RGBA color object to hex string.
 * Assumes Penpot uses RGB range 0-255.
 */
function colorToHex(color: { r: number; g: number; b: number; a?: number }): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  const r = toHex(color.r);
  const g = toHex(color.g);
  const b = toHex(color.b);

  return `#${r}${g}${b}`;
}

export default penpotToTencil;
