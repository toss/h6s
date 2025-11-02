"use client";

import { useEffect, useRef } from "react";
import { type Root, createRoot } from "react-dom/client";
import { DatePicker } from "./DatePicker";

const BOOTSTRAP_CDN_URL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";

const IFRAME_HTML = `
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="${BOOTSTRAP_CDN_URL}" />
    <style>
      body {
        margin: 0;
        background: transparent;
      }
    </style>
  </head>
  <body>
    <div id="bootstrap-root"></div>
    <script>
      // Detect system dark mode and update Bootstrap theme
      function updateTheme() {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
      };

      // Initial theme setup
      updateTheme();

      // Listen for theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
    </script>
  </body>
</html>
`;

export function DatePickerPreview() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const rootRef = useRef<Root | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    const adjustHeight = () => {
      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }
      const { body, documentElement } = doc;
      const height = Math.max(
        body?.scrollHeight ?? 0,
        documentElement?.scrollHeight ?? 0,
        0
      );
      iframe.style.height = height ? `${height}px` : "0px";
    };

    const mountReactApp = () => {
      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }

      const mountNode = doc.getElementById("bootstrap-root");
      if (!mountNode) {
        return;
      }

      rootRef.current?.unmount();
      rootRef.current = createRoot(mountNode);
      rootRef.current.render(<DatePicker />);

      adjustHeight();

      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = new ResizeObserver(() => adjustHeight());
      resizeObserverRef.current.observe(mountNode);
      if (doc.body) {
        resizeObserverRef.current.observe(doc.body);
      }
    };

    const handleLoad = () => {
      mountReactApp();
    };

    iframe.addEventListener("load", handleLoad);

    if (iframe.contentDocument?.readyState === "complete") {
      mountReactApp();
    }

    return () => {
      iframe.removeEventListener("load", handleLoad);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      rootRef.current?.unmount();
      rootRef.current = null;
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={IFRAME_HTML}
      title="Bootstrap Date Picker Preview"
      style={{
        width: "100%",
      }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
