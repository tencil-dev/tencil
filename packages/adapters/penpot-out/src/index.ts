/**
 * @tencil/adapter-penpot-out
 *
 * Converts a TencilDocument to a native .penpot ZIP file.
 * The output can be imported into Penpot via File → Import.
 *
 * Usage:
 * ```typescript
 * import { tencilToPenpotFile } from "@tencil/adapter-penpot-out";
 * import fs from "fs";
 *
 * const buf = await tencilToPenpotFile(tencilDoc);
 * fs.writeFileSync("output.penpot", buf);
 * ```
 */

import zlib from "zlib";
import { promisify } from "util";
import { randomUUID } from "crypto";
import type { TencilDocument, TencilNodeBase } from "@tencil/core";
import type { TencilFrame, TencilText, TencilRectangle, TencilEllipse } from "@tencil/schema-ui";
import type { TencilToPenpotOptions } from "./types.js";

const deflateRaw = promisify(zlib.deflateRaw);

// ─── UUID generator ───────────────────────────────────────────────────────────

function uuid(): string {
  return randomUUID();
}

// ─── Node → Penpot shape ──────────────────────────────────────────────────────

const IDENTITY_TRANSFORM = { a: 1.0, b: 0.0, c: 0.0, d: 1.0, e: 0.0, f: 0.0 };

function makeSelrect(x: number, y: number, w: number, h: number) {
  return {
    x, y, width: w, height: h,
    x1: x, y1: y,
    x2: x + w, y2: y + h,
  };
}

function makePoints(x: number, y: number, w: number, h: number) {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
}

function hexToFill(hex: string | undefined, opacity?: number): object[] {
  if (!hex) return [];
  return [{ fillColor: hex.toUpperCase(), fillOpacity: opacity ?? 1 }];
}

function hexToStroke(hex: string | undefined, thickness?: number): object[] {
  if (!hex) return [];
  return [{
    strokeColor: hex.toUpperCase(),
    strokeOpacity: 1,
    strokeWidth: thickness ?? 1,
    strokeStyle: "solid",
    strokePosition: "center",
  }];
}

function cornerRadiusToR(cr: number | [number, number, number, number] | undefined) {
  if (cr === undefined) return { r1: 0, r2: 0, r3: 0, r4: 0 };
  if (typeof cr === "number") return { r1: cr, r2: cr, r3: cr, r4: cr };
  return { r1: cr[0], r2: cr[1], r3: cr[2], r4: cr[3] };
}

function convertNodeToPenpotShape(
  node: TencilNodeBase,
  parentId: string,
  frameId: string,
  pageId: string
): object {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const w = node.width ?? 100;
  const h = node.height ?? 100;

  const base = {
    id: node.id,
    name: node.name ?? node.id,
    x, y,
    width: w,
    height: h,
    rotation: node.rotation ?? 0,
    selrect: makeSelrect(x, y, w, h),
    points: makePoints(x, y, w, h),
    transform: IDENTITY_TRANSFORM,
    transformInverse: IDENTITY_TRANSFORM,
    parentId,
    frameId,
    pageId,
    flipX: null,
    flipY: null,
    proportionLock: false,
    proportion: 1.0,
    blocked: false,
    hidden: false,
    strokes: [],
    fills: [],
    shapes: [],
  };

  const type = node.type;

  if (type === "frame") {
    const frame = node as TencilFrame;
    const cr = cornerRadiusToR(frame.cornerRadius);
    const shapeObj: Record<string, unknown> = {
      ...base,
      type: "frame",
      fills: hexToFill(frame.fillColor),
      strokes: hexToStroke(frame.strokeColor, frame.strokeThickness),
      ...cr,
      hideFillOnExport: false,
      showContent: true,
      clipContent: true,
    };

    if (frame.layout === "flex") {
      shapeObj.layout = "flex";
      const dir = frame.flexDirection ?? "row";
      shapeObj.layoutFlexDir = dir === "column" ? "column" : "row";
      if (frame.gap !== undefined) {
        shapeObj.layoutGap = { rowGap: frame.gap, columnGap: frame.gap };
      }
    }

    return shapeObj;
  }

  if (type === "rectangle") {
    const rect = node as TencilRectangle;
    const cr = cornerRadiusToR(rect.cornerRadius);
    return {
      ...base,
      type: "rect",
      fills: hexToFill(rect.fillColor),
      strokes: hexToStroke(rect.strokeColor, rect.strokeThickness),
      opacity: rect.opacity ?? 1,
      ...cr,
    };
  }

  if (type === "ellipse") {
    const ellipse = node as TencilEllipse;
    return {
      ...base,
      type: "circle",
      fills: hexToFill(ellipse.fillColor),
      strokes: hexToStroke(ellipse.strokeColor, ellipse.strokeThickness),
      opacity: ellipse.opacity ?? 1,
    };
  }

  if (type === "text") {
    const text = node as TencilText;
    const textNode = {
      text: text.content ?? "",
      fontFamily: text.fontFamily ?? "sourcesanspro",
      fontSize: String(text.fontSize ?? 14),
      fontWeight: String(text.fontWeight ?? 400),
      lineHeight: text.lineHeight !== undefined ? String(text.lineHeight) : "1.2",
      fills: hexToFill(text.textColor ?? "#000000"),
    };

    return {
      ...base,
      type: "text",
      fills: [],
      content: {
        type: "root",
        children: [
          {
            type: "paragraph-set",
            children: [
              {
                type: "paragraph",
                children: [textNode],
                textAlign: text.textAlign ?? "left",
              },
            ],
          },
        ],
      },
    };
  }

  // Unknown type — emit as a rect
  return { ...base, type: "rect" };
}

