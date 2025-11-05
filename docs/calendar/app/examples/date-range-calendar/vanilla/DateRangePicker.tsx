"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay, isAfter } from "date-fns";
import { useState } from "react";
import "./DateRangePicker.css";

type DateRange = {
  start: Date | null;
  end: Date | null;
};

export function DateRangePicker() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: dateRange.start ?? new Date(),
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

  function handleClear() {
    setDateRange({ start: null, end: null });
    setHoverDate(null);
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

  const formatRange = () => {
    if (!dateRange.start) return "Pick a start date";
    if (!dateRange.end) return `${format(dateRange.start, "MM/dd/yyyy")} - ...`;
    return `${format(dateRange.start, "MM/dd/yyyy")} - ${format(dateRange.end, "MM/dd/yyyy")}`;
  };

  return (
    <div className="daterangepicker-basic">
      <div className="daterangepicker-selection">
        <div>
          <p className="daterangepicker-selection-label">Selected range</p>
          <p className="daterangepicker-selection-value">{formatRange()}</p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="daterangepicker-clear-button"
          disabled={!dateRange.start}
        >
          Clear
        </button>
      </div>

      <div className="daterangepicker-header">
        <button
          type="button"
          onClick={navigation.toPrev}
          className="daterangepicker-nav-button"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="daterangepicker-title">{format(cursorDate, "MMMM yyyy")}</h2>
        <button
          type="button"
          onClick={navigation.toNext}
          className="daterangepicker-nav-button"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <table
        className="daterangepicker-calendar"
        onMouseLeave={() => setHoverDate(null)}
      >
        <thead>
          <tr>
            {headers.weekdays.map(({ key, value }) => (
              <th key={key} className="daterangepicker-weekday">
                {format(value, "EEEEEE")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.value.map(({ key, value: days }) => (
            <tr key={key}>
              {days.map(({ key, value, isCurrentMonth }) => {
                const inRange = isInRange(value);
                const selected = isSelected(value);

                const buttonClassNames = [
                  "daterangepicker-day",
                  !isCurrentMonth && "daterangepicker-day--outside",
                  isCurrentMonth && "daterangepicker-day--current-month",
                  inRange && "daterangepicker-day--in-range",
                  selected && "daterangepicker-day--selected",
                ]
                  .filter(Boolean)
                  .join(" ");

                const cellClassNames = inRange ? "daterangepicker-cell--in-range" : "";

                return (
                  <td key={key} className={cellClassNames}>
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
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
