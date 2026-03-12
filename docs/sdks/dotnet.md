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
    BaseUrl = "https://api.pdfcanon.io",   // default
    TimeoutSeconds = 120,                    // default
});
```

## Async mode

```csharp
var submission = await client.SubmitAsync("large.pdf");
// Poll for completion
var result = await client.WaitForCompletionAsync(submission.SubmissionId);
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

SDK source code: [`sdks/dotnet/`](https://github.com/napzoom/PDFCanon/tree/main/sdks/dotnet)
