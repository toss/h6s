"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay } from "date-fns";
import { useState } from "react";
import "./DatePickerVanilla.css";

export function DatePickerVanilla() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: selectedDate ?? new Date(),
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsOpen(false);
  };

  return (
    <div className="datepicker-container">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="datepicker-trigger">
        {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
      </button>

      {isOpen && (
        <div className="datepicker-dropdown">
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

          <button
            type="button"
            onClick={() => {
              navigation.setToday();
              setSelectedDate(new Date());
              setIsOpen(false);
            }}
            className="datepicker-today-button"
          >
            Today
          </button>

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
      )}
    </div>
  );
}
