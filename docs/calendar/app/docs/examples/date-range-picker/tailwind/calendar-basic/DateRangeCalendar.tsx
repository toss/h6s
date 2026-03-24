"use client";

import { useCalendar, useSelection } from "@h6s/calendar";
import { format, isToday } from "date-fns";

export function DateRangeCalendar() {
  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: new Date(),
  });

  const selection = useSelection({ mode: "range", body });

  const formatRange = () => {
    if (!selection.selected) return "Pick a start date";
    if (!selection.selected.to) return `${format(selection.selected.from, "MM/dd/yyyy")} - ...`;
    return `${format(selection.selected.from, "MM/dd/yyyy")} - ${format(selection.selected.to, "MM/dd/yyyy")}`;
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
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.weekdays.map(({ key, value }) => (
                <th
                  key={key}
                  className="w-[calc(100%/7)] px-1 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap overflow-hidden"
                >
                  {format(value, "EEEEEE")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selection.body.value.map(({ key, value: days }) => (
              <tr key={key}>
                {days.map(({ key, value, isCurrentMonth, isInRange, isRangeStart, isRangeEnd }) => {
                  const selected = isRangeStart || isRangeEnd;
                  const today = isToday(value);

                  return (
                    <td
                      key={key}
                      className={`
                      relative w-[calc(100%/7)] p-0 text-center
                      ${isInRange && "before:absolute before:inset-y-1/2 before:left-0 before:right-0 before:h-[1.8rem] before:-translate-y-1/2 before:bg-slate-200 before:dark:bg-slate-700"}
                    `}
                    >
                      <button
                        type="button"
                        onClick={() => selection.select(value)}
                        className={`
                        box-border relative z-10 w-full h-9 rounded-md text-xs font-medium transition-all duration-150
                        ${!isCurrentMonth && "text-slate-400 dark:text-slate-600"}
                        ${isCurrentMonth && !selected && "text-slate-900 dark:text-slate-100"}
                        ${!selected && "hover:bg-slate-100 dark:hover:bg-slate-700"}
                        ${isInRange && "text-slate-700 dark:text-slate-300"}
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
