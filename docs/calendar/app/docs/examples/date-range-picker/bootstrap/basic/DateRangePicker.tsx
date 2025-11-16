"use client";

import { useCalendar } from "@h6s/calendar";
import * as Popover from "@radix-ui/react-popover";
import { addMonths, format, isAfter, isSameDay, isToday, subMonths } from "date-fns";
import { useMemo, useState } from "react";

type DateRange = {
  start: Date | null;
  end: Date | null;
};

export function DateRangePicker() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [open, setOpen] = useState(false);

  const displayValue = useMemo(() => {
    if (!dateRange.start) return "Pick a date range";
    if (!dateRange.end) return `${format(dateRange.start, "PP")} - ...`;
    return `${format(dateRange.start, "PP")} - ${format(dateRange.end, "PP")}`;
  }, [dateRange]);

  function handleClear() {
    setDateRange({ start: null, end: null });
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className="flex w-full max-w-sm flex-col items-start gap-2">
        <Popover.Trigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left shadow-sm transition hover:border-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-gray-700 dark:bg-gray-900"
          >
            <span
              className={`truncate ${dateRange.start ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-500"}`}
            >
              {displayValue}
            </span>
            <svg
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 2a1 1 0 0 1 2 0v1h4V2a1 1 0 1 1 2 0v1h1.5A1.5 1.5 0 0 1 17 4.5v11A1.5 1.5 0 0 1 15.5 17h-11A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H6V2Zm-1.5 5v8h11V7h-11Z" />
            </svg>
          </button>
        </Popover.Trigger>
        {dateRange.start && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
          >
            Clear selection
          </button>
        )}
      </div>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white p-5 shadow-xl outline-none data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out dark:border-gray-700 dark:bg-gray-900"
        >
          <DateRangePickerContent dateRange={dateRange} setDateRange={setDateRange} close={() => setOpen(false)} />
          <Popover.Arrow className="fill-white dark:fill-gray-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function DateRangePickerContent({
  dateRange,
  setDateRange,
  close,
}: {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  close: () => void;
}) {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const leftCalendar = useCalendar({
    defaultDate: dateRange.start ?? new Date(),
  });

  const rightCalendar = useCalendar({
    defaultDate: addMonths(dateRange.start ?? new Date(), 1),
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

  const renderCalendar = (calendar: ReturnType<typeof useCalendar>) => {
    return (
      <table className="w-full min-w-[20rem] border-collapse" onMouseLeave={() => setHoverDate(null)}>
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
                      relative p-0.5
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
                          relative z-10 w-10 h-10 rounded-md text-sm transition
                          text-gray-900 dark:text-gray-100
                          ${!selected && "hover:bg-gray-100 dark:hover:bg-gray-800"}
                          ${inRange && "text-blue-900 dark:text-blue-100"}
                          ${selected && "!bg-blue-500 !text-white font-semibold hover:!bg-blue-500 dark:!bg-blue-600 dark:hover:!bg-blue-600"}
                          ${today && !selected && "border-2 border-blue-500 font-semibold text-blue-500 dark:border-blue-400 dark:text-blue-400"}
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

        <div className="flex-shrink-0">
          <div className="flex items-center justify-between pb-4">
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
