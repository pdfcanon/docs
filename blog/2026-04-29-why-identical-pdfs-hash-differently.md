---
slug: why-identical-pdfs-hash-differently
title: Why Two Identical PDFs Have Different SHA-256 Hashes
description: A deep dive into the seven sources of non-determinism in the PDF format, why this breaks audit trails and deduplication, and how an 11-stage normalization pipeline produces stable canonical hashes.
authors: [napzoom]
tags: [pdf, sha256, normalization, security, compliance]
image: /img/blog/pdf-hash-instability-og.png
---

I spent a long time figuring out why `sha256sum invoice.pdf` returns a different hash every time my accounting software re-exports "the same" document.

Turns out this is a fundamental property of the PDF format - and it quietly breaks a number of real-world systems that depend on stable file hashes: deduplication, audit trails, content-addressed storage, integrity verification.

<!-- truncate -->

## The problem in 30 seconds

Open any PDF in a hex editor after a round-trip through Adobe Acrobat, Preview.app, or even just re-saving from the same tool. The bytes change. The hash changes. The visual content is identical.

```bash
# Save invoice.pdf from Word today
$ sha256sum invoice.pdf
a742f...e91d  invoice.pdf

# Re-export the exact same document tomorrow
$ sha256sum invoice.pdf
8c20b1...f4a3  invoice.pdf
```

These aren't different documents. They render pixel-for-pixel identically. But every byte-level deduplication, audit trail, content addressed storage, integrity verification sees two completely different files.

## What's actually different?

I dug into the ISO 32000-2 spec and PDFs have at least **seven sources of non-determinism**.

### 1. Timestamps

`/CreationDate` and `/ModDate` in the document info dictionary change on every save. So does the XMP metadata packet.  An embedded XML blob that mirrors these dates plus tool-specific metadata.

```bash
# Today's save
/CreationDate (D:20260408093000-04'00')
/ModDate (D:20260408093000-04'00')

# Tomorrow's save - same document
/CreationDate (D:20260409141522-04'00')
/ModDate (D:20260409141522-04'00')
```

In the above example, two bytes were changed. The hash is completely different.

### 2. Producer strings

Every tool (understandably) writes its own signature into the `/Producer` and `/Creator` fields:

```bash
/Producer (Microsoft® Word for Microsoft 365)
/Producer (macOS Version 14.2 \(Build 23C64\) Quartz PDFContext)
/Producer (LibreOffice 7.6)
/Producer (iLovePDF)
```

Print a Word document to PDF on two different machines, both have the same visual output but different producer strings and thus different hashes.

### 3. Incremental updates

This is the big one.

PDFs support "incremental saves" where each edit **appends** new objects to the end of the file rather than rewriting it. The previous revision doesn't get deleted.  It's still there in the bytes, invisible to the viewer but present in the file.

```bash
┌──────────────────────────┐
│   Original document      │  ← revision 1
│   %%EOF                  │
├──────────────────────────┤
│   Edited page 3          │  ← revision 2 (appended)
│   %%EOF                  │
├──────────────────────────┤
│   Changed a font         │  ← revision 3 (appended)
│   %%EOF                  │
├──────────────────────────┤
│   "Final" save           │  ← revision 4 (appended)
│   %%EOF                  │
└──────────────────────────┘
```

Your 200 KB contract might have 1.4 MB of invisible revision history of previous drafts, deleted pages, redacted content. Each revision adds another `%%EOF` marker.

**I've seen production documents with 47 of them.**

The kicker: two people can start with the same base document, make the same single edit, and produce files with completely different byte layouts depending on how many prior incremental saves exist in their copy.

### 4. Object ordering

A PDF is a collection of numbered objects. The spec doesn't require them to be serialized in any particular order. Object 1 can come before or after Object 47. Different tools and even the same tool across versions arrange them differently.

### 5. Cross-reference tables

