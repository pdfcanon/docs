---
sidebar_position: 5
title: Batches
description: Batch management endpoints for grouping normalization submissions.
---

# Batches

Group normalization submissions into batches for tracking bulk operations. Batches are metadata-only — each submission is still processed independently.

All batch endpoints require API key authentication (`X-Api-Key`).

## POST /api/batches

Create a new batch to group submissions.

```
POST https://api.pdfcanon.com/api/batches
```

### Headers

| Header      | Required | Description               |
| ----------- | -------- | ------------------------- |
| `X-Api-Key` | ✅       | Your API key (`pdfn_...`) |

### Request body (JSON)

| Field         | Type   | Required | Description                                      |
| ------------- | ------ | -------- | ------------------------------------------------ |
| `name`        | string | No       | Human-readable batch name                        |
| `webhookUrl`  | string | No       | HTTPS URL for batch-level completion notifications |

### Response — 201 Created

```json
{
  "id": "b1c2d3e4-f5a6-7890-abcd-ef1234567890",
  "name": "Q1 migration",
  "webhookUrl": "https://example.com/batch-hook",
  "status": "open",
  "totalCount": 0,
  "successCount": 0,
  "failedCount": 0,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

## GET /api/batches

List batches with optional filtering and pagination.

```
GET https://api.pdfcanon.com/api/batches?status=open&page=1&pageSize=20
```

### Query parameters

| Parameter  | Type    | Default | Description                              |
| ---------- | ------- | ------- | ---------------------------------------- |
| `status`   | string  | —       | Filter by status: `open` or `closed`     |
| `page`     | integer | `1`     | Page number (1-based)                    |
| `pageSize` | integer | `20`    | Results per page (max 100)               |

### Response — 200 OK

```json
{
  "items": [
    {
      "id": "b1c2d3e4-...",
      "name": "Q1 migration",
      "status": "open",
      "totalCount": 150,
      "successCount": 142,
      "failedCount": 3,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 5
}
```

## GET /api/batches/\{batchId\}

Get the status and progress of a specific batch.

```
GET https://api.pdfcanon.com/api/batches/{batchId}
```

### Response — 200 OK

```json
{
  "id": "b1c2d3e4-f5a6-7890-abcd-ef1234567890",
  "name": "Q1 migration",
  "webhookUrl": "https://example.com/batch-hook",
  "status": "open",
  "totalCount": 150,
  "successCount": 142,
  "failedCount": 3,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### Error responses

| Status | Description        |
| ------ | ------------------ |
| `404`  | Batch not found    |

## GET /api/batches/\{batchId\}/submissions

List submissions within a batch with pagination.

```
GET https://api.pdfcanon.com/api/batches/{batchId}/submissions?page=1&pageSize=20
```

### Query parameters

| Parameter  | Type    | Default | Description                |
| ---------- | ------- | ------- | -------------------------- |
| `page`     | integer | `1`     | Page number (1-based)      |
| `pageSize` | integer | `20`    | Results per page (max 100) |

### Response — 200 OK

Returns a paginated list of [`NormalizeResponse`](/api-reference/normalize#normalizeresponse-schema) objects belonging to the batch.

### Error responses

| Status | Description        |
| ------ | ------------------ |
| `404`  | Batch not found    |

## Usage with normalization

Associate a submission with a batch by including the `batch_id` form field in your normalization request:

```bash
curl -X POST https://api.pdfcanon.com/api/normalize \
  -H "X-Api-Key: pdfn_your_api_key_here" \
  -F "file=@input.pdf" \
  -F "batch_id=b1c2d3e4-f5a6-7890-abcd-ef1234567890"
```

See [Bulk Processing](/guides/bulk-processing) for concurrency patterns and best practices.
