/**
 * Type definitions for the native .penpot ZIP file format.
 *
 * A .penpot file is a ZIP archive with this structure:
 *   files/<fileId>.json                          ← file metadata
 *   files/<fileId>/pages/<pageId>.json           ← page metadata
 *   files/<fileId>/pages/<pageId>/<shapeId>.json ← one JSON file per shape
 *
 * This is different from Penpot's HTTP export API format:
 * - Colors: fillColor is a hex string (not RGB objects)
 * - shapes: array of child IDs (not nested shape objects)
 * - types: "circle" (not "ellipse"), "rect" (not "rectangle")
 */

/** Penpot file metadata (files/<fileId>.json) */
export interface PenpotFileMeta {
  id: string;
  name: string;
  version?: number;
  features?: string[];
  projectId?: string;
  teamId?: string;
  createdAt?: string;
  modifiedAt?: string;
  [key: string]: unknown;
}

/** Penpot page metadata (files/<fileId>/pages/<pageId>.json) */
export interface PenpotPageMeta {
  id: string;
  name: string;
  index?: number;
  guides?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Penpot fill in native file format */
export interface PenpotFileFill {
  fillColor?: string;        // hex string e.g. "#ffffff"
  fillOpacity?: number;      // 0-1
  fillColorGradient?: unknown;
  [key: string]: unknown;
}

/** Penpot stroke in native file format */
export interface PenpotFileStroke {
  strokeColor?: string;      // hex string
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeStyle?: string;
  strokePosition?: string;
  [key: string]: unknown;
}

/** Penpot shape JSON (one file per shape in the ZIP) */
export interface PenpotFileShape {
  id: string;
  name: string;
  type: string;             // "frame", "rect", "text", "circle", "path", "group", "bool"
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;

  parentId?: string;
  frameId?: string;

  /** Child shape IDs (for frames and groups) */
  shapes?: string[];

  fills?: PenpotFileFill[];
  strokes?: PenpotFileStroke[];

  /** Corner radius */
  r1?: number;
  r2?: number;
  r3?: number;
  r4?: number;

  /** Flex layout */
  layout?: string;              // "flex" | "grid"
  layoutFlexDir?: string;       // "row" | "column" | "row-reverse" | "column-reverse"
  layoutGap?: { rowGap?: number; columnGap?: number } | number;
  layoutPadding?: { p1?: number; p2?: number; p3?: number; p4?: number };

  /** Text content */
  content?: PenpotTextContent | string;

  /** Grid layout */
  layoutGridColumns?: unknown[];
  layoutGridRows?: unknown[];

  [key: string]: unknown;
}

/** Penpot text content structure */
export interface PenpotTextContent {
  type?: string;
  children?: PenpotTextParagraph[];
  [key: string]: unknown;
}

export interface PenpotTextParagraph {
  type?: string;
  children?: PenpotTextNode[];
  [key: string]: unknown;
}

export interface PenpotTextNode {
  text?: string;
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  lineHeight?: string | number;
  textAlign?: string;
  fillColor?: string;
  fillOpacity?: number;
  fills?: PenpotFileFill[];
  [key: string]: unknown;
}

/** Parsed .penpot ZIP contents ready for conversion */
export interface PenpotZipContents {
  fileMeta: PenpotFileMeta;
  pages: PenpotPageMeta[];
  /** Map from shapeId → shape, for a given page */
  shapes: Map<string, PenpotFileShape>;
}
