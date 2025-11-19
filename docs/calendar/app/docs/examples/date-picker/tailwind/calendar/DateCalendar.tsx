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
    <div className="w-80 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50 p-5 shadow-lg shadow-purple-200/50 dark:border-purple-800 dark:bg-gradient-to-br dark:from-purple-950/50 dark:via-slate-800 dark:to-purple-950/50 dark:shadow-[0_8px_24px_rgba(147,51,234,0.3),0_0_0_1px_rgba(147,51,234,0.1)]">
      <div className="flex items-start justify-between border-b border-purple-200 pb-4 dark:border-purple-800">
        <div>
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Selected date</p>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100 mt-1">
            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigation.setToday();
            setSelectedDate(new Date());
          }}
          className="rounded-lg border-2 border-purple-300 px-3 py-1 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-100 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/50 dark:hover:border-purple-600 dark:focus:ring-purple-400"
        >
          Today
        </button>
      </div>

      <div className="flex items-center justify-between py-4">
        <button
          type="button"
          onClick={navigation.toPrev}
          className="rounded-lg p-2 text-purple-700 transition hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-purple-300 dark:hover:bg-purple-900/50 dark:focus:ring-purple-400"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="text-base font-bold text-purple-900 dark:text-purple-100">{format(cursorDate, "MMMM yyyy")}</h2>
        <button
          type="button"
          onClick={navigation.toNext}
          className="rounded-lg p-2 text-purple-700 transition hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-purple-300 dark:hover:bg-purple-900/50 dark:focus:ring-purple-400"
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
              <th key={key} className="p-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
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
                        box-border w-full h-10 rounded-lg text-sm font-medium transition-all duration-200
                        ${!isCurrentMonth && "text-purple-300 dark:text-purple-700"}
                        ${!isCurrentMonth && !isSelected && "hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"}
                        ${isCurrentMonth && "text-purple-900 dark:text-purple-100"}
                        ${isCurrentMonth && !isSelected && "hover:bg-purple-100 dark:hover:bg-purple-900/30"}
                        ${isCurrentDate && "border-2 border-purple-500 font-bold text-purple-600 dark:border-purple-400 dark:text-purple-400"}
                        ${isSelected && "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/50 hover:!from-purple-600 hover:!to-purple-700 dark:from-purple-500 dark:to-purple-600 dark:text-white dark:hover:!from-purple-600 dark:hover:!to-purple-700"}
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
