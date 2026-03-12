---
slug: /
sidebar_position: 1
title: Overview
description: PDFCanon developer documentation — PDF normalization for production.
---

# PDFCanon Documentation

PDFCanon is a PDF normalization API that converts any PDF into a canonical, tamper-evident, PDF/A-compliant document. Use the REST API, official SDKs, or the MCP server to integrate normalization into your workflow.

## Get started

- [**Quickstart**](/quickstart) — Normalize your first PDF in under 5 minutes
- [**Authentication**](/authentication) — API keys and auth headers
- [**API Reference**](/api-reference/normalize) — Full endpoint reference

## Core concepts

PDFCanon normalizes PDFs by running them through a deterministic multi-stage pipeline:

1. **PDF/A detection** — Identify the compliance level of the input document
2. **Tamper detection** — Detect incremental-update injection, shadow content, and post-EOF data
3. **Structural repair** — Fix malformed cross-reference tables and trailer dictionaries
4. **Digital signature detection** — Identify and handle existing digital signatures per policy
5. **Active content removal** — Strip JavaScript, embedded executables, and launch actions
6. **AcroForm handling** — Flatten or preserve interactive form fields
7. **Metadata canonicalization** — Normalize XMP and DocInfo metadata
8. **Font resource validation** — Validate and embed font subsets
9. **Final rewrite** — Linearize and emit a clean, canonical PDF
10. **Content hash** — SHA-256 hash of the canonical output for deduplication

The output is deterministic: the same input always produces the same output hash.

## API version

The current stable API version is `2026-01-01`. All responses include an `apiVersion` field.

## Support

- **Status page** — [status.pdfcanon.com](https://status.pdfcanon.com)
- **Dashboard** — [app.pdfcanon.com](https://app.pdfcanon.com)
- **GitHub** — [github.com/napzoom/PDFCanon](https://github.com/napzoom/PDFCanon)
