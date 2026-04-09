import nextra from "nextra";

const withNextra = nextra({
  defaultShowCopyCode: true,
  contentDirBasePath: "/",
});

export default withNextra({
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
