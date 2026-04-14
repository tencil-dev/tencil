import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { readTencil, writeTencil, invokeAdapter } from "../src/index.js";
import type { TencilDocument } from "@tencil/core";

const SAMPLE_TENCIL: TencilDocument = {
  tencil: "1.0",
  domain: "ui",
  id: "test-design",
  name: "Test Design",
  nodes: [
    { id: "frame-1", type: "frame", x: 0, y: 0, width: 400, height: 300 },
    { id: "rect-1", type: "rectangle", x: 20, y: 20, width: 100, height: 50 },
  ],
};

const SAMPLE_PENPOT = {
  name: "Penpot Design",
  objects: [
    {
      id: "frame-1",
      type: "frame",
      name: "Container",
      x: 0, y: 0, width: 400, height: 300,
      fills: [{ r: 255, g: 255, b: 255 }],
    },
    {
      id: "btn-1",
      type: "rect",
      name: "Button",
      x: 20, y: 20, width: 120, height: 40,
      fills: [{ r: 59, g: 130, b: 246 }],
      rx: 6,
    },
  ],
};

describe("@tencil/mcp-server", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tencil-mcp-test-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // ─── readTencil ───────────────────────────────────────────────────────────

  describe("readTencil", () => {
    it("should read and parse a valid .tencil file", async () => {
      const filePath = path.join(tmpDir, "project.tencil");
      fs.writeFileSync(filePath, JSON.stringify(SAMPLE_TENCIL), "utf-8");

      const doc = await readTencil("project.tencil");

      expect(doc.tencil).toBe("1.0");
      expect(doc.domain).toBe("ui");
      expect(doc.id).toBe("test-design");
      expect(doc.nodes).toHaveLength(2);
    });

    it("should throw for a non-existent file", async () => {
      await expect(readTencil("missing.tencil")).rejects.toThrow("File not found");
    });

    it("should throw for an invalid JSON file", async () => {
      fs.writeFileSync(path.join(tmpDir, "bad.tencil"), "not json", "utf-8");
      await expect(readTencil("bad.tencil")).rejects.toThrow("not valid JSON");
    });

    it("should throw for an invalid .tencil document", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "invalid.tencil"),
        JSON.stringify({ domain: "ui" }), // missing required fields
        "utf-8"
      );
      await expect(readTencil("invalid.tencil")).rejects.toThrow("Invalid .tencil");
    });
  });

  // ─── writeTencil ──────────────────────────────────────────────────────────

  describe("writeTencil", () => {
    it("should write a valid TencilDocument to disk", async () => {
      await writeTencil("output.tencil", SAMPLE_TENCIL);

      const written = JSON.parse(
        fs.readFileSync(path.join(tmpDir, "output.tencil"), "utf-8")
      );

      expect(written.tencil).toBe("1.0");
      expect(written.id).toBe("test-design");
      expect(written.nodes).toHaveLength(2);
    });

    it("should throw for an invalid document", async () => {
      await expect(
        writeTencil("out.tencil", { domain: "ui" } as any)
      ).rejects.toThrow("Invalid TencilDocument");
    });
  });

  // ─── invokeAdapter ────────────────────────────────────────────────────────

  describe("invokeAdapter", () => {
    it("should invoke penpot-in adapter and return a summary (not full document)", async () => {
      const result = await invokeAdapter("penpot-in", SAMPLE_PENPOT, {
        id: "my-design",
        name: "My Design",
      });

      // penpot-in now writes to disk and returns a summary to avoid flooding context
      const summary = result as { id: string; name: string; domain: string; nodeCount: number; filePath: string };
      expect(summary.id).toBe("my-design");
      expect(summary.name).toBe("My Design");
      expect(summary.domain).toBe("ui");
      expect(summary.nodeCount).toBeGreaterThan(0);
      expect(summary.filePath).toBeDefined();

      // The .tencil file should have been written to disk
      const fs2 = await import("fs");
      expect(fs2.existsSync(summary.filePath)).toBe(true);
    });

    it("should invoke pencil-out adapter and return operations", async () => {
      const result = await invokeAdapter("pencil-out", SAMPLE_TENCIL);

      const output = result as { operations: string[]; count: number };
      expect(Array.isArray(output.operations)).toBe(true);
      expect(output.operations.length).toBeGreaterThan(0);
      expect(output.count).toBe(output.operations.length);

      // Each operation should be a valid I() statement
      for (const op of output.operations) {
        expect(op).toMatch(/=I\(document,/);
      }
    });

    it("should throw for an unknown adapter", async () => {
      await expect(invokeAdapter("unknown-adapter", {})).rejects.toThrow(
        "Unknown adapter"
      );
    });

    it("should throw for pencil-out with invalid input", async () => {
      await expect(
        invokeAdapter("pencil-out", { domain: "ui" }) // invalid TencilDocument
      ).rejects.toThrow("not a valid TencilDocument");
    });
  });
});
