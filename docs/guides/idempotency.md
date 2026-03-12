---
sidebar_position: 3
title: Idempotency
description: Use idempotency keys to safely retry normalization requests.
---

# Idempotency

PDFCanon supports idempotency keys to allow safe retries of normalization requests without risk of double-processing.

## How it works

Pass an `Idempotency-Key` header with any `POST /api/normalize` request. If a request with the same key has already been processed, PDFCanon returns the original response rather than re-processing the document.

```bash
curl -X POST https://api.pdfcanon.com/api/normalize \
  -H "X-Api-Key: pdfn_your_api_key_here" \
  -H "Idempotency-Key: order-12345-normalize-v1" \
  -H "Content-Type: application/pdf" \
  --data-binary @invoice.pdf \
  -o normalized-invoice.pdf
```

## Key requirements

- Keys must be unique per request
- Keys are scoped to your API key (two different API keys can use the same idempotency key value)
- Keys are valid for **24 hours** after first use
- Maximum key length is 255 characters

## Recommended key format

Use a value that is naturally unique to the logical operation, such as a database record ID plus a version suffix:

```
{entity_type}-{entity_id}-{operation}-{version}
```

Example: `submission-order-9918-normalize-v2`

## Behaviour on collision

| Scenario | Response |
|---|---|
| Same key, same body, first request | Process normally, return result |
| Same key, same body, subsequent request | Return cached result (HTTP 200) |
| Same key, different body | HTTP 409 — idempotency key conflict |
| Expired key (>24h), same key | Treat as a new request |

## Next steps

- [Bulk Processing](/guides/bulk-processing) — Concurrency guidance and migration scripts
- [Error Handling](/guides/error-handling) — Retry strategies
