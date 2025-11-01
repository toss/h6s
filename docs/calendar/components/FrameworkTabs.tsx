"use client";

import { type ReactNode, useState } from "react";

type Framework = "tailwind" | "vanilla";

interface FrameworkTabsProps {
  children: {
    tailwind: ReactNode;
    vanilla: ReactNode;
  };
}

export function FrameworkTabs({ children }: FrameworkTabsProps) {
  const [activeFramework, setActiveFramework] = useState<Framework>("tailwind");

  return (
    <div className="framework-tabs">
      <div className="framework-tabs-header">
        <button
          type="button"
          onClick={() => setActiveFramework("tailwind")}
          className={`framework-tab ${activeFramework === "tailwind" ? "framework-tab--active" : ""}`}
        >
          Tailwind CSS
        </button>
        <button
          type="button"
          onClick={() => setActiveFramework("vanilla")}
          className={`framework-tab ${activeFramework === "vanilla" ? "framework-tab--active" : ""}`}
        >
          Vanilla CSS
        </button>
      </div>
      <div className="framework-tabs-content">{children[activeFramework]}</div>
    </div>
  );
}
