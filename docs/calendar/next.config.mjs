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
    "*": [
      // Exclude Next.js build cache (not needed at runtime)
      ".next/cache/**",
      // Exclude development static files
      ".next/static/development/**",
      // Exclude trace files
      ".next/trace",
    ],
  },
});
