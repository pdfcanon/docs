---
sidebar_position: 5
title: Go SDK
description: PDFCanon SDK for Go.
---

# Go SDK

The PDFCanon Go SDK provides a client for the PDFCanon API compatible with Go 1.21+.

## Installation

```bash
go get github.com/pdfcanon/pdfcanon-go
```

## Quickstart

```go
package main

import (
    "context"
    "fmt"
    "os"

    pdfcanon "github.com/pdfcanon/pdfcanon-go"
)

func main() {
    client := pdfcanon.NewClient(os.Getenv("PDFCANON_API_KEY"))

    pdf, err := os.ReadFile("input.pdf")
    if err != nil {
        panic(err)
    }

    result, err := client.Normalize(context.Background(), pdf)
    if err != nil {
        panic(err)
    }

    if err := os.WriteFile("normalized.pdf", result.OutputBytes, 0644); err != nil {
        panic(err)
    }
    fmt.Printf("Output hash: %s\n", result.OutputHash)
    fmt.Printf("Processing time: %dms\n", result.ProcessingTimeMs)
}
```

## Normalization options

```go
result, err := client.Normalize(ctx, pdf, &pdfcanon.NormalizeOptions{
    RemoveAnnotations: true,
    SignedPdfPolicy:   "strip",       // "reject" (default) | "strip" | "preserve"
    PdfaPolicy:        "preserve",    // "preserve" (default) | "normalize_anyway"
    Linearize:         pdfcanon.Bool(true),
    Region:            "ca-central-1",
    WebhookURL:        "https://example.com/hook",
    IdempotencyKey:    "my-unique-key",
    BatchID:           "a1b2c3d4-...",
})
```

## Async submission and polling

```go
submission, err := client.Submit(ctx, pdf)
if err != nil {
    panic(err)
}

// Poll by submission ID
status, err := client.GetSubmission(ctx, submission.SubmissionID)

// Wait for completion
result, err := client.WaitForCompletion(ctx, submission.SubmissionID)
```

## Artifacts and reports

```go
// Download normalized PDF
pdfBytes, err := client.GetArtifact(ctx, result.OutputHash)

// Download full pipeline report (JSON)
report, err := client.GetReport(ctx, result.OutputHash)

// Download JWS attestation certificate
certBytes, err := client.GetCertificate(ctx, result.OutputHash)
```

## Batch operations

```go
// Create a batch
batch, err := client.CreateBatch(ctx, "Q1 migration", "")

// Check batch progress
batch, err = client.GetBatch(ctx, batch.ID)

// List batches
batches, err := client.ListBatches(ctx, "open", 1, 20)

// List submissions in a batch
subs, err := client.ListBatchSubmissions(ctx, batch.ID, 1, 20)
```

## Error handling

```go
result, err := client.Normalize(ctx, pdf)
if err != nil {
    var pdfErr *pdfcanon.Error
    if errors.As(err, &pdfErr) && pdfErr.IsTransient {
        fmt.Println("Transient error — safe to retry:", pdfErr)
    } else {
        fmt.Println("Permanent failure:", err)
    }
}
```

## Source

SDK source code: [github.com/pdfcanon/pdfcanon-go](https://github.com/pdfcanon/pdfcanon-go)
