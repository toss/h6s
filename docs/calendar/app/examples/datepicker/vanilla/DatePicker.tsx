"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay } from "date-fns";
import { useState } from "react";
import "./DatePicker.css";

export function DatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: selectedDate ?? new Date(),
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="datepicker">
      <div className="datepicker-selection">
        <div>
          <p className="datepicker-selection-label">Selected date</p>
          <p className="datepicker-selection-value">
            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigation.setToday();
            setSelectedDate(new Date());
          }}
          className="datepicker-today-button"
        >
          Today
        </button>
      </div>

      <div className="datepicker-header">
        <button
          type="button"
          onClick={navigation.toPrev}
          className="datepicker-nav-button"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="datepicker-title">{format(cursorDate, "MMMM yyyy")}</h2>
        <button type="button" onClick={navigation.toNext} className="datepicker-nav-button" aria-label="Next month">
          →
        </button>
      </div>

      <table className="datepicker-calendar">
        <thead>
          <tr>
            {headers.weekdays.map(({ key, value }) => (
              <th key={key} className="datepicker-weekday">
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
                  "datepicker-day",
                  !isCurrentMonth && "datepicker-day--outside",
                  isCurrentMonth && "datepicker-day--current-month",
                  isCurrentDate && "datepicker-day--today",
                  isSelected && "datepicker-day--selected",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <td key={key}>
                    <button type="button" onClick={() => handleDateSelect(value)} className={classNames}>
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
