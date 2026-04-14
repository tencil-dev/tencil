/**
 * Zod-based validation schemas for Tencil documents.
 * Provides both TypeScript types and runtime validation.
 */

import { z } from "zod";
import type {
  TencilDocument,
  TencilValidationResult,
  TencilValidationError,
  TencilLink,
} from "./types.js";

/**
 * Zod schema for TencilDomain
 */
const DomainSchema = z.enum(["ui", "ee", "3d", "med", "multi"]);

/**
 * Zod schema for TencilLinkType
 */
const LinkTypeSchema = z.enum([
  "controls",
  "displays",
  "located-at",
  "encloses",
  "mounts-on",
  "powered-by",
  "triggers",
  "reads-from",
  "prescribes",
]);

/**
 * Zod schema for TencilGeometry
 */
const GeometrySchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  rotation: z.number().optional(),
});

/**
 * Zod schema for TencilNodeBase
 */
const NodeBaseSchema = GeometrySchema.extend({
  id: z.string().min(1, "Node ID cannot be empty"),
  type: z.string().min(1, "Node type cannot be empty"),
  name: z.string().optional(),
  parentId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Zod schema for TencilLink
 */
const LinkSchema = z.object({
  id: z.string().min(1, "Link ID cannot be empty"),
  source: z.object({
    domain: DomainSchema,
    nodeId: z.string().min(1),
  }),
  target: z.object({
    domain: DomainSchema,
    nodeId: z.string().min(1),
  }),
  type: LinkTypeSchema,
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Zod schema for TencilDocument
 */
const DocumentSchema = z.object({
  tencil: z.literal("1.0"),
  domain: DomainSchema,
  id: z.string().min(1, "Document ID cannot be empty"),
  name: z.string().optional(),
  description: z.string().optional(),
  nodes: z.array(NodeBaseSchema).default([]),
  links: z.array(LinkSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Parse and validate a TencilDocument from unknown JSON.
 * Returns a typed result with either the valid document or detailed errors.
 *
 * @param data - Raw JSON data to validate
 * @returns Validation result with success/failure status
 *
 * @example
 * const result = parseTencilDocument(jsonData);
 * if (result.success) {
 *   console.log("Valid:", result.data.name);
 * } else {
 *   console.error("Errors:", result.errors);
 * }
 */
export function parseTencilDocument(
  data: unknown
): TencilValidationResult {
  try {
    const parsed = DocumentSchema.parse(data);
    return {
      success: true,
      data: parsed as TencilDocument,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: TencilValidationError[] = error.errors.map((err) => ({
        field: err.path.join(".") || "root",
        message: err.message,
        value: (err as any).received,
        path: err.path,
      }));
      return {
        success: false,
        errors,
      };
    }

    // Unexpected error
    return {
      success: false,
      errors: [
        {
          field: "unknown",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      ],
    };
  }
}

/**
 * Validate a TencilDocument that's already typed.
 * Useful for programmatic document construction.
 *
 * @param doc - TencilDocument to validate
 * @returns Validation result
 */
export function validateTencilDocument(
  doc: unknown
): TencilValidationResult {
  return parseTencilDocument(doc);
}

/**
 * Validate referential integrity of links in a TencilDocument.
 * Checks that all referenced node IDs exist in the document.
 *
 * @param doc - TencilDocument to validate
 * @returns Validation result with errors if links reference non-existent nodes
 */
export function validateLinkIntegrity(doc: TencilDocument): TencilValidationResult {
  const errors: TencilValidationError[] = [];
  const nodeIds = new Set(doc.nodes.map((n) => n.id));

  if (doc.links) {
    for (const link of doc.links) {
      if (!nodeIds.has(link.source.nodeId)) {
        errors.push({
          field: `links.${link.id}.source.nodeId`,
          message: `Source node not found: ${link.source.nodeId}`,
          value: link.source.nodeId,
        });
      }
      if (!nodeIds.has(link.target.nodeId)) {
        errors.push({
          field: `links.${link.id}.target.nodeId`,
          message: `Target node not found: ${link.target.nodeId}`,
          value: link.target.nodeId,
        });
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: doc };
}

/**
 * Export the Zod schema for advanced use cases.
 * (e.g., custom extensions, conditional validation)
 */
export const TencilDocumentSchema = DocumentSchema;
export const TencilNodeSchema = NodeBaseSchema;
export const TencilLinkSchema = LinkSchema;
