import { describe, it, expect } from "vitest";
import { pencilNodesToTencil } from "../src/index.js";
import { parseTencilDocument } from "@tencil/core";
import type { PencilNode } from "../src/types.js";

describe("@tencil/adapter-pencil-in", () => {
  describe("pencilNodesToTencil — document structure", () => {
    it("should convert an empty node list to a valid TencilDocument", () => {
      const doc = pencilNodesToTencil([]);

      expect(doc.tencil).toBe("1.0");
      expect(doc.domain).toBe("ui");
      expect(doc.nodes).toHaveLength(0);
      expect(parseTencilDocument(doc).success).toBe(true);
    });

    it("should use provided id and name", () => {
      const doc = pencilNodesToTencil([], { id: "my-id", name: "My Design" });

      expect(doc.id).toBe("my-id");
      expect(doc.name).toBe("My Design");
    });

    it("should generate a UUID for id when not provided", () => {
      const doc = pencilNodesToTencil([]);
      expect(doc.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("should include source metadata", () => {
      const doc = pencilNodesToTencil([]);
      expect(doc.metadata?.source).toBe("pencil");
    });

    it("should filter out document and page container nodes", () => {
      const nodes: PencilNode[] = [
        { id: "doc-1", type: "document", name: "Document" },
        { id: "page-1", type: "page", name: "Page 1" },
        { id: "rect-1", type: "rectangle", name: "Box", x: 0, y: 0, width: 100, height: 50 },
      ];

      const doc = pencilNodesToTencil(nodes);
      expect(doc.nodes).toHaveLength(1);
      expect(doc.nodes[0].id).toBe("rect-1");
    });
  });

  describe("pencilNodesToTencil — type mapping", () => {
    it("should preserve frame type", () => {
      const nodes: PencilNode[] = [
        { id: "f1", type: "frame", name: "Container", x: 0, y: 0, width: 320, height: 480 },
      ];
      const doc = pencilNodesToTencil(nodes);
      expect(doc.nodes[0].type).toBe("frame");
    });

    it("should preserve rectangle type", () => {
      const nodes: PencilNode[] = [
        { id: "r1", type: "rectangle", name: "Box", x: 0, y: 0, width: 100, height: 50 },
      ];
      const doc = pencilNodesToTencil(nodes);
      expect(doc.nodes[0].type).toBe("rectangle");
    });

    it("should preserve ellipse type", () => {
      const nodes: PencilNode[] = [
        { id: "e1", type: "ellipse", name: "Circle", x: 0, y: 0, width: 64, height: 64 },
      ];
      const doc = pencilNodesToTencil(nodes);
      expect(doc.nodes[0].type).toBe("ellipse");
    });

    it("should preserve text type", () => {
      const nodes: PencilNode[] = [
        { id: "t1", type: "text", name: "Heading", x: 0, y: 0, width: 200, height: 30, content: "Hello" },
      ];
      const doc = pencilNodesToTencil(nodes);
      expect(doc.nodes[0].type).toBe("text");
    });

    it("should map group type to frame", () => {
      const nodes: PencilNode[] = [
        { id: "g1", type: "group", name: "Group 1", x: 0, y: 0, width: 200, height: 100 },
      ];
      const doc = pencilNodesToTencil(nodes);
      expect(doc.nodes[0].type).toBe("frame");
    });

    it("should map unknown types to rectangle", () => {
      const nodes: PencilNode[] = [
        { id: "u1", type: "star", name: "Star", x: 0, y: 0, width: 50, height: 50 },
      ];
      const doc = pencilNodesToTencil(nodes);
      expect(doc.nodes[0].type).toBe("rectangle");
    });
  });

  describe("pencilNodesToTencil — geometry", () => {
    it("should copy x, y, width, height, rotation", () => {
      const nodes: PencilNode[] = [
        { id: "r1", type: "rectangle", name: "Box", x: 10, y: 20, width: 150, height: 80, rotation: 45 },
      ];
      const doc = pencilNodesToTencil(nodes);
      const node = doc.nodes[0] as any;
      expect(node.x).toBe(10);
      expect(node.y).toBe(20);
      expect(node.width).toBe(150);
      expect(node.height).toBe(80);
      expect(node.rotation).toBe(45);
    });

    it("should omit rotation when it is 0", () => {
      const nodes: PencilNode[] = [
        { id: "r1", type: "rectangle", name: "Box", x: 0, y: 0, width: 100, height: 100, rotation: 0 },
      ];
      const doc = pencilNodesToTencil(nodes);
      expect((doc.nodes[0] as any).rotation).toBeUndefined();
    });
  });

  describe("pencilNodesToTencil — fill/stroke/opacity", () => {
    it("should copy fillColor and strokeColor for rectangles", () => {
      const nodes: PencilNode[] = [{
        id: "r1", type: "rectangle", name: "Card",
        x: 0, y: 0, width: 100, height: 100,
        fillColor: "#3b82f6", strokeColor: "#1d4ed8", strokeThickness: 2,
        opacity: 0.8,
      }];
      const doc = pencilNodesToTencil(nodes);
      const node = doc.nodes[0] as any;
      expect(node.fillColor).toBe("#3b82f6");
      expect(node.strokeColor).toBe("#1d4ed8");
      expect(node.strokeThickness).toBe(2);
      expect(node.opacity).toBe(0.8);
    });

    it("should copy fillColor for ellipses", () => {
      const nodes: PencilNode[] = [{
        id: "e1", type: "ellipse", name: "Circle",
        x: 0, y: 0, width: 64, height: 64,
        fillColor: "#ef4444",
      }];
      const doc = pencilNodesToTencil(nodes);
      expect((doc.nodes[0] as any).fillColor).toBe("#ef4444");
    });

    it("should copy cornerRadius as number", () => {
      const nodes: PencilNode[] = [{
        id: "r1", type: "rectangle", name: "Rounded",
        x: 0, y: 0, width: 100, height: 100,
        cornerRadius: 8,
      }];
      const doc = pencilNodesToTencil(nodes);
      expect((doc.nodes[0] as any).cornerRadius).toBe(8);
    });

    it("should copy cornerRadius as tuple", () => {
      const nodes: PencilNode[] = [{
        id: "r1", type: "rectangle", name: "Mixed",
        x: 0, y: 0, width: 100, height: 100,
        cornerRadius: [4, 8, 4, 8],
      }];
      const doc = pencilNodesToTencil(nodes);
      expect((doc.nodes[0] as any).cornerRadius).toEqual([4, 8, 4, 8]);
    });
  });

  describe("pencilNodesToTencil — frame layout", () => {
    it("should copy layout, flexDirection, gap, padding for frames", () => {
      const nodes: PencilNode[] = [{
        id: "f1", type: "frame", name: "Layout",
        x: 0, y: 0, width: 320, height: 480,
        fillColor: "#ffffff",
        layout: "flex", flexDirection: "column", gap: 16, padding: 24,
      }];
      const doc = pencilNodesToTencil(nodes);
      const node = doc.nodes[0] as any;
      expect(node.layout).toBe("flex");
      expect(node.flexDirection).toBe("column");
      expect(node.gap).toBe(16);
      expect(node.padding).toBe(24);
    });
  });

  describe("pencilNodesToTencil — text", () => {
    it("should copy all text properties", () => {
      const nodes: PencilNode[] = [{
        id: "t1", type: "text", name: "Heading",
        x: 0, y: 0, width: 300, height: 40,
        content: "Hello World",
        fontFamily: "Inter",
        fontSize: 24,
        fontWeight: 600,
        lineHeight: 1.5,
        textAlign: "center",
        textColor: "#111827",
      }];
      const doc = pencilNodesToTencil(nodes);
      const node = doc.nodes[0] as any;
      expect(node.content).toBe("Hello World");
      expect(node.fontFamily).toBe("Inter");
      expect(node.fontSize).toBe(24);
      expect(node.fontWeight).toBe(600);
      expect(node.lineHeight).toBe(1.5);
      expect(node.textAlign).toBe("center");
      expect(node.textColor).toBe("#111827");
    });
  });

  describe("pencilNodesToTencil — schema validation", () => {
    it("should produce a parseTencilDocument-valid document with mixed nodes", () => {
      const nodes: PencilNode[] = [
        { id: "f1", type: "frame", name: "Card", x: 0, y: 0, width: 320, height: 480, fillColor: "#fff" },
        { id: "r1", type: "rectangle", name: "Button", x: 10, y: 10, width: 100, height: 40, fillColor: "#3b82f6" },
        { id: "t1", type: "text", name: "Label", x: 15, y: 20, width: 90, height: 20, content: "Click me", textColor: "#fff" },
        { id: "e1", type: "ellipse", name: "Icon", x: 200, y: 200, width: 48, height: 48, fillColor: "#ef4444" },
      ];

      const doc = pencilNodesToTencil(nodes, { id: "test", name: "Test" });
      const result = parseTencilDocument(doc);
      expect(result.success).toBe(true);
      expect(doc.nodes).toHaveLength(4);
    });
  });
});
