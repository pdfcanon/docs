---
sidebar_position: 2
title: Quickstart
description: Normalize your first PDF in under 5 minutes.
---

# Quickstart

Normalize your first PDF in under 5 minutes using the PDFCanon API.

## Prerequisites

- A PDFCanon account — [sign up at app.pdfcanon.com](https://app.pdfcanon.com)
- An API key from the **API Keys** section of the portal
- `curl` or an HTTP client of your choice

## Step 1 — Get your API key

Navigate to **app.pdfcanon.com → API Keys** and create a new key. Copy the key value — it starts with `pdfn_`.

## Step 2 — Normalize a PDF

```bash
curl -X POST https://api.pdfcanon.com/api/normalize \
  -H "X-Api-Key: pdfn_your_api_key_here" \
  -H "Content-Type: application/pdf" \
  --data-binary @input.pdf \
  -o normalized.pdf
```

If normalization succeeds, `normalized.pdf` contains the canonical output and the response headers include the submission metadata.

## Step 3 — Retrieve the submission record

```bash
curl https://api.pdfcanon.com/api/submissions/{submissionId} \
  -H "X-Api-Key: pdfn_your_api_key_here"
```

## Step 4 — (Optional) Fetch the normalization report

```bash
curl https://api.pdfcanon.com/api/reports/{outputHash} \
  -H "X-Api-Key: pdfn_your_api_key_here"
```

## Next steps

- [Why normalize PDFs?](/concepts/why-normalize) — Background on what the pipeline actually does
- [The normalization pipeline](/concepts/pipeline) — All 11 stages, visualized
- [Toolchain versioning](/concepts/toolchain-version) — The stability contract behind every hash
- [Authentication](/authentication) — Learn about API key scopes and rotation
- [Normalizing PDFs](/guides/normalizing-pdfs) — Deep dive into the normalization pipeline
- [Webhooks](/guides/webhooks) — Receive async notifications when jobs complete
- [SDKs](/sdks/dotnet) — Use an official SDK in your language
