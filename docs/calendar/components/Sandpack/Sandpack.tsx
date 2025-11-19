"use client";

import {
  type CodeEditorProps,
  type PreviewProps,
  type SandpackFiles,
  SandpackCodeEditor,
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
  codeEditorOptions?: CodeEditorProps;
  height?: number;
}

export function Sandpack(props: CustomSandpackProps) {
  const { height, previewOptions, codeEditorOptions, ...restProps } = props;
  const heightStyle = height ? { style: { height } } : {};

  return (
    <div className="my-8">
      <SandpackProvider
        template="react-ts"
        theme="auto"
        {...restProps}
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
          <SandpackPreview showRefreshButton={false} {...heightStyle} {...previewOptions} />
          <SandpackCodeEditor showLineNumbers showTabs {...heightStyle} {...codeEditorOptions} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
