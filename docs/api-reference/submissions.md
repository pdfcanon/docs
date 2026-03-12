---
sidebar_position: 2
title: "GET /api/submissions/{id}"
description: Retrieve a normalization submission record.
---

# GET /api/submissions/\{id\}

Retrieve the full submission record for a normalization job by its submission ID.

## Request

```
GET https://api.pdfcanon.io/api/submissions/{submissionId}
```

### Path parameters

| Parameter | Description |
|---|---|
| `submissionId` | The submission ID returned by `POST /api/normalize` |

### Headers

| Header | Required | Description |
|---|---|---|
| `X-Api-Key` | ✅ | Your API key (`pdfn_...`) |

## Response

### Success (200 OK)

```json
{
  "apiVersion": "2026-01-01",
  "submissionId": "sub_01jk...",
  "status": "completed",
  "createdAt": "2026-01-15T12:34:56Z",
  "completedAt": "2026-01-15T12:35:00Z",
  "processingTimeMs": 342,
  "outputHash": "sha256:ddeeff...",
  "outputSizeBytes": 98304,
  "downloadUrl": "https://api.pdfcanon.io/api/artifacts/ddeeff...",
  "warnings": []
}
```

### Status values

| Status | Description |
|---|---|
| `processing` | Job is currently being processed |
| `completed` | Normalization succeeded |
| `failed` | Normalization failed (see `error` field) |

## Error responses

| Status | Description |
|---|---|
| `401` | Invalid or missing API key |
| `404` | Submission not found or belongs to a different organization |

## Next steps

- [GET /api/artifacts/\{hash\}](/api-reference/artifacts) — Download the normalized PDF
- [GET /api/reports/\{hash\}](/api-reference/reports) — Retrieve the normalization report
