---
sidebar_position: 4
title: Bulk Processing
description: Concurrency guidance and migration scripts for processing large PDF volumes.
---

# Bulk Processing

This guide covers best practices for processing large volumes of PDFs with PDFCanon.

## Concurrency model

PDFCanon processes jobs in parallel on its worker fleet. From the client side, you can submit multiple requests concurrently. Recommended concurrency limits by tier:

| Tier | Recommended max concurrent requests |
|---|---|
| Starter | 5 |
| Growth | 20 |
| Pro | 50 |

Exceeding these limits may result in `429 Too Many Requests` responses. Implement backoff and retry logic.

## Async submission pattern

For bulk workloads, use the async mode to avoid holding open HTTP connections:

```javascript
const { default: PQueue } = await import('p-queue');
const queue = new PQueue({ concurrency: 10 });

const submissionIds = await Promise.all(
  pdfFiles.map(file =>
    queue.add(() => submitAsync(file))
  )
);

// Poll or use webhooks for completion
```

## Using idempotency keys

Always use idempotency keys for bulk processing to safely retry on transient failures:

```javascript
async function normalizeWithRetry(file, maxRetries = 3) {
  const key = `bulk-migration-${file.id}-v1`;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await normalize(file, { 'Idempotency-Key': key });
    } catch (err) {
      if (attempt === maxRetries - 1 || err.status === 422) throw err;
      await sleep(2 ** attempt * 500);
    }
  }
}
```

## Migration scripts

When migrating a large corpus of existing PDFs, structure your migration as:

1. **Inventory** — List all PDFs with their sizes and metadata
2. **Batch** — Group into batches of 100–500 documents
3. **Submit** — Submit each batch with idempotency keys
4. **Verify** — Compare output hashes to detect duplicates
5. **Reconcile** — Handle failures and resubmit with new idempotency key version

## Rate limiting and backoff

Implement exponential backoff with jitter for `429` and `5xx` responses:

```python
import time, random

def backoff_delay(attempt):
    base = 0.5 * (2 ** attempt)
    jitter = random.uniform(0, base * 0.1)
    return min(base + jitter, 30)
```

## Next steps

- [Idempotency](/guides/idempotency) — Idempotency key details
- [Error Handling](/guides/error-handling) — Failure taxonomy and retry strategy
