---
sidebar_position: 10
title: MCP Server
description: PDFCanon MCP server setup, tool reference, and use cases.
---

# MCP Server

The PDFCanon MCP (Model Context Protocol) server exposes PDF normalization tools to AI assistants and agent frameworks.

## Overview

`pdfcanon-mcp` is a .NET global tool that runs an MCP server over stdio. It connects to the PDFCanon REST API using your API key. AI assistants (Claude, Cursor, etc.) can use it to normalize, inspect, and verify PDFs as part of agentic workflows.

## Installation

```bash
dotnet tool install -g PDFCanon.Mcp
```

Verify installation:

```bash
pdfcanon-mcp --version
```

## Configuration

Set your API key in the environment:

```bash
export PDFCANON_API_KEY=pdfn_your_api_key_here
```

Or create a `.env` file in your working directory:

```
PDFCANON_API_KEY=pdfn_your_api_key_here
```

## MCP client setup

### Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pdfcanon": {
      "command": "pdfcanon-mcp",
      "env": {
        "PDFCANON_API_KEY": "pdfn_your_api_key_here"
      }
    }
  }
}
```

### Cursor / VS Code

Add to your MCP settings:

```json
{
  "mcp": {
    "servers": {
      "pdfcanon": {
        "command": "pdfcanon-mcp",
        "env": {
          "PDFCANON_API_KEY": "pdfn_your_api_key_here"
        }
      }
    }
  }
}
```

## Available tools

### `normalize_pdf`

Normalize a PDF file through the PDFCanon pipeline.

**Parameters:**
- `file_path` (string) — Path to the input PDF
- `output_path` (string, optional) — Path for the normalized output (defaults to `{input}_normalized.pdf`)
- `idempotency_key` (string, optional) — Idempotency key for safe retries

**Returns:** Normalization result including output path, hash, warnings, and processing time.

### `get_report`

Retrieve the normalization report for a previously normalized PDF.

**Parameters:**
- `output_hash` (string) — SHA-256 hash of the normalized output

**Returns:** Full pipeline report with per-stage results and tamper analysis.

### `inspect_structure`

Inspect the internal structure of a PDF without normalizing it.

**Parameters:**
- `file_path` (string) — Path to the PDF to inspect

**Returns:** PDF structure information including cross-reference table, encryption status, form fields, and embedded content.

### `verify_integrity`

Verify that a PDF file matches a known content hash.

**Parameters:**
- `file_path` (string) — Path to the PDF to verify
- `expected_hash` (string) — Expected SHA-256 hash

**Returns:** `true` if the file matches the expected hash, `false` otherwise.

## Use cases

- **Document compliance workflows** — Normalize uploaded PDFs as part of an AI-assisted document processing pipeline
- **Batch migration** — Ask an AI assistant to normalize a folder of PDFs and report results
- **Audit assistance** — Use `get_report` to explain normalization decisions to non-technical stakeholders
- **Integrity verification** — Verify that stored PDFs have not been tampered with

## Source

MCP server source code: [`src/PDFCanon.Mcp/`](https://github.com/napzoom/PDFCanon/tree/main/src/PDFCanon.Mcp)
