"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isAfter, isSameDay, isToday } from "date-fns";
import { useState } from "react";

type DateRange = {
  start: Date | null;
  end: Date | null;
};

export function DateRangeCalendar() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: dateRange.start ?? new Date(),
  });

  function handleDateSelect(date: Date) {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: date, end: null });
    } else {
      if (isAfter(date, dateRange.start)) {
        setDateRange({ start: dateRange.start, end: date });
      } else {
        setDateRange({ start: date, end: null });
      }
    }
  }

  function isInRange(date: Date): boolean {
    if (!dateRange.start) return false;

    const end = dateRange.end || (hoverDate && isAfter(hoverDate, dateRange.start) ? hoverDate : null);
    if (!end) return false;

    return isAfter(date, dateRange.start) && isAfter(end, date);
  }

  function isSelected(date: Date): boolean {
    if (dateRange.start && isSameDay(date, dateRange.start)) return true;
    if (dateRange.end && isSameDay(date, dateRange.end)) return true;
    return false;
  }

  const formatRange = () => {
    if (!dateRange.start) return "Pick a start date";
    if (!dateRange.end) return `${format(dateRange.start, "MM/dd/yyyy")} - ...`;
    return `${format(dateRange.start, "MM/dd/yyyy")} - ${format(dateRange.end, "MM/dd/yyyy")}`;
  };

  return (
    <div className="w-80 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 dark:shadow-lg dark:shadow-slate-900/50">
      <div className="flex items-start justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatRange()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between py-3">
        <button
          type="button"
          onClick={navigation.toPrev}
          className="rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:focus:ring-slate-400"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{format(cursorDate, "MMMM yyyy")}</h2>
        <button
          type="button"
          onClick={navigation.toNext}
          className="rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:focus:ring-slate-400"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="w-full">
        <table className="w-full border-collapse" onMouseLeave={() => setHoverDate(null)}>
        <thead>
          <tr>
            {headers.weekdays.map(({ key, value }) => (
              <th key={key} className="w-[calc(100%/7)] p-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {format(value, "EEEEEE")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.value.map(({ key, value: days }) => (
            <tr key={key}>
              {days.map(({ key, value, isCurrentMonth }) => {
                const inRange = isInRange(value);
                const selected = isSelected(value);
                const today = isToday(value);

                return (
                  <td
                    key={key}
                    className={`
                      relative w-[calc(100%/7)] p-0 text-center
                      ${inRange && "before:absolute before:inset-y-1/2 before:left-0 before:right-0 before:h-8 before:-translate-y-1/2 before:bg-slate-200 before:dark:bg-slate-700"}
                    `}
                  >
                    <button
                      type="button"
                      onClick={() => handleDateSelect(value)}
                      onMouseEnter={() => {
                        if (dateRange.start && !dateRange.end && !isSameDay(value, hoverDate || new Date(0))) {
                          setHoverDate(value);
                        }
                      }}
                      className={`
                        box-border relative z-10 w-full aspect-square rounded-md text-xs font-medium transition-all duration-150
                        ${!isCurrentMonth && "text-slate-400 dark:text-slate-600"}
                        ${isCurrentMonth && !selected && "text-slate-900 dark:text-slate-100"}
                        ${!selected && "hover:bg-slate-100 dark:hover:bg-slate-700"}
                        ${inRange && "text-slate-700 dark:text-slate-300"}
                        ${selected && "!bg-slate-600 !text-white shadow-md shadow-slate-600/30 hover:!bg-slate-700 dark:!bg-slate-500 dark:shadow-slate-500/30 dark:hover:!bg-slate-400"}
                        ${today && "border-2 border-slate-600 font-bold text-slate-700 dark:border-slate-400 dark:text-slate-300"}
                      `}
                    >
                      {format(value, "d")}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
