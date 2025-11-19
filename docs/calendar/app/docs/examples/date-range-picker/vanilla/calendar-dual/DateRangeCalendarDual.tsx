"use client";

import { useCalendar } from "@h6s/calendar";
import { addMonths, format, isAfter, isSameDay, isToday, subMonths } from "date-fns";
import { useState } from "react";
import "./DateRangeCalendarDual.css";

type DateRange = {
  start: Date | null;
  end: Date | null;
};

export function DateRangeCalendarDual() {
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

  function isRangeStart(date: Date): boolean {
    if (!dateRange.start) return false;
    return isSameDay(date, dateRange.start);
  }

  function isRangeEnd(date: Date): boolean {
    const end = dateRange.end || (hoverDate && dateRange.start && isAfter(hoverDate, dateRange.start) ? hoverDate : null);
    if (!end) return false;
    return isSameDay(date, end);
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

  const renderCalendar = (calendar: ReturnType<typeof useCalendar>) => {
    return (
      <table className="daterangecalendar-calendar" onMouseLeave={() => setHoverDate(null)}>
        <thead>
          <tr>
            {calendar.headers.weekdays.map(({ key, value }) => (
              <th key={key} className="daterangecalendar-weekday">
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
                const rangeStart = isRangeStart(value);
                const rangeEnd = isRangeEnd(value);

                const buttonClassNames = [
                  "daterangecalendar-day",
                  !isCurrentMonth && "daterangecalendar-day--outside",
                  isCurrentMonth && "daterangecalendar-day--current-month",
                  inRange && "daterangecalendar-day--in-range",
                  selected && "daterangecalendar-day--selected",
                  today && "daterangecalendar-day--today",
                ]
                  .filter(Boolean)
                  .join(" ");

                const cellClassNames = [
                  isCurrentMonth && (inRange || rangeStart || rangeEnd) && "daterangecalendar-cell--in-range",
                  rangeStart && "daterangecalendar-cell--range-start",
                  rangeEnd && "daterangecalendar-cell--range-end",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <td key={key} className={cellClassNames}>
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
    <div className="daterangecalendar-dual">
      <div className="daterangecalendar-selection">
        <div>
          <p className="daterangecalendar-selection-label">Selected range</p>
          <p className="daterangecalendar-selection-value">{formatRange()}</p>
        </div>
      </div>

      <div className="daterangecalendar-calendars">
        <div className="daterangecalendar-calendar-container">
          <div className="daterangecalendar-header">
            <button
              type="button"
              onClick={() => {
                const newDate = subMonths(leftCalendar.cursorDate, 1);
                leftCalendar.navigation.setDate(newDate);
                rightCalendar.navigation.setDate(addMonths(newDate, 1));
              }}
              className="daterangecalendar-nav-button"
              aria-label="Previous month"
            >
              ←
            </button>
            <h2 className="daterangecalendar-title">{format(leftCalendar.cursorDate, "MMMM yyyy")}</h2>
            <div className="daterangecalendar-nav-button-placeholder" />
          </div>
          {renderCalendar(leftCalendar)}
        </div>

        <div className="daterangecalendar-calendar-container">
          <div className="daterangecalendar-header">
            <div className="daterangecalendar-nav-button-placeholder" />
            <h2 className="daterangecalendar-title">{format(rightCalendar.cursorDate, "MMMM yyyy")}</h2>
            <button
              type="button"
              onClick={() => {
                const newDate = addMonths(leftCalendar.cursorDate, 1);
                leftCalendar.navigation.setDate(newDate);
                rightCalendar.navigation.setDate(addMonths(newDate, 1));
              }}
              className="daterangecalendar-nav-button"
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
