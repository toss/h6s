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
    <div className="w-80 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 dark:shadow-lg dark:shadow-slate-900/50">
      <div className="flex items-start justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigation.setToday();
            setSelectedDate(new Date());
          }}
          className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:border-slate-500 dark:focus:ring-slate-400"
        >
          Today
        </button>
      </div>

      <div className="flex items-center justify-between py-2">
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
        <table className="w-full border-collapse">
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
              {days.map(({ key, value, isCurrentDate, isCurrentMonth }) => {
                const isSelected = selectedDate && isSameDay(value, selectedDate);

                return (
                  <td key={key} className="w-[calc(100%/7)] p-0 text-center">
                    <button
                      type="button"
                      onClick={() => handleDateSelect(value, isCurrentMonth)}
                      className={`
                        box-border w-full aspect-square rounded-md text-xs font-medium transition-all duration-150
                        ${!isCurrentMonth && "text-slate-400 dark:text-slate-600"}
                        ${!isCurrentMonth && !isSelected && "hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"}
                        ${isCurrentMonth && "text-slate-900 dark:text-slate-100"}
                        ${isCurrentMonth && !isSelected && "hover:bg-slate-100 dark:hover:bg-slate-700"}
                        ${isCurrentDate && "border-2 border-slate-600 font-bold text-slate-700 dark:border-slate-400 dark:text-slate-300"}
                        ${isSelected && "bg-slate-600 text-white shadow-md shadow-slate-600/30 hover:bg-slate-700 dark:bg-slate-500 dark:shadow-slate-500/30 dark:hover:bg-slate-400"}
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
