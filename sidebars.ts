import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Overview',
    },
    {
      type: 'doc',
      id: 'quickstart',
      label: 'Quickstart',
    },
    {
      type: 'doc',
      id: 'authentication',
      label: 'Authentication',
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/normalizing-pdfs',
        'guides/webhooks',
        'guides/idempotency',
        'guides/bulk-processing',
        'guides/error-handling',
        'guides/rate-limits',
        'guides/data-retention',
        'guides/digital-signatures',
        'guides/pdfa-compliance',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/normalize',
        'api-reference/submissions',
        'api-reference/artifacts',
        'api-reference/reports',
        'api-reference/batches',
        'api-reference/certificates',
        'api-reference/auth',
        'api-reference/portal-api-keys',
        'api-reference/portal-billing',
        'api-reference/portal-organization',
        {
          type: 'category',
          label: 'Portal',
          items: [
            'api-reference/portal-webhooks',
            'api-reference/portal-team',
            'api-reference/portal-gdpr',
            'api-reference/portal-stats',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'SDKs',
      items: [
        'sdks/dotnet',
        'sdks/python',
        'sdks/typescript',
        'sdks/java',
        'sdks/go',
      ],
    },
    {
      type: 'doc',
      id: 'mcp-server',
      label: 'MCP Server',
    },
    {
      type: 'doc',
      id: 'webhooks-reference',
      label: 'Webhooks Reference',
    },
    {
      type: 'doc',
      id: 'changelog',
      label: 'Changelog',
    },
    {
      type: 'doc',
      id: 'known-deviations',
      label: 'Known Deviations',
    },
    {
      type: 'doc',
      id: 'status',
      label: 'Status',
    },
  ],
};

export default sidebars;
