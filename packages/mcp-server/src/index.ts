/**
 * @tencil/mcp-server
 *
 * Model Context Protocol (MCP) server for Tencil.
 * Exposes Tencil documents and adapters to Claude and other AI agents.
 * Implementation deferred — M1 scope, not yet started.
 *
 * Tools provided:
 * 1. read_tencil — Read and parse a .tencil file
 * 2. write_tencil — Write/modify a .tencil file
 * 3. invoke_adapter — Run any registered adapter
 */

import type { TencilDocument } from "@tencil/core";

export interface MCPToolInput {
  [key: string]: unknown;
}

export async function readTencil(_filePath: string): Promise<TencilDocument> {
  throw new Error("readTencil: Not yet implemented");
}

export async function writeTencil(
  _filePath: string,
  _document: TencilDocument
): Promise<void> {
  throw new Error("writeTencil: Not yet implemented");
}

export async function invokeAdapter(
  _adapterName: string,
  _input: MCPToolInput
): Promise<unknown> {
  throw new Error("invokeAdapter: Not yet implemented");
}

export default {
  readTencil,
  writeTencil,
  invokeAdapter,
};
