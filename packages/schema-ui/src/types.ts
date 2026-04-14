/**
 * UI domain schema for Tencil.
 * Defines types for UI/UX design elements: frames, text, rectangles, and basic shapes.
 */

import type { TencilNodeBase } from "@tencil/core";

/**
 * Layout direction for frames.
 */
export type FlexDirection = "row" | "column";

/**
 * Alignment modes for flex layouts.
 */
export type AlignmentMode = "start" | "center" | "end" | "space-between" | "space-around";

/**
 * A frame is a container for UI elements with optional flex or grid layout.
 * Equivalent to Penpot/Figma "board" or "frame".
 *
 * Layout capability tiers:
 * - Tier 1: "none" (absolute positioning) — supported by all tools
 * - Tier 2: "flex" (flex layout) — supported by Pencil, Penpot, Figma
 * - Tier 3: "grid" (CSS grid layout) — supported by Penpot, not Pencil
 */
export interface TencilFrame extends TencilNodeBase {
  type: "frame";
  /** Layout mode: none (absolute), flex, or grid */
  layout?: "none" | "flex" | "grid";
  /** Direction of flex layout */
  flexDirection?: FlexDirection;
  /** Flex gap/spacing */
  gap?: number;
  /** Main axis alignment (justify-content in CSS) */
  justifyContent?: "start" | "center" | "end" | "space-between" | "space-around";
  /** Cross axis alignment (align-items in CSS) */
  alignItems?: "start" | "center" | "end" | "stretch";
  /** Padding inside the frame */
  padding?: number | { top: number; right: number; bottom: number; left: number };
  /** Background fill color (hex) */
  fillColor?: string;
  /** Border stroke color (hex) */
  strokeColor?: string;
  /** Border thickness */
  strokeThickness?: number;
  /** Corner radius */
  cornerRadius?: number | [number, number, number, number];
  /** CSS grid template (Tier 3, preserved as metadata, not translated to Pencil) */
  gridTemplate?: string;
}

/**
 * A text element with typography properties.
 */
export interface TencilText extends TencilNodeBase {
  type: "text";
  /** Text content */
  content: string;
  /** Font family */
  fontFamily?: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Font weight (400, 500, 600, 700, etc.) */
  fontWeight?: number;
  /** Line height as multiplier (1.5) or absolute (20px) */
  lineHeight?: number | string;
  /** Text alignment */
  textAlign?: "left" | "center" | "right" | "justify";
  /** Text color (hex) */
  textColor?: string;
}

/**
 * A rectangle shape.
 */
export interface TencilRectangle extends TencilNodeBase {
  type: "rectangle";
  /** Fill color (hex) */
  fillColor?: string;
  /** Stroke color (hex) */
  strokeColor?: string;
  /** Stroke thickness */
  strokeThickness?: number;
  /** Corner radius */
  cornerRadius?: number | [number, number, number, number];
  /** Opacity (0-1) */
  opacity?: number;
}

/**
 * An ellipse/circle shape.
 */
export interface TencilEllipse extends TencilNodeBase {
  type: "ellipse";
  /** Fill color (hex) */
  fillColor?: string;
  /** Stroke color (hex) */
  strokeColor?: string;
  /** Stroke thickness */
  strokeThickness?: number;
  /** Opacity (0-1) */
  opacity?: number;
}

/**
 * A vector path element.
 * Deferred to M2 — basic shapes sufficient for M1 MVP.
 */
export interface TencilPath extends TencilNodeBase {
  type: "path";
  /** SVG path data */
  pathData: string;
  /** Fill color (hex) */
  fillColor?: string;
  /** Stroke color (hex) */
  strokeColor?: string;
  /** Stroke thickness */
  strokeThickness?: number;
}

/**
 * Union of all UI node types.
 */
export type TencilUINode =
  | TencilFrame
  | TencilText
  | TencilRectangle
  | TencilEllipse
  | TencilPath;
