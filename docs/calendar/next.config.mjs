import nextra from "nextra";

const withNextra = nextra({
  defaultShowCopyCode: true,
  contentDirBasePath: "/",
});

// Pass i18n to withNextra so Nextra sets NEXTRA_LOCALES/NEXTRA_DEFAULT_LOCALE env vars,
// then remove i18n from the final config to prevent Vercel from triggering static export.
const { i18n: _i18n, ...config } = withNextra({
  reactStrictMode: true,
  basePath: "/calendar",
  i18n: {
    locales: ["en", "ko"],
    defaultLocale: "en",
  },
  outputFileTracingExcludes: {
    "*": [".next/cache/**", ".next/static/development/**", ".next/trace"],
  },
});

export default config;
