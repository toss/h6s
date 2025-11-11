import type { SandpackFiles } from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";

type FileConfig = {
  path: string;
  target: string;
  transform?: (code: string) => string;
};

export function useFileLoader(files: FileConfig[]) {
  const [sandpackFiles, setSandpackFiles] = useState<SandpackFiles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const loadedFiles: SandpackFiles = {};
        files.forEach(({ target }, index) => {
          loadedFiles[target] = contents[index];
        });

        setSandpackFiles(loadedFiles);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Failed to load example files:", err);
        setError(errorMessage);
        setIsLoading(false);
      }
    }

    loadFiles();
  }, [files]);

  return { sandpackFiles, isLoading, error };
}

export type { FileConfig };
