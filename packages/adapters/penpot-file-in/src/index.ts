/**
 * @tencil/adapter-penpot-file-in
 *
 * Reads a native .penpot file (ZIP archive) and converts it to a TencilDocument.
 *
 * Usage:
 * ```typescript
 * import { penpotFileToTencil } from "@tencil/adapter-penpot-file-in";
 * import fs from "fs";
 *
 * const buf = fs.readFileSync("design.penpot");
 * const tencilDoc = await penpotFileToTencil(buf, { id: "my-design" });
 * ```
 *
 * The .penpot format is a ZIP where each shape is a separate JSON file:
 *   files/<fileId>.json                           ← file metadata
 *   files/<fileId>/pages/<pageId>.json            ← page metadata
 *   files/<fileId>/pages/<pageId>/<shapeId>.json  ← one shape per file
 */

import zlib from "zlib";
import { promisify } from "util";
import type { TencilDocument, TencilNodeBase } from "@tencil/core";
import type { TencilFrame, TencilText, TencilRectangle, TencilEllipse } from "@tencil/schema-ui";
import type {
  PenpotFileMeta,
  PenpotPageMeta,
  PenpotFileShape,
  PenpotZipContents,
  PenpotTextContent,
  PenpotTextNode,
} from "./types.js";

const inflateRaw = promisify(zlib.inflateRaw);

// ─── ZIP Parser ───────────────────────────────────────────────────────────────

/**
 * ZIP parser using the central directory (reliable even when local headers
 * have bit 3 / data descriptors set, as Penpot exports do).
 *
 * Algorithm:
 * 1. Scan backwards from end of buffer for End of Central Directory record (0x06054b50)
 * 2. Read central directory entries (0x02014b50) to get name + compressed size + local header offset
 * 3. Jump to each local file header, skip to data, decompress with zlib
 */
async function parseZip(buf: Buffer): Promise<Map<string, Buffer>> {
  const entries = new Map<string, Buffer>();

  // ── Step 1: Find End of Central Directory (EOCD) ────────────────────────────
  // EOCD signature: 0x06054b50. It's at most 22 + 65535 bytes from the end.
  const EOCD_SIG = 0x06054b50;
  let eocdOffset = -1;
  const searchStart = Math.max(0, buf.length - 65536 - 22);
  for (let i = buf.length - 22; i >= searchStart; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) {
    throw new Error("Invalid ZIP: End of Central Directory record not found");
  }

  const cdOffset = buf.readUInt32LE(eocdOffset + 16); // offset of central directory
  const cdSize   = buf.readUInt32LE(eocdOffset + 12); // size of central directory

  // ── Step 2: Read central directory entries ───────────────────────────────────
  const CD_SIG = 0x02014b50;
  let cdPos = cdOffset;
  const cdEnd = cdOffset + cdSize;

  while (cdPos < cdEnd) {
    if (buf.readUInt32LE(cdPos) !== CD_SIG) break;

    const compression    = buf.readUInt16LE(cdPos + 10);
    const compressedSize = buf.readUInt32LE(cdPos + 20);
    const nameLen        = buf.readUInt16LE(cdPos + 28);
    const extraLen       = buf.readUInt16LE(cdPos + 30);
    const commentLen     = buf.readUInt16LE(cdPos + 32);
    const localOffset    = buf.readUInt32LE(cdPos + 42);

    const name = buf.slice(cdPos + 46, cdPos + 46 + nameLen).toString("utf-8");

    // ── Step 3: Jump to local file header ────────────────────────────────────
    const LF_SIG = 0x04034b50;
    if (buf.readUInt32LE(localOffset) === LF_SIG) {
      const localNameLen  = buf.readUInt16LE(localOffset + 26);
      const localExtraLen = buf.readUInt16LE(localOffset + 28);
      const dataOffset    = localOffset + 30 + localNameLen + localExtraLen;
      const compressedData = buf.slice(dataOffset, dataOffset + compressedSize);

      let data: Buffer;
      if (compression === 0) {
        data = compressedData;
      } else if (compression === 8) {
        data = Buffer.from(await inflateRaw(compressedData));
      } else {
        // Skip unknown compression methods
        cdPos += 46 + nameLen + extraLen + commentLen;
        continue;
      }

      entries.set(name, data);
    }

    cdPos += 46 + nameLen + extraLen + commentLen;
  }

  return entries;
}

// ─── .penpot structure reader ─────────────────────────────────────────────────

