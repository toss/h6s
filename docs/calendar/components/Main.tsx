"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DateCalendar as TailwindCalendar } from "../app/docs/examples/date-picker/tailwind/calendar/DateCalendar";
import BootstrapDateCalendar from "../app/docs/examples/date-picker/bootstrap/calendar/DateCalendar";
import { DateRangeCalendarDual as VanillaRangeCalendarDual } from "../app/docs/examples/date-range-picker/vanilla/calendar-dual/DateRangeCalendarDual";
import { BootstrapPreview } from "./BootstrapPreview";

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

const LETTER_EXIT_TRANSITION = {
  delay: 0,
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as const,
};

export function Main({ title, description, subDescription, navButtonText, items }: MainProps) {
  const [titleHover, setTitleHover] = useState(false);
  const prevTitleHoverRef = useRef<boolean>(false);
  const middleContainerRef = useRef<HTMLSpanElement>(null);
  const [middleWidth, setMiddleWidth] = useState<number | "auto">("auto");
  const sixWidthRef = useRef<number | null>(null);
  const headlessWidthRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hiddenMeasureRef = useRef<HTMLSpanElement | null>(null);
  const hoverDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const currentTitleHoverRef = useRef<boolean>(false);
  
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
          }, 2000);
        }, 1000);
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
    if (hoverDebounceRef.current) {
      clearTimeout(hoverDebounceRef.current);
      hoverDebounceRef.current = null;
    }
    hoverDebounceRef.current = setTimeout(() => {
      currentTitleHoverRef.current = true;
      setTitleHover(true);
      hoverDebounceRef.current = null;
    }, 30);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverDebounceRef.current) {
      clearTimeout(hoverDebounceRef.current);
      hoverDebounceRef.current = null;
    }
    hoverDebounceRef.current = setTimeout(() => {
      currentTitleHoverRef.current = false;
      setTitleHover(false);
      hoverDebounceRef.current = null;
    }, 50);
  }, []);

  useEffect(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    currentTitleHoverRef.current = titleHover;
    prevTitleHoverRef.current = titleHover;

    if (!titleHover) {
      const targetWidth = sixWidthRef.current ?? "auto";
      setMiddleWidth(prevWidth => {
        if (prevWidth === targetWidth) return prevWidth;
        return targetWidth;
      });
    } else {
      // When expanding to headless, use measured width from actual rendered node
      // Don't use hiddenMeasureRef as it may be inaccurate
      const targetWidth = headlessWidthRef.current ?? "auto";
      
      setMiddleWidth(prevWidth => {
        if (prevWidth === targetWidth) return prevWidth;
        return targetWidth;
      });
    }
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
      // Measure immediately first
      const width = node.scrollWidth;
      if (headlessWidthRef.current === null || Math.abs(headlessWidthRef.current - width) > 1) {
        headlessWidthRef.current = width;
        if (titleHover) {
          setMiddleWidth(width);
        }
      }

      // Then measure again after animation completes for accuracy
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = setTimeout(() => {
        const finalWidth = node.scrollWidth;
        if (headlessWidthRef.current === null || Math.abs(headlessWidthRef.current - finalWidth) > 1) {
          headlessWidthRef.current = finalWidth;
          if (titleHover) {
            setMiddleWidth(finalWidth);
          }
        }
        animationTimeoutRef.current = null;
      }, MIDDLE_LETTERS.length * 0.06 * 1000 + 80);
    }
  }, [titleHover]);

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

  const layoutTransition = useMemo(() => ({
    layout: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  }), []);

  const widthStyle = useMemo(() => ({ willChange: 'width' }), []);
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
      
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.2),transparent_50%)] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="relative z-10 max-w-[90rem] mx-auto px-6 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
            {/* Left Column - Title and Description */}
            <div className="flex flex-col min-w-0">
              <motion.h1
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="text-4xl md:text-6xl font-bold mb-5 cursor-default whitespace-nowrap flex items-center py-2 overflow-visible"
                layout
                transition={layoutTransition}
              >
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                  @
                </span>
                
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent inline-block">
                  h
                </span>
                
                <motion.span
                  ref={middleContainerRef}
                  className="inline-flex items-center overflow-hidden"
                  style={widthStyle}
                  animate={widthAnimate}
                  transition={WIDTH_TRANSITION}
                >
                  <AnimatePresence mode="sync">
                    <span
                      className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent inline-block"
                      style={{ display: titleHover ? 'none' : 'inline-block' }}
                      ref={sixRefCallback}
                    >
                      6
                    </span>
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
                            className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent inline-block"
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
                
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent inline-block">
                  s
                </span>
                
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                  /calendar
                </span>
              </motion.h1>

              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-5 font-medium">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/docs/guide/getting-started"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg font-semibold text-base hover:from-blue-700 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-500 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {navButtonText} →
                </Link>
                <Link
                  href="/docs/examples/date-picker/vanilla"
                  className="px-6 py-3 border-2 border-gray-400 dark:border-gray-600 rounded-lg font-semibold text-base hover:bg-gray-200 dark:hover:bg-gray-800 transition hover:scale-105 text-gray-600 dark:text-gray-300"
                >
                  View Examples
                </Link>
              </div>
            </div>

            {/* Right Column - Calendar Examples */}
            <div className="flex flex-col gap-2.5">
              {/* Top row: Single calendars */}
              <div className="flex flex-wrap items-start" style={{ gap: '0.5rem' }}>
                {/* Tailwind CSS */}
                <div className="flex flex-col" style={{ transform: 'scale(0.85)', transformOrigin: 'top left', marginBottom: '-15%' }}>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tailwind CSS</div>
                  <div>
                    <TailwindCalendar />
                  </div>
                </div>
                
                {/* Bootstrap 5 */}
                <div className="flex flex-col" style={{ transform: 'scale(0.85)', transformOrigin: 'top left', marginBottom: '-15%' }}>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Bootstrap 5</div>
                  <div style={{ overflow: 'hidden' }}>
                    <BootstrapPreview>
                      <BootstrapDateCalendar />
                    </BootstrapPreview>
                  </div>
                </div>
              </div>
              
              {/* Bottom: Vanilla CSS Range Picker Dual */}
              <div className="flex flex-col" style={{ transform: 'scale(0.85)', transformOrigin: 'top left', marginBottom: '-15%' }}>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Vanilla CSS</div>
                <div className="flex justify-start">
                  <VanillaRangeCalendarDual />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
