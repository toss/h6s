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
        "../../packages/*/dist/**",
        "../../packages/*/.next/**",
        "../../packages/*/playwright-report/**",
        "../../packages/*/test-results/**",
        "../../packages/*/coverage/**",
        "../../packages/*/src/**/*.test.ts",
        "../../packages/*/src/**/*.test.tsx",
        "../../packages/*/.e2e/**",
        // Exclude examples and website
        "../../examples/**",
        "../../website/**",
        // Exclude root node_modules (if any)
        "../../node_modules/**",
        // Exclude build artifacts
        "**/.next/**",
        "**/dist/**",
        "**/coverage/**",
        "**/playwright-report/**",
        "**/test-results/**",
      ],
    },
  },
});
