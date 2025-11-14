import type { SandpackFiles } from "@codesandbox/sandpack-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type FileConfig = {
  path: string;
  target: string;
  transform?: (code: string) => string;
};

export function useFileLoader(files: FileConfig[]): SandpackFiles {
  const { data } = useSuspenseQuery({
    queryKey: ["sandpack-files", ...files.map(f => f.path)],
    queryFn: () => loadFiles(files),
  });

  return data;
}


async function loadFiles(files: FileConfig[]): Promise<SandpackFiles> {
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
  files.forEach(({ target, transform }, index) => {
    const content = contents[index];
    loadedFiles[target] = transform ? transform(content) : content;
  });

  return loadedFiles;
}