The xref structure maps object numbers to byte offsets. It can be a plain text table or a compressed stream. Entries can be in any order. Any time the objects move (see #4) the offset changes.

### 6. Object streams

Objects can be packed into compressed `ObjStm` containers or written as individual top level objects. This is a space optimization, but different tools make different choices and the choice of course changes the bytes.

### 7. The /ID array

A pair of hex strings meant to uniquely identify the document. Supposed to be stable across saves, but many tools regenerate them.

In practice, about half the PDF tools I tested regenerate both strings on every save.

## The stuff that shouldn't be there at all

Beyond non-determinism, PDFs can contain things that have no business being in a document you're storing:

- **Embedded JavaScript** - `/JavaScript` dictionaries that execute code, often with access to the filesystem and network.
- **Actions** - `/AA` (additional actions) that run on events like page open, page close, document open, document close, etc.
- **Launch actions** - `/Launch` entries that can open external applications, ugh why?
- **Open actions** - `/OpenAction` that runs when the document is opened, seriously?
- **File attachments** - hidden in the `/EmbeddedFiles` name tree
- **Rich media annotations** - embedded Flash, video, 3D models
- **Interactive form fields** - AcroForm state that changes on user interaction

These don't affect visual rendering, but they change the hash. And they're a real security risk in every PDF your users upload.

## Why this matters

If you're a developer building a SaaS that accepts document uploads, this bites you in at least four ways:

**SOC 2 audits.** "How do you verify document integrity?" is a real question auditors ask. If your answer depends on file hashes, you need those hashes to be stable. A file that hashes differently on re-download is a finding.

**Deduplication.** Content-addressed storage is impossible when the same logical document produces different hashes. You end up storing 12 copies of the same contract because each was exported from a slightly different tool.

**Audit trails.** "Prove this is the same document that was submitted on March 3rd" fails if a re-download produces different bytes. Your audit chain breaks at the first hash comparison.

**Legal discovery.** Those invisible incremental updates can contain previous drafts, deleted content, or metadata that the submitter didn't intend to share. Accepting and storing the raw file means you're potentially holding onto data you shouldn't have.

## What we built

I built an **11 stage normalization pipeline** that takes an arbitrary PDF and produces a deterministic canonical form.

**Same input → same bytes → same SHA-256. Guaranteed.**

Here's what each stage does:

| Stage | Name                           | Purpose                                                                                                                                                                                                                                    |
| ----- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0     | PDF/A Detection                | Identify archival documents so we don't break ISO 19005 compliance downstream                                                                                                                                                              |
| 1     | Tamper Analysis                | Count `%%EOF` markers, detect post-EOF data appended after the logical end, find shadow content, flag incremental update injection. Outputs a risk score and anomaly report                                                                |
| 2     | Structural Repair              | qpdf collapses all incremental updates into a single revision, rewrites the cross-reference table, normalizes object streams, decrypts encrypted PDFs                                                                                      |
| 3     | Digital Signature Verification | Full PKCS#7/CMS cryptographic verification via BouncyCastle - not just detection, actual chain-of-trust validation. Configurable policy: reject, strip, or preserve                                                                        |
| 4     | Active Content Removal         | Custom object tree walker strips `/JavaScript`, `/AA`, `/OpenAction`, `/Launch`, `/EmbeddedFiles`, rich media. Recursively traverses the entire object graph not just top-level flags                                                    |
| 5     | AcroForm Flattening            | Render interactive form fields into page content as static graphics, then removes `/AcroForm` from the catalog                                                                                                                              |
| 6     | Metadata Canonicalization      | Set dates to epoch zero, set producer to `PDFCanon`, strip XMP entirely, overwrite `/ID` with a deterministic value derived from content.                                                                                                  |
| 7     | Font Validation                | Re-embed non-embedded Standard 14 fonts using metric-compatible substitutes (Liberation Sans, URW Base35). A PDF _referencing_ Helvetica without _embedding_ it is technically valid per the spec, but renders differently on every system |
| 8     | Final Canonical Rewrite        | Second qpdf pass: `--normalize-content=y --recompress-flate --deterministic-id`. Forces stable object ordering, stable xref, and re-compresses all Flate streams to eliminate compression-level variance between tools                     |
| 9     | Content Hash                   | Extract text via `pdftotext`, normalize whitespace, compute SHA-256. This is a _logical_ content hash, stable across visually equivalent documents even if they were produced by completely different tools                               |
| 10    | veraPDF Validation             | For documents that declared PDF/A, validate the final output against ISO 19005 using veraPDF. Failures become warnings, not errors.  We don't silently break archival compliance                                                           |

**qpdf is pinned to an exact version** in a sandboxed container, referenced by image digest - not by tag. Toolchain drift causes "deterministic" systems to silently become non-deterministic. If zlib changes its default compression level between versions (and it has), your "canonical" output drifts with it.

**The pipeline runs two qpdf passes.** The first pass (Stage 2) repairs structure and collapses incremental updates. Intermediate stages modify the document in (stripping active content, canonicalizing metadata, re-embedding fonts). The second pass (Stage 8) re-normalizes everything that we touched because the PDF library we use for Flate compression isn't bitwise reproducible across runs. The second pass through qpdf's `--recompress-flate` forces it to be.

## The API response

You send a PDF, you get back the normalized file plus a compliance report:

```json
{
  "original": {
    "sha256": "a742f1...e91d",
    "sizeBytes": 1482301
  },
  "normalized": {
    "sha256": "c891a0...7f02",
    "sizeBytes": 198412,
    "contentHash": "e45d21...b318"
  },
  "security": {
    "javascriptRemoved": true,
    "openActionsRemoved": true,
    "embeddedFilesRemoved": false,
    "incrementalUpdatesRemoved": true,
    "acroformFlattened": true,
    "digitalSignaturesDetected": false
  },
  "tamperAnalysis": {
    "riskLevel": "medium",
    "anomaliesDetected": 2,
    "anomalies": [
      {
        "type": "INCREMENTAL_UPDATE_INJECTION",
        "severity": "medium",
        "description": "Document contains 12 incremental updates (%%EOF markers)."
      },
      {
        "type": "POST_EOF_DATA",
        "severity": "low",
        "description": "1,847 bytes of non-whitespace data after final %%EOF marker."
      }
    ]
  },
  "validation": {
    "pdfaDeclared": true,
    "pdfaLevel": "2B",
    "pdfaPreserved": true,
    "verapdfValidated": true
  },
  "healthScore": 72
}
```

Every PDF that enters your system gets a stable hash, a security report, and a tamper risk score.

Notice the `contentHash` field - that's the logical content hash from Stage 9. Even if two PDFs were produced by completely different tools (Word vs. LibreOffice), if the text content is equivalent, the content hash matches. The `sha256` on `normalized` is the byte-level hash of the canonical output, which is deterministic for the same input.

## What it's not

This isn't a virus scanner, viewer, editor, or converter. It's infrastructure - one API call that sits between "user uploads PDF" and "you storing it."

Think of it as `go fmt` for PDFs, except the input is untrusted and adversarial. The goal is to give you a stable hash and a clean, normalized file that you can safely store, display, or feed into downstream systems without worrying about non-determinism or hidden nasties.

## Try it

We're live at **[pdfcanon.com](https://pdfcanon.com)** with a free tier - 100 PDFs/month, no credit card required.

```bash
curl -X POST https://api.pdfcanon.com/api/normalize \
  -H "X-Api-Key: pdfn_your_key_here" \
  -F "file=@contract.pdf"
```

[Documentation](https://docs.pdfcanon.com) · [API Reference](https://docs.pdfcanon.com/docs/api-reference/normalize) · [SDKs](https://docs.pdfcanon.com/sdks/dotnet) · [MCP Server](https://docs.pdfcanon.com/mcp-server) · [Known Deviations](https://docs.pdfcanon.com/docs/known-deviations)

Happy to answer questions about the PDF spec, the pipeline, or the edge cases that made me mass-delete objects at 2 AM.
