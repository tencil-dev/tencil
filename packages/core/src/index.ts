/**
 * @tencil/core
 *
 * Core types and validation for the Tencil universal design translation protocol.
 * This package provides:
 *
 * - TypeScript types for TencilDocument, TencilNodeBase, TencilLink
 * - Zod-based runtime validation
 * - Standard link types for cross-domain reasoning
 *
 * @example
 * ```typescript
 * import { parseTencilDocument } from "@tencil/core";
 * import * as fs from "fs";
 *
 * const json = JSON.parse(fs.readFileSync("project.tencil", "utf-8"));
 * const result = parseTencilDocument(json);
 *
 * if (result.success) {
 *   console.log(`Loaded ${result.data.nodes.length} nodes`);
 *   for (const link of result.data.links || []) {
 *     console.log(`${link.source.nodeId} ${link.type} ${link.target.nodeId}`);
 *   }
 * } else {
 *   console.error("Validation failed:");
 *   for (const err of result.errors) {
 *     console.error(`  ${err.field}: ${err.message}`);
 *   }
 * }
 * ```
 */

// Re-export types
export type {
  TencilDomain,
  TencilLinkType,
  TencilGeometry,
  TencilNodeBase,
  TencilLink,
  TencilDocument,
  TencilValidationError,
  TencilValidationResult,
} from "./types.js";

// Re-export validation functions
export {
  parseTencilDocument,
  validateTencilDocument,
  validateLinkIntegrity,
  TencilDocumentSchema,
  TencilNodeSchema,
  TencilLinkSchema,
} from "./validate.js";

// Version
export const TENCIL_VERSION = "0.1.1";
export const PROTOCOL_VERSION = "1.0";
