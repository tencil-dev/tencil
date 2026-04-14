import { describe, it, expect } from "vitest";
import { tencilToPencil } from "../src/index.js";
import type { TencilDocument } from "@tencil/core";

describe("@tencil/adapter-pencil-out", () => {
  describe("tencilToPencil", () => {
    it("should convert an empty TencilDocument to empty operations", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "empty-doc",
        nodes: [],
      };

      const result = tencilToPencil(tencilDoc);

      expect(result.operations).toEqual([]);
      expect(result.report.summary.totalNodes).toBe(0);
      expect(result.report.summary.translated).toBe(0);
      expect(result.report.summary.approximated).toBe(0);
      expect(result.report.summary.skipped).toBe(0);
    });

    it("should convert a TencilFrame to a Pencil I() operation", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "frame-doc",
        nodes: [
          {
            id: "frame-1",
            type: "frame",
            name: "Main Frame",
            x: 0,
            y: 0,
            width: 400,
            height: 600,
            layout: "flex",
            flexDirection: "column",
            gap: 16,
            fillColor: "#ffffff",
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);
      const ops = result.operations;

      expect(ops).toHaveLength(1);
      expect(ops[0]).toContain("main_frame=I(document");
      expect(ops[0]).toContain('type:"frame"');
      expect(ops[0]).toContain("x:0");
      expect(ops[0]).toContain("y:0");
      expect(ops[0]).toContain("width:400");
      expect(ops[0]).toContain("height:600");
      expect(ops[0]).toContain('layout:"flex"');
      expect(ops[0]).toContain('flexDirection:"column"');
      expect(ops[0]).toContain("gap:16");
      expect(ops[0]).toContain('fillColor:"#ffffff"');

      expect(result.report.summary.totalNodes).toBe(1);
      expect(result.report.summary.translated).toBe(1);
      expect(result.report.details[0].operation).toBe("translated");
    });

    it("should convert a TencilText to a Pencil I() operation", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "text-doc",
        nodes: [
          {
            id: "text-1",
            type: "text",
            name: "Heading",
            x: 20,
            y: 20,
            width: 200,
            height: 40,
            content: "Hello World",
            fontFamily: "Inter",
            fontSize: 24,
            fontWeight: 600,
            textColor: "#000000",
            textAlign: "center",
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);
      const ops = result.operations;

      expect(ops).toHaveLength(1);
      expect(ops[0]).toContain("heading=I(document");
      expect(ops[0]).toContain('type:"text"');
      expect(ops[0]).toContain('content:"Hello World"');
      expect(ops[0]).toContain('fontFamily:"Inter"');
      expect(ops[0]).toContain("fontSize:24");
      expect(ops[0]).toContain("fontWeight:600");
      expect(ops[0]).toContain('textColor:"#000000"');
      expect(ops[0]).toContain('textAlign:"center"');
    });

    it("should convert a TencilRectangle to a Pencil I() operation", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "rect-doc",
        nodes: [
          {
            id: "rect-1",
            type: "rectangle",
            name: "Button",
            x: 100,
            y: 100,
            width: 120,
            height: 48,
            fillColor: "#3b82f6",
            strokeColor: "#1e3c82",
            strokeThickness: 2,
            cornerRadius: 8,
            opacity: 0.9,
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);
      const ops = result.operations;

      expect(ops).toHaveLength(1);
      expect(ops[0]).toContain("button=I(document");
      expect(ops[0]).toContain('type:"rectangle"');
      expect(ops[0]).toContain('fillColor:"#3b82f6"');
      expect(ops[0]).toContain('strokeColor:"#1e3c82"');
      expect(ops[0]).toContain("strokeThickness:2");
      expect(ops[0]).toContain("cornerRadius:8");
      expect(ops[0]).toContain("opacity:0.9");
    });

    it("should convert a TencilEllipse to a Pencil I() operation", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "ellipse-doc",
        nodes: [
          {
            id: "ellipse-1",
            type: "ellipse",
            name: "Circle",
            x: 200,
            y: 200,
            width: 100,
            height: 100,
            fillColor: "#ff6464",
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);
      const ops = result.operations;

      expect(ops).toHaveLength(1);
      expect(ops[0]).toContain("circle=I(document");
      expect(ops[0]).toContain('type:"ellipse"');
      expect(ops[0]).toContain('fillColor:"#ff6464"');
    });

    it("should handle multiple nodes in sequence", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "multi-doc",
        nodes: [
          {
            id: "frame-1",
            type: "frame",
            name: "Container",
            width: 400,
            height: 300,
            fillColor: "#f0f0f0",
          } as any,
          {
            id: "rect-1",
            type: "rectangle",
            name: "Background",
            x: 0,
            y: 0,
            width: 400,
            height: 300,
            fillColor: "#ffffff",
          } as any,
          {
            id: "text-1",
            type: "text",
            name: "Title",
            x: 20,
            y: 20,
            content: "Welcome",
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);
      const ops = result.operations;

      expect(ops).toHaveLength(3);
      expect(ops[0]).toContain("container=I(document");
      expect(ops[1]).toContain("background=I(document");
      expect(ops[2]).toContain("title=I(document");

      expect(result.report.summary.totalNodes).toBe(3);
      expect(result.report.summary.translated).toBe(3);
      expect(result.report.summary.approximated).toBe(0);
      expect(result.report.summary.skipped).toBe(0);
    });

    it("should sanitize variable names (remove special characters)", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "sanitize-doc",
        nodes: [
          {
            id: "special-chars-1",
            type: "frame",
            name: "Button (Active) @v2",
            x: 0,
            y: 0,
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);

      expect(result.operations[0]).toMatch(/^button_active_v2=/);
    });

    it("should omit undefined optional properties", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "minimal-doc",
        nodes: [
          {
            id: "rect-1",
            type: "rectangle",
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            // No fill, stroke, opacity, etc.
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);
      const ops = result.operations;

      expect(ops).toHaveLength(1);
      expect(ops[0]).toContain('type:"rectangle"');
      expect(ops[0]).not.toContain("fillColor");
      expect(ops[0]).not.toContain("opacity");
    });

    it("should handle numeric values including zero correctly", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "numeric-doc",
        nodes: [
          {
            id: "rect-1",
            type: "rectangle",
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            strokeThickness: 0,
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);

      // All numeric properties are included even if 0 (since !== undefined)
      expect(result.operations[0]).toContain("x:0");
      expect(result.operations[0]).toContain("y:0");
      expect(result.operations[0]).toContain("strokeThickness:0");
    });

    it("should escape quotes in string properties", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "quote-doc",
        nodes: [
          {
            id: "text-1",
            type: "text",
            content: 'Say "Hello"',
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);

      expect(result.operations[0]).toContain('content:"Say \\"Hello\\""');
    });

    it("should insert child nodes into their parent frame, not document", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "nested-doc",
        nodes: [
          {
            id: "frame-1",
            type: "frame",
            name: "Sidebar",
            x: 0,
            y: 0,
            width: 200,
            height: 600,
          } as any,
          {
            id: "btn-1",
            type: "rectangle",
            name: "Button",
            parentId: "frame-1",
            x: 10,
            y: 10,
            width: 180,
            height: 40,
          } as any,
          {
            id: "label-1",
            type: "text",
            name: "Label",
            parentId: "btn-1",
            content: "Click me",
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);
      const ops = result.operations;

      expect(ops).toHaveLength(3);
      // Parent frame goes into document
      expect(ops[0]).toContain("sidebar=I(document");
      // Button goes into sidebar variable, not document
      expect(ops[1]).toContain("button=I(sidebar");
      // Label goes into button variable
      expect(ops[2]).toContain("label=I(button");
    });

    it("should fall back to document for nodes with unknown parentId", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "orphan-doc",
        nodes: [
          {
            id: "rect-1",
            type: "rectangle",
            name: "Orphan",
            parentId: "nonexistent-parent",
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);

      // Should not crash — falls back to document
      expect(result.operations[0]).toContain("orphan=I(document");
    });

    it("should generate deterministic output for same input", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "deterministic-doc",
        nodes: [
          {
            id: "rect-1",
            type: "rectangle",
            x: 10,
            y: 20,
            width: 100,
            height: 50,
            fillColor: "#ffffff",
          } as any,
        ],
      };

      const result1 = tencilToPencil(tencilDoc);
      const result2 = tencilToPencil(tencilDoc);

      expect(result1.operations).toEqual(result2.operations);
      expect(result1.report.summary).toEqual(result2.report.summary);
    });

    it("should mark grid layouts as approximated (not fully supported in Pencil)", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "grid-doc",
        nodes: [
          {
            id: "frame-grid",
            type: "frame",
            name: "Grid Layout",
            layout: "grid",
            gridTemplate: "1fr 1fr / 1fr 1fr",
            width: 400,
            height: 300,
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);

      // Grid frame should be exported as flex (downgrade)
      expect(result.operations[0]).toContain('layout:"flex"');

      // Report should mark it as approximated
      expect(result.report.summary.approximated).toBe(1);
      expect(result.report.summary.translated).toBe(0);
      expect(result.report.details[0].operation).toBe("approximated");
      expect(result.report.details[0].reason).toContain("Grid layout not supported");
    });

    it("should preserve flex alignment properties", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "align-doc",
        nodes: [
          {
            id: "frame-flex",
            type: "frame",
            name: "Flex with alignment",
            layout: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "end",
            width: 200,
            height: 300,
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);

      expect(result.operations[0]).toContain('justifyContent:"center"');
      expect(result.operations[0]).toContain('alignItems:"end"');
      expect(result.report.summary.translated).toBe(1);
    });

    it("should include node name and id in report details", () => {
      const tencilDoc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "report-doc",
        nodes: [
          {
            id: "frame-abc",
            type: "frame",
            name: "Hero Section",
            width: 100,
            height: 100,
          } as any,
        ],
      };

      const result = tencilToPencil(tencilDoc);

      expect(result.report.details).toHaveLength(1);
      expect(result.report.details[0].nodeId).toBe("frame-abc");
      expect(result.report.details[0].nodeName).toBe("Hero Section");
      expect(result.report.details[0].operation).toBe("translated");
    });
  });
});
