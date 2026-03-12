---
sidebar_position: 6
title: Data Retention
description: Stateless mode, GDPR compliance, and data deletion.
---

# Data Retention

PDFCanon provides configurable data retention policies to support GDPR compliance and data minimization requirements.

## Default retention periods

| Plan | Retention period |
|---|---|
| Free | 7 days |
| Starter | 30 days |
| Growth | 90 days |
| Pro | 90 days |

After the retention period, PDFCanon deletes submission records, artifact files, and associated metadata from all storage backends.

## Stateless mode

Enable **stateless mode** to instruct PDFCanon not to persist any input or output files after normalization. In stateless mode:

- The normalized PDF is returned only in the synchronous response
- No artifact files are stored in S3
- Submission records contain only metadata (no content references)
- Webhooks are not triggered (no async mode)

Configure stateless mode in the portal under **Settings → Data Retention**, or pass it per-request:

```bash
curl -X POST https://api.pdfcanon.com/api/normalize \
  -H "X-Api-Key: pdfn_your_api_key_here" \
  -H "X-Stateless: true" \
  -H "Content-Type: application/pdf" \
  --data-binary @sensitive.pdf \
  -o normalized.pdf
```

## GDPR compliance

### Data export

Request a full export of your organization's data:

```bash
curl -X POST https://api.pdfcanon.com/api/portal/data-export \
  -H "Authorization: Bearer eyJ..."
```

### Content erasure

Request erasure of a specific document by its content hash:

```bash
curl -X POST https://api.pdfcanon.com/api/portal/erasure \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"contentHash": "sha256:abcd1234..."}'
```

### Account deletion

Request deletion of your entire account and all associated data. A 72-hour cooling-off period applies:

```bash
curl -X DELETE https://api.pdfcanon.com/api/portal/data \
  -H "Authorization: Bearer eyJ..."
```

## Storage regions

PDFCanon stores artifacts in the region closest to where the normalization job ran. Supported regions:

- `ca-central-1` (Canada)
- `us-east-2` (United States)
- `eu-central-1` (European Union)

## Next steps

- [Authentication](/authentication) — API key management
- [Known Deviations](/known-deviations) — Edge cases and policy transparency
