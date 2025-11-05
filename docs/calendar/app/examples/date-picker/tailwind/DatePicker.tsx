"use client";

import { useCalendar } from "@h6s/calendar";
import * as Popover from "@radix-ui/react-popover";
import { format, isSameDay } from "date-fns";
import { useState } from "react";

export function DatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className="flex w-full max-w-sm flex-col items-start gap-2">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Date</label>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left shadow-sm transition hover:border-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-gray-700 dark:bg-gray-900"
          >
            <span
              className={`truncate ${selectedDate ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-500"}`}
            >
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
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
        {selectedDate && (
          <button
            type="button"
            onClick={() => setSelectedDate(null)}
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
          <DatePickerContent
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            close={() => setOpen(false)}
          />
          <Popover.Arrow className="fill-white dark:fill-gray-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function DatePickerContent({
  selectedDate,
  setSelectedDate,
  close,
}: {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  close: () => void;
}) {
  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: selectedDate ?? new Date(),
  });

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    close();
  }

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={navigation.toPrev}
          className="rounded-lg p-2 text-lg text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-blue-400"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{format(cursorDate, "MMMM yyyy")}</h2>
        <button
          type="button"
          onClick={navigation.toNext}
          className="rounded-lg p-2 text-lg text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-blue-400"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[20rem] border-collapse">
          <thead>
            <tr>
              {headers.weekdays.map(({ key, value }) => (
                <th key={key} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
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
                        onClick={() => handleSelectDate(value)}
                        className={`
                          w-10 h-10 rounded-md text-sm transition
                          ${!isCurrentMonth ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}
                          ${!isSelected && isCurrentMonth ? "hover:bg-gray-100 dark:hover:bg-gray-800" : ""}
                          ${!isSelected && !isCurrentMonth ? "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100" : ""}
                          ${isCurrentDate ? "border-2 border-blue-500 font-semibold text-blue-500 dark:border-blue-400 dark:text-blue-400" : "border border-transparent"}
                          ${isSelected ? "bg-blue-500 text-white hover:!bg-blue-600 dark:bg-blue-600 dark:hover:!bg-blue-700" : ""}
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
