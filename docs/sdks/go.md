---
sidebar_position: 5
title: Go SDK
description: PDFCanon SDK for Go.
---

# Go SDK

The PDFCanon Go SDK provides a client for the PDFCanon API compatible with Go 1.21+.

## Installation

```bash
go get github.com/napzoom/pdfcanon-go
```

## Quickstart

```go
package main

import (
    "context"
    "fmt"
    "os"

    pdfcanon "github.com/napzoom/pdfcanon-go"
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

## Async mode

```go
submission, err := client.Submit(ctx, pdf)
if err != nil {
    panic(err)
}

// Poll for completion
result, err := client.WaitForCompletion(ctx, submission.SubmissionID)
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

SDK source code: [`sdks/go/`](https://github.com/napzoom/PDFCanon/tree/main/sdks/go)
