"use client";

import { useCalendar } from "@h6s/calendar";
import * as Popover from "@radix-ui/react-popover";
import { addMonths, format, isAfter, isSameDay, isToday, subMonths } from "date-fns";
import { useMemo, useState } from "react";
import "./DateRangePicker.css";

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
      <div className="daterangepicker-field">
        <label className="daterangepicker-field__label">Date Range</label>
        <Popover.Trigger asChild>
          <button type="button" className="daterangepicker-field__trigger">
            <span className={`daterangepicker-field__value ${dateRange.start ? "is-selected" : ""}`}>
              {displayValue}
            </span>
            <svg className="daterangepicker-field__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6 2a1 1 0 0 1 2 0v1h4V2a1 1 0 1 1 2 0v1h1.5A1.5 1.5 0 0 1 17 4.5v11A1.5 1.5 0 0 1 15.5 17h-11A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H6V2Zm-1.5 5v8h11V7h-11Z" />
            </svg>
          </button>
        </Popover.Trigger>
        {dateRange.start && (
          <button type="button" className="daterangepicker-field__clear" onClick={handleClear}>
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
          className="daterangepicker-popover"
        >
          <DateRangePickerContent dateRange={dateRange} setDateRange={setDateRange} close={() => setOpen(false)} />
          <Popover.Arrow className="daterangepicker-popover__arrow" />
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
      <table className="daterangepicker-popover__calendar" onMouseLeave={() => setHoverDate(null)}>
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
                const inRange = isInRange(value);
                const selected = isSelected(value);
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
                      <button
                        type="button"
                        onClick={() => handleDateSelect(value)}
                        onMouseEnter={() => {
                          if (dateRange.start && !dateRange.end && !isSameDay(value, hoverDate || new Date(0))) {
                            setHoverDate(value);
                          }
                        }}
                        className={buttonClassNames}
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
