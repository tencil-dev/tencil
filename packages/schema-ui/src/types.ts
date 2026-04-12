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
 * A frame is a container for UI elements with optional flex layout.
 * Equivalent to Penpot/Figma "board" or "frame".
 */
export interface TencilFrame extends TencilNodeBase {
  type: "frame";
  /** Layout mode: none (absolute) or flex */
  layout?: "flex" | "none";
  /** Direction of flex layout */
  flexDirection?: FlexDirection;
  /** Flex gap/spacing */
  gap?: number;
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
