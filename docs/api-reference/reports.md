---
sidebar_position: 4
title: "GET /api/reports/{hash}"
description: Retrieve a full normalization pipeline report.
---

# GET /api/reports/\{hash\}

Retrieve the full normalization pipeline report for a given output content hash. The report includes per-stage results, warnings, and tamper detection findings.

## Request

```
GET https://api.pdfcanon.com/api/reports/{hash}
```

### Path parameters

| Parameter | Description |
|---|---|
| `hash` | SHA-256 hash of the normalized output (hex-encoded, without prefix) |

### Headers

| Header | Required | Description |
|---|---|---|
| `X-Api-Key` | ✅ | Your API key (`pdfn_...`) |

## Response

### Success (200 OK)

```json
{
  "apiVersion": "2026-01-01",
  "outputHash": "sha256:ddeeff...",
  "submissionId": "sub_01jk...",
  "createdAt": "2026-01-15T12:34:56Z",
  "processingTimeMs": 342,
  "stages": [
    {"stage": 0, "name": "PdfaDetection", "durationMs": 12, "result": "pdf_1_4"},
    {"stage": 1, "name": "TamperDetection", "durationMs": 8, "result": "clean", "findings": []},
    {"stage": 2, "name": "StructuralRepair", "durationMs": 45, "result": "repaired"},
    {"stage": 3, "name": "DigitalSignatureDetection", "durationMs": 5, "result": "none"},
    {"stage": 4, "name": "ActiveContentRemoval", "durationMs": 3, "result": "clean"},
    {"stage": 5, "name": "AcroFormHandling", "durationMs": 2, "result": "no_forms"},
    {"stage": 6, "name": "MetadataCanonical", "durationMs": 7, "result": "normalized"},
    {"stage": 7, "name": "FontResourceValidation", "durationMs": 89, "result": "all_embedded"},
    {"stage": 8, "name": "FinalRewrite", "durationMs": 156, "result": "success"},
    {"stage": 9, "name": "ContentHash", "durationMs": 3, "result": "sha256:ddeeff..."}
  ],
  "warnings": [],
  "tamperAnalysis": {
    "detected": false,
    "findings": []
  },
  "verapdf": {
    "validated": true,
    "errors": []
  }
}
```

## Error responses

| Status | Description |
|---|---|
| `401` | Invalid or missing API key |
| `403` | Report does not belong to your organization |
| `404` | Report not found or expired |

## Next steps

- [Error Handling](/guides/error-handling) — Understand failure types and warning codes
- [Known Deviations](/known-deviations) — Edge cases that may produce warnings
