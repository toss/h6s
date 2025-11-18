"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MainProps = {
  title: string;
  description: string;
  subDescription: string;
  navButtonText: string;
  items: Array<{ title: string; description: string }>;
};

const MIDDLE_LETTERS = ['e', 'a', 'd', 'l', 'e', 's'] as const;
const HEADLESS_TEXT = MIDDLE_LETTERS.join("");

const WIDTH_TRANSITION = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as const,
};

const SIX_ENTER_TRANSITION = {
  duration: 0.3,
  delay: 0,
  opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  y: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
};

const SIX_EXIT_TRANSITION = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1] as const,
};

const LETTER_EXIT_TRANSITION = {
  delay: 0,
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as const,
};

export function Main({ title, description, subDescription, navButtonText, items }: MainProps) {
  const [titleHover, setTitleHover] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [sixKey, setSixKey] = useState(0);
  const prevTitleHoverRef = useRef<boolean>(false);
  const middleContainerRef = useRef<HTMLSpanElement>(null);
  const [middleWidth, setMiddleWidth] = useState<number | "auto">("auto");
  const sixWidthRef = useRef<number | null>(null);
  const headlessWidthRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hiddenMeasureRef = useRef<HTMLSpanElement | null>(null);
  
  useEffect(() => {
    const measureWidth = () => {
      if (hiddenMeasureRef.current && headlessWidthRef.current === null) {
        const width = hiddenMeasureRef.current.scrollWidth;
        if (width > 0) {
          headlessWidthRef.current = width;
        }
      }
    };
    
    measureWidth();
    const timeout = setTimeout(measureWidth, 100);
    
    return () => clearTimeout(timeout);
  }, []);
  
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let checkTimer: NodeJS.Timeout | null = null;
    
    const startAutoPlay = () => {
      if (sixWidthRef.current !== null && headlessWidthRef.current !== null) {
        timer = setTimeout(() => {
          setTitleHover(true);
          setTimeout(() => {
            setTitleHover(false);
            setHasAutoPlayed(true);
          }, 2000);
        }, 2000);
      } else {
        checkTimer = setTimeout(startAutoPlay, 50);
      }
    };
    
    startAutoPlay();
    
    return () => {
      if (timer) clearTimeout(timer);
      if (checkTimer) clearTimeout(checkTimer);
    };
  }, []);


  const handleMouseEnter = useCallback(() => {
    setTitleHover(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTitleHover(false);
  }, []);

  useEffect(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    if (!titleHover && prevTitleHoverRef.current) {
      setSixKey(prev => prev + 1);
    }
    prevTitleHoverRef.current = titleHover;

    const targetWidth = !titleHover 
      ? (sixWidthRef.current ?? "auto")
      : (headlessWidthRef.current ?? "auto");
    
    setMiddleWidth(prevWidth => {
      if (prevWidth === targetWidth) return prevWidth;
      return targetWidth;
    });
  }, [titleHover]);

  const sixRefCallback = useCallback((node: HTMLSpanElement | null) => {
    if (node && !titleHover) {
      const width = node.scrollWidth;
      const prevWidth = sixWidthRef.current;
      if (prevWidth !== width) {
        sixWidthRef.current = width;
        setMiddleWidth(width);
      }
    }
  }, [titleHover]);

  const headlessRefCallback = useCallback((node: HTMLSpanElement | null) => {
    if (node) {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = setTimeout(() => {
        const width = node.scrollWidth;
        if (headlessWidthRef.current === null || Math.abs(headlessWidthRef.current - width) > 1) {
          headlessWidthRef.current = width;
          if (titleHover) {
            setMiddleWidth(width);
          }
        }
        animationTimeoutRef.current = null;
      }, MIDDLE_LETTERS.length * 0.06 * 1000 + 80);
    }
  }, [titleHover]);

  const sixAnimate = useMemo(() => 
    !titleHover ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 4, scale: 0.95 },
    [titleHover]
  );

  const letterAnimate = useMemo(() => ({
    opacity: 1,
    y: 0,
    scale: 1,
  }), []);

  const letterExit = useMemo(() => ({
    opacity: 0,
    y: 4,
    scale: 0.95,
    transition: LETTER_EXIT_TRANSITION,
  }), []);

  const widthAnimate = useMemo(() => ({
    width: middleWidth === "auto" ? "auto" : `${middleWidth}px`,
  }), [middleWidth]);

  const hFilterAnimate = useMemo(() => 
    !hasAutoPlayed && !titleHover ? {
      filter: [
        "drop-shadow(0 0 0px rgba(59, 130, 246, 0))",
        "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))",
        "drop-shadow(0 0 0px rgba(59, 130, 246, 0))",
      ],
    } : {},
    [hasAutoPlayed, titleHover]
  );

  const sFilterAnimate = useMemo(() => 
    !hasAutoPlayed && !titleHover ? {
      filter: [
        "drop-shadow(0 0 0px rgba(147, 51, 234, 0))",
        "drop-shadow(0 0 8px rgba(147, 51, 234, 0.5))",
        "drop-shadow(0 0 0px rgba(147, 51, 234, 0))",
      ],
    } : {},
    [hasAutoPlayed, titleHover]
  );

  const filterTransition = useMemo(() => ({
    duration: 2,
    repeat: Infinity,
    repeatDelay: 3,
  }), []);

  const sFilterTransition = useMemo(() => ({
    duration: 2,
    repeat: Infinity,
    repeatDelay: 3,
    delay: 0.5,
  }), []);

  const layoutTransition = useMemo(() => ({
    layout: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  }), []);

  const widthStyle = useMemo(() => ({ willChange: 'width' }), []);
  const sixStyle = useMemo(() => ({ 
    display: titleHover ? 'none' : 'inline-block',
    willChange: 'transform, opacity'
  }), [titleHover]);
  const headlessContainerStyle = useMemo(() => ({ willChange: 'opacity' }), []);
  const letterStyle = useMemo(() => ({ willChange: 'transform, opacity' }), []);

  return (
    <section className="flex flex-col min-h-screen">
      <span
        ref={hiddenMeasureRef}
        className="absolute opacity-0 pointer-events-none text-6xl md:text-8xl font-bold whitespace-nowrap"
        style={{ visibility: "hidden", position: "absolute", top: "-9999px" }}
      >
        {HEADLESS_TEXT}
      </span>
      
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.3),transparent_50%)] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto animate-fade-in">
          <motion.h1
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="text-6xl md:text-8xl font-bold mb-6 animate-scale-in cursor-default whitespace-nowrap flex items-center justify-center"
            layout
            transition={layoutTransition}
          >
            <span className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent">
              @
            </span>
            
            <motion.span
              className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent inline-block"
              layout
              animate={hFilterAnimate}
              transition={filterTransition}
            >
              h
            </motion.span>
            
            <motion.span
              ref={middleContainerRef}
              className="inline-flex items-center overflow-hidden"
              style={widthStyle}
              animate={widthAnimate}
              transition={WIDTH_TRANSITION}
            >
              <AnimatePresence mode="sync">
                <motion.span
                  key={`6-${sixKey}`}
                  className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent inline-block"
                  initial={sixKey > 0 ? { opacity: 0, y: 12, scale: 0.85 } : false}
                  animate={sixAnimate}
                  transition={!titleHover ? SIX_ENTER_TRANSITION : SIX_EXIT_TRANSITION}
                  style={sixStyle}
                  ref={sixRefCallback}
                >
                  6
                </motion.span>
                {titleHover && (
                  <motion.span
                    key="middle"
                    className="inline-flex items-center"
                    style={headlessContainerStyle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] }}
                    ref={headlessRefCallback}
                  >
                    {MIDDLE_LETTERS.map((letter, idx) => {
                      const letterTransition = titleHover 
                        ? {
                            delay: idx === 0 ? 0.05 : idx * 0.05 + 0.01,
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1] as const,
                          }
                        : {
                            delay: 0,
                            duration: 0.18,
                            ease: [0.4, 0, 0.2, 1] as const,
                          };
                      
                      return (
                      <motion.span
                        key={`${letter}-${idx}`}
                        className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent inline-block"
                        style={letterStyle}
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={letterAnimate}
                        exit={letterExit}
                        transition={letterTransition}
                      >
                        {letter}
                      </motion.span>
                      );
                    })}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
            
            <motion.span
              className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent inline-block"
              layout
              animate={sFilterAnimate}
              transition={sFilterTransition}
            >
              s
            </motion.span>
            
            <span className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent">
              /calendar
            </span>
          </motion.h1>

          <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-4 font-medium animate-fade-in-delay-1">
            {description}
          </p>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-8 animate-fade-in-delay-2">
            {subDescription}
          </p>


          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-4">
            <Link
              href="/docs/guide/getting-started"
              className="px-8 py-4 bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-500 dark:to-purple-500 text-white rounded-lg font-semibold text-lg hover:from-blue-800 hover:to-purple-800 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              {navButtonText} →
            </Link>
            <Link
              href="/docs/examples/date-picker"
              className="px-8 py-4 border-2 border-gray-400 dark:border-gray-600 rounded-lg font-semibold text-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition hover:scale-105 text-gray-600 dark:text-gray-300"
            >
              View Examples
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 bg-gray-50 dark:bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map(({ title, description }, index) => (
            <article
              key={title}
              className="group relative flex flex-col gap-4 p-8 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-xl animate-fade-in-up overflow-hidden"
              style={{
                animationDelay: `${1.2 + index * 0.1}s`,
              }}
            >
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Icon placeholder with gradient */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <div className="w-6 h-6 rounded bg-white/20 backdrop-blur-sm" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{description}</p>
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
