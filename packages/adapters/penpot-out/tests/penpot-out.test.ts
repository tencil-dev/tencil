import { describe, it, expect } from "vitest";
import { tencilToPenpotFile } from "../src/index.js";
import type { TencilDocument } from "@tencil/core";
import zlib from "zlib";
import { promisify } from "util";

const inflateRaw = promisify(zlib.inflateRaw);

// ─── ZIP parser for test assertions ───────────────────────────────────────────

interface ZipEntry {
  name: string;
  data: Buffer;
}

async function parseZip(buf: Buffer): Promise<Map<string, ZipEntry>> {
  // Find EOCD
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error("No EOCD found");

  const cdSize = buf.readUInt32LE(eocdOffset + 12);
  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  const numEntries = buf.readUInt16LE(eocdOffset + 8);

  const entries = new Map<string, ZipEntry>();
  let pos = cdOffset;

  for (let i = 0; i < numEntries; i++) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) throw new Error("Bad CD signature");
    const compressedSize = buf.readUInt32LE(pos + 20);
    const uncompressedSize = buf.readUInt32LE(pos + 24);
    const nameLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const localOffset = buf.readUInt32LE(pos + 42);
    const name = buf.subarray(pos + 46, pos + 46 + nameLen).toString("utf-8");
    pos += 46 + nameLen + extraLen + commentLen;

    // Read from local file header
    const lf = localOffset;
    const compression = buf.readUInt16LE(lf + 8);
    const lfNameLen = buf.readUInt16LE(lf + 26);
    const lfExtraLen = buf.readUInt16LE(lf + 28);
    const dataStart = lf + 30 + lfNameLen + lfExtraLen;
    const compressedData = buf.subarray(dataStart, dataStart + compressedSize);

    let data: Buffer;
    if (compression === 0) {
      data = Buffer.from(compressedData);
    } else if (compression === 8) {
      data = Buffer.from(await inflateRaw(compressedData));
    } else {
      throw new Error(`Unsupported compression: ${compression}`);
    }

    entries.set(name, { name, data });
  }

  return entries;
}

// ─── Test documents ───────────────────────────────────────────────────────────

