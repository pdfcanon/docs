---
sidebar_position: 3
title: TypeScript / Node.js SDK
description: PDFCanon SDK for TypeScript and Node.js.
---

# TypeScript / Node.js SDK

The PDFCanon TypeScript SDK provides a fully-typed client for the PDFCanon API.

## Installation

```bash
npm install @pdfcanon/client
```

## Quickstart

```typescript
import { PdfCanonClient } from '@pdfcanon/client';
import { readFileSync, writeFileSync } from 'fs';

const client = new PdfCanonClient({
  apiKey: process.env.PDFCANON_API_KEY!,
});

const pdf = readFileSync('input.pdf');
const result = await client.normalize(pdf);

writeFileSync('normalized.pdf', result.outputBytes);
console.log(`Output hash: ${result.outputHash}`);
console.log(`Processing time: ${result.processingTimeMs}ms`);
```

## Configuration

```typescript
const client = new PdfCanonClient({
  apiKey: 'pdfn_your_api_key_here',
  baseUrl: 'https://api.pdfcanon.com',  // default
  connectTimeout: 5000,                  // ms, default
  readTimeout: 120000,                   // ms, default
  maxRetries: 3,                         // default
});
```

## Normalization options

```typescript
const result = await client.normalize(pdf, 'input.pdf', {
  removeAnnotations: true,
  signedPdfPolicy: 'strip',       // 'reject' (default) | 'strip' | 'preserve'
  pdfaPolicy: 'preserve',         // 'preserve' (default) | 'normalize_anyway'
  linearize: true,                // default
  region: 'ca-central-1',
  webhookUrl: 'https://example.com/hook',
  idempotencyKey: 'my-unique-key',
  batchId: 'a1b2c3d4-...',
});
```

## Async submission and polling

```typescript
const submission = await client.submit(pdf);

// Poll by submission ID
const status = await client.getSubmission(submission.submissionId);

// Wait for completion (blocks up to timeout)
const result = await client.waitForCompletion(submission.submissionId);
```

## Artifacts and reports

```typescript
// Download the normalized PDF
const pdfBytes: Buffer = await client.getArtifact(result.outputHash);

// Download the full pipeline report (JSON)
const report = await client.getReport(result.outputHash);

// Download the JWS attestation certificate
const cert: Buffer = await client.getCertificate(result.outputHash);
```

## Batch operations

```typescript
// Create a batch
const batch = await client.createBatch('Q1 migration');

// Submit with batch ID
const result = await client.normalize(pdf, 'doc.pdf', { batchId: batch.id });

// Check batch progress
const status = await client.getBatch(batch.id);

// List batches
const batches = await client.listBatches('open', 1, 20);

// List submissions in a batch
const subs = await client.listBatchSubmissions(batch.id, 1, 20);
```

## Error handling

```typescript
import { PdfCanonError } from '@pdfcanon/client';

try {
  const result = await client.normalize(pdf);
} catch (err) {
  if (err instanceof PdfCanonError && err.isTransient) {
    console.log('Transient error — safe to retry');
  } else {
    console.error('Permanent failure:', err);
  }
}
```

## Source

SDK source code: [github.com/pdfcanon/sdk-node](https://github.com/pdfcanon/sdk-node)
