/**
 * Core types for the Tencil universal design translation protocol.
 * These types form the foundation for all domain-specific schemas.
 */

/**
 * Supported design domains in Tencil.
 * - "ui": User interface / product design
 * - "ee": Electronics / schematic design
 * - "3d": Mechanical / 3D CAD
 * - "med": Medical / healthcare data
 * - "multi": Multi-domain document with cross-domain links
 */
export type TencilDomain = "ui" | "ee" | "3d" | "med" | "multi";

/**
 * Cross-domain link types describing semantic relationships between nodes.
 * These enable AI reasoning about how different domains relate to each other.
 */
export type TencilLinkType =
  | "controls"      // UI button/control → electrical GPIO pin or signal
  | "displays"      // UI label/element → sensor or data source
  | "located-at"    // 3D model element → PCB location or coordinate
  | "encloses"      // 3D housing → PCB (spatial containment)
  | "mounts-on"     // PCB → 3D mounting point or standoff
  | "powered-by"    // Component or subsystem → power rail
  | "triggers"      // Sensor event → UI alert or notification
  | "reads-from"    // UI field → medical device or data source
  | "prescribes";   // Medical action → patient record

/**
 * Base geometry shared across all domains.
 * Provided for spatial layout and positioning.
 */
export interface TencilGeometry {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

/**
 * Base node type — all design elements extend this.
 * Every node has an ID, type, and optional spatial properties.
 */
export interface TencilNodeBase extends TencilGeometry {
  /** Unique identifier within the document */
  id: string;
  /** Node type: domain-specific (e.g., "frame", "symbol", "mesh") */
  type: string;
  /** Optional name for the node */
  name?: string;
  /** Optional description or metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Cross-domain link connecting nodes in different domains.
 * Links enable reasoning about relationships between design domains.
 */
export interface TencilLink {
  /** Unique identifier for this link */
  id: string;
  /** Source node reference */
  source: {
    domain: TencilDomain;
    nodeId: string;
  };
  /** Target node reference */
  target: {
    domain: TencilDomain;
    nodeId: string;
  };
  /** Type of relationship */
  type: TencilLinkType;
  /** Optional metadata specific to this link (e.g., "torque": "2.5 Nm" for mounts-on) */
  metadata?: Record<string, unknown>;
}

/**
 * Universal Tencil document container.
 * This is the root schema for all `.tencil` files.
 */
export interface TencilDocument {
  /** Protocol version (currently "1.0") */
  tencil: "1.0";
  /** Design domain(s) in this document */
  domain: TencilDomain;
  /** Unique document identifier */
  id: string;
  /** Optional project/document name */
  name?: string;
  /** Optional description */
  description?: string;
  /** All nodes in this document */
  nodes: TencilNodeBase[];
  /** All cross-domain links (optional if single-domain) */
  links?: TencilLink[];
  /** Optional metadata (e.g., author, created date, version history) */
  metadata?: Record<string, unknown>;
}

/**
 * Validation error with detailed location information.
 * Helps identify exactly what went wrong in a `.tencil` file.
 */
export interface TencilValidationError {
  field: string;
  message: string;
  value?: unknown;
  path?: (string | number)[];
}

/**
 * Result of validating a TencilDocument.
 * Success includes the parsed document; failure includes detailed errors.
 */
export type TencilValidationResult =
  | { success: true; data: TencilDocument }
  | { success: false; errors: TencilValidationError[] };
