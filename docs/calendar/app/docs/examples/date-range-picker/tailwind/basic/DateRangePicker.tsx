"use client";

import { useCalendar, useSelection } from "@h6s/calendar";
import * as Popover from "@radix-ui/react-popover";
import { addMonths, format, isToday, subMonths } from "date-fns";
import { useEffect, useMemo, useState } from "react";

export function DateRangePicker() {
  const [displayRange, setDisplayRange] = useState<{ from: Date; to?: Date } | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const displayValue = useMemo(() => {
    if (!displayRange?.from) return "Pick a date range";
    if (!displayRange.to) return `${format(displayRange.from, "PP")} - ...`;
    return `${format(displayRange.from, "PP")} - ${format(displayRange.to, "PP")}`;
  }, [displayRange]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className="flex w-full max-w-xs flex-col items-start gap-2">
        <Popover.Trigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-2.5 py-1.5 text-sm text-left shadow-sm shadow-slate-200/50 transition hover:border-slate-400 hover:shadow-md hover:shadow-slate-300/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 dark:shadow-lg dark:shadow-slate-900/50 dark:hover:border-slate-600 dark:hover:shadow-slate-800/50 dark:focus-visible:outline-slate-400"
          >
            <span
              className={`truncate ${displayRange?.from ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}
            >
              {displayValue}
            </span>
            <svg
              className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 2a1 1 0 0 1 2 0v1h4V2a1 1 0 1 1 2 0v1h1.5A1.5 1.5 0 0 1 17 4.5v11A1.5 1.5 0 0 1 15.5 17h-11A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H6V2Zm-1.5 5v8h11V7h-11Z" />
            </svg>
          </button>
        </Popover.Trigger>
      </div>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm shadow-slate-200/50 outline-none data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 dark:shadow-lg dark:shadow-slate-900/50"
        >
          <DateRangePickerContent onRangeChange={setDisplayRange} close={() => setOpen(false)} />
          <Popover.Arrow className="fill-slate-50 dark:fill-slate-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function DateRangePickerContent({
  onRangeChange,
  close,
}: {
  onRangeChange: (range: { from: Date; to?: Date } | undefined) => void;
  close: () => void;
}) {
  const leftCalendar = useCalendar({
    defaultDate: new Date(),
  });

  const rightCalendar = useCalendar({
    defaultDate: addMonths(new Date(), 1),
  });

  const selection = useSelection({ mode: "range", body: leftCalendar.body });

  useEffect(() => {
    onRangeChange(selection.selected);
    if (selection.selected?.to) {
      close();
    }
  }, [selection.selected, onRangeChange, close]);

  const renderCalendar = (calendar: ReturnType<typeof useCalendar>) => {
    return (
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {calendar.headers.weekdays.map(({ key, value }) => (
              <th key={key} className="w-[calc(100%/7)] p-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {format(value, "EEEEEE")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.body.value.map(({ key, value: days }) => (
            <tr key={key}>
              {days.map(({ key, value, isCurrentMonth }) => {
                const inRange = selection.isInRange(value);
                const selected = selection.isRangeStart(value) || selection.isRangeEnd(value);
                const today = isToday(value);

                return (
                  <td
                    key={key}
                    className={`
                      relative w-[calc(100%/7)] p-0 text-center
                      ${isCurrentMonth && inRange && "before:absolute before:inset-y-1/2 before:left-0 before:right-0 before:h-8 before:-translate-y-1/2 before:bg-slate-200 before:dark:bg-slate-700"}
                    `}
                  >
                    {isCurrentMonth ? (
                      <button
                        type="button"
                        onClick={() => selection.select(value)}
                        className={`
                          box-border relative z-10 w-9 h-9 rounded-md text-xs font-medium transition-all duration-150
                          ${!isCurrentMonth && "text-slate-400 dark:text-slate-600"}
                          ${isCurrentMonth && !selected && "text-slate-900 dark:text-slate-100"}
                          ${!selected && "hover:bg-slate-100 dark:hover:bg-slate-700"}
                          ${inRange && "text-slate-700 dark:text-slate-300"}
                          ${selected && "!bg-slate-600 !text-white shadow-md shadow-slate-600/30 hover:!bg-slate-700 dark:!bg-slate-500 dark:shadow-slate-500/30 dark:hover:!bg-slate-400"}
                          ${today && !selected && "border-2 border-slate-600 font-bold text-slate-700 dark:border-slate-400 dark:text-slate-300"}
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
    <div className="space-y-4">
      <div className="flex gap-6 overflow-x-auto pb-2">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between pb-4">
            <button
              type="button"
              onClick={() => {
                const newDate = subMonths(leftCalendar.cursorDate, 1);
                leftCalendar.navigation.setDate(newDate);
                rightCalendar.navigation.setDate(addMonths(newDate, 1));
              }}
              className="rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:focus:ring-slate-400"
              aria-label="Previous month"
            >
              ←
            </button>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {format(leftCalendar.cursorDate, "MMMM yyyy")}
            </h2>
            <div className="w-9" />
          </div>
          {renderCalendar(leftCalendar)}
        </div>

        <div className="flex-shrink-0">
          <div className="flex items-center justify-between pb-4">
            <div className="w-9" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {format(rightCalendar.cursorDate, "MMMM yyyy")}
            </h2>
            <button
              type="button"
              onClick={() => {
                const newDate = addMonths(leftCalendar.cursorDate, 1);
                leftCalendar.navigation.setDate(newDate);
                rightCalendar.navigation.setDate(addMonths(newDate, 1));
              }}
              className="rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:focus:ring-slate-400"
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
