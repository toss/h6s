"use client";

import { useCalendar, useSelection } from "@h6s/calendar";
import { addMonths, format, isToday, subMonths } from "date-fns";
import "./DateRangeCalendarDual.css";

export function DateRangeCalendarDual() {
  const leftCalendar = useCalendar({
    defaultDate: new Date(),
  });

  const rightCalendar = useCalendar({
    defaultDate: addMonths(new Date(), 1),
  });

  const selection = useSelection({ mode: "range", body: leftCalendar.body });

  const formatRange = () => {
    if (!selection.selected) return "Pick a start date";
    if (!selection.selected.to) return `${format(selection.selected.from, "MM/dd/yyyy")} - ...`;
    return `${format(selection.selected.from, "MM/dd/yyyy")} - ${format(selection.selected.to, "MM/dd/yyyy")}`;
  };

  const renderCalendar = (calendar: ReturnType<typeof useCalendar>) => {
    return (
      <table className="daterangecalendar-calendar">
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
                const inRange = selection.isInRange(value);
                const selected = selection.isRangeStart(value) || selection.isRangeEnd(value);
                const today = isToday(value);
                const rangeStart = selection.isRangeStart(value);
                const rangeEnd = selection.isRangeEnd(value);

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
