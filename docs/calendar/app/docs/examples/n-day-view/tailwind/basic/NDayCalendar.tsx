"use client";

import { useNDayView } from "./useNDayView";
import { format, isSameDay } from "date-fns";
import { useState } from "react";

const DAY_OPTIONS = [3, 5, 7, 14];

export function NDayCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { body, navigation, cursorDate, view } = useNDayView({
    defaultDate: new Date(),
    numberOfDays: 3,
  });

  return (
    <div className="max-w-2xl rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 dark:shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              navigation.setToday();
              setSelectedDate(new Date());
            }}
            className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Today
          </button>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={navigation.toPrev}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
              aria-label="Previous"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={navigation.toNext}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
              aria-label="Next"
            >
              &rarr;
            </button>
          </div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {format(cursorDate, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex gap-1">
          {DAY_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => view.setNumberOfDays(n)}
              className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                view.numberOfDays === n
                  ? "border-slate-600 bg-slate-600 text-white dark:border-slate-500 dark:bg-slate-500"
                  : "border-slate-300 text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {n} days
            </button>
          ))}
        </div>
      </div>

      {body.value.map(({ key: rowKey, value: days }) => (
        <div key={rowKey}>
          <div className="flex border-b border-slate-200 pt-3 dark:border-slate-700">
            <div className="w-12 shrink-0" />
            {days.map(({ key, value, isCurrentDate, isWeekend }) => {
              const isSelected = selectedDate && isSameDay(value, selectedDate);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(value)}
                  className={`mb-1.5 flex flex-1 min-w-0 flex-col items-center gap-0.5 rounded-lg border py-2 transition cursor-pointer ${
                    isSelected
                      ? "border-slate-600 bg-slate-600 text-white shadow-md dark:border-slate-500 dark:bg-slate-500"
                      : isCurrentDate
                        ? "border-2 border-slate-600 dark:border-slate-400"
                        : "border-transparent hover:border-slate-300 hover:bg-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`text-[0.65rem] font-semibold uppercase tracking-wide ${
                      isSelected
                        ? "text-white"
                        : isWeekend
                          ? "text-red-500 dark:text-red-400"
                          : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {format(value, "EEE")}
                  </span>
                  <span
                    className={`text-xl font-semibold ${
                      isSelected ? "text-white" : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {format(value, "d")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {days[0].hours.map(({ hour }) => (
              <div key={hour} className="flex min-h-10 border-b border-slate-100 dark:border-slate-800">
                <div className="flex w-12 shrink-0 items-start justify-end pr-2 pt-0.5">
                  <span className="text-[0.65rem] font-medium text-slate-400 dark:text-slate-600">
                    {hour === 0 ? "" : `${hour}:00`}
                  </span>
                </div>
                {days.map(({ key }) => (
                  <div
                    key={`${key}-${hour}`}
                    className="min-w-0 flex-1 border-l border-slate-100 dark:border-slate-800"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
