import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'PDFCanon Docs',
  tagline: 'PDF normalization, built for developers.',
  favicon: 'img/logo.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.pdfcanon.com',
  baseUrl: '/',

  organizationName: 'napzoom',
  projectName: 'PDFCanon',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/pdfcanon/docs/tree/main/',
        },
        blog: {
          showReadingTime: true,
          blogSidebarTitle: 'All Posts',
          blogSidebarCount: 'ALL',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'PDFCanon',
      logo: {
        alt: 'PDFCanon Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/api-reference/normalize',
          label: 'API Reference',
          position: 'left',
        },
        {
          to: '/sdks/dotnet',
          label: 'SDKs',
          position: 'left',
        },
        {
          to: '/changelog',
          label: 'Changelog',
          position: 'left',
        },
        // {
        //   to: '/blog',
        //   label: 'Blog',
        //   position: 'left',
        // },
        {
          href: 'https://app.pdfcanon.com',
          label: 'Dashboard',
          position: 'right',
        },
        {
          href: 'https://github.com/pdfcanon',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Quickstart', to: '/quickstart'},
            {label: 'Authentication', to: '/authentication'},
            {label: 'API Reference', to: '/api-reference/normalize'},
            {label: 'SDKs', to: '/sdks/dotnet'},
          ],
        },
        {
          title: 'Guides',
          items: [
            {label: 'Normalizing PDFs', to: '/guides/normalizing-pdfs'},
            {label: 'Webhooks', to: '/guides/webhooks'},
            {label: 'Error Handling', to: '/guides/error-handling'},
            {label: 'Rate Limits', to: '/guides/rate-limits'},
            {label: 'Bulk Processing', to: '/guides/bulk-processing'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'MCP Server', to: '/mcp-server'},
            {label: 'Changelog', to: '/changelog'},
            {label: 'Known Deviations', to: '/known-deviations'},
            {label: 'Status', href: 'https://status.pdfcanon.com'},
          ],
        },
        {
          title: 'PDFCanon',
          items: [
            {label: 'Dashboard', href: 'https://app.pdfcanon.com'},
            {label: 'pdfcanon.com', href: 'https://pdfcanon.com'},
            {label: 'GitHub', href: 'https://github.com/pdfcanon'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} PDFCanon. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'csharp', 'java', 'python', 'go'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
