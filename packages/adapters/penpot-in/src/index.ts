/**
 * @tencil/adapter-penpot-in
 *
 * Converts Penpot design exports to Tencil format.
 * Implementation deferred — M1 scope, not yet started.
 *
 * Usage:
 * ```typescript
 * import { penpotToTencil } from "@tencil/adapter-penpot-in";
 *
 * const penpotExport = JSON.parse(fs.readFileSync("design.json"));
 * const tencilDoc = penpotToTencil(penpotExport, { id: "my-design" });
 * ```
 */

import type { TencilDocument } from "@tencil/core";

/**
 * Placeholder: Convert Penpot export JSON to TencilDocument.
 * Handles: frames, text, rectangles, fill colors, flex layouts.
 */
export function penpotToTencil(
  _penpotData: unknown,
  _options?: { id?: string; name?: string }
): TencilDocument {
  throw new Error("penpotToTencil: Not yet implemented");
}

export default penpotToTencil;
