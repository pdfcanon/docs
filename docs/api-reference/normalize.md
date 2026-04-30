---
sidebar_position: 1
title: POST /api/normalize
description: Normalize a PDF document.
---

# POST /api/normalize

Normalize a PDF document through the PDFCanon pipeline. Returns a structured result object with full schema details about the normalization, tamper analysis, security changes, and validation.

:::tip
For the full list of error codes this endpoint can return (`FILE_TOO_LARGE`, `ENCRYPTED_PDF`, `UNSUPPORTED_PDF_VERSION`, etc.), see the [Errors Reference](/api-reference/errors).
:::

## Request

```
POST https://api.pdfcanon.com/api/normalize
```

**Content-Type:** `multipart/form-data`

### Headers

| Header      | Required | Description               |
| ----------- | -------- | ------------------------- |
| `X-Api-Key` | ✅       | Your API key (`pdfn_...`) |

### Form fields

| Field                | Type         | Required | Default     | Description                                                                |
| -------------------- | ------------ | -------- | ----------- | -------------------------------------------------------------------------- |
| `file`               | binary       | ✅       | —           | The PDF file to normalize                                                  |
| `linearize`          | boolean      | No       | `true`      | Linearize (web-optimize) the output PDF. Set `false` to skip.              |
| `remove_annotations` | boolean      | No       | `false`     | Remove all PDF annotations                                                 |
| `signed_pdf_policy`  | string       | No       | `reject`    | How to handle signed PDFs: `reject`, `strip`, or `preserve`                |
| `pdfa_policy`        | string       | No       | `preserve`  | How to handle PDF/A documents: `preserve` or `normalize_anyway`            |
| `region`             | string       | No       | org default | Target storage region (`ca-central-1`, `us-east-2`, `eu-central-1`)        |
| `webhook_url`        | string (uri) | No       | —           | Optional HTTPS URL to receive a completion webhook                         |
| `idempotency_key`    | string       | No       | —           | Client-supplied idempotency key for safe retries (max 255 chars, 24h TTL)  |
| `batch_id`           | uuid         | No       | —           | Associate this submission with an existing batch                           |

## Responses

### 200 OK — Synchronously normalized (small PDFs)

