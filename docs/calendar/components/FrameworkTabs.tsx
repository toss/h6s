"use client";

import { type ReactNode, useMemo, useState } from "react";

type Framework = "tailwind" | "bootstrap" | "vanilla";

interface FrameworkTabsProps {
  children: Record<Framework, ReactNode>;
}

export function FrameworkTabs({ children }: FrameworkTabsProps) {
  const tabs: Array<{ key: Framework; label: string }> = useMemo(
    () => [
      { key: "tailwind", label: "Tailwind CSS" },
      { key: "bootstrap", label: "Bootstrap 5" },
      { key: "vanilla", label: "Vanilla CSS" },
    ],
    []
  );

  const [activeFramework, setActiveFramework] = useState<Framework>("tailwind");

  return (
    <div className="framework-tabs">
      <div className="framework-tabs-header">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveFramework(key)}
            className={`framework-tab ${activeFramework === key ? "framework-tab--active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="framework-tabs-content">{children[activeFramework]}</div>
    </div>
  );
}
