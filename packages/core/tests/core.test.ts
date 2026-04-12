import { describe, it, expect } from "vitest";
import {
  parseTencilDocument,
  validateTencilDocument,
  type TencilDocument,
} from "../src/index.js";

describe("@tencil/core", () => {
  describe("parseTencilDocument", () => {
    it("should parse a valid single-domain UI document", () => {
      const json = {
        tencil: "1.0",
        domain: "ui",
        id: "dashboard-v1",
        name: "Dashboard UI",
        nodes: [
          {
            id: "frame-1",
            type: "frame",
            x: 0,
            y: 0,
            width: 400,
            height: 600,
          },
          {
            id: "btn-1",
            type: "rectangle",
            x: 20,
            y: 20,
            width: 100,
            height: 40,
          },
        ],
      };

      const result = parseTencilDocument(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.domain).toBe("ui");
        expect(result.data.nodes).toHaveLength(2);
      }
    });

    it("should parse a multi-domain document with links", () => {
      const json = {
        tencil: "1.0",
        domain: "multi",
        id: "product-v2",
        nodes: [
          {
            id: "btn-arm",
            type: "button",
          },
          {
            id: "gpio-4",
            type: "pin",
          },
        ],
        links: [
          {
            id: "link-1",
            source: { domain: "ui", nodeId: "btn-arm" },
            target: { domain: "ee", nodeId: "gpio-4" },
            type: "controls",
          },
        ],
      };

      const result = parseTencilDocument(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.links).toHaveLength(1);
        expect(result.data.links![0].type).toBe("controls");
      }
    });

    it("should reject invalid domain", () => {
      const json = {
        tencil: "1.0",
        domain: "invalid",
        id: "test",
        nodes: [],
      };

      const result = parseTencilDocument(json);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe("domain");
      }
    });

    it("should reject missing tencil version", () => {
      const json = {
        domain: "ui",
        id: "test",
        nodes: [],
      };

      const result = parseTencilDocument(json);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.field.includes("tencil"))).toBe(
          true
        );
      }
    });

    it("should reject missing document id", () => {
      const json = {
        tencil: "1.0",
        domain: "ui",
        nodes: [],
      };

      const result = parseTencilDocument(json);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.field.includes("id"))).toBe(true);
      }
    });

    it("should reject nodes without id", () => {
      const json = {
        tencil: "1.0",
        domain: "ui",
        id: "test",
        nodes: [
          {
            type: "frame",
            x: 0,
            y: 0,
          },
        ],
      };

      const result = parseTencilDocument(json);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.field.includes("id"))).toBe(true);
      }
    });

    it("should support all link types", () => {
      const linkTypes = [
        "controls",
        "displays",
        "located-at",
        "encloses",
        "mounts-on",
        "powered-by",
        "triggers",
        "reads-from",
        "prescribes",
      ];

      for (const type of linkTypes) {
        const json = {
          tencil: "1.0",
          domain: "multi",
          id: "test",
          nodes: [
            { id: "a", type: "node" },
            { id: "b", type: "node" },
          ],
          links: [
            {
              id: "link-1",
              source: { domain: "ui", nodeId: "a" },
              target: { domain: "ee", nodeId: "b" },
              type,
            },
          ],
        };

        const result = parseTencilDocument(json);
        expect(result.success).toBe(true);
      }
    });

    it("should include optional fields", () => {
      const json: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "doc-1",
        name: "My Design",
        description: "A test design",
        nodes: [
          {
            id: "node-1",
            type: "frame",
            name: "Main Frame",
            metadata: { color: "blue" },
          },
        ],
        metadata: { author: "test user", version: "1.0" },
      };

      const result = parseTencilDocument(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My Design");
        expect(result.data.nodes[0].name).toBe("Main Frame");
        expect(result.data.metadata?.author).toBe("test user");
      }
    });
  });

  describe("validateTencilDocument", () => {
    it("should validate a typed document", () => {
      const doc: TencilDocument = {
        tencil: "1.0",
        domain: "ui",
        id: "test",
        nodes: [],
      };

      const result = validateTencilDocument(doc);
      expect(result.success).toBe(true);
    });
  });
});
