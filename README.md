# PDFCanon Documentation Site

Developer documentation for PDFCanon — [docs.pdfcanon.com](https://docs.pdfcanon.com)

Built with [Docusaurus 3](https://docusaurus.io/), deployed to [Cloudflare Pages](https://pages.cloudflare.com/).

## Local development

```bash
cd docs-site
npm install
npm start
```

Opens a local dev server at `http://localhost:3000`. Changes are reflected live.

## Build

```bash
cd docs-site
npm run build
```

Generates static files into `docs-site/build/`. Serve locally with:

```bash
npm run serve
```

## Structure

```
docs-site/
├── docs/                   # MDX documentation pages
│   ├── index.md            # Landing / overview  →  /
│   ├── quickstart.md       →  /quickstart
│   ├── authentication.md   →  /authentication
│   ├── guides/             →  /guides/*
│   ├── api-reference/      →  /api-reference/*
│   ├── sdks/               →  /sdks/*
│   ├── mcp-server.md       →  /mcp-server
│   ├── webhooks-reference.md → /webhooks-reference
│   ├── changelog.md        →  /changelog
│   ├── known-deviations.md →  /known-deviations
│   └── status.md           →  /status
├── static/                 # Static assets (logo, favicon)
├── src/css/custom.css      # Custom CSS overrides
├── docusaurus.config.ts    # Site configuration
└── sidebars.ts             # Sidebar structure
```

## Deployment

Merges to `main` that touch `docs-site/**` trigger an automatic deployment to Cloudflare Pages via the `.github/workflows/docs.yml` workflow.

Pull requests get a preview deployment URL commented on the PR.

### Required secrets

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages:Edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

### DNS

Set a CNAME at `docs.pdfcanon.com` pointing to the Cloudflare Pages domain (e.g. `pdfcanon-docs.pages.dev`).

