"use client";

import { useState, type ReactNode } from "react";

type DemoWithCodeProps = {
  demo: ReactNode;
  code: ReactNode;
};

export function DemoWithCode({ demo, code }: DemoWithCodeProps) {
  const [isCodeOpen, setIsCodeOpen] = useState(false);

  return (
    <div className="demo-with-code">
      <div className="demo-preview">
        <div className="demo-content">{demo}</div>

        <div className="demo-actions">
          <button
            type="button"
            className="action-button"
            onClick={() => setIsCodeOpen(!isCodeOpen)}
            title="Toggle code"
            aria-label="Toggle code"
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
        <div className="demo-code">
          {code}
        </div>
      )}

      <style jsx>{`
        .demo-with-code {
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 0.5rem;
          overflow: hidden;
          margin: 1.5rem 0;
          background-color: var(--content-bg, #ffffff);
        }

        .demo-preview {
          position: relative;
          padding: 2rem;
        }

        .demo-content {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .demo-actions {
          position: absolute;
          bottom: 0.75rem;
          right: 0.75rem;
          display: flex;
          gap: 0.5rem;
        }

        .action-button {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 0.375rem;
          background-color: var(--content-bg, #ffffff);
          color: var(--text-secondary, #6b7280);
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-button:hover {
          background-color: var(--hover-bg, #f9fafb);
          color: var(--text-primary, #111827);
          border-color: var(--border-hover, #d1d5db);
        }

        .demo-code {
          border-top: 1px solid var(--border-color, #e5e7eb);
        }

        .demo-code :global(pre) {
          margin: 0 !important;
          border-radius: 0 !important;
          border: none !important;
        }

        @media (prefers-color-scheme: dark) {
          .demo-with-code {
            border-color: #374151;
            background-color: #111827;
          }

          .action-button {
            border-color: #374151;
            background-color: #1f2937;
            color: #9ca3af;
          }

          .action-button:hover {
            background-color: #374151;
            color: #f9fafb;
            border-color: #4b5563;
          }

          .demo-code {
            border-top-color: #374151;
          }
        }
      `}</style>
    </div>
  );
}
