import { describe, it, expect } from "vitest";
import type {
  TencilFrame,
  TencilText,
  TencilRectangle,
  TencilEllipse,
} from "../src/index.js";

describe("@tencil/schema-ui", () => {
  describe("Type exports", () => {
    it("should export TencilFrame type", () => {
      const frame: TencilFrame = {
        id: "frame-1",
        type: "frame",
        layout: "flex",
        flexDirection: "column",
        gap: 16,
      };

      expect(frame.id).toBe("frame-1");
      expect(frame.type).toBe("frame");
      expect(frame.layout).toBe("flex");
      expect(frame.flexDirection).toBe("column");
      expect(frame.gap).toBe(16);
    });

    it("should export TencilText type", () => {
      const text: TencilText = {
        id: "text-1",
        type: "text",
        content: "Hello World",
        fontFamily: "Inter",
        fontSize: 24,
        fontWeight: 600,
        textColor: "#000000",
      };

      expect(text.type).toBe("text");
      expect(text.content).toBe("Hello World");
      expect(text.fontSize).toBe(24);
    });

    it("should export TencilRectangle type", () => {
      const rect: TencilRectangle = {
        id: "rect-1",
        type: "rectangle",
        fillColor: "#ffffff",
        strokeColor: "#000000",
        strokeThickness: 2,
        cornerRadius: 8,
      };

      expect(rect.type).toBe("rectangle");
      expect(rect.cornerRadius).toBe(8);
    });

    it("should export TencilEllipse type", () => {
      const ellipse: TencilEllipse = {
        id: "ellipse-1",
        type: "ellipse",
        fillColor: "#ff0000",
        opacity: 0.8,
      };

      expect(ellipse.type).toBe("ellipse");
      expect(ellipse.opacity).toBe(0.8);
    });

    it("should support optional properties on frame", () => {
      const frame: TencilFrame = {
        id: "frame-1",
        type: "frame",
        name: "Main Frame",
        x: 0,
        y: 0,
        width: 400,
        height: 600,
        layout: "grid",
        gridTemplate: "1fr 1fr / 1fr 1fr",
        justifyContent: "center",
        alignItems: "start",
        padding: 16,
        fillColor: "#f0f0f0",
      };

      expect(frame.name).toBe("Main Frame");
      expect(frame.layout).toBe("grid");
      expect(frame.gridTemplate).toBe("1fr 1fr / 1fr 1fr");
      expect(frame.justifyContent).toBe("center");
      expect(frame.alignItems).toBe("start");
    });

    it("should support all FlexDirection values", () => {
      const rowFrame: TencilFrame = {
        id: "f1",
        type: "frame",
        flexDirection: "row",
      };

      const colFrame: TencilFrame = {
        id: "f2",
        type: "frame",
        flexDirection: "column",
      };

      expect(rowFrame.flexDirection).toBe("row");
      expect(colFrame.flexDirection).toBe("column");
    });

    it("should support all AlignmentMode values", () => {
      const alignments = ["start", "center", "end", "space-between", "space-around"] as const;

      for (const alignment of alignments) {
        const frame: TencilFrame = {
          id: "frame-1",
          type: "frame",
          justifyContent: alignment,
        };
        expect(frame.justifyContent).toBe(alignment);
      }
    });

    it("should support corner radius as number or array", () => {
      const singleRadius: TencilRectangle = {
        id: "r1",
        type: "rectangle",
        cornerRadius: 8,
      };

      const arrayRadius: TencilRectangle = {
        id: "r2",
        type: "rectangle",
        cornerRadius: [8, 8, 0, 0],
      };

      expect(singleRadius.cornerRadius).toBe(8);
      expect(arrayRadius.cornerRadius).toEqual([8, 8, 0, 0]);
    });
  });
});