// ─── ZIP writer ───────────────────────────────────────────────────────────────

interface ZipFileEntry {
  name: string;
  data: Buffer;
  compressed: Buffer;
  crc32: number;
  localOffset: number;
}

/** Simple CRC32 implementation */
function crc32(buf: Buffer): number {
  const table = makeCrc32Table();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

let _crc32Table: Uint32Array | null = null;
function makeCrc32Table(): Uint32Array {
  if (_crc32Table) return _crc32Table;
  _crc32Table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    _crc32Table[i] = c;
  }
  return _crc32Table;
}

async function buildZip(files: Array<{ name: string; data: Buffer }>): Promise<Buffer> {
  const entries: ZipFileEntry[] = [];
  let localOffset = 0;
  const localParts: Buffer[] = [];

  for (const { name, data } of files) {
    const nameBuf = Buffer.from(name, "utf-8");
    const compressed = Buffer.from(await deflateRaw(data));
    const checksum = crc32(data);

    // Local file header
    const lf = Buffer.alloc(30);
    lf.writeUInt32LE(0x04034b50, 0);         // signature
    lf.writeUInt16LE(20, 4);                   // version needed
    lf.writeUInt16LE(0, 6);                    // flags
    lf.writeUInt16LE(8, 8);                    // compression: deflate
    lf.writeUInt16LE(0, 10);                   // mod time
    lf.writeUInt16LE(0, 12);                   // mod date
    lf.writeUInt32LE(checksum, 14);            // CRC32
    lf.writeUInt32LE(compressed.length, 18);   // compressed size
    lf.writeUInt32LE(data.length, 22);         // uncompressed size
    lf.writeUInt16LE(nameBuf.length, 26);      // file name length
    lf.writeUInt16LE(0, 28);                   // extra field length

    const localEntry = Buffer.concat([lf, nameBuf, compressed]);
    entries.push({ name, data, compressed, crc32: checksum, localOffset });
    localOffset += localEntry.length;
    localParts.push(localEntry);
  }

  // Central directory
  const cdParts: Buffer[] = [];
  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf-8");
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);          // signature
    cd.writeUInt16LE(20, 4);                   // version made by
    cd.writeUInt16LE(20, 6);                   // version needed
    cd.writeUInt16LE(0, 8);                    // flags
    cd.writeUInt16LE(8, 10);                   // compression: deflate
    cd.writeUInt16LE(0, 12);                   // mod time
    cd.writeUInt16LE(0, 14);                   // mod date
    cd.writeUInt32LE(entry.crc32, 16);         // CRC32
    cd.writeUInt32LE(entry.compressed.length, 20); // compressed size
    cd.writeUInt32LE(entry.data.length, 24);   // uncompressed size
    cd.writeUInt16LE(nameBuf.length, 28);      // file name length
    cd.writeUInt16LE(0, 30);                   // extra field length
    cd.writeUInt16LE(0, 32);                   // comment length
    cd.writeUInt16LE(0, 34);                   // disk number start
    cd.writeUInt16LE(0, 36);                   // internal attributes
    cd.writeUInt32LE(0, 38);                   // external attributes
    cd.writeUInt32LE(entry.localOffset, 42);   // local header offset
    cdParts.push(Buffer.concat([cd, nameBuf]));
  }

  const cdBuf = Buffer.concat(cdParts);

  // End of central directory
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(localOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, cdBuf, eocd]);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert a TencilDocument to a native .penpot ZIP file.
 *
 * @param doc     - Valid TencilDocument to convert
 * @param options - Optional overrides for file name and page name
 * @returns Buffer containing the .penpot ZIP file (write to disk with fs.writeFileSync)
 */
