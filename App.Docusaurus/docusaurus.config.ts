import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'GoGoTime Docs',
  tagline: 'Modern, full-stack time management application',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Epitech', // Usually your GitHub org/user name.
  projectName: 'gogotime', // Usually your repo name.

  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'overview',
        path: 'content/overview',
        routeBasePath: 'docs/overview',
        sidebarPath: './sidebars-overview.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'backend',
        path: 'content/backend',
        routeBasePath: 'docs/backend',
        sidebarPath: './sidebars-backend.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'frontend',
        path: 'content/frontend',
        routeBasePath: 'docs/frontend',
        sidebarPath: './sidebars-frontend.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'devops',
        path: 'content/devops',
        routeBasePath: 'docs/devops',
        sidebarPath: './sidebars-devops.ts',
      },
    ],
    '@docusaurus/plugin-content-blog',
    '@docusaurus/plugin-content-pages',
    '@docusaurus/theme-classic',
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'GoGoTime Docs',
      logo: {
        alt: 'GoGoTime Docs Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'README',
          position: 'left',
          label: 'Overview',
          docsPluginId: 'overview',
        },
        {
          type: 'doc',
          docId: 'architecture',
          position: 'left',
          label: 'Backend',
          docsPluginId: 'backend',
        },
        {
          type: 'doc',
          docId: 'architecture',
          position: 'left',
          label: 'Frontend',
          docsPluginId: 'frontend',
        },
        {
          type: 'doc',
          docId: 'ci-cd',
          position: 'left',
          label: 'DevOps',
          docsPluginId: 'devops',
        },
        {
          to: '/docs/api/specification',
          label: 'API',
          position: 'left',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/facebook/docusaurus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/overview/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'X',
              href: 'https://x.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} GoGoTime. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
