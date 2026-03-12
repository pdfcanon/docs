---
sidebar_position: 3
title: Authentication
description: API keys, auth headers, and JWT bearer tokens.
---

# Authentication

PDFCanon uses two authentication schemes depending on the endpoint group.

## API key (normalization endpoints)

All normalization and artifact retrieval endpoints require an API key passed via the `X-Api-Key` header.

```bash
curl https://api.pdfcanon.io/api/normalize \
  -H "X-Api-Key: pdfn_your_api_key_here" \
  ...
```

### Obtaining an API key

1. Sign in to [app.pdfcanon.com](https://app.pdfcanon.com)
2. Navigate to **Settings → API Keys**
3. Click **Create Key** and give it a descriptive name
4. Copy the key immediately — it is only shown once

API keys start with the prefix `pdfn_`.

### Key rotation

You can create multiple API keys and rotate them without downtime:

1. Create a new key in the portal
2. Update your application to use the new key
3. Revoke the old key once traffic has migrated

### Endpoints that require an API key

| Endpoint | Method |
|---|---|
| `/api/normalize` | `POST` |
| `/api/submissions/{id}` | `GET` |
| `/api/artifacts/{hash}` | `GET` |
| `/api/reports/{hash}` | `GET` |

## JWT Bearer (portal endpoints)

Portal management endpoints (`/api/portal/*`) require a JWT Bearer token obtained by authenticating with your portal credentials.

```bash
# Obtain a token
curl -X POST https://api.pdfcanon.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "..."}'

# Use the token
curl https://api.pdfcanon.io/api/portal/usage \
  -H "Authorization: Bearer eyJ..."
```

JWT tokens expire after a short period. Use the refresh endpoint to obtain a new access token without re-authenticating.

## Rate limits

| Endpoint | Limit |
|---|---|
| `POST /api/normalize` | Tier-based monthly document quota |
| `POST /api/auth/register` | 3 requests / hour / IP |
| `POST /api/auth/login` | 5 requests / 15 min / IP |
| `POST /api/auth/forgot-password` | 3 requests / hour / IP |
