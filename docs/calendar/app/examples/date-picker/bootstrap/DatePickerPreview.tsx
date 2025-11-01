"use client";

import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DatePicker } from "./DatePicker";

const BOOTSTRAP_CDN_URL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
const BOOTSTRAP_LINK_ATTR = "data-bootstrap-datepicker-demo";
const BOOTSTRAP_ROOT_ID = "bootstrap-datepicker-root";

function useBootstrapPortal() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });

    let link = shadowRoot.querySelector<HTMLLinkElement>(`link[${BOOTSTRAP_LINK_ATTR}]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = BOOTSTRAP_CDN_URL;
      link.crossOrigin = "anonymous";
      link.setAttribute(BOOTSTRAP_LINK_ATTR, "true");
      shadowRoot.appendChild(link);
    }

    let root = shadowRoot.querySelector<HTMLDivElement>(`#${BOOTSTRAP_ROOT_ID}`);
    if (!root) {
      root = document.createElement("div");
      root.id = BOOTSTRAP_ROOT_ID;
      shadowRoot.appendChild(root);
    }

    setMountNode(root);

    return () => {
      setMountNode(null);
      if (root && root.parentNode === shadowRoot) {
        shadowRoot.removeChild(root);
      }
      if (link?.getAttribute(BOOTSTRAP_LINK_ATTR) && link.parentNode === shadowRoot) {
        shadowRoot.removeChild(link);
      }
    };
  }, []);

  return { hostRef, mountNode };
}

function ShadowRoot({ children }: PropsWithChildren) {
  const { hostRef, mountNode } = useBootstrapPortal();

  return (
    <div ref={hostRef}>
      {mountNode ? createPortal(children, mountNode) : null}
    </div>
  );
}

/**
 * Doc-site wrapper that scopes Bootstrap styles inside a shadow root.
 * Use <DatePicker /> directly in your application.
 */
export function DatePickerPreview() {
  return (
    <ShadowRoot>
      <DatePicker />
    </ShadowRoot>
  );
}
