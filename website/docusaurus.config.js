const packageJson = require('../package.json')
const { themes } = require('prism-react-renderer');

const getHttpsRepoUrl = (repoUrl) => {
  return repoUrl.replace('git+', '').replace(/\.git$/, '');
};

/** @type {import('@docusaurus/types').DocusaurusConfig} */
const config = {
  title: packageJson.name,
  tagline: packageJson.description,
  url: packageJson.homepage,
  organizationName: packageJson.organization,
  projectName: packageJson.name,
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: `${getHttpsRepoUrl(packageJson.repository.url)}/edit/main/website/`,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        blog: false,
        googleAnalytics: {
          trackingID: 'G-T2K6NNP9S3',
          anonymizeIP: true,
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: packageJson.name,
        logo: {
          alt: `${packageJson.name} logo`,
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs',
          },
          {
            href: getHttpsRepoUrl(packageJson.repository.url),
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
                label: 'Get Started',
                to: '/docs/intro',
              },
              {
                label: 'Storybook',
                href: 'https://storybook.h6s.dev/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: getHttpsRepoUrl(packageJson.repository.url),
              },
              {
                label: 'NPM',
                href: 'https://www.npmjs.com/org/h6s',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/JbeeLjyhanll',
              },
            ],
          },
          {
            title: 'License',
            items: [
              {
                label: 'MIT',
                href: 'https://github.com/toss/h6s/blob/main/LICENSE',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ${packageJson.author}. Built with Docusaurus.`,
      },
      metadata: [{ name: 'keywords', content: packageJson.keywords.join(', ') }],
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
      image: 'img/assets/og.jpg',
    }),
}

module.exports = config
