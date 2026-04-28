---
sidebar_position: 3
title: Toolchain versioning
description: How toolchain_version makes PDFCanon's deterministic hashes a stable contract you can rely on.
---

# Toolchain versioning

`toolchain_version` is the contract that makes PDFCanon's deterministic hashes useful in production. It identifies the **exact** pipeline + tool combination that produced a canonical output, so that you can rely on the hash being stable over time — and know unambiguously when it isn't.

Every normalization response and every [attestation](/api-reference/attestations) includes a `toolchainVersion` field. Treat it as part of the identity of the output, not as a free-form version label.

## What it is

`toolchain_version` is an opaque version string identifying:

- The exact `qpdf` binary version
- The exact `veraPDF` validator version
- The pipeline-stage logic version (the code in `src/PDFCanon.Worker/Pipeline/Stages/`)
- The font resource set version
- The canonicalization rule set (metadata defaults, ID derivation, linearization flags)

If any of these change, `toolchain_version` changes. If none change, it stays pinned.

## The stability guarantee

> **For a given input PDF and a given `toolchain_version`, the canonical SHA-256 is bit-for-bit identical.**
>
> Across regions. Across hosts. Across time.

This is the only promise hashing-based systems actually need. It lets you:

- Use the canonical SHA-256 as a content-addressable storage key
- Use it as an idempotency key for downstream pipelines
- Use it as evidence in audit and compliance workflows
- Compare hashes across regions (`tor1`, `sfo3`, `fra1`) without surprises

## What triggers a version bump

A `toolchain_version` bump happens when **any** of the following change:

| Change                                     | Why it bumps                                       |
| ------------------------------------------ | -------------------------------------------------- |
| `qpdf` binary upgrade                      | Output bytes can shift between qpdf versions.      |
| `veraPDF` upgrade                          | Validation verdicts and report shape may shift.    |
| Pipeline stage logic change                | New normalization rules, bug fixes.                |
| Font resource set change                   | Font subset names or substitution rules change.    |
| Canonicalization rule change               | Metadata defaults, epoch timestamps, ID strategy.  |

Bumps are announced in the [Changelog](/changelog) and via the platform status page.

## Upgrade semantics

When a new `toolchain_version` ships, two things are true:

1. **History is preserved.** Hashes already issued under the old version remain valid for audit. PDFCanon never silently rewrites past outputs.
2. **New normalizations may produce different hashes.** Re-normalizing the same input under a new version may yield a different canonical SHA-256 — that is the entire point of the version bump.

### Recommended storage pattern

Store the `(canonical_sha256, toolchain_version)` pair, not the hash alone:

```jsonc
{
  "submissionId": "sub_01H…",
  "canonicalSha256": "f9c3a18b2d…",
  "toolchainVersion": "2.4.1",
  "createdAt": "2026-04-15T12:00:00Z"
}
```

When checking equivalence between two stored records:

- Same `toolchainVersion` + same `canonical_sha256` → guaranteed identical canonical output.
- Different `toolchainVersion` → hashes are not directly comparable. Re-normalize one side under the other's version, or accept either as canonical for that era.

### Re-normalization

To bring an existing corpus onto a newer `toolchain_version`, resubmit the originals. The platform stores the original alongside the canonical output for exactly this reason. See [Bulk processing](/guides/bulk-processing) for batching strategy and idempotency notes.

## Why this is the differentiator

Lots of tools "rewrite PDFs." Almost none of them give you a stable hash contract across upgrades. With PDFCanon:

- Your hashes don't change because we patched a dependency.
- When they *do* change, you know exactly when, why, and what to do.
- The version is part of the API contract, not a footnote.

## Related

- [Why normalize PDFs?](./why-normalize.md)
- [The normalization pipeline](./pipeline.md)
- [Attestations API](/api-reference/attestations)
- [Bulk processing](/guides/bulk-processing)
- [Changelog](/changelog)
