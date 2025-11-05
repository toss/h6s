"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay } from "date-fns";
import { useState } from "react";
import "./DateCalendar.css";

export function DateCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: selectedDate ?? new Date(),
  });

  function handleDateSelect(date: Date, isCurrentMonth: boolean) {
    if (!isCurrentMonth) {
      navigation.setDate(date);
    }
    setSelectedDate(date);
  }

  return (
    <div className="datecalendar">
      <div className="datecalendar-selection">
        <div>
          <p className="datecalendar-selection-label">Selected date</p>
          <p className="datecalendar-selection-value">{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigation.setToday();
            setSelectedDate(new Date());
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
          {body.value.map(({ key, value: days }) => (
            <tr key={key}>
              {days.map(({ key, value, isCurrentDate, isCurrentMonth }) => {
                const isSelected = selectedDate && isSameDay(value, selectedDate);
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
