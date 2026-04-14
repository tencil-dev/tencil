/**
 * Types for the pencil-in adapter.
 *
 * PencilNode represents the node structure returned by the Pencil MCP
 * batch_get tool. The properties mirror what pencil-out writes via batch_design.
 */

export interface PencilNode {
  /** Node unique identifier (assigned by Pencil.dev) */
  id: string;
  /** Node display name */
  name?: string;
  /** Node type */
  type: "frame" | "rectangle" | "ellipse" | "text" | "group" | string;

  // ─── Geometry ──────────────────────────────────────────────────────────────
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;

  // ─── Fill / Stroke ─────────────────────────────────────────────────────────
  fillColor?: string;
  strokeColor?: string;
  strokeThickness?: number;
  opacity?: number;
  cornerRadius?: number | [number, number, number, number];

  // ─── Frame / Layout ────────────────────────────────────────────────────────
  layout?: "flex" | "grid" | string;
  flexDirection?: "row" | "column";
  gap?: number;
  padding?: number | [number, number] | [number, number, number, number];

  // ─── Text ──────────────────────────────────────────────────────────────────
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  textColor?: string;

  // ─── Hierarchy ─────────────────────────────────────────────────────────────
  /** IDs of direct children */
  children?: string[];
  /** Parent node ID */
  parentId?: string;

  /** Allow additional properties from Pencil internals */
  [key: string]: unknown;
}

export interface PencilToTencilOptions {
  /** Override document id (default: auto-generated UUID) */
  id?: string;
  /** Override document name */
  name?: string;
  /**
   * When true, preserve the full node tree including group/frame children.
   * When false (default), only top-level nodes are included.
   */
  flattenAll?: boolean;
}
