"use client";

import Link from "next/link";
import React, { useState } from "react";

type MainProps = {
  title: string;
  description: string;
  subDescription: string;
  navButtonText: string;
  items: Array<{ title: string; description: string; emoji: string }>;
};

export function Main({ title, description, subDescription, navButtonText, items }: MainProps) {
  const [isHover, setIsHover] = useState(false);

  return (
    <section className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.3),transparent_50%)] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-scale-in">
            {title}
          </h1>

          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-medium animate-fade-in-delay-1">
            {description}
          </p>

          <p className="text-lg md:text-xl text-gray-400 mb-8 animate-fade-in-delay-2">
            {subDescription}
          </p>

          {/* h6s = headless animation */}
          <div className="mb-8 animate-fade-in-delay-3">
            <p className="text-xl text-gray-400 mb-2">
              <span className="font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                h6s
              </span>{" "}
              means{" "}
              <span
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                className="inline-block cursor-pointer transition-all duration-300"
                style={{
                  transform: isHover ? "scale(1.1)" : "scale(1)",
                }}
              >
                {isHover ? (
                  <strong className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-bold animate-fade-in">
                    headless
                  </strong>
                ) : (
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-mono">
                    h______s
                  </span>
                )}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-4">
            <Link
              href="/docs/guide/getting-started"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              {navButtonText} →
            </Link>
            <Link
              href="/docs/examples/date-picker"
              className="px-8 py-4 border-2 border-gray-600 rounded-lg font-semibold text-lg hover:bg-gray-800 transition hover:scale-105 text-gray-300"
            >
              View Examples
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map(({ title, description, emoji }, index) => (
            <article
              key={title}
              className="flex flex-col gap-4 p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg animate-fade-in-up"
              style={{
                animationDelay: `${1.2 + index * 0.1}s`,
              }}
            >
              <div className="text-5xl mb-2">{emoji}</div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-gray-400 leading-relaxed whitespace-pre-line">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.8s ease-out 0.2s both;
        }

        .animate-fade-in-delay-1 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.6s both;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s ease-out 0.8s both;
        }

        .animate-fade-in-delay-4 {
          animation: fade-in 0.8s ease-out 1s both;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
      `}</style>
    </section>
  );
}

