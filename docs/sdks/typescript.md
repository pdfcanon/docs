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

## Async / webhook mode

```typescript
const submission = await client.submit(pdf);
// Use webhooks or poll:
const result = await client.waitForCompletion(submission.submissionId);
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

SDK source code: [`sdks/node/`](https://github.com/napzoom/PDFCanon/tree/main/sdks/node)
