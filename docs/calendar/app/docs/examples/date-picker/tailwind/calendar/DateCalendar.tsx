"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay } from "date-fns";
import { useState } from "react";

export function DateCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: selectedDate ?? new Date(),
  });

  function handleDateSelect(date: Date, isCurrentMonth: boolean) {
    if (!isCurrentMonth) {
      navigation.setDate(date);
    }
    setSelectedDate(date);
  }

  return (
    <div className="w-80 rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-600 dark:bg-slate-800 dark:shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]">
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

      <div className="w-fit">
        <table className="border-collapse">
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
                  <td key={key} className="w-10 p-0 text-center">
                    <button
                      type="button"
                      onClick={() => handleDateSelect(value, isCurrentMonth)}
                      className={`
                        box-border w-full h-10 rounded-md text-sm transition
                        ${!isCurrentMonth && "text-gray-400 dark:text-gray-500"}
                        ${!isCurrentMonth && !isSelected && "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"}
                        ${isCurrentMonth && "text-gray-900 dark:text-gray-100"}
                        ${isCurrentMonth && !isSelected && "hover:bg-gray-100 dark:hover:bg-gray-800"}
                        ${isCurrentDate && "border-2 border-blue-500 font-bold text-blue-500 dark:border-blue-400 dark:text-blue-400"}
                        ${isSelected && "bg-blue-500 text-white hover:!bg-blue-600 dark:bg-blue-600 dark:hover:!bg-blue-700"}
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
