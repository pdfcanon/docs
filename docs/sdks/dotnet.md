---
sidebar_position: 1
title: .NET / C# SDK
description: PDFCanon SDK for .NET and C#.
---

# .NET / C# SDK

The PDFCanon .NET SDK provides a strongly-typed client for the PDFCanon API.

## Installation

```bash
dotnet add package PDFCanon.Client
```

## Quickstart

```csharp
using PDFCanon.Client;

var client = new PdfCanonClient(new PdfCanonOptions
{
    ApiKey = Environment.GetEnvironmentVariable("PDFCANON_API_KEY")!
});

// Normalize a PDF
var result = await client.NormalizeAsync("input.pdf");
await File.WriteAllBytesAsync("normalized.pdf", result.OutputBytes);

Console.WriteLine($"Output hash: {result.OutputHash}");
Console.WriteLine($"Processing time: {result.ProcessingTimeMs}ms");
```

## Configuration

```csharp
var client = new PdfCanonClient(new PdfCanonOptions
{
    ApiKey = "pdfn_your_api_key_here",
    BaseUrl = "https://api.pdfcanon.com",   // default
    TimeoutSeconds = 120,                    // default
});
```

## Normalization options

```csharp
var result = await client.NormalizeAsync("input.pdf", new NormalizeOptions
{
    RemoveAnnotations = true,
    SignedPdfPolicy = "strip",       // "reject" (default) | "strip" | "preserve"
    PdfaPolicy = "preserve",         // "preserve" (default) | "normalize_anyway"
    Linearize = true,                // default
    Region = "ca-central-1",
    WebhookUrl = "https://example.com/hook",
    IdempotencyKey = "my-unique-key",
    BatchId = Guid.Parse("a1b2c3d4-..."),
});
```

## Async submission and polling

```csharp
var submission = await client.SubmitAsync("large.pdf");

// Poll by submission ID
var status = await client.GetSubmissionAsync(submission.SubmissionId);

// Wait for completion (blocks up to timeout)
var result = await client.WaitForCompletionAsync(submission.SubmissionId);
```

## Artifacts and reports

```csharp
// Download the normalized PDF
byte[] pdf = await client.GetArtifactAsync(result.OutputHash);

// Download the full pipeline report (JSON)
var report = await client.GetReportAsync(result.OutputHash);

// Download the JWS attestation certificate
byte[] cert = await client.GetCertificateAsync(result.OutputHash);
```

## Error handling

```csharp
try
{
    var result = await client.NormalizeAsync("input.pdf");
}
catch (PdfCanonException ex) when (ex.IsTransient)
{
    // Safe to retry
    Console.WriteLine($"Transient error: {ex.Message}");
}
catch (PdfCanonException ex)
{
    // Permanent failure — do not retry
    Console.WriteLine($"Permanent failure: {ex.ErrorType} — {ex.Message}");
}
```

## Source

SDK source code: [github.com/pdfcanon/sdk-dotnet](https://github.com/pdfcanon/sdk-dotnet)
