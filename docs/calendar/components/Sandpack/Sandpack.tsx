"use client";

import {
  type PreviewProps,
  type SandpackFiles,
  SandpackLayout,
  type SandpackLayoutProps,
  SandpackPreview,
  SandpackProvider,
  type SandpackProviderProps,
  type SandpackSetup,
} from "@codesandbox/sandpack-react";
import { baseTemplate } from "./baseTemplates";

interface CustomSandpackProps extends Omit<SandpackProviderProps, "files" | "template" | "customSetup" | "options"> {
  files: SandpackFiles;
  template?: SandpackProviderProps["template"];
  dependencies?: SandpackSetup["dependencies"];
  devDependencies?: SandpackSetup["devDependencies"];
  providerOptions?: SandpackProviderProps["options"];
  layoutOptions?: SandpackLayoutProps;
  previewOptions?: PreviewProps;
}

export function Sandpack(props: CustomSandpackProps) {
  return (
    <div className="my-8">
      <SandpackProvider
        template="react-ts"
        theme="auto"
        {...props}
        options={{
          initMode: "user-visible",
          initModeObserverOptions: { rootMargin: "1400px 0px" },
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
          },
        }}
      >
        <SandpackLayout {...props.layoutOptions}>
          <SandpackPreview showRefreshButton={false} {...props.previewOptions} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
