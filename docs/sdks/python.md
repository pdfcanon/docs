---
sidebar_position: 2
title: Python SDK
description: PDFCanon SDK for Python.
---

# Python SDK

The PDFCanon Python SDK provides a simple client for the PDFCanon API.

## Installation

```bash
pip install pdfcanon
```

## Quickstart

```python
from pdfcanon import PdfCanonClient
import os

client = PdfCanonClient(api_key=os.environ["PDFCANON_API_KEY"])

with open("input.pdf", "rb") as f:
    result = client.normalize(f.read())

with open("normalized.pdf", "wb") as f:
    f.write(result.output_bytes)

print(f"Output hash: {result.output_hash}")
print(f"Processing time: {result.processing_time_ms}ms")
```

## Async support

```python
import asyncio
from pdfcanon import AsyncPdfCanonClient

async def main():
    client = AsyncPdfCanonClient(api_key="pdfn_your_api_key_here")
    with open("input.pdf", "rb") as f:
        result = await client.normalize(f.read())
    return result

result = asyncio.run(main())
```

## Error handling

```python
from pdfcanon import PdfCanonClient, PdfCanonError

client = PdfCanonClient(api_key="pdfn_your_api_key_here")

try:
    result = client.normalize(open("input.pdf", "rb").read())
except PdfCanonError as e:
    if e.is_transient:
        print(f"Transient — retry: {e}")
    else:
        print(f"Permanent failure: {e.error_type} — {e}")
```

## Source

SDK source code: [`sdks/python/`](https://github.com/napzoom/PDFCanon/tree/main/sdks/python)
