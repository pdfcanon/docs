---
sidebar_position: 5
title: Error Handling
description: Failure taxonomy, error codes, and retry strategies.
---

# Error Handling

PDFCanon uses structured error responses and a defined failure taxonomy to make errors actionable.

:::tip Hash stability
If you're correlating errors with re-normalizations across time, also include the [`toolchainVersion`](/concepts/toolchain-version) from each response. Re-runs under a different toolchain version may produce a different canonical hash by design.
:::

## Error response format

All API errors return a JSON body with an `error` object containing specific fields:

```json
{
  "error": {
    "type": "QUOTA_EXCEEDED",
    "code": "QUOTA_EXCEEDED",
    "message": "Your organization has used all 500 normalizations for this billing period.",
    "plan_tier": "Starter",
    "monthly_limit": 500,
    "current_usage": 500,
    "upgrade_url": "/portal/billing"
  }
}
```

## HTTP status codes

| Status | Meaning |
|---|---|
| `200` | Success |
| `400` | Invalid request (malformed PDF, missing headers) |
| `401` | Missing or invalid API key |
| `403` | Insufficient permissions |
| `409` | Idempotency key conflict |
| `413` | Payload too large |
| `422` | Unprocessable PDF (permanently failed normalization) |
| `429` | Rate limit or quota exceeded |
| `500` | Internal server error |
| `503` | Service temporarily unavailable |

## Failure taxonomy

Normalization failures fall into two categories: **permanent** and **transient**.

### Permanent failures (do not retry)

| Error type | Description |
|---|---|
| `ENCRYPTED_UNSUPPORTED` | PDF is password-encrypted and cannot be decrypted |
| `CORRUPT_UNRECOVERABLE` | PDF structure is too corrupted to repair |
| `ACTIVE_CONTENT_BLOCKED` | Document contains active content that cannot be safely removed |
| `SIGNATURE_PRESERVATION_FAILED` | Digital signature could not be preserved per policy |

### Transient failures (safe to retry)

| Error type | Description |
|---|---|
| `PROCESSING_TIMEOUT` | Job exceeded the processing time limit |
| `WORKER_UNAVAILABLE` | No worker was available to process the job |
| `STORAGE_ERROR` | Temporary storage failure |

## Warning codes

Warnings do not prevent normalization but indicate that the output may differ from expectations:

| Warning code | Description |
|---|---|
| `NON_EMBEDDED_FONT` | A font referenced in the document is not embedded |
| `BROKEN_OBJECT_REFERENCE` | One or more object references in the PDF were broken and repaired |
| `LARGE_DOCUMENT` | Document exceeds the recommended size threshold for optimal processing |
| `COMPLEX_FORM` | AcroForm structure is complex and may have been partially flattened |
| `MULTIPLE_REVISIONS` | Document contained multiple incremental update revisions |
| `CORRUPT_STREAM` | One or more content streams were corrupt and were reconstructed |

## Retry strategy

For transient failures, use exponential backoff with jitter. Always use idempotency keys when retrying:

```python
import time, random, httpx

def normalize_with_retry(pdf_bytes, api_key, idempotency_key, max_attempts=4):
    for attempt in range(max_attempts):
        resp = httpx.post(
            "https://api.pdfcanon.com/api/normalize",
            content=pdf_bytes,
            headers={
                "X-Api-Key": api_key,
                "Idempotency-Key": idempotency_key,
                "Content-Type": "application/pdf",
            },
        )
        if resp.status_code == 200:
            return resp.content
        if resp.status_code in (422, 400):
            raise ValueError(f"Permanent failure: {resp.json()}")
        if attempt < max_attempts - 1:
            delay = min(0.5 * (2 ** attempt) + random.uniform(0, 0.5), 30)
            time.sleep(delay)
    raise RuntimeError("Max retries exceeded")
```

## Next steps

- [Known Deviations](/known-deviations) — Edge cases and transparency
- [API Reference: normalize](/api-reference/normalize) — Full response schema
