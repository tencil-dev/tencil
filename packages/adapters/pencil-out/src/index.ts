/**
 * @tencil/adapter-pencil-out
 *
 * Converts Tencil documents to Pencil.dev designs via the Pencil MCP.
 * Implementation deferred — M1 scope, not yet started.
 *
 * Usage:
 * ```typescript
 * import { tencilToPencil } from "@tencil/adapter-pencil-out";
 *
 * const tencilDoc = parseTencilDocument(json);
 * const pencilOps = tencilToPencil(tencilDoc);
 * // Pass pencilOps to Pencil MCP batch_design tool
 * ```
 */

import type { TencilDocument } from "@tencil/core";

/**
 * Placeholder: Convert TencilDocument to Pencil.dev batch_design operations.
 * Returns an array of operation strings suitable for Pencil MCP.
 */
export function tencilToPencil(
  _tencilDoc: TencilDocument
): string[] {
  throw new Error("tencilToPencil: Not yet implemented");
}

export default tencilToPencil;
