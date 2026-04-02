---
sidebar_position: 6
---

# Attestations

PDFCanon issues a **signed JSON-LD attestation document** for every normalized PDF. The attestation captures the full provenance of the normalization — tool versions, pipeline spec, hash pair, and cryptographic findings — and is signed with an ECDSA-P256 key whose public certificate is published at a well-known URL.

Use attestations when you need to demonstrate to an auditor, regulator, or relying party that a specific document was processed by PDFCanon at a specific point in time, with a specific version of the toolchain.

---

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/.well-known/attestation-keys.json` | None | Download ECDSA public signing keys (JWKS) |
| `GET` | `/api/attestations/{normalizedSha256}` | API Key | Download the signed JSON-LD attestation document |
| `GET` | `/api/verify/{normalizedSha256}` | API Key | Verify the attestation signature |

---

## Get Signing Keys

Download the ECDSA-P256 public key set (JWKS) used to sign PDFCanon attestation certificates. This endpoint is unauthenticated and publicly accessible.

```
GET /.well-known/attestation-keys.json
```

### Response

```json
{
  "keys": [
    {
      "kty": "EC",
      "use": "sig",
      "alg": "ES256",
      "kid": "pdfcanon-attest-v1",
      "crv": "P-256",
      "x": "...",
      "y": "..."
    }
  ]
}
```

---

## Get Attestation Document

Returns the full **signed JSON-LD normalization attestation** for the given normalized SHA-256. The document is returned with `Content-Type: application/ld+json`.

```
GET /api/attestations/{normalizedSha256}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `normalizedSha256` | string | Hex-encoded SHA-256 hash of the normalized PDF |

### Response `200 OK`

```json
{
  "@context": "https://pdfcanon.com/attestation/v1",
  "@type": "NormalizationAttestation",
  "version": "1.0",
  "attestationId": "3f7a1b2e-91cd-4e87-a412-5c6d9ef01234",
  "issuedAt": "2025-01-15T10:23:44Z",
  "issuer": {
    "name": "PDFCanon",
    "url": "https://pdfcanon.com",
    "publicKeyId": "pdfcanon-attest-v1"
  },
  "subject": {
    "originalSha256": "e3b0c44298fc1c149afb...",
    "originalSizeBytes": 1234567,
    "normalizedSha256": "a87ff679a2f3e71d9181...",
    "normalizedSizeBytes": 987654,
    "contentHash": "d41d8cd98f00b204e980..."
  },
  "processing": {
    "toolchainVersion": "2.4.1",
    "qpdfVersion": "12.0.0",
    "pipelineSpec": "pdfa-2b-canonical-v3",
    "dockerImageDigest": "sha256:abc123...",
    "processingTimeMs": 1234
  },
  "findings": {
    "healthScore": 95,
    "contentRemoved": ["javascript", "open_actions"],
    "structuralRepairs": ["xref_rebuilt"],
    "warningCount": 0
  },
  "signature": {
    "algorithm": "ECDSA-P256-SHA256",
    "value": "MEUCIQDxyz...",
    "publicKeyCertificate": "https://pdfcanon.com/.well-known/attestation-keys.json"
  }
}
```

### Attestation Schema

#### Top-level fields

| Field | Type | Description |
|-------|------|-------------|
| `@context` | string | JSON-LD context URL |
| `@type` | string | Always `"NormalizationAttestation"` |
| `version` | string | Attestation schema version |
| `attestationId` | string (UUID) | Unique identifier for this attestation |
| `issuedAt` | string (ISO 8601) | When the attestation was issued |
| `issuer` | object | Attestation issuer metadata |
| `subject` | object | Document hash pair and sizes |
| `processing` | object | Toolchain versions and pipeline details |
| `findings` | object | Normalization outcome summary |
| `signature` | object | Cryptographic signature |

#### `issuer`

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Issuer name (`"PDFCanon"`) |
| `url` | string | Issuer URL |
| `publicKeyId` | string | Key identifier in the JWKS |

#### `subject`

| Field | Type | Description |
|-------|------|-------------|
| `originalSha256` | string | SHA-256 of the submitted (input) PDF |
| `originalSizeBytes` | integer | Byte size of the input PDF |
| `normalizedSha256` | string | SHA-256 of the normalized (output) PDF |
| `normalizedSizeBytes` | integer | Byte size of the normalized PDF |
| `contentHash` | string | Content-only hash (layout-independent) |

