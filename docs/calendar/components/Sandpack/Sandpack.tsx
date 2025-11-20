"use client";

import {
  type CodeEditorProps,
  type PreviewProps,
  SandpackCodeEditor,
  type SandpackFiles,
  SandpackLayout,
  type SandpackLayoutProps,
  SandpackPreview,
  SandpackProvider,
  type SandpackProviderProps,
  type SandpackSetup,
} from "@codesandbox/sandpack-react";
import { useEffect, useRef, useState } from "react";
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
  const [horizontalSize, setHorizontalSize] = useState(50);
  const dragEventTargetRef = useRef<(EventTarget & HTMLDivElement) | null>(null);

  useEffect(() => {
    document.body.addEventListener("mousemove", onDragMove);
    document.body.addEventListener("mouseup", stopDragging);

    return () => {
      document.body.removeEventListener("mousemove", onDragMove);
      document.body.removeEventListener("mouseup", stopDragging);
    };

    function onDragMove(event: MouseEvent) {
      if (!dragEventTargetRef.current) return;

      const container = dragEventTargetRef.current.parentElement;

      if (!container) return;

      const { left, width } = container.getBoundingClientRect();
      const offset = ((event.clientX - left) / width) * 100;
      const boundaries = Math.min(Math.max(offset, 25), 75);

      setHorizontalSize(boundaries);
      container.querySelectorAll<HTMLElement>(".sp-stack").forEach((item) => {
        item.style.pointerEvents = "none";
      });
    }

    function stopDragging() {
      const container = dragEventTargetRef.current?.parentElement;

      if (!container) return;

      container.querySelectorAll<HTMLElement>(".sp-stack").forEach((item) => {
        item.style.pointerEvents = "";
      });

      dragEventTargetRef.current = null;
    }
  }, []);

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
          <SandpackPreview
            showRefreshButton={false}
            style={{
              flexGrow: horizontalSize,
              flexShrink: horizontalSize,
              flexBasis: 0,
              height: height ?? 400,
            }}
            {...previewOptions}
          />
          <div
            onMouseDown={(event) => {
              dragEventTargetRef.current = event.currentTarget;
            }}
            style={{
              left: `calc(${horizontalSize}% - 5px)`,
            }}
            className="absolute top-0 bottom-0 w-2.5 cursor-ew-resize z-10"
          />
          <SandpackCodeEditor
            showLineNumbers
            showTabs
            style={{
              flexGrow: 100 - horizontalSize,
              flexShrink: 100 - horizontalSize,
              flexBasis: 0,
              height: height ?? 400,
            }}
            {...codeEditorOptions}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
