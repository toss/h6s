"use client";

import {
  type PreviewProps,
  SandpackLayout,
  type SandpackLayoutProps,
  SandpackPreview,
  SandpackProvider,
  type SandpackProviderProps,
  type SandpackSetup
} from "@codesandbox/sandpack-react";
import { baseTemplate } from "./baseTemplates";
import { type FileConfig, useFileLoader } from "./useFileLoader";

interface CustomSandpackProps extends Omit<SandpackProviderProps, "files" | "template" | "customSetup" | "options"> {
  files: FileConfig[];
  template?: SandpackProviderProps["template"];
  dependencies?: SandpackSetup["dependencies"];
  devDependencies?: SandpackSetup["devDependencies"];
  providerOptions?: SandpackProviderProps["options"];
  layoutOptions?: SandpackLayoutProps;
  previewOptions?: PreviewProps;
};

export function Sandpack(props: CustomSandpackProps) {
  const { sandpackFiles, isLoading, error } = useFileLoader(props.files);

  if (isLoading) {
    return (
      <div
        className="my-8"
        style={{
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

  return (
    <div className="my-8">
      <SandpackProvider
        template="react-ts"
        theme="auto"
        {...props}
        files={sandpackFiles}
        options={{
          initMode: 'user-visible',
          initModeObserverOptions: { rootMargin: '1400px 0px' },
          ...props.providerOptions,
        }}
        customSetup={{
          dependencies: {
            ...baseTemplate.dependencies,
            ...props.dependencies,
          },
          devDependencies: {
            ...baseTemplate.devDependencies,
            ...props.devDependencies,
          }
        }}
      >
        <SandpackLayout {...props.layoutOptions}>
          <SandpackPreview {...props.previewOptions} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
