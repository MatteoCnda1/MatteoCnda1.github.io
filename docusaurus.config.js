// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Mes ressources',
  tagline: 'Knowledge is key',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://matteocnda1.github.io',
  baseUrl: '/',

  organizationName: 'MatteoCnda1',
  projectName: 'my-website',

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
  },

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions} */
      ({
        hashed: true,
        language: ['fr', 'en'],
        indexDocs: true,
        indexPages: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'marie',
        path: 'cours-marie',
        routeBasePath: '/cours-marie',
        sidebarPath: './sidebars-marie.js',
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
        showLastUpdateTime: true,
      }),
    ],
    [
      '@docusaurus/plugin-pwa',
      {
        debug: false,
        offlineModeActivationStrategies: ['appInstalled', 'standalone', 'queryString'],
        pwaHead: [
          {tagName: 'link', rel: 'icon', href: '/img/pwa/icon-192.png'},
          {tagName: 'link', rel: 'manifest', href: '/manifest.json'},
          {tagName: 'meta', name: 'theme-color', content: '#2e8555'},
          {tagName: 'meta', name: 'apple-mobile-web-app-capable', content: 'yes'},
          {tagName: 'meta', name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent'},
          {tagName: 'link', rel: 'apple-touch-icon', href: '/img/pwa/apple-icon-180.png'},
          {tagName: 'link', rel: 'mask-icon', href: '/img/pwa/maskable-icon-512.png', color: '#2e8555'},
          {tagName: 'meta', name: 'msapplication-TileImage', content: '/img/pwa/icon-192.png'},
          {tagName: 'meta', name: 'msapplication-TileColor', content: '#2e8555'},
        ],
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/docs',
          sidebarPath: './sidebars.js',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
      type: 'text/css',
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      metadata: [
        {
          name: 'description',
          content:
            "Base de connaissances personnelle : notes et cours sur la cybersécurité, les réseaux, les systèmes d'exploitation, la programmation et plus encore.",
        },
        {
          name: 'keywords',
          content: 'cybersécurité, réseaux, linux, programmation, cryptographie, cours, notes',
        },
      ],
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Mes ressources',
        logo: {
          alt: 'Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Ressources',
          },
          {
            to: '/docs/Glossaire',
            position: 'left',
            label: 'Glossaire',
          },
          {
            to: '/docs/tags',
            position: 'left',
            label: 'Tags',
          },
          {
            to: '/cours-marie/',
            position: 'left',
            label: 'Cours de Marie',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `© ${new Date().getFullYear()} Mes ressources`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'python', 'java', 'php', 'csharp', 'powershell', 'sql'],
      },
    }),
};

export default config;
