/**
 * Type definitions for Pencil.dev MCP operations.
 * Used to generate batch_design commands for the Pencil MCP server.
 */

/**
 * A single operation in the batch_design language.
 * Each operation is a line of valid operation syntax.
 */
export type BatchDesignOperation = string;

/**
 * Options for converting Tencil to Pencil.dev.
 * Currently unused; reserved for future features.
 */
export interface TencilToPencilOptions {
  // Reserved for future extensions
}

/**
 * Per-node outcome in a translation report.
 */
export interface TranslationReportDetail {
  nodeId: string;
  nodeName: string;
  operation: "translated" | "approximated" | "skipped";
  reason?: string;
  suggestion?: string;
}

/**
 * Summary report returned alongside batch_design operations.
 * Gives users visibility into what transferred cleanly, what was
 * approximated (e.g. grid → flex), and what was skipped entirely.
 */
export interface TranslationReport {
  success: boolean;
  summary: {
    totalNodes: number;
    translated: number;
    approximated: number;
    skipped: number;
  };
  details: TranslationReportDetail[];
}

/**
 * Full result returned by tencilToPencil.
 */
export interface TencilToPencilResult {
  operations: BatchDesignOperation[];
  report: TranslationReport;
}
