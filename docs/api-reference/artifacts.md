---
sidebar_position: 3
title: "GET /api/artifacts/{hash}"
description: Download a normalized PDF artifact by its content hash.
---

# GET /api/artifacts/\{hash\}

Download a normalized PDF artifact by its SHA-256 content hash. Artifacts are deduplicated — two submissions that produce identical output share the same artifact.

## Request

```
GET https://api.pdfcanon.com/api/artifacts/{hash}
```

### Path parameters

| Parameter | Description |
|---|---|
| `hash` | SHA-256 hash of the artifact (hex-encoded, without prefix) |

### Headers

| Header | Required | Description |
|---|---|---|
| `X-Api-Key` | ✅ | Your API key (`pdfn_...`) |

## Response

### Success (200 OK)

Returns the normalized PDF as `application/pdf`.

Response headers:

| Header | Description |
|---|---|
| `Content-Type` | `application/pdf` |
| `Content-Length` | File size in bytes |
| `Content-Disposition` | `attachment; filename="normalized.pdf"` |
| `X-Content-Hash` | SHA-256 hash of the returned content |

## Artifact availability

Artifacts are available for the duration of your organization's data retention period. After expiry, the artifact is deleted and the endpoint returns `404`.

See [Data Retention](/guides/data-retention) for retention periods by plan.

## Error responses

| Status | Description |
|---|---|
| `401` | Invalid or missing API key |
| `403` | Artifact does not belong to your organization |
| `404` | Artifact not found or expired |
