import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { penpotFileToTencil } from "../src/index.js";
import { parseTencilDocument } from "@tencil/core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use the real .penpot file from the repo root as a fixture
const FIXTURE_PATH = path.resolve(__dirname, "../../../../testifyah.penpot");
const hasFixture = fs.existsSync(FIXTURE_PATH);

// Minimal synthetic .penpot ZIP for unit tests (built programmatically)
// We construct a valid ZIP in memory so tests don't depend on the fixture file.
/**
 * Builds a valid ZIP buffer (with proper central directory) for testing.
 * Uses stored (no compression) for simplicity.
 */
function buildPenpotZip(shapes: Record<string, object>): Buffer {
  const fileId = "aaaaaaaa-0000-0000-0000-000000000001";
  const pageId = "bbbbbbbb-0000-0000-0000-000000000002";

  const fileMeta = { id: fileId, name: "Test Design", version: 67 };
  const pageMeta = { id: pageId, name: "Page 1", index: 0, guides: {} };

  // Collect all entries: name → data
  const rawEntries: Array<{ name: string; data: Buffer }> = [];

  rawEntries.push({
    name: `files/${fileId}.json`,
    data: Buffer.from(JSON.stringify(fileMeta)),
  });
  rawEntries.push({
    name: `files/${fileId}/pages/${pageId}.json`,
    data: Buffer.from(JSON.stringify(pageMeta)),
  });
  for (const [shapeId, shape] of Object.entries(shapes)) {
    rawEntries.push({
      name: `files/${fileId}/pages/${pageId}/${shapeId}.json`,
      data: Buffer.from(JSON.stringify(shape)),
    });
  }

  // Build local file sections and track offsets for central directory
  const localParts: Buffer[] = [];
  const cdParts: Buffer[] = [];
  const localOffsets: number[] = [];
  let localSize = 0;

  for (const { name, data } of rawEntries) {
    const nameBuf = Buffer.from(name, "utf-8");
    localOffsets.push(localSize);

    // Local file header (30 bytes)
    const lf = Buffer.alloc(30);
    lf.writeUInt32LE(0x04034b50, 0);    // signature
    lf.writeUInt16LE(20, 4);             // version needed
    lf.writeUInt16LE(0, 6);              // flags (no data descriptor)
    lf.writeUInt16LE(0, 8);              // compression: stored
    lf.writeUInt16LE(0, 10);             // mod time
    lf.writeUInt16LE(0, 12);             // mod date
    lf.writeUInt32LE(0, 14);             // CRC32 (0 for tests)
    lf.writeUInt32LE(data.length, 18);   // compressed size
    lf.writeUInt32LE(data.length, 22);   // uncompressed size
    lf.writeUInt16LE(nameBuf.length, 26);// file name length
    lf.writeUInt16LE(0, 28);             // extra field length

    const localEntry = Buffer.concat([lf, nameBuf, data]);
    localParts.push(localEntry);
    localSize += localEntry.length;

    // Central directory header (46 bytes)
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);    // signature
    cd.writeUInt16LE(20, 4);             // version made by
    cd.writeUInt16LE(20, 6);             // version needed
    cd.writeUInt16LE(0, 8);              // flags
    cd.writeUInt16LE(0, 10);             // compression: stored
    cd.writeUInt16LE(0, 12);             // mod time
    cd.writeUInt16LE(0, 14);             // mod date
    cd.writeUInt32LE(0, 16);             // CRC32
    cd.writeUInt32LE(data.length, 20);   // compressed size
    cd.writeUInt32LE(data.length, 24);   // uncompressed size
    cd.writeUInt16LE(nameBuf.length, 28);// file name length
    cd.writeUInt16LE(0, 30);             // extra field length
    cd.writeUInt16LE(0, 32);             // comment length
    cd.writeUInt16LE(0, 34);             // disk number start
    cd.writeUInt16LE(0, 36);             // internal attributes
    cd.writeUInt32LE(0, 38);             // external attributes
    cd.writeUInt32LE(localOffsets[localOffsets.length - 1], 42); // local header offset

    cdParts.push(Buffer.concat([cd, nameBuf]));
  }

  const cdBuf = Buffer.concat(cdParts);

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);           // signature
  eocd.writeUInt16LE(0, 4);                     // disk number
  eocd.writeUInt16LE(0, 6);                     // disk with CD start
  eocd.writeUInt16LE(rawEntries.length, 8);     // entries on this disk
  eocd.writeUInt16LE(rawEntries.length, 10);    // total entries
  eocd.writeUInt32LE(cdBuf.length, 12);         // central directory size
  eocd.writeUInt32LE(localSize, 16);            // central directory offset
  eocd.writeUInt16LE(0, 20);                    // comment length

  return Buffer.concat([...localParts, cdBuf, eocd]);
}

