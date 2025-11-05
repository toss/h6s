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
    [],
  );

  const [activeFramework, setActiveFramework] = useState<Framework>("tailwind");

  return (
    <div className="my-8">
      <div className="flex gap-2 border-b-2 border-gray-200 mb-6 dark:border-gray-700">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveFramework(key)}
            className={`
              px-6 py-3 -mb-0.5 text-sm font-medium transition-all
              border-b-2 border-transparent
              ${
                activeFramework === key
                  ? "text-blue-500 border-blue-500 dark:text-blue-400 dark:border-blue-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="pt-4">{children[activeFramework]}</div>
    </div>
  );
}
