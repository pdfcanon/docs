---
sidebar_position: 2
title: Webhooks
description: Set up webhook endpoints and verify HMAC signatures.
---

# Webhooks

PDFCanon sends webhook events to your endpoint when asynchronous normalization jobs complete or fail. This guide covers registration, payload format, and HMAC signature verification.

## Register a webhook endpoint

Create a webhook in the portal under **Settings → Webhooks**, or via the API:

```bash
curl -X POST https://api.pdfcanon.com/api/portal/webhooks \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/pdfcanon",
    "events": ["normalization.success", "normalization.failure", "normalization.rejected"]
  }'
```

The webhook secret is generated server-side and returned in the response. You do not supply it yourself.

## Event types

| Event | Description |
|---|---|
| `normalization.success` | A normalization job completed successfully |
| `normalization.failure` | A normalization job failed with a permanent error |
| `normalization.rejected` | A normalization job was rejected by policy |

## Payload format

```json
{
  "event": "normalization.success",
  "webhookId": "wh_01jk...",
  "timestamp": "2026-01-15T12:34:56Z",
  "apiVersion": "2026-01-01",
  "data": {
    "submissionId": "sub_01jk...",
    "status": "SUCCESS",
    "processingTimeMs": 342,
    "outputHash": "sha256:abcd1234...",
    "outputSizeBytes": 98304,
    "downloadUrl": "https://api.pdfcanon.com/api/artifacts/abcd1234...",
    "warnings": []
  }
}
```

## HMAC signature verification

Every webhook request includes a `X-PDFCanon-Signature` header containing an HMAC-SHA256 signature of the raw request body, signed with your webhook secret.

### Verification example (Node.js)

```javascript
const crypto = require('crypto');

function verifyWebhook(rawBody, signature, secret) {
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

### Verification example (C#)

```csharp
using System.Security.Cryptography;
using System.Text;

bool VerifyWebhook(string rawBody, string signature, string secret)
{
    var key = Encoding.UTF8.GetBytes(secret);
    var body = Encoding.UTF8.GetBytes(rawBody);
    var expectedBytes = HMACSHA256.HashData(key, body);
    var expected = Convert.ToHexString(expectedBytes).ToLowerInvariant();
    return CryptographicOperations.FixedTimeEquals(
        Encoding.UTF8.GetBytes(expected),
        Encoding.UTF8.GetBytes(signature));
}
```

## Retry policy

PDFCanon retries failed webhook deliveries up to 5 times with exponential backoff. Return a `2xx` status code to acknowledge receipt.

## Next steps

- [Webhooks Reference](/webhooks-reference) — Full payload schemas and event catalog
