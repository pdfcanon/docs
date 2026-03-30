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
from pdfcanon import Client
import os

client = Client(api_key=os.environ["PDFCANON_API_KEY"])

with open("input.pdf", "rb") as f:
    result = client.normalize(f.read())

with open("normalized.pdf", "wb") as f:
    f.write(result.output_bytes)

print(f"Output hash: {result.output_hash}")
print(f"Processing time: {result.processing_time_ms}ms")
```

## Configuration

```python
client = Client(
    api_key="pdfn_your_api_key_here",
    base_url="https://api.pdfcanon.com/api",  # default
    connect_timeout=5.0,                       # default
    read_timeout=120.0,                        # default
    max_retries=3,                             # default
)
```

## Normalization options

```python
result = client.normalize(
    file=open("input.pdf", "rb"),
    file_name="input.pdf",
    remove_annotations=True,
    signed_pdf_policy="strip",       # "reject" (default) | "strip" | "preserve"
    pdfa_policy="preserve",          # "preserve" (default) | "normalize_anyway"
    linearize=True,                  # default
    region="ca-central-1",
    webhook_url="https://example.com/hook",
    idempotency_key="my-unique-key",
    batch_id="a1b2c3d4-...",
)
```

## Async submission and polling

```python
# Submit and get a pending submission
result = client.normalize(open("large.pdf", "rb"))

# Poll by submission ID
status = client.get_submission(result.submission_id)

# Wait for completion (blocks up to timeout)
final = client.wait_for_completion(result.submission_id, timeout=120.0)
```

## Artifacts and reports

```python
# Download the normalized PDF
pdf_bytes = client.get_artifact(result.output_hash)

# Download the full pipeline report (JSON)
report = client.get_report(result.output_hash)

# Download the JWS attestation certificate
cert_bytes = client.get_certificate(result.output_hash)
```

## Batch operations

```python
# Create a batch to group submissions
batch = client.create_batch(name="Q1 migration")

# Submit PDFs with the batch ID
result = client.normalize(open("doc.pdf", "rb"), batch_id=str(batch.id))

# Check batch progress
batch = client.get_batch(batch.id)

# List all batches
batches = client.list_batches(status="open", page=1, page_size=20)

# List submissions within a batch
subs = client.list_batch_submissions(batch.id, page=1, page_size=20)
```

## Async support

```python
import asyncio
from pdfcanon import AsyncClient

async def main():
    client = AsyncClient(api_key="pdfn_your_api_key_here")
    with open("input.pdf", "rb") as f:
        result = await client.normalize(f.read())
    return result

result = asyncio.run(main())
```

## Error handling

```python
from pdfcanon import Client, PdfCanonError

client = Client(api_key="pdfn_your_api_key_here")

try:
    result = client.normalize(open("input.pdf", "rb").read())
except PdfCanonError as e:
    if e.is_transient:
        print(f"Transient — retry: {e}")
    else:
        print(f"Permanent failure: {e.error_type} — {e}")
```

## Source

SDK source code: [github.com/pdfcanon/sdk-python](https://github.com/pdfcanon/sdk-python)
