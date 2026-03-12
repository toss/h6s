"use client";

import { useNDayView } from "./useNDayView";
import { format, isSameDay } from "date-fns";
import { useState } from "react";
import "./NDayCalendar.css";

const DAY_OPTIONS = [3, 5, 7, 14];

export function NDayCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate, view } = useNDayView({
    defaultDate: new Date(),
    numberOfDays: 3,
  });

  return (
    <div className="ndaycalendar">
      <div className="ndaycalendar-toolbar">
        <div className="ndaycalendar-toolbar-left">
          <button
            type="button"
            onClick={() => {
              navigation.setToday();
              setSelectedDate(new Date());
            }}
            className="ndaycalendar-today-button"
          >
            Today
          </button>
          <div className="ndaycalendar-nav">
            <button
              type="button"
              onClick={navigation.toPrev}
              className="ndaycalendar-nav-button"
              aria-label="Previous"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={navigation.toNext}
              className="ndaycalendar-nav-button"
              aria-label="Next"
            >
              &rarr;
            </button>
          </div>
          <h2 className="ndaycalendar-title">{format(cursorDate, "MMMM yyyy")}</h2>
        </div>
        <div className="ndaycalendar-day-options">
          {DAY_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => view.setNumberOfDays(n)}
              className={`ndaycalendar-day-option ${view.numberOfDays === n ? "ndaycalendar-day-option--active" : ""}`}
            >
              {n} days
            </button>
          ))}
        </div>
      </div>

      {body.value.map(({ key: rowKey, value: days }) => (
        <div key={rowKey}>
          <div className="ndaycalendar-day-headers">
            <div className="ndaycalendar-time-gutter-header" />
            {days.map(({ key, value, isCurrentDate, isWeekend }) => {
              const isSelected = selectedDate && isSameDay(value, selectedDate);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(value)}
                  className={[
                    "ndaycalendar-header-cell",
                    isCurrentDate && "ndaycalendar-header-cell--today",
                    isSelected && "ndaycalendar-header-cell--selected",
                    isWeekend && "ndaycalendar-header-cell--weekend",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="ndaycalendar-header-weekday">{format(value, "EEE")}</span>
                  <span className="ndaycalendar-header-date">{format(value, "d")}</span>
                </button>
              );
            })}
          </div>

          <div className="ndaycalendar-timetable">
            {days[0].hours.map(({ hour }) => (
              <div key={hour} className="ndaycalendar-time-row">
                <div className="ndaycalendar-time-gutter">
                  <span className="ndaycalendar-time-label">
                    {hour === 0 ? "" : `${hour}:00`}
                  </span>
                </div>
                {days.map(({ key, value }) => (
                  <div
                    key={`${key}-${hour}`}
                    className="ndaycalendar-time-cell"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
