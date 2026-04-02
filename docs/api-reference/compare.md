---
sidebar_position: 7
---

# Compare

Structurally compare two PDF documents and receive a detailed diff describing what changed. The comparison operates at the **structural level** — it analyzes metadata, pages, objects, forms, annotations, security properties, and fonts — not at the pixel or rendered-content level.

---

## Endpoint

```
POST /api/compare
Content-Type: multipart/form-data
Authorization: Bearer <api-key>
```

---

## Request

Provide two PDFs as multipart fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file_a` | file (binary) | Yes | First PDF (the "before" document) |
| `file_b` | file (binary) | Yes | Second PDF (the "after" document) |
| `normalize_first` | boolean | No (default `false`) | Canonicalize both documents before comparing. Eliminates cosmetic differences caused by object ordering or xref style. |

:::info Quota usage
A plain compare counts as **1** normalization unit toward your monthly quota.
When `normalize_first=true`, both documents are normalized first — the operation counts as **2** units.
:::

---

## Response `200 OK`

Returns a `StructuralDiffReport` object.

```json
{
  "summary": {
    "totalChanges": 7,
    "severity": "minor",
    "identical": false
  },
  "metadata": [
    { "field": "ModDate", "oldValue": "2024-01-10T09:00:00Z", "newValue": "2025-03-22T14:05:11Z" }
  ],
  "pages": {
    "added": [],
    "removed": [],
    "reordered": []
  },
  "objects": {
    "added": 3,
    "removed": 1,
    "totalA": 142,
    "totalB": 144
  },
  "forms": [
    { "fieldName": "Signature1", "action": "added", "oldValue": null, "newValue": null }
  ],
  "annotations": [],
  "security": [
    { "field": "SignatureCount", "oldValue": "0", "newValue": "1" }
  ],
  "fonts": []
}
```

---

## Response Schema

### `StructuralDiffReport`

| Field | Type | Description |
|-------|------|-------------|
| `summary` | `DiffSummary` | High-level summary |
| `metadata` | `MetadataDiffEntry[]` | Document metadata field changes |
| `pages` | `PagesDiff` | Page additions, removals, and reorderings |
| `objects` | `ObjectsDiff` | Aggregate PDF object count deltas |
| `forms` | `FormFieldDiff[]` | AcroForm field changes |
| `annotations` | `AnnotationDiff[]` | Per-page annotation changes |
| `security` | `SecurityDiffEntry[]` | Security-relevant property changes |
| `fonts` | `FontDiff[]` | Font additions and removals |

---

### `DiffSummary`

| Field | Type | Description |
|-------|------|-------------|
| `totalChanges` | integer | Total count of individual changes across all dimensions |
| `severity` | string | `"none"` \| `"minor"` \| `"moderate"` \| `"major"` |
| `identical` | boolean | `true` if no structural differences were found |

---

### `MetadataDiffEntry`

A change to a single document information field (PDF `/Info` dictionary).

| Field | Type | Description |
|-------|------|-------------|
| `field` | string | Metadata key, e.g. `"Title"`, `"Author"`, `"ModDate"` |
| `oldValue` | string \| null | Value in `file_a`; `null` if the field was absent |
| `newValue` | string \| null | Value in `file_b`; `null` if the field was removed |

---

### `PagesDiff`

| Field | Type | Description |
|-------|------|-------------|
| `added` | `PageInfo[]` | Pages present in `file_b` but not `file_a` |
| `removed` | `PageInfo[]` | Pages present in `file_a` but not `file_b` |
| `reordered` | `PageReorder[]` | Pages that exist in both but at different positions |

#### `PageInfo`

| Field | Type | Description |
|-------|------|-------------|
| `pageNumber` | integer | 1-based page number |
| `contentHash` | string | SHA-256 fingerprint of the page content (16 hex chars) |

#### `PageReorder`

| Field | Type | Description |
|-------|------|-------------|
| `oldPosition` | integer | 1-based page number in `file_a` |
| `newPosition` | integer | 1-based page number in `file_b` |
| `contentHash` | string | SHA-256 fingerprint of the page content |

---

### `ObjectsDiff`

Approximate object-count delta based on the PDF cross-reference table.

| Field | Type | Description |
|-------|------|-------------|
| `added` | integer | Net gain in PDF objects from A to B |
| `removed` | integer | Net loss in PDF objects from A to B |
| `totalA` | integer | Total object count in `file_a` |
| `totalB` | integer | Total object count in `file_b` |

---

### `FormFieldDiff`

A change to a single AcroForm field.

| Field | Type | Description |
|-------|------|-------------|
| `fieldName` | string | PDF field name (`/T` entry) |
| `action` | string | `"added"` \| `"removed"` \| `"modified"` |
| `oldValue` | string \| null | Field value in `file_a`; `null` when added or unset |
| `newValue` | string \| null | Field value in `file_b`; `null` when removed or unset |

---

### `AnnotationDiff`

A per-page annotation change.

| Field | Type | Description |
|-------|------|-------------|
| `page` | integer | 1-based page number |
| `type` | string | Annotation subtype, e.g. `"Text"`, `"Link"`, `"Widget"` |
| `action` | string | `"added"` \| `"removed"` \| `"modified"` |

---

### `SecurityDiffEntry`

A change to a security-relevant document property.

| Field | Type | Description |
|-------|------|-------------|
| `field` | string | Property name, e.g. `"Encrypted"`, `"SignatureCount"`, `"JavaScript"`, `"OpenAction"`, `"LaunchAction"` |
| `oldValue` | string | Value in `file_a` |
| `newValue` | string | Value in `file_b` |

---

### `FontDiff`

A font added or removed between the two documents.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Font base name, e.g. `"Helvetica"` or `"ABCDEF+Arial"` |
| `action` | string | `"added"` (in `file_b` but not `file_a`) \| `"removed"` (in `file_a` but not `file_b`) |

---

## Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | `file_a` or `file_b` missing from the request |
| `401 Unauthorized` | Missing or invalid API key |
| `402 Payment Required` | Monthly quota exceeded |

---

## Code Examples

### Node.js

```typescript
import { PDFCanonClient } from '@pdfcanon/sdk';
import * as fs from 'fs';

