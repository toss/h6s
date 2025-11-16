import type { SandpackFiles } from "@codesandbox/sandpack-react";
import { useSuspenseQuery } from "@tanstack/react-query";

export type SourceFiles = {
  [fileName: string]: string;
};

export function useFileLoader(sourceFiles: SourceFiles): SandpackFiles {
  const fileConfigs = Object.entries(sourceFiles).map(([fileName, path]) => ({
    path,
    target: `/${fileName}`,
  }));

  if (fileConfigs.length === 0) {
    return {};
  }

  const { data } = useSuspenseQuery({
    queryKey: ["sandpack-files", ...fileConfigs.map((f) => f.path)],
    queryFn: () => loadFiles(fileConfigs),
  });

  return data;
}

type FileConfig = {
  path: string;
  target: string;
};

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
  files.forEach(({ target }, index) => {
    const content = contents[index];
    loadedFiles[target] = content;
  });

  return loadedFiles;
}