Returns a [`NormalizeResponse`](#normalizeresponse-schema) JSON object.

### 202 Accepted — Accepted for async processing

Returns a [`NormalizeResponse`](#normalizeresponse-schema) JSON object with `status: "PENDING"` or `"IN_PROGRESS"`. Poll [`GET /api/submissions/{id}`](/api-reference/submissions) until status is `SUCCESS` or `FAILED`.

### Error responses

| Status | Description                                   |
| ------ | --------------------------------------------- |
| `400`  | Validation error or invalid/disallowed region |
| `401`  | Invalid or missing API key                    |
| `402`  | Monthly quota exceeded                        |

## NormalizeResponse schema

```
NormalizeResponse
├── apiVersion        string       e.g. "2026-01-01"
├── requestId         string       unique request ID
├── submissionId      uuid
├── processingTimeMs  int64
├── status            enum         PENDING | IN_PROGRESS | SUCCESS | FAILED | REJECTED
├── original          OriginalInfo
│   ├── sha256        string       SHA-256 hex digest of the original file
│   └── sizeBytes     int64
├── normalized        NormalizedInfo  (nullable — null until processing completes)
│   ├── sha256        string
│   ├── sizeBytes     int64
│   ├── pdfVersion    string       e.g. "1.7"
│   ├── linearized    boolean      whether output was linearized (web-optimized)
│   ├── contentHash   string (nullable)  SHA-256 of extracted text (null for image-only PDFs)
│   └── downloadUrl   string (uri) presigned URL to download the artifact
├── security          SecurityInfo  (what was removed)
│   ├── javascriptRemoved          boolean
│   ├── openActionsRemoved         boolean
│   ├── embeddedFilesRemoved       boolean
│   ├── richMediaRemoved           boolean
│   ├── launchActionsRemoved       boolean
│   ├── incrementalUpdatesRemoved  boolean
│   ├── acroformFlattened          boolean
│   ├── annotationsRemoved         boolean
│   ├── encryptedInput             boolean  (was the original encrypted?)
│   ├── digitalSignaturesDetected  boolean
│   ├── digitalSignaturesRemoved   boolean
│   ├── signatureCount             int
│   ├── signatureVerificationResults[]  SignatureVerification
│   │   ├── fieldName              string
│   │   ├── signerName             string (nullable)  Distinguished Name from certificate
│   │   ├── signedAt               datetime (nullable)
│   │   ├── valid                  boolean
│   │   ├── certificateExpired     boolean
│   │   ├── certificateChainTrusted boolean (nullable)
│   │   ├── timestampPresent       boolean
│   │   ├── timestampValid         boolean (nullable)
│   │   └── reason                 string (nullable)
│   └── overallSignatureStatus     enum   ALL_VALID | SOME_INVALID | NONE
├── validation        ValidationInfo  (structural repair)
│   ├── xrefRebuilt                boolean
│   ├── objectStreamsRegenerated   boolean
│   ├── brokenReferencesDetected  boolean
│   ├── nonEmbeddedFontsDetected  boolean
│   ├── pdfaDeclared               boolean  (did the input claim PDF/A?)
│   ├── pdfaLevel                  string (nullable)  e.g. "2b", "1a"
│   ├── pdfaPreserved              boolean  (was PDF/A compliance maintained?)
│   ├── pdfaCompliant              boolean  (is the output PDF/A compliant?)
│   ├── verapdfValidated           boolean (nullable)  (was veraPDF validation run?)
│   └── verapdfErrors[]            string   ISO 19005 clause violations, if any
├── tamperAnalysis    TamperAnalysis  (nullable — null until processing completes)
│   ├── riskLevel     enum         none | low | medium | high | critical
│   ├── anomaliesDetected  int
│   └── anomalies[]   TamperAnomaly
│       ├── type      enum         INCREMENTAL_UPDATE_INJECTION | POST_EOF_DATA |
│       │                          HEADER_VERSION_MISMATCH | SHADOW_CONTENT_DETECTED |
│       │                          ORPHANED_SIGNATURE_FIELD
│       ├── severity  enum         low | medium | high | critical
│       ├── description  string
│       └── location  string (nullable)  e.g. "Byte offset 1847293"
├── warnings[]        WarningInfo
│   ├── code          string       e.g. NON_EMBEDDED_FONT
│   └── message       string
└── failure           FailureInfo  (nullable)
    ├── code          string       e.g. POLICY_REJECTION
    ├── message       string
    └── stage         string (nullable)  pipeline stage where failure occurred
```

### Full response example (SUCCESS)

```json
{
  "apiVersion": "2026-01-01",
  "requestId": "req_01jk4m2n3p5q6r7s",
  "submissionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "processingTimeMs": 342,
  "status": "SUCCESS",
  "original": {
    "sha256": "aabbccdd...",
    "sizeBytes": 102400
  },
  "normalized": {
    "sha256": "ddeeff00...",
    "sizeBytes": 98304,
    "pdfVersion": "1.7",
    "linearized": true,
    "contentHash": "ff00aabb...",
    "downloadUrl": "https://api.pdfcanon.com/api/artifacts/ddeeff00..."
  },
  "security": {
    "javascriptRemoved": true,
    "openActionsRemoved": false,
    "embeddedFilesRemoved": true,
    "richMediaRemoved": false,
    "launchActionsRemoved": false,
    "incrementalUpdatesRemoved": true,
    "acroformFlattened": false,
    "annotationsRemoved": false,
    "encryptedInput": false,
    "digitalSignaturesDetected": false,
    "digitalSignaturesRemoved": false,
    "signatureCount": 0,
    "signatureVerificationResults": [],
    "overallSignatureStatus": "NONE"
  },
  "validation": {
    "xrefRebuilt": false,
    "objectStreamsRegenerated": true,
    "brokenReferencesDetected": false,
    "nonEmbeddedFontsDetected": true,
    "pdfaDeclared": false,
    "pdfaLevel": null,
    "pdfaPreserved": false,
    "pdfaCompliant": false,
    "verapdfValidated": null,
    "verapdfErrors": []
  },
  "tamperAnalysis": {
    "riskLevel": "high",
    "anomaliesDetected": 2,
    "anomalies": [
      {
        "type": "INCREMENTAL_UPDATE_INJECTION",
        "severity": "high",
        "description": "Document contains 7 incremental updates with conflicting page content",
        "location": "Byte offset 1847293"
      },
      {
        "type": "POST_EOF_DATA",
        "severity": "low",
        "description": "Data found after PDF EOF marker",
        "location": null
      }
    ]
  },
  "warnings": [
    {
      "code": "NON_EMBEDDED_FONT",
      "message": "Font 'Arial' is not embedded in the document"
    }
  ],
  "failure": null
}
```

### Async response example (PENDING)

```json
{
  "apiVersion": "2026-01-01",
  "requestId": "req_01jk4m2n3p5q6r7s",
  "submissionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "processingTimeMs": 0,
  "status": "PENDING",
  "original": {
    "sha256": "aabbccdd...",
    "sizeBytes": 102400
  },
  "normalized": null,
  "security": {},
  "validation": {},
  "tamperAnalysis": null,
  "warnings": [],
  "failure": null
}
```

## Code examples

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="curl" label="cURL">

```bash
curl -X POST https://api.pdfcanon.com/api/normalize \
  -H "X-Api-Key: pdfn_your_api_key_here" \
  -F "file=@input.pdf" \
  -F "linearize=true"
```

To skip linearization:

```bash
curl -X POST https://api.pdfcanon.com/api/normalize \
  -H "X-Api-Key: pdfn_your_api_key_here" \
  -F "file=@input.pdf" \
  -F "linearize=false"
```

</TabItem>
<TabItem value="node" label="Node.js">

```javascript
import { readFileSync } from "fs";
import FormData from "form-data";

const form = new FormData();
form.append("file", readFileSync("input.pdf"), "input.pdf");
form.append("linearize", "true");

const response = await fetch("https://api.pdfcanon.com/api/normalize", {
  method: "POST",
  headers: {
    "X-Api-Key": process.env.PDFCANON_API_KEY,
    ...form.getHeaders(),
  },
  body: form,
});

if (!response.ok) throw new Error(`Normalization failed: ${response.status}`);

const result = await response.json();
console.log("Status:", result.status);
console.log("Tamper risk:", result.tamperAnalysis?.riskLevel ?? "n/a");
console.log("Download URL:", result.normalized?.downloadUrl);
```

</TabItem>
<TabItem value="python" label="Python">

```python
import httpx

with open("input.pdf", "rb") as f:
    resp = httpx.post(
        "https://api.pdfcanon.com/api/normalize",
        headers={"X-Api-Key": "pdfn_your_api_key_here"},
        files={"file": ("input.pdf", f, "application/pdf")},
        data={"linearize": "true"},
    )

resp.raise_for_status()
result = resp.json()

print("Status:", result["status"])
print("Tamper risk:", result.get("tamperAnalysis", {}).get("riskLevel", "n/a"))
print("Download URL:", result.get("normalized", {}).get("downloadUrl"))
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp
using var client = new HttpClient();
client.DefaultRequestHeaders.Add("X-Api-Key", "pdfn_your_api_key_here");

var pdf = await File.ReadAllBytesAsync("input.pdf");
using var form = new MultipartFormDataContent();
form.Add(new ByteArrayContent(pdf) { Headers = { ContentType = new("application/pdf") } }, "file", "input.pdf");
form.Add(new StringContent("true"), "linearize");

var response = await client.PostAsync("https://api.pdfcanon.com/api/normalize", form);
response.EnsureSuccessStatusCode();

var result = await response.Content.ReadFromJsonAsync<NormalizeResponse>();
Console.WriteLine($"Status: {result!.Status}");
Console.WriteLine($"Tamper risk: {result.TamperAnalysis?.RiskLevel ?? "n/a"}");
Console.WriteLine($"Download URL: {result.Normalized?.DownloadUrl}");
```

</TabItem>
<TabItem value="java" label="Java">

```java
import java.nio.file.*;
import java.net.http.*;
import java.net.URI;

Path pdfPath = Path.of("input.pdf");
byte[] boundary = "--PDFCanonBoundary".getBytes();

String body = "--PDFCanonBoundary\r\n" +
    "Content-Disposition: form-data; name=\"file\"; filename=\"input.pdf\"\r\n" +
    "Content-Type: application/pdf\r\n\r\n";
String linearizePart = "\r\n--PDFCanonBoundary\r\n" +
    "Content-Disposition: form-data; name=\"linearize\"\r\n\r\ntrue\r\n" +
    "--PDFCanonBoundary--\r\n";

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.pdfcanon.com/api/normalize"))
    .header("X-Api-Key", "pdfn_your_api_key_here")
    .header("Content-Type", "multipart/form-data; boundary=PDFCanonBoundary")
    .POST(HttpRequest.BodyPublishers.ofByteArrays(java.util.List.of(
        body.getBytes(),
        Files.readAllBytes(pdfPath),
        linearizePart.getBytes()
    )))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());
```

</TabItem>
<TabItem value="go" label="Go">

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "mime/multipart"
    "net/http"
    "os"
)

func main() {
    f, _ := os.Open("input.pdf")
    defer f.Close()

    var buf bytes.Buffer
    w := multipart.NewWriter(&buf)
    part, _ := w.CreateFormFile("file", "input.pdf")
    io.Copy(part, f)
    w.WriteField("linearize", "true")
    w.Close()

    req, _ := http.NewRequest("POST", "https://api.pdfcanon.com/api/normalize", &buf)
    req.Header.Set("X-Api-Key", "pdfn_your_api_key_here")
    req.Header.Set("Content-Type", w.FormDataContentType())

    resp, _ := http.DefaultClient.Do(req)
    defer resp.Body.Close()

    var result map[string]any
    json.NewDecoder(resp.Body).Decode(&result)
    fmt.Printf("Status: %v\n", result["status"])
    if ta, ok := result["tamperAnalysis"].(map[string]any); ok {
        fmt.Printf("Tamper risk: %v\n", ta["riskLevel"])
    }
}
```

</TabItem>
</Tabs>