const client = new PDFCanonClient({ apiKey: process.env.PDFCANON_API_KEY! });

// Compare two PDFs
const report = await client.compare(
  'original.pdf',
  'revised.pdf',
  { normalizeFirst: true }
);

if (report.summary.identical) {
  console.log('Documents are structurally identical');
} else {
  console.log(`Severity: ${report.summary.severity}`);
  console.log(`Total changes: ${report.summary.totalChanges}`);

  for (const meta of report.metadata) {
    console.log(`Metadata change — ${meta.field}: "${meta.oldValue}" → "${meta.newValue}"`);
  }

  if (report.pages.added.length > 0) {
    console.log(`Pages added: ${report.pages.added.map(p => p.pageNumber).join(', ')}`);
  }
}
```

### Python (sync)

```python
import os
from pdfcanon import PDFCanonClient

client = PDFCanonClient(api_key=os.environ["PDFCANON_API_KEY"])

with open("original.pdf", "rb") as f_a, open("revised.pdf", "rb") as f_b:
    report = client.compare(
        f_a,
        f_b,
        file_name_a="original.pdf",
        file_name_b="revised.pdf",
        normalize_first=True,
    )

if report.summary.identical:
    print("Documents are structurally identical")
else:
    print(f"Severity: {report.summary.severity}")
    print(f"Total changes: {report.summary.total_changes}")

    for entry in report.metadata:
        print(f"Metadata — {entry.field}: '{entry.old_value}' → '{entry.new_value}'")

    for font in report.fonts:
        print(f"Font {font.action}: {font.name}")
```

### Python (async)

```python
import os, asyncio
from pdfcanon import AsyncPDFCanonClient

async def main():
    client = AsyncPDFCanonClient(api_key=os.environ["PDFCANON_API_KEY"])

    with open("original.pdf", "rb") as f_a, open("revised.pdf", "rb") as f_b:
        report = await client.compare(
            f_a,
            f_b,
            file_name_a="original.pdf",
            file_name_b="revised.pdf",
        )

    print(f"Identical: {report.summary.identical}")
    print(f"Changes: {report.summary.total_changes}")

asyncio.run(main())
```

### cURL

```bash
curl -X POST https://api.pdfcanon.com/api/compare \
  -H "Authorization: Bearer $PDFCANON_API_KEY" \
  -F "file_a=@original.pdf" \
  -F "file_b=@revised.pdf" \
  -F "normalize_first=true"
```
