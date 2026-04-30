---
sidebar_position: 99
title: Errors Reference
description: All PDFCanon API error codes, HTTP status mapping, and response shape.
---

# Errors Reference

Every error response from the PDFCanon API uses the same JSON envelope:

```json
{
  "error": {
    "type": "POLICY_REJECTION",
    "code": "ENCRYPTED_PDF",
    "message": "The uploaded PDF is encrypted or password-protected and cannot be processed.",
    "stage": "intake",
    "retryable": false
  }
}
```

| Field       | Type    | Description                                                                                              |
| ----------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `type`      | string  | Broad category. Stable across versions. See table below.                                                 |
| `code`      | string  | Specific machine-readable code. Stable across versions &mdash; safe to switch on.                        |
| `message`   | string  | Human-readable description. May change wording &mdash; do not pattern-match.                             |
| `stage`     | string  | Pipeline stage that produced the error (`intake`, `pipeline`, etc.). Present on `POLICY_REJECTION` only. |
| `retryable` | boolean | `true` if a retry with the same input has a chance to succeed. Present on `POLICY_REJECTION` only.       |

The `X-Request-Id` response header is set on every error so you can correlate with our logs when filing a support ticket.

## Error types &mdash; HTTP mapping

| `error.type`               | HTTP status | When it happens                                                                     |
| -------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `POLICY_REJECTION`         | `422`       | The PDF violates an intake or pipeline policy (size, encryption, etc.).             |
| `POLICY_VIOLATION`         | `400`       | The request violates a locked normalization profile setting.                        |
| `QUOTA_EXCEEDED`           | `402`       | Monthly plan quota reached. Includes `plan_tier`, `monthly_limit`, `current_usage`. |
| `RATE_LIMIT_EXCEEDED`      | `429`       | Too many requests. Includes `Retry-After`, `X-RateLimit-*` headers.                 |
| `ORGANIZATION_DEACTIVATED` | `403`       | The organization has been suspended.                                                |
| `INVALID_REQUEST`          | `400`       | Malformed request (missing field, bad parameter).                                   |
| `UNAUTHORIZED`             | `401`       | Missing or invalid API key / JWT.                                                   |
| `NOT_IMPLEMENTED`          | `501`       | Reserved for endpoints not yet available.                                           |
| `INTERNAL_ERROR`           | `500`       | Unexpected server error. Always retry-safe with idempotency.                        |

## `POLICY_REJECTION` codes

Returned with HTTP **`422 Unprocessable Entity`**.

### Intake (`stage = "intake"`)

| `code`                    | `retryable` | Meaning &amp; suggested action                                                                                                                                               |
| ------------------------- | :---------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FILE_TOO_LARGE`          |   `false`   | The upload exceeds the size limit for your plan. Compress the PDF or upgrade.                                                                                                |
| `INVALID_MAGIC_NUMBER`    |   `false`   | The bytes don&rsquo;t start with `%PDF-`, or `Content-Type` isn&rsquo;t `application/pdf`. Make sure you&rsquo;re sending a real PDF (not, e.g., HTML or an EML attachment). |
| `UNSUPPORTED_PDF_VERSION` |   `false`   | PDF version is outside the supported range (1.2 &ndash; 1.7).                                                                                                                |
| `ENCRYPTED_PDF`           |   `false`   | The PDF is password-protected. Decrypt before submitting &mdash; PDFCanon will not attempt to break encryption.                                                              |

### Pipeline (`stage = "pipeline"`)

| `code`                      | `retryable` | Meaning &amp; suggested action                                                                                                      |
| --------------------------- | :---------: | ----------------------------------------------------------------------------------------------------------------------------------- |
| `STRUCTURAL_REPAIR_FAILED`  |   `false`   | The PDF&rsquo;s xref table or object stream is too corrupt to recover.                                                              |
| `XFA_FORM_NOT_SUPPORTED`    |   `false`   | The PDF uses an XFA form. See [Known Deviations](https://pdfcanon.com/known-deviations).                                            |
| `DIGITAL_SIGNATURE_PRESENT` |   `false`   | A digital signature was detected and your profile rejects signed PDFs. See the [Digital Signature Policy](/concepts/why-normalize). |
| `FONT_NOT_EMBEDDED`         |   `false`   | A required font is referenced but not embedded.                                                                                     |
| `VERAPDF_VALIDATION_FAILED` |   `false`   | The output failed PDF/A validation when PDF/A mode is enforced.                                                                     |
| `TOOLCHAIN_ERROR`           |   `true`    | qpdf or veraPDF returned an unexpected error. Safe to retry once.                                                                   |

:::tip Forward-compatibility
New `code` values may be added in any release without a major version bump. Always treat unknown codes as a generic `POLICY_REJECTION` and surface the `message` to the user.
:::

## `QUOTA_EXCEEDED`

```json
{
  "error": {
    "type": "QUOTA_EXCEEDED",
    "code": "QUOTA_EXCEEDED",
    "message": "Monthly quota of 10000 PDFs reached.",
    "plan_tier": "starter",
    "monthly_limit": 10000,
    "current_usage": 10000,
    "upgrade_url": "/portal/billing"
  }
}
```

## `RATE_LIMIT_EXCEEDED`

```json
{
  "error": {
    "type": "RATE_LIMIT_EXCEEDED",
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded.",
    "retry_after": 30
  }
}
```

Always respect the `Retry-After` response header (seconds). The `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers are also returned.

## SDK error mapping

Every official SDK throws a typed `PolicyRejectionException` (or language equivalent) that exposes the `code`, `message`, and `requestId`. Switch on `code` &mdash; never on `message`.
