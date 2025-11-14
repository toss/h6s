"use client";

import {
  type PreviewProps,
  SandpackLayout,
  type SandpackLayoutProps,
  SandpackPreview,
  SandpackProvider,
  type SandpackProviderProps,
  type SandpackSetup,
} from "@codesandbox/sandpack-react";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    },
  },
});

export function Sandpack(props: CustomSandpackProps) {
  const previewStyle = props.previewOptions?.style;

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        fallback={(errorProps) => (
          <div
            className="my-8 flex flex-col items-center justify-center bg-red-100 rounded-lg p-8 min-h-[400px]"
            style={previewStyle}
          >
            <div className="text-xl font-bold mb-2">Failed to load example files</div>
            <div className="text-sm text-gray-600 text-center">{errorProps.error.message}</div>
          </div>
        )}
      >
        <Suspense
          fallback={
            <div
              className="my-8 flex items-center justify-center bg-gray-100 rounded-lg min-h-[400px]"
              style={previewStyle}
            >
              Loading example...
            </div>
          }
        >
          <SandpackContent {...props} />
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

function SandpackContent(props: CustomSandpackProps) {
  const sandpackFiles = useFileLoader(props.files);

  return (
    <div className="my-8">
      <SandpackProvider
        template="react-ts"
        theme="auto"
        {...props}
        files={sandpackFiles}
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
          <SandpackPreview {...props.previewOptions} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
