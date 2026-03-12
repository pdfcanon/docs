---
sidebar_position: 11
title: Webhooks Reference
description: Complete webhook payload schemas, event types, and HMAC verification reference.
---

# Webhooks Reference

Complete reference for PDFCanon webhook events, payload schemas, and HMAC signature verification.

## Event types

| Event | Description |
|---|---|
| `normalization.completed` | A normalization job completed successfully |
| `normalization.failed` | A normalization job failed with a permanent error |

## Payload schema

All webhook events share a common envelope:

```json
{
  "event": "normalization.completed",
  "webhookId": "wh_01jk...",
  "timestamp": "2026-01-15T12:35:00Z",
  "apiVersion": "2026-01-01",
  "data": { ... }
}
```

### `normalization.completed` payload

```json
{
  "event": "normalization.completed",
  "webhookId": "wh_01jk...",
  "timestamp": "2026-01-15T12:35:00Z",
  "apiVersion": "2026-01-01",
  "data": {
    "submissionId": "sub_01jk...",
    "status": "completed",
    "processingTimeMs": 342,
    "outputHash": "sha256:ddeeff...",
    "outputSizeBytes": 98304,
    "downloadUrl": "https://api.pdfcanon.io/api/artifacts/ddeeff...",
    "warnings": []
  }
}
```

### `normalization.failed` payload

```json
{
  "event": "normalization.failed",
  "webhookId": "wh_01jk...",
  "timestamp": "2026-01-15T12:35:00Z",
  "apiVersion": "2026-01-01",
  "data": {
    "submissionId": "sub_01jk...",
    "status": "failed",
    "processingTimeMs": 89,
    "error": {
      "type": "CORRUPT_UNRECOVERABLE",
      "message": "PDF structure is too corrupted to repair"
    }
  }
}
```

## HMAC signature verification

PDFCanon signs every webhook request with HMAC-SHA256 using your webhook secret.

The signature is sent in the `X-PDFCanon-Signature` header as a lowercase hex string.

### Verification

To verify: compute `HMAC-SHA256(secret, rawRequestBody)` and compare with the header value using a constant-time comparison.

```javascript
// Node.js
const crypto = require('crypto');

function verifySignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  );
}
```

```python
# Python
import hmac, hashlib

def verify_signature(raw_body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(), raw_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

```csharp
// C#
using System.Security.Cryptography;
using System.Text;

bool VerifySignature(string rawBody, string signature, string secret)
{
    var key = Encoding.UTF8.GetBytes(secret);
    var body = Encoding.UTF8.GetBytes(rawBody);
    var expected = Convert.ToHexString(HMACSHA256.HashData(key, body)).ToLowerInvariant();
    return CryptographicOperations.FixedTimeEquals(
        Encoding.UTF8.GetBytes(expected),
        Encoding.UTF8.GetBytes(signature));
}
```

## Retry policy

| Attempt | Delay |
|---|---|
| 1 (initial) | — |
| 2 | 30 seconds |
| 3 | 2 minutes |
| 4 | 10 minutes |
| 5 | 30 minutes |

After 5 failed attempts, the webhook is marked as failed and no further retries are made. You can manually re-trigger delivery from the portal.

## Headers

| Header | Description |
|---|---|
| `Content-Type` | `application/json` |
| `X-PDFCanon-Signature` | HMAC-SHA256 signature (hex) |
| `X-PDFCanon-Event` | Event type (e.g. `normalization.completed`) |
| `X-PDFCanon-Webhook-Id` | Webhook delivery ID |
| `X-PDFCanon-Api-Version` | API version string |
