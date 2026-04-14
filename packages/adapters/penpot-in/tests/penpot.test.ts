import { describe, it, expect } from "vitest";
import { penpotToTencil } from "../src/index.js";
import { parseTencilDocument } from "@tencil/core";

describe("@tencil/adapter-penpot-in", () => {
  describe("penpotToTencil", () => {
    it("should convert an empty Penpot export to a valid TencilDocument", () => {
      const penpotExport = {
        name: "Empty Design",
        objects: [],
      };

      const tencilDoc = penpotToTencil(penpotExport, { id: "test-design" });

      expect(tencilDoc).toBeDefined();
      expect(tencilDoc.tencil).toBe("1.0");
      expect(tencilDoc.domain).toBe("ui");
      expect(tencilDoc.id).toBe("test-design");
      expect(tencilDoc.name).toBe("Empty Design");
      expect(tencilDoc.nodes).toEqual([]);

      // Validate with core validator
      const result = parseTencilDocument(tencilDoc);
      expect(result.success).toBe(true);
    });

    it("should convert Penpot frame to TencilFrame", () => {
      const penpotExport = {
        name: "Frame Design",
        objects: [
          {
            id: "frame-1",
            type: "frame",
            name: "Main Frame",
            x: 0,
            y: 0,
            width: 400,
            height: 600,
            layout: "flex",
            "flex-direction": "column",
            gap: 16,
            fills: [{ r: 255, g: 255, b: 255 }],
          },
        ],
      };

      const tencilDoc = penpotToTencil(penpotExport);
      const frameNode = tencilDoc.nodes[0];

      expect(frameNode.type).toBe("frame");
      expect(frameNode.name).toBe("Main Frame");
      expect(frameNode.width).toBe(400);
      expect(frameNode.height).toBe(600);
      expect((frameNode as any).layout).toBe("flex");
      expect((frameNode as any).flexDirection).toBe("column");
      expect((frameNode as any).gap).toBe(16);
      expect((frameNode as any).fillColor).toBe("#ffffff");

      // Validate
      const result = parseTencilDocument(tencilDoc);
      expect(result.success).toBe(true);
    });

    it("should convert Penpot text node to TencilText", () => {
      const penpotExport = {
        name: "Text Design",
        objects: [
          {
            id: "text-1",
            type: "text",
            name: "Heading",
            x: 20,
            y: 20,
            width: 200,
            height: 40,
            content: "Hello World",
            "font-family": "Inter",
            "font-size": 24,
            "font-weight": 600,
            "line-height": 1.5,
            "text-align": "center",
            color: { r: 0, g: 0, b: 0 },
          },
        ],
      };

      const tencilDoc = penpotToTencil(penpotExport);
      const textNode = tencilDoc.nodes[0];

      expect(textNode.type).toBe("text");
      expect((textNode as any).content).toBe("Hello World");
      expect((textNode as any).fontFamily).toBe("Inter");
      expect((textNode as any).fontSize).toBe(24);
      expect((textNode as any).fontWeight).toBe(600);
      expect((textNode as any).textAlign).toBe("center");
      expect((textNode as any).textColor).toBe("#000000");

      // Validate
      const result = parseTencilDocument(tencilDoc);
      expect(result.success).toBe(true);
    });

    it("should convert Penpot rectangle to TencilRectangle", () => {
      const penpotExport = {
        name: "Rect Design",
        objects: [
          {
            id: "rect-1",
            type: "rect",
            name: "Button",
            x: 100,
            y: 100,
            width: 120,
            height: 48,
            rx: 8,
            fills: [{ r: 59, g: 130, b: 246 }],
            strokes: [{ color: { r: 30, g: 60, b: 130 }, width: 2 }],
            opacity: 0.9,
          },
        ],
      };

      const tencilDoc = penpotToTencil(penpotExport);
      const rectNode = tencilDoc.nodes[0];

      expect(rectNode.type).toBe("rectangle");
      expect((rectNode as any).fillColor).toBe("#3b82f6");
      expect((rectNode as any).strokeColor).toBe("#1e3c82");
      expect((rectNode as any).strokeThickness).toBe(2);
      expect((rectNode as any).cornerRadius).toBe(8);
      expect((rectNode as any).opacity).toBe(0.9);

      // Validate
      const result = parseTencilDocument(tencilDoc);
      expect(result.success).toBe(true);
    });

    it("should convert Penpot ellipse to TencilEllipse", () => {
      const penpotExport = {
        name: "Ellipse Design",
        objects: [
          {
            id: "ellipse-1",
            type: "ellipse",
            name: "Circle",
            x: 200,
            y: 200,
            width: 100,
            height: 100,
            fills: [{ r: 255, g: 100, b: 100 }],
          },
        ],
      };

      const tencilDoc = penpotToTencil(penpotExport);
      const ellipseNode = tencilDoc.nodes[0];

      expect(ellipseNode.type).toBe("ellipse");
      expect((ellipseNode as any).fillColor).toBe("#ff6464");

      // Validate
      const result = parseTencilDocument(tencilDoc);
      expect(result.success).toBe(true);
    });

    it("should convert nested Penpot shapes (frame with children)", () => {
      const penpotExport = {
        name: "Nested Design",
        objects: [
          {
            id: "frame-1",
            type: "frame",
            name: "Container",
            x: 0,
            y: 0,
            width: 400,
            height: 300,
            shapes: [
              {
                id: "rect-1",
                type: "rect",
                name: "Background",
                x: 0,
                y: 0,
                width: 400,
                height: 300,
                fills: [{ r: 240, g: 240, b: 240 }],
              },
              {
                id: "text-1",
                type: "text",
                name: "Title",
                x: 20,
                y: 20,
                width: 360,
                height: 40,
                content: "Welcome",
                "font-size": 28,
              },
            ],
          },
        ],
      };

      const tencilDoc = penpotToTencil(penpotExport);

      expect(tencilDoc.nodes).toHaveLength(3); // frame + rect + text (all flattened)
      expect(tencilDoc.nodes[0].type).toBe("frame");
      expect(tencilDoc.nodes[1].type).toBe("rectangle");
      expect(tencilDoc.nodes[2].type).toBe("text");
      expect((tencilDoc.nodes[2] as any).content).toBe("Welcome");

      // Validate
      const result = parseTencilDocument(tencilDoc);
      expect(result.success).toBe(true);
    });

    it("should use provided document ID and name", () => {
      const penpotExport = {
        name: "Original Name",
        objects: [],
      };

      const tencilDoc = penpotToTencil(penpotExport, {
        id: "custom-id",
        name: "Custom Name",
      });

      expect(tencilDoc.id).toBe("custom-id");
      expect(tencilDoc.name).toBe("Custom Name");
    });

    it("should generate default ID if not provided", () => {
      const penpotExport = {
        name: "Test Design",
        objects: [],
      };

      const tencilDoc = penpotToTencil(penpotExport);

      expect(tencilDoc.id).toBeDefined();
      expect(tencilDoc.id).toMatch(/^penpot-\d+$/);
    });

    it("should handle font-weight as string", () => {
      const penpotExport = {
        name: "Font Weight Test",
        objects: [
          {
            id: "text-1",
            type: "text",
            name: "Text",
            x: 0,
            y: 0,
            content: "Bold",
            "font-weight": "700", // string instead of number
          },
        ],
      };

      const tencilDoc = penpotToTencil(penpotExport);
      const textNode = tencilDoc.nodes[0];

      expect((textNode as any).fontWeight).toBe(700);

      // Validate
      const result = parseTencilDocument(tencilDoc);
      expect(result.success).toBe(true);
    });

    it("should handle missing optional properties gracefully", () => {
      const penpotExport = {
        objects: [
          {
            id: "rect-1",
            type: "rect",
            // No name, position, size, colors
          },
        ],
      };

      const tencilDoc = penpotToTencil(penpotExport);

      expect(tencilDoc.nodes).toHaveLength(1);
      expect(tencilDoc.nodes[0].type).toBe("rectangle");
      expect((tencilDoc.nodes[0] as any).fillColor).toBeUndefined();

      // Validate
      const result = parseTencilDocument(tencilDoc);
      expect(result.success).toBe(true);
    });

    it("should skip nodes without IDs", () => {
      const penpotExport = {
        name: "Test",
        objects: [
          {
            id: "rect-1",
            type: "rect",
          },
          {
            // Missing ID — should be skipped
            type: "text",
            content: "Orphan",
          },
          {
            id: "text-1",
            type: "text",
            content: "Valid",
          },
        ],
      };

      const tencilDoc = penpotToTencil(penpotExport);

      expect(tencilDoc.nodes).toHaveLength(2);
      expect(tencilDoc.nodes[0].id).toBe("rect-1");
      expect(tencilDoc.nodes[1].id).toBe("text-1");
    });

    it("should convert color with alpha channel (opacity)", () => {
      const penpotExport = {
        name: "Alpha Test",
        objects: [
          {
            id: "rect-1",
            type: "rect",
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            fills: [{ r: 255, g: 0, b: 0, a: 0.5 }],
          },
        ],
      };

      const tencilDoc = penpotToTencil(penpotExport);
      const rectNode = tencilDoc.nodes[0];

      // Note: Tencil format currently stores color as hex, alpha separately
      expect((rectNode as any).fillColor).toBe("#ff0000");
      expect((rectNode as any).opacity).toBeUndefined(); // opacity is on node, not fill

      // Validate
      const result = parseTencilDocument(tencilDoc);
      expect(result.success).toBe(true);
    });

    it("should map flex alignment properties (justify-content, align-content)", () => {
      const penpotExport = {
        name: "Aligned Layout",
        objects: [
          {
            id: "frame-aligned",
            type: "frame",
            name: "Flex with alignment",
            x: 0,
            y: 0,
            width: 300,
            height: 200,
            layout: "flex",
            "flex-direction": "row",
            "justify-content": "center",
            "align-content": "flex-end",
            gap: 8,
          },
        ],
      };

      const tencilDoc = penpotToTencil(penpotExport);
      const frameNode = tencilDoc.nodes[0] as any;

      expect(frameNode.type).toBe("frame");
      expect(frameNode.layout).toBe("flex");
      expect(frameNode.justifyContent).toBe("center");
      expect(frameNode.alignItems).toBe("end");
      expect(frameNode.gap).toBe(8);

      // Validate
      const result = parseTencilDocument(tencilDoc);
      expect(result.success).toBe(true);
    });
  });
});
