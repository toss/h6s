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
        // Exclude node_modules from other workspaces
        "../../packages/*/node_modules/**",
        // Exclude dist from other workspaces (workspace deps may resolve to dist)
        "../../packages/*/dist/**",
        // Exclude test files from source code
        "../../packages/*/src/**/*.test.ts",
        "../../packages/*/src/**/*.test.tsx",
        // Exclude e2e test directory
        "../../packages/*/.e2e/**",
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
