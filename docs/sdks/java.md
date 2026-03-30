---
sidebar_position: 4
title: Java SDK
description: PDFCanon SDK for Java.
---

# Java SDK

The PDFCanon Java SDK provides a client for the PDFCanon API compatible with Java 11+.

## Installation

### Maven

```xml
<dependency>
  <groupId>com.pdfcanon</groupId>
  <artifactId>pdfcanon-client</artifactId>
  <version>1.0.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'com.pdfcanon:pdfcanon-client:1.0.0'
```

## Quickstart

```java
import com.pdfcanon.client.PdfCanonClient;
import com.pdfcanon.client.PdfCanonOptions;
import java.nio.file.Files;
import java.nio.file.Path;

PdfCanonClient client = new PdfCanonClient(
    PdfCanonOptions.builder()
        .apiKey(System.getenv("PDFCANON_API_KEY"))
        .build()
);

byte[] pdf = Files.readAllBytes(Path.of("input.pdf"));
NormalizeResult result = client.normalize(pdf);

Files.write(Path.of("normalized.pdf"), result.getOutputBytes());
System.out.println("Output hash: " + result.getOutputHash());
```

## Normalization options

```java
NormalizeResult result = client.normalize(pdf, NormalizeOptions.builder()
    .removeAnnotations(true)
    .signedPdfPolicy("strip")        // "reject" (default) | "strip" | "preserve"
    .pdfaPolicy("preserve")          // "preserve" (default) | "normalize_anyway"
    .linearize(true)                 // default
    .region("ca-central-1")
    .webhookUrl("https://example.com/hook")
    .idempotencyKey("my-unique-key")
    .batchId("a1b2c3d4-...")
    .build()
);
```

## Async submission and polling

```java
// Async submission
CompletableFuture<NormalizeResult> future = client.normalizeAsync(pdf);
NormalizeResult result = future.get();

// Poll by submission ID
NormalizeResult status = client.getSubmission(result.getSubmissionId());

// Wait for completion
NormalizeResult finalResult = client.waitForCompletion(result.getSubmissionId());
```

## Artifacts and reports

```java
// Download normalized PDF
byte[] pdfBytes = client.getArtifact(result.getOutputHash());

// Download full pipeline report (JSON)
Map<String, Object> report = client.getReport(result.getOutputHash());

// Download JWS attestation certificate
byte[] cert = client.getCertificate(result.getOutputHash());
```

## Error handling

```java
try {
    NormalizeResult result = client.normalize(pdf);
} catch (PdfCanonException e) {
    if (e.isTransient()) {
        System.out.println("Transient error — retry: " + e.getMessage());
    } else {
        System.out.println("Permanent failure: " + e.getErrorType());
    }
}
```

## Source

SDK source code: [github.com/pdfcanon/sdk-java](https://github.com/pdfcanon/sdk-java)
