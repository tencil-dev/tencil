/**
 * @tencil/mcp-server
 *
 * Model Context Protocol (MCP) server for Tencil.
 * Exposes Tencil documents and adapters to Claude and other AI agents via stdio.
 *
 * Tools:
 * 1. read_tencil       — Read and parse a .tencil file; returns a summary (not full JSON)
 * 2. write_tencil      — Write/modify a .tencil file to disk
 * 3. summarize_tencil  — Return metadata summary of a .tencil file without full content
 * 4. invoke_adapter    — Run a named adapter (penpot-in, penpot-file-in, penpot-out, pencil-out)
 * 5. pull_from_pencil  — Read active Pencil.dev design via Pencil MCP → write .tencil file
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { parseTencilDocument, validateTencilDocument, validateLinkIntegrity } from "@tencil/core";
import type { TencilDocument, TencilLink, TencilLinkType } from "@tencil/core";
import { penpotToTencil } from "@tencil/adapter-penpot-in";
import { tencilToPencil } from "@tencil/adapter-pencil-out";

const _require = createRequire(import.meta.url);

/** Dynamically load an optional adapter package by name. Returns null if not installed. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadAdapter(pkg: string): Promise<any | null> {
  try {
    return _require(pkg);
  } catch {
    return null;
  }
}

// ─── Summary helper ───────────────────────────────────────────────────────────

function makeSummary(doc: TencilDocument, filePath?: string) {
  return {
    id: doc.id,
    name: doc.name ?? null,
    domain: doc.domain,
    nodeCount: doc.nodes.length,
    linkCount: doc.links?.length ?? 0,
    ...(filePath ? { filePath } : {}),
  };
}

// ─── Tool Definitions ────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "read_tencil",
    description:
      "Read and parse a .tencil file from disk. Returns a summary (id, name, domain, nodeCount, linkCount) — NOT the full document. Use summarize_tencil for the same without parsing, or read the file directly if you need raw nodes.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Absolute or relative path to the .tencil file",
        },
      },
      required: ["filePath"],
    },
  },
  {
    name: "write_tencil",
    description:
      "Write a TencilDocument to disk as a .tencil file. Validates the document before writing.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Absolute or relative path for the output .tencil file",
        },
        document: {
          type: "object",
          description: "TencilDocument to write (must be a valid TencilDocument object)",
        },
      },
      required: ["filePath", "document"],
    },
  },
  {
    name: "summarize_tencil",
    description:
      "Return metadata summary of a .tencil file (id, name, domain, nodeCount, linkCount) without loading full content into context.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Absolute or relative path to the .tencil file",
        },
      },
      required: ["filePath"],
    },
  },
  {
    name: "invoke_adapter",
    description:
      "Run a named adapter to convert between formats.\n\nAvailable adapters:\n- penpot-in: Penpot HTTP export JSON → Tencil (writes .tencil file, returns summary)\n- penpot-file-in: Raw .penpot ZIP file → Tencil (reads file from disk, writes .tencil, returns summary)\n- penpot-out: Tencil → .penpot ZIP file (writes .penpot file to disk)\n- pencil-out: Tencil → Pencil.dev batch_design operations (returns operations array)",
    inputSchema: {
      type: "object",
      properties: {
        adapter: {
          type: "string",
          enum: ["penpot-in", "penpot-file-in", "penpot-out", "pencil-out"],
          description: "Name of the adapter to invoke",
        },
        input: {
          type: "object",
          description: "Input data for the adapter (format depends on adapter)",
        },
        options: {
          type: "object",
          description:
            "Options for the adapter. Common fields: { id, name, outputPath, inputPath }",
        },
      },
      required: ["adapter", "input"],
    },
  },
  {
    name: "pull_from_pencil",
    description:
      "Read the currently active Pencil.dev design via the Pencil MCP tools and convert it to a .tencil file. Requires the Pencil MCP server to be running and a document to be open. Returns a summary of the written .tencil file.",
    inputSchema: {
      type: "object",
      properties: {
        outputPath: {
          type: "string",
          description: "Path where the .tencil file will be written (e.g. pulled.tencil)",
        },
        name: {
          type: "string",
          description: "Optional name for the TencilDocument",
        },
      },
      required: ["outputPath"],
    },
  },
  {
    name: "create_link",
    description:
      "Create a cross-domain link in a .tencil file. Links describe semantic relationships between nodes (e.g., UI button controls GPIO pin). Validates that both source and target node IDs exist before creating the link.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the .tencil file",
        },
        fromNodeId: {
          type: "string",
          description: "Source node ID",
        },
        toNodeId: {
          type: "string",
          description: "Target node ID",
        },
        linkType: {
          type: "string",
          enum: ["controls", "displays", "located-at", "encloses", "mounts-on", "powered-by", "triggers", "reads-from", "prescribes"],
          description: "Type of relationship",
        },
        metadata: {
          type: "object",
          description: "Optional metadata for this link (e.g., { torque: '2.5 Nm' })",
        },
      },
      required: ["filePath", "fromNodeId", "toNodeId", "linkType"],
    },
  },
  {
    name: "list_links",
    description:
      "List all cross-domain links in a .tencil file. Shows link ID, type, source node, and target node for each link.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the .tencil file",
        },
      },
      required: ["filePath"],
    },
  },
];

// ─── Tool Handlers ────────────────────────────────────────────────────────────

function handleReadTencil(input: { filePath: string }) {
  const filePath = path.resolve(process.cwd(), input.filePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`File is not valid JSON: ${filePath}`);
  }

  const result = parseTencilDocument(json);
  if (!result.success) {
    throw new Error(
      `Invalid .tencil file:\n${result.errors.map((e) => `  ${e.field}: ${e.message}`).join("\n")}`
    );
  }

  // Return summary only — not full document JSON
  return makeSummary(result.data, filePath);
}

function handleSummarizeTencil(input: { filePath: string }) {
  return handleReadTencil(input);
}

function handleWriteTencil(input: { filePath: string; document: unknown }) {
  const filePath = path.resolve(process.cwd(), input.filePath);

  const validation = validateTencilDocument(input.document);
  if (!validation.success) {
    throw new Error(
      `Invalid TencilDocument:\n${validation.errors.map((e) => `  ${e.field}: ${e.message}`).join("\n")}`
    );
  }

  const content = JSON.stringify(validation.data, null, 2);
  fs.writeFileSync(filePath, content, "utf-8");

  return {
    success: true,
    filePath,
    nodes: validation.data.nodes.length,
    links: validation.data.links?.length ?? 0,
  };
}


function handleCreateLink(input: {
  filePath: string;
  fromNodeId: string;
  toNodeId: string;
  linkType: TencilLinkType;
  metadata?: Record<string, unknown>;
}) {
  const filePath = path.resolve(process.cwd(), input.filePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`File is not valid JSON: ${filePath}`);
  }

  const result = parseTencilDocument(json);
  if (!result.success) {
    throw new Error(
      `Invalid .tencil file:\n${result.errors.map((e) => `  ${e.field}: ${e.message}`).join("\n")}`
    );
  }

  const doc = result.data;

  // Verify nodes exist
  const sourceNode = doc.nodes.find((n) => n.id === input.fromNodeId);
  const targetNode = doc.nodes.find((n) => n.id === input.toNodeId);

  if (!sourceNode) {
    throw new Error(`Source node not found: ${input.fromNodeId}`);
  }

  if (!targetNode) {
    throw new Error(`Target node not found: ${input.toNodeId}`);
  }

  // Check for duplicate
  const isDuplicate = doc.links?.some(
    (l) =>
      l.source.nodeId === input.fromNodeId &&
      l.target.nodeId === input.toNodeId &&
      l.type === input.linkType
  );

  if (isDuplicate) {
    throw new Error("A link with these properties already exists");
  }

  // Create link
  const linkId = `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newLink: TencilLink = {
    id: linkId,
    source: {
      domain: doc.domain,
      nodeId: input.fromNodeId,
    },
    target: {
      domain: doc.domain,
      nodeId: input.toNodeId,
    },
    type: input.linkType,
    metadata: input.metadata,
  };

  if (!doc.links) {
    doc.links = [];
  }

  doc.links.push(newLink);

  // Validate
  const validation = validateTencilDocument(doc);
  if (!validation.success) {
    throw new Error(
      `Validation failed:\n${validation.errors.map((e: { field: string; message: string }) => `  ${e.field}: ${e.message}`).join("\n")}`
    );
  }

  const linkValidation = validateLinkIntegrity(validation.data);
  if (!linkValidation.success) {
    throw new Error(
      `Link validation failed:\n${linkValidation.errors.map((e: { field: string; message: string }) => `  ${e.field}: ${e.message}`).join("\n")}`
    );
  }

  // Write back
  const content = JSON.stringify(linkValidation.data, null, 2);
  fs.writeFileSync(filePath, content, "utf-8");

  return {
    success: true,
    linkId,
    linkCount: linkValidation.data.links?.length ?? 0,
  };
}

function handleListLinks(input: { filePath: string }) {
  const filePath = path.resolve(process.cwd(), input.filePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`File is not valid JSON: ${filePath}`);
  }

  const result = parseTencilDocument(json);
  if (!result.success) {
    throw new Error(
      `Invalid .tencil file:\n${result.errors.map((e) => `  ${e.field}: ${e.message}`).join("\n")}`
    );
  }

  const doc = result.data;
  const links = doc.links ?? [];

  return {
    linkCount: links.length,
    links: links.map((link) => ({
      id: link.id,
      type: link.type,
      from: {
        nodeId: link.source.nodeId,
        nodeName: doc.nodes.find((n) => n.id === link.source.nodeId)?.name ?? link.source.nodeId,
      },
      to: {
        nodeId: link.target.nodeId,
        nodeName: doc.nodes.find((n) => n.id === link.target.nodeId)?.name ?? link.target.nodeId,
      },
      metadata: link.metadata ?? null,
    })),
  };
}

function handlePullFromPencil(input: { outputPath: string; name?: string }) {
  // This tool requires a live Pencil MCP connection — it cannot be executed
  // by the Tencil MCP server in isolation. The AI agent (Claude) must orchestrate
  // the calls: first call Pencil MCP batch_get, then pass the result here.
  //
  // For M1, we return clear instructions for the agent to follow.
  const outputPath = path.resolve(process.cwd(), input.outputPath);
  return {
    instructions: [
      "To pull the current Pencil.dev design into Tencil, follow these steps:",
      "1. Call the Pencil MCP tool: get_editor_state() — to confirm a document is open",
      "2. Call the Pencil MCP tool: batch_get(['*']) — to retrieve all nodes",
      "3. Call invoke_adapter with adapter='pencil-in', input=<batch_get result>, options={ outputPath: '" + input.outputPath + "', name: '" + (input.name ?? "pencil-design") + "' }",
    ],
    outputPath,
    status: "awaiting_pencil_mcp_data",
  };
}

// ─── Async adapter handler ────────────────────────────────────────────────────

async function handleInvokeAdapterAsync(input: {
  adapter: string;
  input: unknown;
  options?: Record<string, unknown>;
}): Promise<unknown> {
  if (input.adapter === "penpot-file-in") {
    const inputPath = input.options?.inputPath as string | undefined;
    if (!inputPath) throw new Error("penpot-file-in requires options.inputPath");

    const resolvedInput = path.resolve(process.cwd(), inputPath);
    if (!fs.existsSync(resolvedInput)) throw new Error(`File not found: ${resolvedInput}`);

    const penpotFileMod = await loadAdapter("@tencil/adapter-penpot-file-in");
    if (!penpotFileMod) {
      throw new Error("Adapter @tencil/adapter-penpot-file-in is not installed. Build it first.");
    }
    const penpotFileToTencil = penpotFileMod.penpotFileToTencil as (buf: Buffer, opts?: { id?: string; name?: string; pageIndex?: number }) => Promise<TencilDocument>;

    const buf = fs.readFileSync(resolvedInput);
    const opts = input.options as { id?: string; name?: string; pageIndex?: number } | undefined;
    const doc = await penpotFileToTencil(buf, opts);

    const validation = parseTencilDocument(doc);
    if (!validation.success) {
      throw new Error(`Adapter produced invalid document: ${JSON.stringify(validation.errors)}`);
    }

    const outputPath = (input.options?.outputPath as string | undefined)
      ?? path.resolve(process.cwd(), `${validation.data.id ?? "output"}.tencil`);
    const resolvedOutput = path.resolve(process.cwd(), outputPath);
    fs.writeFileSync(resolvedOutput, JSON.stringify(validation.data, null, 2), "utf-8");
    return makeSummary(validation.data, resolvedOutput);
  }

  if (input.adapter === "penpot-out") {
    const validation = parseTencilDocument(input.input);
    if (!validation.success) {
      throw new Error(
        `Input is not a valid TencilDocument:\n${validation.errors.map((e) => `  ${e.field}: ${e.message}`).join("\n")}`
      );
    }

    const penpotOutMod = await loadAdapter("@tencil/adapter-penpot-out");
    if (!penpotOutMod) {
      throw new Error("Adapter @tencil/adapter-penpot-out is not installed. Build it first.");
    }
    const tencilToPenpotFile = penpotOutMod.tencilToPenpotFile as (doc: TencilDocument, opts?: { fileName?: string }) => Promise<Buffer>;

    const outputPath = (input.options?.outputPath as string | undefined)
      ?? path.resolve(process.cwd(), `${validation.data.id ?? "output"}.penpot`);
    const resolvedOutput = path.resolve(process.cwd(), outputPath);
    const buf = await tencilToPenpotFile(validation.data, {
      fileName: validation.data.name ?? validation.data.id,
    });
    fs.writeFileSync(resolvedOutput, buf);

    return {
      success: true,
      filePath: resolvedOutput,
      nodes: validation.data.nodes.length,
    };
  }

  // pencil-in via invoke_adapter (agent passes batch_get result as input)
  if (input.adapter === "pencil-in") {
    const pencilInMod = await loadAdapter("@tencil/adapter-pencil-in");
    if (!pencilInMod) {
      throw new Error("Adapter @tencil/adapter-pencil-in is not installed. Build it first.");
    }
    const pencilNodesToTencil = pencilInMod.pencilNodesToTencil as (nodes: unknown[], opts?: { id?: string; name?: string }) => TencilDocument;

    const nodes = Array.isArray(input.input) ? input.input : (input.input as any)?.nodes ?? [];
    const opts = input.options as { id?: string; name?: string; outputPath?: string } | undefined;
    const doc = pencilNodesToTencil(nodes, opts);

    const validation = parseTencilDocument(doc);
    if (!validation.success) {
      throw new Error(`Adapter produced invalid document: ${JSON.stringify(validation.errors)}`);
    }

    const outputPath = opts?.outputPath
      ?? path.resolve(process.cwd(), `${validation.data.id ?? "pencil-design"}.tencil`);
    const resolvedOutput = path.resolve(process.cwd(), outputPath);
    fs.writeFileSync(resolvedOutput, JSON.stringify(validation.data, null, 2), "utf-8");
    return makeSummary(validation.data, resolvedOutput);
  }

  if (input.adapter === "penpot-in") {
    const doc = penpotToTencil(
      input.input,
      input.options as { id?: string; name?: string } | undefined
    );
    const validation = parseTencilDocument(doc);
    if (!validation.success) {
      throw new Error(`Adapter produced invalid document: ${JSON.stringify(validation.errors)}`);
    }
    const outputPath = (input.options?.outputPath as string | undefined)
      ?? path.resolve(process.cwd(), "converted.tencil");
    const resolvedOutput = path.resolve(process.cwd(), outputPath);
    fs.writeFileSync(resolvedOutput, JSON.stringify(validation.data, null, 2), "utf-8");
    return makeSummary(validation.data, resolvedOutput);
  }

  if (input.adapter === "pencil-out") {
    const validation = parseTencilDocument(input.input);
    if (!validation.success) {
      throw new Error(
        `Input is not a valid TencilDocument:\n${validation.errors.map((e) => `  ${e.field}: ${e.message}`).join("\n")}`
      );
    }
    const result = tencilToPencil(validation.data);
    return { operations: result.operations, count: result.operations.length, report: result.report };
  }

  throw new Error(
    `Unknown adapter: ${input.adapter}. Available: penpot-in, penpot-file-in, penpot-out, pencil-in, pencil-out`
  );
}

// ─── MCP Protocol Handler ────────────────────────────────────────────────────

function makeResult(content: unknown) {
  return {
    content: [{ type: "text", text: JSON.stringify(content, null, 2) }],
  };
}

function makeError(message: string) {
  return {
    content: [{ type: "text", text: `Error: ${message}` }],
    isError: true,
  };
}

async function handleRequest(request: {
  jsonrpc: string;
  id: unknown;
  method: string;
  params?: unknown;
}): Promise<unknown> {
  const { id, method, params } = request;

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "tencil-mcp-server", version: "0.1.1" },
      },
    };
  }

  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: { tools: TOOLS },
    };
  }

  if (method === "tools/call") {
    const { name, arguments: args } = params as {
      name: string;
      arguments: Record<string, unknown>;
    };

    try {
      let result: unknown;

      switch (name) {
        case "read_tencil":
          result = makeResult(handleReadTencil(args as { filePath: string }));
          break;
        case "summarize_tencil":
          result = makeResult(handleSummarizeTencil(args as { filePath: string }));
          break;
        case "write_tencil":
          result = makeResult(
            handleWriteTencil(args as { filePath: string; document: unknown })
          );
          break;
        case "invoke_adapter":
          result = makeResult(
            await handleInvokeAdapterAsync(
              args as { adapter: string; input: unknown; options?: Record<string, unknown> }
            )
          );
          break;
        case "pull_from_pencil":
          result = makeResult(
            handlePullFromPencil(args as { outputPath: string; name?: string })
          );
          break;
        case "create_link":
          result = makeResult(
            handleCreateLink(args as {
              filePath: string;
              fromNodeId: string;
              toNodeId: string;
              linkType: TencilLinkType;
              metadata?: Record<string, unknown>;
            })
          );
          break;
        case "list_links":
          result = makeResult(handleListLinks(args as { filePath: string }));
          break;
        default:
          result = makeError(`Unknown tool: ${name}`);
      }

      return { jsonrpc: "2.0", id, result };
    } catch (err) {
      return {
        jsonrpc: "2.0",
        id,
        result: makeError(err instanceof Error ? err.message : String(err)),
      };
    }
  }

  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}

// ─── stdio Transport ─────────────────────────────────────────────────────────

export function startServer() {
  let buffer = "";

  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", (chunk: string) => {
    buffer += chunk;

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      (async () => {
        try {
          const request = JSON.parse(trimmed);
          const response = await handleRequest(request);
          process.stdout.write(JSON.stringify(response) + "\n");
        } catch {
          const errorResponse = {
            jsonrpc: "2.0",
            id: null,
            error: { code: -32700, message: "Parse error" },
          };
          process.stdout.write(JSON.stringify(errorResponse) + "\n");
        }
      })();
    }
  });

  process.stdin.on("end", () => {
    process.exit(0);
  });
}

// ─── Programmatic API ────────────────────────────────────────────────────────

export async function readTencil(filePath: string): Promise<TencilDocument> {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) throw new Error(`File not found: ${resolved}`);
  const raw = fs.readFileSync(resolved, "utf-8");
  let json: unknown;
  try { json = JSON.parse(raw); } catch { throw new Error(`File is not valid JSON: ${resolved}`); }
  const result = parseTencilDocument(json);
  if (!result.success) {
    throw new Error(`Invalid .tencil file:\n${result.errors.map((e) => `  ${e.field}: ${e.message}`).join("\n")}`);
  }
  return result.data;
}

export async function writeTencil(
  filePath: string,
  document: TencilDocument
): Promise<void> {
  handleWriteTencil({ filePath, document });
}

export async function invokeAdapter(
  adapterName: string,
  input: unknown,
  options?: Record<string, unknown>
): Promise<unknown> {
  return handleInvokeAdapterAsync({ adapter: adapterName, input, options });
}

export default { startServer, readTencil, writeTencil, invokeAdapter };