export async function tencilToPenpotFile(
  doc: TencilDocument,
  options?: TencilToPenpotOptions
): Promise<Buffer> {
  const fileId = uuid();
  const pageId = uuid();
  const fileName = options?.fileName ?? doc.name ?? doc.id;
  const pageName = options?.pageName ?? "Page 1";
  const ROOT_CANVAS_ID = "00000000-0000-0000-0000-000000000000";

  // File metadata
  const fileMeta = {
    id: fileId,
    name: fileName,
    version: 67,
    features: [],
    projectId: uuid(),
    teamId: uuid(),
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    options: { componentsV2: true },
    migrations: [],
  };

  // Page metadata
  const pageMeta = {
    id: pageId,
    name: pageName,
    index: 0,
    guides: {},
  };

  // Root canvas shape
  const rootCanvas = {
    id: ROOT_CANVAS_ID,
    name: "Root Frame",
    type: "frame",
    x: 0, y: 0,
    width: 0.01, height: 0.01,
    rotation: 0,
    selrect: { x: 0, y: 0, width: 0.01, height: 0.01, x1: 0, y1: 0, x2: 0.01, y2: 0.01 },
    points: [{ x: 0, y: 0 }, { x: 0.01, y: 0 }, { x: 0.01, y: 0.01 }, { x: 0, y: 0.01 }],
    transform: IDENTITY_TRANSFORM,
    transformInverse: IDENTITY_TRANSFORM,
    parentId: ROOT_CANVAS_ID,
    frameId: ROOT_CANVAS_ID,
    pageId,
    flipX: null,
    flipY: null,
    hideFillOnExport: false,
    proportionLock: false,
    proportion: 1.0,
    blocked: false,
    hidden: false,
    strokes: [],
    fills: [{ fillColor: "#FFFFFF", fillOpacity: 1 }],
    shapes: doc.nodes.map((n) => n.id),
  };

  // Collect all ZIP file entries
  const zipFiles: Array<{ name: string; data: Buffer }> = [];

  // File metadata
  zipFiles.push({
    name: `files/${fileId}.json`,
    data: Buffer.from(JSON.stringify(fileMeta, null, 2)),
  });

  // Page metadata
  zipFiles.push({
    name: `files/${fileId}/pages/${pageId}.json`,
    data: Buffer.from(JSON.stringify(pageMeta, null, 2)),
  });

  // Root canvas
  zipFiles.push({
    name: `files/${fileId}/pages/${pageId}/${ROOT_CANVAS_ID}.json`,
    data: Buffer.from(JSON.stringify(rootCanvas, null, 2)),
  });

  // Shape files
  for (const node of doc.nodes) {
    const shape = convertNodeToPenpotShape(node, ROOT_CANVAS_ID, ROOT_CANVAS_ID, pageId);
    zipFiles.push({
      name: `files/${fileId}/pages/${pageId}/${node.id}.json`,
      data: Buffer.from(JSON.stringify(shape, null, 2)),
    });
  }

  return buildZip(zipFiles);
}

export default tencilToPenpotFile;
