"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import BootstrapDateCalendar from "../app/docs/examples/date-picker/bootstrap/calendar/DateCalendar";
import { DateCalendar as TailwindCalendar } from "../app/docs/examples/date-picker/tailwind/calendar/DateCalendar";
import { DateRangeCalendarDual as VanillaRangeCalendarDual } from "../app/docs/examples/date-range-picker/vanilla/calendar-dual/DateRangeCalendarDual";
import { BootstrapPreview } from "./BootstrapPreview";

type MainProps = {
  title: string;
  description: string;
  subDescription: string;
  navButtonText: string;
  items: Array<{ title: string; description: string }>;
};

const MIDDLE_LETTERS = ["e", "a", "d", "l", "e", "s"] as const;
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
      setMiddleWidth((prevWidth) => {
        if (prevWidth === targetWidth) return prevWidth;
        return targetWidth;
      });
    } else {
      // When expanding to headless, use measured width from actual rendered node
      // Don't use hiddenMeasureRef as it may be inaccurate
      const targetWidth = headlessWidthRef.current ?? "auto";

      setMiddleWidth((prevWidth) => {
        if (prevWidth === targetWidth) return prevWidth;
        return targetWidth;
      });
    }
  }, [titleHover]);

  const sixRefCallback = useCallback(
    (node: HTMLSpanElement | null) => {
      if (node && !titleHover) {
        const width = node.scrollWidth;
        const prevWidth = sixWidthRef.current;
        if (prevWidth !== width) {
          sixWidthRef.current = width;
          setMiddleWidth(width);
        }
      }
    },
    [titleHover],
  );

  const headlessRefCallback = useCallback(
    (node: HTMLSpanElement | null) => {
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
        animationTimeoutRef.current = setTimeout(
          () => {
            const finalWidth = node.scrollWidth;
            if (headlessWidthRef.current === null || Math.abs(headlessWidthRef.current - finalWidth) > 1) {
              headlessWidthRef.current = finalWidth;
              if (titleHover) {
                setMiddleWidth(finalWidth);
              }
            }
            animationTimeoutRef.current = null;
          },
          MIDDLE_LETTERS.length * 0.06 * 1000 + 80,
        );
      }
    },
    [titleHover],
  );

  const letterAnimate = useMemo(
    () => ({
      opacity: 1,
      y: 0,
      scale: 1,
    }),
    [],
  );

  const letterExit = useMemo(
    () => ({
      opacity: 0,
      y: 4,
      scale: 0.95,
      transition: LETTER_EXIT_TRANSITION,
    }),
    [],
  );

  const widthAnimate = useMemo(
    () => ({
      width: middleWidth === "auto" ? "auto" : `${middleWidth}px`,
    }),
    [middleWidth],
  );

  const layoutTransition = useMemo(
    () => ({
      layout: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    }),
    [],
  );

  const widthStyle = useMemo(() => ({ willChange: "width" }), []);
  const headlessContainerStyle = useMemo(() => ({ willChange: "opacity" }), []);
  const letterStyle = useMemo(() => ({ willChange: "transform, opacity" }), []);

  return (
    <section className="flex flex-col min-h-screen">
      <span
        ref={hiddenMeasureRef}
        className="absolute opacity-0 pointer-events-none text-6xl md:text-8xl font-bold whitespace-nowrap"
        style={{ visibility: "hidden", position: "absolute", top: "-9999px" }}
      >
        {HEADLESS_TEXT}
      </span>

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Main Content - Two Column Layout */}
        <div className="relative z-10 w-full h-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] min-h-screen relative">
            {/* Left Column - Title and Description */}
            <div className="flex items-center justify-center px-6 lg:px-12 py-20 relative z-20">
              <div className="max-w-[600px] w-full">
                <motion.h1
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="text-4xl md:text-6xl font-bold mb-6 cursor-default whitespace-nowrap flex items-center py-2 overflow-visible"
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
                        style={{ display: titleHover ? "none" : "inline-block" }}
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
                                key={`${letter}-${
                                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                  idx
                                }`}
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

                <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 mb-4 font-semibold leading-relaxed">
                  {description}
                </p>

                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Build flexible calendar UIs with any design system. Use Tailwind CSS, Bootstrap, Material UI, Chakra
                  UI, or your custom components. Complete control over styling and behavior.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Link
                    href="/docs/guide/getting-started"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg font-semibold text-base hover:from-blue-700 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-500 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-center"
                  >
                    {navButtonText} →
                  </Link>
                  <Link
                    href="/docs/examples/date-picker/vanilla"
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg font-semibold text-base hover:bg-gray-100 dark:hover:bg-gray-800 transition hover:scale-105 text-gray-700 dark:text-gray-300 text-center"
                  >
                    View Examples
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Calendar Examples in rounded box */}
            <div className="hidden lg:flex absolute top-0 right-0 bottom-0 left-1/2 overflow-visible z-30 items-start justify-end">
              {/* Rounded box attached to top and right, only bottom-left corner rounded, floating above background */}
              <div
                className="bg-white dark:bg-gray-800 shadow-2xl"
                style={{
                  marginTop: "0",
                  marginRight: "0",
                  marginBottom: "32px",
                  marginLeft: "0",
                  borderTopLeftRadius: "0",
                  borderTopRightRadius: "0",
                  borderBottomRightRadius: "0",
                  borderBottomLeftRadius: "32px",
                  width: "100%",
                  maxWidth: "44rem",
                }}
              >
                <div className="relative z-10 w-full flex flex-col p-6" style={{ gap: "4" }}>
                  {/* Top row: Tailwind CSS and Bootstrap 5 */}
                  <div className="flex items-start" style={{ gap: "24px", height: "420px" }}>
                    {/* Tailwind CSS */}
                    <div className="flex flex-col" style={{ gap: "8px" }}>
                      {/* Tailwind CSS Badge */}
                      <Link
                        href="/docs/examples/date-picker/tailwind"
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-md shadow-cyan-500/20 dark:shadow-cyan-500/30 border border-white/20 dark:border-cyan-400/30 w-fit"
                      >
                        Tailwind CSS
                      </Link>
                      <TailwindCalendar />
                    </div>

                    {/* Bootstrap 5 */}
                    <div className="flex flex-col" style={{ gap: "8px" }}>
                      {/* Bootstrap 5 Badge */}
                      <Link
                        href="/docs/examples/date-picker/bootstrap"
                        className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-md shadow-purple-600/20 dark:shadow-purple-500/30 border border-white/20 dark:border-purple-400/30 w-fit"
                      >
                        Bootstrap 5
                      </Link>
                      <BootstrapPreview>
                        <BootstrapDateCalendar />
                      </BootstrapPreview>
                    </div>
                  </div>

                  {/* Bottom: Vanilla CSS Range Picker Dual */}
                  <div className="flex flex-col w-full" style={{ gap: "8px", height: "416px" }}>
                    {/* Vanilla CSS Badge */}
                    <Link
                      href="/docs/examples/date-range-picker/vanilla"
                      className="bg-gradient-to-r from-zinc-600 to-zinc-700 dark:from-zinc-500 dark:to-zinc-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-md shadow-zinc-600/20 dark:shadow-zinc-500/30 border border-white/15 dark:border-zinc-400/30 w-fit"
                    >
                      Vanilla CSS
                    </Link>
                    <VanillaRangeCalendarDual />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
