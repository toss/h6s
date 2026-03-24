"use client";

import { useCalendar, useSelection } from "@h6s/calendar";
import * as Popover from "@radix-ui/react-popover";
import { addMonths, format, isToday, subMonths } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import "./DateRangePicker.css";

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
      <div className="daterangepicker-field">
        <Popover.Trigger asChild>
          <button type="button" className="daterangepicker-field__trigger">
            <span className={`daterangepicker-field__value ${displayRange?.from ? "is-selected" : ""}`}>
              {displayValue}
            </span>
            <svg className="daterangepicker-field__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
          className="daterangepicker-popover"
        >
          <DateRangePickerContent onRangeChange={setDisplayRange} close={() => setOpen(false)} />
          <Popover.Arrow className="daterangepicker-popover__arrow" />
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
      <table className="daterangepicker-popover__calendar">
        <thead>
          <tr>
            {calendar.headers.weekdays.map(({ key, value }) => (
              <th key={key} className="daterangepicker-popover__weekday">
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

                const buttonClassNames = [
                  "daterangepicker-popover__day",
                  !isCurrentMonth && "daterangepicker-popover__day--outside",
                  isCurrentMonth && "daterangepicker-popover__day--current-month",
                  inRange && "daterangepicker-popover__day--in-range",
                  selected && "daterangepicker-popover__day--selected",
                  today && !selected && "daterangepicker-popover__day--today",
                ]
                  .filter(Boolean)
                  .join(" ");

                const cellClassName = isCurrentMonth && inRange ? "daterangepicker-popover__cell--in-range" : "";

                return (
                  <td key={key} className={cellClassName}>
                    {isCurrentMonth ? (
                      <button type="button" onClick={() => selection.select(value)} className={buttonClassNames}>
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
    <div className="daterangepicker-popover__content">
      <div className="daterangepicker-popover__calendars">
        <div className="daterangepicker-popover__calendar-container">
          <div className="daterangepicker-popover__nav">
            <button
              type="button"
              onClick={() => {
                const newDate = subMonths(leftCalendar.cursorDate, 1);
                leftCalendar.navigation.setDate(newDate);
                rightCalendar.navigation.setDate(addMonths(newDate, 1));
              }}
              className="daterangepicker-popover__nav-button"
              aria-label="Previous month"
            >
              ←
            </button>
            <h2 className="daterangepicker-popover__month">{format(leftCalendar.cursorDate, "MMMM yyyy")}</h2>
            <div className="daterangepicker-popover__nav-placeholder" />
          </div>
          {renderCalendar(leftCalendar)}
        </div>

        <div className="daterangepicker-popover__calendar-container">
          <div className="daterangepicker-popover__nav">
            <div className="daterangepicker-popover__nav-placeholder" />
            <h2 className="daterangepicker-popover__month">{format(rightCalendar.cursorDate, "MMMM yyyy")}</h2>
            <button
              type="button"
              onClick={() => {
                const newDate = addMonths(leftCalendar.cursorDate, 1);
                leftCalendar.navigation.setDate(newDate);
                rightCalendar.navigation.setDate(addMonths(newDate, 1));
              }}
              className="daterangepicker-popover__nav-button"
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
