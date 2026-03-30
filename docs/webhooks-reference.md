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
| `normalization.success` | A normalization job completed successfully |
| `normalization.failure` | A normalization job failed with a permanent error |
| `normalization.rejected` | A normalization job was rejected by policy (e.g. signed PDF with reject policy) |

## Payload schema

All webhook events share a common envelope:

```json
{
  "event": "normalization.success",
  "webhookId": "wh_01jk...",
  "timestamp": "2026-01-15T12:35:00Z",
  "apiVersion": "2026-01-01",
  "data": { ... }
}
```

### `normalization.success` payload

```json
{
  "event": "normalization.success",
  "webhookId": "wh_01jk...",
  "timestamp": "2026-01-15T12:35:00Z",
  "apiVersion": "2026-01-01",
  "data": {
    "submissionId": "sub_01jk...",
    "status": "SUCCESS",
    "processingTimeMs": 342,
    "outputHash": "sha256:ddeeff...",
    "outputSizeBytes": 98304,
    "downloadUrl": "https://api.pdfcanon.com/api/artifacts/ddeeff...",
    "warnings": []
  }
}
```

### `normalization.failure` payload

```json
{
  "event": "normalization.failure",
  "webhookId": "wh_01jk...",
  "timestamp": "2026-01-15T12:35:00Z",
  "apiVersion": "2026-01-01",
  "data": {
    "submissionId": "sub_01jk...",
    "status": "FAILED",
    "processingTimeMs": 89,
    "error": {
      "type": "CORRUPT_UNRECOVERABLE",
      "message": "PDF structure is too corrupted to repair"
    }
  }
}
```

### `normalization.rejected` payload

```json
{
  "event": "normalization.rejected",
  "webhookId": "wh_01jk...",
  "timestamp": "2026-01-15T12:35:01Z",
  "apiVersion": "2026-01-01",
  "data": {
    "submissionId": "sub_01jk...",
    "status": "REJECTED",
    "processingTimeMs": 12,
    "error": {
      "type": "SIGNED_PDF",
      "message": "PDF contains digital signatures which would be invalidated by normalization."
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
| `X-PDFCanon-Event` | Event type (e.g. `normalization.success`) |
| `X-PDFCanon-Webhook-Id` | Webhook delivery ID |
| `X-PDFCanon-Api-Version` | API version string |
