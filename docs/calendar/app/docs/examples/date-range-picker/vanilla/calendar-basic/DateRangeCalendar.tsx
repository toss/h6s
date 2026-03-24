"use client";

import { useCalendar, useSelection } from "@h6s/calendar";
import { format, isSameDay, isToday } from "date-fns";
import { useState } from "react";
import "./DateRangeCalendar.css";

export function DateRangeCalendar() {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: new Date(),
  });

  const selection = useSelection({ mode: "range", body });

  function isInRangeWithHover(date: Date): boolean {
    if (selection.selected?.to) return selection.isInRange(date);
    if (!selection.selected?.from || !hoverDate) return false;
    const [start, end] = selection.selected.from < hoverDate
      ? [selection.selected.from, hoverDate]
      : [hoverDate, selection.selected.from];
    return date > start && date < end;
  }

  const formatRange = () => {
    if (!selection.selected) return "Pick a start date";
    if (!selection.selected.to) return `${format(selection.selected.from, "MM/dd/yyyy")} - ...`;
    return `${format(selection.selected.from, "MM/dd/yyyy")} - ${format(selection.selected.to, "MM/dd/yyyy")}`;
  };

  return (
    <div className="daterangecalendar-basic">
      <div className="daterangecalendar-selection">
        <div>
          <p className="daterangecalendar-selection-value">{formatRange()}</p>
        </div>
      </div>

      <div className="daterangecalendar-header">
        <button
          type="button"
          onClick={navigation.toPrev}
          className="daterangecalendar-nav-button"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="daterangecalendar-title">{format(cursorDate, "MMMM yyyy")}</h2>
        <button
          type="button"
          onClick={navigation.toNext}
          className="daterangecalendar-nav-button"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <table className="daterangecalendar-calendar" onMouseLeave={() => setHoverDate(null)}>
        <thead>
          <tr>
            {headers.weekdays.map(({ key, value }) => (
              <th key={key} className="daterangecalendar-weekday">
                {format(value, "EEEEEE")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {selection.body.value.map(({ key, value: days }) => (
            <tr key={key}>
              {days.map(({ key, value, isCurrentMonth }) => {
                const inRange = isInRangeWithHover(value);
                const selected = selection.isRangeStart(value) || selection.isRangeEnd(value);
                const today = isToday(value);

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

                const cellClassNames = inRange ? "daterangecalendar-cell--in-range" : "";

                return (
                  <td key={key} className={cellClassNames}>
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
