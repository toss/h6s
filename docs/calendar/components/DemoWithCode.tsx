"use client";

import { type ReactNode, useState } from "react";

type DemoWithCodeProps = {
  demo: ReactNode;
  code: ReactNode;
};

export function DemoWithCode({ demo, code }: DemoWithCodeProps) {
  const [isCodeOpen, setIsCodeOpen] = useState(false);

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="relative p-8">
        <div className="flex items-center justify-center">{demo}</div>

        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={() => setIsCodeOpen(!isCodeOpen)}
            title="Toggle code"
            aria-label="Toggle code"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M5.5 3L1.5 8L5.5 13M10.5 3L14.5 8L10.5 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {isCodeOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0">
          {code}
        </div>
      )}
    </div>
  );
}