async function readPenpotZip(buf: Buffer): Promise<PenpotZipContents> {
  const entries = await parseZip(buf);

  // Find file metadata: files/<fileId>.json (no slash after — not a page entry)
  let fileMeta: PenpotFileMeta | null = null;
  let fileId = "";

  for (const [name] of entries) {
    // matches: files/UUID.json (exactly one level, no subpath)
    if (/^files\/[^/]+\.json$/.test(name)) {
      const raw = entries.get(name)!.toString("utf-8");
      fileMeta = JSON.parse(raw) as PenpotFileMeta;
      fileId = fileMeta.id;
      break;
    }
  }

  if (!fileMeta || !fileId) {
    throw new Error("Invalid .penpot file: missing file metadata JSON");
  }

  // Find page metadata: files/<fileId>/pages/<pageId>.json (no subpath after)
  const pages: PenpotPageMeta[] = [];
  const pagePrefix = `files/${fileId}/pages/`;

  for (const [name] of entries) {
    // matches: files/<fileId>/pages/<pageId>.json (no deeper nesting)
    if (name.startsWith(pagePrefix) && name.endsWith(".json")) {
      const relative = name.slice(pagePrefix.length);
      if (!relative.includes("/")) {
        const raw = entries.get(name)!.toString("utf-8");
        const page = JSON.parse(raw) as PenpotPageMeta;
        pages.push(page);
      }
    }
  }

  // Sort pages by index
  pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  if (pages.length === 0) {
    throw new Error("Invalid .penpot file: no pages found");
  }

  // Load all shapes for the first page (pageIndex 0 by default — caller can slice later)
  // We load all page shapes into one map; the caller picks by pageId
  const shapes = new Map<string, PenpotFileShape>();

  for (const [name, data] of entries) {
    // matches: files/<fileId>/pages/<pageId>/<shapeId>.json
    if (name.startsWith(pagePrefix) && name.endsWith(".json")) {
      const relative = name.slice(pagePrefix.length);
      if (relative.includes("/")) {
        const raw = data.toString("utf-8");
        const shape = JSON.parse(raw) as PenpotFileShape;
        shapes.set(shape.id, shape);
      }
    }
  }

  return { fileMeta, pages, shapes };
}

// ─── Shape converter ──────────────────────────────────────────────────────────

function hexToHex(color: string | undefined): string | undefined {
  if (!color) return undefined;
  // Penpot stores as "#RRGGBB" — normalize to lowercase
  return color.toLowerCase();
}

function extractTextContent(content: PenpotTextContent | string | undefined): string {
  if (!content) return "";
  if (typeof content === "string") return content;

  // Walk the rich text tree
  const parts: string[] = [];
  for (const para of content.children ?? []) {
    for (const node of para.children ?? []) {
      if (node.text) parts.push(node.text);
    }
  }
  return parts.join("");
}

function extractFirstTextNode(content: PenpotTextContent | string | undefined): PenpotTextNode | null {
  if (!content || typeof content === "string") return null;
  const para = content.children?.[0];
  if (!para) return null;
  return para.children?.[0] ?? null;
}

