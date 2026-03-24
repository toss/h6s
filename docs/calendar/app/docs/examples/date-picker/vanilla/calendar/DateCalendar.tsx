"use client";

import { useCalendar, useSelection } from "@h6s/calendar";
import { format } from "date-fns";
import "./DateCalendar.css";

export function DateCalendar() {
  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: new Date(),
  });

  const selection = useSelection({ mode: "single", body });

  function handleDateSelect(date: Date, isCurrentMonth: boolean) {
    if (!isCurrentMonth) {
      navigation.setDate(date);
    }
    selection.select(date);
  }

  return (
    <div className="datecalendar">
      <div className="datecalendar-selection">
        <div>
          <p className="datecalendar-selection-value">{selection.selected ? format(selection.selected, "PPP") : "Pick a date"}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigation.setToday();
            selection.select(new Date());
          }}
          className="datecalendar-today-button"
        >
          Today
        </button>
      </div>

      <div className="datecalendar-header">
        <button
          type="button"
          onClick={navigation.toPrev}
          className="datecalendar-nav-button"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="datecalendar-title">{format(cursorDate, "MMMM yyyy")}</h2>
        <button type="button" onClick={navigation.toNext} className="datecalendar-nav-button" aria-label="Next month">
          →
        </button>
      </div>

      <table className="datecalendar-calendar">
        <thead>
          <tr>
            {headers.weekdays.map(({ key, value }) => (
              <th key={key} className="datecalendar-weekday">
                {format(value, "EEEEEE")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {selection.body.value.map(({ key, value: days }) => (
            <tr key={key}>
              {days.map(({ key, value, isCurrentDate, isCurrentMonth, isSelected }) => {
                const classNames = [
                  "datecalendar-day",
                  !isCurrentMonth && "datecalendar-day--outside",
                  isCurrentMonth && "datecalendar-day--current-month",
                  isCurrentDate && "datecalendar-day--today",
                  isSelected && "datecalendar-day--selected",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <td key={key}>
                    <button
                      type="button"
                      onClick={() => handleDateSelect(value, isCurrentMonth)}
                      className={classNames}
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
