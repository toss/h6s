"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay, isWithinInterval, isAfter, isBefore, addMonths, subMonths } from "date-fns";
import { useState } from "react";

type DateRange = {
  start: Date | null;
  end: Date | null;
};

export function DateRangePickerDual() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const leftCalendar = useCalendar({
    defaultDate: new Date(),
  });

  const rightCalendar = useCalendar({
    defaultDate: addMonths(new Date(), 1),
  });

  function handleDateSelect(date: Date) {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      // Start new selection
      setDateRange({ start: date, end: null });
    } else {
      // Complete the range
      if (isAfter(date, dateRange.start)) {
        setDateRange({ start: dateRange.start, end: date });
      } else {
        setDateRange({ start: date, end: dateRange.start });
      }
    }
  }

  function handleClear() {
    setDateRange({ start: null, end: null });
    setHoverDate(null);
  }

  function isInRange(date: Date): boolean {
    if (!dateRange.start) return false;

    const end = dateRange.end || hoverDate;
    if (!end) return false;

    // If start and end are the same day, there's no range
    if (isSameDay(dateRange.start, end)) return false;

    const rangeStart = isBefore(dateRange.start, end) ? dateRange.start : end;
    const rangeEnd = isAfter(dateRange.start, end) ? dateRange.start : end;

    // Exclude start and end dates - only dates strictly between them
    return isWithinInterval(date, { start: rangeStart, end: rangeEnd })
      && !isSameDay(date, rangeStart)
      && !isSameDay(date, rangeEnd);
  }

  function isRangeStart(date: Date): boolean {
    if (!dateRange.start) return false;
    if (dateRange.end) {
      const rangeStart = isBefore(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;
      return isSameDay(date, rangeStart);
    }
    return isSameDay(date, dateRange.start);
  }

  function isRangeEnd(date: Date): boolean {
    if (!dateRange.start) return false;
    if (dateRange.end) {
      const rangeEnd = isAfter(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;
      return isSameDay(date, rangeEnd);
    }
    if (hoverDate) {
      return isSameDay(date, hoverDate);
    }
    return false;
  }

  const formatRange = () => {
    if (!dateRange.start) return "Pick a start date";
    if (!dateRange.end) return `${format(dateRange.start, "MMM d, yyyy")} - ...`;

    const start = isBefore(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;
    const end = isAfter(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;

    return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
  };

  const renderCalendar = (calendar: ReturnType<typeof useCalendar>) => {
    return (
      <table
        className="w-full border-collapse"
        onMouseLeave={() => setHoverDate(null)}
      >
        <thead>
          <tr>
            {calendar.headers.weekdays.map(({ key, value }) => (
              <th key={key} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {format(value, "EEEEEE")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.body.value.map(({ key, value: days }) => (
            <tr key={key} className="h-11">
              {days.map(({ key, value, isCurrentMonth }) => {
                const inRange = isInRange(value);
                const isStart = isRangeStart(value);
                const isEnd = isRangeEnd(value);

                // Only apply in-range to dates between start and end (exclusive)
                const isMiddleRange = inRange && !isStart && !isEnd;

                // Only show primary color for actually selected dates (not hover)
                const isSelectedStart = dateRange.start && isSameDay(value, dateRange.start);
                const isSelectedEnd = dateRange.end && isSameDay(value, dateRange.end);
                const isSelected = isSelectedStart || isSelectedEnd;

                return (
                  <td
                    key={key}
                    className={`
                      relative p-0.5
                      ${isCurrentMonth && isMiddleRange && "before:absolute before:inset-y-1/2 before:left-0 before:right-0 before:h-8 before:-translate-y-1/2 before:bg-blue-100 before:dark:bg-blue-900/30"}
                    `}
                  >
                    {isCurrentMonth ? (
                      <button
                        type="button"
                        onClick={() => handleDateSelect(value)}
                        onMouseEnter={() => dateRange.start && !dateRange.end && setHoverDate(value)}
                        className={`
                          relative z-10 w-10 h-10 rounded-md text-sm transition
                          text-gray-900 dark:text-gray-100
                          hover:bg-gray-100 dark:hover:bg-gray-800
                          ${isMiddleRange && "text-blue-900 dark:text-blue-100"}
                          ${isSelected && "bg-blue-500 text-white font-semibold hover:!bg-blue-600 dark:bg-blue-600 dark:hover:!bg-blue-700"}
                        `}
                      >
                        {format(value, "d")}
                      </button>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="my-8 max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Selected range</p>
          <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">{formatRange()}</p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={!dateRange.start}
          className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-blue-400"
        >
          Clear
        </button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between py-4">
            <button
              type="button"
              onClick={() => {
                const newDate = subMonths(leftCalendar.cursorDate, 1);
                leftCalendar.navigation.setDate(newDate);
                rightCalendar.navigation.setDate(addMonths(newDate, 1));
              }}
              className="rounded-lg p-2 text-lg text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-blue-400"
              aria-label="Previous month"
            >
              ←
            </button>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{format(leftCalendar.cursorDate, "MMMM yyyy")}</h2>
            <div className="w-9" />
          </div>
          {renderCalendar(leftCalendar)}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between py-4">
            <div className="w-9" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{format(rightCalendar.cursorDate, "MMMM yyyy")}</h2>
            <button
              type="button"
              onClick={() => {
                const newDate = addMonths(leftCalendar.cursorDate, 1);
                leftCalendar.navigation.setDate(newDate);
                rightCalendar.navigation.setDate(addMonths(newDate, 1));
              }}
              className="rounded-lg p-2 text-lg text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-blue-400"
              aria-label="Next month"
            >
              →
            </button>
          </div>
          {renderCalendar(rightCalendar)}
        </div>
      </div>
    </div>
  );
}
