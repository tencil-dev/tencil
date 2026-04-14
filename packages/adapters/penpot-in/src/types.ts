/**
 * Type definitions for Penpot export JSON structure.
 * These match Penpot's actual export format (version 2+).
 */

/**
 * Penpot's color representation (RGBA).
 */
export interface PenpotColor {
  r: number;
  g: number;
  b: number;
  a?: number; // opacity (0-1)
}

/**
 * Penpot's flex layout configuration.
 */
export interface PenpotFlexLayout {
  layout?: "flex";
  "flex-direction"?: "row" | "column";
  "justify-content"?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  "align-content"?: string;
  gap?: number;
  padding?: number | { x: number; y: number };
}

/**
 * Base Penpot node (shape, text, frame, etc.).
 */
export interface PenpotNode {
  id: string;
  name: string;
  type: string; // "frame", "rect", "text", "group", "ellipse", "path", etc.
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;

  // Fill and stroke
  fills?: PenpotColor[];
  strokes?: Array<{
    color: PenpotColor;
    width: number;
  }>;
  "stroke-width"?: number;

  // Corner radius
  "rx"?: number;
  "ry"?: number;

  // Flex layout (if frame)
  layout?: "flex";
  "flex-direction"?: "row" | "column";
  "justify-content"?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  "align-content"?: string;
  gap?: number;
  padding?: number | { x: number; y: number };

  // Text properties
  content?: string;
  "font-family"?: string;
  "font-size"?: number;
  "font-weight"?: number | string;
  "line-height"?: number;
  "text-align"?: string;
  color?: PenpotColor;

  // Children (nested nodes)
  shapes?: PenpotNode[];
  children?: string[]; // IDs of child nodes

  [key: string]: unknown;
}

/**
 * Penpot file export (root document).
 */
export interface PenpotExport {
  name?: string;
  version?: number;
  id?: string;
  type?: "file" | "page";
  objects?: PenpotNode[];
  shapes?: PenpotNode[];
  [key: string]: unknown;
}