function makeDoc(overrides: Partial<TencilDocument> = {}): TencilDocument {
  return {
    tencil: "1.0",
    domain: "ui",
    id: "test-doc",
    name: "Test Design",
    nodes: [],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("@tencil/adapter-penpot-out", () => {
  describe("tencilToPenpotFile — ZIP structure", () => {
    it("should return a Buffer", async () => {
      const buf = await tencilToPenpotFile(makeDoc());
      expect(Buffer.isBuffer(buf)).toBe(true);
    });

    it("should produce a valid ZIP with file metadata, page, and root canvas", async () => {
      const doc = makeDoc();
      const buf = await tencilToPenpotFile(doc);
      const entries = await parseZip(buf);

      // Should have file metadata, page metadata, and root canvas
      expect(entries.size).toBeGreaterThanOrEqual(3);

      // File metadata entry should exist
      const fileMetaEntry = [...entries.keys()].find(k => k.match(/^files\/[^/]+\.json$/) && !k.includes("/pages/"));
      expect(fileMetaEntry).toBeTruthy();

      const fileMeta = JSON.parse(entries.get(fileMetaEntry!)!.data.toString());
      expect(fileMeta.name).toBe("Test Design");
      expect(fileMeta.version).toBe(67);
    });

    it("should use doc.name as file name by default", async () => {
      const doc = makeDoc({ name: "My Design" });
      const buf = await tencilToPenpotFile(doc);
      const entries = await parseZip(buf);

      const fileMetaEntry = [...entries.keys()].find(k => k.match(/^files\/[^/]+\.json$/) && !k.includes("/pages/"));
      const fileMeta = JSON.parse(entries.get(fileMetaEntry!)!.data.toString());
      expect(fileMeta.name).toBe("My Design");
    });

    it("should use options.fileName when provided", async () => {
      const doc = makeDoc({ name: "Doc Name" });
      const buf = await tencilToPenpotFile(doc, { fileName: "Override Name" });
      const entries = await parseZip(buf);

      const fileMetaEntry = [...entries.keys()].find(k => k.match(/^files\/[^/]+\.json$/) && !k.includes("/pages/"));
      const fileMeta = JSON.parse(entries.get(fileMetaEntry!)!.data.toString());
      expect(fileMeta.name).toBe("Override Name");
    });

    it("should include root canvas with node IDs in shapes[]", async () => {
      const doc = makeDoc({
        nodes: [
          { id: "node-001", type: "rectangle", name: "Box", x: 0, y: 0, width: 100, height: 100 } as any,
        ],
      });
      const buf = await tencilToPenpotFile(doc);
      const entries = await parseZip(buf);

      const rootEntry = [...entries.keys()].find(k => k.includes("00000000-0000-0000-0000-000000000000"));
      expect(rootEntry).toBeTruthy();

      const root = JSON.parse(entries.get(rootEntry!)!.data.toString());
      expect(root.shapes).toContain("node-001");
      expect(root.type).toBe("frame");
    });
  });

  describe("tencilToPenpotFile — shape conversion", () => {
    it("should convert a rectangle node to type=rect", async () => {
      const doc = makeDoc({
        nodes: [{
          id: "rect-001", type: "rectangle", name: "Card",
          x: 10, y: 20, width: 200, height: 100,
          fillColor: "#3b82f6", strokeColor: "#1d4ed8", strokeThickness: 2,
          cornerRadius: 8, opacity: 0.9,
        } as any],
      });
      const buf = await tencilToPenpotFile(doc);
      const entries = await parseZip(buf);

      const shapeEntry = [...entries.keys()].find(k => k.includes("rect-001"));
      expect(shapeEntry).toBeTruthy();

      const shape = JSON.parse(entries.get(shapeEntry!)!.data.toString());
      expect(shape.type).toBe("rect");
      expect(shape.name).toBe("Card");
      expect(shape.x).toBe(10);
      expect(shape.y).toBe(20);
      expect(shape.width).toBe(200);
      expect(shape.height).toBe(100);
      expect(shape.fills[0].fillColor).toBe("#3B82F6");
      expect(shape.fills[0].fillOpacity).toBe(1);
      expect(shape.strokes[0].strokeColor).toBe("#1D4ED8");
      expect(shape.strokes[0].strokeWidth).toBe(2);
      expect(shape.r1).toBe(8);
      expect(shape.r2).toBe(8);
      expect(shape.r3).toBe(8);
      expect(shape.r4).toBe(8);
      expect(shape.opacity).toBe(0.9);
    });

    it("should convert an ellipse node to type=circle", async () => {
      const doc = makeDoc({
        nodes: [{
          id: "ellipse-001", type: "ellipse", name: "Avatar",
          x: 0, y: 0, width: 64, height: 64,
          fillColor: "#ef4444",
        } as any],
      });
      const buf = await tencilToPenpotFile(doc);
      const entries = await parseZip(buf);

      const shapeEntry = [...entries.keys()].find(k => k.includes("ellipse-001"));
      expect(shapeEntry).toBeTruthy();

      const shape = JSON.parse(entries.get(shapeEntry!)!.data.toString());
      expect(shape.type).toBe("circle");
      expect(shape.fills[0].fillColor).toBe("#EF4444");
    });

    it("should convert a frame node with flex layout", async () => {
      const doc = makeDoc({
        nodes: [{
          id: "frame-001", type: "frame", name: "Container",
          x: 0, y: 0, width: 320, height: 480,
          fillColor: "#ffffff",
          layout: "flex",
          flexDirection: "column",
          gap: 16,
        } as any],
      });
      const buf = await tencilToPenpotFile(doc);
      const entries = await parseZip(buf);

      const shapeEntry = [...entries.keys()].find(k => k.includes("frame-001"));
      const shape = JSON.parse(entries.get(shapeEntry!)!.data.toString());
      expect(shape.type).toBe("frame");
      expect(shape.layout).toBe("flex");
      expect(shape.layoutFlexDir).toBe("column");
      expect(shape.layoutGap.rowGap).toBe(16);
      expect(shape.layoutGap.columnGap).toBe(16);
    });

    it("should convert a text node with rich content structure", async () => {
      const doc = makeDoc({
        nodes: [{
          id: "text-001", type: "text", name: "Heading",
          x: 0, y: 0, width: 200, height: 40,
          content: "Hello World",
          fontFamily: "Inter",
          fontSize: 24,
          fontWeight: 600,
          lineHeight: 1.5,
          textColor: "#111827",
          textAlign: "center",
        } as any],
      });
      const buf = await tencilToPenpotFile(doc);
      const entries = await parseZip(buf);

      const shapeEntry = [...entries.keys()].find(k => k.includes("text-001"));
      const shape = JSON.parse(entries.get(shapeEntry!)!.data.toString());
      expect(shape.type).toBe("text");
      expect(shape.fills).toEqual([]);

      const para = shape.content.children[0].children[0];
      expect(para.textAlign).toBe("center");

      const textNode = para.children[0];
      expect(textNode.text).toBe("Hello World");
      expect(textNode.fontFamily).toBe("Inter");
      expect(textNode.fontSize).toBe("24");
      expect(textNode.fontWeight).toBe("600");
      expect(textNode.lineHeight).toBe("1.5");
    });

    it("should include selrect and points in all shapes", async () => {
      const doc = makeDoc({
        nodes: [{
          id: "rect-002", type: "rectangle", name: "Test",
          x: 10, y: 20, width: 100, height: 50,
        } as any],
      });
      const buf = await tencilToPenpotFile(doc);
      const entries = await parseZip(buf);

      const shapeEntry = [...entries.keys()].find(k => k.includes("rect-002"));
      const shape = JSON.parse(entries.get(shapeEntry!)!.data.toString());

      expect(shape.selrect).toEqual({ x: 10, y: 20, width: 100, height: 50, x1: 10, y1: 20, x2: 110, y2: 70 });
      expect(shape.points).toHaveLength(4);
      expect(shape.transform).toBeDefined();
      expect(shape.transformInverse).toBeDefined();
      expect(shape.parentId).toBeDefined();
      expect(shape.frameId).toBeDefined();
    });

    it("should handle mixed corner radii as tuple [r1,r2,r3,r4]", async () => {
      const doc = makeDoc({
        nodes: [{
          id: "rect-003", type: "rectangle", name: "MixedRadius",
          x: 0, y: 0, width: 100, height: 100,
          cornerRadius: [4, 8, 4, 8],
        } as any],
      });
      const buf = await tencilToPenpotFile(doc);
      const entries = await parseZip(buf);

      const shapeEntry = [...entries.keys()].find(k => k.includes("rect-003"));
      const shape = JSON.parse(entries.get(shapeEntry!)!.data.toString());
      expect(shape.r1).toBe(4);
      expect(shape.r2).toBe(8);
      expect(shape.r3).toBe(4);
      expect(shape.r4).toBe(8);
    });

    it("should produce a shape count matching node count + root canvas", async () => {
      const doc = makeDoc({
        nodes: [
          { id: "n1", type: "rectangle", name: "A", x: 0, y: 0, width: 10, height: 10 } as any,
          { id: "n2", type: "ellipse", name: "B", x: 0, y: 0, width: 10, height: 10 } as any,
          { id: "n3", type: "text", name: "C", x: 0, y: 0, width: 10, height: 10, content: "Hi" } as any,
        ],
      });
      const buf = await tencilToPenpotFile(doc);
      const entries = await parseZip(buf);

      // 1 file meta + 1 page meta + 1 root canvas + 3 shapes = 6 entries total
      // But entries may differ — shape files are under pages/
      const shapeEntries = [...entries.keys()].filter(k => k.match(/pages\/[^/]+\/[^/]+\.json$/) && !k.match(/pages\/[^/]+\.json$/));
      // 1 root canvas + 3 shapes
      expect(shapeEntries.length).toBe(4);
    });
  });
});