function convertShape(shape: PenpotFileShape): TencilNodeBase | null {
  const { id, name, type, x, y, width, height, rotation, opacity } = shape;

  if (!id) return null;

  const base = {
    id,
    name,
    ...(x !== undefined ? { x } : {}),
    ...(y !== undefined ? { y } : {}),
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(rotation !== undefined && rotation !== 0 ? { rotation } : {}),
  };

  const fillColor = shape.fills?.[0]?.fillColor
    ? hexToHex(shape.fills[0].fillColor)
    : undefined;
  const fillOpacity = shape.fills?.[0]?.fillOpacity;
  const strokeColor = shape.strokes?.[0]?.strokeColor
    ? hexToHex(shape.strokes[0].strokeColor)
    : undefined;
  const strokeThickness = shape.strokes?.[0]?.strokeWidth;

  // Corner radius: Penpot uses r1/r2/r3/r4 for individual corners
  let cornerRadius: number | [number, number, number, number] | undefined;
  const { r1, r2, r3, r4 } = shape;
  if (r1 !== undefined || r2 !== undefined || r3 !== undefined || r4 !== undefined) {
    const v1 = r1 ?? 0, v2 = r2 ?? 0, v3 = r3 ?? 0, v4 = r4 ?? 0;
    cornerRadius = v1 === v2 && v2 === v3 && v3 === v4 ? v1 : [v1, v2, v3, v4];
  }

  const nodeType = type.toLowerCase();

  if (nodeType === "frame") {
    const frame: TencilFrame = {
      ...base,
      type: "frame",
    };

    if (fillColor) frame.fillColor = fillColor;
    if (strokeColor) {
      frame.strokeColor = strokeColor;
      if (strokeThickness !== undefined) frame.strokeThickness = strokeThickness;
    }
    if (cornerRadius !== undefined) frame.cornerRadius = cornerRadius;

    // Flex layout
    if (shape.layout === "flex") {
      frame.layout = "flex";
      const dir = (shape.layoutFlexDir ?? "row").toLowerCase();
      frame.flexDirection = dir.startsWith("column") ? "column" : "row";

      const gap = shape.layoutGap;
      if (typeof gap === "number") {
        frame.gap = gap;
      } else if (gap && typeof gap === "object") {
        frame.gap = (gap as { rowGap?: number; columnGap?: number }).rowGap ?? 0;
      }
    }

    return frame;
  }

  if (nodeType === "rect") {
    const rect: TencilRectangle = {
      ...base,
      type: "rectangle",
    };
    if (fillColor) rect.fillColor = fillColor;
    if (strokeColor) {
      rect.strokeColor = strokeColor;
      if (strokeThickness !== undefined) rect.strokeThickness = strokeThickness;
    }
    if (cornerRadius !== undefined) rect.cornerRadius = cornerRadius;
    if (opacity !== undefined && opacity !== 1) rect.opacity = opacity;
    return rect;
  }

  if (nodeType === "circle") {
    const ellipse: TencilEllipse = {
      ...base,
      type: "ellipse",
    };
    if (fillColor) ellipse.fillColor = fillColor;
    if (strokeColor) {
      ellipse.strokeColor = strokeColor;
      if (strokeThickness !== undefined) ellipse.strokeThickness = strokeThickness;
    }
    if (opacity !== undefined && opacity !== 1) ellipse.opacity = opacity;
    return ellipse;
  }

  if (nodeType === "text") {
    const textContent = extractTextContent(shape.content as PenpotTextContent | string | undefined);
    const firstNode = extractFirstTextNode(shape.content as PenpotTextContent | undefined);

    const text: TencilText = {
      ...base,
      type: "text",
      content: textContent,
    };

    if (firstNode) {
      if (firstNode.fontFamily) text.fontFamily = firstNode.fontFamily;
      if (firstNode.fontSize !== undefined) {
        const fs = typeof firstNode.fontSize === "string"
          ? parseFloat(firstNode.fontSize)
          : firstNode.fontSize;
        if (!isNaN(fs)) text.fontSize = fs;
      }
      if (firstNode.fontWeight !== undefined) {
        const fw = typeof firstNode.fontWeight === "string"
          ? parseInt(firstNode.fontWeight, 10)
          : firstNode.fontWeight;
        if (!isNaN(fw)) text.fontWeight = fw;
      }
      if (firstNode.lineHeight !== undefined) {
        const lh = typeof firstNode.lineHeight === "string"
          ? parseFloat(firstNode.lineHeight)
          : firstNode.lineHeight;
        if (!isNaN(lh)) text.lineHeight = lh;
      }
      const textColor = firstNode.fillColor
        ?? firstNode.fills?.[0]?.fillColor;
      if (textColor) text.textColor = hexToHex(textColor);
    }

    return text;
  }

  // path, group, bool, etc. — represent as rectangle with geometry only
  const fallback: TencilRectangle = {
    ...base,
    type: "rectangle",
  };
  if (fillColor) fallback.fillColor = fillColor;
  if (opacity !== undefined && opacity !== 1) fallback.opacity = opacity;
  return fallback;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert a native .penpot ZIP file (as a Buffer) to a TencilDocument.
 *
 * @param zipBuffer - Raw bytes of the .penpot file
 * @param options   - Optional document metadata and page selection
 * @returns A valid TencilDocument containing all shapes from the selected page
 */
export async function penpotFileToTencil(
  zipBuffer: Buffer,
  options?: { id?: string; name?: string; pageIndex?: number }
): Promise<TencilDocument> {
  const { fileMeta, pages, shapes } = await readPenpotZip(zipBuffer);

  const pageIndex = options?.pageIndex ?? 0;
  const page = pages[pageIndex];
  if (!page) {
    throw new Error(
      `Page index ${pageIndex} out of range. File has ${pages.length} page(s).`
    );
  }

  const docId = options?.id ?? fileMeta.id ?? `penpot-${Date.now()}`;
  const docName = options?.name ?? fileMeta.name ?? "Penpot Design";

  // Convert all shapes, skipping the root canvas (00000000-...)
  const ROOT_CANVAS_ID = "00000000-0000-0000-0000-000000000000";
  const nodes: TencilNodeBase[] = [];

  for (const [shapeId, shape] of shapes) {
    if (shapeId === ROOT_CANVAS_ID) continue;
    // Only include shapes that belong to the selected page
    // (shapes map is already filtered to the page directory)
    const node = convertShape(shape);
    if (node) nodes.push(node);
  }

  return {
    tencil: "1.0",
    domain: "ui",
    id: docId,
    name: docName,
    nodes,
    metadata: {
      source: "penpot-file",
      sourcePage: page.name,
      pageId: page.id,
      fileId: fileMeta.id,
    },
  };
}

export default penpotFileToTencil;
