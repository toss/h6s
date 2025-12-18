import nextra from "nextra";

const withNextra = nextra({
  defaultShowCopyCode: true,
});

export default withNextra({
  reactStrictMode: true,
  basePath: "/calendar",
  experimental: {
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
  },
});
