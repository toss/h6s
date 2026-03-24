"use client";

import { useCalendar, useSelection } from "@h6s/calendar";
import { addMonths, format, isSameDay, isToday, subMonths } from "date-fns";
import { useState } from "react";
import "./DateRangeCalendarDual.css";

export function DateRangeCalendarDual() {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const leftCalendar = useCalendar({
    defaultDate: new Date(),
  });

  const rightCalendar = useCalendar({
    defaultDate: addMonths(new Date(), 1),
  });

  const selection = useSelection({ mode: "range", body: leftCalendar.body });

  function isInRangeWithHover(date: Date): boolean {
    if (selection.selected?.to) return selection.isInRange(date) || selection.isSelected(date);
    if (!selection.selected?.from || !hoverDate) return false;
    const [start, end] = selection.selected.from < hoverDate
      ? [selection.selected.from, hoverDate]
      : [hoverDate, selection.selected.from];
    return date > start && date < end;
  }

  function isRangeStartWithHover(date: Date): boolean {
    return selection.isRangeStart(date);
  }

  function isRangeEndWithHover(date: Date): boolean {
    if (selection.selected?.to) return selection.isRangeEnd(date);
    if (!hoverDate || !selection.selected?.from) return false;
    return isSameDay(date, hoverDate) && hoverDate > selection.selected.from;
  }

  const formatRange = () => {
    if (!selection.selected) return "Pick a start date";
    if (!selection.selected.to) return `${format(selection.selected.from, "MM/dd/yyyy")} - ...`;
    return `${format(selection.selected.from, "MM/dd/yyyy")} - ${format(selection.selected.to, "MM/dd/yyyy")}`;
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
                const inRange = isInRangeWithHover(value);
                const selected = selection.isSelected(value);
                const today = isToday(value);
                const rangeStart = isRangeStartWithHover(value);
                const rangeEnd = isRangeEndWithHover(value);

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
                        onClick={() => selection.select(value)}
                        onMouseEnter={() => {
                          if (selection.selected?.from && !selection.selected?.to && !isSameDay(value, hoverDate || new Date(0))) {
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
