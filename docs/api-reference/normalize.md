---
sidebar_position: 1
title: POST /api/normalize
description: Normalize a PDF document.
---

# POST /api/normalize

Normalize a PDF document through the PDFCanon pipeline. Returns the canonical PDF and a structured result object.

## Request

```
POST https://api.pdfcanon.io/api/normalize
```

### Headers

| Header | Required | Description |
|---|---|---|
| `X-Api-Key` | ✅ | Your API key (`pdfn_...`) |
| `Content-Type` | ✅ | Must be `application/pdf` |
| `Idempotency-Key` | Optional | Idempotency key for safe retries |
| `Prefer` | Optional | Set to `respond-async` for async processing |
| `X-Stateless` | Optional | Set to `true` to disable artifact persistence |

### Body

Raw PDF file bytes (`application/pdf`).

## Response

### Success (200 OK)

The normalized PDF is returned in the response body. Response headers include:

| Header | Description |
|---|---|
| `X-Submission-Id` | The submission ID |
| `X-Output-Hash` | SHA-256 hash of the normalized output |
| `X-Processing-Time-Ms` | Processing time in milliseconds |
| `X-Api-Version` | API version string |

### Response body (JSON, with `Accept: application/json`)

```json
{
  "apiVersion": "2026-01-01",
  "requestId": "req_01jk...",
  "submissionId": "sub_01jk...",
  "processingTimeMs": 342,
  "status": "completed",
  "original": {
    "sizeBytes": 102400,
    "sha256": "sha256:aabbcc...",
    "pdfaLevel": null
  },
  "output": {
    "sizeBytes": 98304,
    "sha256": "sha256:ddeeff...",
    "pdfaLevel": "2b",
    "downloadUrl": "https://api.pdfcanon.io/api/artifacts/ddeeff..."
  },
  "security": {
    "tamperDetection": {
      "detected": false,
      "findings": []
    },
    "digitalSignatures": {
      "found": 0,
      "policy": "remove"
    }
  },
  "validation": {
    "verapdfValidated": true,
    "verapdfErrors": []
  },
  "warnings": []
}
```

### Async response (202 Accepted)

When using `Prefer: respond-async`:

```json
{
  "submissionId": "sub_01jk...",
  "status": "processing"
}
```

## Error responses

| Status | Type | Description |
|---|---|---|
| `400` | `invalid-request` | Malformed PDF or missing required headers |
| `401` | `unauthorized` | Invalid or missing API key |
| `409` | `idempotency-conflict` | Idempotency key used with different body |
| `413` | `payload-too-large` | PDF exceeds maximum size |
| `422` | `normalization-failed` | PDF could not be normalized (permanent failure) |
| `429` | `quota-exceeded` | Monthly normalization quota exceeded |

## Code examples

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="curl" label="cURL">

```bash
curl -X POST https://api.pdfcanon.io/api/normalize \
  -H "X-Api-Key: pdfn_your_api_key_here" \
  -H "Content-Type: application/pdf" \
  --data-binary @input.pdf \
  -o normalized.pdf
```

</TabItem>
<TabItem value="node" label="Node.js">

```javascript
import { readFileSync, writeFileSync } from 'fs';

const pdf = readFileSync('input.pdf');
const response = await fetch('https://api.pdfcanon.io/api/normalize', {
  method: 'POST',
  headers: {
    'X-Api-Key': process.env.PDFCANON_API_KEY,
    'Content-Type': 'application/pdf',
  },
  body: pdf,
});

if (!response.ok) throw new Error(`Normalization failed: ${response.status}`);
writeFileSync('normalized.pdf', Buffer.from(await response.arrayBuffer()));
```

</TabItem>
<TabItem value="python" label="Python">

```python
import httpx

with open("input.pdf", "rb") as f:
    pdf_bytes = f.read()

resp = httpx.post(
    "https://api.pdfcanon.io/api/normalize",
    content=pdf_bytes,
    headers={
        "X-Api-Key": "pdfn_your_api_key_here",
        "Content-Type": "application/pdf",
    },
)
resp.raise_for_status()

with open("normalized.pdf", "wb") as f:
    f.write(resp.content)
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp
using var client = new HttpClient();
client.DefaultRequestHeaders.Add("X-Api-Key", "pdfn_your_api_key_here");

var pdf = await File.ReadAllBytesAsync("input.pdf");
using var content = new ByteArrayContent(pdf);
content.Headers.ContentType = new("application/pdf");

var response = await client.PostAsync("https://api.pdfcanon.io/api/normalize", content);
response.EnsureSuccessStatusCode();

await File.WriteAllBytesAsync("normalized.pdf", await response.Content.ReadAsByteArrayAsync());
```

</TabItem>
</Tabs>
