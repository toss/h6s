"use client";

import { useCalendar } from "@h6s/calendar";
import { addMonths, format, isAfter, isSameDay, isToday, subMonths } from "date-fns";
import { useState } from "react";

type DateRange = {
  start: Date | null;
  end: Date | null;
};

export function DateRangeCalendarDual() {
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

  const renderCalendar = (calendar: ReturnType<typeof useCalendar>) => {
    return (
      <table className="w-full border-collapse" onMouseLeave={() => setHoverDate(null)}>
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
            <tr key={key}>
              {days.map(({ key, value, isCurrentMonth }) => {
                const inRange = isInRange(value);
                const selected = isSelected(value);
                const today = isToday(value);

                return (
                  <td
                    key={key}
                    className={`
                      relative w-10 p-0 text-center
                      ${isCurrentMonth && inRange && "before:absolute before:inset-y-1/2 before:left-0 before:right-0 before:h-8 before:-translate-y-1/2 before:bg-blue-100 before:dark:bg-blue-900/30"}
                    `}
                  >
                    {isCurrentMonth ? (
                      <button
                        type="button"
                        onClick={() => handleDateSelect(value)}
                        onMouseEnter={() => {
                          if (dateRange.start && !dateRange.end && !isSameDay(value, hoverDate || new Date(0))) {
                            setHoverDate(value);
                          }
                        }}
                        className={`
                          box-border relative z-10 w-full h-10 rounded-md text-sm transition
                          text-gray-900 dark:text-gray-100
                          ${!selected && "hover:bg-gray-100 dark:hover:bg-gray-800"}
                          ${inRange && "text-blue-900 dark:text-blue-100"}
                          ${selected && "!bg-blue-500 !text-white font-semibold hover:!bg-blue-500 dark:!bg-blue-600 dark:hover:!bg-blue-600"}
                          ${today && "border-2 border-blue-500"}
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
    <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-600 dark:bg-slate-800 dark:shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]">
      <div className="flex items-start justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Selected range</p>
          <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">{formatRange()}</p>
        </div>
      </div>

      <div className="flex gap-4">
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
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {format(leftCalendar.cursorDate, "MMMM yyyy")}
            </h2>
            <div className="w-9" />
          </div>
          {renderCalendar(leftCalendar)}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between py-4">
            <div className="w-9" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {format(rightCalendar.cursorDate, "MMMM yyyy")}
            </h2>
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
