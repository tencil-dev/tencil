/**
 * penpot-unpack.mjs
 *
 * Unpacks a .penpot ZIP file into the JSON format that @tencil/adapter-penpot-in expects.
 * Usage: node scripts/penpot-unpack.mjs <file.penpot> [output.json]
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import os from "os";

const [, , inputFile, outputFile] = process.argv;

if (!inputFile) {
  console.error("Usage: node scripts/penpot-unpack.mjs <file.penpot> [output.json]");
  process.exit(1);
}

const inputPath = path.resolve(inputFile);
const outputPath = outputFile
  ? path.resolve(outputFile)
  : inputPath.replace(/\.penpot$/, ".json");

if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

// Extract to a temp directory
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tencil-penpot-"));
console.log(`Extracting ${path.basename(inputPath)}...`);

try {
  execSync(`unzip -q "${inputPath}" -d "${tmpDir}"`);
} catch (e) {
  console.error("Failed to unzip. Make sure unzip is installed.");
  process.exit(1);
}

// Find the files directory
const filesDir = path.join(tmpDir, "files");
if (!fs.existsSync(filesDir)) {
  console.error("Unexpected .penpot structure — no files/ directory found.");
  process.exit(1);
}

// Find the file ID (first directory in files/)
const fileIds = fs.readdirSync(filesDir).filter(f => !f.endsWith(".json"));
if (fileIds.length === 0) {
  console.error("No file directories found in files/");
  process.exit(1);
}
const fileId = fileIds[0];

// Read the file metadata
const fileMeta = JSON.parse(
  fs.readFileSync(path.join(filesDir, `${fileId}.json`), "utf-8")
);
const fileName = fileMeta.name || "Penpot Design";

// Find the pages directory
const pagesDir = path.join(filesDir, fileId, "pages");
if (!fs.existsSync(pagesDir)) {
  console.error("No pages directory found.");
  process.exit(1);
}

// Get all page IDs
const pageIds = fs.readdirSync(pagesDir).filter(f => !f.endsWith(".json"));
console.log(`Found ${pageIds.length} page(s).`);

// Collect all shapes across all pages
const allObjects = [];
const seen = new Set();

for (const pageId of pageIds) {
  const shapesDir = path.join(pagesDir, pageId);
  if (!fs.existsSync(shapesDir)) continue;

  const shapeFiles = fs.readdirSync(shapesDir).filter(f => f.endsWith(".json"));

  for (const shapeFile of shapeFiles) {
    const shapeId = shapeFile.replace(".json", "");

    // Skip root frame
    if (shapeId === "00000000-0000-0000-0000-000000000000") continue;
    if (seen.has(shapeId)) continue;
    seen.add(shapeId);

    const shapeData = JSON.parse(
      fs.readFileSync(path.join(shapesDir, shapeFile), "utf-8")
    );

    // Normalize fills: .penpot uses fillColor/fillOpacity, adapter expects {r,g,b}
    const fills = (shapeData.fills || [])
      .filter(f => f.fillColor)
      .map(f => hexToRgb(f.fillColor, f.fillOpacity));

    // Normalize strokes
    const strokes = (shapeData.strokes || [])
      .filter(s => s.strokeColor)
      .map(s => ({
        color: hexToRgb(s.strokeColor, s.strokeOpacity),
        width: s.strokeWidth || 1,
      }));

    // Map type
    const type = normalizeType(shapeData.type);

    const node = {
      id: shapeData.id,
      name: shapeData.name,
      type,
      x: shapeData.x,
      y: shapeData.y,
      width: shapeData.width,
      height: shapeData.height,
      rotation: shapeData.rotation || 0,
    };

    if (fills.length > 0) node.fills = fills;
    if (strokes.length > 0) node.strokes = strokes;
    if (shapeData.r1 != null && shapeData.r1 !== 0) node.rx = shapeData.r1;

    // Flex layout
    if (shapeData.layout === "flex" || shapeData.layout === ":flex") {
      node.layout = "flex";
      node["flex-direction"] = normalizeFlexDir(shapeData["layout-flex-dir"]);
      node.gap = shapeData["layout-gap"]?.rowGap ?? shapeData["layout-gap"] ?? 0;
    }

    // Text
    if (type === "text") {
      node.content = extractTextContent(shapeData);
      const style = extractTextStyle(shapeData);
      if (style.fontFamily) node["font-family"] = style.fontFamily;
      if (style.fontSize) node["font-size"] = style.fontSize;
      if (style.fontWeight) node["font-weight"] = style.fontWeight;
      if (style.fill) node.color = hexToRgb(style.fill);
    }

    // Children
    if (shapeData.shapes && shapeData.shapes.length > 0) {
      node.shapes = shapeData.shapes
        .map(childId => ({ id: childId }))
        .filter(Boolean);
    }

    allObjects.push(node);
  }
}

// Build the output structure
const output = {
  name: fileName,
  id: fileId,
  objects: allObjects,
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

// Cleanup
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`Done. ${allObjects.length} shapes → ${path.basename(outputPath)}`);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgb(hex, opacity) {
  if (!hex) return { r: 0, g: 0, b: 0 };
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const result = { r, g, b };
  if (opacity != null && opacity !== 1) result.a = opacity;
  return result;
}

function normalizeType(type) {
  if (!type) return "rectangle";
  const t = type.replace(/^:/, "").toLowerCase();
  if (t === "frame" || t === "board") return "frame";
  if (t === "text") return "text";
  if (t === "rect" || t === "rectangle") return "rectangle";
  if (t === "ellipse" || t === "circle") return "ellipse";
  if (t === "path") return "path";
  if (t === "group") return "group";
  return "rectangle";
}

function normalizeFlexDir(dir) {
  if (!dir) return "row";
  const d = String(dir).replace(/^:/, "").toLowerCase();
  if (d === "column" || d === "col") return "column";
  return "row";
}

function extractTextContent(shape) {
  try {
    const content = shape.content;
    if (!content) return "";
    if (typeof content === "string") return content;
    // Penpot text content is a nested structure
    const paragraphs = content.children || [];
    return paragraphs
      .flatMap(p => (p.children || []).map(leaf => leaf.text || ""))
      .join(" ")
      .trim();
  } catch {
    return "";
  }
}

function extractTextStyle(shape) {
  try {
    const paragraph = shape.content?.children?.[0];
    const leaf = paragraph?.children?.[0];
    return {
      fontFamily: leaf?.fontFamily || paragraph?.fontFamily,
      fontSize: parseFloat(leaf?.fontSize || paragraph?.fontSize),
      fontWeight: leaf?.fontWeight || paragraph?.fontWeight,
      fill: leaf?.fillColor || paragraph?.fillColor,
    };
  } catch {
    return {};
  }
}
