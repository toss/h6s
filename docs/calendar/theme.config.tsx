import type { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>@h6s/calendar</span>,
  project: {
    link: 'https://github.com/toss/h6s',
  },
  docsRepositoryBase: 'https://github.com/toss/h6s/tree/main/docs/calendar',
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{' '}
        <a href="https://github.com/toss/h6s" target="_blank" rel="noopener noreferrer">
          h6s
        </a>
      </span>
    ),
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="@h6s/calendar" />
      <meta property="og:description" content="Logic-first Calendar Hook for React" />
    </>
  ),
  primaryHue: 210,
  darkMode: true,
  navigation: true,
};

export default config;
