---
sidebar_position: 13
title: Known Deviations
description: Edge cases and transparency disclosures for the PDFCanon normalization pipeline.
---

# Known Deviations

This page documents known edge cases, deliberate policy decisions, and behaviors that may differ from expectations. Transparency about these deviations helps you make informed decisions about using PDFCanon in your workflow.

## Digital signatures

### Signatures are invalidated after normalization

By default, PDFCanon removes or invalidates existing digital signatures during normalization. This is a deliberate policy decision: the normalization process modifies the document content (font embedding, metadata canonicalization, linearization), which would invalidate any existing signature anyway.

If your workflow requires signature preservation, set `digitalSignaturePolicy: preserve` in your normalization request. In this mode:

- The pipeline detects existing signatures and attempts to preserve them
- If preservation fails (e.g., the signature covers the entire document), the job fails with `SIGNATURE_PRESERVATION_FAILED`
- A `SIGNATURE_INVALIDATED` warning is included when signatures are removed in default mode

## PDF/A compliance

### veraPDF validation is best-effort

PDFCanon targets PDF/A-2b output. For documents declared as PDF/A, veraPDF validation is run after normalization. However:

- veraPDF may report errors for edge cases in complex documents
- veraPDF validation failures do not cause the normalization job to fail (they are recorded as warnings)
- The `verapdf` section of the report includes any errors found

## Font handling

### Missing fonts are embedded using substitutes

When a PDF references fonts that are not embedded and cannot be located on the normalization worker, PDFCanon substitutes a compatible font and embeds it. This may change the visual appearance of the document for fonts with unusual metrics.

The `FONTS_EMBEDDED` warning is included when font substitution occurs.

## Metadata

### Non-standard metadata is stripped

PDFCanon strips non-standard XMP namespaces and DocInfo keys during metadata canonicalization. Only standard metadata fields (title, author, subject, keywords, creator, producer, creation date, modification date) are preserved.

The `METADATA_STRIPPED` warning is included when non-standard metadata is removed.

## AcroForm fields

### Interactive forms are flattened by default

By default, AcroForm interactive fields are flattened during normalization. The visual appearance of the form fields is preserved, but the fields are no longer interactive.

Set `acroFormPolicy: preserve` to keep form fields interactive.

## File size

### Output may be larger than input

Normalization can increase file size due to:
- Font subset embedding (previously missing fonts)
- Metadata normalization (XMP packet expansion)
- Linearization overhead

Typical overhead is 5–15% of the original file size.

## Known issues

We maintain a public issue tracker for known pipeline bugs:
[github.com/napzoom/PDFCanon/issues](https://github.com/napzoom/PDFCanon/issues)
