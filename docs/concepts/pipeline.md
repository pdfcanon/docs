---
sidebar_position: 2
title: The normalization pipeline
description: Visual overview of the deterministic 11-stage PDFCanon pipeline.
---

# The normalization pipeline

Every PDF submitted to PDFCanon flows through the same deterministic pipeline. The high-level shape:

```mermaid
flowchart LR
    Upload([Upload PDF]) --> Normalize[Normalize<br/>11 stages]
    Normalize --> Hash[Canonical SHA-256<br/>+ content hash]
    Hash --> Store[(Store<br/>region-pinned)]
    Store --> Webhook[Webhook<br/>delivery]
```

The pipeline itself is fixed and ordered — stages do not run in parallel and do not skip:

```mermaid
flowchart TD
    S0[0 · PDF/A detection]
    S1[1 · Tamper detection]
    S2[2 · Structural repair]
    S3[3 · Digital signature detection]
    S4[4 · Active content removal]
    S5[5 · AcroForm handling]
    S6[6 · Metadata canonicalization]
    S7[7 · Font resource validation]
    S8[8 · Final rewrite]
    S9[9 · Content hash]
    S10[10 · PDF/A compliance validation]

    S0 --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7 --> S8 --> S9 --> S10

    S8 -. emits .-> CanonicalBytes[(Canonical PDF bytes<br/>SHA-256)]
    S9 -. emits .-> ContentHash[(Content hash<br/>layout-independent)]
    S10 -. emits .-> Report[(Validation report)]
```

## Stage reference

| Stage | Name                            | What it does                                                            |
| ----- | ------------------------------- | ----------------------------------------------------------------------- |
| 0     | **PDF/A detection**             | Identify the declared compliance level of the input.                    |
| 1     | **Tamper detection**            | Detect incremental-update injection, shadow content, post-EOF data.     |
| 2     | **Structural repair**           | Fix malformed cross-reference tables and trailer dictionaries.          |
| 3     | **Digital signature detection** | Identify and handle existing digital signatures per policy.             |
| 4     | **Active content removal**      | Strip JavaScript, embedded executables, launch actions.                 |
| 5     | **AcroForm handling**           | Flatten or preserve interactive form fields.                            |
| 6     | **Metadata canonicalization**   | Normalize XMP and DocInfo metadata to epoch timestamps.                 |
| 7     | **Font resource validation**    | Validate fonts and detect non-embedded subsets.                         |
| 8     | **Final rewrite**               | Linearize and emit a clean canonical PDF with deterministic IDs.        |
| 9     | **Content hash**                | SHA-256 over extracted text for semantic deduplication.                 |
| 10    | **PDF/A compliance validation** | Validate PDF/A compliance of the output (when input declared PDF/A).    |

## Determinism guarantees

For a given input PDF and a given [`toolchain_version`](./toolchain-version.md), every stage is deterministic. The same input always produces the same canonical bytes and the same SHA-256, on any host, in any region.

The pipeline is implemented in `src/PDFCanon.Worker/Pipeline/Stages/` — the diagram above mirrors the actual stage order one-for-one.

## Next

- [Why normalize PDFs?](./why-normalize.md)
- [Toolchain versioning](./toolchain-version.md)
- [Normalizing PDFs (guide)](/guides/normalizing-pdfs)
