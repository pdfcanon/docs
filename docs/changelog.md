---
sidebar_position: 12
title: Changelog
description: API version history and release notes.
---

# Changelog

PDFCanon uses date-based API versioning. Breaking changes are introduced only in new API versions, and old versions are supported for a minimum of 12 months after a new version is released.

## 2026-01-01 (current)

**Initial stable release.**

### Endpoints

- `POST /api/normalize` — Synchronous and async PDF normalization
- `GET /api/submissions/{id}` — Submission status and metadata
- `GET /api/artifacts/{hash}` — Artifact download by content hash
- `GET /api/reports/{hash}` — Full normalization pipeline report

### Features

- 10-stage normalization pipeline (PDF/A detection through content hash)
- Tamper detection: incremental-update injection, shadow content, post-EOF data, header version mismatch, orphaned signature fields
- veraPDF validation (when PDF/A declared and policy = `preserve`)
- Idempotency key support
- Async mode (`Prefer: respond-async`)
- Stateless mode (`X-Stateless: true`)
- Webhook events: `normalization.completed`, `normalization.failed`
- Multi-region artifact storage (ca-central-1, us-east-2, eu-central-1)
- GDPR: data export, content erasure, account deletion with cooling-off period

### SDK support

- .NET (PDFCanon.Client)
- Python (pdfcanon)
- TypeScript/Node.js (@pdfcanon/client)
- Java (pdfcanon-client)
- Go (pdfcanon-go)

### MCP server

- `pdfcanon-mcp` .NET global tool (ModelContextProtocol 1.0.0, stdio transport)
- Tools: `normalize_pdf`, `get_report`, `inspect_structure`, `verify_integrity`
