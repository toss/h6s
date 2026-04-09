"use client";

import { useCalendar, useSelection } from "@h6s/calendar";
import { format, isToday } from "date-fns";
import "./DateRangeCalendar.css";

export function DateRangeCalendar() {
  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: new Date(),
  });

  const selection = useSelection({ mode: "range", body });

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

      <table className="daterangecalendar-calendar">
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
              {days.map(({ key, value, isCurrentMonth, isInRange, isRangeStart, isRangeEnd }) => {
                const selected = isRangeStart || isRangeEnd;
                const today = isToday(value);

                const buttonClassNames = [
                  "daterangecalendar-day",
                  !isCurrentMonth && "daterangecalendar-day--outside",
                  isCurrentMonth && "daterangecalendar-day--current-month",
                  isInRange && "daterangecalendar-day--in-range",
                  selected && "daterangecalendar-day--selected",
                  today && "daterangecalendar-day--today",
                ]
                  .filter(Boolean)
                  .join(" ");

                const cellClassNames = isInRange ? "daterangecalendar-cell--in-range" : "";

                return (
                  <td key={key} className={cellClassNames}>
                    <button type="button" onClick={() => selection.select(value)} className={buttonClassNames}>
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