#### `processing`

| Field | Type | Description |
|-------|------|-------------|
| `toolchainVersion` | string | PDFCanon platform version |
| `qpdfVersion` | string | qpdf binary version used |
| `pipelineSpec` | string | Canonical pipeline specification identifier |
| `dockerImageDigest` | string | Digest of the processing container image |
| `processingTimeMs` | integer | Wall-clock processing time in milliseconds |

#### `findings`

| Field | Type | Description |
|-------|------|-------------|
| `healthScore` | integer | Health score (0–100) |
| `contentRemoved` | string[] | Active content types removed (e.g. `"javascript"`, `"open_actions"`) |
| `structuralRepairs` | string[] | Structural repairs applied (e.g. `"xref_rebuilt"`) |
| `warningCount` | integer | Number of normalization warnings |

#### `signature`

| Field | Type | Description |
|-------|------|-------------|
| `algorithm` | string | Signing algorithm (always `"ECDSA-P256-SHA256"`) |
| `value` | string | Base64-encoded ECDSA signature over the attestation payload |
| `publicKeyCertificate` | string | URL of the JWKS containing the signing public key |

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | `normalizedSha256` is not a valid hex SHA-256 |
| `401 Unauthorized` | Missing or invalid API key |
| `404 Not Found` | No attestation found for this hash |

---

## Verify Attestation Signature

Verifies the cryptographic ECDSA-P256 signature of the attestation document and returns a structured result.

```
GET /api/verify/{normalizedSha256}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `normalizedSha256` | string | Hex-encoded SHA-256 hash of the normalized PDF |

### Response `200 OK`

```json
{
  "valid": true,
  "attestationId": "3f7a1b2e-91cd-4e87-a412-5c6d9ef01234",
  "normalizedSha256": "a87ff679a2f3e71d9181...",
  "issuedAt": "2025-01-15T10:23:44Z",
  "reason": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | `true` if the signature is cryptographically valid |
| `attestationId` | string | UUID of the verified attestation |
| `normalizedSha256` | string | The hash that was verified |
| `issuedAt` | string (ISO 8601) | When the attestation was originally issued |
| `reason` | string \| null | Failure reason when `valid` is `false`; `null` on success |

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | `normalizedSha256` is not a valid hex SHA-256 |
| `401 Unauthorized` | Missing or invalid API key |
| `404 Not Found` | No attestation found for this hash |

---

## Code Examples

### Node.js

```typescript
import { PDFCanonClient } from '@pdfcanon/sdk';
import * as fs from 'fs';

const client = new PDFCanonClient({ apiKey: process.env.PDFCANON_API_KEY! });

// Normalize a document first, then fetch/verify its attestation
const result = await client.normalize(fs.createReadStream('invoice.pdf'), {
  fileName: 'invoice.pdf',
});

// Download the full JSON-LD attestation document
const attestation = await fetch(
  `https://api.pdfcanon.com/api/attestations/${result.normalizedInfo.normalizedSha256}`,
  { headers: { Authorization: `Bearer ${process.env.PDFCANON_API_KEY}` } }
);
const attestationDoc = await attestation.json();

// Verify the signature
const verification = await fetch(
  `https://api.pdfcanon.com/api/verify/${result.normalizedInfo.normalizedSha256}`,
  { headers: { Authorization: `Bearer ${process.env.PDFCANON_API_KEY}` } }
);
const verificationResult = await verification.json();
console.log('Signature valid:', verificationResult.valid);
```

### Python

```python
import os, requests

api_key = os.environ["PDFCANON_API_KEY"]
headers = {"Authorization": f"Bearer {api_key}"}
base_url = "https://api.pdfcanon.com"

# After normalizing, use the returned normalizedSha256
normalized_sha256 = "a87ff679a2f3e71d9181..."

# Download the attestation document
resp = requests.get(
    f"{base_url}/api/attestations/{normalized_sha256}",
    headers=headers,
)
resp.raise_for_status()
attestation_doc = resp.json()

# Verify the signature
verify_resp = requests.get(
    f"{base_url}/api/verify/{normalized_sha256}",
    headers=headers,
)
verify_resp.raise_for_status()
result = verify_resp.json()
print("Signature valid:", result["valid"])
```
