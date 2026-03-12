---
sidebar_position: 1
title: Normalizing PDFs
description: Core workflow walkthrough for PDF normalization.
---

# Normalizing PDFs

This guide walks through the full normalization workflow: uploading a PDF, monitoring the pipeline stages, and retrieving the canonical output.

## Overview

PDFCanon normalizes PDFs through a deterministic 10-stage pipeline. Every stage is logged in the normalization report, which you can retrieve after the job completes.

## Synchronous vs asynchronous mode

By default, `POST /api/normalize` processes the document synchronously and returns the normalized PDF directly in the response body. For large documents or high-throughput scenarios, use the `Prefer: respond-async` header to receive a submission ID and poll for completion.

### Synchronous (default)

```bash
curl -X POST https://api.pdfcanon.com/api/normalize \
  -H "X-Api-Key: pdfn_your_api_key_here" \
  -H "Content-Type: application/pdf" \
  --data-binary @input.pdf \
  -o normalized.pdf
```

### Asynchronous

```bash
curl -X POST https://api.pdfcanon.com/api/normalize \
  -H "X-Api-Key: pdfn_your_api_key_here" \
  -H "Content-Type: application/pdf" \
  -H "Prefer: respond-async" \
  --data-binary @input.pdf
# Returns: {"submissionId": "sub_...", "status": "processing"}
```

Then poll for completion:

```bash
curl https://api.pdfcanon.com/api/submissions/{submissionId} \
  -H "X-Api-Key: pdfn_your_api_key_here"
```

## Idempotency

Pass an `Idempotency-Key` header to safely retry requests without double-processing:

```bash
curl -X POST https://api.pdfcanon.com/api/normalize \
  -H "X-Api-Key: pdfn_your_api_key_here" \
  -H "Idempotency-Key: my-unique-key-12345" \
  -H "Content-Type: application/pdf" \
  --data-binary @input.pdf
```

See [Idempotency](/guides/idempotency) for details.

## Pipeline stages

The normalization report includes the result of each stage:

| Stage | Name | Description |
|---|---|---|
| 0 | PDF/A Detection | Identifies compliance level of the input |
| 1 | Tamper Detection | Detects incremental-update injection and shadow content |
| 2 | Structural Repair | Fixes malformed xref tables and trailers |
| 3 | Digital Signature Detection | Handles existing digital signatures per policy |
| 4 | Active Content Removal | Strips JavaScript, embedded executables |
| 5 | AcroForm Handling | Flattens or preserves form fields |
| 6 | Metadata Canonicalization | Normalizes XMP and DocInfo metadata |
| 7 | Font Resource Validation | Validates and embeds font subsets |
| 8 | Final Rewrite | Linearizes and emits canonical PDF |
| 9 | Content Hash | Computes SHA-256 of the canonical output |

## Output hash and deduplication

The `outputHash` in the response is the SHA-256 hash of the canonical output PDF. Identical input documents (after normalization) produce identical hashes, enabling deduplication.

## Next steps

- [Webhooks](/guides/webhooks) — Receive notifications when async jobs complete
- [Error Handling](/guides/error-handling) — Handle failures and retries
- [API Reference: normalize](/api-reference/normalize) — Full endpoint specification
