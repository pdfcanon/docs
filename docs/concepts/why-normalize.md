---
sidebar_position: 1
title: Why normalize PDFs?
description: Why two structurally-identical PDFs produce different SHA-256 hashes, and what PDFCanon does about it.
---

# Why normalize PDFs?

PDFs are not stable files. Two PDFs that render identically — same pages, same text, same layout — routinely produce **different** SHA-256 hashes. This is the core problem PDFCanon solves.

If you're storing, deduplicating, signing, hashing, or auditing PDFs, this matters.

## The problem in one example

```
invoice-2026-04-export-A.pdf       SHA-256: a1b2c3d4e5f6…
invoice-2026-04-export-B.pdf       SHA-256: 9f8e7d6c5b4a…   ← different bytes, same document
```

Both files came from the same source, render identically, and contain the same logical content. But because their bytes differ, every hash-based system downstream — deduplication, integrity checks, content-addressed storage, audit logs — sees them as two different documents.

After running both through PDFCanon:

```
canonical (from A)                 SHA-256: f9c3a18b2d…
canonical (from B)                 SHA-256: f9c3a18b2d…   ← identical
```

Same canonical bytes, same hash, every time, in any region.

## Where the drift comes from

PDFs accumulate non-semantic differences from many sources:

- **Incremental updates.** PDF allows revisions to be appended to the end of a file rather than rewritten in place. Two saves of "the same" document may carry different revision histories.
- **Metadata mutations.** `Producer`, `Creator`, `CreationDate`, `ModDate`, and the XMP packet change every time a tool touches the file — even if no visible content changes.
- **Object stream re-ordering.** PDF objects can be serialized in any order; different libraries pick different orders.
- **Compression flags.** The same content stream can be `/FlateDecode`-compressed at different levels, or stored uncompressed, with no visible difference.
- **Font subset names.** Embedded font subsets get random six-letter prefixes (`AAAAAB+Helvetica`) that change per export.
- **Linearization.** "Web-optimized" linearization rewrites the file structure for streaming. Toggling it changes every byte.
- **Object IDs and `/ID` arrays.** Document IDs are commonly random per save.
- **Embedded files, JavaScript, AcroForm state.** Active content carries state that mutates over time.

Any one of these flips the SHA-256.

## Why it matters

| Use case                          | What breaks without normalization                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| **Deduplication / storage**       | The same document is stored N times under N different hashes.                      |
| **Audit & compliance**            | "Has this document changed?" cannot be answered from a hash alone.                 |
| **E-signing & evidence**          | Signed-hash verification breaks across re-saves, OS conversions, or PDF/A coercion. |
| **Tamper detection**              | Real tampering is indistinguishable from benign mutation.                          |
| **Active-content risk**           | JavaScript, embedded executables, launch actions, and AcroForm scripts persist.    |
| **Content-addressed pipelines**   | Idempotency keys based on file hash retrigger needlessly.                          |

## What "canonical" means in PDFCanon

PDFCanon runs every input through a deterministic [11-stage pipeline](./pipeline.md) that:

1. Removes drift sources (metadata, font name randomness, object ordering, linearization variance).
2. Strips active content (JavaScript, embedded files, launch actions, dangerous AcroForm logic).
3. Repairs structural defects (broken xref, post-EOF data, shadow content).
4. Re-emits the document with stable IDs, epoch timestamps, and a fixed object order.
5. Emits a SHA-256 over the canonical bytes — and a separate content hash over extracted text.

The output is bit-for-bit reproducible. Same input → same output → same hash, on any host, in any region, today or next month — as long as the [`toolchain_version`](./toolchain-version.md) is the same.

## What PDFCanon is *not*

PDFCanon is structural-canonicalization infrastructure. It is **not**:

- Antivirus or malware sandboxing
- Content moderation
- OCR or text extraction
- A general-purpose PDF editor

We strip active content because it breaks determinism, not because we're scanning for threats. If you need malware analysis, run it alongside PDFCanon, not instead of it.

## Try it

Drop a PDF into the [Playground](https://app.pdfcanon.com/playground) (no signup, 3 PDFs/day) to see the canonical hash and the deductions report. Run the same file twice from different sources — the canonical hash will match.

## Next

- [The 11-stage pipeline](./pipeline.md)
- [Toolchain versioning](./toolchain-version.md)
- [Quickstart](/quickstart)
