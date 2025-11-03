"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay } from "date-fns";
import { useState } from "react";

export function DatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: selectedDate ?? new Date(),
  });

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
  };

  return (
    <div className="my-8 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Selected date</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigation.setToday();
            setSelectedDate(new Date());
          }}
          className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-blue-400"
        >
          Today
        </button>
      </div>

      <div className="flex items-center justify-between py-4">
        <button
          type="button"
          onClick={navigation.toPrev}
          className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-blue-400"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{format(cursorDate, "MMMM yyyy")}</h2>
        <button
          type="button"
          onClick={navigation.toNext}
          className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-blue-400"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            {headers.weekdays.map(({ key, value }) => (
              <th key={key} className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                {format(value, "EEEEEE")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.value.map(({ key, value: days }) => (
            <tr key={key}>
              {days.map(({ key, value, isCurrentDate, isCurrentMonth }) => {
                const isSelected = selectedDate && isSameDay(value, selectedDate);

                return (
                  <td key={key} className="p-1">
                    <button
                      type="button"
                      onClick={() => handleDateSelect(value)}
                      className={`
                        w-10 h-10 rounded-md text-sm transition
                        ${!isCurrentMonth && "text-gray-300 dark:text-gray-600"}
                        ${isCurrentMonth && "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"}
                        ${isCurrentDate && "font-bold text-blue-500 dark:text-blue-400"}
                        ${isSelected && "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"}
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
  );
}
