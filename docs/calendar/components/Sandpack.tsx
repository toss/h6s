"use client";

import {
  type SandpackFiles,
  SandpackPreview,
  SandpackProvider,
  type SandpackProviderProps,
  type SandpackSetup,
} from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";

type FileConfig = {
  path: string;
  target: string;
  transform?: (code: string) => string;
};

type SandpackProps = Omit<SandpackProviderProps, "files"> & {
  files: FileConfig[];
  dependencies?: SandpackSetup["dependencies"];
};

const DEFAULT_DEPENDENCIES = {
  "@h6s/calendar": "latest",
  "date-fns": "^4.1.0",
};

/**
 * Default code transformations for Sandpack compatibility
 */
const defaultTransform = (code: string): string => {
  return code
    .replace(/"use client";\n\n/g, "") // Remove "use client" directive
    .replace(/export function (\w+)\(\)/g, "export default function $1()"); // Convert named export to default
};

export function Sandpack({
  files,
  template = "react-ts",
  dependencies = {},
  options = {},
}: SandpackProps) {
  const [sandpackFiles, setSandpackFiles] = useState<SandpackFiles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Merge options with defaults
  const mergedOptions = {
    editorHeight: 600,
    // showNavigator: false,
    showTabs: true,
    showLineNumbers: true,
    activeFile: files[0]?.target,
    ...options,
  };

  useEffect(() => {
    async function loadFiles() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all files in parallel
        const fetchPromises = files.map(({ path }) =>
          fetch(`/api/read-example?path=${path}`).then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
            }
            return res.text();
          })
        );

        const contents = await Promise.all(fetchPromises);

        // Transform and map to Sandpack files
        const loadedFiles: SandpackFiles = {};
        files.forEach(({ target, transform }, index) => {
          const code = contents[index];
          const transformFn = transform || defaultTransform;
          loadedFiles[target] = transformFn(code);
        });

        setSandpackFiles(loadedFiles);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load example files:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setIsLoading(false);
      }
    }

    loadFiles();
  }, [files]);

  if (isLoading) {
    return (
      <div
        className="my-8"
        style={{
          height: `${mergedOptions.editorHeight}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        Loading example...
      </div>
    );
  }

  if (error || !sandpackFiles) {
    return (
      <div
        className="my-8"
        style={{
          height: `${mergedOptions.editorHeight}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fee",
          borderRadius: "8px",
          padding: "2rem",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Failed to load example files
        </div>
        {error && (
          <div style={{ fontSize: "0.875rem", color: "#666", textAlign: "center" }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  const mergedDependencies = {
    ...DEFAULT_DEPENDENCIES,
    ...dependencies,
  };

  const customSetup: SandpackSetup = {
    dependencies: mergedDependencies,
  };

  return (
    <SandpackProvider
      template={template}
      files={sandpackFiles}
      options={mergedOptions}
      customSetup={customSetup}
      theme="auto"
    >
      <SandpackPreview
        showRefreshButton={true}
        style={{ height: `${mergedOptions.editorHeight}px` }}
      />
    </SandpackProvider>
  );
}
