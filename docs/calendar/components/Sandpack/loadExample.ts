import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SandpackFiles } from "@codesandbox/sandpack-react";

/**
 * Load example files from the file system at build time (Server Component only)
 *
 * @param basePath - Relative path from project root (e.g., 'app/docs/examples/date-calendar/bootstrap')
 * @param files - Array of file names to load (e.g., ['App.tsx', 'DateCalendar.tsx', 'public/index.html'])
 * @returns SandpackFiles object with file contents
 *
 * @example
 * ```tsx
 * const files = loadExample('app/docs/examples/date-calendar/bootstrap', [
 *   'App.tsx',              // → /App.tsx
 *   'DateCalendar.tsx',     // → /DateCalendar.tsx
 *   'public/index.html',    // → /public/index.html
 * ]);
 * return <Sandpack files={files} />;
 * ```
 */
export function loadExample(basePath: string, files: string[]): SandpackFiles {
  return files.reduce((acc, file) => {
    try {
      const fullPath = join(process.cwd(), basePath, file);
      const content = readFileSync(fullPath, "utf-8");
      // Use file path as-is for Sandpack, just ensure it starts with /
      const sandpackPath = file.startsWith("/") ? file : `/${file}`;
      acc[sandpackPath] = content;
    } catch (error) {
      throw new Error(
        `Failed to load example file: ${basePath}/${file}\n${error instanceof Error ? error.message : String(error)}`,
      );
    }
    return acc;
  }, {} as SandpackFiles);
}
