"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const BOOTSTRAP_CDN_URL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css";

const IFRAME_HTML = `
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="${BOOTSTRAP_CDN_URL}" />
    <style>
      html {
        overflow-x: hidden;
      }
      body {
        margin: 0;
        background: transparent;
        overflow-x: hidden;
      }
      :root {
        --bs-primary: #3b82f6;
        --bs-primary-rgb: 59, 130, 246;
        --bs-primary-emphasis: #2563eb;
        --bs-primary-bg-subtle: #dbeafe;
        --bs-primary-border-subtle: #93c5fd;
        --bs-primary-text-emphasis: #1e40af;
      }
      [data-bs-theme="dark"] {
        --bs-primary: #3b82f6;
        --bs-primary-rgb: 59, 130, 246;
        --bs-primary-emphasis: #60a5fa;
        --bs-primary-bg-subtle: #1e3a8a;
        --bs-primary-border-subtle: #1e40af;
        --bs-primary-text-emphasis: #93c5fd;
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

interface BootstrapPreviewProps {
  children: React.ReactNode;
  title?: string;
}

export function BootstrapPreview({ children, title = "Bootstrap Preview" }: BootstrapPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [mountNode, setMountNode] = React.useState<HTMLElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    const adjustSize = () => {
      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }
      const root = doc.getElementById("bootstrap-root");
      if (!root) {
        return;
      }
      const { body } = doc;

      // Use getBoundingClientRect for more accurate measurements
      const rootRect = root.getBoundingClientRect();
      const bodyRect = body?.getBoundingClientRect();

      // Use only getBoundingClientRect for accurate height (scrollHeight can be larger than actual content)
      const height = Math.max(rootRect.height, bodyRect?.height ?? 0, 0);

      // Get the actual content width from the first child or root itself
      const firstChild = root.firstElementChild as HTMLElement;
      const contentWidth = firstChild
        ? Math.max(firstChild.getBoundingClientRect().width, firstChild.scrollWidth)
        : rootRect.width;

      const width = Math.max(
        contentWidth,
        rootRect.width,
        root.scrollWidth,
        bodyRect?.width ?? 0,
        body?.scrollWidth ?? 0,
        0,
      );

      iframe.style.height = height ? `${height}px` : "0px";
      iframe.style.width = width ? `${Math.ceil(width)}px` : "auto";
    };

    const handleLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }

      const root = doc.getElementById("bootstrap-root");
      if (root) {
        setMountNode(root);
        adjustSize();

        resizeObserverRef.current?.disconnect();
        resizeObserverRef.current = new ResizeObserver(() => adjustSize());
        resizeObserverRef.current.observe(root);
        if (doc.body) {
          resizeObserverRef.current.observe(doc.body);
        }
      }
    };

    iframe.addEventListener("load", handleLoad);

    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener("load", handleLoad);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
    };
  }, []);

  return (
    <>
      <iframe
        ref={iframeRef}
        srcDoc={IFRAME_HTML}
        title={title}
        style={{
          width: "fit-content",
          overflow: "hidden",
        }}
        sandbox="allow-scripts allow-same-origin"
      />
      {mountNode &&
        createPortal(
          <div style={{ display: "inline-block", width: "fit-content", overflow: "hidden" }}>{children}</div>,
          mountNode,
        )}
    </>
  );
}
