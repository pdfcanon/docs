---
sidebar_position: 6
title: Certificates
description: JWS attestation certificate and public signing key endpoints.
---

# Certificates

PDFCanon signs a JWS (JSON Web Signature) attestation for every successfully normalized document. These endpoints let you download the attestation and the public key needed to verify it.

## GET /.well-known/pdfcanon-signing-key.pem

Download the ECDSA P-256 public key used to sign attestation certificates.

```
GET https://api.pdfcanon.com/.well-known/pdfcanon-signing-key.pem
```

**Authentication:** None required (public endpoint).

### Response — 200 OK

**Content-Type:** `application/x-pem-file`

Returns the PEM-encoded ECDSA P-256 public key.

```
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
-----END PUBLIC KEY-----
```

## GET /api/certificates/\{normalizedSha256\}

Download the signed JWS attestation certificate for a normalized document.

```
GET https://api.pdfcanon.com/api/certificates/{normalizedSha256}
```

### Headers

| Header      | Required | Description               |
| ----------- | -------- | ------------------------- |
| `X-Api-Key` | ✅       | Your API key (`pdfn_...`) |

### Path parameters

| Parameter          | Type   | Description                                   |
| ------------------ | ------ | --------------------------------------------- |
| `normalizedSha256` | string | SHA-256 hex digest of the normalized document |

### Response — 200 OK

**Content-Type:** `application/jose+json`

Returns a JWS compact serialization containing the attestation claims (original hash, normalized hash, processing timestamp, pipeline version).

### Error responses

| Status | Description                             |
| ------ | --------------------------------------- |
| `401`  | Invalid or missing API key              |
| `404`  | No certificate found for the given hash |

## Verification workflow

1. Download the public key from `/.well-known/pdfcanon-signing-key.pem`
2. Download the JWS attestation from `/api/certificates/{hash}`
3. Verify the JWS signature using any standard JOSE library
4. Extract the claims to confirm the normalization provenance

```javascript
import * as jose from "jose";

const publicKeyPem = await fetch(
  "https://api.pdfcanon.com/.well-known/pdfcanon-signing-key.pem",
).then((r) => r.text());

const publicKey = await jose.importSPKI(publicKeyPem, "ES256");

const jws = await fetch(`https://api.pdfcanon.com/api/certificates/${hash}`, {
  headers: { "X-Api-Key": apiKey },
}).then((r) => r.text());

const { payload } = await jose.compactVerify(jws, publicKey);
const claims = JSON.parse(new TextDecoder().decode(payload));
console.log("Attestation claims:", claims);
```
