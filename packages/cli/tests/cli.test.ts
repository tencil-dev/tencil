import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { startCommand } from "../src/commands/start.js";
import { validateCommand } from "../src/commands/validate.js";
import { exportCommand } from "../src/commands/export.js";
import { importCommand } from "../src/commands/import.js";
import { pushCommand } from "../src/commands/push.js";
import { linkCommand } from "../src/commands/link.js";

// Sample Penpot export for export/import tests
const SAMPLE_PENPOT = {
  name: "Test Design",
  id: "test-001",
  objects: [
    {
      id: "frame-1",
      type: "frame",
      name: "Main",
      x: 0, y: 0, width: 400, height: 300,
      fills: [{ r: 255, g: 255, b: 255 }],
    },
    {
      id: "text-1",
      type: "text",
      name: "Title",
      x: 20, y: 20, width: 200, height: 40,
      content: "Hello World",
      "font-size": 24,
      "font-family": "Inter",
      color: { r: 0, g: 0, b: 0 },
    },
  ],
};

// Valid .tencil document for validate/import tests
const SAMPLE_TENCIL = {
  tencil: "1.0",
  domain: "ui",
  id: "test-design",
  name: "Test Design",
  nodes: [
    { id: "frame-1", type: "frame", x: 0, y: 0, width: 400, height: 300 },
    { id: "text-1", type: "text", content: "Hello", x: 20, y: 20 },
  ],
};

