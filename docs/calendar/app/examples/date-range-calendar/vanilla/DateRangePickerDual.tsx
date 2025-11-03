"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay, isWithinInterval, isAfter, isBefore, addMonths, subMonths } from "date-fns";
import { useState } from "react";
import "./DateRangePickerDual.css";

type DateRange = {
  start: Date | null;
  end: Date | null;
};

export function DateRangePickerDual() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const leftCalendar = useCalendar({
    defaultDate: new Date(),
  });

  const rightCalendar = useCalendar({
    defaultDate: addMonths(new Date(), 1),
  });

  function handleDateSelect(date: Date) {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      // Start new selection
      setDateRange({ start: date, end: null });
    } else {
      // Complete the range
      if (isAfter(date, dateRange.start)) {
        setDateRange({ start: dateRange.start, end: date });
      } else {
        setDateRange({ start: date, end: dateRange.start });
      }
    }
  }

  function handleClear() {
    setDateRange({ start: null, end: null });
    setHoverDate(null);
  }

  function isInRange(date: Date): boolean {
    if (!dateRange.start) return false;

    const end = dateRange.end || hoverDate;
    if (!end) return false;

    // If start and end are the same day, there's no range
    if (isSameDay(dateRange.start, end)) return false;

    const rangeStart = isBefore(dateRange.start, end) ? dateRange.start : end;
    const rangeEnd = isAfter(dateRange.start, end) ? dateRange.start : end;

    // Exclude start and end dates - only dates strictly between them
    return isWithinInterval(date, { start: rangeStart, end: rangeEnd })
      && !isSameDay(date, rangeStart)
      && !isSameDay(date, rangeEnd);
  }

  function isRangeStart(date: Date): boolean {
    if (!dateRange.start) return false;
    if (dateRange.end) {
      const rangeStart = isBefore(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;
      return isSameDay(date, rangeStart);
    }
    return isSameDay(date, dateRange.start);
  }

  function isRangeEnd(date: Date): boolean {
    if (!dateRange.start) return false;
    if (dateRange.end) {
      const rangeEnd = isAfter(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;
      return isSameDay(date, rangeEnd);
    }
    if (hoverDate) {
      return isSameDay(date, hoverDate);
    }
    return false;
  }

  const formatRange = () => {
    if (!dateRange.start) return "Pick a start date";
    if (!dateRange.end) return `${format(dateRange.start, "MMM d, yyyy")} - ...`;

    const start = isBefore(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;
    const end = isAfter(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;

    return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
  };

  const renderCalendar = (calendar: ReturnType<typeof useCalendar>) => {
    return (
      <table
        className="daterangepicker-calendar"
        onMouseLeave={() => setHoverDate(null)}
      >
        <thead>
          <tr>
            {calendar.headers.weekdays.map(({ key, value }) => (
              <th key={key} className="daterangepicker-weekday">
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
                const isStart = isRangeStart(value);
                const isEnd = isRangeEnd(value);

                // Only apply in-range to dates between start and end (exclusive)
                const isMiddleRange = inRange && !isStart && !isEnd;

                // Only show primary color for actually selected dates (not hover)
                const isSelectedStart = dateRange.start && isSameDay(value, dateRange.start);
                const isSelectedEnd = dateRange.end && isSameDay(value, dateRange.end);
                const isSelected = isSelectedStart || isSelectedEnd;

                const buttonClassNames = [
                  "daterangepicker-day",
                  !isCurrentMonth && "daterangepicker-day--outside",
                  isCurrentMonth && "daterangepicker-day--current-month",
                  isMiddleRange && "daterangepicker-day--in-range",
                  isSelected && "daterangepicker-day--selected",
                ]
                  .filter(Boolean)
                  .join(" ");

                // Only apply cell styles to current month dates
                const cellClassNames = isCurrentMonth && isMiddleRange
                  ? "daterangepicker-cell--in-range"
                  : "";

                return (
                  <td key={key} className={cellClassNames}>
                    {isCurrentMonth ? (
                      <button
                        type="button"
                        onClick={() => handleDateSelect(value)}
                        onMouseEnter={() => dateRange.start && !dateRange.end && setHoverDate(value)}
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
    <div className="daterangepicker daterangepicker-dual">
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

      <div className="daterangepicker-calendars">
        <div className="daterangepicker-calendar-container">
          <div className="daterangepicker-header">
            <button
              type="button"
              onClick={() => {
                const newDate = subMonths(leftCalendar.cursorDate, 1);
                leftCalendar.navigation.setDate(newDate);
                rightCalendar.navigation.setDate(addMonths(newDate, 1));
              }}
              className="daterangepicker-nav-button"
              aria-label="Previous month"
            >
              ←
            </button>
            <h2 className="daterangepicker-title">{format(leftCalendar.cursorDate, "MMMM yyyy")}</h2>
            <div className="daterangepicker-nav-button-placeholder" />
          </div>
          {renderCalendar(leftCalendar)}
        </div>

        <div className="daterangepicker-calendar-container">
          <div className="daterangepicker-header">
            <div className="daterangepicker-nav-button-placeholder" />
            <h2 className="daterangepicker-title">{format(rightCalendar.cursorDate, "MMMM yyyy")}</h2>
            <button
              type="button"
              onClick={() => {
                const newDate = addMonths(leftCalendar.cursorDate, 1);
                leftCalendar.navigation.setDate(newDate);
                rightCalendar.navigation.setDate(addMonths(newDate, 1));
              }}
              className="daterangepicker-nav-button"
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
