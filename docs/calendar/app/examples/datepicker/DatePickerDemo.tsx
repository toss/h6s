"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay } from "date-fns";
import { useState } from "react";

export function DatePickerDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: selectedDate ?? new Date(),
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block my-8">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      >
        {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[320px]">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={navigation.toPrev}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100"
              aria-label="Previous month"
            >
              ←
            </button>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{format(cursorDate, "MMMM yyyy")}</h2>
            <button
              type="button"
              onClick={navigation.toNext}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              navigation.setToday();
              setSelectedDate(new Date());
              setIsOpen(false);
            }}
            className="w-full mb-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-900 dark:text-gray-100"
          >
            Today
          </button>

          <table className="w-full">
            <thead>
              <tr>
                {headers.weekdays.map(({ key, value }) => (
                  <th key={key} className="p-2 text-sm font-medium text-gray-600 dark:text-gray-400">
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
                            w-10 h-10 rounded-full text-sm
                            ${!isCurrentMonth && "text-gray-300 dark:text-gray-600"}
                            ${isCurrentMonth && "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"}
                            ${isCurrentDate && "font-bold ring-2 ring-blue-500 dark:ring-blue-400"}
                            ${isSelected && "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"}
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
      )}
    </div>
  );
}