describe("tencil CLI commands", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tencil-test-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // ─── create ──────────────────────────────────────────────────────────────

  describe("start", () => {
    it("should create project directory with project.tencil and .tencilrc", async () => {
      await startCommand("my-project");

      const projectDir = path.join(tmpDir, "my-project");
      expect(fs.existsSync(projectDir)).toBe(true);
      expect(fs.existsSync(path.join(projectDir, "project.tencil"))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, ".tencilrc"))).toBe(true);
    });

    it("should write valid .tencil file with correct project ID", async () => {
      await startCommand("my-dashboard");

      const tencilPath = path.join(tmpDir, "my-dashboard", "project.tencil");
      const content = JSON.parse(fs.readFileSync(tencilPath, "utf-8"));

      expect(content.tencil).toBe("1.0");
      expect(content.domain).toBe("ui");
      expect(content.id).toBe("my-dashboard");
      expect(content.nodes).toEqual([]);
      expect(content.links).toEqual([]);
    });

    it("should write valid .tencilrc with project name", async () => {
      await startCommand("sensor-ui");

      const rcPath = path.join(tmpDir, "sensor-ui", ".tencilrc");
      const rc = JSON.parse(fs.readFileSync(rcPath, "utf-8"));

      expect(rc.version).toBe("1.0");
      expect(rc.project).toBe("sensor-ui");
      expect(rc.adapters.in).toBe("penpot");
      expect(rc.adapters.out).toBe("pencil");
    });

    it("should exit if project directory already exists", async () => {
      fs.mkdirSync(path.join(tmpDir, "existing"));

      await expect(startCommand("existing")).rejects.toThrow();
    });

    it("should exit if name is empty", async () => {
      await expect(startCommand("")).rejects.toThrow();
    });
  });

  // ─── validate ────────────────────────────────────────────────────────────

  describe("validate", () => {
    it("should pass for a valid .tencil file", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      // Should not throw
      await expect(validateCommand()).resolves.toBeUndefined();
    });

    it("should validate a named file path", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "custom.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await expect(validateCommand("custom.tencil")).resolves.toBeUndefined();
    });

    it("should exit for a missing file", async () => {
      await expect(validateCommand("nonexistent.tencil")).rejects.toThrow();
    });

    it("should exit for an invalid .tencil file", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "bad.tencil"),
        JSON.stringify({ domain: "ui", nodes: [] }), // missing tencil + id
        "utf-8"
      );

      await expect(validateCommand("bad.tencil")).rejects.toThrow();
    });
  });

  // ─── export ──────────────────────────────────────────────────────────────

  describe("export", () => {
    it("should convert Penpot JSON to .tencil file", async () => {
      const inputPath = path.join(tmpDir, "design.json");
      fs.writeFileSync(inputPath, JSON.stringify(SAMPLE_PENPOT), "utf-8");

      await exportCommand("design.json", { output: "output.tencil" });

      const outputPath = path.join(tmpDir, "output.tencil");
      expect(fs.existsSync(outputPath)).toBe(true);

      const output = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
      expect(output.tencil).toBe("1.0");
      expect(output.domain).toBe("ui");
      expect(output.nodes.length).toBeGreaterThan(0);
    });

    it("should default output to <input-basename>.tencil", async () => {
      const inputPath = path.join(tmpDir, "design.json");
      fs.writeFileSync(inputPath, JSON.stringify(SAMPLE_PENPOT), "utf-8");

      await exportCommand("design.json", {});

      expect(fs.existsSync(path.join(tmpDir, "design.tencil"))).toBe(true);
    });

    it("should exit if input file does not exist", async () => {
      await expect(exportCommand("missing.json", {})).rejects.toThrow();
    });
  });

  // ─── import ──────────────────────────────────────────────────────────────

  describe("import", () => {
    it("should convert .tencil to Pencil operations JSON", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await importCommand(undefined, { output: "ops.pencil.json" });

      const outputPath = path.join(tmpDir, "ops.pencil.json");
      expect(fs.existsSync(outputPath)).toBe(true);

      const output = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
      expect(output.operations).toBeDefined();
      expect(Array.isArray(output.operations)).toBe(true);
      expect(output.operations.length).toBeGreaterThan(0);
      expect(output.operationCount).toBe(output.operations.length);
    });

    it("should include metadata in output", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await importCommand(undefined, {});

      const output = JSON.parse(
        fs.readFileSync(path.join(tmpDir, "operations.pencil.json"), "utf-8")
      );

      expect(output.source).toBe("project.tencil");
      expect(output.generated).toBeDefined();
    });

    it("should accept explicit input file path", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "custom.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await importCommand("custom.tencil", { output: "out.json" });

      expect(fs.existsSync(path.join(tmpDir, "out.json"))).toBe(true);
    });

    it("should exit if input file does not exist", async () => {
      await expect(importCommand("missing.tencil", {})).rejects.toThrow();
    });
  });

  // ─── push ───────────────────────────────────────────────────────────────────

  describe("push", () => {
    it("should convert .tencil to .penpot file", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await pushCommand(undefined, { to: "penpot", out: "output.penpot" });

      const outputPath = path.join(tmpDir, "output.penpot");
      expect(fs.existsSync(outputPath)).toBe(true);

      // .penpot files are ZIP archives — verify non-empty binary output
      const buf = fs.readFileSync(outputPath);
      expect(buf.length).toBeGreaterThan(0);
    });

    it("should default output filename from input basename", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "my-design.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await pushCommand("my-design.tencil", { to: "penpot" });

      expect(fs.existsSync(path.join(tmpDir, "my-design.penpot"))).toBe(true);
    });

    it("should accept explicit input file path", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "custom.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await pushCommand("custom.tencil", { to: "penpot", out: "result.penpot" });

      expect(fs.existsSync(path.join(tmpDir, "result.penpot"))).toBe(true);
    });

    it("should exit if input file does not exist", async () => {
      await expect(pushCommand("missing.tencil", { to: "penpot" })).rejects.toThrow();
    });

    it("should exit for unknown target", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await expect(pushCommand(undefined, { to: "figma" })).rejects.toThrow("Unknown target");
    });
  });

  // ─── link ────────────────────────────────────────────────────────────────

  describe("link", () => {
    it("should add a link to a .tencil file", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await linkCommand("add", "project.tencil", {
        from: "frame-1",
        to: "text-1",
        type: "controls",
      });

      const updated = JSON.parse(
        fs.readFileSync(path.join(tmpDir, "project.tencil"), "utf-8")
      );
      expect(updated.links).toHaveLength(1);
      expect(updated.links[0].type).toBe("controls");
      expect(updated.links[0].source.nodeId).toBe("frame-1");
      expect(updated.links[0].target.nodeId).toBe("text-1");
    });

    it("should list links in a .tencil file", async () => {
      const docWithLink = {
        ...SAMPLE_TENCIL,
        links: [
          {
            id: "link-1",
            type: "controls",
            source: { domain: "ui", nodeId: "frame-1" },
            target: { domain: "ui", nodeId: "text-1" },
          },
        ],
      };

      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(docWithLink),
        "utf-8"
      );

      await expect(linkCommand("list", "project.tencil")).resolves.toBeUndefined();
    });

    it("should reject adding a link with non-existent source node", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await expect(
        linkCommand("add", "project.tencil", {
          from: "nonexistent",
          to: "text-1",
          type: "controls",
        })
      ).rejects.toThrow("Source node not found");
    });

    it("should reject adding a link with non-existent target node", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await expect(
        linkCommand("add", "project.tencil", {
          from: "frame-1",
          to: "nonexistent",
          type: "controls",
        })
      ).rejects.toThrow("Target node not found");
    });

    it("should reject adding a duplicate link", async () => {
      const docWithLink = {
        ...SAMPLE_TENCIL,
        links: [
          {
            id: "link-1",
            type: "controls",
            source: { domain: "ui", nodeId: "frame-1" },
            target: { domain: "ui", nodeId: "text-1" },
          },
        ],
      };

      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(docWithLink),
        "utf-8"
      );

      await expect(
        linkCommand("add", "project.tencil", {
          from: "frame-1",
          to: "text-1",
          type: "controls",
        })
      ).rejects.toThrow("Duplicate link");
    });

    it("should reject invalid link type", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await expect(
        linkCommand("add", "project.tencil", {
          from: "frame-1",
          to: "text-1",
          type: "invalid-type",
        })
      ).rejects.toThrow("Invalid link type");
    });

    it("should default to project.tencil if no file specified", async () => {
      fs.writeFileSync(
        path.join(tmpDir, "project.tencil"),
        JSON.stringify(SAMPLE_TENCIL),
        "utf-8"
      );

      await linkCommand("add", undefined, {
        from: "frame-1",
        to: "text-1",
        type: "displays",
      });

      const updated = JSON.parse(
        fs.readFileSync(path.join(tmpDir, "project.tencil"), "utf-8")
      );
      expect(updated.links).toHaveLength(1);
      expect(updated.links[0].type).toBe("displays");
    });

    it("should exit if file not found", async () => {
      await expect(
        linkCommand("add", "missing.tencil", {
          from: "frame-1",
          to: "text-1",
          type: "controls",
        })
      ).rejects.toThrow("File not found");
    });
  });
});
