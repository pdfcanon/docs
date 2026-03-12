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

## Async support

```java
CompletableFuture<NormalizeResult> future = client.normalizeAsync(pdf);
NormalizeResult result = future.get();
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

SDK source code: [`sdks/java/`](https://github.com/napzoom/PDFCanon/tree/main/sdks/java)