describe("@tencil/adapter-penpot-file-in", () => {
  describe("penpotFileToTencil — synthetic ZIP", () => {
    it("should convert an empty .penpot file to an empty TencilDocument", async () => {
      const zip = buildPenpotZip({});
      const doc = await penpotFileToTencil(zip, { id: "test" });

      expect(doc.tencil).toBe("1.0");
      expect(doc.domain).toBe("ui");
      expect(doc.id).toBe("test");
      expect(doc.nodes).toHaveLength(0);

      const result = parseTencilDocument(doc);
      expect(result.success).toBe(true);
    });

    it("should convert a rect shape (type=rect → rectangle)", async () => {
      const shapeId = "shape-rect-001";
      const zip = buildPenpotZip({
        [shapeId]: {
          id: shapeId,
          name: "Button",
          type: "rect",
          x: 100, y: 50,
          width: 120, height: 48,
          fills: [{ fillColor: "#3B82F6", fillOpacity: 1 }],
          strokes: [{ strokeColor: "#1D4ED8", strokeWidth: 2 }],
          r1: 8, r2: 8, r3: 8, r4: 8,
          opacity: 0.9,
        },
      });

      const doc = await penpotFileToTencil(zip);
      expect(doc.nodes).toHaveLength(1);

      const node = doc.nodes[0];
      expect(node.type).toBe("rectangle");
      expect(node.name).toBe("Button");
      expect(node.x).toBe(100);
      expect(node.y).toBe(50);
      expect(node.width).toBe(120);
      expect(node.height).toBe(48);
      expect((node as any).fillColor).toBe("#3b82f6");
      expect((node as any).strokeColor).toBe("#1d4ed8");
      expect((node as any).strokeThickness).toBe(2);
      expect((node as any).cornerRadius).toBe(8);
      expect((node as any).opacity).toBe(0.9);

      expect(parseTencilDocument(doc).success).toBe(true);
    });

    it("should convert a circle shape (type=circle → ellipse)", async () => {
      const shapeId = "shape-circle-001";
      const zip = buildPenpotZip({
        [shapeId]: {
          id: shapeId,
          name: "Avatar",
          type: "circle",
          x: 0, y: 0,
          width: 64, height: 64,
          fills: [{ fillColor: "#EF4444", fillOpacity: 1 }],
        },
      });

      const doc = await penpotFileToTencil(zip);
      expect(doc.nodes).toHaveLength(1);
      expect(doc.nodes[0].type).toBe("ellipse");
      expect((doc.nodes[0] as any).fillColor).toBe("#ef4444");

      expect(parseTencilDocument(doc).success).toBe(true);
    });

    it("should convert a frame shape with flex layout", async () => {
      const shapeId = "shape-frame-001";
      const zip = buildPenpotZip({
        [shapeId]: {
          id: shapeId,
          name: "Card",
          type: "frame",
          x: 0, y: 0,
          width: 320, height: 480,
          fills: [{ fillColor: "#FFFFFF", fillOpacity: 1 }],
          layout: "flex",
          layoutFlexDir: "column",
          layoutGap: { rowGap: 16, columnGap: 0 },
        },
      });

      const doc = await penpotFileToTencil(zip);
      expect(doc.nodes).toHaveLength(1);

      const frame = doc.nodes[0];
      expect(frame.type).toBe("frame");
      expect((frame as any).layout).toBe("flex");
      expect((frame as any).flexDirection).toBe("column");
      expect((frame as any).gap).toBe(16);
      expect((frame as any).fillColor).toBe("#ffffff");

      expect(parseTencilDocument(doc).success).toBe(true);
    });

    it("should convert a text shape with rich text content", async () => {
      const shapeId = "shape-text-001";
      const zip = buildPenpotZip({
        [shapeId]: {
          id: shapeId,
          name: "Heading",
          type: "text",
          x: 20, y: 20,
          width: 300, height: 40,
          content: {
            type: "root",
            children: [
              {
                type: "paragraph",
                children: [
                  {
                    text: "Hello World",
                    fontFamily: "Inter",
                    fontSize: "24",
                    fontWeight: "600",
                    lineHeight: "1.5",
                    fillColor: "#111827",
                    fillOpacity: 1,
                  },
                ],
              },
            ],
          },
        },
      });

      const doc = await penpotFileToTencil(zip);
      expect(doc.nodes).toHaveLength(1);

      const text = doc.nodes[0];
      expect(text.type).toBe("text");
      expect((text as any).content).toBe("Hello World");
      expect((text as any).fontFamily).toBe("Inter");
      expect((text as any).fontSize).toBe(24);
      expect((text as any).fontWeight).toBe(600);
      expect((text as any).lineHeight).toBe(1.5);
      expect((text as any).textColor).toBe("#111827");

      expect(parseTencilDocument(doc).success).toBe(true);
    });

    it("should skip the root canvas shape (00000000-...)", async () => {
      const rootId = "00000000-0000-0000-0000-000000000000";
      const realId = "shape-real-001";
      const zip = buildPenpotZip({
        [rootId]: {
          id: rootId, name: "Root Frame", type: "frame",
          x: 0, y: 0, width: 0.01, height: 0.01,
          shapes: [realId],
        },
        [realId]: {
          id: realId, name: "Button", type: "rect",
          x: 0, y: 0, width: 100, height: 40,
        },
      });

      const doc = await penpotFileToTencil(zip);
      expect(doc.nodes).toHaveLength(1);
      expect(doc.nodes[0].id).toBe(realId);

      expect(parseTencilDocument(doc).success).toBe(true);
    });

    it("should use provided id and name options", async () => {
      const zip = buildPenpotZip({});
      const doc = await penpotFileToTencil(zip, { id: "custom-id", name: "Custom Name" });

      expect(doc.id).toBe("custom-id");
      expect(doc.name).toBe("Custom Name");
    });

    it("should throw for invalid page index", async () => {
      const zip = buildPenpotZip({});
      await expect(penpotFileToTencil(zip, { pageIndex: 99 })).rejects.toThrow("Page index");
    });

    it("should include source metadata", async () => {
      const zip = buildPenpotZip({});
      const doc = await penpotFileToTencil(zip);

      expect(doc.metadata?.source).toBe("penpot-file");
      expect(doc.metadata?.sourcePage).toBe("Page 1");
    });

    it("should handle mixed corner radii as tuple", async () => {
      const shapeId = "shape-mixed-radius";
      const zip = buildPenpotZip({
        [shapeId]: {
          id: shapeId, name: "Shape", type: "rect",
          x: 0, y: 0, width: 100, height: 100,
          r1: 4, r2: 8, r3: 4, r4: 8,
        },
      });

      const doc = await penpotFileToTencil(zip);
      expect((doc.nodes[0] as any).cornerRadius).toEqual([4, 8, 4, 8]);
    });
  });

  // ─── Real fixture tests (only run if testifyah.penpot exists) ────────────────

  describe.skipIf(!hasFixture)("penpotFileToTencil — real testifyah.penpot", () => {
    it("should parse the real .penpot file and produce a valid TencilDocument", async () => {
      const buf = fs.readFileSync(FIXTURE_PATH);
      const doc = await penpotFileToTencil(buf, { id: "testifyah" });

      expect(doc.tencil).toBe("1.0");
      expect(doc.domain).toBe("ui");
      expect(doc.id).toBe("testifyah");
      expect(doc.nodes.length).toBeGreaterThan(0);

      const result = parseTencilDocument(doc);
      expect(result.success).toBe(true);
    });

    it("should extract shapes with correct types from the real file", async () => {
      const buf = fs.readFileSync(FIXTURE_PATH);
      const doc = await penpotFileToTencil(buf);

      const types = new Set(doc.nodes.map((n) => n.type));
      // The real file has frames and various shapes
      expect(types.size).toBeGreaterThan(0);

      // No raw Penpot types should appear
      expect(types.has("rect")).toBe(false);
      expect(types.has("circle")).toBe(false);
    });
  });
});
